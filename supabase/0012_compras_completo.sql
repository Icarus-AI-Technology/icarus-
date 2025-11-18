-- ============================================================================
-- MIGRATION: Compras e Fornecedores Completo
-- Versão: 5.0.0
-- Data: Outubro 2025
-- Descrição: Estrutura completa para Gestão de Compras e Fornecedores
-- ============================================================================

-- ============================================================================
-- 1. TABELA: solicitacoes_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Solicitação
  solicitante_id UUID NOT NULL REFERENCES usuarios(id),
  departamento TEXT,
  justificativa TEXT,
  urgencia TEXT CHECK (urgencia IN ('normal', 'urgente', 'emergencia')) DEFAULT 'normal',
  
  -- Status e Aprovação
  status TEXT CHECK (status IN ('rascunho', 'aguardando_aprovacao', 'aprovada', 'rejeitada', 'cancelada')) DEFAULT 'rascunho',
  aprovador_id UUID REFERENCES usuarios(id),
  data_aprovacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT solicitacoes_compra_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX idx_solicitacoes_compra_empresa ON solicitacoes_compra(empresa_id);
CREATE INDEX idx_solicitacoes_compra_solicitante ON solicitacoes_compra(solicitante_id);
CREATE INDEX idx_solicitacoes_compra_status ON solicitacoes_compra(status);
CREATE INDEX idx_solicitacoes_compra_urgencia ON solicitacoes_compra(urgencia);

-- Trigger
CREATE TRIGGER solicitacoes_compra_updated_at BEFORE UPDATE ON solicitacoes_compra
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE solicitacoes_compra IS 'Solicitações de compra internas';

-- ============================================================================
-- 2. TABELA: itens_solicitacao_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS itens_solicitacao_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  preco_referencia NUMERIC(15,2),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_itens_solicitacao_solicitacao ON itens_solicitacao_compra(solicitacao_id);
CREATE INDEX idx_itens_solicitacao_produto ON itens_solicitacao_compra(produto_id);

COMMENT ON TABLE itens_solicitacao_compra IS 'Itens das solicitações de compra';

-- ============================================================================
-- 3. TABELA: cotacoes
-- ============================================================================
CREATE TABLE IF NOT EXISTS cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Cotação
  solicitacao_id UUID REFERENCES solicitacoes_compra(id),
  responsavel_id UUID NOT NULL REFERENCES usuarios(id),
  prazo_resposta INT DEFAULT 48, -- horas
  validade_cotacao INT DEFAULT 7, -- dias
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'em_analise', 'concluida', 'cancelada')) DEFAULT 'rascunho',
  
  -- Datas
  data_envio TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  
  -- Metadados
  observacoes TEXT,
  especificacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT cotacoes_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX idx_cotacoes_empresa ON cotacoes(empresa_id);
CREATE INDEX idx_cotacoes_solicitacao ON cotacoes(solicitacao_id);
CREATE INDEX idx_cotacoes_responsavel ON cotacoes(responsavel_id);
CREATE INDEX idx_cotacoes_status ON cotacoes(status);
CREATE INDEX idx_cotacoes_data_envio ON cotacoes(data_envio);

-- Trigger
CREATE TRIGGER cotacoes_updated_at BEFORE UPDATE ON cotacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE cotacoes IS 'Cotações com fornecedores';

-- ============================================================================
-- 4. TABELA: itens_cotacao
-- ============================================================================
CREATE TABLE IF NOT EXISTS itens_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  preco_referencia NUMERIC(15,2),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_itens_cotacao_cotacao ON itens_cotacao(cotacao_id);
CREATE INDEX idx_itens_cotacao_produto ON itens_cotacao(produto_id);

COMMENT ON TABLE itens_cotacao IS 'Itens das cotações';

-- ============================================================================
-- 5. TABELA: cotacoes_fornecedores
-- ============================================================================
CREATE TABLE IF NOT EXISTS cotacoes_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  
  -- Status da Resposta
  status TEXT CHECK (status IN ('aguardando', 'respondida', 'nao_respondeu', 'recusada')) DEFAULT 'aguardando',
  data_envio TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Metadados
  observacoes_fornecedor TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT cotacoes_fornecedores_uk UNIQUE (cotacao_id, fornecedor_id)
);

-- Índices
CREATE INDEX idx_cotacoes_fornecedores_cotacao ON cotacoes_fornecedores(cotacao_id);
CREATE INDEX idx_cotacoes_fornecedores_fornecedor ON cotacoes_fornecedores(fornecedor_id);
CREATE INDEX idx_cotacoes_fornecedores_status ON cotacoes_fornecedores(status);

COMMENT ON TABLE cotacoes_fornecedores IS 'Relação entre cotações e fornecedores';

-- ============================================================================
-- 6. TABELA: propostas_cotacao
-- ============================================================================
CREATE TABLE IF NOT EXISTS propostas_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_fornecedor_id UUID NOT NULL REFERENCES cotacoes_fornecedores(id) ON DELETE CASCADE,
  item_cotacao_id UUID NOT NULL REFERENCES itens_cotacao(id) ON DELETE CASCADE,
  
  -- Proposta
  preco_unitario NUMERIC(15,2) NOT NULL,
  quantidade_disponivel NUMERIC(10,2),
  prazo_entrega INT, -- dias
  condicoes_pagamento TEXT,
  validade_proposta DATE,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT propostas_cotacao_uk UNIQUE (cotacao_fornecedor_id, item_cotacao_id)
);

-- Índices
CREATE INDEX idx_propostas_cotacao_fornecedor ON propostas_cotacao(cotacao_fornecedor_id);
CREATE INDEX idx_propostas_cotacao_item ON propostas_cotacao(item_cotacao_id);

COMMENT ON TABLE propostas_cotacao IS 'Propostas dos fornecedores por item';

-- ============================================================================
-- 7. TABELA: compras_internacionais
-- ============================================================================
CREATE TABLE IF NOT EXISTS compras_internacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Importação
  fornecedor_id UUID REFERENCES fornecedores(id),
  fornecedor_internacional TEXT,
  pais_origem TEXT,
  
  -- Valores
  valor_fob NUMERIC(15,2),
  valor_frete_internacional NUMERIC(15,2),
  valor_seguro NUMERIC(15,2),
  
  -- Tributos
  imposto_importacao NUMERIC(15,2),
  ipi NUMERIC(15,2),
  pis NUMERIC(15,2),
  cofins NUMERIC(15,2),
  icms NUMERIC(15,2),
  
  -- Status
  status TEXT CHECK (status IN ('analise_viabilidade', 'aprovado', 'licenca_importacao', 'embarque', 'desembaraco', 'entregue', 'cancelado')) DEFAULT 'analise_viabilidade',
  
  -- Documentos
  licenca_importacao TEXT,
  numero_di TEXT, -- Declaração de Importação
  data_embarque DATE,
  previsao_chegada DATE,
  data_desembaraco DATE,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT compras_internacionais_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX idx_compras_internacionais_empresa ON compras_internacionais(empresa_id);
CREATE INDEX idx_compras_internacionais_fornecedor ON compras_internacionais(fornecedor_id);
CREATE INDEX idx_compras_internacionais_status ON compras_internacionais(status);
CREATE INDEX idx_compras_internacionais_pais ON compras_internacionais(pais_origem);

-- Trigger
CREATE TRIGGER compras_internacionais_updated_at BEFORE UPDATE ON compras_internacionais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE compras_internacionais IS 'Gestão de compras internacionais (importação)';

-- ============================================================================
-- 8. TABELA: notas_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS notas_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pedido_compra_id UUID REFERENCES pedidos_compra(id),
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  
  -- Dados da NF-e
  numero_nota TEXT NOT NULL,
  serie TEXT,
  chave_acesso TEXT,
  data_emissao TIMESTAMPTZ NOT NULL,
  
  -- Valores
  valor_produtos NUMERIC(15,2) NOT NULL,
  valor_frete NUMERIC(15,2) DEFAULT 0,
  valor_seguro NUMERIC(15,2) DEFAULT 0,
  valor_desconto NUMERIC(15,2) DEFAULT 0,
  valor_outros NUMERIC(15,2) DEFAULT 0,
  valor_total NUMERIC(15,2) NOT NULL,
  
  -- Impostos
  valor_icms NUMERIC(15,2) DEFAULT 0,
  valor_ipi NUMERIC(15,2) DEFAULT 0,
  valor_pis NUMERIC(15,2) DEFAULT 0,
  valor_cofins NUMERIC(15,2) DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'conferida', 'divergencia', 'entrada_efetuada', 'cancelada')) DEFAULT 'pendente',
  data_entrada TIMESTAMPTZ,
  
  -- XML
  xml_nfe TEXT,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT notas_compra_chave_uk UNIQUE (chave_acesso)
);

-- Índices
CREATE INDEX idx_notas_compra_empresa ON notas_compra(empresa_id);
CREATE INDEX idx_notas_compra_pedido ON notas_compra(pedido_compra_id);
CREATE INDEX idx_notas_compra_fornecedor ON notas_compra(fornecedor_id);
CREATE INDEX idx_notas_compra_status ON notas_compra(status);
CREATE INDEX idx_notas_compra_numero ON notas_compra(numero_nota);
CREATE INDEX idx_notas_compra_data_emissao ON notas_compra(data_emissao);

-- Trigger
CREATE TRIGGER notas_compra_updated_at BEFORE UPDATE ON notas_compra
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE notas_compra IS 'Notas fiscais de entrada (compra)';

-- ============================================================================
-- 9. TABELA: itens_nota_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS itens_nota_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nota_compra_id UUID NOT NULL REFERENCES notas_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  -- Dados do Item
  codigo_produto TEXT,
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  
  -- Valores
  valor_unitario NUMERIC(15,2) NOT NULL,
  valor_total NUMERIC(15,2) NOT NULL,
  
  -- Rastreabilidade
  lote TEXT,
  validade DATE,
  numero_serie TEXT,
  
  -- Status
  produto_encontrado BOOLEAN DEFAULT false,
  entrada_efetuada BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_itens_nota_compra_nota ON itens_nota_compra(nota_compra_id);
CREATE INDEX idx_itens_nota_compra_produto ON itens_nota_compra(produto_id);
CREATE INDEX idx_itens_nota_compra_lote ON itens_nota_compra(lote);

COMMENT ON TABLE itens_nota_compra IS 'Itens das notas fiscais de compra';

-- ============================================================================
-- VIEWS: Compras KPIs
-- ============================================================================

CREATE OR REPLACE VIEW v_compras_kpis AS
WITH mes_atual AS (
  SELECT 
    empresa_id,
    COUNT(*) as total_compras,
    SUM(valor_total) as valor_total
  FROM pedidos_compra
  WHERE status NOT IN ('cancelado')
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
  GROUP BY empresa_id
),
pedidos_stats AS (
  SELECT
    empresa_id,
    COUNT(*) FILTER (WHERE status IN ('rascunho', 'aguardando_aprovacao', 'aprovado', 'enviado')) as pedidos_pendentes
  FROM pedidos_compra
  GROUP BY empresa_id
),
cotacoes_stats AS (
  SELECT
    empresa_id,
    COUNT(*) FILTER (WHERE status IN ('enviada', 'em_analise')) as cotacoes_abertas
  FROM cotacoes
  GROUP BY empresa_id
)
SELECT
  e.id AS empresa_id,
  COALESCE(ma.total_compras, 0) as compras_mes,
  COALESCE(ma.valor_total, 0) as valor_total_mes,
  COALESCE(ps.pedidos_pendentes, 0) as pedidos_pendentes,
  COALESCE(cs.cotacoes_abertas, 0) as cotacoes_abertas,
  COUNT(DISTINCT f.id) FILTER (WHERE f.ativo = true) as fornecedores_ativos
FROM empresas e
LEFT JOIN mes_atual ma ON ma.empresa_id = e.id
LEFT JOIN pedidos_stats ps ON ps.empresa_id = e.id
LEFT JOIN cotacoes_stats cs ON cs.empresa_id = e.id
LEFT JOIN fornecedores f ON f.empresa_id = e.id
GROUP BY e.id, ma.total_compras, ma.valor_total, ps.pedidos_pendentes, cs.cotacoes_abertas;

COMMENT ON VIEW v_compras_kpis IS 'KPIs consolidados de compras';

-- ============================================================================
-- FUNCTIONS: Cálculo de Viabilidade de Importação
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_custo_importacao(
  p_valor_fob NUMERIC,
  p_valor_frete NUMERIC,
  p_valor_seguro NUMERIC,
  p_aliquota_ii NUMERIC DEFAULT 14, -- Imposto de Importação
  p_aliquota_ipi NUMERIC DEFAULT 5,
  p_aliquota_pis NUMERIC DEFAULT 2.1,
  p_aliquota_cofins NUMERIC DEFAULT 9.65,
  p_aliquota_icms NUMERIC DEFAULT 18
) RETURNS JSONB AS $$
DECLARE
  v_base_calculo NUMERIC;
  v_ii NUMERIC;
  v_ipi NUMERIC;
  v_pis_cofins NUMERIC;
  v_icms NUMERIC;
  v_custo_total NUMERIC;
  v_resultado JSONB;
BEGIN
  -- Base de cálculo
  v_base_calculo := p_valor_fob + p_valor_frete + p_valor_seguro;
  
  -- Imposto de Importação
  v_ii := v_base_calculo * (p_aliquota_ii / 100);
  
  -- IPI
  v_ipi := (v_base_calculo + v_ii) * (p_aliquota_ipi / 100);
  
  -- PIS/COFINS
  v_pis_cofins := v_base_calculo * ((p_aliquota_pis + p_aliquota_cofins) / 100);
  
  -- ICMS
  v_icms := (v_base_calculo + v_ii + v_ipi + v_pis_cofins) * (p_aliquota_icms / 100);
  
  -- Custo Total
  v_custo_total := v_base_calculo + v_ii + v_ipi + v_pis_cofins + v_icms;
  
  -- Montar resultado
  v_resultado := jsonb_build_object(
    'valor_fob', p_valor_fob,
    'valor_frete', p_valor_frete,
    'valor_seguro', p_valor_seguro,
    'base_calculo', v_base_calculo,
    'imposto_importacao', v_ii,
    'ipi', v_ipi,
    'pis_cofins', v_pis_cofins,
    'icms', v_icms,
    'custo_total', v_custo_total,
    'acrescimo_percentual', ROUND(((v_custo_total - p_valor_fob) / p_valor_fob) * 100, 2)
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calcular_custo_importacao IS 'Calcula custo total de importação incluindo todos os tributos';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON solicitacoes_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_solicitacao_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cotacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_cotacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cotacoes_fornecedores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON propostas_cotacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON compras_internacionais TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notas_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_nota_compra TO authenticated;
GRANT SELECT ON v_compras_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION calcular_custo_importacao TO authenticated;

