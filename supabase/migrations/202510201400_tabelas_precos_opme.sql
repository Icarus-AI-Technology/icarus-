-- ============================================
-- TABELAS DE PREÇOS OPME
-- Sistema de gestão de tabelas de preços para distribuidoras OPME
-- ============================================
-- Data: 2025-10-20
-- Padrão: snake_case pt_br
-- ============================================

-- 1. Tabelas de Preços (header)
CREATE TABLE IF NOT EXISTS tabelas_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  
  -- Identificação
  nome TEXT NOT NULL,
  codigo TEXT, -- código interno da tabela
  descricao TEXT,
  
  -- Tipo e Aplicação
  tipo TEXT CHECK (tipo IN (
    'fabricante',        -- Preço de fábrica/fabricante
    'distribuidor',      -- Tabela do distribuidor (com margem)
    'hospital',          -- Negociada com hospital específico
    'convenio',          -- Negociada com convênio específico
    'contrato',          -- Baseada em contrato específico
    'promocional',       -- Tabela promocional temporária
    'licitacao'          -- Para participação em licitações
  )) NOT NULL DEFAULT 'distribuidor',
  
  -- Vinculação (quando aplicável)
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  convenio_id UUID REFERENCES convenios(id) ON DELETE SET NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  contrato_numero TEXT,
  
  -- Vigência
  data_inicio DATE NOT NULL,
  data_fim DATE,
  
  -- Regras de Aplicação
  aplicar_automatico BOOLEAN DEFAULT FALSE, -- se deve ser aplicada automaticamente
  prioridade INTEGER DEFAULT 0, -- prioridade quando múltiplas tabelas se aplicam (maior = mais prioritária)
  
  -- Desconto/Margem Global (aplicado sobre todos os itens)
  desconto_percentual DECIMAL(5, 2) DEFAULT 0, -- % de desconto global
  margem_percentual DECIMAL(5, 2) DEFAULT 0,   -- % de margem global
  
  -- Status
  status TEXT CHECK (status IN ('ativa', 'inativa', 'em_revisao', 'expirada')) DEFAULT 'ativa',
  
  -- Metadados
  total_itens INTEGER DEFAULT 0,
  valor_total_estimado DECIMAL(15, 2) DEFAULT 0,
  
  -- Auditoria
  criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  aprovado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_aprovacao TIMESTAMPTZ,
  
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- 2. Itens de Tabelas de Preços
CREATE TABLE IF NOT EXISTS tabelas_precos_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_preco_id UUID NOT NULL REFERENCES tabelas_precos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  
  -- Preços
  preco_custo DECIMAL(15, 2), -- custo do produto (para cálculo de margem)
  preco_base DECIMAL(15, 2) NOT NULL, -- preço base (sem desconto)
  preco_final DECIMAL(15, 2) NOT NULL, -- preço final (com desconto aplicado)
  
  -- Descontos/Margens Específicos do Item
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(15, 2) DEFAULT 0,
  margem_percentual DECIMAL(5, 2),
  margem_valor DECIMAL(15, 2),
  
  -- Quantidade (para descontos por volume)
  quantidade_minima INTEGER DEFAULT 1,
  quantidade_maxima INTEGER,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tabela_preco_id, produto_id, quantidade_minima)
);

-- 3. Histórico de Preços
CREATE TABLE IF NOT EXISTS historico_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tabela_preco_id UUID REFERENCES tabelas_precos(id) ON DELETE SET NULL,
  
  -- Preços anteriores
  preco_anterior DECIMAL(15, 2),
  preco_novo DECIMAL(15, 2) NOT NULL,
  
  -- Variação
  variacao_percentual DECIMAL(5, 2),
  variacao_valor DECIMAL(15, 2),
  
  -- Motivo
  motivo TEXT CHECK (motivo IN (
    'reajuste',
    'promocao',
    'negociacao',
    'correcao',
    'alteracao_custo',
    'atualizacao_tabela',
    'outro'
  )),
  descricao TEXT,
  
  -- Auditoria
  alterado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_alteracao TIMESTAMPTZ DEFAULT NOW(),
  
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_tabelas_precos_empresa ON tabelas_precos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_tabelas_precos_status ON tabelas_precos(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_tabelas_precos_tipo ON tabelas_precos(tipo) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_tabelas_precos_vigencia ON tabelas_precos(data_inicio, data_fim) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_tabelas_precos_hospital ON tabelas_precos(hospital_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_tabelas_precos_convenio ON tabelas_precos(convenio_id) WHERE excluido_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_tabelas_precos_itens_tabela ON tabelas_precos_itens(tabela_preco_id);
CREATE INDEX IF NOT EXISTS idx_tabelas_precos_itens_produto ON tabelas_precos_itens(produto_id);

CREATE INDEX IF NOT EXISTS idx_historico_precos_produto ON historico_precos(produto_id);
CREATE INDEX IF NOT EXISTS idx_historico_precos_tabela ON historico_precos(tabela_preco_id);
CREATE INDEX IF NOT EXISTS idx_historico_precos_data ON historico_precos(data_alteracao DESC);

-- 5. Triggers para Atualização Automática
CREATE OR REPLACE FUNCTION atualizar_timestamp_tabelas_precos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_tabelas_precos
  BEFORE UPDATE ON tabelas_precos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_tabelas_precos();

CREATE TRIGGER trigger_atualizar_tabelas_precos_itens
  BEFORE UPDATE ON tabelas_precos_itens
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_tabelas_precos();

-- 6. Trigger para Calcular Preço Final do Item
CREATE OR REPLACE FUNCTION calcular_preco_final_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular preço final com desconto
  IF NEW.desconto_valor > 0 THEN
    NEW.preco_final := NEW.preco_base - NEW.desconto_valor;
  ELSIF NEW.desconto_percentual > 0 THEN
    NEW.preco_final := NEW.preco_base * (1 - NEW.desconto_percentual / 100.0);
  ELSE
    NEW.preco_final := NEW.preco_base;
  END IF;
  
  -- Calcular margem
  IF NEW.preco_custo IS NOT NULL AND NEW.preco_custo > 0 THEN
    NEW.margem_valor := NEW.preco_final - NEW.preco_custo;
    NEW.margem_percentual := ((NEW.preco_final - NEW.preco_custo) / NEW.preco_custo) * 100.0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_preco_final
  BEFORE INSERT OR UPDATE ON tabelas_precos_itens
  FOR EACH ROW
  EXECUTE FUNCTION calcular_preco_final_item();

-- 7. Trigger para Atualizar Totais da Tabela
CREATE OR REPLACE FUNCTION atualizar_totais_tabela_preco()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tabelas_precos
  SET 
    total_itens = (
      SELECT COUNT(*)
      FROM tabelas_precos_itens
      WHERE tabela_preco_id = COALESCE(NEW.tabela_preco_id, OLD.tabela_preco_id)
        AND ativo = TRUE
    ),
    valor_total_estimado = (
      SELECT COALESCE(SUM(preco_final), 0)
      FROM tabelas_precos_itens
      WHERE tabela_preco_id = COALESCE(NEW.tabela_preco_id, OLD.tabela_preco_id)
        AND ativo = TRUE
    ),
    atualizado_em = NOW()
  WHERE id = COALESCE(NEW.tabela_preco_id, OLD.tabela_preco_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_totais_tabela
  AFTER INSERT OR UPDATE OR DELETE ON tabelas_precos_itens
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_totais_tabela_preco();

-- 8. Trigger para Registrar Histórico de Alteração de Preços
CREATE OR REPLACE FUNCTION registrar_historico_preco()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registrar se o preço mudou
  IF OLD.preco_final IS DISTINCT FROM NEW.preco_final THEN
    INSERT INTO historico_precos (
      produto_id,
      tabela_preco_id,
      preco_anterior,
      preco_novo,
      variacao_valor,
      variacao_percentual,
      motivo,
      alterado_por
    ) VALUES (
      NEW.produto_id,
      NEW.tabela_preco_id,
      OLD.preco_final,
      NEW.preco_final,
      NEW.preco_final - OLD.preco_final,
      CASE 
        WHEN OLD.preco_final > 0 THEN 
          ((NEW.preco_final - OLD.preco_final) / OLD.preco_final) * 100.0
        ELSE 
          NULL
      END,
      'atualizacao_tabela',
      NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'user_id', '')::UUID
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_historico
  AFTER UPDATE ON tabelas_precos_itens
  FOR EACH ROW
  WHEN (OLD.preco_final IS DISTINCT FROM NEW.preco_final)
  EXECUTE FUNCTION registrar_historico_preco();

-- 9. Função para Obter Melhor Preço de um Produto
CREATE OR REPLACE FUNCTION obter_melhor_preco(
  p_produto_id UUID,
  p_empresa_id UUID,
  p_hospital_id UUID DEFAULT NULL,
  p_convenio_id UUID DEFAULT NULL,
  p_quantidade INTEGER DEFAULT 1,
  p_data DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  tabela_id UUID,
  tabela_nome TEXT,
  tabela_tipo TEXT,
  preco_final DECIMAL(15, 2),
  quantidade_minima INTEGER,
  quantidade_maxima INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.nome,
    tp.tipo,
    tpi.preco_final,
    tpi.quantidade_minima,
    tpi.quantidade_maxima
  FROM tabelas_precos tp
  INNER JOIN tabelas_precos_itens tpi ON tpi.tabela_preco_id = tp.id
  WHERE tp.empresa_id = p_empresa_id
    AND tpi.produto_id = p_produto_id
    AND tp.status = 'ativa'
    AND tp.excluido_em IS NULL
    AND tpi.ativo = TRUE
    AND tp.data_inicio <= p_data
    AND (tp.data_fim IS NULL OR tp.data_fim >= p_data)
    AND (tp.hospital_id IS NULL OR tp.hospital_id = p_hospital_id)
    AND (tp.convenio_id IS NULL OR tp.convenio_id = p_convenio_id)
    AND (tpi.quantidade_minima IS NULL OR tpi.quantidade_minima <= p_quantidade)
    AND (tpi.quantidade_maxima IS NULL OR tpi.quantidade_maxima >= p_quantidade)
  ORDER BY 
    tp.prioridade DESC,
    tpi.preco_final ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 10. RLS Policies
ALTER TABLE tabelas_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabelas_precos_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_precos ENABLE ROW LEVEL SECURITY;

-- Tabelas de Preços
CREATE POLICY "Usuários podem ver tabelas de preços da própria empresa"
  ON tabelas_precos FOR SELECT
  USING (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND excluido_em IS NULL
  );

CREATE POLICY "Usuários admin/comercial podem criar tabelas de preços"
  ON tabelas_precos FOR INSERT
  WITH CHECK (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') IN ('admin', 'comercial')
  );

CREATE POLICY "Usuários admin/comercial podem atualizar tabelas de preços"
  ON tabelas_precos FOR UPDATE
  USING (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') IN ('admin', 'comercial')
  );

CREATE POLICY "Usuários admin podem deletar tabelas de preços"
  ON tabelas_precos FOR DELETE
  USING (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') = 'admin'
  );

-- Itens de Tabelas de Preços
CREATE POLICY "Usuários podem ver itens das tabelas da própria empresa"
  ON tabelas_precos_itens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tabelas_precos tp
      WHERE tp.id = tabela_preco_id
        AND tp.empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
        AND tp.excluido_em IS NULL
    )
  );

CREATE POLICY "Usuários admin/comercial podem gerenciar itens"
  ON tabelas_precos_itens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tabelas_precos tp
      WHERE tp.id = tabela_preco_id
        AND tp.empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
        AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') IN ('admin', 'comercial')
    )
  );

-- Histórico de Preços
CREATE POLICY "Usuários podem ver histórico de preços da própria empresa"
  ON historico_precos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = produto_id
        AND p.empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    )
  );

-- 11. Comentários
COMMENT ON TABLE tabelas_precos IS 'Tabelas de preços para produtos OPME - cabeçalho';
COMMENT ON TABLE tabelas_precos_itens IS 'Itens das tabelas de preços com preços específicos por produto';
COMMENT ON TABLE historico_precos IS 'Histórico de alterações de preços para auditoria';

COMMENT ON COLUMN tabelas_precos.tipo IS 'Tipo da tabela: fabricante, distribuidor, hospital, convenio, contrato, promocional, licitacao';
COMMENT ON COLUMN tabelas_precos.aplicar_automatico IS 'Se TRUE, esta tabela será aplicada automaticamente quando as condições forem atendidas';
COMMENT ON COLUMN tabelas_precos.prioridade IS 'Prioridade quando múltiplas tabelas se aplicam (maior número = maior prioridade)';

COMMENT ON FUNCTION obter_melhor_preco IS 'Retorna a tabela de preços mais vantajosa para um produto considerando hospital, convênio e quantidade';

-- Fim do script

