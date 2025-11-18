-- ============================================
-- ICARUS v5.0 - AI Tutors & Insights
-- Migration: 20251028_ai_tutors_insights.sql
-- ============================================

-- Tabela de insights dos tutores de IA
CREATE TABLE IF NOT EXISTS ai_tutor_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo TEXT NOT NULL,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_insight TEXT NOT NULL CHECK (tipo_insight IN ('dica', 'alerta', 'acao', 'insight', 'otimizacao')),
  conteudo JSONB NOT NULL DEFAULT '{}'::jsonb,
  confianca NUMERIC(5,2) CHECK (confianca >= 0 AND confianca <= 100),
  acao_executada BOOLEAN DEFAULT false,
  executada_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_tutor_insights_modulo ON ai_tutor_insights(modulo);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_insights_usuario ON ai_tutor_insights(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_insights_acao_executada ON ai_tutor_insights(acao_executada);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_insights_created_at ON ai_tutor_insights(created_at DESC);

-- Tabela de feedback dos usuários sobre sugestões da IA
CREATE TABLE IF NOT EXISTS ai_tutor_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid REFERENCES ai_tutor_insights(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  relevante BOOLEAN NOT NULL,
  comentario TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_feedback_insight ON ai_tutor_feedback(insight_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_feedback_usuario ON ai_tutor_feedback(usuario_id);

-- Tabela de métricas de performance dos tutores
CREATE TABLE IF NOT EXISTS ai_tutor_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo TEXT NOT NULL,
  data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sugestoes INTEGER DEFAULT 0,
  sugestoes_aceitas INTEGER DEFAULT 0,
  sugestoes_descartadas INTEGER DEFAULT 0,
  taxa_aceitacao NUMERIC(5,2) DEFAULT 0,
  confianca_media NUMERIC(5,2) DEFAULT 0,
  tempo_resposta_medio_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(modulo, data_referencia)
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_metrics_modulo ON ai_tutor_metrics(modulo);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_metrics_data ON ai_tutor_metrics(data_referencia DESC);

-- Função para atualizar métricas dos tutores
CREATE OR REPLACE FUNCTION atualizar_metricas_tutor()
RETURNS void AS $$
BEGIN
  INSERT INTO ai_tutor_metrics (
    modulo,
    data_referencia,
    total_sugestoes,
    sugestoes_aceitas,
    sugestoes_descartadas,
    taxa_aceitacao,
    confianca_media
  )
  SELECT
    modulo,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE acao_executada = true),
    COUNT(*) FILTER (WHERE acao_executada = false AND created_at < NOW() - INTERVAL '24 hours'),
    (COUNT(*) FILTER (WHERE acao_executada = true) * 100.0 / NULLIF(COUNT(*), 0)),
    AVG(confianca)
  FROM ai_tutor_insights
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY modulo
  ON CONFLICT (modulo, data_referencia)
  DO UPDATE SET
    total_sugestoes = EXCLUDED.total_sugestoes,
    sugestoes_aceitas = EXCLUDED.sugestoes_aceitas,
    sugestoes_descartadas = EXCLUDED.sugestoes_descartadas,
    taxa_aceitacao = EXCLUDED.taxa_aceitacao,
    confianca_media = EXCLUDED.confianca_media,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_tutor_insights_updated_at
BEFORE UPDATE ON ai_tutor_insights
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tutor_metrics_updated_at
BEFORE UPDATE ON ai_tutor_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE ai_tutor_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios insights
CREATE POLICY "usuarios_veem_proprios_insights" ON ai_tutor_insights
  FOR SELECT
  USING (auth.uid() = usuario_id);

-- Policy: Sistema pode inserir insights (service_role)
CREATE POLICY "sistema_insere_insights" ON ai_tutor_insights
  FOR INSERT
  WITH CHECK (true);

-- Policy: Usuários podem atualizar seus insights
CREATE POLICY "usuarios_atualizam_proprios_insights" ON ai_tutor_insights
  FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Policy: Usuários podem dar feedback
CREATE POLICY "usuarios_dao_feedback" ON ai_tutor_feedback
  FOR ALL
  USING (auth.uid() = usuario_id);

-- Policy: Todos podem ver métricas (para dashboards)
CREATE POLICY "todos_veem_metricas" ON ai_tutor_metrics
  FOR SELECT
  USING (true);

-- Comentários nas tabelas
COMMENT ON TABLE ai_tutor_insights IS 'Insights e sugestões geradas pelos tutores de IA em cada módulo';
COMMENT ON TABLE ai_tutor_feedback IS 'Feedback dos usuários sobre a relevância das sugestões da IA';
COMMENT ON TABLE ai_tutor_metrics IS 'Métricas de performance e eficácia dos tutores de IA';

COMMENT ON COLUMN ai_tutor_insights.confianca IS 'Nível de confiança da IA na sugestão (0-100)';
COMMENT ON COLUMN ai_tutor_insights.acao_executada IS 'Se o usuário executou a ação sugerida';
COMMENT ON COLUMN ai_tutor_metrics.taxa_aceitacao IS 'Percentual de sugestões aceitas pelos usuários';

