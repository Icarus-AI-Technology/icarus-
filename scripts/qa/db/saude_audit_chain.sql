-- ============================================
-- Health Check: Audit Log & Hash Chain
-- Descrição: Valida integridade do blockchain-like audit trail
-- Esperado: 0 quebras de corrente
-- ============================================

\echo '🔍 VALIDANDO AUDIT LOG & HASH CHAIN...'
\echo ''

-- ============================================
-- 1. Checar existência da tabela audit_log
-- ============================================
\echo '1. Validando existência de audit_log'
SELECT
  tablename,
  '✅ TABELA EXISTE' AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'audit_log';

\echo ''

-- ============================================
-- 2. Validar estrutura da tabela
-- ============================================
\echo '2. Validando estrutura de audit_log'
SELECT
  column_name,
  data_type,
  is_nullable,
  CASE
    WHEN column_name IN ('hash_anterior', 'hash_atual') AND data_type = 'text' THEN '✅ OK'
    WHEN column_name IN ('dados_antes', 'dados_depois') AND data_type = 'jsonb' THEN '✅ OK'
    WHEN column_name = 'acao' AND data_type IN ('text', 'character varying') THEN '✅ OK'
    ELSE '⚠️ VERIFICAR'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'audit_log'
  AND column_name IN ('hash_anterior', 'hash_atual', 'dados_antes', 'dados_depois', 'acao', 'tabela', 'registro_id')
ORDER BY column_name;

\echo ''

-- ============================================
-- 3. Integridade do hash chain
-- ============================================
\echo '3. Validando integridade do hash chain (quebras de corrente)'
WITH hash_check AS (
  SELECT
    id,
    criado_em,
    hash_atual,
    LEAD(hash_anterior) OVER (ORDER BY criado_em, id) AS proximo_hash_anterior
  FROM audit_log
)
SELECT
  COUNT(*) AS quebras_corrente,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ CORRENTE ÍNTEGRA'
    WHEN COUNT(*) < 5 THEN '⚠️ POUCAS QUEBRAS (investigar)'
    ELSE '❌ CORRENTE COMPROMETIDA (crítico)'
  END AS status
FROM hash_check
WHERE hash_atual != proximo_hash_anterior
  AND proximo_hash_anterior IS NOT NULL;

-- Exibir quebras (se houver)
WITH hash_check AS (
  SELECT
    id,
    criado_em,
    tabela,
    acao,
    hash_atual,
    LEAD(hash_anterior) OVER (ORDER BY criado_em, id) AS proximo_hash_anterior
  FROM audit_log
)
SELECT
  id,
  criado_em,
  tabela,
  acao,
  hash_atual,
  proximo_hash_anterior,
  '❌ QUEBRA DETECTADA' AS alerta
FROM hash_check
WHERE hash_atual != proximo_hash_anterior
  AND proximo_hash_anterior IS NOT NULL
ORDER BY criado_em
LIMIT 10;

\echo ''

-- ============================================
-- 4. Estatísticas de auditoria
-- ============================================
\echo '4. Estatísticas de audit_log'
SELECT
  COUNT(*) AS total_registros,
  COUNT(DISTINCT tabela) AS tabelas_auditadas,
  COUNT(DISTINCT acao) AS tipos_acao,
  MIN(criado_em) AS primeira_auditoria,
  MAX(criado_em) AS ultima_auditoria,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ AUDIT LOG ATIVO'
    ELSE '❌ SEM REGISTROS'
  END AS status
FROM audit_log;

\echo ''

-- ============================================
-- 5. Distribuição por ação
-- ============================================
\echo '5. Distribuição de auditorias por ação'
SELECT
  acao,
  COUNT(*) AS quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentual,
  '✅' AS status
FROM audit_log
GROUP BY acao
ORDER BY quantidade DESC;

\echo ''

-- ============================================
-- 6. Top 10 tabelas mais auditadas
-- ============================================
\echo '6. Top 10 tabelas mais auditadas'
SELECT
  tabela,
  COUNT(*) AS auditorias,
  COUNT(*) FILTER (WHERE acao = 'INSERT') AS inserts,
  COUNT(*) FILTER (WHERE acao = 'UPDATE') AS updates,
  COUNT(*) FILTER (WHERE acao = 'DELETE') AS deletes,
  '✅' AS status
FROM audit_log
GROUP BY tabela
ORDER BY auditorias DESC
LIMIT 10;

\echo ''

-- ============================================
-- 7. Checar triggers de auditoria
-- ============================================
\echo '7. Validando triggers de auditoria ativos'
SELECT
  trigger_name,
  event_object_table AS tabela,
  event_manipulation AS evento,
  action_timing,
  CASE
    WHEN trigger_name LIKE 'trg_audit%' THEN '✅ TRIGGER DE AUDIT'
    ELSE '⚠️ OUTRO TRIGGER'
  END AS tipo
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%audit%'
ORDER BY event_object_table, trigger_name;

-- Contagem
SELECT
  COUNT(*) AS triggers_audit,
  COUNT(DISTINCT event_object_table) AS tabelas_com_trigger,
  CASE
    WHEN COUNT(*) >= 15 THEN '✅ BOA COBERTURA'
    WHEN COUNT(*) >= 5 THEN '⚠️ COBERTURA PARCIAL'
    ELSE '❌ POUCOS TRIGGERS'
  END AS status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%audit%';

\echo ''

-- ============================================
-- 8. Verificar função compute_audit_hash()
-- ============================================
\echo '8. Validando funções de auditoria'
SELECT
  routine_name,
  routine_type,
  data_type AS return_type,
  '✅ FUNÇÃO EXISTE' AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('compute_audit_hash', 'insert_audit_log')
ORDER BY routine_name;

\echo ''

-- ============================================
-- 9. Registros suspeitos (sem hash)
-- ============================================
\echo '9. Validando registros sem hash (suspeito)'
SELECT
  COUNT(*) AS registros_sem_hash,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ TODOS OS REGISTROS TÊM HASH'
    ELSE '❌ REGISTROS SEM HASH (investigar)'
  END AS status
FROM audit_log
WHERE hash_atual IS NULL OR hash_atual = '';

-- Exibir registros suspeitos
SELECT
  id,
  criado_em,
  tabela,
  acao,
  hash_atual,
  '❌ SEM HASH' AS alerta
FROM audit_log
WHERE hash_atual IS NULL OR hash_atual = ''
ORDER BY criado_em DESC
LIMIT 10;

\echo ''

-- ============================================
-- 10. Resumo Audit Chain
-- ============================================
\echo '10. RESUMO AUDIT CHAIN'
WITH stats AS (
  SELECT
    (SELECT COUNT(*) FROM audit_log) AS total_registros,
    (SELECT COUNT(*) FROM audit_log WHERE hash_atual IS NULL OR hash_atual = '') AS sem_hash,
    (SELECT COUNT(*) FROM (
      WITH hash_check AS (
        SELECT
          id,
          hash_atual,
          LEAD(hash_anterior) OVER (ORDER BY criado_em, id) AS proximo_hash_anterior
        FROM audit_log
      )
      SELECT 1
      FROM hash_check
      WHERE hash_atual != proximo_hash_anterior
        AND proximo_hash_anterior IS NOT NULL
    ) AS quebras) AS quebras_corrente,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name LIKE '%audit%') AS triggers_ativos
)
SELECT
  total_registros AS "Total de auditorias",
  sem_hash AS "Registros sem hash",
  quebras_corrente AS "Quebras de corrente",
  triggers_ativos AS "Triggers de audit ativos",
  CASE
    WHEN total_registros > 0 AND sem_hash = 0 AND quebras_corrente = 0 AND triggers_ativos >= 5
      THEN '✅ AUDIT LOG 100% ÍNTEGRO'
    WHEN quebras_corrente = 0 AND triggers_ativos >= 3
      THEN '⚠️ BOM, MAS PODE MELHORAR'
    ELSE '❌ CORREÇÕES NECESSÁRIAS'
  END AS status_geral
FROM stats;

\echo ''
\echo '✅ VALIDAÇÃO COMPLETA'
\echo ''

