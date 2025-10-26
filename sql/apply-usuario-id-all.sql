-- Aplica usuario_id + FK (auth.users) em todas as tabelas do schema public
-- Requer que a função helper public._ensure_usuario_id já exista

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema = 'public'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'sql_%'
      AND table_name NOT IN ('migrations','schema_migrations','supabase_migrations')
  LOOP
    PERFORM public._ensure_usuario_id(r.table_schema, r.table_name);
  END LOOP;
END
$$;


