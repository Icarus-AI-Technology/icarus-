-- ============================================================================
-- QUERIES DE VALIDAÇÃO - 4 TABELAS CRÍTICAS
-- Execute após aplicar a migration para validar se tudo foi criado corretamente
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR SE AS 4 TABELAS FORAM CRIADAS
-- ============================================================================
-- Resultado esperado: 4 linhas

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
ORDER BY table_name;

-- ✅ Se retornar 4 linhas: SUCESSO!
-- ❌ Se retornar menos: Alguma tabela não foi criada


-- ============================================================================
-- 2. VERIFICAR NÚMERO DE COLUNAS POR TABELA
-- ============================================================================
-- Resultado esperado:
--   consignacao_materiais: 32
--   produtos_opme: 48
--   rastreabilidade_opme: 46
--   compliance_requisitos_abbott: 42

SELECT 
  table_name,
  COUNT(*) as num_colunas
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
GROUP BY table_name
ORDER BY table_name;

-- ✅ Se os números baterem: SUCESSO!
-- ❌ Se diferente: Verificar se migration foi aplicada completamente


-- ============================================================================
-- 3. VERIFICAR FOREIGN KEYS
-- ============================================================================
-- Resultado esperado:
--   consignacao_materiais: 7
--   produtos_opme: 3
--   rastreabilidade_opme: 10
--   compliance_requisitos_abbott: 3

SELECT 
  tc.table_name, 
  COUNT(*) as num_foreign_keys
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
GROUP BY tc.table_name
ORDER BY tc.table_name;

-- ✅ Se os números baterem: SUCESSO!
-- ⚠️  Se diferente: Algumas FKs podem não ter sido criadas (tabelas referenciadas ausentes)


-- ============================================================================
-- 4. VERIFICAR ÍNDICES
-- ============================================================================
-- Resultado esperado: Total de 31 índices (incluindo PKs)
--   consignacao_materiais: 7 (1 PK + 6 índices)
--   produtos_opme: 7 (1 PK + 6 índices)
--   rastreabilidade_opme: 9 (1 PK + 8 índices)
--   compliance_requisitos_abbott: 8 (1 PK + 7 índices)

SELECT 
  tablename,
  COUNT(*) as num_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
GROUP BY tablename
ORDER BY tablename;

-- ✅ Se os números baterem: SUCESSO!
-- ❌ Se diferente: Alguns índices podem não ter sido criados


-- ============================================================================
-- 5. VERIFICAR CONSTRAINTS (CHECKS, UNIQUES, PKs, FKs)
-- ============================================================================
-- Mostra todos os tipos de constraints

SELECT 
  tc.table_name,
  tc.constraint_type,
  COUNT(*) as quantidade
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
GROUP BY tc.table_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_type;

-- ✅ Verifique se há:
--    - PRIMARY KEY (1 por tabela)
--    - FOREIGN KEY (conforme esperado)
--    - CHECK (vários por tabela)
--    - UNIQUE (alguns)


-- ============================================================================
-- 6. LISTAR TODAS AS COLUNAS DAS 4 TABELAS
-- ============================================================================
-- Útil para verificar estrutura completa

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
ORDER BY table_name, ordinal_position;

-- ✅ Verifique se as colunas principais estão presentes


-- ============================================================================
-- 7. TESTE DE INSERÇÃO (COM ROLLBACK)
-- ============================================================================
-- Testa se é possível inserir dados nas tabelas (não grava nada)

BEGIN;

-- Teste em compliance_requisitos_abbott (menos dependências)
INSERT INTO compliance_requisitos_abbott (
  empresa_id,
  codigo_requisito,
  categoria,
  nome_requisito,
  nivel_criticidade,
  data_inicio_vigencia,
  peso_calculo,
  pontos_possiveis
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Ajustar para empresa_id real
  'TEST001',
  'DOCUMENTACAO',
  'Teste de Inserção',
  'BAIXA',
  CURRENT_DATE,
  1,
  100
);

-- Se chegou aqui sem erro, a tabela está OK
SELECT 'compliance_requisitos_abbott: ✅ Inserção OK' as resultado;

ROLLBACK;

-- ✅ Se executou sem erro: Tabela funcional!
-- ❌ Se erro: Ver mensagem para diagnosticar


-- ============================================================================
-- 8. VERIFICAR SE TABELAS ESTÃO VAZIAS (ESPERADO)
-- ============================================================================

SELECT 
  'consignacao_materiais' as tabela,
  COUNT(*) as registros
FROM consignacao_materiais
UNION ALL
SELECT 
  'produtos_opme',
  COUNT(*)
FROM produtos_opme
UNION ALL
SELECT 
  'rastreabilidade_opme',
  COUNT(*)
FROM rastreabilidade_opme
UNION ALL
SELECT 
  'compliance_requisitos_abbott',
  COUNT(*)
FROM compliance_requisitos_abbott;

-- ✅ Esperado: Todas com 0 registros (tabelas recém-criadas)


-- ============================================================================
-- 9. VERIFICAR PERMISSÕES RLS (NÃO IMPLEMENTADAS AINDA)
-- ============================================================================

SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
);

-- ⚠️  RLS ainda não foi implementado (ver documentação 3.4-rls-documentation.md)
-- Esperado: rls_habilitado = false para todas


-- ============================================================================
-- 10. RESUMO FINAL - TUDO EM UMA QUERY
-- ============================================================================

SELECT 
  t.table_name as tabela,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = t.table_name 
   AND table_schema = 'public') as colunas,
  (SELECT COUNT(*) 
   FROM information_schema.table_constraints 
   WHERE table_name = t.table_name 
   AND table_schema = 'public'
   AND constraint_type = 'FOREIGN KEY') as foreign_keys,
  (SELECT COUNT(*) 
   FROM pg_indexes 
   WHERE tablename = t.table_name 
   AND schemaname = 'public') as indices,
  (SELECT COUNT(*) 
   FROM information_schema.table_constraints 
   WHERE table_name = t.table_name 
   AND table_schema = 'public'
   AND constraint_type = 'CHECK') as checks,
  (SELECT COUNT(*) 
   FROM information_schema.table_constraints 
   WHERE table_name = t.table_name 
   AND table_schema = 'public'
   AND constraint_type = 'UNIQUE') as uniques
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
ORDER BY t.table_name;

-- ✅ Resultado esperado:
-- consignacao_materiais:        32 cols, 7 FKs, 7 índices, 5 checks, 1 unique
-- produtos_opme:                 48 cols, 3 FKs, 7 índices, 4 checks, 2 uniques
-- rastreabilidade_opme:          46 cols, 10 FKs, 9 índices, 4 checks, 1 unique
-- compliance_requisitos_abbott:  42 cols, 3 FKs, 8 índices, 5 checks, 1 unique


-- ============================================================================
-- FIM DAS VALIDAÇÕES
-- ============================================================================

-- ✅ Se todas as queries retornaram os resultados esperados: SUCESSO COMPLETO!
-- ⚠️  Se algumas discrepâncias: Ver documentação para troubleshooting
-- ❌ Se erros graves: Rever aplicação da migration

-- Documentação completa em:
-- .cursor/agents/03-backend/COMO_APLICAR_MIGRATION.md

