import { loadEnvFile } from 'node:process';
loadEnvFile('.env.backend');
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const connectionString = process.env.SUPABASE_DB_URL;

async function runMigration() {
  console.log('Connecting to Supabase PostgreSQL Database...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: true }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    const sqlPath = path.resolve('scripts/setup_database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing database schema & seeds...');
    await client.query(sql);
    console.log('✓ Migration executed successfully!');

    // Verify products count
    const resProducts = await client.query('SELECT count(*) FROM public.products;');
    console.log('✓ Products table verified. Total products:', resProducts.rows[0].count);

    // Verify site_settings count
    const resSettings = await client.query('SELECT count(*) FROM public.site_settings;');
    console.log('✓ Site settings verified. Total keys:', resSettings.rows[0].count);

    // Verify pg_graphql extension
    const resGql = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_graphql';");
    console.log('✓ pg_graphql extension status:', resGql.rows[0] || 'Not found');

    await client.end();
    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
