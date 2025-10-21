-- ============================================
-- Health Check: Validar Mapeamento FE↔BD
-- Descrição: Verifica conformidade com mapeamento_fe_bd.md
-- Esperado: 0 divergências
-- ============================================

\echo '🔍 VALIDANDO MAPEAMENTO FE↔BD...'
\echo ''

-- ============================================
-- 1. Checar paciente_iniciais vs paciente_nome
-- ============================================
\echo '1. Validando LGPD: paciente_iniciais em cirurgias'
SELECT
  'cirurgias' AS tabela,
  column_name,
  data_type,
  is_nullable,
  CASE
    WHEN column_name = 'paciente_iniciais' THEN '✅ CONFORME'
    WHEN column_name = 'paciente_nome' THEN '❌ VIOLAÇÃO LGPD (deve usar paciente_iniciais)'
    ELSE '⚠️ CAMPO DESCONHECIDO'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cirurgias'
  AND column_name IN ('paciente_iniciais', 'paciente_nome');

\echo ''

-- ============================================
-- 2. Validar 15 tabelas core do mapeamento
-- ============================================
\echo '2. Validando existência das 15 tabelas core'
WITH mapeamento AS (
  SELECT unnest(ARRAY[
    'empresas', 'usuarios', 'produtos', 'lotes', 'medicos',
    'hospitais', 'cirurgias', 'kits', 'itens_kit', 'leads',
    'transacoes', 'fornecedores', 'pedidos_compra', 'faturas', 'audit_log'
  ]) AS tabela_esperada
)
SELECT
  m.tabela_esperada,
  CASE
    WHEN t.tablename IS NOT NULL THEN '✅ EXISTE'
    ELSE '❌ FALTANDO'
  END AS status,
  t.tablename AS tabela_real
FROM mapeamento m
LEFT JOIN pg_tables t
  ON t.schemaname = 'public'
  AND t.tablename = m.tabela_esperada
ORDER BY
  CASE WHEN t.tablename IS NOT NULL THEN 1 ELSE 0 END,
  m.tabela_esperada;

\echo ''

-- ============================================
-- 3. Validar campos críticos ANVISA
-- ============================================
\echo '3. Validando campos ANVISA obrigatórios'
SELECT
  'produtos' AS tabela,
  column_name,
  CASE
    WHEN column_name = 'registro_anvisa' THEN '✅ OK'
    ELSE '⚠️ CAMPO OPCIONAL'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'produtos'
  AND column_name IN ('registro_anvisa', 'fabricante');

\echo ''

SELECT
  'lotes' AS tabela,
  column_name,
  is_nullable,
  CASE
    WHEN column_name IN ('numero_lote', 'data_validade') AND is_nullable = 'NO' THEN '✅ NOT NULL OK'
    WHEN column_name IN ('numero_lote', 'data_validade') AND is_nullable = 'YES' THEN '❌ DEVERIA SER NOT NULL'
    WHEN column_name = 'numero_serie' THEN '✅ NULL OK (opcional)'
    ELSE '⚠️ VERIFICAR'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lotes'
  AND column_name IN ('numero_lote', 'numero_serie', 'data_validade');

\echo ''

-- ============================================
-- 4. Validar soft delete (excluido_em)
-- ============================================
\echo '4. Validando soft delete (excluido_em) nas 15 tabelas core'
WITH core_tables AS (
  SELECT unnest(ARRAY[
    'empresas', 'usuarios', 'produtos', 'lotes', 'medicos',
    'hospitais', 'cirurgias', 'kits', 'itens_kit', 'leads',
    'transacoes', 'fornecedores', 'pedidos_compra', 'faturas'
  ]) AS tabela
)
SELECT
  t.tabela,
  CASE
    WHEN c.column_name IS NOT NULL THEN '✅ TEM excluido_em'
    ELSE '❌ FALTANDO excluido_em'
  END AS status,
  c.data_type
FROM core_tables t
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
  AND c.table_name = t.tabela
  AND c.column_name = 'excluido_em'
ORDER BY
  CASE WHEN c.column_name IS NOT NULL THEN 1 ELSE 0 END,
  t.tabela;

\echo ''

-- ============================================
-- 5. Validar timestamps (criado_em, atualizado_em)
-- ============================================
\echo '5. Validando timestamps padrão (criado_em, atualizado_em)'
WITH core_tables AS (
  SELECT unnest(ARRAY[
    'empresas', 'usuarios', 'produtos', 'lotes', 'medicos',
    'hospitais', 'cirurgias', 'kits'
  ]) AS tabela
),
campos_timestamp AS (
  SELECT
    c.table_name AS tabela,
    COUNT(*) FILTER (WHERE c.column_name = 'criado_em') AS tem_criado_em,
    COUNT(*) FILTER (WHERE c.column_name = 'atualizado_em') AS tem_atualizado_em,
    COUNT(*) FILTER (WHERE c.column_name = 'created_at') AS tem_created_at,
    COUNT(*) FILTER (WHERE c.column_name = 'updated_at') AS tem_updated_at
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.column_name IN ('criado_em', 'atualizado_em', 'created_at', 'updated_at')
  GROUP BY c.table_name
)
SELECT
  t.tabela,
  CASE
    WHEN ct.tem_criado_em = 1 AND ct.tem_atualizado_em = 1 THEN '✅ PADRÃO PT-BR'
    WHEN ct.tem_created_at = 1 AND ct.tem_updated_at = 1 THEN '⚠️ INGLÊS (padronizar?)'
    WHEN ct.tem_criado_em = 1 OR ct.tem_created_at = 1 THEN '⚠️ FALTA UPDATED'
    ELSE '❌ SEM TIMESTAMPS'
  END AS status
FROM core_tables t
LEFT JOIN campos_timestamp ct ON ct.tabela = t.tabela
ORDER BY
  CASE
    WHEN ct.tem_criado_em = 1 AND ct.tem_atualizado_em = 1 THEN 1
    WHEN ct.tem_created_at = 1 AND ct.tem_updated_at = 1 THEN 2
    ELSE 3
  END,
  t.tabela;

\echo ''

-- ============================================
-- 6. Validar FKs de multi-tenancy (empresa_id)
-- ============================================
\echo '6. Validando FK empresa_id nas tabelas core'
WITH core_tables AS (
  SELECT unnest(ARRAY[
    'usuarios', 'produtos', 'lotes', 'medicos',
    'hospitais', 'cirurgias', 'kits', 'leads',
    'transacoes', 'fornecedores', 'pedidos_compra', 'faturas'
  ]) AS tabela
)
SELECT
  t.tabela,
  CASE
    WHEN c.column_name IS NOT NULL THEN '✅ TEM empresa_id'
    ELSE '❌ FALTANDO empresa_id (multi-tenant)'
  END AS status,
  c.data_type,
  tc.constraint_type AS fk_constraint
FROM core_tables t
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
  AND c.table_name = t.tabela
  AND c.column_name = 'empresa_id'
LEFT JOIN information_schema.table_constraints tc
  ON tc.table_schema = 'public'
  AND tc.table_name = t.tabela
  AND tc.constraint_type = 'FOREIGN KEY'
  AND EXISTS (
    SELECT 1
    FROM information_schema.key_column_usage kcu
    WHERE kcu.constraint_name = tc.constraint_name
      AND kcu.column_name = 'empresa_id'
  )
ORDER BY
  CASE WHEN c.column_name IS NOT NULL THEN 1 ELSE 0 END,
  t.tabela;

\echo ''
\echo '✅ VALIDAÇÃO COMPLETA'
\echo ''
\echo 'INTERPRETAÇÃO:'
\echo '  ✅ = Conforme com mapeamento'
\echo '  ⚠️  = Atenção, verificar'
\echo '  ❌ = Não conforme, corrigir'
\echo ''

