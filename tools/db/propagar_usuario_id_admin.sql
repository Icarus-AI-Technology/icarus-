-- Idempotent fallback: ensure usuario_id column, backfill with admin id, add FK
DO $$
DECLARE
  v_admin_id uuid;
  v_admin_email text := current_setting('app.admin_email', true);
  r record;
BEGIN
  IF v_admin_email IS NULL OR v_admin_email = '' THEN
    v_admin_email := 'dax@newortho.com.br';
  END IF;

  SELECT id INTO v_admin_id FROM auth.users WHERE email = v_admin_email LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user % not found in auth.users', v_admin_email;
  END IF;

  FOR r IN (
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  ) LOOP
    -- Add column if missing (sem DO aninhado para evitar erro de sintaxe)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.table_name AND column_name = 'usuario_id'
    ) THEN
      EXECUTE format('ALTER TABLE %I.%I ADD COLUMN usuario_id uuid', 'public', r.table_name);
    END IF;

    -- Backfill com tolerância a erros de gatilhos/validações
    BEGIN
      EXECUTE format('UPDATE %I.%I SET usuario_id = %L WHERE usuario_id IS NULL', 'public', r.table_name, v_admin_id);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Backfill skipped on table %', r.table_name;
    END;

    -- FK refresh
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', 'public', r.table_name, r.table_name || '_usuario_id_fkey');
    EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL', 'public', r.table_name, r.table_name || '_usuario_id_fkey');
  END LOOP;
END $$;


