-- Migration: Tabela de Entregas/Logística
-- Data: 2025-10-18
-- Descrição: Sistema completo de logística e rastreamento de entregas

-- Criar tabela de entregas
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_rastreio VARCHAR(50) UNIQUE NOT NULL,
  
  -- Origem
  origem_tipo VARCHAR(20) CHECK (origem_tipo IN ('deposito', 'fornecedor', 'hospital')),
  origem_id UUID,
  origem_nome VARCHAR(255) NOT NULL,
  origem_endereco TEXT NOT NULL,
  origem_cidade VARCHAR(100),
  origem_estado VARCHAR(2),
  origem_cep VARCHAR(10),
  
  -- Destino
  destino_tipo VARCHAR(20) CHECK (destino_tipo IN ('hospital', 'medico', 'clinica', 'deposito')),
  destino_id UUID,
  destino_nome VARCHAR(255) NOT NULL,
  destino_endereco TEXT NOT NULL,
  destino_cidade VARCHAR(100),
  destino_estado VARCHAR(2),
  destino_cep VARCHAR(10),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('pendente', 'coletado', 'em_transito', 'saiu_entrega', 'entregue', 'devolvido', 'cancelado')),
  
  -- Datas
  data_coleta TIMESTAMP WITH TIME ZONE,
  data_previsao DATE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  
  -- Transportadora
  transportadora VARCHAR(100),
  tipo_entrega VARCHAR(30) CHECK (tipo_entrega IN ('normal', 'expressa', 'urgente')),
  valor_frete DECIMAL(10,2),
  
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_compra(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Materiais
  peso_kg DECIMAL(10,2),
  volumes INTEGER DEFAULT 1,
  nota_fiscal VARCHAR(20),
  
  -- Observações
  observacoes TEXT,
  ocorrencias TEXT,
  
  -- Responsável
  motorista VARCHAR(100),
  veiculo_placa VARCHAR(10),
  telefone_contato VARCHAR(20),
  
  -- Assinaturas
  assinado_por VARCHAR(255),
  assinado_em TIMESTAMP WITH TIME ZONE,
  documento_assinante VARCHAR(20),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabela de histórico de rastreamento
CREATE TABLE IF NOT EXISTS entrega_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_id UUID REFERENCES entregas(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  localizacao TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_entregas_codigo_rastreio ON entregas(codigo_rastreio);
CREATE INDEX idx_entregas_status ON entregas(status);
CREATE INDEX idx_entregas_data_previsao ON entregas(data_previsao);
CREATE INDEX idx_entregas_pedido_id ON entregas(pedido_id);
CREATE INDEX idx_entregas_cirurgia_id ON entregas(cirurgia_id);
CREATE INDEX idx_entregas_destino_cidade ON entregas(destino_cidade);
CREATE INDEX idx_entrega_historico_entrega_id ON entrega_historico(entrega_id);
CREATE INDEX idx_entrega_historico_created_at ON entrega_historico(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_entregas_updated_at
  BEFORE UPDATE ON entregas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para adicionar histórico automaticamente
CREATE OR REPLACE FUNCTION add_entrega_historico()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO entrega_historico (entrega_id, status, observacao)
    VALUES (NEW.id, NEW.status, 'Entrega criada no sistema');
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO entrega_historico (entrega_id, status, observacao)
    VALUES (NEW.id, NEW.status, 'Status atualizado');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para histórico automático
CREATE TRIGGER entrega_status_history
  AFTER INSERT OR UPDATE ON entregas
  FOR EACH ROW
  EXECUTE FUNCTION add_entrega_historico();

-- Comentários
COMMENT ON TABLE entregas IS 'Tabela de gestão de entregas e logística';
COMMENT ON TABLE entrega_historico IS 'Histórico completo de rastreamento das entregas';
COMMENT ON COLUMN entregas.codigo_rastreio IS 'Código único para rastreamento da entrega';

-- Dados mock para desenvolvimento
INSERT INTO entregas (
  codigo_rastreio, origem_tipo, origem_nome, origem_endereco, origem_cidade, origem_estado, origem_cep,
  destino_tipo, destino_nome, destino_endereco, destino_cidade, destino_estado, destino_cep,
  status, data_coleta, data_previsao, transportadora, tipo_entrega, valor_frete, volumes, peso_kg
) VALUES
  ('ENT001', 'deposito', 'Depósito Central', 'Rua A, 100', 'São Paulo', 'SP', '01000-000',
   'hospital', 'Hospital São Lucas', 'Av. Principal, 500', 'São Paulo', 'SP', '02000-000',
   'em_transito', NOW() - INTERVAL '2 hours', CURRENT_DATE + 1, 'Transportadora Express', 'expressa', 150.00, 3, 25.5),
   
  ('ENT002', 'fornecedor', 'Fornecedor Premium OPME', 'Rua B, 200', 'Rio de Janeiro', 'RJ', '20000-000',
   'hospital', 'Hospital Sírio-Libanês', 'Rua Hospital, 300', 'São Paulo', 'SP', '03000-000',
   'saiu_entrega', NOW() - INTERVAL '1 hour', CURRENT_DATE, 'Logística Rápida', 'urgente', 280.00, 2, 15.0),
   
  ('ENT003', 'deposito', 'Depósito Zona Sul', 'Av. Sul, 400', 'São Paulo', 'SP', '04000-000',
   'clinica', 'Clínica Ortopédica', 'Rua Clínica, 50', 'Campinas', 'SP', '13000-000',
   'pendente', NULL, CURRENT_DATE + 2, 'Transportadora Nacional', 'normal', 95.00, 1, 8.0);

