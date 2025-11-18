-- Migration: Optimize Materialized Views
-- Data: 2025-10-28
-- Objetivo: Otimizar materialized views existentes e criar função de refresh automático
-- Conformidade: Supabase Advisor Performance Issues (parte 3/3)
-- Documentação: docs/performance/materialized-views.md

-- ============================================
-- OTIMIZAÇÃO: vw_bi_medicos_performance
-- ============================================

-- Recriar com índice único (necessário para REFRESH CONCURRENTLY)
DROP MATERIALIZED VIEW IF EXISTS public.vw_bi_medicos_performance CASCADE;

CREATE MATERIALIZED VIEW public.vw_bi_medicos_performance AS
SELECT
    md.medico_id,
    md.nome AS medico_nome,
    md.crm,
    md.especialidade,
    em.nome AS equipe_nome,
    COUNT(fc.cirurgia_id) AS total_cirurgias,
    AVG(fc.duracao_min) AS tempo_medio_cirurgia,
    SUM(fc.custo_opme) AS custo_total_opme,
    SUM(fc.receita_total) AS receita_total,
    AVG(fc.margem) AS margem_media,
    AVG(fc.taxa_sucesso) AS taxa_sucesso_media,
    AVG(fc.taxa_complicacao) AS taxa_complicacao_media,
    -- Métricas adicionais para performance
    MIN(fc.duracao_min) AS duracao_min,
    MAX(fc.duracao_min) AS duracao_max,
    STDDEV(fc.duracao_min) AS duracao_stddev,
    COUNT(*) FILTER (WHERE fc.status_cirurgia = 'concluida') AS cirurgias_concluidas,
    COUNT(*) FILTER (WHERE fc.status_cirurgia = 'cancelada') AS cirurgias_canceladas,
    -- Ranking
    ROW_NUMBER() OVER (ORDER BY AVG(fc.taxa_sucesso) DESC NULLS LAST) AS ranking_sucesso,
    ROW_NUMBER() OVER (ORDER BY AVG(fc.margem) DESC NULLS LAST) AS ranking_margem,
    -- Timestamp de atualização
    NOW() AS atualizado_em
FROM
    public.bi_fato_cirurgias fc
JOIN
    public.bi_dimensao_medico md ON fc.medico_id = md.id
LEFT JOIN
    public.equipes_medicas em ON md.equipe_id = em.id
GROUP BY
    md.medico_id, md.nome, md.crm, md.especialidade, em.nome;

-- Índice único (necessário para CONCURRENT refresh)
CREATE UNIQUE INDEX idx_vw_bi_medicos_performance_medico 
  ON public.vw_bi_medicos_performance(medico_id);

-- Índices adicionais para queries comuns
CREATE INDEX idx_vw_bi_medicos_performance_total_cirurgias 
  ON public.vw_bi_medicos_performance(total_cirurgias DESC);

CREATE INDEX idx_vw_bi_medicos_performance_taxa_sucesso 
  ON public.vw_bi_medicos_performance(taxa_sucesso_media DESC NULLS LAST);

CREATE INDEX idx_vw_bi_medicos_performance_margem 
  ON public.vw_bi_medicos_performance(margem_media DESC NULLS LAST);

CREATE INDEX idx_vw_bi_medicos_performance_especialidade 
  ON public.vw_bi_medicos_performance(especialidade);

COMMENT ON MATERIALIZED VIEW public.vw_bi_medicos_performance IS 'Performance de médicos agregada (atualizada via refresh_matviews)';

-- ============================================
-- OTIMIZAÇÃO: vw_bi_ceo_kpis_resumo
-- ============================================

-- Recriar com índice único
DROP MATERIALIZED VIEW IF EXISTS public.vw_bi_ceo_kpis_resumo CASCADE;

CREATE MATERIALIZED VIEW public.vw_bi_ceo_kpis_resumo AS
SELECT
    kpi_nome,
    AVG(valor_atual) AS valor_medio_atual,
    AVG(meta) AS meta_media,
    MODE() WITHIN GROUP (ORDER BY status) AS status_mais_comum,
    MODE() WITHIN GROUP (ORDER BY tendencia) AS tendencia_mais_comum,
    AVG(variacao_percentual) AS variacao_media_percentual,
    AVG(previsao_proximo_periodo) AS previsao_media_proximo_periodo,
    AVG(confianca_previsao) AS confianca_media_previsao,
    -- Métricas adicionais
    MIN(valor_atual) AS valor_min,
    MAX(valor_atual) AS valor_max,
    STDDEV(valor_atual) AS valor_stddev,
    COUNT(*) AS total_registros,
    COUNT(*) FILTER (WHERE status = 'OK') AS total_ok,
    COUNT(*) FILTER (WHERE status = 'ALERTA') AS total_alerta,
    COUNT(*) FILTER (WHERE status = 'CRITICO') AS total_critico,
    -- Timestamp de atualização
    NOW() AS atualizado_em
FROM
    public.bi_ceo_kpis
GROUP BY
    kpi_nome;

-- Índice único
CREATE UNIQUE INDEX idx_vw_bi_ceo_kpis_resumo_kpi 
  ON public.vw_bi_ceo_kpis_resumo(kpi_nome);

-- Índices adicionais
CREATE INDEX idx_vw_bi_ceo_kpis_resumo_valor_medio 
  ON public.vw_bi_ceo_kpis_resumo(valor_medio_atual DESC);

CREATE INDEX idx_vw_bi_ceo_kpis_resumo_status 
  ON public.vw_bi_ceo_kpis_resumo(status_mais_comum);

COMMENT ON MATERIALIZED VIEW public.vw_bi_ceo_kpis_resumo IS 'Resumo consolidado de KPIs do CEO (atualizada via refresh_matviews)';

-- ============================================
-- NOVA MATVIEW: vw_dashboard_kpis_resumo
-- ============================================

-- Dashboard consolidado com métricas principais
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_dashboard_kpis_resumo AS
SELECT
    md.origem AS kpi_nome,
    AVG(md.valor) AS valor_medio,
    MIN(md.valor) AS valor_min,
    MAX(md.valor) AS valor_max,
    STDDEV(md.valor) AS valor_stddev,
    COUNT(*) AS total_medicoes,
    -- Últimos 7/30/90 dias
    AVG(md.valor) FILTER (WHERE md.data_referencia >= CURRENT_DATE - INTERVAL '7 days') AS media_7d,
    AVG(md.valor) FILTER (WHERE md.data_referencia >= CURRENT_DATE - INTERVAL '30 days') AS media_30d,
    AVG(md.valor) FILTER (WHERE md.data_referencia >= CURRENT_DATE - INTERVAL '90 days') AS media_90d,
    -- Tendência (crescimento/decrescimento)
    CASE
        WHEN AVG(md.valor) FILTER (WHERE md.data_referencia >= CURRENT_DATE - INTERVAL '7 days') > 
             AVG(md.valor) FILTER (WHERE md.data_referencia >= CURRENT_DATE - INTERVAL '14 days' AND md.data_referencia < CURRENT_DATE - INTERVAL '7 days')
        THEN 'CRESCIMENTO'
        WHEN AVG(md.valor) FILTER (WHERE md.data_referencia >= CURRENT_DATE - INTERVAL '7 days') < 
             AVG(md.valor) FILTER (WHERE md.data_referencia >= CURRENT_DATE - INTERVAL '14 days' AND md.data_referencia < CURRENT_DATE - INTERVAL '7 days')
        THEN 'DECRESCIMENTO'
        ELSE 'ESTAVEL'
    END AS tendencia,
    -- Timestamp
    NOW() AS atualizado_em
FROM
    public.metricas_dashboard md
WHERE
    md.data_referencia >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY
    md.origem;

-- Índice único
CREATE UNIQUE INDEX idx_vw_dashboard_kpis_resumo_kpi 
  ON public.vw_dashboard_kpis_resumo(kpi_nome);

-- Índices adicionais
CREATE INDEX idx_vw_dashboard_kpis_resumo_media_30d 
  ON public.vw_dashboard_kpis_resumo(media_30d DESC NULLS LAST);

COMMENT ON MATERIALIZED VIEW public.vw_dashboard_kpis_resumo IS 'Resumo de KPIs do dashboard principal (90 dias)';

-- ============================================
-- NOVA MATVIEW: vw_estoque_abc_analysis
-- ============================================

-- Análise ABC do estoque (valor)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_estoque_abc_analysis AS
WITH estoque_valor AS (
    SELECT
        e.produto_id,
        p.nome AS produto_nome,
        p.codigo_interno,
        p.categoria,
        e.empresa_id,
        SUM(e.quantidade_disponivel * e.custo_unitario) AS valor_total_estoque,
        SUM(e.quantidade_disponivel) AS quantidade_total
    FROM public.estoque e
    JOIN public.produtos p ON e.produto_id = p.id
    WHERE e.quantidade_disponivel > 0
    GROUP BY e.produto_id, p.nome, p.codigo_interno, p.categoria, e.empresa_id
),
estoque_ranking AS (
    SELECT
        *,
        SUM(valor_total_estoque) OVER (PARTITION BY empresa_id ORDER BY valor_total_estoque DESC) AS valor_acumulado,
        SUM(valor_total_estoque) OVER (PARTITION BY empresa_id) AS valor_total_empresa,
        ROW_NUMBER() OVER (PARTITION BY empresa_id ORDER BY valor_total_estoque DESC) AS ranking
    FROM estoque_valor
)
SELECT
    produto_id,
    produto_nome,
    codigo_interno,
    categoria,
    empresa_id,
    valor_total_estoque,
    quantidade_total,
    ranking,
    ROUND((valor_acumulado / NULLIF(valor_total_empresa, 0) * 100)::numeric, 2) AS percentual_acumulado,
    CASE
        WHEN (valor_acumulado / NULLIF(valor_total_empresa, 0) * 100) <= 80 THEN 'A'
        WHEN (valor_acumulado / NULLIF(valor_total_empresa, 0) * 100) <= 95 THEN 'B'
        ELSE 'C'
    END AS classificacao_abc,
    NOW() AS atualizado_em
FROM estoque_ranking;

-- Índice único
CREATE UNIQUE INDEX idx_vw_estoque_abc_analysis_produto_empresa 
  ON public.vw_estoque_abc_analysis(produto_id, empresa_id);

-- Índices adicionais
CREATE INDEX idx_vw_estoque_abc_analysis_classificacao 
  ON public.vw_estoque_abc_analysis(empresa_id, classificacao_abc);

CREATE INDEX idx_vw_estoque_abc_analysis_ranking 
  ON public.vw_estoque_abc_analysis(empresa_id, ranking);

COMMENT ON MATERIALIZED VIEW public.vw_estoque_abc_analysis IS 'Análise ABC do estoque por valor (Curva 80-15-5)';

-- ============================================
-- FUNÇÃO: refresh_matviews()
-- ============================================

CREATE OR REPLACE FUNCTION public.refresh_matviews()
RETURNS TABLE (
    matview_name text,
    refresh_status text,
    refresh_time interval,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_start_time timestamp;
    v_end_time timestamp;
    v_error text;
BEGIN
    -- 1. vw_bi_medicos_performance
    BEGIN
        v_start_time := clock_timestamp();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_bi_medicos_performance;
        v_end_time := clock_timestamp();
        
        RETURN QUERY SELECT 
            'vw_bi_medicos_performance'::text,
            'SUCCESS'::text,
            v_end_time - v_start_time,
            NULL::text;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        RETURN QUERY SELECT 
            'vw_bi_medicos_performance'::text,
            'ERROR'::text,
            NULL::interval,
            v_error;
    END;

    -- 2. vw_bi_ceo_kpis_resumo
    BEGIN
        v_start_time := clock_timestamp();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_bi_ceo_kpis_resumo;
        v_end_time := clock_timestamp();
        
        RETURN QUERY SELECT 
            'vw_bi_ceo_kpis_resumo'::text,
            'SUCCESS'::text,
            v_end_time - v_start_time,
            NULL::text;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        RETURN QUERY SELECT 
            'vw_bi_ceo_kpis_resumo'::text,
            'ERROR'::text,
            NULL::interval,
            v_error;
    END;

    -- 3. vw_dashboard_kpis_resumo
    BEGIN
        v_start_time := clock_timestamp();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_dashboard_kpis_resumo;
        v_end_time := clock_timestamp();
        
        RETURN QUERY SELECT 
            'vw_dashboard_kpis_resumo'::text,
            'SUCCESS'::text,
            v_end_time - v_start_time,
            NULL::text;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        RETURN QUERY SELECT 
            'vw_dashboard_kpis_resumo'::text,
            'ERROR'::text,
            NULL::interval,
            v_error;
    END;

    -- 4. vw_estoque_abc_analysis
    BEGIN
        v_start_time := clock_timestamp();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_estoque_abc_analysis;
        v_end_time := clock_timestamp();
        
        RETURN QUERY SELECT 
            'vw_estoque_abc_analysis'::text,
            'SUCCESS'::text,
            v_end_time - v_start_time,
            NULL::text;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        RETURN QUERY SELECT 
            'vw_estoque_abc_analysis'::text,
            'ERROR'::text,
            NULL::interval,
            v_error;
    END;

    RETURN;
END;
$$;

COMMENT ON FUNCTION public.refresh_matviews() IS 'Atualiza todas as materialized views com tratamento de erros';

-- ============================================
-- REFRESH INICIAL
-- ============================================

-- Executar refresh inicial (pode levar alguns minutos dependendo do volume de dados)
REFRESH MATERIALIZED VIEW public.vw_bi_medicos_performance;
REFRESH MATERIALIZED VIEW public.vw_bi_ceo_kpis_resumo;
REFRESH MATERIALIZED VIEW public.vw_dashboard_kpis_resumo;
REFRESH MATERIALIZED VIEW public.vw_estoque_abc_analysis;

-- ============================================
-- GRANTS
-- ============================================

-- Permitir que service_role execute a função de refresh
GRANT EXECUTE ON FUNCTION public.refresh_matviews() TO service_role;

-- ============================================
-- AUDITORIA & VALIDAÇÃO
-- ============================================

-- Verificar materialized views criadas
-- SELECT 
--   schemaname,
--   matviewname,
--   pg_size_pretty(pg_relation_size(schemaname||'.'||matviewname)) as size,
--   indexdef
-- FROM pg_matviews mv
-- LEFT JOIN pg_indexes idx ON idx.tablename = mv.matviewname
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(schemaname||'.'||matviewname) DESC;

-- Testar função de refresh
-- SELECT * FROM public.refresh_matviews();

-- Success: 4 materialized views otimizadas/criadas
-- - vw_bi_medicos_performance (otimizada)
-- - vw_bi_ceo_kpis_resumo (otimizada)
-- - vw_dashboard_kpis_resumo (nova)
-- - vw_estoque_abc_analysis (nova)
-- + Função refresh_matviews() para atualização automática

