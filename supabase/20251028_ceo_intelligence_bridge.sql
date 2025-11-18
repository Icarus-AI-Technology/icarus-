-- ============================================
-- ICARUS v5.0 - CEO Intelligence Bridge
-- Migration: 20251028_ceo_intelligence_bridge.sql
-- ============================================

-- Feed operacional para CEO Intelligence
CREATE TABLE IF NOT EXISTS ceo_operational_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  agente_origem TEXT NOT NULL,
  categoria TEXT NOT NULL,
  metrica TEXT NOT NULL,
  valor_atual NUMERIC,
  valor_benchmark NUMERIC,
  tendencia TEXT CHECK (tendencia IN ('crescente', 'estavel', 'decrescente', 'low', 'medium', 'high', 'critical')),
  impacto_estimado JSONB DEFAULT '{}'::jsonb,
  acoes_sugeridas TEXT[],
  prioridade TEXT CHECK (prioridade IN ('low', 'medium', 'high', 'critical')),
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ceo_feed_empresa ON ceo_operational_feed(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ceo_feed_agente ON ceo_operational_feed(agente_origem);
CREATE INDEX IF NOT EXISTS idx_ceo_feed_categoria ON ceo_operational_feed(categoria);
CREATE INDEX IF NOT EXISTS idx_ceo_feed_prioridade ON ceo_operational_feed(prioridade);
CREATE INDEX IF NOT EXISTS idx_ceo_feed_lido ON ceo_operational_feed(lido);
CREATE INDEX IF NOT EXISTS idx_ceo_feed_created ON ceo_operational_feed(created_at DESC);

-- Decisões tomadas pelo CEO baseadas em insights
CREATE TABLE IF NOT EXISTS ceo_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  insight_id uuid REFERENCES bi_ai_insights(id) ON DELETE SET NULL,
  feed_id uuid REFERENCES ceo_operational_feed(id) ON DELETE SET NULL,
  decisao TEXT NOT NULL,
  justificativa TEXT,
  impacto_esperado JSONB DEFAULT '{}'::jsonb,
  impacto_real JSONB,
  data_implementacao DATE,
  data_avaliacao DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  roi_estimado NUMERIC(10,2),
  roi_real NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ceo_decisions_empresa ON ceo_decisions(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ceo_decisions_usuario ON ceo_decisions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ceo_decisions_status ON ceo_decisions(status);
CREATE INDEX IF NOT EXISTS idx_ceo_decisions_data_impl ON ceo_decisions(data_implementacao);

-- Histórico de ações dos agentes especializados
CREATE TABLE IF NOT EXISTS agent_actions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  module TEXT NOT NULL,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON agent_actions_log(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_actions_module ON agent_actions_log(module);
CREATE INDEX IF NOT EXISTS idx_agent_actions_created ON agent_actions_log(created_at DESC);

-- Métricas consolidadas dos agentes
CREATE TABLE IF NOT EXISTS agent_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
  total_execucoes INTEGER DEFAULT 0,
  execucoes_sucesso INTEGER DEFAULT 0,
  execucoes_erro INTEGER DEFAULT 0,
  taxa_sucesso NUMERIC(5,2) DEFAULT 0,
  tempo_medio_execucao_ms INTEGER DEFAULT 0,
  insights_gerados INTEGER DEFAULT 0,
  acoes_recomendadas INTEGER DEFAULT 0,
  acoes_executadas INTEGER DEFAULT 0,
  impacto_total_estimado JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(agent_name, data_referencia)
);

CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent ON agent_metrics(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_data ON agent_metrics(data_referencia DESC);

-- View consolidada para CEO Dashboard
CREATE OR REPLACE VIEW vw_ceo_operational_summary AS
SELECT
  categoria,
  COUNT(*) as total_eventos,
  COUNT(*) FILTER (WHERE prioridade = 'critical') as criticos,
  COUNT(*) FILTER (WHERE prioridade = 'high') as altos,
  COUNT(*) FILTER (WHERE prioridade = 'medium') as medios,
  COUNT(*) FILTER (WHERE lido = false) as nao_lidos,
  MAX(created_at) as ultimo_evento
FROM ceo_operational_feed
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY categoria;

-- View de performance dos agentes
CREATE OR REPLACE VIEW vw_agent_performance AS
SELECT
  agent_name,
  SUM(total_execucoes) as total_execucoes_30d,
  AVG(taxa_sucesso) as taxa_sucesso_media,
  AVG(tempo_medio_execucao_ms) as tempo_medio_ms,
  SUM(insights_gerados) as total_insights,
  SUM(acoes_executadas) as total_acoes_executadas
FROM agent_metrics
WHERE data_referencia >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY agent_name;

-- Function: Atualizar métricas dos agentes
CREATE OR REPLACE FUNCTION atualizar_metricas_agentes()
RETURNS void AS $$
BEGIN
  INSERT INTO agent_metrics (
    agent_name,
    data_referencia,
    total_execucoes,
    execucoes_sucesso,
    execucoes_erro,
    taxa_sucesso,
    tempo_medio_execucao_ms
  )
  SELECT
    agent_name,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE success = true),
    COUNT(*) FILTER (WHERE success = false),
    (COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0)),
    AVG(execution_time_ms)::INTEGER
  FROM agent_actions_log
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY agent_name
  ON CONFLICT (agent_name, data_referencia)
  DO UPDATE SET
    total_execucoes = EXCLUDED.total_execucoes,
    execucoes_sucesso = EXCLUDED.execucoes_sucesso,
    execucoes_erro = EXCLUDED.execucoes_erro,
    taxa_sucesso = EXCLUDED.taxa_sucesso,
    tempo_medio_execucao_ms = EXCLUDED.tempo_medio_execucao_ms,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Marcar feed como lido
CREATE OR REPLACE FUNCTION marcar_feed_lido(feed_ids uuid[])
RETURNS void AS $$
BEGIN
  UPDATE ceo_operational_feed
  SET lido = true
  WHERE id = ANY(feed_ids);
END;
$$ LANGUAGE plpgsql;

-- Function: Limpar feeds expirados
CREATE OR REPLACE FUNCTION limpar_feeds_expirados()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ceo_operational_feed
  WHERE expires_at < NOW()
  AND lido = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_ceo_decisions_updated_at
BEFORE UPDATE ON ceo_decisions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_metrics_updated_at
BEFORE UPDATE ON agent_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE ceo_operational_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: CEO e gestores podem ver feed operacional
CREATE POLICY "gestores_veem_feed" ON ceo_operational_feed
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'gerente', 'diretor', 'ceo')
    )
  );

-- Policy: Sistema pode inserir no feed
CREATE POLICY "sistema_insere_feed" ON ceo_operational_feed
  FOR INSERT
  WITH CHECK (true);

-- Policy: CEO pode registrar decisões
CREATE POLICY "ceo_registra_decisoes" ON ceo_decisions
  FOR ALL
  USING (auth.uid() = usuario_id);

-- Policy: Sistema registra ações dos agentes
CREATE POLICY "sistema_registra_agent_actions" ON agent_actions_log
  FOR INSERT
  WITH CHECK (true);

-- Policy: Gestores veem logs dos agentes
CREATE POLICY "gestores_veem_agent_logs" ON agent_actions_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'gerente')
    )
  );

-- Policy: Todos veem métricas dos agentes
CREATE POLICY "todos_veem_agent_metrics" ON agent_metrics
  FOR SELECT
  USING (true);

-- Comentários
COMMENT ON TABLE ceo_operational_feed IS 'Feed em tempo real de eventos operacionais para o CEO Intelligence';
COMMENT ON TABLE ceo_decisions IS 'Registro de decisões estratégicas tomadas pelo CEO baseadas em insights de IA';
COMMENT ON TABLE agent_actions_log IS 'Log de todas as ações executadas pelos agentes especializados';
COMMENT ON TABLE agent_metrics IS 'Métricas de performance e eficácia dos agentes especializados';

COMMENT ON COLUMN ceo_operational_feed.agente_origem IS 'Nome do agente ou tutor que gerou o evento';
COMMENT ON COLUMN ceo_operational_feed.impacto_estimado IS 'Estimativa de impacto financeiro/operacional';
COMMENT ON COLUMN ceo_operational_feed.expires_at IS 'Data de expiração do evento (auto-limpeza)';

COMMENT ON COLUMN ceo_decisions.roi_estimado IS 'ROI estimado da decisão em percentual';
COMMENT ON COLUMN ceo_decisions.roi_real IS 'ROI real medido após implementação';

