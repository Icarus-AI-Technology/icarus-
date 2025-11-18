-- ============================================
-- MÓDULO FINANCEIRO - INFRAESTRUTURA DE IA
-- ICARUS v5.0
-- ============================================
-- 
-- Criação de tabelas para suportar os 6 novos agentes de IA:
-- - AI-ECO (Inteligência Econômica)
-- - AI-OPS (Financeiro-Operacional)
-- - AI-MATCH (Conciliação Inteligente)
-- - AI-TAX (Compliance Fiscal)
-- - AI-PLAN (Planejamento Estratégico)
-- - AI-FRAUD (Detecção de Fraudes)

-- ============================================
-- 1. TABELA: ia_models
-- ============================================
-- Armazena metadados dos modelos de IA

CREATE TABLE IF NOT EXISTS public.ia_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome TEXT NOT NULL UNIQUE, -- 'ai_eco', 'ai_ops', 'ai_match', etc.
  tipo TEXT NOT NULL, -- 'classificacao', 'regressao', 'clustering', 'nlp'
  versao TEXT NOT NULL, -- 'v1.0.0'
  
  -- Configuração
  algoritmo TEXT NOT NULL, -- 'random_forest', 'arima', 'bert', 'gpt-4'
  hiperparametros JSONB, -- Parâmetros do modelo
  features JSONB, -- Features utilizadas
  
  -- Métricas
  acuracia DECIMAL(5,2), -- 0-100%
  precisao DECIMAL(5,2),
  recall DECIMAL(5,2),
  f1_score DECIMAL(5,2),
  mae DECIMAL(10,2), -- Mean Absolute Error (para regressão)
  rmse DECIMAL(10,2), -- Root Mean Squared Error
  
  -- Treinamento
  ultimo_treino TIMESTAMP WITH TIME ZONE,
  dataset_tamanho INTEGER, -- Quantidade de registros usados
  tempo_treino_segundos INTEGER,
  
  -- Status
  status TEXT DEFAULT 'inativo', -- 'ativo', 'inativo', 'treinando', 'erro'
  status_detalhes TEXT,
  
  -- Storage
  model_storage_path TEXT, -- Caminho no Supabase Storage
  model_size_mb DECIMAL(10,2),
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Índices
  CONSTRAINT valid_status CHECK (status IN ('ativo', 'inativo', 'treinando', 'erro', 'beta'))
);

CREATE INDEX idx_ia_models_nome ON public.ia_models(nome);
CREATE INDEX idx_ia_models_status ON public.ia_models(status);
CREATE INDEX idx_ia_models_ultimo_treino ON public.ia_models(ultimo_treino DESC);

COMMENT ON TABLE public.ia_models IS 'Metadados dos modelos de IA do módulo Financeiro';

-- ============================================
-- 2. TABELA: ia_logs
-- ============================================
-- Registra todas as execuções de IA

CREATE TABLE IF NOT EXISTS public.ia_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  modelo_id UUID REFERENCES public.ia_models(id) ON DELETE SET NULL,
  modelo_nome TEXT NOT NULL, -- Redundante para histórico
  
  -- Execução
  input JSONB NOT NULL, -- Dados de entrada
  output JSONB, -- Resultado
  
  -- Performance
  tempo_execucao_ms INTEGER, -- Milissegundos
  confianca DECIMAL(5,2), -- 0-100%
  
  -- Status
  status TEXT DEFAULT 'sucesso', -- 'sucesso', 'erro', 'timeout'
  erro_mensagem TEXT,
  erro_stack TEXT,
  
  -- Contexto
  usuario_id UUID REFERENCES auth.users(id),
  empresa_id UUID, -- Multi-tenant
  ip_address INET,
  user_agent TEXT,
  
  -- Rastreamento
  request_id TEXT, -- UUID da requisição
  parent_log_id UUID REFERENCES public.ia_logs(id), -- Para logs encadeados
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Índices
  CONSTRAINT valid_ia_log_status CHECK (status IN ('sucesso', 'erro', 'timeout', 'cancelado'))
);

CREATE INDEX idx_ia_logs_modelo_nome ON public.ia_logs(modelo_nome);
CREATE INDEX idx_ia_logs_status ON public.ia_logs(status);
CREATE INDEX idx_ia_logs_criado_em ON public.ia_logs(criado_em DESC);
CREATE INDEX idx_ia_logs_usuario_id ON public.ia_logs(usuario_id);
CREATE INDEX idx_ia_logs_empresa_id ON public.ia_logs(empresa_id);
CREATE INDEX idx_ia_logs_request_id ON public.ia_logs(request_id);

COMMENT ON TABLE public.ia_logs IS 'Logs de execução dos agentes de IA';

-- ============================================
-- 3. TABELA: ia_metrics
-- ============================================
-- Métricas agregadas dos modelos (performance ao longo do tempo)

CREATE TABLE IF NOT EXISTS public.ia_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  modelo_id UUID REFERENCES public.ia_models(id) ON DELETE CASCADE,
  
  -- Período
  data_referencia DATE NOT NULL,
  periodo TEXT NOT NULL, -- 'diario', 'semanal', 'mensal'
  
  -- Métricas de uso
  total_execucoes INTEGER DEFAULT 0,
  total_sucessos INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0,
  taxa_sucesso DECIMAL(5,2), -- %
  
  -- Métricas de performance
  tempo_medio_ms INTEGER,
  tempo_mediano_ms INTEGER,
  tempo_p95_ms INTEGER, -- Percentil 95
  tempo_p99_ms INTEGER, -- Percentil 99
  
  -- Métricas de qualidade
  confianca_media DECIMAL(5,2),
  acuracia_periodo DECIMAL(5,2), -- Validada com feedback
  
  -- Custos (se aplicável - APIs externas)
  custo_total DECIMAL(10,2),
  custo_por_execucao DECIMAL(10,4),
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraint única
  UNIQUE(modelo_id, data_referencia, periodo)
);

CREATE INDEX idx_ia_metrics_modelo_id ON public.ia_metrics(modelo_id);
CREATE INDEX idx_ia_metrics_data_referencia ON public.ia_metrics(data_referencia DESC);
CREATE INDEX idx_ia_metrics_periodo ON public.ia_metrics(periodo);

COMMENT ON TABLE public.ia_metrics IS 'Métricas agregadas de performance dos modelos de IA';

-- ============================================
-- 4. TABELA: ia_economic_indicators
-- ============================================
-- Cache de indicadores econômicos (AI-ECO)

CREATE TABLE IF NOT EXISTS public.ia_economic_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  indicador TEXT NOT NULL, -- 'selic', 'ipca', 'igpm', 'cdi', 'pib', etc.
  fonte TEXT NOT NULL, -- 'banco_central', 'ibge', 'fgv'
  
  -- Dados
  valor DECIMAL(10,4) NOT NULL,
  unidade TEXT, -- '%', 'pontos', 'R$', etc.
  
  -- Período
  data_referencia DATE NOT NULL,
  periodo TEXT, -- 'mensal', 'anual', 'diario'
  
  -- Metadados
  raw_data JSONB, -- Dados brutos da API
  url_fonte TEXT,
  
  -- Cache
  cache_valido_ate TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraint única
  UNIQUE(indicador, data_referencia, periodo)
);

CREATE INDEX idx_ia_economic_indicators_indicador ON public.ia_economic_indicators(indicador);
CREATE INDEX idx_ia_economic_indicators_data_referencia ON public.ia_economic_indicators(data_referencia DESC);
CREATE INDEX idx_ia_economic_indicators_cache ON public.ia_economic_indicators(cache_valido_ate);

COMMENT ON TABLE public.ia_economic_indicators IS 'Cache de indicadores econômicos para AI-ECO';

-- ============================================
-- 5. TABELA: ia_fraud_alerts
-- ============================================
-- Alertas de fraude detectados pelo AI-FRAUD

CREATE TABLE IF NOT EXISTS public.ia_fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  tipo TEXT NOT NULL, -- 'transacao_suspeita', 'login_anomalo', 'conciliacao_fraudulenta'
  severidade TEXT NOT NULL, -- 'baixa', 'media', 'alta', 'critica'
  
  -- Detecção
  score_anomalia DECIMAL(5,2) NOT NULL, -- 0-100 (quanto maior, mais suspeito)
  confianca DECIMAL(5,2), -- Confiança do modelo
  
  -- Entidade relacionada
  entidade_tipo TEXT, -- 'transacao', 'usuario', 'conta_receber', etc.
  entidade_id UUID,
  
  -- Detalhes
  descricao TEXT NOT NULL,
  motivo JSONB, -- Razões detalhadas
  dados_contexto JSONB, -- Dados da entidade no momento da detecção
  
  -- Ações
  status TEXT DEFAULT 'pendente', -- 'pendente', 'revisado', 'confirmado', 'falso_positivo'
  revisado_por UUID REFERENCES auth.users(id),
  revisado_em TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  
  -- Notificações
  notificado BOOLEAN DEFAULT FALSE,
  notificado_em TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  empresa_id UUID,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_fraud_severidade CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  CONSTRAINT valid_fraud_status CHECK (status IN ('pendente', 'revisado', 'confirmado', 'falso_positivo', 'ignorado'))
);

CREATE INDEX idx_ia_fraud_alerts_tipo ON public.ia_fraud_alerts(tipo);
CREATE INDEX idx_ia_fraud_alerts_severidade ON public.ia_fraud_alerts(severidade);
CREATE INDEX idx_ia_fraud_alerts_status ON public.ia_fraud_alerts(status);
CREATE INDEX idx_ia_fraud_alerts_score ON public.ia_fraud_alerts(score_anomalia DESC);
CREATE INDEX idx_ia_fraud_alerts_criado_em ON public.ia_fraud_alerts(criado_em DESC);
CREATE INDEX idx_ia_fraud_alerts_empresa_id ON public.ia_fraud_alerts(empresa_id);

COMMENT ON TABLE public.ia_fraud_alerts IS 'Alertas de fraude detectados pelo AI-FRAUD';

-- ============================================
-- 6. TABELA: ia_match_suggestions
-- ============================================
-- Sugestões de conciliação do AI-MATCH

CREATE TABLE IF NOT EXISTS public.ia_match_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Origem (transação bancária)
  transacao_bancaria_id UUID,
  transacao_descricao TEXT,
  transacao_valor DECIMAL(15,2),
  transacao_data DATE,
  
  -- Sugestão (lançamento contábil)
  lancamento_id UUID,
  lancamento_descricao TEXT,
  lancamento_valor DECIMAL(15,2),
  lancamento_data DATE,
  
  -- Score de match (AI-MATCH)
  score_similaridade DECIMAL(5,2) NOT NULL, -- 0-100
  confianca DECIMAL(5,2), -- Confiança do modelo
  
  -- Fatores de score
  score_valor DECIMAL(5,2), -- Similaridade de valor
  score_data DECIMAL(5,2), -- Proximidade de data
  score_texto DECIMAL(5,2), -- Similaridade semântica (BERT)
  
  -- Status
  status TEXT DEFAULT 'pendente', -- 'pendente', 'aceito', 'rejeitado', 'conciliado_manual'
  conciliado_por UUID REFERENCES auth.users(id),
  conciliado_em TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  empresa_id UUID,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_match_status CHECK (status IN ('pendente', 'aceito', 'rejeitado', 'conciliado_manual', 'expirado'))
);

CREATE INDEX idx_ia_match_suggestions_status ON public.ia_match_suggestions(status);
CREATE INDEX idx_ia_match_suggestions_score ON public.ia_match_suggestions(score_similaridade DESC);
CREATE INDEX idx_ia_match_suggestions_criado_em ON public.ia_match_suggestions(criado_em DESC);
CREATE INDEX idx_ia_match_suggestions_empresa_id ON public.ia_match_suggestions(empresa_id);

COMMENT ON TABLE public.ia_match_suggestions IS 'Sugestões de conciliação automática do AI-MATCH';

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ia_models_updated_at
BEFORE UPDATE ON public.ia_models
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ia_metrics_updated_at
BEFORE UPDATE ON public.ia_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ia_economic_indicators_updated_at
BEFORE UPDATE ON public.ia_economic_indicators
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ia_fraud_alerts_updated_at
BEFORE UPDATE ON public.ia_fraud_alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ia_match_suggestions_updated_at
BEFORE UPDATE ON public.ia_match_suggestions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.ia_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_match_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies (todos podem ler, apenas admins podem editar modelos)
CREATE POLICY "Usuários autenticados podem ler ia_models"
ON public.ia_models FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins podem gerenciar ia_models"
ON public.ia_models FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'admin');

-- Logs: multi-tenant
CREATE POLICY "Usuários veem logs da própria empresa"
ON public.ia_logs FOR SELECT
TO authenticated
USING (empresa_id::text = auth.jwt()->>'empresa_id');

-- Métricas: leitura livre
CREATE POLICY "Usuários autenticados podem ler ia_metrics"
ON public.ia_metrics FOR SELECT
TO authenticated
USING (true);

-- Indicadores econômicos: leitura livre (público)
CREATE POLICY "Usuários autenticados podem ler indicadores"
ON public.ia_economic_indicators FOR SELECT
TO authenticated
USING (true);

-- Fraud alerts: multi-tenant
CREATE POLICY "Usuários veem alertas da própria empresa"
ON public.ia_fraud_alerts FOR ALL
TO authenticated
USING (empresa_id::text = auth.jwt()->>'empresa_id');

-- Match suggestions: multi-tenant
CREATE POLICY "Usuários veem sugestões da própria empresa"
ON public.ia_match_suggestions FOR ALL
TO authenticated
USING (empresa_id::text = auth.jwt()->>'empresa_id');

-- ============================================
-- SEED: Modelos iniciais
-- ============================================

INSERT INTO public.ia_models (nome, tipo, versao, algoritmo, acuracia, status) VALUES
('ai_eco', 'analytics', 'v1.0.0', 'api_integration', 95.0, 'ativo'),
('ai_ops', 'analytics', 'v1.0.0', 'multi_source', 90.0, 'ativo'),
('ai_match', 'nlp', 'v1.0.0', 'sentence_transformers_bert', 97.0, 'ativo'),
('ai_tax', 'classificacao', 'v1.0.0', 'rule_engine', 92.0, 'ativo'),
('ai_plan', 'nlp', 'v1.0.0', 'gpt-4-turbo', 88.0, 'ativo'),
('ai_fraud', 'anomalia', 'v1.0.0', 'isolation_forest', 87.0, 'ativo')
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

COMMENT ON COLUMN public.ia_models.nome IS 'Identificador único do modelo (ex: ai_eco, ai_fraud)';
COMMENT ON COLUMN public.ia_logs.tempo_execucao_ms IS 'Tempo de execução em milissegundos';
COMMENT ON COLUMN public.ia_fraud_alerts.score_anomalia IS 'Score de 0-100, quanto maior mais suspeito';
COMMENT ON COLUMN public.ia_match_suggestions.score_similaridade IS 'Similaridade semântica calculada por BERT';

