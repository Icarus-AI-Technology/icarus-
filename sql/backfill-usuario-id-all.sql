-- Backfill de usuario_id para todas as tabelas do schema public que possuem a coluna
-- Substitua <UUID_ADMIN> pelo ID do usuário admin

DO $$
DECLARE r record; admin_id uuid := '<UUID_ADMIN>';
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema='public' AND column_name='usuario_id'
  LOOP
    EXECUTE format('update %I.%I set usuario_id = $1 where usuario_id is null', r.table_schema, r.table_name)
    USING admin_id;
  END LOOP;
END $$;


