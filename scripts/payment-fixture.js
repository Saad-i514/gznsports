// Isolated in-memory PostgreSQL for sandbox verification. Never opens .env.backend.
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
export async function sandboxDatabase() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT null::uuid';
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $fn$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $fn$;
    GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;`);
  const schema = (
    await readFile(new URL("./setup_database.sql", import.meta.url), "utf8")
  )
    .split("-- 4. ENABLE REALTIME")[0]
    .replace(/CREATE EXTENSION[^;]+;/g, "");
  await db.exec(schema);
  await db.exec(
    await readFile(new URL("./secure-store.sql", import.meta.url), "utf8"),
  );
  const migration = await readFile(
    new URL("./stripe-payments.sql", import.meta.url),
    "utf8",
  );
  await db.exec(migration);
  await db.exec(migration);
  await db.exec(`INSERT INTO products(id,title,category,category_name,price,sizes,image,stock_quantity)
    VALUES ('tee','Core Tee','tshirts','T-shirts',25,'["M","L"]','/images/test.jpg',5);`);
  return db;
}
