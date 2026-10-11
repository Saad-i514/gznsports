import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sandboxDatabase} from '../scripts/payment-fixture.js';
import {productImages,withProductGallery} from '../src/lib/product-gallery.js';
import {safeTrackingUrl} from '../src/lib/commerce-config.js';

test('gallery preserves specs, deduplicates photos and rejects unsafe URLs',()=>{
 const specs=withProductGallery([{label:'Fit',value:'Regular'}],'/images/a.jpg\nhttps://example.com/b.jpg\n/images/a.jpg');
 assert.equal(specs[0].label,'Fit');
 assert.equal(productImages({image:'/images/a.jpg',specs}).length,2);
 assert.throws(()=>withProductGallery([],'javascript:alert(1)'));
 assert.equal(safeTrackingUrl('javascript:alert(1)'),null);
 assert.equal(safeTrackingUrl('https://user:pass@example.com'),null);
});
test('customer order access is private and shipment updates require admin',async()=>{
 const db=await sandboxDatabase();
 try {
 const sql=await readFile(new URL('../scripts/commerce-essentials.sql',import.meta.url),'utf8');
 await db.exec(sql);await db.exec(sql);
 await db.exec(`CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $fn$ SELECT nullif(current_setting('request.user_id',true),'')::uuid $fn$;`);
 const payload={request_key:crypto.randomUUID(),customer_name:'Test buyer',customer_email:'buyer@example.com',shipping_address:{address:'Test address'},items:[{id:'tee',size:'M',quantity:1}],total:25};
 await db.exec('SET ROLE anon');
 const {rows}=await db.query('SELECT submit_store_order($1) AS result',[payload]);const order=rows[0].result;
 assert.ok(order.access_token);assert.equal(order.total,25);
 assert.equal((await db.query('SELECT submit_store_order($1) AS result',[payload])).rows[0].result.access_token,order.access_token);
 await assert.rejects(db.query('SELECT track_store_order($1,$2)',[order.id,crypto.randomUUID()]),/Order not found/);
 const tracked=(await db.query('SELECT track_store_order($1,$2) AS result',[order.id,order.access_token])).rows[0].result;
 assert.equal(tracked.id,order.id);assert.equal(tracked.customer_email,undefined);assert.equal(tracked.access_token,undefined);
 await assert.rejects(db.query('SELECT * FROM orders'),/permission denied/);
 await db.exec('RESET ROLE');
 const owner=crypto.randomUUID();
 await db.query('UPDATE orders SET user_id=$1 WHERE id=$2',[owner,order.id]);
 await db.query("SELECT set_config('request.user_id',$1,false)",[owner]);
 await db.exec('SET ROLE authenticated');
 assert.equal((await db.query('SELECT my_store_orders() AS result')).rows[0].result.length,1);
 await db.query("SELECT set_config('request.user_id',$1,false)",[crypto.randomUUID()]);
 assert.equal((await db.query('SELECT my_store_orders() AS result')).rows[0].result.length,0);
 await assert.rejects(db.query('SELECT update_order_shipment($1,$2)',[order.id,{carrier:'Test'}]),/Administrator/);
 await db.query("SELECT set_config('request.jwt.claims',$1,false)",[JSON.stringify({app_metadata:{role:'admin'}})]);
 await db.query('SELECT transition_order($1,$2)',[order.id,'PROCESSING']);
 await db.query('SELECT update_order_shipment($1,$2)',[order.id,{carrier:'Test',number:'123',url:'https://example.com/123'}]);
 assert.equal((await db.query('SELECT track_store_order($1,$2) AS result',[order.id,order.access_token])).rows[0].result.shipment.number,'123');
 }finally{await db.close();}
});
