-- Migration: Tabela de Faturas/NF-e
-- Data: 2025-10-18
-- Descrição: Sistema completo de faturamento e notas fiscais

-- Criar tabela de faturas
CREATE TABLE IF NOT EXISTS faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nfe VARCHAR(20) UNIQUE NOT NULL,
  serie VARCHAR(10) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('nfe', 'nfse', 'cte', 'mdfe')),
  
  -- Cliente/Destinatário
  cliente_tipo VARCHAR(10) CHECK (cliente_tipo IN ('medico', 'hospital', 'outro')),
  cliente_id UUID,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_cpf_cnpj VARCHAR(18) NOT NULL,
  
  -- Datas
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_vencimento DATE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  
  -- Valores
  valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_frete DECIMAL(15,2) DEFAULT 0,
  valor_impostos DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('rascunho', 'pendente', 'emitida', 'autorizada', 'cancelada', 'paga')),
  status_sefaz VARCHAR(30),
  
  -- Chave de Acesso NFe
  chave_acesso VARCHAR(44),
  protocolo_autorizacao VARCHAR(20),
  
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_compra(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Informações Fiscais
  natureza_operacao VARCHAR(100),
  cfop VARCHAR(10),
  forma_pagamento VARCHAR(20),
  
  -- XML e Arquivos
  xml_nfe TEXT,
  pdf_url TEXT,
  
  -- Observações
  observacoes TEXT,
  observacoes_internas TEXT,
  
  -- Auditoria
  emitida_por UUID REFERENCES profiles(id),
  cancelada_por UUID REFERENCES profiles(id),
  motivo_cancelamento TEXT,
  data_cancelamento TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_faturas_numero_nfe ON faturas(numero_nfe);
CREATE INDEX idx_faturas_cliente_cpf_cnpj ON faturas(cliente_cpf_cnpj);
CREATE INDEX idx_faturas_status ON faturas(status);
CREATE INDEX idx_faturas_data_emissao ON faturas(data_emissao DESC);
CREATE INDEX idx_faturas_chave_acesso ON faturas(chave_acesso);
CREATE INDEX idx_faturas_pedido_id ON faturas(pedido_id);

-- Trigger para updated_at
CREATE TRIGGER update_faturas_updated_at
  BEFORE UPDATE ON faturas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE faturas IS 'Tabela de gestão de faturas e notas fiscais eletrônicas';
COMMENT ON COLUMN faturas.chave_acesso IS 'Chave de acesso de 44 dígitos da NF-e';
COMMENT ON COLUMN faturas.status_sefaz IS 'Status de autorização junto à SEFAZ';

-- Dados mock para desenvolvimento
INSERT INTO faturas (
  numero_nfe, serie, tipo, cliente_tipo, cliente_nome, cliente_cpf_cnpj,
  data_emissao, data_vencimento, valor_produtos, valor_total,
  status, natureza_operacao, cfop, forma_pagamento
) VALUES
  ('000001', '1', 'nfe', 'hospital', 'Hospital São Lucas', '12.345.678/0001-90',
   NOW(), NOW() + INTERVAL '30 days', 15000.00, 15000.00,
   'autorizada', 'Venda de mercadoria', '5102', 'boleto'),
   
  ('000002', '1', 'nfe', 'medico', 'Dr. Roberto Silva', '123.456.789-00',
   NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 8500.00, 8500.00,
   'emitida', 'Venda de mercadoria', '5102', 'pix'),
   
  ('000003', '1', 'nfe', 'hospital', 'Hospital Sírio-Libanês', '98.765.432/0001-10',
   NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 22000.00, 22000.00,
   'pendente', 'Venda de mercadoria', '5102', 'transferencia');

