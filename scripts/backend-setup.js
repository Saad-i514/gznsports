import { readFileSync, existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.backend")) loadEnvFile(".env.backend");
const command = process.argv[2] || "check";
const required =
  command === "owner"
    ? ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    : ["SUPABASE_DB_URL"];
for (const key of required)
  if (!process.env[key]) {
    console.error(
      `Missing ${key}. Copy .env.backend.example to .env.backend and configure it locally.`,
    );
    process.exit(1);
  }
try {
  if (command === "owner") {
    const email = process.env.GNZ_ADMIN_EMAIL || "gulraizbutt297@gmail.com";
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let user;
    for (let page = 1; ; page++) {
      const { data, error } = await client.auth.admin.listUsers({
        page,
        perPage: 100,
      });
      if (error) throw error;
      user = data.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase(),
      );
      if (user || data.users.length < 100) break;
    }
    if (!user) {
      const password = process.env.GNZ_ADMIN_PASSWORD;
      if (!password || password.length < 12)
        throw Error(
          "Set GNZ_ADMIN_PASSWORD to at least 12 characters for initial account creation.",
        );
      const { error } = await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: "admin" },
      });
      if (error) throw error;
      console.log(
        `Admin created: ${email}. Use the password you configured locally. Remove it from .env.backend after setup.`,
      );
    } else {
      if (!user.email_confirmed_at)
        throw Error(
          "Confirm the existing owner email before granting admin access.",
        );
      const { error } = await client.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: "admin" },
      });
      if (error) throw error;
      console.log(
        `Admin authorized: ${email}. Existing password unchanged. Use Forgot password if needed.`,
      );
    }
  } else {
    const db = new Client({
      connectionString: process.env.SUPABASE_DB_URL,
      connectionTimeoutMillis: 15000,
      ssl: {
        rejectUnauthorized: true,
        ...(process.env.SUPABASE_CA_FILE
          ? { ca: readFileSync(process.env.SUPABASE_CA_FILE, "utf8") }
          : {}),
      },
    });
    await db.connect();
    try {
      if (command === "migrate") {
        for (const file of [
          "setup_database.sql",
          "secure-store.sql",
          "media-storage.sql",
        ])
          await db.query(readFileSync(new URL(file, import.meta.url), "utf8"));
        console.log(
          "Schema, policies, order functions and media storage applied. Existing products retained.",
        );
      } else if (command !== "check")
        throw Error("Use check, migrate or owner.");
      const { rows } =
        await db.query(`SELECT to_regclass('public.products') IS NOT NULL AS products,
        to_regprocedure('public.submit_order_request(jsonb)') IS NOT NULL AS checkout,
        to_regprocedure('public.transition_order(uuid,text)') IS NOT NULL AS fulfillment,
        NOT has_table_privilege('anon','public.orders','SELECT') AS private_orders`);
      console.log(rows[0]);
      if (Object.values(rows[0]).some((v) => v !== true)) process.exitCode = 1;
    } finally {
      await db.end();
    }
  }
} catch (error) {
  // Avoid logging connection objects or URLs containing database credentials.
  console.error(
    "Backend setup failed:",
    String(error.message).replace(
      /postgres(?:ql)?:\/\/\S+/g,
      "[redacted database URL]",
    ),
  );
  process.exitCode = 1;
}
