-- ============================================
-- Health Check: Rastreabilidade OPME/ANVISA
-- Descrição: Valida cadeia produtos→lotes→kits→cirurgias
-- Esperado: 0 violações de rastreabilidade
-- ============================================

\echo '🔍 VALIDANDO RASTREABILIDADE OPME/ANVISA...'
\echo ''

-- ============================================
-- 1. Produtos OPME sem registro ANVISA
-- ============================================
\echo '1. Produtos OPME sem registro ANVISA (obrigatório)'
SELECT
  id,
  codigo_sku,
  descricao,
  fabricante,
  registro_anvisa,
  '❌ FALTANDO REGISTRO ANVISA' AS status
FROM produtos
WHERE excluido_em IS NULL
  AND (registro_anvisa IS NULL OR registro_anvisa = '')
LIMIT 10;

-- Contagem
SELECT
  COUNT(*) AS produtos_sem_anvisa,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ TODOS COM REGISTRO'
    WHEN COUNT(*) < 10 THEN '⚠️ ALGUNS SEM REGISTRO'
    ELSE '❌ MUITOS SEM REGISTRO (>10)'
  END AS status_geral
FROM produtos
WHERE excluido_em IS NULL
  AND (registro_anvisa IS NULL OR registro_anvisa = '');

\echo ''

-- ============================================
-- 2. Lotes sem data de validade
-- ============================================
\echo '2. Lotes sem data de validade (ANVISA obrigatório)'
SELECT
  l.id,
  p.descricao AS produto,
  l.numero_lote,
  l.data_validade,
  '❌ SEM DATA VALIDADE' AS status
FROM lotes l
JOIN produtos p ON p.id = l.produto_id
WHERE l.excluido_em IS NULL
  AND l.data_validade IS NULL
LIMIT 10;

-- Contagem
SELECT
  COUNT(*) AS lotes_sem_validade,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ TODOS COM VALIDADE'
    ELSE '❌ LOTES SEM VALIDADE'
  END AS status_geral
FROM lotes
WHERE excluido_em IS NULL
  AND data_validade IS NULL;

\echo ''

-- ============================================
-- 3. Lotes vencidos ainda em estoque
-- ============================================
\echo '3. Lotes vencidos com quantidade disponível > 0 (alerta crítico)'
SELECT
  l.id,
  p.descricao AS produto,
  l.numero_lote,
  l.numero_serie,
  l.data_validade,
  l.quantidade_disponivel,
  l.status,
  '❌ LOTE VENCIDO EM ESTOQUE' AS alerta
FROM lotes l
JOIN produtos p ON p.id = l.produto_id
WHERE l.excluido_em IS NULL
  AND l.data_validade < CURRENT_DATE
  AND l.quantidade_disponivel > 0
  AND l.status != 'vencido'
ORDER BY l.data_validade
LIMIT 20;

-- Contagem
SELECT
  COUNT(*) AS lotes_vencidos_disponiveis,
  SUM(quantidade_disponivel) AS quantidade_total,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ NENHUM LOTE VENCIDO EM ESTOQUE'
    WHEN COUNT(*) < 5 THEN '⚠️ POUCOS LOTES VENCIDOS (verificar)'
    ELSE '❌ MUITOS LOTES VENCIDOS (urgente)'
  END AS status_geral
FROM lotes
WHERE excluido_em IS NULL
  AND data_validade < CURRENT_DATE
  AND quantidade_disponivel > 0;

\echo ''

-- ============================================
-- 4. Itens de kit sem lote atribuído
-- ============================================
\echo '4. Itens de kit sem lote (rastreabilidade incompleta)'
SELECT
  ik.id,
  k.nome AS kit,
  k.status AS status_kit,
  p.descricao AS produto,
  ik.quantidade,
  '⚠️ SEM LOTE ATRIBUÍDO' AS status
FROM itens_kit ik
JOIN kits k ON k.id = ik.kit_id
JOIN produtos p ON p.id = ik.produto_id
WHERE k.excluido_em IS NULL
  AND ik.lote_id IS NULL
  AND k.status IN ('montado', 'despachado', 'consumido')
LIMIT 20;

-- Contagem
SELECT
  COUNT(*) AS itens_sem_lote,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ TODOS OS ITENS TÊM LOTE'
    WHEN COUNT(*) < 10 THEN '⚠️ ALGUNS ITENS SEM LOTE'
    ELSE '❌ MUITOS ITENS SEM LOTE'
  END AS status_geral
FROM itens_kit ik
JOIN kits k ON k.id = ik.kit_id
WHERE k.excluido_em IS NULL
  AND ik.lote_id IS NULL
  AND k.status IN ('montado', 'despachado', 'consumido');

\echo ''

-- ============================================
-- 5. Cirurgias sem kit associado
-- ============================================
\echo '5. Cirurgias concluídas sem kit (rastreabilidade incompleta)'
SELECT
  c.id,
  c.codigo_interno,
  c.procedimento,
  c.data_cirurgia,
  c.status,
  '⚠️ SEM KIT ASSOCIADO' AS alerta
FROM cirurgias c
WHERE c.excluido_em IS NULL
  AND c.status IN ('concluida', 'andamento')
  AND NOT EXISTS (
    SELECT 1
    FROM kits k
    WHERE k.cirurgia_id = c.id
      AND k.excluido_em IS NULL
  )
ORDER BY c.data_cirurgia DESC
LIMIT 20;

-- Contagem
SELECT
  COUNT(*) AS cirurgias_sem_kit,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ TODAS AS CIRURGIAS TÊM KIT'
    WHEN COUNT(*) < 5 THEN '⚠️ POUCAS CIRURGIAS SEM KIT'
    ELSE '❌ MUITAS CIRURGIAS SEM KIT'
  END AS status_geral
FROM cirurgias c
WHERE c.excluido_em IS NULL
  AND c.status IN ('concluida', 'andamento')
  AND NOT EXISTS (
    SELECT 1
    FROM kits k
    WHERE k.cirurgia_id = c.id
      AND k.excluido_em IS NULL
  );

\echo ''

-- ============================================
-- 6. Query de rastreabilidade completa (exemplo)
-- ============================================
\echo '6. Exemplo de rastreabilidade completa (5 cirurgias recentes)'
SELECT
  c.codigo_interno AS cirurgia,
  c.procedimento,
  c.data_cirurgia,
  k.nome AS kit,
  p.descricao AS produto,
  l.numero_lote AS lote,
  l.numero_serie AS serie,
  p.registro_anvisa,
  l.data_validade,
  CASE
    WHEN p.registro_anvisa IS NOT NULL
     AND l.numero_lote IS NOT NULL
     AND l.data_validade IS NOT NULL THEN '✅ RASTREÁVEL 100%'
    WHEN l.numero_lote IS NULL THEN '❌ SEM LOTE'
    WHEN p.registro_anvisa IS NULL THEN '❌ SEM REGISTRO ANVISA'
    ELSE '⚠️ RASTREABILIDADE PARCIAL'
  END AS status_rastreabilidade
FROM cirurgias c
JOIN kits k ON k.cirurgia_id = c.id
JOIN itens_kit ik ON ik.kit_id = k.id
JOIN produtos p ON p.id = ik.produto_id
LEFT JOIN lotes l ON l.id = ik.lote_id
WHERE c.excluido_em IS NULL
  AND k.excluido_em IS NULL
  AND c.status = 'concluida'
ORDER BY c.data_cirurgia DESC
LIMIT 15;

\echo ''

-- ============================================
-- 7. Resumo ANVISA Compliance
-- ============================================
\echo '7. RESUMO ANVISA COMPLIANCE'
WITH stats AS (
  SELECT
    (SELECT COUNT(*) FROM produtos WHERE excluido_em IS NULL AND (registro_anvisa IS NULL OR registro_anvisa = '')) AS produtos_sem_anvisa,
    (SELECT COUNT(*) FROM lotes WHERE excluido_em IS NULL AND data_validade IS NULL) AS lotes_sem_validade,
    (SELECT COUNT(*) FROM lotes WHERE excluido_em IS NULL AND data_validade < CURRENT_DATE AND quantidade_disponivel > 0) AS lotes_vencidos_estoque,
    (SELECT COUNT(*) FROM itens_kit ik JOIN kits k ON k.id = ik.kit_id WHERE k.excluido_em IS NULL AND ik.lote_id IS NULL AND k.status IN ('montado', 'despachado', 'consumido')) AS itens_sem_lote,
    (SELECT COUNT(*) FROM cirurgias c WHERE c.excluido_em IS NULL AND c.status IN ('concluida') AND NOT EXISTS (SELECT 1 FROM kits k WHERE k.cirurgia_id = c.id AND k.excluido_em IS NULL)) AS cirurgias_sem_kit
)
SELECT
  produtos_sem_anvisa AS "Produtos sem registro ANVISA",
  lotes_sem_validade AS "Lotes sem data validade",
  lotes_vencidos_estoque AS "Lotes vencidos em estoque",
  itens_sem_lote AS "Itens de kit sem lote",
  cirurgias_sem_kit AS "Cirurgias sem kit",
  CASE
    WHEN produtos_sem_anvisa + lotes_sem_validade + lotes_vencidos_estoque + itens_sem_lote + cirurgias_sem_kit = 0
      THEN '✅ ANVISA COMPLIANCE 100%'
    WHEN produtos_sem_anvisa + lotes_sem_validade + lotes_vencidos_estoque < 10
      THEN '⚠️ PEQUENAS CORREÇÕES NECESSÁRIAS'
    ELSE '❌ CORREÇÕES URGENTES NECESSÁRIAS'
  END AS status_geral
FROM stats;

\echo ''
\echo '✅ VALIDAÇÃO COMPLETA'
\echo ''

