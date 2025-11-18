-- Migration: Performance Indexes - Critical Tables
-- Data: 2025-10-28
-- Objetivo: Criar índices otimizados para tabelas de alto tráfego
-- Conformidade: Supabase Advisor Performance Issues (parte 1/3)
-- Documentação: docs/performance/indexes.md

-- ============================================
-- ÍNDICES PARA CIRURGIAS
-- ============================================
-- Queries típicas: filtro por empresa + status + data

-- Índice composto para queries de listagem
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_empresa_status_data 
  ON public.cirurgias(empresa_id, status, data_agendada DESC) 
  WHERE status IN ('agendada', 'em_andamento', 'preparacao');

-- Índice para busca por médico
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_medico_data 
  ON public.cirurgias(medico_id, data_agendada DESC) 
  WHERE status != 'cancelada';

-- Índice para busca por hospital
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_hospital_data 
  ON public.cirurgias(hospital_id, data_agendada DESC);

-- Índice para busca por paciente
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_paciente 
  ON public.cirurgias(paciente_id, data_agendada DESC);

-- Índice GIN para JSONB (equipe_medica)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_equipe_gin 
  ON public.cirurgias USING gin(equipe_medica);

-- Índice para queries de estatísticas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_stats 
  ON public.cirurgias(empresa_id, status, data_agendada) 
  INCLUDE (duracao_estimada, valor_total);

COMMENT ON INDEX idx_cirurgias_empresa_status_data IS 'Índice otimizado para listagem de cirurgias por empresa e status';
COMMENT ON INDEX idx_cirurgias_equipe_gin IS 'Índice GIN para busca em equipe_medica (JSONB)';

-- ============================================
-- ÍNDICES PARA ESTOQUE
-- ============================================
-- Queries típicas: filtro por empresa + produto + armazém

-- Índice composto para queries de saldo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_empresa_produto_armazem 
  ON public.estoque(empresa_id, produto_id, armazem_id) 
  WHERE quantidade_disponivel > 0;

-- Índice para alertas de validade
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_validade 
  ON public.estoque(empresa_id, validade) 
  WHERE validade IS NOT NULL 
    AND validade BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '90 days');

-- Índice para controle de lotes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_lote 
  ON public.estoque(produto_id, lote) 
  WHERE lote IS NOT NULL;

-- Índice para movimentações recentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_movimentacoes 
  ON public.estoque_movimentacoes(empresa_id, created_at DESC) 
  INCLUDE (tipo, quantidade, produto_id);

-- Índice para ABC/XYZ analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_valor_total 
  ON public.estoque(empresa_id, (quantidade * custo_unitario) DESC);

COMMENT ON INDEX idx_estoque_validade IS 'Índice para alertas de produtos próximos ao vencimento';
COMMENT ON INDEX idx_estoque_valor_total IS 'Índice para análise ABC (valor total em estoque)';

-- ============================================
-- ÍNDICES PARA CONTAS A RECEBER
-- ============================================
-- Queries típicas: vencimento + status + cliente

-- Índice para aging (vencimento)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_receber_empresa_vencimento 
  ON public.contas_receber(empresa_id, data_vencimento DESC) 
  WHERE status IN ('aberta', 'vencida');

-- Índice para inadimplência
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_receber_inadimplencia 
  ON public.contas_receber(empresa_id, status, inadimplencia_score DESC) 
  WHERE status = 'vencida';

-- Índice para clientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_receber_cliente 
  ON public.contas_receber(cliente_id, status, data_vencimento);

-- Índice para fluxo de caixa (previsão de recebimentos)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_receber_fluxo 
  ON public.contas_receber(empresa_id, data_vencimento) 
  INCLUDE (valor_original, valor_pago, status);

-- Índice para estatísticas financeiras
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_receber_stats 
  ON public.contas_receber(empresa_id, DATE_TRUNC('month', data_emissao));

COMMENT ON INDEX idx_contas_receber_inadimplencia IS 'Índice para análise de inadimplência com score';
COMMENT ON INDEX idx_contas_receber_fluxo IS 'Índice otimizado para projeções de fluxo de caixa';

-- ============================================
-- ÍNDICES PARA CONTAS A PAGAR
-- ============================================
-- Queries típicas: vencimento + status + fornecedor

-- Índice para pagamentos pendentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_pagar_empresa_vencimento 
  ON public.contas_pagar(empresa_id, data_vencimento) 
  WHERE status IN ('aberta', 'vencida');

-- Índice para fornecedores
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_pagar_fornecedor 
  ON public.contas_pagar(fornecedor_id, status, data_vencimento);

-- Índice para centro de custos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_pagar_centro_custo 
  ON public.contas_pagar(centro_custo_id, data_vencimento) 
  WHERE status != 'cancelada';

COMMENT ON INDEX idx_contas_pagar_centro_custo IS 'Índice para análise de despesas por centro de custo';

-- ============================================
-- ÍNDICES PARA CONSIGNAÇÃO
-- ============================================
-- Queries típicas: hospital + status + validade

-- Índice para materiais por hospital
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consignacao_materiais_hospital_status 
  ON public.consignacao_materiais(hospital_id, status, validade);

-- Índice para alertas de validade
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consignacao_validade 
  ON public.consignacao_materiais(empresa_id, validade) 
  WHERE status = 'disponivel' 
    AND validade BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '60 days');

-- Índice para rotatividade (dias em estoque)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consignacao_rotatividade 
  ON public.consignacao_materiais(empresa_id, dias_estoque DESC, rotatividade);

-- Índice para faturamento pendente
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consignacao_faturamento 
  ON public.consignacao_materiais(hospital_id, status) 
  WHERE status = 'utilizado' 
  INCLUDE (valor_total, quantidade);

-- Índice para custo de carregamento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consignacao_custo 
  ON public.consignacao_materiais(empresa_id, custo_carregamento DESC) 
  WHERE status IN ('disponivel', 'reservado');

COMMENT ON INDEX idx_consignacao_rotatividade IS 'Índice para análise de rotatividade e dias em estoque';
COMMENT ON INDEX idx_consignacao_custo IS 'Índice para análise de custos de carregamento';

-- ============================================
-- ÍNDICES PARA PRODUTOS/MATERIAIS OPME
-- ============================================
-- Queries típicas: busca por código + categoria

-- Índice para busca por código/SKU
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_codigo 
  ON public.produtos(UPPER(codigo_interno)) 
  WHERE ativo = TRUE;

-- Índice para busca por nome (case-insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_nome_trgm 
  ON public.produtos USING gin(LOWER(nome) gin_trgm_ops);

-- Índice para categoria
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_categoria 
  ON public.produtos(categoria, subcategoria) 
  WHERE ativo = TRUE;

-- Índice para fabricante
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_fabricante 
  ON public.produtos(fabricante_id, ativo);

-- Índice GIN para busca full-text
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_fulltext 
  ON public.produtos USING gin(
    to_tsvector('portuguese', COALESCE(nome, '') || ' ' || COALESCE(descricao, ''))
  );

COMMENT ON INDEX idx_produtos_nome_trgm IS 'Índice trigram para busca fuzzy no nome do produto';
COMMENT ON INDEX idx_produtos_fulltext IS 'Índice full-text para busca avançada (português)';

-- ============================================
-- ÍNDICES PARA MÉDICOS/HOSPITAIS/PACIENTES
-- ============================================

-- Médicos: busca por CRM e nome
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_crm 
  ON public.medicos(crm, crm_uf) 
  WHERE ativo = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_nome_trgm 
  ON public.medicos USING gin(LOWER(nome) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_especialidade 
  ON public.medicos(especialidade) 
  WHERE ativo = TRUE;

-- Hospitais: busca por CNPJ e nome
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hospitais_cnpj 
  ON public.hospitais(cnpj) 
  WHERE ativo = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hospitais_nome_trgm 
  ON public.hospitais USING gin(LOWER(nome) gin_trgm_ops);

-- Pacientes: busca por CPF e nome
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_cpf 
  ON public.pacientes(cpf) 
  WHERE ativo = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_nome_trgm 
  ON public.pacientes USING gin(LOWER(nome_completo) gin_trgm_ops);

COMMENT ON INDEX idx_medicos_nome_trgm IS 'Índice trigram para busca fuzzy no nome do médico';
COMMENT ON INDEX idx_hospitais_nome_trgm IS 'Índice trigram para busca fuzzy no nome do hospital';
COMMENT ON INDEX idx_pacientes_nome_trgm IS 'Índice trigram para busca fuzzy no nome do paciente';

-- ============================================
-- ÍNDICES PARA PROFILES (USUÁRIOS)
-- ============================================

-- Busca por empresa (RLS)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_empresa 
  ON public.profiles(empresa_id) 
  WHERE ativo = TRUE;

-- Busca por email
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email 
  ON public.profiles(LOWER(email));

-- Busca por role (RBAC)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role 
  ON public.profiles(role, empresa_id) 
  WHERE ativo = TRUE;

COMMENT ON INDEX idx_profiles_empresa IS 'Índice otimizado para RLS (filtros por empresa)';

-- ============================================
-- ÍNDICES PARA EMPRESAS
-- ============================================

-- Busca por CNPJ
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_empresas_cnpj 
  ON public.empresas(cnpj) 
  WHERE ativo = TRUE;

-- Busca por nome/razão social
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_empresas_nome_trgm 
  ON public.empresas USING gin(LOWER(razao_social) gin_trgm_ops);

COMMENT ON INDEX idx_empresas_nome_trgm IS 'Índice trigram para busca fuzzy na razão social';

-- ============================================
-- HABILITANDO EXTENSÃO PG_TRGM (se ainda não habilitada)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- STATISTICS UPDATE
-- ============================================
-- Atualizar estatísticas do planner para otimizar queries
ANALYZE public.cirurgias;
ANALYZE public.estoque;
ANALYZE public.contas_receber;
ANALYZE public.contas_pagar;
ANALYZE public.consignacao_materiais;
ANALYZE public.produtos;
ANALYZE public.medicos;
ANALYZE public.hospitais;
ANALYZE public.pacientes;
ANALYZE public.profiles;
ANALYZE public.empresas;

-- ============================================
-- AUDITORIA & VALIDAÇÃO
-- ============================================

-- Verificar índices criados
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexname LIKE 'idx_%'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- Success: ~35 índices críticos criados
-- Tabelas cobertas:
-- - cirurgias (6 índices)
-- - estoque (5 índices)
-- - contas_receber (5 índices)
-- - contas_pagar (3 índices)
-- - consignacao_materiais (5 índices)
-- - produtos (5 índices)
-- - médicos/hospitais/pacientes (6 índices)
-- - profiles/empresas (5 índices)

