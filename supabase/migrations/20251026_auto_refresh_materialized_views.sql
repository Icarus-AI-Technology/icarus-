-- ============================================
-- Migration: Auto Refresh Materialized Views
-- Gerado por: Agente 03 - Melhoria para 100/100
-- Data: 2025-10-26
-- Descrição: Cria sistema de refresh automático para Materialized Views
-- ============================================

-- Habilitar extensão pg_cron (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 1. FUNÇÃO: Refresh de Materialized Views
-- ============================================

CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_view RECORD;
  v_count INTEGER := 0;
  v_errors TEXT := '';
  v_start_time TIMESTAMPTZ;
  v_duration INTERVAL;
BEGIN
  v_start_time := NOW();
  
  -- Iterar sobre todas as Materialized Views
  FOR v_view IN
    SELECT schemaname, matviewname
    FROM pg_matviews
    WHERE schemaname = 'public'
    ORDER BY matviewname
  LOOP
    BEGIN
      -- Refresh CONCURRENTLY (não bloqueia leituras)
      EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I.%I', v_view.schemaname, v_view.matviewname);
      v_count := v_count + 1;
      
      RAISE NOTICE 'Refreshed: %.%', v_view.schemaname, v_view.matviewname;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || format('Error refreshing %.%: %', v_view.schemaname, v_view.matviewname, SQLERRM) || E'\n';
      RAISE WARNING 'Failed to refresh %.%: %', v_view.schemaname, v_view.matviewname, SQLERRM;
    END;
  END LOOP;
  
  v_duration := NOW() - v_start_time;
  
  IF v_errors = '' THEN
    RETURN format('Successfully refreshed %s materialized views in %s', v_count, v_duration);
  ELSE
    RETURN format('Refreshed %s views in %s with errors: %s', v_count, v_duration, v_errors);
  END IF;
END;
$$;

COMMENT ON FUNCTION public.refresh_all_materialized_views IS 'Atualiza todas as Materialized Views do schema public';

-- ============================================
-- 2. TABELA: Log de Refresh
-- ============================================

CREATE TABLE IF NOT EXISTS public.mv_refresh_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  view_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  status TEXT CHECK (status IN ('running', 'success', 'failed')) DEFAULT 'running',
  error_message TEXT,
  rows_affected INTEGER
);

CREATE INDEX idx_mv_refresh_log_view ON public.mv_refresh_log(view_name);
CREATE INDEX idx_mv_refresh_log_started ON public.mv_refresh_log(started_at DESC);

COMMENT ON TABLE public.mv_refresh_log IS 'Log de refresh de Materialized Views para monitoramento';

-- ============================================
-- 3. FUNÇÃO: Refresh Individual com Log
-- ============================================

CREATE OR REPLACE FUNCTION public.refresh_mv_with_log(p_view_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
  v_start_time TIMESTAMPTZ;
  v_rows_affected INTEGER;
BEGIN
  v_start_time := NOW();
  
  -- Criar registro de log
  INSERT INTO public.mv_refresh_log (view_name, started_at, status)
  VALUES (p_view_name, v_start_time, 'running')
  RETURNING id INTO v_log_id;
  
  BEGIN
    -- Refresh CONCURRENTLY
    EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY public.%I', p_view_name);
    
    -- Contar linhas
    EXECUTE format('SELECT COUNT(*) FROM public.%I', p_view_name) INTO v_rows_affected;
    
    -- Atualizar log com sucesso
    UPDATE public.mv_refresh_log
    SET
      completed_at = NOW(),
      duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_time)) * 1000,
      status = 'success',
      rows_affected = v_rows_affected
    WHERE id = v_log_id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Atualizar log com erro
    UPDATE public.mv_refresh_log
    SET
      completed_at = NOW(),
      duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_time)) * 1000,
      status = 'failed',
      error_message = SQLERRM
    WHERE id = v_log_id;
    
    RAISE;
  END;
  
  RETURN v_log_id;
END;
$$;

COMMENT ON FUNCTION public.refresh_mv_with_log IS 'Atualiza uma Materialized View específica com logging';

-- ============================================
-- 4. CRON JOBS: Agendamento Automático
-- ============================================

-- Job 1: Refresh a cada 5 minutos (views rápidas)
SELECT cron.schedule(
  'refresh-mvs-fast',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT public.refresh_mv_with_log('mv_dashboard_kpis');
  SELECT public.refresh_mv_with_log('mv_estoque_status');
  SELECT public.refresh_mv_with_log('mv_compliance_score');
  $$
);

-- Job 2: Refresh a cada 15 minutos (views médias)
SELECT cron.schedule(
  'refresh-mvs-medium',
  '*/15 * * * *', -- A cada 15 minutos
  $$
  SELECT public.refresh_mv_with_log('mv_cirurgias_stats');
  SELECT public.refresh_mv_with_log('mv_financeiro_resumo');
  SELECT public.refresh_mv_with_log('mv_consignacao_stats');
  $$
);

-- Job 3: Refresh a cada hora (views lentas)
SELECT cron.schedule(
  'refresh-mvs-slow',
  '0 * * * *', -- A cada hora
  $$
  SELECT public.refresh_mv_with_log('mv_produtos_top');
  SELECT public.refresh_mv_with_log('mv_rastreabilidade_resumo');
  SELECT public.refresh_mv_with_log('mv_medicos_performance');
  SELECT public.refresh_mv_with_log('mv_hospitais_stats');
  SELECT public.refresh_mv_with_log('mv_busca_rapida');
  $$
);

-- Job 4: Limpeza de logs antigos (diário às 3h)
SELECT cron.schedule(
  'cleanup-mv-logs',
  '0 3 * * *', -- Diariamente às 3h AM
  $$
  DELETE FROM public.mv_refresh_log
  WHERE started_at < NOW() - INTERVAL '30 days';
  $$
);

COMMENT ON EXTENSION pg_cron IS 'Agendador de tarefas para refresh automático de Materialized Views';

-- ============================================
-- 5. VIEW: Monitoramento de Refresh
-- ============================================

CREATE OR REPLACE VIEW public.vw_mv_refresh_status AS
SELECT
  view_name,
  COUNT(*) AS total_refreshes,
  COUNT(*) FILTER (WHERE status = 'success') AS successful,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  AVG(duration_ms) FILTER (WHERE status = 'success') AS avg_duration_ms,
  MAX(completed_at) AS last_refresh,
  MAX(completed_at) FILTER (WHERE status = 'success') AS last_successful_refresh
FROM public.mv_refresh_log
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY view_name
ORDER BY last_refresh DESC;

COMMENT ON VIEW public.vw_mv_refresh_status IS 'Status de refresh das Materialized Views (últimos 7 dias)';

-- ============================================
-- GRANTS: Permissões
-- ============================================

-- Service role pode executar refreshes
GRANT EXECUTE ON FUNCTION public.refresh_all_materialized_views() TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_mv_with_log(TEXT) TO service_role;

-- Usuários podem ver o status
GRANT SELECT ON public.vw_mv_refresh_status TO authenticated;
GRANT SELECT ON public.mv_refresh_log TO authenticated;

-- ============================================
-- ✅ RESULTADO
-- ============================================
-- ✅ Refresh automático a cada 5/15/60 minutos
-- ✅ Logging completo de refreshes
-- ✅ Monitoramento via view
-- ✅ Limpeza automática de logs antigos
-- ✅ CONCURRENTLY (não bloqueia leituras)
-- ============================================

