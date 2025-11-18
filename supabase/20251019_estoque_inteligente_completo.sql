-- ============================================
-- ESTOQUE INTELIGENTE - SCHEMA COMPLETO
-- Sistema: ICARUS v5.0
-- Data: 19 de Outubro de 2025
-- Idioma: Português Brasileiro (pt-BR)
-- ============================================

-- ============================================
-- 1. ARMAZÉNS
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_armazens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- matriz, filial, deposito
  
  -- Endereço
  endereco TEXT,
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  
  -- Capacidade
  capacidade_m3 DECIMAL(10, 2),
  capacidade_utilizada_m3 DECIMAL(10, 2),
  
  -- Controle
  ativo BOOLEAN DEFAULT TRUE,
  responsavel_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. LOCALIZAÇÕES DENTRO DO ARMAZÉM
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  armazem_id UUID REFERENCES estoque_armazens(id),
  codigo VARCHAR(50) NOT NULL, -- Ex: A01-P03-N02 (corredor-prateleira-nível)
  descricao VARCHAR(200),
  
  tipo VARCHAR(50), -- prateleira, geladeira, cofre
  capacidade_itens INTEGER,
  
  -- Controle de temperatura (se aplicável)
  temperatura_min DECIMAL(5, 2),
  temperatura_max DECIMAL(5, 2),
  
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(armazem_id, codigo)
);

-- ============================================
-- 3. ESTOQUE ATUAL
-- ============================================
CREATE TABLE IF NOT EXISTS estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  armazem_id UUID REFERENCES estoque_armazens(id) NOT NULL,
  localizacao_id UUID REFERENCES estoque_localizacoes(id),
  
  -- Quantidades
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_reservada INTEGER DEFAULT 0,
  quantidade_disponivel INTEGER GENERATED ALWAYS AS (quantidade - quantidade_reservada) STORED,
  
  -- Lote e Validade
  lote VARCHAR(100),
  serie VARCHAR(100),
  data_fabricacao DATE,
  data_validade DATE,
  
  -- Valores
  custo_unitario DECIMAL(15, 2),
  custo_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantidade * custo_unitario) STORED,
  
  -- Controle
  status VARCHAR(50) DEFAULT 'disponivel',
  -- disponivel, reservado, bloqueado, vencido, quarentena
  
  -- Nota Fiscal de Entrada
  nfe_numero VARCHAR(50),
  nfe_data DATE,
  fornecedor_id UUID REFERENCES fornecedores(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(produto_id, armazem_id, lote, serie)
);

-- ============================================
-- 4. MOVIMENTAÇÕES DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  armazem_origem_id UUID REFERENCES estoque_armazens(id),
  armazem_destino_id UUID REFERENCES estoque_armazens(id),
  
  tipo VARCHAR(50) NOT NULL,
  -- entrada, saida, transferencia, ajuste, devolucao, perda
  
  quantidade INTEGER NOT NULL,
  lote VARCHAR(100),
  serie VARCHAR(100),
  
  -- Motivo
  motivo VARCHAR(50),
  -- compra, venda, cirurgia, transferencia, ajuste_inventario,
  -- devolucao_fornecedor, devolucao_cliente, vencimento, perda
  
  -- Referências
  cirurgia_id UUID REFERENCES cirurgias(id),
  compra_id UUID,
  venda_id UUID,
  
  -- Documentação
  documento_tipo VARCHAR(50), -- nfe, nfs, pedido, inventario
  documento_numero VARCHAR(100),
  
  -- Valores
  custo_unitario DECIMAL(15, 2),
  valor_total DECIMAL(15, 2),
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  data_movimentacao TIMESTAMP DEFAULT NOW(),
  usuario_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. RESERVAS DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  estoque_id UUID REFERENCES estoque(id),
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  
  quantidade INTEGER NOT NULL,
  
  -- Motivo da Reserva
  motivo VARCHAR(50) NOT NULL, -- cirurgia, pedido, transferencia
  cirurgia_id UUID REFERENCES cirurgias(id),
  pedido_id UUID,
  
  -- Validade da Reserva
  data_reserva TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'ativa',
  -- ativa, consumida, cancelada, expirada
  
  usuario_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. CONTROLE DE LOTES DETALHADO
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  lote VARCHAR(100) NOT NULL,
  serie VARCHAR(100),
  
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  
  quantidade_inicial INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  
  fornecedor_id UUID REFERENCES fornecedores(id),
  nfe_numero VARCHAR(50),
  nfe_data DATE,
  
  -- Certificados
  certificado_qualidade TEXT,
  laudo_tecnico TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'ativo',
  -- ativo, vencido, bloqueado, recall
  
  bloqueado BOOLEAN DEFAULT FALSE,
  motivo_bloqueio TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(produto_id, lote, serie)
);

-- ============================================
-- 7. INVENTÁRIOS (CONTAGENS FÍSICAS)
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  numero_inventario VARCHAR(50) UNIQUE NOT NULL,
  armazem_id UUID REFERENCES estoque_armazens(id),
  
  tipo VARCHAR(50) NOT NULL, -- geral, rotativo, por_categoria
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'em_andamento',
  -- em_andamento, concluido, aprovado, cancelado
  
  -- Responsáveis
  coordenador_id UUID REFERENCES usuarios(id),
  equipe_contagem JSONB, -- Array de user IDs
  
  -- Resultados
  total_itens_contados INTEGER DEFAULT 0,
  total_divergencias INTEGER DEFAULT 0,
  valor_divergencias DECIMAL(15, 2) DEFAULT 0,
  
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. ITENS DO INVENTÁRIO
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_inventarios_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  inventario_id UUID REFERENCES estoque_inventarios(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos_opme(id),
  
  -- Quantidade Sistema
  quantidade_sistema INTEGER NOT NULL,
  
  -- Quantidade Física (Contagem)
  quantidade_fisica INTEGER,
  
  -- Divergência
  divergencia INTEGER GENERATED ALWAYS AS (quantidade_fisica - quantidade_sistema) STORED,
  
  lote VARCHAR(100),
  localizacao_id UUID REFERENCES estoque_localizacoes(id),
  
  -- Contagem
  data_contagem TIMESTAMP,
  usuario_contagem_id UUID REFERENCES usuarios(id),
  
  -- Observações
  observacoes TEXT,
  foto_evidencia TEXT, -- URL da foto
  
  status VARCHAR(50) DEFAULT 'pendente',
  -- pendente, contado, conferido, ajustado
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. ALERTAS DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id),
  tipo VARCHAR(50) NOT NULL,
  -- estoque_baixo, ponto_reposicao, vencimento_proximo,
  -- ruptura, excesso, lote_bloqueado
  
  severidade VARCHAR(20) DEFAULT 'media',
  -- baixa, media, alta, critica
  
  mensagem TEXT NOT NULL,
  
  -- Dados do Alerta
  quantidade_atual INTEGER,
  quantidade_minima INTEGER,
  dias_vencimento INTEGER,
  
  status VARCHAR(50) DEFAULT 'ativo',
  -- ativo, resolvido, ignorado
  
  data_resolucao TIMESTAMP,
  resolvido_por UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_estoque_produto ON estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_armazem ON estoque(armazem_id);
CREATE INDEX IF NOT EXISTS idx_estoque_validade ON estoque(data_validade);
CREATE INDEX IF NOT EXISTS idx_estoque_status ON estoque(status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON estoque_movimentacoes(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON estoque_movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_lotes_validade ON estoque_lotes(data_validade);
CREATE INDEX IF NOT EXISTS idx_lotes_produto ON estoque_lotes(produto_id);
CREATE INDEX IF NOT EXISTS idx_reservas_status ON estoque_reservas(status);
CREATE INDEX IF NOT EXISTS idx_reservas_expiracao ON estoque_reservas(data_expiracao);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON estoque_alertas(status);
CREATE INDEX IF NOT EXISTS idx_alertas_severidade ON estoque_alertas(severidade);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Atualizar quantidade reservada
CREATE OR REPLACE FUNCTION atualizar_quantidade_reservada()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ativa' THEN
    UPDATE estoque
    SET quantidade_reservada = quantidade_reservada + NEW.quantidade
    WHERE id = NEW.estoque_id;
  ELSIF OLD.status = 'ativa' AND NEW.status != 'ativa' THEN
    UPDATE estoque
    SET quantidade_reservada = quantidade_reservada - OLD.quantidade
    WHERE id = OLD.estoque_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_reservas
AFTER INSERT OR UPDATE ON estoque_reservas
FOR EACH ROW
EXECUTE FUNCTION atualizar_quantidade_reservada();

-- Trigger: Updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON estoque
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_armazens_updated_at BEFORE UPDATE ON estoque_armazens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lotes_updated_at BEFORE UPDATE ON estoque_lotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventarios_updated_at BEFORE UPDATE ON estoque_inventarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON estoque_reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÕES SQL (VIEWS MATERIALIZADAS)
-- ============================================

-- Função: Produtos abaixo do ponto de reposição
CREATE OR REPLACE FUNCTION produtos_abaixo_ponto_reposicao()
RETURNS TABLE (
  id UUID,
  descricao VARCHAR,
  quantidade_atual BIGINT,
  estoque_minimo INTEGER,
  estoque_maximo INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.descricao,
    COALESCE(SUM(e.quantidade_disponivel), 0)::BIGINT as quantidade_atual,
    p.estoque_minimo,
    p.estoque_maximo
  FROM produtos_opme p
  LEFT JOIN estoque e ON e.produto_id = p.id AND e.status = 'disponivel'
  GROUP BY p.id, p.descricao, p.estoque_minimo, p.estoque_maximo
  HAVING COALESCE(SUM(e.quantidade_disponivel), 0) < p.estoque_minimo;
END;
$$ LANGUAGE plpgsql;

-- Função: Análise ABC/XYZ
CREATE OR REPLACE FUNCTION calcular_abc_xyz()
RETURNS TABLE (
  produto_id UUID,
  descricao VARCHAR,
  valor_total NUMERIC,
  percentual_acumulado NUMERIC,
  demanda_media NUMERIC,
  coeficiente_variacao NUMERIC,
  classe_abc VARCHAR(1),
  tipo_xyz VARCHAR(1)
) AS $$
BEGIN
  RETURN QUERY
  WITH consumo_produtos AS (
    SELECT 
      p.id,
      p.descricao,
      SUM(m.quantidade * m.custo_unitario) as valor_total,
      AVG(m.quantidade) as demanda_media,
      STDDEV(m.quantidade) / NULLIF(AVG(m.quantidade), 0) as coef_var
    FROM produtos_opme p
    LEFT JOIN estoque_movimentacoes m ON m.produto_id = p.id
    WHERE m.tipo = 'saida'
      AND m.data_movimentacao >= NOW() - INTERVAL '12 months'
    GROUP BY p.id, p.descricao
  ),
  ranking AS (
    SELECT 
      *,
      SUM(valor_total) OVER (ORDER BY valor_total DESC) / 
      NULLIF(SUM(valor_total) OVER (), 0) * 100 as perc_acum
    FROM consumo_produtos
  )
  SELECT 
    id as produto_id,
    descricao,
    valor_total,
    perc_acum as percentual_acumulado,
    demanda_media,
    coef_var as coeficiente_variacao,
    CASE 
      WHEN perc_acum <= 80 THEN 'A'
      WHEN perc_acum <= 95 THEN 'B'
      ELSE 'C'
    END as classe_abc,
    CASE 
      WHEN coef_var <= 0.5 THEN 'X'
      WHEN coef_var <= 1.0 THEN 'Y'
      ELSE 'Z'
    END as tipo_xyz
  FROM ranking;
END;
$$ LANGUAGE plpgsql;

-- Função: Produtos sem movimento
CREATE OR REPLACE FUNCTION produtos_sem_movimento(dias INTEGER)
RETURNS TABLE (
  id UUID,
  descricao VARCHAR,
  dias_parado INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.descricao,
    EXTRACT(DAY FROM (NOW() - MAX(m.data_movimentacao)))::INTEGER as dias_parado
  FROM produtos_opme p
  LEFT JOIN estoque_movimentacoes m ON m.produto_id = p.id
  GROUP BY p.id, p.descricao
  HAVING MAX(m.data_movimentacao) < NOW() - INTERVAL '1 day' * dias
     OR MAX(m.data_movimentacao) IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE estoque_armazens ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_inventarios_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_alertas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (usuários autenticados)
CREATE POLICY "Usuários autenticados podem visualizar armazéns"
  ON estoque_armazens FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem visualizar estoque"
  ON estoque FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir movimentações"
  ON estoque_movimentacoes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem visualizar movimentações"
  ON estoque_movimentacoes FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA (DADOS INICIAIS)
-- ============================================

-- Armazém padrão
INSERT INTO estoque_armazens (codigo, nome, tipo, cidade, uf, ativo)
VALUES ('ARM001', 'Armazém Principal', 'matriz', 'São Paulo', 'SP', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Localizações exemplo
INSERT INTO estoque_localizacoes (armazem_id, codigo, descricao, tipo)
SELECT 
  id,
  'A01-P01-N01',
  'Corredor A - Prateleira 1 - Nível 1',
  'prateleira'
FROM estoque_armazens
WHERE codigo = 'ARM001'
ON CONFLICT (armazem_id, codigo) DO NOTHING;

-- ============================================
-- COMENTÁRIOS (DOCUMENTAÇÃO)
-- ============================================

COMMENT ON TABLE estoque_armazens IS 'Armazéns físicos para armazenamento de produtos OPME';
COMMENT ON TABLE estoque_localizacoes IS 'Localizações específicas dentro dos armazéns (prateleiras, cofres, geladeiras)';
COMMENT ON TABLE estoque IS 'Estoque atual de produtos OPME com rastreabilidade de lote/série';
COMMENT ON TABLE estoque_movimentacoes IS 'Histórico de todas as movimentações de estoque (entrada, saída, transferência)';
COMMENT ON TABLE estoque_reservas IS 'Reservas de estoque para cirurgias e pedidos específicos';
COMMENT ON TABLE estoque_lotes IS 'Controle detalhado de lotes com validade e certificações';
COMMENT ON TABLE estoque_inventarios IS 'Inventários físicos periódicos ou rotativos';
COMMENT ON TABLE estoque_inventarios_itens IS 'Itens contados em cada inventário com divergências';
COMMENT ON TABLE estoque_alertas IS 'Alertas automáticos de estoque (baixo, vencimento, ruptura)';

-- ============================================
-- FIM DO SCHEMA
-- ============================================

