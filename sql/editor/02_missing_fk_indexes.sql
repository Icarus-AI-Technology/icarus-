-- Recomendações de índices faltantes para FKs (somente leitura)
-- Gera comandos CREATE INDEX recomendados; NÃO executa

WITH fks AS (
  SELECT
    conrelid,
    conname,
    unnest(conkey) AS col_attnum
  FROM pg_constraint
  WHERE contype = 'f'
),
cols AS (
  SELECT
    n.nspname AS schema,
    c.oid     AS table_oid,
    c.relname AS table_name,
    a.attnum  AS attnum,
    a.attname AS column_name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
  WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog','information_schema')
),
fk_cols AS (
  SELECT
    cols.schema,
    cols.table_name,
    cols.column_name
  FROM fks
  JOIN cols ON cols.table_oid = fks.conrelid AND cols.attnum = fks.col_attnum
),
fk_cols_missing_idx AS (
  SELECT
    f.schema,
    f.table_name,
    f.column_name
  FROM fk_cols f
  LEFT JOIN LATERAL (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute ia ON ia.attrelid = i.indrelid AND ia.attnum = ANY(i.indkey)
    WHERE n.nspname = f.schema
      AND t.relname = f.table_name
      AND ia.attname = f.column_name
      AND i.indisvalid
    LIMIT 1
  ) idx ON TRUE
  WHERE idx IS NULL
)
SELECT
  schema,
  table_name,
  column_name,
  format(
    'CREATE INDEX IF NOT EXISTS %I ON %I.%I (%I);',
    'idx_' || table_name || '_' || column_name || '_fk',
    schema,
    table_name,
    column_name
  ) AS create_index_sql
FROM fk_cols_missing_idx
ORDER BY schema, table_name, column_name;

-- Observação: avalie índices compostos para FKs multi-coluna conforme necessário.


