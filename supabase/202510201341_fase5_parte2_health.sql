-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 2/5)
-- MÓDULO HEALTH/MONITORING - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. SYSTEM_HEALTH_METRICS (métricas do sistema)
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metrica TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('performance', 'disponibilidade', 'seguranca', 'recursos', 'negocio')) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  unidade TEXT,
  status TEXT CHECK (status IN ('ok', 'warning', 'critical', 'unknown')) DEFAULT 'ok',
  threshold_warning DECIMAL(15, 2),
  threshold_critical DECIMAL(15, 2),
  detalhes_json JSONB,
  coletado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_health_metrics_metrica ON public.system_health_metrics(metrica, coletado_em DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_status ON public.system_health_metrics(status, coletado_em DESC) WHERE status IN ('warning', 'critical');
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_categoria ON public.system_health_metrics(categoria, coletado_em DESC);

-- 2. SYSTEM_ALERTS (alertas do sistema)
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('info', 'warning', 'error', 'critical')) NOT NULL,
  categoria TEXT,
  origem TEXT,
  metrica_relacionada TEXT,
  valor_atual DECIMAL(15, 2),
  valor_esperado DECIMAL(15, 2),
  acao_sugerida TEXT,
  notificado BOOLEAN DEFAULT FALSE,
  notificados_ids UUID[],
  resolvido BOOLEAN DEFAULT FALSE,
  resolvido_em TIMESTAMPTZ,
  resolvido_por_id UUID REFERENCES public.usuarios(id),
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_alerts_tipo ON public.system_alerts(tipo, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolvido ON public.system_alerts(resolvido, criado_em DESC) WHERE NOT resolvido;
CREATE INDEX IF NOT EXISTS idx_system_alerts_categoria ON public.system_alerts(categoria);

-- 3. SYSTEM_LOGS (logs do sistema)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nivel TEXT CHECK (nivel IN ('debug', 'info', 'warning', 'error', 'fatal')) NOT NULL,
  categoria TEXT,
  mensagem TEXT NOT NULL,
  contexto_json JSONB,
  stack_trace TEXT,
  usuario_id UUID REFERENCES public.usuarios(id),
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  url TEXT,
  metodo TEXT,
  duracao_ms INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_nivel ON public.system_logs(nivel, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_categoria ON public.system_logs(categoria, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_usuario ON public.system_logs(usuario_id, criado_em DESC) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_logs_request ON public.system_logs(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_logs_erro ON public.system_logs(criado_em DESC) WHERE nivel IN ('error', 'fatal');

CREATE TRIGGER trg_system_alerts_updated BEFORE UPDATE ON public.system_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.system_health_metrics IS 'Métricas de saúde do sistema';
COMMENT ON TABLE public.system_alerts IS 'Alertas do sistema';
COMMENT ON TABLE public.system_logs IS 'Logs centralizados do sistema';

