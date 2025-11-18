-- Migration: Functions RPC - Dashboard KPIs
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

-- ======================================
-- FUNCTION: get_dashboard_kpis
-- ======================================

CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(
  p_empresa_id UUID,
  p_periodo TEXT DEFAULT 'month' -- 'day', 'week', 'month', 'year'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_result JSON;
  v_data_inicio TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Definir período
  CASE p_periodo
    WHEN 'day' THEN
      v_data_inicio := DATE_TRUNC('day', NOW());
    WHEN 'week' THEN
      v_data_inicio := DATE_TRUNC('week', NOW());
    WHEN 'year' THEN
      v_data_inicio := DATE_TRUNC('year', NOW());
    ELSE -- 'month'
      v_data_inicio := DATE_TRUNC('month', NOW());
  END CASE;

  -- Buscar KPIs
  SELECT json_build_object(
    'periodo', p_periodo,
    'data_inicio', v_data_inicio,
    'data_fim', NOW(),
    'kpis', json_build_object(
      'total_cirurgias', COUNT(DISTINCT c.id),
      'cirurgias_concluidas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END),
      'cirurgias_em_andamento', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'em_andamento' THEN c.id END),
      'cirurgias_agendadas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'agendada' THEN c.id END),
      'cirurgias_canceladas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'cancelada' THEN c.id END),
      'taxa_conclusao', ROUND(
        (COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT c.id), 0) * 100), 2
      ),
      'medicos_ativos', COUNT(DISTINCT c.medico_id),
      'hospitais_ativos', COUNT(DISTINCT c.hospital_id),
      'duracao_media_min', ROUND(AVG(c.duracao_estimada_min), 0)
    )
  ) INTO v_result
  FROM public.cirurgias c
  WHERE c.empresa_id = p_empresa_id
    AND c.data_agendada >= v_data_inicio
    AND c.data_agendada <= NOW();

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_dashboard_kpis IS 'Retorna KPIs do dashboard para uma empresa em um período';

-- ======================================
-- FUNCTION: get_agenda_cirurgias
-- ======================================

CREATE OR REPLACE FUNCTION public.get_agenda_cirurgias(
  p_empresa_id UUID,
  p_data_inicio DATE DEFAULT CURRENT_DATE,
  p_data_fim DATE DEFAULT CURRENT_DATE + 7
)
RETURNS TABLE(
  id UUID,
  data_agendada TIMESTAMP WITH TIME ZONE,
  status_cirurgia VARCHAR,
  sala VARCHAR,
  paciente_nome VARCHAR,
  medico_nome VARCHAR,
  medico_crm VARCHAR,
  hospital_nome VARCHAR,
  total_materiais BIGINT,
  materiais_separados BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.data_agendada,
    c.status_cirurgia::VARCHAR,
    c.sala,
    p.nome AS paciente_nome,
    m.nome AS medico_nome,
    m.crm AS medico_crm,
    h.nome AS hospital_nome,
    (
      SELECT COUNT(*)::BIGINT
      FROM public.cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id
    ) AS total_materiais,
    (
      SELECT COUNT(*)::BIGINT
      FROM public.cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id AND cm.status_item = 'separado'
    ) AS materiais_separados
  FROM public.cirurgias c
  INNER JOIN public.pacientes p ON p.id = c.paciente_id
  INNER JOIN public.medicos m ON m.id = c.medico_id
  INNER JOIN public.hospitais h ON h.id = c.hospital_id
  WHERE c.empresa_id = p_empresa_id
    AND c.data_agendada::DATE BETWEEN p_data_inicio AND p_data_fim
  ORDER BY c.data_agendada ASC;
END;
$$;

COMMENT ON FUNCTION public.get_agenda_cirurgias IS 'Retorna agenda de cirurgias para um período';

-- ======================================
-- FUNCTION: refresh_dashboard_kpis (cron)
-- ======================================

CREATE OR REPLACE FUNCTION public.refresh_dashboard_kpis()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_dashboard_kpis;
END;
$$;

COMMENT ON FUNCTION public.refresh_dashboard_kpis IS 'Atualiza view materializada de KPIs (executar via cron a cada 15min)';
