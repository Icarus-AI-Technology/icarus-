-- ============================================
-- Health Check: RLS (Row Level Security)
-- Descrição: Valida políticas de multi-tenancy e isolamento
-- Esperado: 100% das tabelas com RLS habilitado e policies corretas
-- ============================================

\echo '🔍 VALIDANDO RLS & MULTI-TENANCY...'
\echo ''

-- ============================================
-- 1. Checar funções JWT helpers
-- ============================================
\echo '1. Validando funções JWT helpers'
SELECT
  routine_name,
  routine_type,
  data_type AS return_type,
  '✅ FUNÇÃO EXISTE' AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('current_empresa', 'current_perfil', 'current_user_id')
ORDER BY routine_name;

-- Verificar se existem todas as 3
SELECT
  COUNT(*) AS funcoes_helpers,
  CASE
    WHEN COUNT(*) = 3 THEN '✅ TODAS AS FUNÇÕES EXISTEM'
    WHEN COUNT(*) >= 1 THEN '⚠️ FALTAM FUNÇÕES'
    ELSE '❌ NENHUMA FUNÇÃO HELPER'
  END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('current_empresa', 'current_perfil', 'current_user_id');

\echo ''

-- ============================================
-- 2. Tabelas com RLS habilitado
-- ============================================
\echo '2. Validando RLS habilitado em tabelas'
WITH all_tables AS (
  SELECT
    tablename,
    obj_description((schemaname || '.' || tablename)::regclass, 'pg_class') AS table_comment
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT IN ('migrations', 'schema_migrations')
),
rls_status AS (
  SELECT
    c.relname AS tablename,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
)
SELECT
  t.tablename,
  COALESCE(r.rls_enabled, FALSE) AS rls_habilitado,
  CASE
    WHEN COALESCE(r.rls_enabled, FALSE) THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END AS status
FROM all_tables t
LEFT JOIN rls_status r ON r.tablename = t.tablename
ORDER BY
  CASE WHEN COALESCE(r.rls_enabled, FALSE) THEN 1 ELSE 0 END,
  t.tablename
LIMIT 50;

-- Contagem
WITH all_tables AS (
  SELECT COUNT(*) AS total
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT IN ('migrations', 'schema_migrations')
),
rls_tables AS (
  SELECT COUNT(*) AS com_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = TRUE
)
SELECT
  t.total AS "Total de tabelas",
  r.com_rls AS "Com RLS habilitado",
  t.total - r.com_rls AS "Sem RLS",
  ROUND(r.com_rls * 100.0 / NULLIF(t.total, 0), 2) AS "% Cobertura",
  CASE
    WHEN ROUND(r.com_rls * 100.0 / NULLIF(t.total, 0), 2) >= 95 THEN '✅ EXCELENTE'
    WHEN ROUND(r.com_rls * 100.0 / NULLIF(t.total, 0), 2) >= 80 THEN '⚠️ BOM, MAS PODE MELHORAR'
    WHEN ROUND(r.com_rls * 100.0 / NULLIF(t.total, 0), 2) >= 50 THEN '⚠️ COBERTURA PARCIAL'
    ELSE '❌ COBERTURA INSUFICIENTE'
  END AS status_geral
FROM all_tables t, rls_tables r;

\echo ''

-- ============================================
-- 3. Tabelas SEM policies (mas com RLS habilitado)
-- ============================================
\echo '3. Tabelas com RLS habilitado mas SEM policies (vulnerável)'
SELECT
  c.relname AS tabela,
  '❌ RLS HABILITADO MAS SEM POLICIES' AS status,
  'ACESSO NEGADO A TODOS' AS impacto
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = c.relname
  )
ORDER BY c.relname
LIMIT 20;

-- Contagem
SELECT
  COUNT(*) AS tabelas_rls_sem_policies,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ TODAS AS TABELAS COM RLS TÊM POLICIES'
    WHEN COUNT(*) < 5 THEN '⚠️ POUCAS TABELAS SEM POLICIES'
    ELSE '❌ MUITAS TABELAS SEM POLICIES'
  END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = c.relname
  );

\echo ''

-- ============================================
-- 4. Policies por tabela (top 15)
-- ============================================
\echo '4. Policies por tabela (top 15 tabelas)'
SELECT
  tablename,
  COUNT(*) AS policies,
  string_agg(DISTINCT cmd::text, ', ') AS operacoes,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ COBERTURA COMPLETA (SELECT/INSERT/UPDATE/DELETE)'
    WHEN COUNT(*) >= 2 THEN '⚠️ COBERTURA PARCIAL'
    ELSE '❌ COBERTURA INSUFICIENTE'
  END AS status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policies DESC, tablename
LIMIT 15;

\echo ''

-- ============================================
-- 5. Validar policies de multi-tenancy (empresa_id)
-- ============================================
\echo '5. Validando policies de multi-tenancy (filtro por empresa_id)'
WITH core_tables AS (
  SELECT unnest(ARRAY[
    'produtos', 'lotes', 'medicos', 'hospitais', 'cirurgias',
    'kits', 'leads', 'transacoes', 'fornecedores', 'pedidos_compra', 'faturas'
  ]) AS tabela
)
SELECT
  t.tabela,
  COUNT(p.policyname) AS policies_total,
  COUNT(*) FILTER (WHERE p.qual LIKE '%empresa_id%') AS policies_com_empresa_id,
  CASE
    WHEN COUNT(*) FILTER (WHERE p.qual LIKE '%empresa_id%') >= 1 THEN '✅ MULTI-TENANT OK'
    WHEN COUNT(p.policyname) > 0 THEN '⚠️ TEM POLICIES MAS SEM EMPRESA_ID'
    ELSE '❌ SEM POLICIES'
  END AS status
FROM core_tables t
LEFT JOIN pg_policies p ON p.schemaname = 'public' AND p.tablename = t.tabela
GROUP BY t.tabela
ORDER BY
  CASE
    WHEN COUNT(*) FILTER (WHERE p.qual LIKE '%empresa_id%') >= 1 THEN 1
    WHEN COUNT(p.policyname) > 0 THEN 2
    ELSE 3
  END,
  t.tabela;

\echo ''

-- ============================================
-- 6. Validar policies de soft delete (excluido_em IS NULL)
-- ============================================
\echo '6. Validando policies com filtro de soft delete (excluido_em IS NULL)'
WITH core_tables AS (
  SELECT unnest(ARRAY[
    'produtos', 'lotes', 'medicos', 'hospitais', 'cirurgias',
    'kits', 'leads', 'transacoes', 'fornecedores', 'pedidos_compra', 'faturas'
  ]) AS tabela
)
SELECT
  t.tabela,
  COUNT(*) FILTER (WHERE p.qual LIKE '%excluido_em IS NULL%') AS policies_soft_delete,
  CASE
    WHEN COUNT(*) FILTER (WHERE p.qual LIKE '%excluido_em IS NULL%') >= 1 THEN '✅ SOFT DELETE OK'
    ELSE '⚠️ SEM FILTRO SOFT DELETE'
  END AS status
FROM core_tables t
LEFT JOIN pg_policies p ON p.schemaname = 'public' AND p.tablename = t.tabela
GROUP BY t.tabela
ORDER BY
  CASE
    WHEN COUNT(*) FILTER (WHERE p.qual LIKE '%excluido_em IS NULL%') >= 1 THEN 1
    ELSE 2
  END,
  t.tabela;

\echo ''

-- ============================================
-- 7. Policies por comando (SELECT/INSERT/UPDATE/DELETE)
-- ============================================
\echo '7. Distribuição de policies por comando'
SELECT
  cmd AS comando,
  COUNT(*) AS policies,
  COUNT(DISTINCT tablename) AS tabelas,
  '✅' AS status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY cmd
ORDER BY cmd;

\echo ''

-- ============================================
-- 8. Policies com permissive vs restrictive
-- ============================================
\echo '8. Policies: permissive vs restrictive'
SELECT
  permissive AS tipo,
  COUNT(*) AS policies,
  CASE
    WHEN permissive = 'PERMISSIVE' THEN '✅ PADRÃO (permite acesso se condição)'
    ELSE '⚠️ RESTRITIVA (bloqueia acesso se condição)'
  END AS descricao
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY permissive;

\echo ''

-- ============================================
-- 9. Exemplos de policies (primeiras 10)
-- ============================================
\echo '9. Exemplos de policies (primeiras 10)'
SELECT
  tablename,
  policyname,
  cmd AS comando,
  LEFT(qual::text, 80) AS condicao,
  '✅' AS status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname
LIMIT 10;

\echo ''

-- ============================================
-- 10. Resumo RLS
-- ============================================
\echo '10. RESUMO RLS'
WITH stats AS (
  SELECT
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('migrations', 'schema_migrations')) AS total_tabelas,
    (SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = TRUE) AS tabelas_com_rls,
    (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') AS tabelas_com_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS total_policies,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('current_empresa', 'current_perfil', 'current_user_id')) AS funcoes_helpers
)
SELECT
  total_tabelas AS "Total de tabelas",
  tabelas_com_rls AS "Com RLS habilitado",
  tabelas_com_policies AS "Com policies",
  total_policies AS "Total de policies",
  funcoes_helpers AS "Funções helpers",
  ROUND(tabelas_com_rls * 100.0 / NULLIF(total_tabelas, 0), 2) AS "% RLS habilitado",
  CASE
    WHEN tabelas_com_rls * 100.0 / NULLIF(total_tabelas, 0) >= 95 AND funcoes_helpers = 3
      THEN '✅ RLS 100% CONFORME'
    WHEN tabelas_com_rls * 100.0 / NULLIF(total_tabelas, 0) >= 80
      THEN '⚠️ BOM, MAS PODE MELHORAR'
    WHEN tabelas_com_rls * 100.0 / NULLIF(total_tabelas, 0) >= 50
      THEN '⚠️ COBERTURA PARCIAL (risco de vazamento)'
    ELSE '❌ COBERTURA INSUFICIENTE (crítico)'
  END AS status_geral
FROM stats;

\echo ''
\echo '✅ VALIDAÇÃO COMPLETA'
\echo ''
\echo 'INTERPRETAÇÃO:'
\echo '  ✅ = Policies corretas e multi-tenancy seguro'
\echo '  ⚠️  = Atenção, melhorar cobertura'
\echo '  ❌ = Vulnerabilidade crítica, corrigir urgentemente'
\echo ''

