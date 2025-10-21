-- ============================================
-- Health Check: Índices de Performance
-- Descrição: Valida cobertura de índices para p95 < 250ms
-- Esperado: Índices otimizados em todas as tabelas críticas
-- ============================================

\echo '🔍 VALIDANDO ÍNDICES DE PERFORMANCE...'
\echo ''

-- ============================================
-- 1. Estatísticas gerais de índices
-- ============================================
\echo '1. Estatísticas gerais de índices'
SELECT
  COUNT(*) AS total_indices,
  COUNT(DISTINCT tablename) AS tabelas_com_indices,
  COUNT(*) FILTER (WHERE indexdef LIKE '%USING gin%') AS indices_gin,
  COUNT(*) FILTER (WHERE indexdef LIKE '%USING btree%') AS indices_btree,
  COUNT(*) FILTER (WHERE indexdef LIKE '%UNIQUE%') AS indices_unique,
  '✅' AS status
FROM pg_indexes
WHERE schemaname = 'public';

\echo ''

-- ============================================
-- 2. Tabelas SEM índice empresa_id (multi-tenant)
-- ============================================
\echo '2. Tabelas com empresa_id MAS SEM índice (performance crítica)'
SELECT
  c.table_name AS tabela,
  '❌ FALTANDO ÍNDICE empresa_id' AS alerta,
  'p95 pode exceder 250ms em queries multi-tenant' AS impacto
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.column_name = 'empresa_id'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND i.tablename = c.table_name
      AND i.indexdef LIKE '%empresa_id%'
  )
ORDER BY c.table_name
LIMIT 20;

-- Contagem
SELECT
  COUNT(*) AS tabelas_sem_indice_empresa,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ TODAS AS TABELAS COM empresa_id TÊM ÍNDICE'
    WHEN COUNT(*) < 5 THEN '⚠️ POUCAS TABELAS SEM ÍNDICE'
    ELSE '❌ MUITAS TABELAS SEM ÍNDICE (urgente)'
  END AS status
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.column_name = 'empresa_id'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND i.tablename = c.table_name
      AND i.indexdef LIKE '%empresa_id%'
  );

\echo ''

-- ============================================
-- 3. Índices parciais (WHERE excluido_em IS NULL)
-- ============================================
\echo '3. Validando índices parciais para soft delete'
SELECT
  tablename,
  indexname,
  '✅ ÍNDICE PARCIAL (soft delete)' AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%WHERE%excluido_em IS NULL%'
ORDER BY tablename, indexname
LIMIT 15;

-- Contagem
SELECT
  COUNT(*) AS indices_parciais_soft_delete,
  COUNT(DISTINCT tablename) AS tabelas_cobertas,
  CASE
    WHEN COUNT(*) >= 20 THEN '✅ BOA COBERTURA'
    WHEN COUNT(*) >= 10 THEN '⚠️ COBERTURA PARCIAL'
    ELSE '❌ POUCOS ÍNDICES PARCIAIS'
  END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%WHERE%excluido_em IS NULL%';

\echo ''

-- ============================================
-- 4. Índices GIN para busca textual
-- ============================================
\echo '4. Validando índices GIN (busca textual full-text)'
SELECT
  tablename,
  indexname,
  SUBSTRING(indexdef FROM 'to_tsvector\(''[^'']+''') AS language,
  '✅ ÍNDICE GIN (busca textual)' AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%USING gin%'
  AND indexdef LIKE '%to_tsvector%'
ORDER BY tablename, indexname;

-- Contagem
SELECT
  COUNT(*) AS indices_gin_tsvector,
  COUNT(DISTINCT tablename) AS tabelas_com_busca,
  CASE
    WHEN COUNT(*) >= 5 THEN '✅ BOA COBERTURA'
    WHEN COUNT(*) >= 3 THEN '⚠️ COBERTURA PARCIAL'
    ELSE '❌ POUCOS ÍNDICES GIN'
  END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%USING gin%'
  AND indexdef LIKE '%to_tsvector%';

\echo ''

-- ============================================
-- 5. Índices compostos (multi-coluna)
-- ============================================
\echo '5. Validando índices compostos (multi-coluna)'
SELECT
  tablename,
  indexname,
  LENGTH(indexdef) - LENGTH(REPLACE(indexdef, ',', '')) + 1 AS num_colunas,
  '✅ ÍNDICE COMPOSTO' AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%(%, %'
ORDER BY num_colunas DESC, tablename
LIMIT 20;

-- Contagem
WITH compostos AS (
  SELECT
    tablename,
    indexname,
    LENGTH(indexdef) - LENGTH(REPLACE(indexdef, ',', '')) + 1 AS num_colunas
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexdef LIKE '%(%, %'
)
SELECT
  COUNT(*) AS indices_compostos,
  COUNT(DISTINCT tablename) AS tabelas_cobertas,
  ROUND(AVG(num_colunas), 2) AS media_colunas,
  CASE
    WHEN COUNT(*) >= 15 THEN '✅ EXCELENTE'
    WHEN COUNT(*) >= 10 THEN '⚠️ BOM'
    ELSE '❌ POUCOS ÍNDICES COMPOSTOS'
  END AS status
FROM compostos;

\echo ''

-- ============================================
-- 6. Índices para keyset pagination
-- ============================================
\echo '6. Validando índices para keyset pagination (empresa_id, criado_em DESC, id)'
SELECT
  tablename,
  indexname,
  '✅ ÍNDICE KEYSET PAGINATION' AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%empresa_id%'
  AND indexdef LIKE '%criado_em%'
  AND indexdef LIKE '%DESC%'
ORDER BY tablename;

-- Contagem
SELECT
  COUNT(*) AS indices_keyset,
  COUNT(DISTINCT tablename) AS tabelas_cobertas,
  CASE
    WHEN COUNT(*) >= 10 THEN '✅ BOA COBERTURA'
    WHEN COUNT(*) >= 5 THEN '⚠️ COBERTURA PARCIAL'
    ELSE '❌ POUCOS ÍNDICES KEYSET'
  END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%empresa_id%'
  AND indexdef LIKE '%criado_em%'
  AND indexdef LIKE '%DESC%';

\echo ''

-- ============================================
-- 7. Tabelas grandes SEM índices suficientes
-- ============================================
\echo '7. Tabelas grandes (>1000 rows) com poucos índices (risco de performance)'
WITH table_sizes AS (
  SELECT
    schemaname,
    relname AS tablename,
    n_live_tup AS linhas_estimadas
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND n_live_tup > 1000
),
index_counts AS (
  SELECT
    tablename,
    COUNT(*) AS num_indices
  FROM pg_indexes
  WHERE schemaname = 'public'
  GROUP BY tablename
)
SELECT
  ts.tablename,
  ts.linhas_estimadas,
  COALESCE(ic.num_indices, 0) AS num_indices,
  CASE
    WHEN COALESCE(ic.num_indices, 0) >= 5 THEN '✅ BOA COBERTURA'
    WHEN COALESCE(ic.num_indices, 0) >= 2 THEN '⚠️ POUCOS ÍNDICES'
    ELSE '❌ SEM ÍNDICES SUFICIENTES (risco)'
  END AS status
FROM table_sizes ts
LEFT JOIN index_counts ic ON ic.tablename = ts.tablename
ORDER BY
  CASE
    WHEN COALESCE(ic.num_indices, 0) >= 5 THEN 3
    WHEN COALESCE(ic.num_indices, 0) >= 2 THEN 2
    ELSE 1
  END,
  ts.linhas_estimadas DESC
LIMIT 15;

\echo ''

-- ============================================
-- 8. Índices duplicados ou redundantes
-- ============================================
\echo '8. Verificando índices potencialmente duplicados'
WITH index_columns AS (
  SELECT
    tablename,
    indexname,
    SUBSTRING(indexdef FROM '\((.*)\)') AS columns
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexdef NOT LIKE '%UNIQUE%'
)
SELECT
  i1.tablename,
  i1.indexname AS indice_1,
  i2.indexname AS indice_2,
  i1.columns AS colunas,
  '⚠️ POTENCIAL DUPLICATA' AS alerta
FROM index_columns i1
JOIN index_columns i2
  ON i1.tablename = i2.tablename
  AND i1.columns = i2.columns
  AND i1.indexname < i2.indexname
ORDER BY i1.tablename
LIMIT 10;

\echo ''

-- ============================================
-- 9. Índices não utilizados (potencial remoção)
-- ============================================
\echo '9. Índices com baixo uso (candidatos a remoção)'
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS num_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) AS tamanho,
  '⚠️ BAIXO USO' AS status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan < 10
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY idx_scan, pg_relation_size(indexrelid) DESC
LIMIT 15;

-- Nota: Cuidado! Validar se são índices novos antes de remover

\echo ''

-- ============================================
-- 10. Resumo Performance Índices
-- ============================================
\echo '10. RESUMO PERFORMANCE ÍNDICES'
WITH stats AS (
  SELECT
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') AS total_indices,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexdef LIKE '%empresa_id%') AS indices_multi_tenant,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexdef LIKE '%WHERE%excluido_em IS NULL%') AS indices_parciais,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexdef LIKE '%USING gin%' AND indexdef LIKE '%to_tsvector%') AS indices_gin,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexdef LIKE '%(%, %') AS indices_compostos,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'empresa_id' AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = table_name AND indexdef LIKE '%empresa_id%')) AS tabelas_sem_indice_empresa
)
SELECT
  total_indices AS "Total de índices",
  indices_multi_tenant AS "Índices multi-tenant (empresa_id)",
  indices_parciais AS "Índices parciais (soft delete)",
  indices_gin AS "Índices GIN (busca textual)",
  indices_compostos AS "Índices compostos (multi-coluna)",
  tabelas_sem_indice_empresa AS "Tabelas sem índice empresa_id",
  CASE
    WHEN total_indices >= 50 AND tabelas_sem_indice_empresa = 0
      THEN '✅ PERFORMANCE EXCELENTE'
    WHEN total_indices >= 30 AND tabelas_sem_indice_empresa < 5
      THEN '⚠️ BOM, MAS PODE MELHORAR'
    WHEN total_indices >= 15
      THEN '⚠️ COBERTURA PARCIAL (risco p95 > 250ms)'
    ELSE '❌ COBERTURA INSUFICIENTE (crítico)'
  END AS status_geral
FROM stats;

\echo ''
\echo '✅ VALIDAÇÃO COMPLETA'
\echo ''
\echo 'RECOMENDAÇÕES:'
\echo '  - p95 < 250ms requer índices em: empresa_id, status, criado_em'
\echo '  - Índices parciais economizam espaço: WHERE excluido_em IS NULL'
\echo '  - GIN trigram para busca: USING GIN (to_tsvector(''portuguese'', nome))'
\echo '  - Keyset pagination: (empresa_id, criado_em DESC, id)'
\echo ''

