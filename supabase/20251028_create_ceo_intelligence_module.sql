-- ============================================
-- MÓDULO CEO INTELLIGENCE - STRATEGIC BI
-- ICARUS v5.0
-- ============================================
-- 
-- Tabelas para BI Estratégico e IA Corporativa:
-- - bi_fato_cirurgias (análises médicas)
-- - bi_dimensao_medico (dimensão médico)
-- - bi_fato_equipes_medicas (performance de equipes)
-- - bi_ai_insights (insights gerados por IA)
-- - bi_ceo_kpis (KPIs executivos)
-- - bi_alertas_estrategicos (alertas críticos)

-- ============================================
-- 1. TABELA: bi_dimensao_medico
-- ============================================
-- Dimensão de médicos para análises

CREATE TABLE IF NOT EXISTS public.bi_dimensao_medico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  medico_id UUID REFERENCES public.usuarios(id),
  crm TEXT NOT NULL,
  nome TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  subespecialidade TEXT,
  
  -- Classificação
  nivel_experiencia TEXT, -- 'junior', 'pleno', 'senior', 'referencia'
  categoria TEXT, -- 'titular', 'assistente', 'residente'
  
  -- Equipe
  equipe_id UUID,
  equipe_nome TEXT,
  lider_equipe BOOLEAN DEFAULT FALSE,
  
  -- Métricas agregadas
  total_cirurgias INTEGER DEFAULT 0,
  taxa_sucesso_media DECIMAL(5,2), -- %
  tempo_medio_cirurgia INTEGER, -- minutos
  custo_medio_opme DECIMAL(15,2),
  margem_media DECIMAL(5,2), -- %
  
  -- Performance
  score_eficiencia DECIMAL(5,2), -- 0-100
  score_qualidade DECIMAL(5,2), -- 0-100
  score_custo DECIMAL(5,2), -- 0-100
  score_global DECIMAL(5,2), -- Média ponderada
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ultima_atualizacao_metricas TIMESTAMP WITH TIME ZONE,
  usuario_id UUID
);

CREATE INDEX idx_bi_dimensao_medico_medico_id ON public.bi_dimensao_medico(medico_id);
CREATE INDEX idx_bi_dimensao_medico_equipe_id ON public.bi_dimensao_medico(equipe_id);
CREATE INDEX idx_bi_dimensao_medico_especialidade ON public.bi_dimensao_medico(especialidade);
CREATE INDEX idx_bi_dimensao_medico_score_global ON public.bi_dimensao_medico(score_global DESC);

COMMENT ON TABLE public.bi_dimensao_medico IS 'Dimensão de médicos para análises de BI estratégico';

-- ============================================
-- 2. TABELA: bi_fato_cirurgias
-- ============================================
-- Fatos de cirurgias para análises médicas e financeiras

CREATE TABLE IF NOT EXISTS public.bi_fato_cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  
  -- Dimensões (Foreign Keys)
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  data_id UUID REFERENCES public.bi_dimensao_tempo(id),
  medico_id UUID REFERENCES public.bi_dimensao_medico(medico_id),
  equipe_id UUID,
  hospital_id UUID REFERENCES public.hospitais(id),
  procedimento_id UUID,
  
  -- Identificação
  cirurgia_codigo TEXT,
  procedimento_nome TEXT,
  equipe_nome TEXT,
  medico_nome TEXT,
  hospital_nome TEXT,
  
  -- Temporal
  data_cirurgia DATE NOT NULL,
  hora_inicio TIMESTAMP WITH TIME ZONE,
  hora_fim TIMESTAMP WITH TIME ZONE,
  duracao_min INTEGER,
  
  -- Métricas Clínicas
  complexidade TEXT, -- 'baixa', 'media', 'alta', 'critica'
  urgencia TEXT, -- 'eletiva', 'urgencia', 'emergencia'
  resultado TEXT, -- 'sucesso', 'complicacao_leve', 'complicacao_grave', 'insucesso'
  taxa_sucesso DECIMAL(5,2) DEFAULT 100, -- %
  
  -- Métricas de Equipe
  tamanho_equipe INTEGER,
  tempo_preparacao_min INTEGER,
  tempo_cirurgia_min INTEGER,
  tempo_recuperacao_min INTEGER,
  
  -- Métricas Financeiras
  valor_opme DECIMAL(15,2),
  valor_honorarios DECIMAL(15,2),
  valor_hospital DECIMAL(15,2),
  valor_anestesia DECIMAL(15,2),
  valor_materiais DECIMAL(15,2),
  custo_total DECIMAL(15,2),
  receita_total DECIMAL(15,2),
  margem DECIMAL(15,2), -- R$
  margem_percentual DECIMAL(5,2), -- %
  
  -- Materiais OPME
  quantidade_opme INTEGER,
  valor_medio_opme DECIMAL(15,2),
  fornecedor_principal TEXT,
  
  -- Riscos e Qualidade
  risco_glosa DECIMAL(5,2), -- % (IA)
  score_qualidade DECIMAL(5,2), -- 0-100 (IA)
  teve_complicacao BOOLEAN DEFAULT FALSE,
  tipo_complicacao TEXT,
  
  -- Performance
  eficiencia_operacional DECIMAL(5,2), -- IEO (Índice Eficiência Operacional)
  desvio_tempo_previsto INTEGER, -- minutos (positivo = atrasou)
  desvio_custo_previsto DECIMAL(15,2), -- R$ (positivo = mais caro)
  
  -- Rastreabilidade
  paciente_id UUID,
  convenio_id UUID,
  guia_tiss TEXT,
  autorizacao_numero TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_id UUID
);

CREATE INDEX idx_bi_fato_cirurgias_empresa_id ON public.bi_fato_cirurgias(empresa_id);
CREATE INDEX idx_bi_fato_cirurgias_cirurgia_id ON public.bi_fato_cirurgias(cirurgia_id);
CREATE INDEX idx_bi_fato_cirurgias_medico_id ON public.bi_fato_cirurgias(medico_id);
CREATE INDEX idx_bi_fato_cirurgias_equipe_id ON public.bi_fato_cirurgias(equipe_id);
CREATE INDEX idx_bi_fato_cirurgias_data ON public.bi_fato_cirurgias(data_cirurgia DESC);
CREATE INDEX idx_bi_fato_cirurgias_complexidade ON public.bi_fato_cirurgias(complexidade);
CREATE INDEX idx_bi_fato_cirurgias_resultado ON public.bi_fato_cirurgias(resultado);

COMMENT ON TABLE public.bi_fato_cirurgias IS 'Fatos de cirurgias para análises de performance médica e financeira';

-- ============================================
-- 3. TABELA: bi_fato_equipes_medicas
-- ============================================
-- Agregações de performance por equipe médica

CREATE TABLE IF NOT EXISTS public.bi_fato_equipes_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  
  -- Identificação
  equipe_id UUID NOT NULL,
  equipe_nome TEXT NOT NULL,
  lider_nome TEXT,
  especialidade TEXT,
  
  -- Período de análise
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  periodo TEXT, -- 'diario', 'semanal', 'mensal', 'trimestral'
  
  -- Métricas de Volume
  total_cirurgias INTEGER DEFAULT 0,
  total_horas_cirurgia DECIMAL(10,2),
  media_cirurgias_dia DECIMAL(10,2),
  
  -- Métricas de Qualidade
  taxa_sucesso DECIMAL(5,2), -- %
  quantidade_complicacoes INTEGER,
  taxa_complicacoes DECIMAL(5,2), -- %
  
  -- Métricas de Tempo
  tempo_medio_cirurgia INTEGER, -- minutos
  tempo_medio_preparacao INTEGER,
  tempo_medio_recuperacao INTEGER,
  eficiencia_tempo DECIMAL(5,2), -- % (real vs previsto)
  
  -- Métricas Financeiras
  receita_total DECIMAL(15,2),
  custo_total DECIMAL(15,2),
  margem_total DECIMAL(15,2),
  margem_percentual DECIMAL(5,2),
  ticket_medio DECIMAL(15,2),
  
  -- Métricas de Materiais
  custo_medio_opme DECIMAL(15,2),
  quantidade_total_opme INTEGER,
  taxa_desperdicio DECIMAL(5,2), -- %
  
  -- Performance Relativa
  ranking_empresa INTEGER, -- Posição no ranking geral
  ranking_especialidade INTEGER, -- Posição na especialidade
  percentil_performance DECIMAL(5,2), -- 0-100
  
  -- Scores Agregados
  score_eficiencia DECIMAL(5,2), -- 0-100
  score_qualidade DECIMAL(5,2), -- 0-100
  score_financeiro DECIMAL(5,2), -- 0-100
  score_global DECIMAL(5,2), -- Média ponderada
  
  -- Sinergia
  indice_sinergia DECIMAL(5,2), -- 0-100 (trabalho em equipe)
  rotatividade_membros DECIMAL(5,2), -- % mudança composição
  
  -- Benchmarks
  vs_media_empresa DECIMAL(10,2), -- % acima/abaixo da média
  vs_melhor_equipe DECIMAL(10,2), -- % gap para a melhor
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_id UUID,
  
  -- Constraint única
  UNIQUE(empresa_id, equipe_id, data_inicio, data_fim, periodo)
);

CREATE INDEX idx_bi_fato_equipes_empresa_id ON public.bi_fato_equipes_medicas(empresa_id);
CREATE INDEX idx_bi_fato_equipes_equipe_id ON public.bi_fato_equipes_medicas(equipe_id);
CREATE INDEX idx_bi_fato_equipes_periodo ON public.bi_fato_equipes_medicas(data_inicio DESC, data_fim DESC);
CREATE INDEX idx_bi_fato_equipes_score_global ON public.bi_fato_equipes_medicas(score_global DESC);
CREATE INDEX idx_bi_fato_equipes_ranking ON public.bi_fato_equipes_medicas(ranking_empresa);

COMMENT ON TABLE public.bi_fato_equipes_medicas IS 'Agregações de performance por equipe médica';

-- ============================================
-- 4. TABELA: bi_ai_insights
-- ============================================
-- Insights gerados pelos agentes de IA estratégica

CREATE TABLE IF NOT EXISTS public.bi_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  
  -- Identificação
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL, -- 'financeiro', 'operacional', 'clinico', 'estrategico', 'risco'
  tipo TEXT NOT NULL, -- 'alerta', 'oportunidade', 'tendencia', 'anomalia', 'recomendacao'
  
  -- Agente de IA responsável
  agente_ia TEXT NOT NULL, -- 'oraculo', 'finboard', 'medscore', 'supplychain', 'marketeye'
  modelo_ia TEXT, -- 'lstm', 'prophet', 'xgboost', 'gpt-4'
  versao_modelo TEXT,
  
  -- Conteúdo
  descricao TEXT NOT NULL,
  detalhes JSONB, -- Dados estruturados do insight
  impacto_estimado JSONB, -- { "tipo": "financeiro", "valor": 420000, "unidade": "R$", "periodo": "45 dias" }
  
  -- Severidade e Prioridade
  severidade TEXT NOT NULL, -- 'baixa', 'media', 'alta', 'critica'
  prioridade TEXT NOT NULL, -- 'baixa', 'media', 'alta', 'urgente'
  confianca DECIMAL(5,2), -- % (confiança do modelo IA)
  
  -- Ações Recomendadas
  acoes_recomendadas JSONB, -- Array de ações sugeridas
  prazo_acao TEXT, -- '24h', '7 dias', '30 dias', etc.
  
  -- Contexto
  modulos_relacionados TEXT[], -- ['financeiro', 'cirurgias', 'estoque']
  entidades_relacionadas JSONB, -- { "medico_id": "...", "equipe_id": "..." }
  periodo_analise TEXT, -- '2025-10-01 a 2025-10-28'
  
  -- Status
  status TEXT DEFAULT 'novo', -- 'novo', 'visualizado', 'em_analise', 'implementado', 'ignorado'
  visualizado_por UUID REFERENCES auth.users(id),
  visualizado_em TIMESTAMP WITH TIME ZONE,
  implementado_por UUID REFERENCES auth.users(id),
  implementado_em TIMESTAMP WITH TIME ZONE,
  
  -- Feedback (para retreinamento)
  feedback_usuario TEXT, -- 'util', 'pouco_util', 'nao_util'
  comentario_usuario TEXT,
  resultado_real JSONB, -- Resultado real após implementação
  
  -- Validade
  valido_ate TIMESTAMP WITH TIME ZONE,
  expirado BOOLEAN DEFAULT FALSE,
  
  -- Notificações
  notificado BOOLEAN DEFAULT FALSE,
  notificado_em TIMESTAMP WITH TIME ZONE,
  destinatarios_notificados TEXT[],
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_id UUID
);

CREATE INDEX idx_bi_ai_insights_empresa_id ON public.bi_ai_insights(empresa_id);
CREATE INDEX idx_bi_ai_insights_categoria ON public.bi_ai_insights(categoria);
CREATE INDEX idx_bi_ai_insights_tipo ON public.bi_ai_insights(tipo);
CREATE INDEX idx_bi_ai_insights_agente ON public.bi_ai_insights(agente_ia);
CREATE INDEX idx_bi_ai_insights_severidade ON public.bi_ai_insights(severidade);
CREATE INDEX idx_bi_ai_insights_status ON public.bi_ai_insights(status);
CREATE INDEX idx_bi_ai_insights_criado_em ON public.bi_ai_insights(criado_em DESC);
CREATE INDEX idx_bi_ai_insights_confianca ON public.bi_ai_insights(confianca DESC);

COMMENT ON TABLE public.bi_ai_insights IS 'Insights estratégicos gerados pelos agentes de IA';

-- ============================================
-- 5. TABELA: bi_ceo_kpis
-- ============================================
-- KPIs executivos consolidados

CREATE TABLE IF NOT EXISTS public.bi_ceo_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  
  -- Identificação
  kpi_nome TEXT NOT NULL,
  kpi_codigo TEXT NOT NULL, -- 'margem_operacional', 'nps', 'churn', etc.
  categoria TEXT NOT NULL, -- 'financeiro', 'operacional', 'clinico', 'comercial'
  
  -- Período
  data_referencia DATE NOT NULL,
  periodo TEXT NOT NULL, -- 'diario', 'semanal', 'mensal', 'trimestral', 'anual'
  
  -- Valores
  valor_atual DECIMAL(15,2) NOT NULL,
  valor_anterior DECIMAL(15,2), -- Período anterior
  valor_meta DECIMAL(15,2), -- Meta definida
  valor_minimo DECIMAL(15,2), -- Limite inferior aceitável
  valor_maximo DECIMAL(15,2), -- Limite superior
  
  -- Unidade
  unidade TEXT NOT NULL, -- '%', 'R$', 'unidades', 'dias', etc.
  formato_exibicao TEXT, -- 'percentual', 'moeda', 'numero', 'duracao'
  
  -- Variações
  variacao_absoluta DECIMAL(15,2), -- vs período anterior
  variacao_percentual DECIMAL(10,2), -- % vs período anterior
  variacao_vs_meta DECIMAL(10,2), -- % vs meta
  
  -- Tendência
  tendencia TEXT, -- 'crescente', 'estavel', 'decrescente'
  tendencia_desejada TEXT, -- 'crescente', 'estavel', 'decrescente'
  
  -- Status
  status TEXT NOT NULL, -- 'excelente', 'bom', 'atencao', 'critico'
  alerta BOOLEAN DEFAULT FALSE,
  mensagem_alerta TEXT,
  
  -- Previsão (IA)
  previsao_proximo_periodo DECIMAL(15,2),
  previsao_3_periodos DECIMAL(15,2),
  previsao_6_periodos DECIMAL(15,2),
  confianca_previsao DECIMAL(5,2), -- %
  
  -- Drill-down
  detalhamento JSONB, -- Detalhes e sub-métricas
  
  -- Configuração
  exibir_dashboard_ceo BOOLEAN DEFAULT TRUE,
  ordem_exibicao INTEGER,
  cor_badge TEXT, -- 'green', 'yellow', 'red', 'blue'
  icone TEXT, -- 'dollar-sign', 'trending-up', 'users', etc.
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_id UUID,
  
  -- Constraint única
  UNIQUE(empresa_id, kpi_codigo, data_referencia, periodo)
);

CREATE INDEX idx_bi_ceo_kpis_empresa_id ON public.bi_ceo_kpis(empresa_id);
CREATE INDEX idx_bi_ceo_kpis_codigo ON public.bi_ceo_kpis(kpi_codigo);
CREATE INDEX idx_bi_ceo_kpis_categoria ON public.bi_ceo_kpis(categoria);
CREATE INDEX idx_bi_ceo_kpis_data ON public.bi_ceo_kpis(data_referencia DESC);
CREATE INDEX idx_bi_ceo_kpis_status ON public.bi_ceo_kpis(status);
CREATE INDEX idx_bi_ceo_kpis_dashboard ON public.bi_ceo_kpis(exibir_dashboard_ceo, ordem_exibicao);

COMMENT ON TABLE public.bi_ceo_kpis IS 'KPIs executivos consolidados para dashboard CEO';

-- ============================================
-- 6. TABELA: bi_alertas_estrategicos
-- ============================================
-- Alertas críticos para o CEO

CREATE TABLE IF NOT EXISTS public.bi_alertas_estrategicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  
  -- Identificação
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL, -- 'financeiro', 'operacional', 'clinico', 'risco', 'oportunidade'
  severidade TEXT NOT NULL, -- 'info', 'baixa', 'media', 'alta', 'critica'
  
  -- Conteúdo
  mensagem TEXT NOT NULL,
  descricao_detalhada TEXT,
  dados_contexto JSONB,
  
  -- Origem
  origem TEXT NOT NULL, -- 'ia_agent', 'kpi_automatico', 'regra_negocio', 'usuario'
  agente_ia TEXT, -- Se gerado por IA
  kpi_relacionado TEXT, -- Se relacionado a KPI
  
  -- Impacto
  impacto_estimado JSONB, -- { "tipo": "financeiro", "valor": -250000, "descricao": "Perda estimada" }
  urgencia TEXT NOT NULL, -- 'baixa', 'media', 'alta', 'imediata'
  
  -- Ações
  acoes_recomendadas TEXT[],
  prazo_acao TEXT,
  responsavel_sugerido UUID REFERENCES auth.users(id),
  
  -- Status
  status TEXT DEFAULT 'ativo', -- 'ativo', 'em_analise', 'resolvido', 'ignorado', 'expirado'
  atribuido_para UUID REFERENCES auth.users(id),
  atribuido_em TIMESTAMP WITH TIME ZONE,
  resolvido_por UUID REFERENCES auth.users(id),
  resolvido_em TIMESTAMP WITH TIME ZONE,
  resolucao TEXT,
  
  -- Notificações
  notificado BOOLEAN DEFAULT FALSE,
  notificado_em TIMESTAMP WITH TIME ZONE,
  canais_notificacao TEXT[], -- ['email', 'whatsapp', 'push']
  destinatarios UUID[],
  
  -- Recorrência
  recorrente BOOLEAN DEFAULT FALSE,
  ultima_ocorrencia TIMESTAMP WITH TIME ZONE,
  quantidade_ocorrencias INTEGER DEFAULT 1,
  
  -- Validade
  valido_ate TIMESTAMP WITH TIME ZONE,
  auto_expirar BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_id UUID
);

CREATE INDEX idx_bi_alertas_empresa_id ON public.bi_alertas_estrategicos(empresa_id);
CREATE INDEX idx_bi_alertas_categoria ON public.bi_alertas_estrategicos(categoria);
CREATE INDEX idx_bi_alertas_severidade ON public.bi_alertas_estrategicos(severidade);
CREATE INDEX idx_bi_alertas_status ON public.bi_alertas_estrategicos(status);
CREATE INDEX idx_bi_alertas_urgencia ON public.bi_alertas_estrategicos(urgencia);
CREATE INDEX idx_bi_alertas_criado_em ON public.bi_alertas_estrategicos(criado_em DESC);
CREATE INDEX idx_bi_alertas_atribuido ON public.bi_alertas_estrategicos(atribuido_para);

COMMENT ON TABLE public.bi_alertas_estrategicos IS 'Alertas estratégicos críticos para o CEO';

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_bi_ceo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bi_dimensao_medico_updated_at
BEFORE UPDATE ON public.bi_dimensao_medico
FOR EACH ROW EXECUTE FUNCTION update_updated_at_bi_ceo();

CREATE TRIGGER trg_bi_fato_cirurgias_updated_at
BEFORE UPDATE ON public.bi_fato_cirurgias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_bi_ceo();

CREATE TRIGGER trg_bi_fato_equipes_updated_at
BEFORE UPDATE ON public.bi_fato_equipes_medicas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_bi_ceo();

CREATE TRIGGER trg_bi_ai_insights_updated_at
BEFORE UPDATE ON public.bi_ai_insights
FOR EACH ROW EXECUTE FUNCTION update_updated_at_bi_ceo();

CREATE TRIGGER trg_bi_ceo_kpis_updated_at
BEFORE UPDATE ON public.bi_ceo_kpis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_bi_ceo();

CREATE TRIGGER trg_bi_alertas_updated_at
BEFORE UPDATE ON public.bi_alertas_estrategicos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_bi_ceo();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.bi_dimensao_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_fato_cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_fato_equipes_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_ceo_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_alertas_estrategicos ENABLE ROW LEVEL SECURITY;

-- Policies (acesso executivo e admin)
CREATE POLICY "Executivos podem acessar dimensao_medico"
ON public.bi_dimensao_medico FOR SELECT
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'ceo', 'diretor'));

CREATE POLICY "Executivos podem acessar fato_cirurgias"
ON public.bi_fato_cirurgias FOR SELECT
TO authenticated
USING (
  empresa_id::text = auth.jwt()->>'empresa_id' AND
  auth.jwt()->>'role' IN ('admin', 'ceo', 'diretor', 'medico')
);

CREATE POLICY "Executivos podem acessar fato_equipes"
ON public.bi_fato_equipes_medicas FOR SELECT
TO authenticated
USING (
  empresa_id::text = auth.jwt()->>'empresa_id' AND
  auth.jwt()->>'role' IN ('admin', 'ceo', 'diretor')
);

CREATE POLICY "Usuários autenticados podem ler insights"
ON public.bi_ai_insights FOR SELECT
TO authenticated
USING (empresa_id::text = auth.jwt()->>'empresa_id');

CREATE POLICY "Executivos podem gerenciar insights"
ON public.bi_ai_insights FOR ALL
TO authenticated
USING (
  empresa_id::text = auth.jwt()->>'empresa_id' AND
  auth.jwt()->>'role' IN ('admin', 'ceo', 'diretor')
);

CREATE POLICY "Executivos podem acessar KPIs"
ON public.bi_ceo_kpis FOR SELECT
TO authenticated
USING (
  empresa_id::text = auth.jwt()->>'empresa_id' AND
  auth.jwt()->>'role' IN ('admin', 'ceo', 'diretor', 'gerente')
);

CREATE POLICY "Executivos podem acessar alertas"
ON public.bi_alertas_estrategicos FOR ALL
TO authenticated
USING (
  empresa_id::text = auth.jwt()->>'empresa_id' AND
  auth.jwt()->>'role' IN ('admin', 'ceo', 'diretor')
);

-- ============================================
-- VIEWS MATERIALIZADAS
-- ============================================

-- View: Performance médica consolidada
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_bi_medicos_performance AS
SELECT 
  dm.id,
  dm.medico_id,
  dm.nome,
  dm.especialidade,
  dm.equipe_nome,
  COUNT(fc.id) as total_cirurgias,
  AVG(fc.duracao_min) as tempo_medio,
  AVG(fc.taxa_sucesso) as taxa_sucesso_media,
  SUM(fc.receita_total) as receita_total,
  SUM(fc.margem) as margem_total,
  AVG(fc.margem_percentual) as margem_percentual_media,
  AVG(fc.eficiencia_operacional) as eficiencia_media,
  dm.score_global,
  MAX(fc.data_cirurgia) as ultima_cirurgia
FROM public.bi_dimensao_medico dm
LEFT JOIN public.bi_fato_cirurgias fc ON dm.medico_id = fc.medico_id
WHERE dm.ativo = TRUE
GROUP BY dm.id, dm.medico_id, dm.nome, dm.especialidade, dm.equipe_nome, dm.score_global;

CREATE UNIQUE INDEX idx_vw_bi_medicos_performance_id ON public.vw_bi_medicos_performance(id);
CREATE INDEX idx_vw_bi_medicos_performance_score ON public.vw_bi_medicos_performance(score_global DESC);

-- View: KPIs CEO resumo
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_bi_ceo_kpis_resumo AS
SELECT 
  categoria,
  COUNT(*) as total_kpis,
  SUM(CASE WHEN status = 'excelente' THEN 1 ELSE 0 END) as kpis_excelentes,
  SUM(CASE WHEN status = 'bom' THEN 1 ELSE 0 END) as kpis_bons,
  SUM(CASE WHEN status = 'atencao' THEN 1 ELSE 0 END) as kpis_atencao,
  SUM(CASE WHEN status = 'critico' THEN 1 ELSE 0 END) as kpis_criticos,
  SUM(CASE WHEN alerta = TRUE THEN 1 ELSE 0 END) as total_alertas
FROM public.bi_ceo_kpis
WHERE data_referencia >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY categoria;

CREATE INDEX idx_vw_bi_ceo_kpis_resumo_categoria ON public.vw_bi_ceo_kpis_resumo(categoria);

COMMENT ON MATERIALIZED VIEW public.vw_bi_medicos_performance IS 'Performance consolidada de médicos';
COMMENT ON MATERIALIZED VIEW public.vw_bi_ceo_kpis_resumo IS 'Resumo de KPIs executivos por categoria';

-- ============================================
-- SEED DATA
-- ============================================

-- Seed KPIs padrão do CEO
INSERT INTO public.bi_ceo_kpis (
  empresa_id, kpi_nome, kpi_codigo, categoria, data_referencia, periodo,
  valor_atual, valor_meta, unidade, formato_exibicao, status,
  exibir_dashboard_ceo, ordem_exibicao, cor_badge, icone
) VALUES
  (gen_random_uuid(), 'Margem Operacional', 'margem_operacional', 'financeiro', CURRENT_DATE, 'mensal', 28.5, 25, '%', 'percentual', 'excelente', TRUE, 1, 'green', 'trending-up'),
  (gen_random_uuid(), 'Previsão Receita 6m', 'previsao_receita_6m', 'financeiro', CURRENT_DATE, 'mensal', 14.7, 12, '%', 'percentual', 'excelente', TRUE, 2, 'green', 'dollar-sign'),
  (gen_random_uuid(), 'Satisfação Clientes (NPS)', 'nps', 'comercial', CURRENT_DATE, 'mensal', 84, 80, 'pontos', 'numero', 'bom', TRUE, 3, 'green', 'heart'),
  (gen_random_uuid(), 'Eficiência Médica Média', 'eficiencia_medica', 'clinico', CURRENT_DATE, 'mensal', 87, 90, '%', 'percentual', 'atencao', TRUE, 4, 'yellow', 'activity'),
  (gen_random_uuid(), 'Rotatividade Clientes (Churn)', 'churn', 'comercial', CURRENT_DATE, 'mensal', 4.2, 5, '%', 'percentual', 'excelente', TRUE, 5, 'green', 'users'),
  (gen_random_uuid(), 'Capacidade Operacional', 'capacidade_operacional', 'operacional', CURRENT_DATE, 'mensal', 92, 85, '%', 'percentual', 'excelente', TRUE, 6, 'green', 'gauge')
ON CONFLICT DO NOTHING;

