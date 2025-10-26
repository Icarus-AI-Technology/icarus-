-- Sequências sem ownership (somente leitura)
-- Lista sequências que não estão OWNED BY nenhuma coluna

WITH seq AS (
  SELECT n.nspname AS schema, c.oid AS seq_oid, c.relname AS sequence
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'S'
)
SELECT
  s.schema,
  s.sequence,
  '/* Recomenda-se vincular a uma coluna */' AS note
FROM seq s
WHERE NOT EXISTS (
  SELECT 1 FROM pg_depend d WHERE d.objid = s.seq_oid AND d.deptype = 'a'
)
ORDER BY s.schema, s.sequence;

-- Para sugerir coluna candidata (se houver nextval em default):
-- Lista possíveis pares tabela/coluna que referenciam a sequência
WITH seq AS (
  SELECT n.nspname AS schema, c.oid AS seq_oid, c.relname AS sequence
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'S'
)
SELECT
  s.schema,
  s.sequence,
  t.relname AS table_name,
  a.attname AS column_name,
  format('ALTER SEQUENCE %I.%I OWNED BY %I.%I;', s.schema, s.sequence, t.relname, a.attname) AS alter_sql
FROM seq s
JOIN pg_attrdef ad ON pg_get_expr(ad.adbin, ad.adrelid) ILIKE '%' || s.sequence || '%'
JOIN pg_class t ON t.oid = ad.adrelid
JOIN pg_attribute a ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
ORDER BY s.schema, s.sequence, t.relname;


