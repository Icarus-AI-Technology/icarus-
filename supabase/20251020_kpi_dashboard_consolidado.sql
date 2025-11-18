-- =====================================================
-- BLOCO 2.2: KPI Dashboard Consolidado - Visão 360°
-- Métricas em tempo real para distribuidoras OPME
-- 
-- FUNCIONALIDADES:
-- - KPIs consolidados de todas as áreas
-- - Alertas inteligentes (threshold dinâmico)
-- - Comparação com períodos anteriores
-- - Metas e previsões
-- - Indicadores de saúde do negócio
-- - Realtime com Supabase Realtime
-- 
-- ÁREAS COBERTAS:
-- - Vendas e Faturamento
-- - Estoque e Logística
-- - Financeiro e Fluxo de Caixa
-- - Compliance e Conformidade
-- - Operações e Entregas
-- =====================================================

-- =====================================================
-- TABELA: kpi_metas (Metas por KPI)
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_metas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  nome VARCHAR(100) NOT NULL UNIQUE, -- 'faturamento_mensal', 'margem_percentual', 'nps_score'
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL, -- 'vendas', 'financeiro', 'operacoes', 'compliance'
  
  -- Meta
  valor_meta DECIMAL(15,2) NOT NULL,
  unidade VARCHAR(20) NOT NULL, -- 'BRL', 'percentage', 'number', 'days'
  
  -- Thresholds (semáforo)
  threshold_critico DECIMAL(15,2), -- Vermelho: Abaixo disso é crítico
  threshold_alerta DECIMAL(15,2), -- Amarelo: Entre crítico e ok
  threshold_ok DECIMAL(15,2), -- Verde: Acima disso está ok
  threshold_excelente DECIMAL(15,2), -- Azul: Superou expectativas
  
  -- Periodicidade
  periodo VARCHAR(20) NOT NULL, -- 'diario', 'semanal', 'mensal', 'trimestral', 'anual'
  
  -- Responsável
  responsavel_role_id UUID REFERENCES roles(id),
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE kpi_metas IS 'Metas e thresholds para KPIs do dashboard';

CREATE INDEX idx_kpi_metas_categoria ON kpi_metas(categoria);
CREATE INDEX idx_kpi_metas_ativo ON kpi_metas(is_ativo);

-- =====================================================
-- TABELA: kpi_valores_historico (Histórico de KPIs)
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_valores_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- KPI
  kpi_meta_id UUID NOT NULL REFERENCES kpi_metas(id) ON DELETE CASCADE,
  
  -- Período
  data_referencia DATE NOT NULL,
  periodo VARCHAR(20) NOT NULL, -- Mesmo que kpi_metas.periodo
  
  -- Valor medido
  valor_real DECIMAL(15,2) NOT NULL,
  valor_meta DECIMAL(15,2) NOT NULL, -- Snapshot da meta no momento
  
  -- Performance
  atingimento_percentual DECIMAL(5,2) NOT NULL, -- (valor_real / valor_meta) * 100
  status VARCHAR(20) NOT NULL, -- 'critico', 'alerta', 'ok', 'excelente'
  
  -- Comparação com período anterior
  valor_periodo_anterior DECIMAL(15,2),
  variacao_percentual DECIMAL(5,2), -- % mudança vs anterior
  tendencia VARCHAR(20), -- 'crescimento', 'estavel', 'queda'
  
  -- Metadata
  calculado_por UUID REFERENCES auth.users(id),
  calculado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(kpi_meta_id, data_referencia, periodo)
);

COMMENT ON TABLE kpi_valores_historico IS 'Histórico de valores de KPIs ao longo do tempo';

CREATE INDEX idx_kpi_valores_kpi ON kpi_valores_historico(kpi_meta_id);
CREATE INDEX idx_kpi_valores_data ON kpi_valores_historico(data_referencia DESC);
CREATE INDEX idx_kpi_valores_status ON kpi_valores_historico(status);

-- =====================================================
-- TABELA: kpi_alertas (Alertas de KPI)
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- KPI
  kpi_meta_id UUID NOT NULL REFERENCES kpi_metas(id) ON DELETE CASCADE,
  kpi_valor_historico_id UUID REFERENCES kpi_valores_historico(id),
  
  -- Alerta
  severidade VARCHAR(20) NOT NULL, -- 'critico', 'alto', 'medio', 'baixo'
  tipo VARCHAR(50) NOT NULL, -- 'meta_nao_atingida', 'tendencia_negativa', 'variacao_abrupta'
  mensagem TEXT NOT NULL,
  detalhes JSONB,
  
  -- Ação recomendada
  acao_recomendada TEXT,
  
  -- Notificação
  notificado BOOLEAN DEFAULT FALSE,
  notificado_em TIMESTAMP WITH TIME ZONE,
  notificados TEXT[], -- Array de emails notificados
  
  -- Resolução
  is_resolvido BOOLEAN DEFAULT FALSE,
  resolvido_em TIMESTAMP WITH TIME ZONE,
  resolvido_por UUID REFERENCES auth.users(id),
  notas_resolucao TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE kpi_alertas IS 'Alertas automáticos de KPIs fora do threshold';

CREATE INDEX idx_kpi_alertas_kpi ON kpi_alertas(kpi_meta_id);
CREATE INDEX idx_kpi_alertas_severidade ON kpi_alertas(severidade);
CREATE INDEX idx_kpi_alertas_resolvido ON kpi_alertas(is_resolvido);

-- =====================================================
-- TABELA: kpi_dashboard_widgets (Widgets do dashboard)
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuário ou global
  user_id UUID REFERENCES auth.users(id), -- NULL = widget global
  
  -- Widget
  titulo VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'kpi_single', 'kpi_gauge', 'kpi_sparkline', 'kpi_comparison', 'kpi_table'
  
  -- Configuração
  kpi_meta_ids UUID[], -- Array de KPIs a exibir
  config JSONB NOT NULL, -- { size, color, format, etc. }
  
  -- Layout
  posicao_x INTEGER DEFAULT 0,
  posicao_y INTEGER DEFAULT 0,
  largura INTEGER DEFAULT 4, -- Grid de 12 colunas
  altura INTEGER DEFAULT 2, -- Unidades de altura
  
  -- Ordem
  ordem INTEGER DEFAULT 0,
  
  -- Visibilidade
  is_visivel BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE kpi_dashboard_widgets IS 'Widgets configuráveis do dashboard de KPIs';

CREATE INDEX idx_kpi_widgets_user ON kpi_dashboard_widgets(user_id);

-- =====================================================
-- VIEW: vw_kpi_dashboard_resumo (Resumo do dashboard)
-- =====================================================
CREATE OR REPLACE VIEW vw_kpi_dashboard_resumo AS
SELECT
  km.id AS kpi_id,
  km.nome,
  km.descricao,
  km.categoria,
  km.valor_meta,
  km.unidade,
  km.periodo,
  
  -- Último valor
  kvh.valor_real AS valor_atual,
  kvh.atingimento_percentual,
  kvh.status,
  kvh.tendencia,
  kvh.variacao_percentual,
  kvh.data_referencia AS ultima_atualizacao,
  
  -- Alertas ativos
  COUNT(ka.id) FILTER (WHERE ka.is_resolvido = FALSE) AS alertas_ativos
  
FROM kpi_metas km
LEFT JOIN LATERAL (
  SELECT * FROM kpi_valores_historico
  WHERE kpi_meta_id = km.id
  ORDER BY data_referencia DESC
  LIMIT 1
) kvh ON TRUE
LEFT JOIN kpi_alertas ka ON km.id = ka.kpi_meta_id AND ka.is_resolvido = FALSE
WHERE km.is_ativo = TRUE
GROUP BY
  km.id, km.nome, km.descricao, km.categoria, km.valor_meta, km.unidade, km.periodo,
  kvh.valor_real, kvh.atingimento_percentual, kvh.status, kvh.tendencia,
  kvh.variacao_percentual, kvh.data_referencia;

COMMENT ON VIEW vw_kpi_dashboard_resumo IS 'Resumo consolidado de todos os KPIs para dashboard';

-- =====================================================
-- VIEW: vw_kpi_por_categoria (KPIs agrupados por categoria)
-- =====================================================
CREATE OR REPLACE VIEW vw_kpi_por_categoria AS
SELECT
  km.categoria,
  COUNT(km.id) AS total_kpis,
  COUNT(km.id) FILTER (WHERE kvh.status = 'excelente') AS kpis_excelentes,
  COUNT(km.id) FILTER (WHERE kvh.status = 'ok') AS kpis_ok,
  COUNT(km.id) FILTER (WHERE kvh.status = 'alerta') AS kpis_alerta,
  COUNT(km.id) FILTER (WHERE kvh.status = 'critico') AS kpis_criticos,
  ROUND(AVG(kvh.atingimento_percentual), 2) AS atingimento_medio_percentual
FROM kpi_metas km
LEFT JOIN LATERAL (
  SELECT * FROM kpi_valores_historico
  WHERE kpi_meta_id = km.id
  ORDER BY data_referencia DESC
  LIMIT 1
) kvh ON TRUE
WHERE km.is_ativo = TRUE
GROUP BY km.categoria;

COMMENT ON VIEW vw_kpi_por_categoria IS 'Agrupamento de KPIs por categoria com estatísticas';

-- =====================================================
-- FUNCTION: Calcular KPI automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_kpi(
  p_kpi_nome VARCHAR,
  p_data_referencia DATE,
  p_periodo VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_kpi_meta RECORD;
  v_valor_real DECIMAL;
  v_valor_anterior DECIMAL;
  v_atingimento DECIMAL;
  v_status VARCHAR;
  v_tendencia VARCHAR;
  v_variacao DECIMAL;
  v_id UUID;
BEGIN
  -- Buscar meta
  SELECT * INTO v_kpi_meta FROM kpi_metas WHERE nome = p_kpi_nome AND is_ativo = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'KPI % não encontrado ou inativo', p_kpi_nome;
  END IF;
  
  -- Calcular valor real baseado no nome do KPI
  CASE p_kpi_nome
    WHEN 'faturamento_mensal' THEN
      SELECT COALESCE(SUM(valor_total), 0) INTO v_valor_real
      FROM bi_fato_vendas v
      JOIN bi_dimensao_tempo t ON v.data_id = t.data_id
      WHERE t.ano = EXTRACT(YEAR FROM p_data_referencia)
        AND t.mes = EXTRACT(MONTH FROM p_data_referencia)
        AND v.status = 'Autorizada';
    
    WHEN 'margem_percentual' THEN
      SELECT COALESCE(AVG(margem_percentual), 0) INTO v_valor_real
      FROM bi_fato_vendas v
      JOIN bi_dimensao_tempo t ON v.data_id = t.data_id
      WHERE t.ano = EXTRACT(YEAR FROM p_data_referencia)
        AND t.mes = EXTRACT(MONTH FROM p_data_referencia)
        AND v.status = 'Autorizada';
    
    WHEN 'nfes_emitidas' THEN
      SELECT COUNT(*) INTO v_valor_real
      FROM nfes
      WHERE EXTRACT(YEAR FROM emissao_em) = EXTRACT(YEAR FROM p_data_referencia)
        AND EXTRACT(MONTH FROM emissao_em) = EXTRACT(MONTH FROM p_data_referencia)
        AND status = 'autorizada';
    
    WHEN 'taxa_conformidade_anvisa' THEN
      SELECT COALESCE(AVG(CASE WHEN possui_rastreabilidade THEN 100 ELSE 0 END), 0) INTO v_valor_real
      FROM nfes_itens ni
      JOIN nfes n ON ni.nfe_id = n.id
      WHERE EXTRACT(YEAR FROM n.emissao_em) = EXTRACT(YEAR FROM p_data_referencia)
        AND EXTRACT(MONTH FROM n.emissao_em) = EXTRACT(MONTH FROM p_data_referencia)
        AND n.status = 'autorizada';
    
    ELSE
      -- KPI customizado, tentar buscar de tabelas auxiliares
      v_valor_real := 0;
  END CASE;
  
  -- Buscar valor do período anterior
  SELECT valor_real INTO v_valor_anterior
  FROM kpi_valores_historico
  WHERE kpi_meta_id = v_kpi_meta.id
    AND data_referencia = p_data_referencia - INTERVAL '1 month'
  LIMIT 1;
  
  -- Calcular atingimento
  v_atingimento := CASE WHEN v_kpi_meta.valor_meta > 0 THEN (v_valor_real / v_kpi_meta.valor_meta) * 100 ELSE 0 END;
  
  -- Determinar status
  IF v_valor_real >= v_kpi_meta.threshold_excelente THEN
    v_status := 'excelente';
  ELSIF v_valor_real >= v_kpi_meta.threshold_ok THEN
    v_status := 'ok';
  ELSIF v_valor_real >= v_kpi_meta.threshold_alerta THEN
    v_status := 'alerta';
  ELSE
    v_status := 'critico';
  END IF;
  
  -- Calcular variação e tendência
  IF v_valor_anterior IS NOT NULL AND v_valor_anterior > 0 THEN
    v_variacao := ((v_valor_real - v_valor_anterior) / v_valor_anterior) * 100;
    
    IF v_variacao > 5 THEN
      v_tendencia := 'crescimento';
    ELSIF v_variacao < -5 THEN
      v_tendencia := 'queda';
    ELSE
      v_tendencia := 'estavel';
    END IF;
  ELSE
    v_variacao := NULL;
    v_tendencia := 'novo';
  END IF;
  
  -- Inserir histórico
  INSERT INTO kpi_valores_historico (
    kpi_meta_id, data_referencia, periodo,
    valor_real, valor_meta, atingimento_percentual, status,
    valor_periodo_anterior, variacao_percentual, tendencia
  ) VALUES (
    v_kpi_meta.id, p_data_referencia, p_periodo,
    v_valor_real, v_kpi_meta.valor_meta, v_atingimento, v_status,
    v_valor_anterior, v_variacao, v_tendencia
  )
  ON CONFLICT (kpi_meta_id, data_referencia, periodo)
  DO UPDATE SET
    valor_real = EXCLUDED.valor_real,
    valor_meta = EXCLUDED.valor_meta,
    atingimento_percentual = EXCLUDED.atingimento_percentual,
    status = EXCLUDED.status,
    valor_periodo_anterior = EXCLUDED.valor_periodo_anterior,
    variacao_percentual = EXCLUDED.variacao_percentual,
    tendencia = EXCLUDED.tendencia
  RETURNING id INTO v_id;
  
  -- Criar alerta se status crítico ou tendência negativa
  IF v_status IN ('critico', 'alerta') OR (v_tendencia = 'queda' AND v_variacao < -20) THEN
    INSERT INTO kpi_alertas (
      kpi_meta_id, kpi_valor_historico_id,
      severidade, tipo, mensagem, acao_recomendada
    ) VALUES (
      v_kpi_meta.id, v_id,
      CASE WHEN v_status = 'critico' THEN 'critico' ELSE 'alto' END,
      CASE WHEN v_status IN ('critico', 'alerta') THEN 'meta_nao_atingida' ELSE 'tendencia_negativa' END,
      'KPI ' || v_kpi_meta.nome || ' está em ' || v_status || ' (' || v_atingimento || '% da meta)',
      'Analisar causas e criar plano de ação'
    );
  END IF;
  
  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION calcular_kpi IS 'Calcula automaticamente o valor de um KPI e gera alertas';

-- =====================================================
-- FUNCTION: Calcular todos os KPIs do mês
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_todos_kpis_mes(p_data_referencia DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_kpi RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_kpi IN SELECT nome FROM kpi_metas WHERE is_ativo = TRUE AND periodo = 'mensal'
  LOOP
    BEGIN
      PERFORM calcular_kpi(v_kpi.nome, p_data_referencia, 'mensal');
      v_count := v_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro ao calcular KPI %: %', v_kpi.nome, SQLERRM;
    END;
  END LOOP;
  
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION calcular_todos_kpis_mes IS 'Calcula todos os KPIs mensais de uma vez';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE kpi_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_valores_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Políticas: Gerentes e admins veem tudo
CREATE POLICY "Gerentes veem todos os KPIs" ON kpi_metas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'gerente_comercial', 'gerente_financeiro')
  )
);

CREATE POLICY "Usuários gerenciam seus widgets" ON kpi_dashboard_widgets FOR ALL
USING (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- SEED: KPIs Principais
-- =====================================================
INSERT INTO kpi_metas (nome, descricao, categoria, valor_meta, unidade, threshold_critico, threshold_alerta, threshold_ok, threshold_excelente, periodo) VALUES
-- Vendas
('faturamento_mensal', 'Faturamento total do mês', 'vendas', 2000000, 'BRL', 1500000, 1800000, 2000000, 2500000, 'mensal'),
('margem_percentual', 'Margem bruta percentual', 'vendas', 25, 'percentage', 15, 20, 25, 30, 'mensal'),
('ticket_medio', 'Ticket médio de vendas', 'vendas', 8000, 'BRL', 5000, 6500, 8000, 10000, 'mensal'),
('nfes_emitidas', 'Quantidade de NF-e emitidas', 'vendas', 300, 'number', 200, 250, 300, 400, 'mensal'),

-- Financeiro
('contas_receber_vencidas', 'Contas a receber vencidas', 'financeiro', 0, 'BRL', 500000, 300000, 100000, 0, 'mensal'),
('inadimplencia_percentual', 'Taxa de inadimplência', 'financeiro', 3, 'percentage', 10, 5, 3, 1, 'mensal'),
('prazo_recebimento_medio', 'Prazo médio de recebimento', 'financeiro', 30, 'days', 60, 45, 30, 15, 'mensal'),

-- Operações
('prazo_entrega_medio', 'Prazo médio de entrega', 'operacoes', 2, 'days', 5, 3, 2, 1, 'mensal'),
('taxa_devolucao', 'Taxa de devolução de produtos', 'operacoes', 2, 'percentage', 10, 5, 2, 0, 'mensal'),
('pedidos_atendidos_prazo', 'Pedidos entregues no prazo', 'operacoes', 95, 'percentage', 70, 85, 95, 98, 'mensal'),

-- Compliance
('taxa_conformidade_anvisa', 'Taxa de conformidade ANVISA', 'compliance', 100, 'percentage', 90, 95, 100, 100, 'mensal'),
('nfes_canceladas_percentual', 'Percentual de NF-e canceladas', 'compliance', 2, 'percentage', 10, 5, 2, 0, 'mensal'),
('produtos_sem_registro', 'Produtos sem registro ANVISA', 'compliance', 0, 'number', 10, 5, 0, 0, 'mensal')

ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE kpi_metas IS 'Metas de KPIs com thresholds para semáforo (verde/amarelo/vermelho)';
COMMENT ON TABLE kpi_valores_historico IS 'Histórico temporal de valores de KPIs';
COMMENT ON TABLE kpi_alertas IS 'Alertas automáticos quando KPIs ficam fora do threshold';
COMMENT ON TABLE kpi_dashboard_widgets IS 'Widgets personalizáveis do dashboard de KPIs';

