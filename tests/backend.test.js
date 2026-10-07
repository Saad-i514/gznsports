import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("database permissions, authoritative checkout, retries and inventory lifecycle", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT null::uuid';
      CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $fn$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $fn$;
      GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;`);
    const schema = (
      await readFile(
        new URL("../scripts/setup_database.sql", import.meta.url),
        "utf8",
      )
    )
      .split("-- 4. ENABLE REALTIME")[0]
      .replace(/CREATE EXTENSION[^;]+;/g, "");
    await db.exec(schema);
    const security = await readFile(
      new URL("../scripts/secure-store.sql", import.meta.url),
      "utf8",
    );
    await db.exec(security);
    await db.exec(security); // Safe to rerun.
    await db.exec(
      `INSERT INTO products(id,title,category,category_name,price,sizes,image,stock_quantity) VALUES ('tee','Core Tee','tshirts','T-shirts',25,'["M","L"]','/images/test.jpg',3); SET ROLE anon;`,
    );
    assert.equal((await db.query("SELECT * FROM products")).rows.length, 1);
    await assert.rejects(db.query("SELECT * FROM orders"), /permission denied/);
    await assert.rejects(
      db.query("UPDATE products SET price=1"),
      /permission denied/,
    );
    const payload = {
      request_key: crypto.randomUUID(),
      customer_name: "Test Buyer",
      customer_email: "buyer@example.com",
      shipping_address: { address: "Test address" },
      items: [{ id: "tee", size: "M", quantity: 2, price: 1 }],
      total: 50,
    };
    const submit = async (p) =>
      (
        await db.query("SELECT submit_order_request($1::jsonb) AS result", [
          JSON.stringify(p),
        ])
      ).rows[0].result;
    await assert.rejects(submit({ ...payload, total: 2 }), /Prices changed/);
    await assert.rejects(
      submit({ ...payload, items: [{ id: "tee", quantity: 1 }], total: 25 }),
      /available size/,
    );
    await assert.rejects(
      submit({ ...payload, total: "NaN" }),
      /Prices changed/,
    );
    const order = await submit(payload);
    assert.deepEqual(await submit(payload), order);
    await assert.rejects(
      submit({ ...payload, customer_name: "Changed" }),
      /Request changed/,
    );
    await db.exec("RESET ROLE");
    const row = (await db.query("SELECT * FROM orders")).rows[0];
    assert.equal(Number(row.total), 50);
    assert.equal(row.items[0].price, 25);
    assert.equal(row.payment_status, "UNPAID");
    await db.exec("SET ROLE authenticated");
    assert.equal((await db.query("SELECT * FROM orders")).rows.length, 0);
    const transition = (status) =>
      db.query("SELECT transition_order($1,$2)", [order.id, status]);
    await assert.rejects(transition("PROCESSING"), /Administrator/);
    await db.query("SELECT set_config('request.jwt.claims',$1,false)", [
      JSON.stringify({ app_metadata: { role: "admin" } }),
    ]);
    assert.equal((await db.query("SELECT * FROM orders")).rows.length, 1);
    await assert.rejects(
      db.query("UPDATE products SET price=-1"),
      /Invalid product/,
    );
    await assert.rejects(
      db.query("UPDATE products SET sizes='[]'"),
      /valid product sizes/,
    );
    await db.query(
      "INSERT INTO site_settings(key,value) VALUES ('page_content','{\"story_title\":\"Updated\"}')",
    );
    await assert.rejects(
      db.query("UPDATE orders SET total=0"),
      /permission denied/,
    );
    await assert.rejects(transition("DELIVERED"), /Invalid fulfillment/);
    await transition("PROCESSING");
    await transition("PROCESSING");
    assert.equal(
      (await db.query("SELECT stock_quantity FROM products")).rows[0]
        .stock_quantity,
      1,
    );
    await transition("CANCELLED");
    await transition("CANCELLED");
    assert.equal(
      (await db.query("SELECT stock_quantity FROM products")).rows[0]
        .stock_quantity,
      3,
    );
    await assert.rejects(transition("PROCESSING"), /Invalid fulfillment/);
    // Two pending requests may coexist, but only available stock can be confirmed.
    const a = await submit({ ...payload, request_key: crypto.randomUUID() });
    const b = await submit({ ...payload, request_key: crypto.randomUUID() });
    await db.query("SELECT transition_order($1,$2)", [a.id, "PROCESSING"]);
    await assert.rejects(
      db.query("SELECT transition_order($1,$2)", [b.id, "PROCESSING"]),
      /Insufficient inventory/,
    );
    assert.equal(
      (await db.query("SELECT status FROM orders WHERE id=$1", [b.id])).rows[0]
        .status,
      "PENDING",
    );
    await db.exec(
      "SET ROLE anon; SELECT set_config('request.jwt.claims','{}',false)",
    );
    assert.equal(
      (
        await db.query(
          "SELECT value FROM site_settings WHERE key='page_content'",
        )
      ).rows[0].value.story_title,
      "Updated",
    );
    await assert.rejects(
      db.query("UPDATE site_settings SET value='{}'"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("SELECT transition_order($1,$2)", [a.id, "CANCELLED"]),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
