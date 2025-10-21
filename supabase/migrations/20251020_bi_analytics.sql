-- =====================================================
-- BLOCO 2.1: BI Dashboard Interativo - Analytics Avançado
-- Sistema completo de Business Intelligence para distribuidoras OPME
-- 
-- FUNCIONALIDADES:
-- - Análises multidimensionais (tempo, produto, cliente, vendedor)
-- - Métricas de performance (vendas, margem, giro)
-- - Análises preditivas (ML para previsão de demanda)
-- - Drill-down e drill-up
-- - Exportação de relatórios
-- - Dashboards personalizáveis por usuário
-- 
-- CONTEXTO OPME:
-- - Hospitais (clientes)
-- - Produtos OPME (código ANVISA)
-- - Planos de Saúde (pagadores)
-- - Indústrias (fornecedores)
-- =====================================================

-- =====================================================
-- TABELA: bi_dimensao_tempo (Dimensão Tempo)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_dimensao_tempo (
  data_id SERIAL PRIMARY KEY,
  data_completa DATE NOT NULL UNIQUE,
  
  -- Hierarquia temporal
  ano INTEGER NOT NULL,
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 53),
  dia INTEGER NOT NULL CHECK (dia BETWEEN 1 AND 31),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo
  dia_ano INTEGER NOT NULL CHECK (dia_ano BETWEEN 1 AND 366),
  
  -- Labels
  nome_mes VARCHAR(20) NOT NULL, -- 'Janeiro', 'Fevereiro', etc.
  nome_dia_semana VARCHAR(20) NOT NULL, -- 'Segunda', 'Terça', etc.
  trimestre_label VARCHAR(10) NOT NULL, -- 'Q1 2025'
  mes_ano_label VARCHAR(10) NOT NULL, -- 'Jan/2025'
  
  -- Flags
  is_feriado BOOLEAN DEFAULT FALSE,
  is_fim_semana BOOLEAN DEFAULT FALSE,
  is_dia_util BOOLEAN DEFAULT TRUE,
  nome_feriado VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bi_dimensao_tempo IS 'Dimensão temporal para análises de BI';

-- Criar índices
CREATE INDEX idx_bi_dim_tempo_ano ON bi_dimensao_tempo(ano);
CREATE INDEX idx_bi_dim_tempo_mes ON bi_dimensao_tempo(ano, mes);
CREATE INDEX idx_bi_dim_tempo_trimestre ON bi_dimensao_tempo(ano, trimestre);

-- =====================================================
-- TABELA: bi_dimensao_produto (Dimensão Produto OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_dimensao_produto (
  produto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  
  -- Classificação
  categoria VARCHAR(100), -- 'Cardiovascular', 'Ortopedia', 'Neurologia', etc.
  subcategoria VARCHAR(100),
  tipo_opme VARCHAR(50), -- 'Órtese', 'Prótese', 'Material Especial'
  
  -- ANVISA
  registro_anvisa VARCHAR(50),
  fabricante VARCHAR(200),
  pais_origem VARCHAR(50),
  
  -- Financeiro
  custo_medio DECIMAL(15,2),
  preco_venda_medio DECIMAL(15,2),
  margem_percentual DECIMAL(5,2),
  
  -- Classificação ABC
  classe_abc VARCHAR(1) CHECK (classe_abc IN ('A', 'B', 'C')), -- A=80% faturamento, B=15%, C=5%
  classe_xyz VARCHAR(1) CHECK (classe_xyz IN ('X', 'Y', 'Z')), -- X=demanda constante, Y=variável, Z=esporádica
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  data_ativacao DATE,
  data_inativacao DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dimensao_produto IS 'Dimensão de produtos OPME para análises';

-- Criar índices
CREATE INDEX idx_bi_dim_produto_categoria ON bi_dimensao_produto(categoria);
CREATE INDEX idx_bi_dim_produto_classe_abc ON bi_dimensao_produto(classe_abc);
CREATE INDEX idx_bi_dim_produto_ativo ON bi_dimensao_produto(is_ativo);

-- =====================================================
-- TABELA: bi_dimensao_cliente (Dimensão Cliente - Hospital)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_dimensao_cliente (
  cliente_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  
  -- Classificação
  tipo VARCHAR(50) NOT NULL, -- 'Hospital Público', 'Hospital Privado', 'Clínica', 'Maternidade'
  porte VARCHAR(20), -- 'Pequeno', 'Médio', 'Grande'
  especialidade VARCHAR(100), -- 'Cardiologia', 'Ortopedia', 'Geral'
  
  -- Localização
  cidade VARCHAR(100),
  estado VARCHAR(2),
  regiao VARCHAR(20), -- 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'
  
  -- Relacionamento
  tempo_cliente_dias INTEGER, -- Dias desde primeiro pedido
  segmento VARCHAR(20), -- 'VIP', 'Premium', 'Regular', 'Novo'
  score_credito INTEGER CHECK (score_credito BETWEEN 0 AND 1000),
  
  -- Performance
  total_faturado DECIMAL(15,2) DEFAULT 0,
  ticket_medio DECIMAL(15,2) DEFAULT 0,
  inadimplencia_percentual DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  data_cadastro DATE,
  data_ultimo_pedido DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dimensao_cliente IS 'Dimensão de clientes (hospitais) para análises';

-- Criar índices
CREATE INDEX idx_bi_dim_cliente_tipo ON bi_dimensao_cliente(tipo);
CREATE INDEX idx_bi_dim_cliente_regiao ON bi_dimensao_cliente(regiao);
CREATE INDEX idx_bi_dim_cliente_segmento ON bi_dimensao_cliente(segmento);

-- =====================================================
-- TABELA: bi_dimensao_vendedor (Dimensão Vendedor)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_dimensao_vendedor (
  vendedor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  user_id UUID REFERENCES auth.users(id),
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  
  -- Hierarquia
  gerente_id UUID REFERENCES bi_dimensao_vendedor(vendedor_id),
  equipe VARCHAR(100), -- 'Equipe Sul', 'Equipe Nordeste'
  
  -- Performance
  meta_mensal DECIMAL(15,2),
  comissao_percentual DECIMAL(5,2),
  total_vendido DECIMAL(15,2) DEFAULT 0,
  total_clientes_ativos INTEGER DEFAULT 0,
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  data_admissao DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dimensao_vendedor IS 'Dimensão de vendedores para análises';

CREATE INDEX idx_bi_dim_vendedor_equipe ON bi_dimensao_vendedor(equipe);
CREATE INDEX idx_bi_dim_vendedor_ativo ON bi_dimensao_vendedor(is_ativo);

-- =====================================================
-- TABELA: bi_fato_vendas (Fato Central - Vendas OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_fato_vendas (
  venda_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Chaves de dimensão (Foreign Keys)
  data_id INTEGER REFERENCES bi_dimensao_tempo(data_id),
  produto_id UUID REFERENCES bi_dimensao_produto(produto_id),
  cliente_id UUID REFERENCES bi_dimensao_cliente(cliente_id),
  vendedor_id UUID REFERENCES bi_dimensao_vendedor(vendedor_id),
  
  -- Chave de degeneração (NF-e)
  nfe_numero VARCHAR(20),
  nfe_chave_acesso VARCHAR(44),
  
  -- Métricas (measures)
  quantidade DECIMAL(15,3) NOT NULL,
  valor_unitario DECIMAL(15,2) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  custo_unitario DECIMAL(15,2) NOT NULL,
  custo_total DECIMAL(15,2) NOT NULL,
  margem_bruta DECIMAL(15,2) NOT NULL, -- valor_total - custo_total
  margem_percentual DECIMAL(5,2) NOT NULL, -- (margem_bruta / valor_total) * 100
  
  -- Impostos
  icms DECIMAL(15,2),
  ipi DECIMAL(15,2),
  pis DECIMAL(15,2),
  cofins DECIMAL(15,2),
  
  -- Desconto
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  desconto_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Pagamento
  plano_saude_id UUID, -- Referência ao plano que pagou
  forma_pagamento VARCHAR(50), -- 'À Vista', 'Parcelado', 'Convênio'
  prazo_dias INTEGER, -- Prazo médio de pagamento
  
  -- Status
  status VARCHAR(20) NOT NULL, -- 'Autorizada', 'Cancelada', 'Denegada'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bi_fato_vendas IS 'Tabela fato central com vendas de OPME';

-- Criar índices para performance em queries OLAP
CREATE INDEX idx_bi_fato_vendas_data ON bi_fato_vendas(data_id);
CREATE INDEX idx_bi_fato_vendas_produto ON bi_fato_vendas(produto_id);
CREATE INDEX idx_bi_fato_vendas_cliente ON bi_fato_vendas(cliente_id);
CREATE INDEX idx_bi_fato_vendas_vendedor ON bi_fato_vendas(vendedor_id);
CREATE INDEX idx_bi_fato_vendas_status ON bi_fato_vendas(status);
CREATE INDEX idx_bi_fato_vendas_composito ON bi_fato_vendas(data_id, produto_id, cliente_id);

-- =====================================================
-- TABELA: bi_metricas_agregadas (Cache de métricas)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_metricas_agregadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dimensões da agregação
  granularidade VARCHAR(20) NOT NULL, -- 'dia', 'semana', 'mes', 'trimestre', 'ano'
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  
  -- Filtros aplicados (JSON para flexibilidade)
  dimensoes JSONB, -- {'produto_id': '...', 'cliente_id': '...', etc.}
  
  -- Métricas agregadas
  total_vendas DECIMAL(15,2) NOT NULL,
  total_custo DECIMAL(15,2) NOT NULL,
  total_margem DECIMAL(15,2) NOT NULL,
  margem_percentual DECIMAL(5,2) NOT NULL,
  quantidade_vendida DECIMAL(15,3) NOT NULL,
  quantidade_nfes INTEGER NOT NULL,
  ticket_medio DECIMAL(15,2) NOT NULL,
  
  -- Crescimento vs período anterior
  crescimento_percentual DECIMAL(5,2),
  
  -- Timestamp de cálculo
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Cache expira após X tempo
);

COMMENT ON TABLE bi_metricas_agregadas IS 'Cache de métricas pré-calculadas para performance';

CREATE INDEX idx_bi_metricas_granularidade ON bi_metricas_agregadas(granularidade, periodo_inicio, periodo_fim);
CREATE INDEX idx_bi_metricas_expires ON bi_metricas_agregadas(expires_at);

-- =====================================================
-- TABELA: bi_previsao_demanda (ML - Previsão de Demanda)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_previsao_demanda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Produto
  produto_id UUID REFERENCES bi_dimensao_produto(produto_id),
  
  -- Período da previsão
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  
  -- Histórico
  media_vendas_6m DECIMAL(15,3), -- Média últimos 6 meses
  media_vendas_12m DECIMAL(15,3), -- Média últimos 12 meses
  tendencia VARCHAR(20), -- 'crescimento', 'estavel', 'queda'
  sazonalidade_fator DECIMAL(5,2), -- 1.0 = sem sazonalidade
  
  -- Previsão (ML)
  quantidade_prevista DECIMAL(15,3) NOT NULL,
  valor_previsto DECIMAL(15,2) NOT NULL,
  confianca_percentual INTEGER CHECK (confianca_percentual BETWEEN 0 AND 100),
  modelo_usado VARCHAR(50), -- 'ARIMA', 'Prophet', 'Linear Regression', 'Random Forest'
  
  -- Comparação real vs previsto
  quantidade_real DECIMAL(15,3),
  valor_real DECIMAL(15,2),
  acuracia_percentual DECIMAL(5,2), -- % de acerto
  
  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bi_previsao_demanda IS 'Previsões de demanda usando Machine Learning';

CREATE INDEX idx_bi_previsao_produto ON bi_previsao_demanda(produto_id, ano, mes);

-- =====================================================
-- TABELA: bi_dashboards_personalizados (Dashboards do usuário)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_dashboards_personalizados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  
  -- Configuração
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  is_padrao BOOLEAN DEFAULT FALSE, -- Dashboard padrão do usuário
  is_compartilhado BOOLEAN DEFAULT FALSE,
  
  -- Layout (React Grid Layout)
  layout JSONB NOT NULL, -- Posição e tamanho dos widgets
  
  -- Widgets (gráficos, tabelas, KPIs)
  widgets JSONB NOT NULL, -- [{ type, config, data_source, filters }]
  
  -- Filtros globais
  filtros_padrao JSONB, -- Filtros aplicados por padrão
  
  -- Refresh
  auto_refresh_seconds INTEGER DEFAULT 300, -- 5 min
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dashboards_personalizados IS 'Dashboards personalizáveis por usuário';

CREATE INDEX idx_bi_dashboards_user ON bi_dashboards_personalizados(user_id);

-- =====================================================
-- TABELA: bi_relatorios_agendados (Relatórios automáticos)
-- =====================================================
CREATE TABLE IF NOT EXISTS bi_relatorios_agendados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  
  -- Configuração
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'vendas_por_produto', 'performance_vendedor', 'margem_por_cliente'
  
  -- Agendamento (cron-like)
  frequencia VARCHAR(20) NOT NULL, -- 'diaria', 'semanal', 'mensal', 'trimestral'
  dia_semana INTEGER, -- 0-6 (se semanal)
  dia_mes INTEGER, -- 1-31 (se mensal)
  hora INTEGER, -- 0-23
  
  -- Filtros
  filtros JSONB,
  
  -- Formato de saída
  formato VARCHAR(20) NOT NULL, -- 'pdf', 'excel', 'csv'
  
  -- Destinatários (emails)
  destinatarios TEXT[], -- Array de emails
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_relatorios_agendados IS 'Relatórios automáticos agendados';

CREATE INDEX idx_bi_relatorios_proxima_exec ON bi_relatorios_agendados(proxima_execucao) WHERE is_ativo = TRUE;

-- =====================================================
-- VIEWS: Análises pré-calculadas
-- =====================================================

-- VIEW: Vendas por Produto (Top 20)
CREATE OR REPLACE VIEW vw_bi_vendas_por_produto AS
SELECT
  p.codigo,
  p.descricao,
  p.categoria,
  p.classe_abc,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.quantidade) AS quantidade_total,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  AVG(v.margem_percentual) AS margem_media_percentual,
  RANK() OVER (ORDER BY SUM(v.valor_total) DESC) AS ranking_valor
FROM bi_fato_vendas v
JOIN bi_dimensao_produto p ON v.produto_id = p.produto_id
WHERE v.status = 'Autorizada'
GROUP BY p.produto_id, p.codigo, p.descricao, p.categoria, p.classe_abc
ORDER BY valor_total DESC
LIMIT 20;

-- VIEW: Vendas por Cliente (Top 20)
CREATE OR REPLACE VIEW vw_bi_vendas_por_cliente AS
SELECT
  c.cnpj,
  c.razao_social,
  c.cidade,
  c.estado,
  c.segmento,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  AVG(v.margem_percentual) AS margem_media_percentual,
  RANK() OVER (ORDER BY SUM(v.valor_total) DESC) AS ranking_valor
FROM bi_fato_vendas v
JOIN bi_dimensao_cliente c ON v.cliente_id = c.cliente_id
WHERE v.status = 'Autorizada'
GROUP BY c.cliente_id, c.cnpj, c.razao_social, c.cidade, c.estado, c.segmento
ORDER BY valor_total DESC
LIMIT 20;

-- VIEW: Performance de Vendedores
CREATE OR REPLACE VIEW vw_bi_performance_vendedores AS
SELECT
  vd.nome,
  vd.equipe,
  vd.meta_mensal,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  CASE
    WHEN vd.meta_mensal > 0 THEN ROUND((SUM(v.valor_total) / vd.meta_mensal) * 100, 2)
    ELSE NULL
  END AS atingimento_meta_percentual,
  COUNT(DISTINCT v.cliente_id) AS clientes_atendidos,
  ROUND(AVG(v.valor_total), 2) AS ticket_medio
FROM bi_fato_vendas v
JOIN bi_dimensao_vendedor vd ON v.vendedor_id = vd.vendedor_id
WHERE v.status = 'Autorizada'
GROUP BY vd.vendedor_id, vd.nome, vd.equipe, vd.meta_mensal
ORDER BY valor_total DESC;

-- VIEW: Evolução Mensal de Vendas
CREATE OR REPLACE VIEW vw_bi_evolucao_mensal AS
SELECT
  t.ano,
  t.mes,
  t.mes_ano_label,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  ROUND(AVG(v.margem_percentual), 2) AS margem_media_percentual,
  COUNT(DISTINCT v.cliente_id) AS clientes_unicos,
  ROUND(SUM(v.valor_total) / NULLIF(COUNT(v.venda_id), 0), 2) AS ticket_medio
FROM bi_fato_vendas v
JOIN bi_dimensao_tempo t ON v.data_id = t.data_id
WHERE v.status = 'Autorizada'
GROUP BY t.ano, t.mes, t.mes_ano_label
ORDER BY t.ano DESC, t.mes DESC;

-- =====================================================
-- FUNCTIONS: Utilitários de BI
-- =====================================================

-- FUNCTION: Popular dimensão tempo (gerar 5 anos)
CREATE OR REPLACE FUNCTION populate_dimensao_tempo(p_ano_inicio INTEGER, p_anos INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_data DATE;
  v_data_fim DATE;
  v_count INTEGER := 0;
BEGIN
  v_data := DATE_TRUNC('year', (p_ano_inicio || '-01-01')::DATE);
  v_data_fim := v_data + (p_anos || ' years')::INTERVAL;
  
  WHILE v_data < v_data_fim LOOP
    INSERT INTO bi_dimensao_tempo (
      data_completa, ano, trimestre, mes, semana, dia, dia_semana, dia_ano,
      nome_mes, nome_dia_semana, trimestre_label, mes_ano_label,
      is_feriado, is_fim_semana, is_dia_util
    ) VALUES (
      v_data,
      EXTRACT(YEAR FROM v_data),
      EXTRACT(QUARTER FROM v_data),
      EXTRACT(MONTH FROM v_data),
      EXTRACT(WEEK FROM v_data),
      EXTRACT(DAY FROM v_data),
      EXTRACT(DOW FROM v_data),
      EXTRACT(DOY FROM v_data),
      TO_CHAR(v_data, 'TMMonth'),
      TO_CHAR(v_data, 'TMDay'),
      'Q' || EXTRACT(QUARTER FROM v_data) || ' ' || EXTRACT(YEAR FROM v_data),
      TO_CHAR(v_data, 'Mon/YYYY'),
      FALSE, -- is_feriado (atualizar manualmente)
      EXTRACT(DOW FROM v_data) IN (0, 6), -- is_fim_semana
      EXTRACT(DOW FROM v_data) NOT IN (0, 6) -- is_dia_util
    )
    ON CONFLICT (data_completa) DO NOTHING;
    
    v_data := v_data + 1;
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION populate_dimensao_tempo IS 'Popula dimensão tempo com N anos de dados';

-- FUNCTION: Calcular métricas agregadas (cache)
CREATE OR REPLACE FUNCTION calcular_metricas_agregadas(
  p_granularidade VARCHAR,
  p_periodo_inicio DATE,
  p_periodo_fim DATE,
  p_dimensoes JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
  v_total_vendas DECIMAL;
  v_total_custo DECIMAL;
  v_total_margem DECIMAL;
  v_quantidade DECIMAL;
  v_nfes INTEGER;
BEGIN
  -- Calcular métricas
  SELECT
    SUM(valor_total),
    SUM(custo_total),
    SUM(margem_bruta),
    SUM(quantidade),
    COUNT(DISTINCT nfe_numero)
  INTO
    v_total_vendas, v_total_custo, v_total_margem, v_quantidade, v_nfes
  FROM bi_fato_vendas v
  JOIN bi_dimensao_tempo t ON v.data_id = t.data_id
  WHERE t.data_completa BETWEEN p_periodo_inicio AND p_periodo_fim
    AND v.status = 'Autorizada';
  
  -- Inserir no cache
  INSERT INTO bi_metricas_agregadas (
    granularidade, periodo_inicio, periodo_fim, dimensoes,
    total_vendas, total_custo, total_margem,
    margem_percentual, quantidade_vendida, quantidade_nfes, ticket_medio,
    expires_at
  ) VALUES (
    p_granularidade, p_periodo_inicio, p_periodo_fim, p_dimensoes,
    v_total_vendas, v_total_custo, v_total_margem,
    CASE WHEN v_total_vendas > 0 THEN (v_total_margem / v_total_vendas) * 100 ELSE 0 END,
    v_quantidade,
    v_nfes,
    CASE WHEN v_nfes > 0 THEN v_total_vendas / v_nfes ELSE 0 END,
    NOW() + '1 hour'::INTERVAL
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION calcular_metricas_agregadas IS 'Calcula e armazena métricas agregadas no cache';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE bi_dimensao_tempo ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dimensao_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dimensao_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dimensao_vendedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_fato_vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_metricas_agregadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_previsao_demanda ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dashboards_personalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_relatorios_agendados ENABLE ROW LEVEL SECURITY;

-- Políticas: Vendedores só veem suas vendas, gerentes veem tudo
CREATE POLICY "Vendedores veem suas vendas" ON bi_fato_vendas FOR SELECT
USING (
  vendedor_id IN (
    SELECT vendedor_id FROM bi_dimensao_vendedor WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'gerente_comercial', 'gerente_financeiro')
  )
);

-- Políticas: Dashboards são privados ou compartilhados
CREATE POLICY "Usuários gerenciam seus dashboards" ON bi_dashboards_personalizados FOR ALL
USING (user_id = auth.uid() OR is_compartilhado = TRUE);

-- =====================================================
-- SEED: Popular dimensão tempo (2023-2027)
-- =====================================================
SELECT populate_dimensao_tempo(2023, 5);

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE bi_fato_vendas IS 'Tabela fato central: vendas de OPME para hospitais';
COMMENT ON TABLE bi_dimensao_tempo IS 'Dimensão temporal com hierarquia completa';
COMMENT ON TABLE bi_dimensao_produto IS 'Dimensão de produtos OPME com classificação ABC/XYZ';
COMMENT ON TABLE bi_dimensao_cliente IS 'Dimensão de clientes (hospitais) com segmentação';
COMMENT ON TABLE bi_dimensao_vendedor IS 'Dimensão de vendedores com hierarquia';

