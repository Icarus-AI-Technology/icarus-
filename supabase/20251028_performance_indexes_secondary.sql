-- Migration: Performance Indexes - Secondary & BRIN
-- Data: 2025-10-28
-- Objetivo: Criar índices secundários, BRIN para timestamps e otimizações específicas
-- Conformidade: Supabase Advisor Performance Issues (parte 2/3)
-- Documentação: docs/performance/indexes-advanced.md

-- ============================================
-- ÍNDICES BRIN PARA TIMESTAMPS (Tabelas Grandes)
-- ============================================
-- BRIN (Block Range Index) é ideal para colunas timestamp em tabelas grandes
-- Usa muito menos espaço que B-Tree e é eficiente para range scans

-- Cirurgias: BRIN em created_at e data_agendada
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_created_at_brin 
  ON public.cirurgias USING brin(created_at) 
  WITH (pages_per_range = 128);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_data_agendada_brin 
  ON public.cirurgias USING brin(data_agendada) 
  WITH (pages_per_range = 128);

-- Estoque Movimentações: BRIN em created_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_movimentacoes_created_brin 
  ON public.estoque_movimentacoes USING brin(created_at) 
  WITH (pages_per_range = 128);

-- Contas a Receber/Pagar: BRIN em data_emissao
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_receber_emissao_brin 
  ON public.contas_receber USING brin(data_emissao) 
  WITH (pages_per_range = 128);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contas_pagar_emissao_brin 
  ON public.contas_pagar USING brin(data_emissao) 
  WITH (pages_per_range = 128);

-- Audit Logs: BRIN para performance em queries históricas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp_brin 
  ON public.audit_logs USING brin(timestamp) 
  WITH (pages_per_range = 128);

COMMENT ON INDEX idx_cirurgias_created_at_brin IS 'BRIN index para queries históricas (range scans)';
COMMENT ON INDEX idx_audit_logs_timestamp_brin IS 'BRIN index para logs de auditoria (ideal para tabelas grandes)';

-- ============================================
-- ÍNDICES PARCIAIS PARA QUERIES ESPECÍFICAS
-- ============================================

-- Cirurgias: Índice para cirurgias futuras (próximos 30 dias)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_proximas 
  ON public.cirurgias(empresa_id, data_agendada) 
  WHERE status IN ('agendada', 'confirmada') 
    AND data_agendada BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days');

-- Estoque: Índice para produtos em ruptura (zero disponível)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_ruptura 
  ON public.estoque(empresa_id, produto_id) 
  WHERE quantidade_disponivel = 0 
    AND quantidade_reservada = 0;

-- Consignação: Índice para materiais aguardando conferência
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consignacao_conferencia_pendente 
  ON public.consignacao_materiais(hospital_id, ultima_conferencia) 
  WHERE status = 'disponivel' 
    AND (ultima_conferencia IS NULL OR ultima_conferencia < NOW() - INTERVAL '7 days');

-- Produtos: Índice para produtos descontinuados recentemente
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_descontinuados 
  ON public.produtos(empresa_id, data_descontinuacao) 
  WHERE ativo = FALSE 
    AND data_descontinuacao >= CURRENT_DATE - INTERVAL '180 days';

COMMENT ON INDEX idx_cirurgias_proximas IS 'Índice parcial para dashboard de cirurgias próximas';
COMMENT ON INDEX idx_consignacao_conferencia_pendente IS 'Índice para alertas de conferência de consignação';

-- ============================================
-- ÍNDICES COMPOSTOS PARA JOINS FREQUENTES
-- ============================================

-- Join cirurgias <-> cirurgia_materiais
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgia_materiais_cirurgia_produto 
  ON public.cirurgia_materiais(cirurgia_id, produto_id) 
  INCLUDE (quantidade, valor_unitario, utilizado);

-- Join estoque <-> estoque_localizacoes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estoque_armazem_localizacao 
  ON public.estoque(armazem_id, localizacao_id) 
  INCLUDE (produto_id, quantidade_disponivel);

-- Join contas_receber <-> faturas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_faturas_conta_receber 
  ON public.faturas(conta_receber_id) 
  INCLUDE (numero_nfe, valor_total, status);

-- Join usuarios <-> empresas (RLS optimization)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_auth_empresa 
  ON public.profiles(id, empresa_id) 
  WHERE ativo = TRUE;

COMMENT ON INDEX idx_cirurgia_materiais_cirurgia_produto IS 'Índice otimizado para join cirurgias + materiais';
COMMENT ON INDEX idx_profiles_auth_empresa IS 'Índice otimizado para RLS (auth.uid() → empresa_id)';

-- ============================================
-- ÍNDICES GIN PARA JSONB COLUMNS
-- ============================================

-- Cirurgias: equipe_medica (já criado em critical, mas adicionando comentário)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cirurgias_equipe_gin 
--   ON public.cirurgias USING gin(equipe_medica);

-- Produtos: especificacoes_tecnicas (JSONB)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_especificacoes_gin 
  ON public.produtos USING gin(especificacoes_tecnicas) 
  WHERE especificacoes_tecnicas IS NOT NULL;

-- Workflows: config (JSONB)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_config_gin 
  ON public.workflows USING gin(config) 
  WHERE config IS NOT NULL;

-- Integrações: configuracao (JSONB)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integracoes_config_gin 
  ON public.integracoes_externas USING gin(configuracao) 
  WHERE configuracao IS NOT NULL;

-- AI Insights: metadata (JSONB)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insights_metadata_gin 
  ON public.bi_ai_insights USING gin(metadata) 
  WHERE metadata IS NOT NULL;

COMMENT ON INDEX idx_produtos_especificacoes_gin IS 'Índice GIN para busca em especificações técnicas (JSONB)';
COMMENT ON INDEX idx_ai_insights_metadata_gin IS 'Índice GIN para metadados de insights IA';

-- ============================================
-- ÍNDICES PARA COMPLIANCE & AUDITORIA
-- ============================================

-- Rastreabilidade OPME: lote + numero_serie
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rastreabilidade_lote 
  ON public.compliance_rastreabilidade_opme(lote, numero_serie) 
  INCLUDE (produto_id, data_entrada, status);

-- Requisitos Abbott: código + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_abbott_codigo 
  ON public.compliance_requisitos_abbott(codigo, status) 
  INCLUDE (score_conformidade, data_ultima_auditoria);

-- Não conformidades: status + prioridade
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nao_conformidades_status_prioridade 
  ON public.compliance_nao_conformidades(empresa_id, status, prioridade) 
  WHERE status IN ('aberta', 'em_analise');

-- Audit Logs: empresa + tabela + acao
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_empresa_tabela 
  ON public.audit_logs(empresa_id, tabela, acao) 
  INCLUDE (usuario_id, timestamp);

COMMENT ON INDEX idx_rastreabilidade_lote IS 'Índice para rastreabilidade ANVISA por lote/série';
COMMENT ON INDEX idx_audit_logs_empresa_tabela IS 'Índice para queries de auditoria por empresa e tabela';

-- ============================================
-- ÍNDICES PARA BI & ANALYTICS
-- ============================================

-- Fato Cirurgias: data + médico + equipe
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bi_fato_cirurgias_data_medico 
  ON public.bi_fato_cirurgias(data_id, medico_id) 
  INCLUDE (duracao_min, custo_opme, receita_total, margem);

-- Fato Vendas: data + produto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bi_fato_vendas_data_produto 
  ON public.bi_fato_vendas(data_id, produto_id) 
  INCLUDE (quantidade, valor_total, margem);

-- Dimensão Tempo: data (covering index)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bi_dimensao_tempo_data 
  ON public.bi_dimensao_tempo(data) 
  INCLUDE (ano, mes, dia_semana, is_feriado);

-- AI Insights: empresa + status + prioridade
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bi_ai_insights_empresa_status 
  ON public.bi_ai_insights(empresa_id, status, prioridade) 
  INCLUDE (tipo_insight, agente_ia, confianca_ia);

COMMENT ON INDEX idx_bi_fato_cirurgias_data_medico IS 'Índice otimizado para queries BI (data + médico)';
COMMENT ON INDEX idx_bi_ai_insights_empresa_status IS 'Índice para dashboard CEO Intelligence';

-- ============================================
-- ÍNDICES PARA RELATÓRIOS & DASHBOARDS
-- ============================================

-- Métricas Dashboard: origem + data_referencia
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metricas_dashboard_origem_data 
  ON public.metricas_dashboard(origem, data_referencia DESC) 
  INCLUDE (valor);

-- Notificações: usuário + lida + created_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notificacoes_usuario_nao_lidas 
  ON public.notificacoes(usuario_id, created_at DESC) 
  WHERE lida = FALSE;

-- Alertas Estratégicos: empresa + severidade + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alertas_estrategicos_empresa 
  ON public.bi_alertas_estrategicos(empresa_id, severidade, status) 
  WHERE status = 'ABERTO';

COMMENT ON INDEX idx_notificacoes_usuario_nao_lidas IS 'Índice parcial para notificações não lidas';
COMMENT ON INDEX idx_alertas_estrategicos_empresa IS 'Índice para alertas estratégicos ativos';

-- ============================================
-- ÍNDICES PARA EDR (Enterprise Deep Research)
-- ============================================

-- Sessions: user + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edr_sessions_user_status 
  ON public.edr_research_sessions(user_id, status, created_at DESC);

-- Agent Tasks: session + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edr_tasks_session_status 
  ON public.edr_agent_tasks(session_id, status, created_at DESC);

-- Search Results: session + relevance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edr_search_relevance 
  ON public.edr_search_results(session_id, relevance_score DESC) 
  WHERE relevance_score >= 0.5;

COMMENT ON INDEX idx_edr_search_relevance IS 'Índice parcial para resultados relevantes (score >= 0.5)';

-- ============================================
-- ÍNDICES PARA WORKFLOW BUILDER
-- ============================================

-- Workflows: template + ativo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_template 
  ON public.workflows(is_template, is_ativo) 
  INCLUDE (nome, categoria);

-- Execuções: workflow + status + started_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_execucoes_workflow_status 
  ON public.workflow_execucoes(workflow_id, status, started_at DESC);

COMMENT ON INDEX idx_workflows_template IS 'Índice para listagem de templates de workflow';

-- ============================================
-- STATISTICS UPDATE
-- ============================================
-- Atualizar estatísticas após criação de índices
ANALYZE public.cirurgias;
ANALYZE public.estoque_movimentacoes;
ANALYZE public.contas_receber;
ANALYZE public.contas_pagar;
ANALYZE public.consignacao_materiais;
ANALYZE public.audit_logs;
ANALYZE public.bi_fato_cirurgias;
ANALYZE public.bi_ai_insights;
ANALYZE public.edr_research_sessions;
ANALYZE public.workflows;

-- ============================================
-- AUDITORIA & VALIDAÇÃO
-- ============================================

-- Verificar índices BRIN criados
-- SELECT 
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexdef LIKE '%USING brin%'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- Verificar índices parciais (WHERE clause)
-- SELECT 
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexdef LIKE '%WHERE%'
-- ORDER BY tablename, indexname;

-- Success: ~30 índices secundários criados
-- Categorias:
-- - BRIN (6 índices para timestamps)
-- - Parciais (4 índices com WHERE)
-- - Compostos para JOINs (4 índices)
-- - GIN para JSONB (5 índices)
-- - Compliance/Auditoria (4 índices)
-- - BI/Analytics (4 índices)
-- - Relatórios/Dashboards (3 índices)

