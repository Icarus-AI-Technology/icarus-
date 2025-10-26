#!/usr/bin/env node
import pg from 'pg';

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const adminEmail = process.env.ADMIN_EMAIL || 'dax@newortho.com.br';

if (!databaseUrl) {
  console.error('[admin:bootstrap] Missing DATABASE_URL or SUPABASE_DB_URL');
  process.exit(1);
}

function log(msg) {
  console.log(`[admin:bootstrap] ${msg}`);
}

const ensureSql = `
DO $$
DECLARE
  v_user_id uuid;
  r record;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = '${adminEmail}' LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user % not found in auth.users', '${adminEmail}';
  END IF;

  -- Loop over public tables and ensure usuario_id column
  FOR r IN (
    SELECT c.oid, n.nspname, c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  ) LOOP
    -- Add column if missing
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.relname AND column_name = 'usuario_id'
    ) THEN
      EXECUTE format('ALTER TABLE %I.%I ADD COLUMN usuario_id uuid', 'public', r.relname);
    END IF;

    -- Backfill only when NULL (use admin uuid)
    BEGIN
      EXECUTE format('UPDATE %I.%I SET usuario_id = %L::uuid WHERE usuario_id IS NULL', 'public', r.relname, v_user_id);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Backfill skipped on table % due to trigger/validation', r.relname;
    END;
  END LOOP;
END $$;
`;

// The backfill above sets usuario_id to email for temporary placeholder; fix to actual uuid below with a single pass
// not used (kept for clarity)
const fixToUuid = `SELECT 1;`;

// FK creation script (idempotent per table)
const fkSql = `
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN (
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  ) LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', 'public', r.table_name, r.table_name || '_usuario_id_fkey');
      EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL', 'public', r.table_name, r.table_name || '_usuario_id_fkey');
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Constraint set skipped on %.%', 'public', r.table_name;
    END;
  END LOOP;
END $$;
`;

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    log('Ensuring admin user present and columns exist...');
    await client.query('BEGIN');
    await client.query(ensureSql);
    await client.query('COMMIT');

    // Confirm admin exists for logging
    const { rows } = await client.query('SELECT id FROM auth.users WHERE email = $1 LIMIT 1', [adminEmail]);
    if (!rows.length) throw new Error(`Admin not found after ensure: ${adminEmail}`);

    log('Creating/refreshing FKs to auth.users(id)...');
    await client.query(fkSql);
    log('Bootstrap done.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[admin:bootstrap] Error:', e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();


