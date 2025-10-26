-- Auditoria de descoberta (somente leitura)
-- Não aplica RLS nem mudanças; lista objetos e políticas existentes
-- Execute no Supabase SQL Editor

-- 1) Tabelas por schema
SELECT table_schema, COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
GROUP BY table_schema
ORDER BY table_schema;

-- 2) Triggers
SELECT trigger_schema, event_object_table AS table_name, trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
ORDER BY trigger_schema, event_object_table, trigger_name;

-- 3) Funções públicas (security definer? )
SELECT n.nspname AS schema,
       p.proname AS function_name,
       p.prosecdef AS security_definer,
       pg_get_functiondef(p.oid) LIKE '%STABLE%' AS is_stable
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY 1, 2;

-- 4) Row Level Security (somente diagnóstico)
SELECT schemaname, tablename, rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog','information_schema')
ORDER BY schemaname, tablename;

-- 5) Políticas (diagnóstico)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
ORDER BY schemaname, tablename, policyname;

-- 6) Índices por tabela
SELECT
  n.nspname  AS schema,
  c.relname  AS table_name,
  COUNT(i.*) AS total_indexes
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_index i ON i.indrelid = c.oid
WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog','information_schema')
GROUP BY 1,2
ORDER BY 1,2;


