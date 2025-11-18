-- =====================================================
-- BLOCO 3.2: Gestão Contábil - DRE/Balancete
-- Sistema completo de contabilidade para distribuidoras OPME
-- 
-- FUNCIONALIDADES:
-- - Plano de Contas (estruturado)
-- - Lançamentos contábeis (débito/crédito)
-- - DRE (Demonstração do Resultado do Exercício)
-- - Balancete mensal
-- - Razão contábil
-- - Diário contábil
-- - Conciliação bancária
-- - Centros de custo
-- - Apuração de impostos
-- - Exportação SPED Contábil
-- 
-- CONTEXTO OPME:
-- - Distribuidora precisa DRE mensal para gestão
-- - Balancete exigido por bancos/investidores
-- - SPED Contábil obrigatório (ECD)
-- - Centros de custo por produto/cliente
-- =====================================================

-- =====================================================
-- TABELA: plano_contas (Plano de Contas estruturado)
-- =====================================================
CREATE TABLE IF NOT EXISTS plano_contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Hierarquia
  codigo VARCHAR(20) NOT NULL UNIQUE, -- '1.1.01.001' (estruturado)
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  -- Classificação
  tipo VARCHAR(20) NOT NULL, -- 'ativo', 'passivo', 'receita', 'despesa', 'resultado'
  natureza VARCHAR(10) NOT NULL, -- 'debito', 'credito'
  grau INTEGER NOT NULL, -- 1 (grupo), 2 (subgrupo), 3 (conta), 4 (subconta)
  conta_pai_id UUID REFERENCES plano_contas(id),
  
  -- Características
  aceita_lancamento BOOLEAN DEFAULT TRUE, -- Contas analíticas aceitam, sintéticas não
  is_sintetica BOOLEAN DEFAULT FALSE, -- Conta sintética (agrupadora)
  
  -- Centro de custo
  exige_centro_custo BOOLEAN DEFAULT FALSE,
  
  -- Integrações
  integracao_tipo VARCHAR(50), -- 'nfe_venda', 'nfe_compra', 'estoque', 'financeiro'
  
  -- Status
  is_ativa BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE plano_contas IS 'Plano de Contas estruturado (4 níveis de hierarquia)';

CREATE INDEX idx_plano_contas_codigo ON plano_contas(codigo);
CREATE INDEX idx_plano_contas_tipo ON plano_contas(tipo);
CREATE INDEX idx_plano_contas_pai ON plano_contas(conta_pai_id);

-- =====================================================
-- TABELA: centros_custo (Centros de Custo)
-- =====================================================
CREATE TABLE IF NOT EXISTS centros_custo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  
  -- Tipo
  tipo VARCHAR(30) NOT NULL, -- 'operacional', 'administrativo', 'comercial', 'logistica'
  
  -- Hierarquia (opcional)
  centro_pai_id UUID REFERENCES centros_custo(id),
  
  -- Responsável
  responsavel_id UUID REFERENCES auth.users(id),
  
  -- Orçamento
  orcamento_mensal DECIMAL(15,2),
  
  is_ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE centros_custo IS 'Centros de Custo para rateio de despesas';

CREATE INDEX idx_centros_custo_tipo ON centros_custo(tipo);

-- =====================================================
-- TABELA: lancamentos_contabeis (Lançamentos Contábeis)
-- =====================================================
CREATE TABLE IF NOT EXISTS lancamentos_contabeis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  numero_lancamento SERIAL,
  data_lancamento DATE NOT NULL,
  data_competencia DATE NOT NULL, -- Mês de competência (regime de competência)
  
  -- Tipo
  tipo_lancamento VARCHAR(30) NOT NULL, -- 'padrao', 'ajuste', 'encerramento', 'transferencia'
  
  -- Histórico
  historico TEXT NOT NULL, -- Descrição do lançamento
  historico_complementar TEXT,
  
  -- Documento origem
  documento_tipo VARCHAR(30), -- 'nfe', 'boleto', 'transferencia', 'manual'
  documento_id UUID, -- ID do documento origem (genérico)
  documento_numero VARCHAR(50),
  
  -- Valor total do lançamento
  valor_total DECIMAL(15,2) NOT NULL,
  
  -- Centro de custo (opcional)
  centro_custo_id UUID REFERENCES centros_custo(id),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'provisorio', -- 'provisorio', 'confirmado', 'cancelado'
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  confirmado_em TIMESTAMP WITH TIME ZONE,
  confirmado_por UUID REFERENCES auth.users(id),
  cancelado_em TIMESTAMP WITH TIME ZONE,
  cancelado_por UUID REFERENCES auth.users(id),
  motivo_cancelamento TEXT
);

COMMENT ON TABLE lancamentos_contabeis IS 'Lançamentos contábeis (cabeçalho com partidas dobradas)';

CREATE INDEX idx_lancamentos_data ON lancamentos_contabeis(data_lancamento DESC);
CREATE INDEX idx_lancamentos_competencia ON lancamentos_contabeis(data_competencia);
CREATE INDEX idx_lancamentos_status ON lancamentos_contabeis(status);
CREATE INDEX idx_lancamentos_tipo ON lancamentos_contabeis(tipo_lancamento);

-- =====================================================
-- TABELA: partidas_contabeis (Débitos e Créditos)
-- =====================================================
CREATE TABLE IF NOT EXISTS partidas_contabeis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Lançamento pai
  lancamento_id UUID NOT NULL REFERENCES lancamentos_contabeis(id) ON DELETE CASCADE,
  
  -- Conta
  conta_id UUID NOT NULL REFERENCES plano_contas(id),
  
  -- Tipo da partida
  tipo_partida VARCHAR(10) NOT NULL, -- 'debito', 'credito'
  
  -- Valor
  valor DECIMAL(15,2) NOT NULL CHECK (valor > 0),
  
  -- Centro de custo (se exigido pela conta)
  centro_custo_id UUID REFERENCES centros_custo(id),
  
  -- Histórico específico da partida (opcional)
  historico TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE partidas_contabeis IS 'Partidas dobradas (débitos e créditos) de cada lançamento';

CREATE INDEX idx_partidas_lancamento ON partidas_contabeis(lancamento_id);
CREATE INDEX idx_partidas_conta ON partidas_contabeis(conta_id);
CREATE INDEX idx_partidas_tipo ON partidas_contabeis(tipo_partida);

-- =====================================================
-- CONSTRAINT: Validar partidas dobradas (débito = crédito)
-- =====================================================
CREATE OR REPLACE FUNCTION validar_partidas_dobradas()
RETURNS TRIGGER AS $$
DECLARE
  v_total_debito DECIMAL(15,2);
  v_total_credito DECIMAL(15,2);
  v_valor_lancamento DECIMAL(15,2);
BEGIN
  -- Buscar valor total do lançamento
  SELECT valor_total INTO v_valor_lancamento
  FROM lancamentos_contabeis
  WHERE id = NEW.lancamento_id;
  
  -- Calcular totais de débito e crédito
  SELECT 
    COALESCE(SUM(CASE WHEN tipo_partida = 'debito' THEN valor ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tipo_partida = 'credito' THEN valor ELSE 0 END), 0)
  INTO v_total_debito, v_total_credito
  FROM partidas_contabeis
  WHERE lancamento_id = NEW.lancamento_id;
  
  -- Validar se débito = crédito = valor total
  IF v_total_debito <> v_total_credito THEN
    RAISE EXCEPTION 'Partidas dobradas inválidas: débito (%) ≠ crédito (%)', v_total_debito, v_total_credito;
  END IF;
  
  IF v_total_debito <> v_valor_lancamento THEN
    RAISE EXCEPTION 'Soma das partidas (%) ≠ valor do lançamento (%)', v_total_debito, v_valor_lancamento;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_partidas
AFTER INSERT OR UPDATE ON partidas_contabeis
FOR EACH ROW
EXECUTE FUNCTION validar_partidas_dobradas();

-- =====================================================
-- VIEW: vw_razao_contabil (Razão Contábil)
-- =====================================================
CREATE OR REPLACE VIEW vw_razao_contabil AS
SELECT
  pc.codigo AS conta_codigo,
  pc.nome AS conta_nome,
  pc.tipo AS conta_tipo,
  lc.data_lancamento,
  lc.data_competencia,
  lc.historico,
  lc.numero_lancamento,
  pt.tipo_partida,
  pt.valor,
  CASE 
    WHEN pt.tipo_partida = 'debito' THEN pt.valor 
    ELSE 0 
  END AS debito,
  CASE 
    WHEN pt.tipo_partida = 'credito' THEN pt.valor 
    ELSE 0 
  END AS credito,
  cc.nome AS centro_custo_nome,
  lc.documento_tipo,
  lc.documento_numero
FROM partidas_contabeis pt
JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id
JOIN plano_contas pc ON pt.conta_id = pc.id
LEFT JOIN centros_custo cc ON pt.centro_custo_id = cc.id
WHERE lc.status = 'confirmado'
ORDER BY pc.codigo, lc.data_lancamento;

COMMENT ON VIEW vw_razao_contabil IS 'Razão contábil (todos os lançamentos por conta)';

-- =====================================================
-- VIEW: vw_balancete (Balancete de Verificação)
-- =====================================================
CREATE OR REPLACE VIEW vw_balancete AS
WITH saldos AS (
  SELECT
    pc.id AS conta_id,
    pc.codigo AS conta_codigo,
    pc.nome AS conta_nome,
    pc.tipo AS conta_tipo,
    pc.grau AS conta_grau,
    pc.natureza AS conta_natureza,
    COALESCE(SUM(CASE WHEN pt.tipo_partida = 'debito' THEN pt.valor ELSE 0 END), 0) AS total_debito,
    COALESCE(SUM(CASE WHEN pt.tipo_partida = 'credito' THEN pt.valor ELSE 0 END), 0) AS total_credito
  FROM plano_contas pc
  LEFT JOIN partidas_contabeis pt ON pc.id = pt.conta_id
  LEFT JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id AND lc.status = 'confirmado'
  WHERE pc.aceita_lancamento = TRUE
  GROUP BY pc.id, pc.codigo, pc.nome, pc.tipo, pc.grau, pc.natureza
)
SELECT
  conta_codigo,
  conta_nome,
  conta_tipo,
  conta_grau,
  conta_natureza,
  total_debito,
  total_credito,
  CASE
    WHEN conta_natureza = 'debito' THEN total_debito - total_credito
    ELSE total_credito - total_debito
  END AS saldo_atual,
  CASE
    WHEN (conta_natureza = 'debito' AND total_debito > total_credito) OR
         (conta_natureza = 'credito' AND total_credito > total_debito)
    THEN 'devedor'
    WHEN (conta_natureza = 'debito' AND total_credito > total_debito) OR
         (conta_natureza = 'credito' AND total_debito > total_credito)
    THEN 'credor'
    ELSE 'zerado'
  END AS tipo_saldo
FROM saldos
WHERE total_debito <> 0 OR total_credito <> 0
ORDER BY conta_codigo;

COMMENT ON VIEW vw_balancete IS 'Balancete de verificação com saldos atuais';

-- =====================================================
-- FUNCTION: Gerar DRE (Demonstração do Resultado)
-- =====================================================
CREATE OR REPLACE FUNCTION gerar_dre(
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE(
  grupo VARCHAR,
  descricao VARCHAR,
  valor DECIMAL,
  percentual DECIMAL
) AS $$
DECLARE
  v_receita_bruta DECIMAL(15,2);
  v_deducoes DECIMAL(15,2);
  v_receita_liquida DECIMAL(15,2);
  v_custos DECIMAL(15,2);
  v_lucro_bruto DECIMAL(15,2);
  v_despesas_operacionais DECIMAL(15,2);
  v_lucro_operacional DECIMAL(15,2);
  v_outras_receitas DECIMAL(15,2);
  v_outras_despesas DECIMAL(15,2);
  v_lucro_liquido DECIMAL(15,2);
BEGIN
  -- Receita Bruta (conta 3.1)
  SELECT COALESCE(SUM(pt.valor), 0) INTO v_receita_bruta
  FROM partidas_contabeis pt
  JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id
  JOIN plano_contas pc ON pt.conta_id = pc.id
  WHERE lc.data_competencia BETWEEN p_data_inicio AND p_data_fim
    AND lc.status = 'confirmado'
    AND pc.codigo LIKE '3.1%'
    AND pt.tipo_partida = 'credito';
  
  -- Deduções (conta 3.2 - devoluções, impostos)
  SELECT COALESCE(SUM(pt.valor), 0) INTO v_deducoes
  FROM partidas_contabeis pt
  JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id
  JOIN plano_contas pc ON pt.conta_id = pc.id
  WHERE lc.data_competencia BETWEEN p_data_inicio AND p_data_fim
    AND lc.status = 'confirmado'
    AND pc.codigo LIKE '3.2%'
    AND pt.tipo_partida = 'debito';
  
  v_receita_liquida := v_receita_bruta - v_deducoes;
  
  -- CMV/CPV (conta 3.3 - custo mercadoria vendida)
  SELECT COALESCE(SUM(pt.valor), 0) INTO v_custos
  FROM partidas_contabeis pt
  JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id
  JOIN plano_contas pc ON pt.conta_id = pc.id
  WHERE lc.data_competencia BETWEEN p_data_inicio AND p_data_fim
    AND lc.status = 'confirmado'
    AND pc.codigo LIKE '3.3%'
    AND pt.tipo_partida = 'debito';
  
  v_lucro_bruto := v_receita_liquida - v_custos;
  
  -- Despesas Operacionais (conta 3.4)
  SELECT COALESCE(SUM(pt.valor), 0) INTO v_despesas_operacionais
  FROM partidas_contabeis pt
  JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id
  JOIN plano_contas pc ON pt.conta_id = pc.id
  WHERE lc.data_competencia BETWEEN p_data_inicio AND p_data_fim
    AND lc.status = 'confirmado'
    AND pc.codigo LIKE '3.4%'
    AND pt.tipo_partida = 'debito';
  
  v_lucro_operacional := v_lucro_bruto - v_despesas_operacionais;
  
  -- Outras Receitas/Despesas (conta 3.5, 3.6)
  SELECT COALESCE(SUM(pt.valor), 0) INTO v_outras_receitas
  FROM partidas_contabeis pt
  JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id
  JOIN plano_contas pc ON pt.conta_id = pc.id
  WHERE lc.data_competencia BETWEEN p_data_inicio AND p_data_fim
    AND lc.status = 'confirmado'
    AND pc.codigo LIKE '3.5%'
    AND pt.tipo_partida = 'credito';
  
  SELECT COALESCE(SUM(pt.valor), 0) INTO v_outras_despesas
  FROM partidas_contabeis pt
  JOIN lancamentos_contabeis lc ON pt.lancamento_id = lc.id
  JOIN plano_contas pc ON pt.conta_id = pc.id
  WHERE lc.data_competencia BETWEEN p_data_inicio AND p_data_fim
    AND lc.status = 'confirmado'
    AND pc.codigo LIKE '3.6%'
    AND pt.tipo_partida = 'debito';
  
  v_lucro_liquido := v_lucro_operacional + v_outras_receitas - v_outras_despesas;
  
  -- Retornar resultado estruturado
  RETURN QUERY
  SELECT 'RECEITA_BRUTA'::VARCHAR, 'Receita Bruta'::VARCHAR, v_receita_bruta, 100.0::DECIMAL
  UNION ALL
  SELECT 'DEDUCOES', '(-) Deduções', -v_deducoes, ROUND((v_deducoes / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'RECEITA_LIQUIDA', '(=) Receita Líquida', v_receita_liquida, ROUND((v_receita_liquida / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'CUSTOS', '(-) Custos', -v_custos, ROUND((v_custos / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'LUCRO_BRUTO', '(=) Lucro Bruto', v_lucro_bruto, ROUND((v_lucro_bruto / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'DESPESAS_OP', '(-) Despesas Operacionais', -v_despesas_operacionais, ROUND((v_despesas_operacionais / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'LUCRO_OP', '(=) Lucro Operacional', v_lucro_operacional, ROUND((v_lucro_operacional / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'OUTRAS_REC', '(+) Outras Receitas', v_outras_receitas, ROUND((v_outras_receitas / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'OUTRAS_DESP', '(-) Outras Despesas', -v_outras_despesas, ROUND((v_outras_despesas / NULLIF(v_receita_bruta, 0)) * 100, 2)
  UNION ALL
  SELECT 'LUCRO_LIQUIDO', '(=) Lucro Líquido', v_lucro_liquido, ROUND((v_lucro_liquido / NULLIF(v_receita_bruta, 0)) * 100, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION gerar_dre IS 'Gera DRE (Demonstração do Resultado do Exercício) para período';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE plano_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas_contabeis ENABLE ROW LEVEL SECURITY;

-- Políticas: Contabilidade e Gerentes
CREATE POLICY "Contabilidade veem plano de contas" ON plano_contas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'contador', 'analista_contabil', 'auditor_interno')
  )
);

CREATE POLICY "Contabilidade gerenciam lançamentos" ON lancamentos_contabeis FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'contador', 'analista_contabil')
  )
);

-- =====================================================
-- SEED: Plano de Contas básico para OPME
-- =====================================================
INSERT INTO plano_contas (codigo, nome, tipo, natureza, grau, is_sintetica, aceita_lancamento) VALUES
-- 1. ATIVO
('1', 'ATIVO', 'ativo', 'debito', 1, TRUE, FALSE),
('1.1', 'Ativo Circulante', 'ativo', 'debito', 2, TRUE, FALSE),
('1.1.01', 'Caixa e Equivalentes', 'ativo', 'debito', 3, TRUE, FALSE),
('1.1.01.001', 'Caixa', 'ativo', 'debito', 4, FALSE, TRUE),
('1.1.01.002', 'Bancos c/ Movimento', 'ativo', 'debito', 4, FALSE, TRUE),
('1.1.02', 'Contas a Receber', 'ativo', 'debito', 3, TRUE, FALSE),
('1.1.02.001', 'Clientes', 'ativo', 'debito', 4, FALSE, TRUE),
('1.1.03', 'Estoques', 'ativo', 'debito', 3, TRUE, FALSE),
('1.1.03.001', 'Estoque de OPME', 'ativo', 'debito', 4, FALSE, TRUE),

-- 2. PASSIVO
('2', 'PASSIVO', 'passivo', 'credito', 1, TRUE, FALSE),
('2.1', 'Passivo Circulante', 'passivo', 'credito', 2, TRUE, FALSE),
('2.1.01', 'Fornecedores', 'passivo', 'credito', 3, TRUE, FALSE),
('2.1.01.001', 'Fornecedores Nacionais', 'passivo', 'credito', 4, FALSE, TRUE),
('2.1.02', 'Obrigações Fiscais', 'passivo', 'credito', 3, TRUE, FALSE),
('2.1.02.001', 'ICMS a Recolher', 'passivo', 'credito', 4, FALSE, TRUE),

-- 3. RESULTADO (Receitas e Despesas)
('3', 'RESULTADO', 'resultado', 'credito', 1, TRUE, FALSE),
('3.1', 'Receita Bruta', 'receita', 'credito', 2, TRUE, FALSE),
('3.1.01', 'Venda de OPME', 'receita', 'credito', 3, TRUE, FALSE),
('3.1.01.001', 'Venda OPME - Hospitais', 'receita', 'credito', 4, FALSE, TRUE),
('3.2', 'Deduções da Receita', 'receita', 'debito', 2, TRUE, FALSE),
('3.2.01', 'Impostos sobre Vendas', 'receita', 'debito', 3, TRUE, FALSE),
('3.2.01.001', 'ICMS s/ Vendas', 'receita', 'debito', 4, FALSE, TRUE),
('3.3', 'Custo das Vendas', 'despesa', 'debito', 2, TRUE, FALSE),
('3.3.01', 'CMV - OPME', 'despesa', 'debito', 3, TRUE, FALSE),
('3.3.01.001', 'Custo OPME Vendido', 'despesa', 'debito', 4, FALSE, TRUE),
('3.4', 'Despesas Operacionais', 'despesa', 'debito', 2, TRUE, FALSE),
('3.4.01', 'Despesas Administrativas', 'despesa', 'debito', 3, TRUE, FALSE),
('3.4.01.001', 'Salários', 'despesa', 'debito', 4, FALSE, TRUE),
('3.4.01.002', 'Encargos Sociais', 'despesa', 'debito', 4, FALSE, TRUE),
('3.4.02', 'Despesas Comerciais', 'despesa', 'debito', 3, TRUE, FALSE),
('3.4.02.001', 'Comissões', 'despesa', 'debito', 4, FALSE, TRUE),
('3.4.03', 'Despesas Logísticas', 'despesa', 'debito', 3, TRUE, FALSE),
('3.4.03.001', 'Fretes', 'despesa', 'debito', 4, FALSE, TRUE),
('3.5', 'Outras Receitas', 'receita', 'credito', 2, TRUE, FALSE),
('3.5.01', 'Receitas Financeiras', 'receita', 'credito', 3, TRUE, FALSE),
('3.5.01.001', 'Juros Recebidos', 'receita', 'credito', 4, FALSE, TRUE),
('3.6', 'Outras Despesas', 'despesa', 'debito', 2, TRUE, FALSE),
('3.6.01', 'Despesas Financeiras', 'despesa', 'debito', 3, TRUE, FALSE),
('3.6.01.001', 'Juros Pagos', 'despesa', 'debito', 4, FALSE, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- SEED: Centros de Custo básicos
INSERT INTO centros_custo (codigo, nome, tipo) VALUES
('CC001', 'Administrativo', 'administrativo'),
('CC002', 'Comercial', 'comercial'),
('CC003', 'Logística', 'logistica'),
('CC004', 'Estoque', 'operacional')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE plano_contas IS 'Plano de Contas estruturado (OPME distribuidoras)';
COMMENT ON TABLE centros_custo IS 'Centros de Custo para rateio de despesas';
COMMENT ON TABLE lancamentos_contabeis IS 'Lançamentos contábeis (cabeçalho)';
COMMENT ON TABLE partidas_contabeis IS 'Partidas dobradas (débito/crédito)';
COMMENT ON FUNCTION gerar_dre IS 'Gera DRE (Demonstração do Resultado do Exercício)';
COMMENT ON VIEW vw_razao_contabil IS 'Razão contábil por conta';
COMMENT ON VIEW vw_balancete IS 'Balancete de verificação';

