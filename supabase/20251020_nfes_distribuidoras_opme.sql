-- =====================================================
-- BLOCO 1.1: Faturamento NF-e Completo
-- Migration: Tabela de NF-es para Distribuidoras OPME
-- 
-- CONFORMIDADE:
-- - ANVISA RDC 16/2013 (Boas Práticas de Distribuição)
-- - ANVISA RDC 157/2017 (Rastreabilidade)
-- - LGPD Art. 37 (Registro de operações)
-- - SEFAZ Nota Técnica 2021.001
-- =====================================================

-- Tabela Principal: NF-es
CREATE TABLE IF NOT EXISTS nfes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  numero INTEGER NOT NULL,
  serie INTEGER NOT NULL DEFAULT 1,
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_saida TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('rascunho', 'processando', 'autorizada', 'rejeitada', 'cancelada', 'denegada')),
  
  -- Identificação SEFAZ
  chave_acesso VARCHAR(44), -- 44 dígitos
  protocolo_autorizacao VARCHAR(50),
  data_autorizacao TIMESTAMP WITH TIME ZONE,
  
  -- Destinatário (Hospital/Clínica)
  destinatario_id UUID NOT NULL REFERENCES hospitais(id),
  destinatario_tipo CHAR(1) CHECK (destinatario_tipo IN ('J', 'F')),
  destinatario_cnpj_cpf VARCHAR(20) NOT NULL,
  destinatario_razao_social VARCHAR(200) NOT NULL,
  destinatario_nome_fantasia VARCHAR(200),
  destinatario_ie VARCHAR(20),
  destinatario_im VARCHAR(20),
  destinatario_email VARCHAR(200) NOT NULL,
  
  -- Endereço Destinatário
  destinatario_logradouro VARCHAR(200),
  destinatario_numero VARCHAR(20),
  destinatario_complemento VARCHAR(100),
  destinatario_bairro VARCHAR(100),
  destinatario_municipio VARCHAR(100),
  destinatario_uf CHAR(2),
  destinatario_cep VARCHAR(10),
  destinatario_codigo_municipio VARCHAR(10),
  
  -- Totalizadores
  valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_frete DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_seguro DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_outras_despesas DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_total_tributos DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Transporte
  modalidade_frete CHAR(1) CHECK (modalidade_frete IN ('0', '1', '2', '3', '4', '9')),
  transportadora_cnpj VARCHAR(20),
  transportadora_razao_social VARCHAR(200),
  transportadora_placa_veiculo VARCHAR(10),
  transportadora_uf_veiculo CHAR(2),
  
  -- ANVISA - Rastreabilidade OPME
  rastreabilidade_produtos_rastreados INTEGER NOT NULL DEFAULT 0,
  rastreabilidade_total_produtos INTEGER NOT NULL DEFAULT 0,
  rastreabilidade_percentual_conformidade DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  -- Informações Complementares
  informacoes_complementares TEXT,
  informacoes_fisco TEXT,
  
  -- XML e PDF
  xml_nfe TEXT,
  xml_autorizacao TEXT,
  danfe_url VARCHAR(500),
  
  -- Motivos (rejeição/cancelamento)
  motivo_rejeicao TEXT,
  motivo_cancelamento TEXT,
  protocolo_cancelamento VARCHAR(50),
  
  -- Auditoria LGPD
  usuario_criacao UUID NOT NULL REFERENCES auth.users(id),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  usuario_autorizacao UUID REFERENCES auth.users(id),
  data_ultima_alteracao TIMESTAMP WITH TIME ZONE,
  
  -- Índices e Constraints
  UNIQUE(numero, serie),
  UNIQUE(chave_acesso)
);

-- Tabela: Produtos da NF-e
CREATE TABLE IF NOT EXISTS nfe_produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nfe_id UUID NOT NULL REFERENCES nfes(id) ON DELETE CASCADE,
  
  -- Identificação do Produto
  produto_id UUID NOT NULL REFERENCES produtos(id),
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(200) NOT NULL,
  ncm VARCHAR(10) NOT NULL, -- Nomenclatura Comum do Mercosul
  cest VARCHAR(10), -- Código Especificador da Substituição Tributária
  cfop VARCHAR(5) NOT NULL, -- Código Fiscal de Operações
  unidade VARCHAR(10) NOT NULL,
  quantidade DECIMAL(15,4) NOT NULL,
  valor_unitario DECIMAL(15,4) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  
  -- Rastreabilidade ANVISA (OBRIGATÓRIO para OPME)
  anvisa_registro VARCHAR(50), -- Número de registro ANVISA
  lote VARCHAR(50), -- Lote do produto
  data_fabricacao DATE,
  data_validade DATE, -- CRÍTICO para distribuidoras
  numero_serie VARCHAR(100), -- Para implantes
  
  -- Tributação
  icms_aliquota DECIMAL(5,2) NOT NULL DEFAULT 0,
  icms_valor DECIMAL(15,2) NOT NULL DEFAULT 0,
  ipi_aliquota DECIMAL(5,2) DEFAULT 0,
  ipi_valor DECIMAL(15,2) DEFAULT 0,
  pis_aliquota DECIMAL(5,2) NOT NULL DEFAULT 0,
  pis_valor DECIMAL(15,2) NOT NULL DEFAULT 0,
  cofins_aliquota DECIMAL(5,2) NOT NULL DEFAULT 0,
  cofins_valor DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_nfes_numero ON nfes(numero);
CREATE INDEX idx_nfes_serie ON nfes(serie);
CREATE INDEX idx_nfes_status ON nfes(status);
CREATE INDEX idx_nfes_data_emissao ON nfes(data_emissao);
CREATE INDEX idx_nfes_chave_acesso ON nfes(chave_acesso);
CREATE INDEX idx_nfes_destinatario_id ON nfes(destinatario_id);
CREATE INDEX idx_nfes_usuario_criacao ON nfes(usuario_criacao);
CREATE INDEX idx_nfe_produtos_nfe_id ON nfe_produtos(nfe_id);
CREATE INDEX idx_nfe_produtos_produto_id ON nfe_produtos(produto_id);
CREATE INDEX idx_nfe_produtos_lote ON nfe_produtos(lote);
CREATE INDEX idx_nfe_produtos_data_validade ON nfe_produtos(data_validade);

-- View: Produtos vencendo (Alerta ANVISA)
CREATE OR REPLACE VIEW vw_produtos_vencendo AS
SELECT 
  np.id,
  np.nfe_id,
  n.numero AS nfe_numero,
  np.codigo,
  np.nome,
  np.lote,
  np.data_validade,
  np.quantidade,
  n.destinatario_razao_social,
  EXTRACT(DAY FROM (np.data_validade - CURRENT_DATE)) AS dias_para_vencer
FROM nfe_produtos np
INNER JOIN nfes n ON n.id = np.nfe_id
WHERE 
  n.status = 'autorizada'
  AND np.data_validade IS NOT NULL
  AND np.data_validade BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
ORDER BY np.data_validade ASC;

-- View: Conformidade ANVISA por mês
CREATE OR REPLACE VIEW vw_conformidade_anvisa_mensal AS
SELECT 
  DATE_TRUNC('month', data_emissao) AS mes,
  COUNT(*) AS total_nfes,
  SUM(rastreabilidade_produtos_rastreados) AS produtos_rastreados,
  SUM(rastreabilidade_total_produtos) AS total_produtos,
  AVG(rastreabilidade_percentual_conformidade) AS percentual_conformidade_medio
FROM nfes
WHERE status = 'autorizada'
GROUP BY DATE_TRUNC('month', data_emissao)
ORDER BY mes DESC;

-- Function: Calcular próximo número de NF-e
CREATE OR REPLACE FUNCTION get_proximo_numero_nfe(p_serie INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ultimo_numero INTEGER;
BEGIN
  SELECT COALESCE(MAX(numero), 0) INTO v_ultimo_numero
  FROM nfes
  WHERE serie = p_serie;
  
  RETURN v_ultimo_numero + 1;
END;
$$;

-- Function: Validar rastreabilidade ANVISA
CREATE OR REPLACE FUNCTION validar_rastreabilidade_anvisa(p_nfe_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_produtos INTEGER;
  v_produtos_rastreados INTEGER;
  v_percentual DECIMAL(5,2);
BEGIN
  -- Contar produtos da NF-e
  SELECT COUNT(*) INTO v_total_produtos
  FROM nfe_produtos
  WHERE nfe_id = p_nfe_id;
  
  -- Contar produtos com rastreabilidade completa
  SELECT COUNT(*) INTO v_produtos_rastreados
  FROM nfe_produtos
  WHERE nfe_id = p_nfe_id
    AND anvisa_registro IS NOT NULL
    AND lote IS NOT NULL
    AND data_validade IS NOT NULL;
  
  -- Calcular percentual
  IF v_total_produtos > 0 THEN
    v_percentual := (v_produtos_rastreados::DECIMAL / v_total_produtos::DECIMAL) * 100;
  ELSE
    v_percentual := 0;
  END IF;
  
  -- Atualizar NF-e
  UPDATE nfes
  SET 
    rastreabilidade_produtos_rastreados = v_produtos_rastreados,
    rastreabilidade_total_produtos = v_total_produtos,
    rastreabilidade_percentual_conformidade = v_percentual
  WHERE id = p_nfe_id;
  
  -- Retornar se está conforme (>= 95%)
  RETURN v_percentual >= 95;
END;
$$;

-- RLS (Row Level Security) - LGPD Compliance
ALTER TABLE nfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_produtos ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver NF-es de sua empresa
CREATE POLICY "Usuários podem ver NF-es de sua empresa"
ON nfes FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM user_empresas WHERE empresa_id = (
      SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid() LIMIT 1
    )
  )
);

-- Policy: Usuários com permissão podem inserir NF-es
CREATE POLICY "Usuários com permissão podem inserir NF-es"
ON nfes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM permissoes p
    WHERE p.usuario_id = auth.uid()
      AND p.modulo = 'faturamento'
      AND p.nivel_acesso IN ('escrita', 'admin')
  )
);

-- Policy: Usuários com permissão podem atualizar NF-es
CREATE POLICY "Usuários com permissão podem atualizar NF-es"
ON nfes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM permissoes p
    WHERE p.usuario_id = auth.uid()
      AND p.modulo = 'faturamento'
      AND p.nivel_acesso IN ('escrita', 'admin')
  )
);

-- Trigger: Atualizar data_ultima_alteracao
CREATE OR REPLACE FUNCTION update_nfe_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.data_ultima_alteracao = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_nfe_timestamp
BEFORE UPDATE ON nfes
FOR EACH ROW
EXECUTE FUNCTION update_nfe_timestamp();

-- Trigger: Log de auditoria (LGPD)
CREATE TABLE IF NOT EXISTS nfes_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nfe_id UUID NOT NULL,
  acao VARCHAR(20) NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE', 'CANCELAMENTO', 'AUTORIZACAO')),
  usuario_id UUID NOT NULL,
  data_acao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_nfes_audit_log_nfe_id ON nfes_audit_log(nfe_id);
CREATE INDEX idx_nfes_audit_log_usuario_id ON nfes_audit_log(usuario_id);
CREATE INDEX idx_nfes_audit_log_data_acao ON nfes_audit_log(data_acao);

-- Function: Registrar log de auditoria
CREATE OR REPLACE FUNCTION log_nfe_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO nfes_audit_log (nfe_id, acao, usuario_id, dados_anteriores)
    VALUES (OLD.id, TG_OP, auth.uid(), row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO nfes_audit_log (nfe_id, acao, usuario_id, dados_anteriores, dados_novos)
    VALUES (NEW.id, TG_OP, auth.uid(), row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO nfes_audit_log (nfe_id, acao, usuario_id, dados_novos)
    VALUES (NEW.id, TG_OP, auth.uid(), row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_log_nfe_audit
AFTER INSERT OR UPDATE OR DELETE ON nfes
FOR EACH ROW
EXECUTE FUNCTION log_nfe_audit();

-- Comentários (Documentação)
COMMENT ON TABLE nfes IS 'NF-es para distribuidoras OPME - Conformidade ANVISA/SEFAZ/LGPD';
COMMENT ON COLUMN nfes.rastreabilidade_percentual_conformidade IS 'Meta: >= 95% conforme RDC ANVISA 157/2017';
COMMENT ON TABLE nfe_produtos IS 'Produtos da NF-e com rastreabilidade ANVISA obrigatória';
COMMENT ON COLUMN nfe_produtos.data_validade IS 'CRÍTICO: Distribuidoras devem controlar validade dos produtos OPME';
COMMENT ON TABLE nfes_audit_log IS 'Log de auditoria para conformidade LGPD Art. 37';

