-- Migration: Criar Views Materializadas para Performance
-- Gerado por: Agente 03 - Passo 4
-- Data: 2025-10-25
-- Descrição: Cria views materializadas para otimizar queries frequentes

-- ============================================================================
-- VIEW 1: mv_dashboard_kpis
-- Descrição: KPIs principais do dashboard por empresa
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_dashboard_kpis CASCADE;
CREATE MATERIALIZED VIEW public.mv_dashboard_kpis AS
SELECT 
  e.id as empresa_id,
  e.nome as empresa_nome,
  
  -- Cirurgias
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_mes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_finalizadas_mes,
  COALESCE(SUM(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days'), 0) as faturamento_mes,
  
  -- Estoque
  COUNT(DISTINCT e2.produto_id) FILTER (WHERE e2.quantidade < p.estoque_minimo) as produtos_estoque_baixo,
  COUNT(DISTINCT e2.produto_id) FILTER (WHERE e2.quantidade = 0) as produtos_sem_estoque,
  
  -- Compliance
  AVG((cr.pontos_obtidos / NULLIF(cr.pontos_possiveis, 0)) * 100) FILTER (WHERE cr.ativo AND NOT cr.dispensado) as compliance_score,
  
  -- Financeiro
  COALESCE(SUM(cr2.valor) FILTER (WHERE cr2.status = 'PENDENTE' AND cr2.data_vencimento < CURRENT_DATE), 0) as contas_vencidas,
  
  -- Atualizado em
  NOW() as atualizado_em

FROM public.empresas e
LEFT JOIN public.cirurgias c ON e.id = c.empresa_id
LEFT JOIN public.estoque e2 ON e.id = e2.empresa_id
LEFT JOIN public.produtos p ON e2.produto_id = p.id
LEFT JOIN public.compliance_requisitos_abbott cr ON e.id = cr.empresa_id
LEFT JOIN public.contas_receber cr2 ON e.id = cr2.empresa_id
WHERE e.ativa = true
GROUP BY e.id, e.nome;

CREATE UNIQUE INDEX idx_mv_dashboard_kpis_empresa ON public.mv_dashboard_kpis(empresa_id);

COMMENT ON MATERIALIZED VIEW public.mv_dashboard_kpis IS 
  'KPIs principais para dashboard - Atualizar a cada 5 minutos';


-- ============================================================================
-- VIEW 2: mv_cirurgias_stats
-- Descrição: Estatísticas de cirurgias por empresa/período
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_cirurgias_stats CASCADE;
CREATE MATERIALIZED VIEW public.mv_cirurgias_stats AS
SELECT 
  empresa_id,
  date_trunc('month', data_cirurgia) as mes,
  
  COUNT(*) as total_cirurgias,
  COUNT(*) FILTER (WHERE status = 'FINALIZADA') as finalizadas,
  COUNT(*) FILTER (WHERE status = 'CANCELADA') as canceladas,
  
  COALESCE(SUM(valor_total) FILTER (WHERE status = 'FINALIZADA'), 0) as valor_total,
  COALESCE(AVG(valor_total) FILTER (WHERE status = 'FINALIZADA'), 0) as valor_medio,
  
  COUNT(DISTINCT medico_id) as total_medicos,
  COUNT(DISTINCT hospital_id) as total_hospitais,
  COUNT(DISTINCT paciente_id) as total_pacientes,
  
  NOW() as atualizado_em

FROM public.cirurgias
WHERE data_cirurgia >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY empresa_id, date_trunc('month', data_cirurgia);

CREATE INDEX idx_mv_cirurgias_stats_empresa_mes ON public.mv_cirurgias_stats(empresa_id, mes);

COMMENT ON MATERIALIZED VIEW public.mv_cirurgias_stats IS 
  'Estatísticas mensais de cirurgias - Atualizar diariamente';


-- ============================================================================
-- VIEW 3: mv_produtos_top
-- Descrição: Top produtos mais utilizados
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_produtos_top CASCADE;
CREATE MATERIALIZED VIEW public.mv_produtos_top AS
SELECT 
  p.empresa_id,
  p.id as produto_id,
  p.codigo,
  p.nome,
  p.categoria,
  
  COUNT(DISTINCT ic.cirurgia_id) as numero_cirurgias,
  SUM(ic.quantidade) as quantidade_total,
  SUM(ic.quantidade * ic.valor_unitario) as valor_total,
  AVG(ic.valor_unitario) as valor_medio_unitario,
  
  MAX(c.data_cirurgia) as ultima_utilizacao,
  
  NOW() as atualizado_em

FROM public.produtos p
INNER JOIN public.itens_cirurgia ic ON p.id = ic.produto_id
INNER JOIN public.cirurgias c ON ic.cirurgia_id = c.id
WHERE c.status = 'FINALIZADA'
  AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.empresa_id, p.id, p.codigo, p.nome, p.categoria;

CREATE INDEX idx_mv_produtos_top_empresa ON public.mv_produtos_top(empresa_id);
CREATE INDEX idx_mv_produtos_top_quantidade ON public.mv_produtos_top(quantidade_total DESC);

COMMENT ON MATERIALIZED VIEW public.mv_produtos_top IS 
  'Top produtos utilizados nos últimos 90 dias - Atualizar diariamente';


-- ============================================================================
-- VIEW 4: mv_compliance_score
-- Descrição: Scores de compliance por empresa e categoria
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_compliance_score CASCADE;
CREATE MATERIALIZED VIEW public.mv_compliance_score AS
SELECT 
  empresa_id,
  categoria,
  
  COUNT(*) as total_requisitos,
  COUNT(*) FILTER (WHERE status = 'CONFORME') as requisitos_conformes,
  COUNT(*) FILTER (WHERE status = 'NAO_CONFORME') as requisitos_nao_conformes,
  COUNT(*) FILTER (WHERE status = 'EM_ADEQUACAO') as requisitos_em_adequacao,
  
  SUM(pontos_possiveis * peso_calculo) as pontos_possiveis_total,
  SUM(pontos_obtidos * peso_calculo) as pontos_obtidos_total,
  
  ROUND((SUM(pontos_obtidos * peso_calculo) / NULLIF(SUM(pontos_possiveis * peso_calculo), 0)) * 100, 2) as score_percentual,
  
  MIN(data_proxima_avaliacao) FILTER (WHERE data_proxima_avaliacao >= CURRENT_DATE) as proxima_avaliacao,
  
  NOW() as atualizado_em

FROM public.compliance_requisitos_abbott
WHERE ativo = true
  AND NOT dispensado
GROUP BY empresa_id, categoria;

CREATE INDEX idx_mv_compliance_score_empresa ON public.mv_compliance_score(empresa_id);
CREATE INDEX idx_mv_compliance_score_categoria ON public.mv_compliance_score(categoria);

COMMENT ON MATERIALIZED VIEW public.mv_compliance_score IS 
  'Scores de compliance por categoria - Atualizar a cada hora';


-- ============================================================================
-- VIEW 5: mv_estoque_status
-- Descrição: Status consolidado de estoque
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_estoque_status CASCADE;
CREATE MATERIALIZED VIEW public.mv_estoque_status AS
SELECT 
  p.empresa_id,
  p.id as produto_id,
  p.codigo,
  p.nome,
  p.categoria,
  
  COALESCE(e.quantidade, 0) as estoque_atual,
  p.estoque_minimo,
  p.estoque_maximo,
  p.ponto_reposicao,
  
  CASE 
    WHEN COALESCE(e.quantidade, 0) = 0 THEN 'SEM_ESTOQUE'
    WHEN COALESCE(e.quantidade, 0) < p.estoque_minimo THEN 'BAIXO'
    WHEN COALESCE(e.quantidade, 0) > p.estoque_maximo THEN 'EXCESSO'
    ELSE 'NORMAL'
  END as status_estoque,
  
  CASE 
    WHEN COALESCE(e.quantidade, 0) = 0 THEN 'CRITICO'
    WHEN COALESCE(e.quantidade, 0) < (p.estoque_minimo * 0.5) THEN 'ALTO'
    WHEN COALESCE(e.quantidade, 0) < p.estoque_minimo THEN 'MEDIO'
    ELSE 'BAIXO'
  END as nivel_criticidade,
  
  p.valor_compra,
  COALESCE(e.quantidade, 0) * p.valor_compra as valor_estoque,
  
  e.atualizado_em as estoque_atualizado_em,
  NOW() as calculado_em

FROM public.produtos p
LEFT JOIN public.estoque e ON p.id = e.produto_id AND p.empresa_id = e.empresa_id
WHERE p.ativo = true;

CREATE INDEX idx_mv_estoque_status_empresa ON public.mv_estoque_status(empresa_id);
CREATE INDEX idx_mv_estoque_status_criticidade ON public.mv_estoque_status(nivel_criticidade);
CREATE INDEX idx_mv_estoque_status_status ON public.mv_estoque_status(status_estoque);

COMMENT ON MATERIALIZED VIEW public.mv_estoque_status IS 
  'Status consolidado de estoque com criticidade - Atualizar a cada 15 minutos';


-- ============================================================================
-- VIEW 6: mv_financeiro_resumo
-- Descrição: Resumo financeiro mensal
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_financeiro_resumo CASCADE;
CREATE MATERIALIZED VIEW public.mv_financeiro_resumo AS
WITH receitas AS (
  SELECT 
    empresa_id,
    date_trunc('month', data_vencimento) as mes,
    SUM(valor) as total_receitas,
    SUM(valor) FILTER (WHERE status = 'RECEBIDO') as receitas_recebidas,
    SUM(valor) FILTER (WHERE status = 'PENDENTE') as receitas_pendentes,
    SUM(valor) FILTER (WHERE status = 'PENDENTE' AND data_vencimento < CURRENT_DATE) as receitas_vencidas
  FROM public.contas_receber
  WHERE data_vencimento >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY empresa_id, date_trunc('month', data_vencimento)
),
despesas AS (
  SELECT 
    empresa_id,
    date_trunc('month', data_vencimento) as mes,
    SUM(valor) as total_despesas,
    SUM(valor) FILTER (WHERE status = 'PAGO') as despesas_pagas,
    SUM(valor) FILTER (WHERE status = 'PENDENTE') as despesas_pendentes,
    SUM(valor) FILTER (WHERE status = 'PENDENTE' AND data_vencimento < CURRENT_DATE) as despesas_vencidas
  FROM public.contas_pagar
  WHERE data_vencimento >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY empresa_id, date_trunc('month', data_vencimento)
)
SELECT 
  COALESCE(r.empresa_id, d.empresa_id) as empresa_id,
  COALESCE(r.mes, d.mes) as mes,
  
  COALESCE(r.total_receitas, 0) as total_receitas,
  COALESCE(r.receitas_recebidas, 0) as receitas_recebidas,
  COALESCE(r.receitas_pendentes, 0) as receitas_pendentes,
  COALESCE(r.receitas_vencidas, 0) as receitas_vencidas,
  
  COALESCE(d.total_despesas, 0) as total_despesas,
  COALESCE(d.despesas_pagas, 0) as despesas_pagas,
  COALESCE(d.despesas_pendentes, 0) as despesas_pendentes,
  COALESCE(d.despesas_vencidas, 0) as despesas_vencidas,
  
  COALESCE(r.receitas_recebidas, 0) - COALESCE(d.despesas_pagas, 0) as saldo_realizado,
  COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0) as saldo_previsto,
  
  NOW() as atualizado_em

FROM receitas r
FULL OUTER JOIN despesas d ON r.empresa_id = d.empresa_id AND r.mes = d.mes;

CREATE INDEX idx_mv_financeiro_resumo_empresa_mes ON public.mv_financeiro_resumo(empresa_id, mes);

COMMENT ON MATERIALIZED VIEW public.mv_financeiro_resumo IS 
  'Resumo financeiro mensal - Atualizar diariamente';


-- ============================================================================
-- VIEW 7: mv_rastreabilidade_resumo
-- Descrição: Resumo de rastreabilidade por produto OPME
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_rastreabilidade_resumo CASCADE;
CREATE MATERIALIZED VIEW public.mv_rastreabilidade_resumo AS
SELECT 
  po.empresa_id,
  po.id as produto_opme_id,
  po.codigo_interno,
  po.nome,
  po.codigo_anvisa,
  
  COUNT(r.id) as total_unidades,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'ESTOQUE') as em_estoque,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'CONSIGNACAO') as em_consignacao,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'EM_USO') as em_uso,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'UTILIZADO') as utilizados,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'DEVOLVIDO') as devolvidos,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'DESCARTADO') as descartados,
  
  COUNT(r.id) FILTER (WHERE r.possui_recall = true) as com_recall,
  COUNT(r.id) FILTER (WHERE r.em_quarentena = true) as em_quarentena,
  COUNT(r.id) FILTER (WHERE r.bloqueado = true) as bloqueados,
  
  MIN(r.data_validade) FILTER (WHERE r.localizacao_atual IN ('ESTOQUE', 'CONSIGNACAO')) as proxima_validade,
  
  NOW() as atualizado_em

FROM public.produtos_opme po
LEFT JOIN public.rastreabilidade_opme r ON po.id = r.produto_opme_id
WHERE po.ativo = true
GROUP BY po.empresa_id, po.id, po.codigo_interno, po.nome, po.codigo_anvisa;

CREATE INDEX idx_mv_rastreabilidade_resumo_empresa ON public.mv_rastreabilidade_resumo(empresa_id);
CREATE INDEX idx_mv_rastreabilidade_resumo_recall ON public.mv_rastreabilidade_resumo(com_recall) WHERE com_recall > 0;

COMMENT ON MATERIALIZED VIEW public.mv_rastreabilidade_resumo IS 
  'Resumo de rastreabilidade por produto OPME - Atualizar a cada hora';


-- ============================================================================
-- VIEW 8: mv_consignacao_stats
-- Descrição: Estatísticas de consignação
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_consignacao_stats CASCADE;
CREATE MATERIALIZED VIEW public.mv_consignacao_stats AS
SELECT 
  empresa_id,
  date_trunc('month', data_consignacao) as mes,
  tipo_consignacao,
  status,
  
  COUNT(*) as total_consignacoes,
  SUM(quantidade) as quantidade_total,
  SUM(quantidade * valor_unitario) as valor_total,
  AVG(valor_unitario) as valor_medio_unitario,
  
  COUNT(DISTINCT hospital_id) as total_hospitais,
  COUNT(DISTINCT fornecedor_id) as total_fornecedores,
  COUNT(DISTINCT produto_id) as total_produtos,
  
  NOW() as atualizado_em

FROM public.consignacao_materiais
WHERE data_consignacao >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY empresa_id, date_trunc('month', data_consignacao), tipo_consignacao, status;

CREATE INDEX idx_mv_consignacao_stats_empresa_mes ON public.mv_consignacao_stats(empresa_id, mes);

COMMENT ON MATERIALIZED VIEW public.mv_consignacao_stats IS 
  'Estatísticas mensais de consignação - Atualizar diariamente';


-- ============================================================================
-- VIEW 9: mv_medicos_performance
-- Descrição: Performance de médicos
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_medicos_performance CASCADE;
CREATE MATERIALIZED VIEW public.mv_medicos_performance AS
SELECT 
  m.empresa_id,
  m.id as medico_id,
  m.nome,
  m.crm,
  m.especialidade,
  
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days') as cirurgias_90_dias,
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_30_dias,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'FINALIZADA') as cirurgias_finalizadas,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'CANCELADA') as cirurgias_canceladas,
  
  COALESCE(SUM(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'), 0) as faturamento_90_dias,
  COALESCE(AVG(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA'), 0) as ticket_medio,
  
  COUNT(DISTINCT c.hospital_id) as total_hospitais,
  COUNT(DISTINCT c.paciente_id) as total_pacientes,
  
  MAX(c.data_cirurgia) as ultima_cirurgia,
  
  NOW() as atualizado_em

FROM public.medicos m
LEFT JOIN public.cirurgias c ON m.id = c.medico_id
WHERE m.ativo = true
GROUP BY m.empresa_id, m.id, m.nome, m.crm, m.especialidade;

CREATE INDEX idx_mv_medicos_performance_empresa ON public.mv_medicos_performance(empresa_id);
CREATE INDEX idx_mv_medicos_performance_cirurgias ON public.mv_medicos_performance(cirurgias_90_dias DESC);

COMMENT ON MATERIALIZED VIEW public.mv_medicos_performance IS 
  'Performance de médicos - Atualizar diariamente';


-- ============================================================================
-- VIEW 10: mv_hospitais_stats
-- Descrição: Estatísticas por hospital
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_hospitais_stats CASCADE;
CREATE MATERIALIZED VIEW public.mv_hospitais_stats AS
SELECT 
  h.empresa_id,
  h.id as hospital_id,
  h.nome,
  h.cnpj,
  h.cidade,
  h.estado,
  
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days') as cirurgias_90_dias,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'FINALIZADA') as cirurgias_finalizadas,
  
  COALESCE(SUM(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 dias'), 0) as faturamento_90_dias,
  
  COUNT(DISTINCT c.medico_id) as total_medicos,
  COUNT(DISTINCT c.paciente_id) as total_pacientes,
  
  COUNT(DISTINCT cm.id) FILTER (WHERE cm.data_consignacao >= CURRENT_DATE - INTERVAL '90 days') as consignacoes_90_dias,
  
  MAX(c.data_cirurgia) as ultima_cirurgia,
  
  NOW() as atualizado_em

FROM public.hospitais h
LEFT JOIN public.cirurgias c ON h.id = c.hospital_id
LEFT JOIN public.consignacao_materiais cm ON h.id = cm.hospital_id
WHERE h.ativo = true
GROUP BY h.empresa_id, h.id, h.nome, h.cnpj, h.cidade, h.estado;

CREATE INDEX idx_mv_hospitais_stats_empresa ON public.mv_hospitais_stats(empresa_id);
CREATE INDEX idx_mv_hospitais_stats_cirurgias ON public.mv_hospitais_stats(cirurgias_90_dias DESC);

COMMENT ON MATERIALIZED VIEW public.mv_hospitais_stats IS 
  'Estatísticas por hospital - Atualizar diariamente';


-- ============================================================================
-- FUNÇÃO PARA REFRESH AUTOMÁTICO
-- ============================================================================
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_dashboard_kpis;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cirurgias_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_produtos_top;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_compliance_score;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_estoque_status;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_financeiro_resumo;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_rastreabilidade_resumo;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_consignacao_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_medicos_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_hospitais_stats;
  
  RAISE NOTICE 'Todas as materialized views foram atualizadas em %', NOW();
END;
$$;

COMMENT ON FUNCTION public.refresh_materialized_views IS 
  'Atualiza todas as materialized views - Executar via cron/scheduler';


-- ============================================================================
-- FIM DA MIGRATION - 10 VIEWS MATERIALIZADAS CRIADAS
-- ============================================================================

-- Para atualizar todas as views, execute:
-- SELECT public.refresh_materialized_views();

-- Recomenda-se agendar refresh automático:
-- - Críticas (dashboard_kpis, estoque_status): a cada 5-15 minutos
-- - Importantes (compliance, rastreabilidade): a cada hora
-- - Estatísticas (cirurgias, financeiro, etc): diariamente

