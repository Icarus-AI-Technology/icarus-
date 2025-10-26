-- Candidatos a NOT NULL (seguro: somente diagnóstico por padrão)
-- Este bloco avalia colunas NULLABLE que não possuem valores nulos e sugere ALTERs.

DO $$
DECLARE
  apply_changes boolean := false; -- mantenha false para gerar apenas recomendações
  r record;
  sql_cmd text;
  null_count bigint;
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND is_nullable = 'YES'
    ORDER BY table_schema, table_name, column_name
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I.%I WHERE %I IS NULL', r.table_schema, r.table_name, r.column_name) INTO null_count;
    IF null_count = 0 THEN
      sql_cmd := format('ALTER TABLE %I.%I ALTER COLUMN %I SET NOT NULL;', r.table_schema, r.table_name, r.column_name);
      IF apply_changes THEN
        EXECUTE sql_cmd;
        RAISE NOTICE '[APLICADO] %', sql_cmd;
      ELSE
        RAISE NOTICE '[RECOMENDADO] %', sql_cmd;
      END IF;
    END IF;
  END LOOP;
END $$;


