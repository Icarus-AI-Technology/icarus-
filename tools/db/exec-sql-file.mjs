#!/usr/bin/env node
import fs from 'fs';
import pg from 'pg';

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const sqlFile = process.argv[2];

if (!databaseUrl) {
  console.error('[exec-sql-file] Missing DATABASE_URL or SUPABASE_DB_URL');
  process.exit(1);
}
if (!sqlFile || !fs.existsSync(sqlFile)) {
  console.error(`[exec-sql-file] SQL file not found: ${sqlFile}`);
  process.exit(1);
}

async function run() {
  const sql = fs.readFileSync(sqlFile, 'utf8');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    if (process.env.ADMIN_EMAIL) {
      await client.query("SELECT set_config('app.admin_email', $1, true)", [process.env.ADMIN_EMAIL]);
    }
    await client.query(sql);
    console.log('[exec-sql-file] Executed successfully:', sqlFile);
  } catch (e) {
    console.error('[exec-sql-file] Error:', e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();


