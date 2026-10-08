import { loadEnvFile } from 'node:process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import pg from 'pg';

loadEnvFile('.env.backend');
const db = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  connectionTimeoutMillis: 15000,
  ssl: { rejectUnauthorized: true, ca: readFileSync(process.env.SUPABASE_CA_FILE, 'utf8') },
});
const checks = [];
const pass = name => { checks.push(name); console.log('PASS:', name); };
async function rejected(sql, values, pattern) {
  await db.query('SAVEPOINT expected_failure');
  let error;
  try { await db.query(sql, values); } catch (e) { error = e; }
  await db.query('ROLLBACK TO SAVEPOINT expected_failure');
  await db.query('RELEASE SAVEPOINT expected_failure');
  assert.ok(error, 'Request should have been rejected');
  assert.match(error.message, pattern);
}
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SET LOCAL statement_timeout = '15s'");
  const id = `audit-${crypto.randomUUID()}`;
  const key = `audit-${crypto.randomUUID()}`;
  const claims = role => JSON.stringify({ role:'authenticated', app_metadata:{ role } });
  await db.query("SELECT set_config('request.jwt.claims',$1,true)", [claims('admin')]);
  await db.query('SET LOCAL ROLE authenticated');
  await db.query(`INSERT INTO products(id,title,category,category_name,price,sizes,image,stock_quantity)
    VALUES($1,'Transactional audit tee','tshirts','T-shirts',25,'["M","L"]','/images/photos/tshirts.jpg',3)`,[id]);
  await db.query('INSERT INTO site_settings(key,value) VALUES($1,$2)', [key, {audit:true}]);
  await db.query('UPDATE products SET description=$2 WHERE id=$1',[id,'Rollback-only verification']);
  pass('Admin product creation/editing and settings writes');
  await rejected('UPDATE products SET price=-1 WHERE id=$1',[id],/Invalid product/);
  await rejected("UPDATE products SET sizes='[]' WHERE id=$1",[id],/valid product sizes/);
  pass('Database rejects negative prices and empty sizes');

  await db.query('SET LOCAL ROLE anon');
  await db.query("SELECT set_config('request.jwt.claims','{}',true)");
  assert.equal((await db.query('SELECT id FROM products WHERE id=$1',[id])).rowCount,1);
  assert.equal((await db.query('SELECT key FROM site_settings WHERE key=$1',[key])).rowCount,1);
  await rejected('SELECT * FROM orders LIMIT 1',[],/permission denied/);
  await rejected('UPDATE products SET price=0 WHERE id=$1',[id],/permission denied/);
  await rejected('DELETE FROM site_settings WHERE key=$1',[key],/permission denied/);
  pass('Public catalog reads work; public order reads and catalog/settings writes are denied');

  const payload={request_key:crypto.randomUUID(),customer_name:'Rollback audit',customer_email:`${id}@example.invalid`,shipping_address:{address:'Test only; transaction rolled back'},items:[{id,size:'M',quantity:2}],total:50};
  const submit=async value=>(await db.query('SELECT submit_order_request($1::jsonb) AS result',[JSON.stringify(value)])).rows[0].result;
  await rejected('SELECT submit_order_request($1::jsonb)',[JSON.stringify({...payload,total:1})],/Prices changed/);
  const order=await submit(payload);
  assert.equal((await submit(payload)).id,order.id);
  pass('Guest checkout, authoritative pricing and duplicate retry protection');

  await db.query('SET LOCAL ROLE authenticated');
  await db.query("SELECT set_config('request.jwt.claims',$1,true)",[claims('customer')]);
  assert.equal((await db.query('SELECT id FROM orders WHERE id=$1',[order.id])).rowCount,0);
  await rejected('SELECT transition_order($1,$2)',[order.id,'PROCESSING'],/Administrator/);
  pass('Non-admin users cannot read or fulfill orders');

  await db.query("SELECT set_config('request.jwt.claims',$1,true)",[claims('admin')]);
  const transition=status=>db.query('SELECT transition_order($1,$2)',[order.id,status]);
  assert.equal((await db.query('SELECT id FROM orders WHERE id=$1',[order.id])).rowCount,1);
  await transition('PROCESSING'); await transition('PROCESSING');
  assert.equal((await db.query('SELECT stock_quantity FROM products WHERE id=$1',[id])).rows[0].stock_quantity,1);
  await transition('CANCELLED'); await transition('CANCELLED');
  assert.equal((await db.query('SELECT stock_quantity FROM products WHERE id=$1',[id])).rows[0].stock_quantity,3);
  await rejected('SELECT transition_order($1,$2)',[order.id,'DELIVERED'],/Invalid fulfillment/);
  pass('Confirmation deducts stock once, cancellation restores once, invalid transitions fail');
  await db.query('RESET ROLE');
  const publication=(await db.query("SELECT tablename FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public'")).rows.map(r=>r.tablename);
  for(const table of ['products','orders','site_settings']) assert.ok(publication.includes(table));
  pass('All three tables are published for realtime');
  await db.query('ROLLBACK');
  assert.equal((await db.query('SELECT id FROM products WHERE id=$1',[id])).rowCount,0);
  assert.equal((await db.query('SELECT id FROM orders WHERE id=$1',[order.id])).rowCount,0);
  pass('All test products, settings and orders rolled back');
  const quality = await db.query(`SELECT count(*) AS total_products,
    count(*) FILTER(WHERE category NOT IN ('hoodies','tracksuits','tshirts','fashion','bags','others')) AS retired_category_records,
    count(*) FILTER(WHERE stock_quantity IS NULL OR stock_quantity<0 OR price IS NULL OR price<0) AS invalid_price_or_stock
    FROM products`);
  console.log('Existing catalog summary:',quality.rows[0]);
  console.log('Checks passed:', checks.length);
} catch(error) {
  await db.query('ROLLBACK').catch(()=>{});
  console.error('Audit failed:',error.message);process.exitCode=1;
} finally { await db.end(); }
