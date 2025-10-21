-- Migration: Views Dashboard KPIs - Domínio Cirurgias
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

-- ======================================
-- VIEW MATERIALIZADA: Dashboard KPIs
-- ======================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_dashboard_kpis AS
SELECT
  c.empresa_id,
  DATE_TRUNC('month', c.data_agendada) AS periodo,
  
  -- Contadores
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END) AS cirurgias_concluidas,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'cancelada' THEN c.id END) AS cirurgias_canceladas,
  COUNT(DISTINCT c.medico_id) AS medicos_ativos,
  COUNT(DISTINCT c.hospital_id) AS hospitais_ativos,
  
  -- Materiais
  COUNT(DISTINCT cm.material_id) AS materiais_distintos,
  SUM(cm.quantidade) AS total_itens_utilizados,
  
  -- Valores (estimativa)
  SUM(m.custo * cm.quantidade) AS custo_total_estimado,
  SUM(m.preco * cm.quantidade) AS receita_total_estimada,
  SUM((m.preco - m.custo) * cm.quantidade) AS margem_total_estimada,
  
  -- Tempos
  AVG(c.duracao_estimada_min) AS duracao_media_min,
  
  -- Metadados
  NOW() AS refreshed_at
FROM public.cirurgias c
LEFT JOIN public.cirurgia_materiais cm ON cm.cirurgia_id = c.id
LEFT JOIN public.materiais m ON m.id = cm.material_id
GROUP BY c.empresa_id, DATE_TRUNC('month', c.data_agendada);

CREATE UNIQUE INDEX IF NOT EXISTS vw_dashboard_kpis_pkey ON public.vw_dashboard_kpis(empresa_id, periodo);
CREATE INDEX IF NOT EXISTS vw_dashboard_kpis_periodo_idx ON public.vw_dashboard_kpis(periodo DESC);

COMMENT ON MATERIALIZED VIEW public.vw_dashboard_kpis IS 'KPIs agregados por empresa e período (refreshar a cada 15min)';

-- ======================================
-- VIEW: Cirurgias Próximas (7 dias)
-- ======================================

CREATE OR REPLACE VIEW public.vw_cirurgias_proximas AS
SELECT
  c.id,
  c.empresa_id,
  c.data_agendada,
  c.status_cirurgia,
  c.sala,
  c.observacoes,
  
  -- Paciente
  p.nome AS paciente_nome,
  p.cpf AS paciente_cpf,
  
  -- Médico
  m.nome AS medico_nome,
  m.crm AS medico_crm,
  m.especialidade AS medico_especialidade,
  
  -- Hospital
  h.nome AS hospital_nome,
  h.cidade AS hospital_cidade,
  
  -- Convênio
  cv.nome AS convenio_nome,
  
  -- Materiais
  (
    SELECT COUNT(*)
    FROM public.cirurgia_materiais cm
    WHERE cm.cirurgia_id = c.id
  ) AS total_materiais,
  
  (
    SELECT COUNT(*)
    FROM public.cirurgia_materiais cm
    WHERE cm.cirurgia_id = c.id AND cm.status_item = 'separado'
  ) AS materiais_separados
FROM public.cirurgias c
INNER JOIN public.pacientes p ON p.id = c.paciente_id
INNER JOIN public.medicos m ON m.id = c.medico_id
INNER JOIN public.hospitais h ON h.id = c.hospital_id
LEFT JOIN public.convenios cv ON cv.id = c.convenio_id
WHERE c.data_agendada BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  AND c.status_cirurgia NOT IN ('cancelada', 'concluida')
ORDER BY c.data_agendada ASC;

COMMENT ON VIEW public.vw_cirurgias_proximas IS 'Cirurgias agendadas nos próximos 7 dias';

-- ======================================
-- VIEW: Kit Detalhado por Cirurgia
-- ======================================

CREATE OR REPLACE VIEW public.vw_cirurgia_kit_detalhado AS
SELECT
  c.id AS cirurgia_id,
  c.empresa_id,
  c.data_agendada,
  c.status_cirurgia,
  
  -- Material
  cm.id AS item_id,
  cm.quantidade,
  cm.lote,
  cm.validade,
  cm.status_item,
  
  m.codigo_interno AS material_codigo,
  m.descricao AS material_descricao,
  m.registro_anvisa,
  m.fabricante,
  m.custo AS material_custo,
  m.preco AS material_preco,
  
  -- Valores
  (m.custo * cm.quantidade) AS custo_total,
  (m.preco * cm.quantidade) AS preco_total,
  ((m.preco - m.custo) * cm.quantidade) AS margem_total
FROM public.cirurgias c
INNER JOIN public.cirurgia_materiais cm ON cm.cirurgia_id = c.id
INNER JOIN public.materiais m ON m.id = cm.material_id;

COMMENT ON VIEW public.vw_cirurgia_kit_detalhado IS 'Detalhamento completo do kit de materiais por cirurgia';
