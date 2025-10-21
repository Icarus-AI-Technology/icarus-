-- ============================================
-- ICARUS v5.0 - Supabase Database Schema
-- Sistema de Gestão Cirúrgica OPME
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. TABELA: profiles (Usuários do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'medico', 'financeiro', 'estoque', 'vendas')) DEFAULT 'medico',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- 2. TABELA: medicos (Médicos Cirurgiões)
-- ============================================
CREATE TABLE IF NOT EXISTS medicos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  crm TEXT NOT NULL,
  crm_uf TEXT NOT NULL CHECK (LENGTH(crm_uf) = 2),
  especialidade TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  endereco TEXT,
  hospital_principal TEXT,
  volume_anual_estimado DECIMAL(12, 2),
  taxa_sucesso DECIMAL(5, 2) DEFAULT 0,
  cirurgias_realizadas INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('ativo', 'inativo', 'suspenso')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crm, crm_uf)
);

-- Índices para busca e performance
CREATE INDEX IF NOT EXISTS idx_medicos_crm ON medicos(crm);
CREATE INDEX IF NOT EXISTS idx_medicos_especialidade ON medicos(especialidade);
CREATE INDEX IF NOT EXISTS idx_medicos_status ON medicos(status);

-- ============================================
-- 3. TABELA: hospitais (Hospitais & Clínicas)
-- ============================================
CREATE TABLE IF NOT EXISTS hospitais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  tipo TEXT CHECK (tipo IN ('hospital', 'clinica', 'centro_cirurgico')) DEFAULT 'hospital',
  status TEXT CHECK (status IN ('ativo', 'inativo')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TABELA: cirurgias (Cirurgias & Procedimentos)
-- ============================================
CREATE TABLE IF NOT EXISTS cirurgias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  paciente_nome TEXT NOT NULL,
  procedimento TEXT NOT NULL,
  data_cirurgia DATE NOT NULL,
  hora_cirurgia TIME NOT NULL,
  sala TEXT,
  status TEXT CHECK (status IN ('agendada', 'confirmada', 'preparacao', 'andamento', 'recuperacao', 'concluida', 'cancelada')) DEFAULT 'agendada',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  observacoes TEXT,
  valor_estimado DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cirurgias_medico ON cirurgias(medico_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_hospital ON cirurgias(hospital_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_data ON cirurgias(data_cirurgia);
CREATE INDEX IF NOT EXISTS idx_cirurgias_status ON cirurgias(status);

-- ============================================
-- 5. TABELA: materiais_opme (Materiais Cirúrgicos)
-- ============================================
CREATE TABLE IF NOT EXISTS materiais_opme (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  fabricante TEXT,
  categoria TEXT,
  valor_unitario DECIMAL(12, 2),
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  unidade_medida TEXT DEFAULT 'UN',
  status TEXT CHECK (status IN ('ativo', 'inativo', 'descontinuado')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. TABELA: cirurgia_materiais (Relação N:N)
-- ============================================
CREATE TABLE IF NOT EXISTS cirurgia_materiais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materiais_opme(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cirurgia_id, material_id)
);

-- ============================================
-- 7. TABELA: leads (CRM & Vendas)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  empresa TEXT,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  valor_estimado DECIMAL(12, 2),
  estagio TEXT CHECK (estagio IN ('prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento', 'perdido')) DEFAULT 'prospeccao',
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100) DEFAULT 50,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  proxima_acao TEXT,
  data_ultimo_contato DATE,
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TABELA: transacoes (Financeiro)
-- ============================================
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipo TEXT CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')) DEFAULT 'pendente',
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. TABELA: fornecedores (Compras)
-- ============================================
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  categoria TEXT,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  volume_compras DECIMAL(12, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('ativo', 'inativo', 'bloqueado')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. TABELA: pedidos_compra (Compras)
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos_compra (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  status TEXT CHECK (status IN ('aguardando', 'aprovado', 'processando', 'entregue', 'cancelado')) DEFAULT 'aguardando',
  urgencia TEXT CHECK (urgencia IN ('normal', 'urgente', 'critico')) DEFAULT 'normal',
  data_pedido DATE DEFAULT CURRENT_DATE,
  data_entrega_prevista DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS: Updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicos_updated_at BEFORE UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitais_updated_at BEFORE UPDATE ON hospitais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cirurgias_updated_at BEFORE UPDATE ON cirurgias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materiais_opme_updated_at BEFORE UPDATE ON materiais_opme FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_compra_updated_at BEFORE UPDATE ON pedidos_compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS: Estatísticas e Relatórios
-- ============================================

-- View: Estatísticas de Cirurgias por Médico
CREATE OR REPLACE VIEW view_medicos_stats AS
SELECT 
  m.id,
  m.nome,
  m.especialidade,
  COUNT(c.id) AS total_cirurgias,
  AVG(c.valor_estimado) AS ticket_medio,
  SUM(c.valor_estimado) AS faturamento_total
FROM medicos m
LEFT JOIN cirurgias c ON m.id = c.medico_id
WHERE m.status = 'ativo'
GROUP BY m.id, m.nome, m.especialidade;

-- View: Dashboard Financeiro
CREATE OR REPLACE VIEW view_dashboard_financeiro AS
SELECT 
  SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE 0 END) AS receitas_recebidas,
  SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN tipo = 'receita' AND status = 'pendente' THEN valor ELSE 0 END) AS receitas_pendentes,
  SUM(CASE WHEN tipo = 'despesa' AND status = 'pendente' THEN valor ELSE 0 END) AS despesas_pendentes
FROM transacoes
WHERE DATE_PART('month', data_vencimento) = DATE_PART('month', CURRENT_DATE);

-- ============================================
-- FUNÇÕES: Lógica de Negócio
-- ============================================

-- Função: Atualizar estoque de materiais
CREATE OR REPLACE FUNCTION atualizar_estoque_material(
  p_material_id UUID,
  p_quantidade INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE materiais_opme
  SET estoque_atual = estoque_atual + p_quantidade
  WHERE id = p_material_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular taxa de sucesso do médico
CREATE OR REPLACE FUNCTION calcular_taxa_sucesso_medico(p_medico_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_cirurgias INTEGER;
  cirurgias_sucesso INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_cirurgias
  FROM cirurgias
  WHERE medico_id = p_medico_id AND status = 'concluida';
  
  SELECT COUNT(*) INTO cirurgias_sucesso
  FROM cirurgias
  WHERE medico_id = p_medico_id AND status = 'concluida';
  
  IF total_cirurgias = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (cirurgias_sucesso::DECIMAL / total_cirurgias::DECIMAL) * 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DADOS MOCK: Para desenvolvimento
-- ============================================

-- Inserir médicos de exemplo
INSERT INTO medicos (nome, crm, crm_uf, especialidade, telefone, email, hospital_principal, taxa_sucesso, cirurgias_realizadas) VALUES
('Dr. Roberto Silva', '123456', 'SP', 'Ortopedia', '(11) 98765-4321', 'roberto@hospital.com', 'Hospital São Lucas', 98.5, 12),
('Dra. Ana Paula Costa', '234567', 'RJ', 'Cardiologia', '(21) 97654-3210', 'ana@hospital.com', 'Hospital Sírio-Libanês', 99.2, 15),
('Dr. Carlos Mendes', '345678', 'SP', 'Neurocirurgia', '(11) 96543-2109', 'carlos@hospital.com', 'Hospital Israelita', 97.8, 8),
('Dra. Maria Santos', '456789', 'RJ', 'Ortopedia', '(21) 95432-1098', 'maria@hospital.com', 'Hospital Copa D''Or', 98.9, 18)
ON CONFLICT (crm, crm_uf) DO NOTHING;

-- Inserir hospitais de exemplo
INSERT INTO hospitais (nome, cnpj, cidade, estado, tipo) VALUES
('Hospital São Lucas', '12345678000190', 'São Paulo', 'SP', 'hospital'),
('Hospital Sírio-Libanês', '23456789000191', 'São Paulo', 'SP', 'hospital'),
('Hospital Israelita', '34567890000192', 'São Paulo', 'SP', 'hospital'),
('Hospital Copa D''Or', '45678900000193', 'Rio de Janeiro', 'RJ', 'hospital')
ON CONFLICT (cnpj) DO NOTHING;

-- Inserir materiais OPME de exemplo
INSERT INTO materiais_opme (codigo, nome, fabricante, categoria, valor_unitario, estoque_atual) VALUES
('OPME-001', 'Prótese de Joelho', 'Stryker', 'Ortopedia', 15000.00, 10),
('OPME-002', 'Stent Cardíaco', 'Medtronic', 'Cardiologia', 8500.00, 25),
('OPME-003', 'Placa de Fixação Coluna', 'DePuy Synthes', 'Neurocirurgia', 12000.00, 15)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================
COMMENT ON TABLE medicos IS 'Cadastro de médicos cirurgiões do sistema';
COMMENT ON TABLE cirurgias IS 'Gestão de cirurgias e procedimentos';
COMMENT ON TABLE materiais_opme IS 'Catálogo de materiais OPME';
COMMENT ON TABLE leads IS 'Pipeline de vendas CRM';
COMMENT ON TABLE transacoes IS 'Gestão financeira (receitas/despesas)';

