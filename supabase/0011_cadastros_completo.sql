-- ============================================================================
-- MIGRATION: Cadastros Completos (Médicos, Hospitais, Pacientes, Convênios)
-- Versão: 5.0.0
-- Data: Outubro 2025
-- Descrição: Estrutura completa para Gestão de Cadastros Inteligentes
-- ============================================================================

-- ============================================================================
-- 1. TABELA: pacientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE NOT NULL,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
  estado_civil TEXT CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  
  -- Filiação
  nome_mae TEXT NOT NULL,
  nome_pai TEXT,
  
  -- Contato
  telefone TEXT,
  celular TEXT,
  email TEXT,
  
  -- Endereço (JSONB)
  endereco JSONB,
  
  -- Dados do Convênio
  convenio_id UUID REFERENCES convenios(id),
  numero_carteirinha TEXT,
  validade_plano DATE,
  plano TEXT,
  tipo_atendimento TEXT CHECK (tipo_atendimento IN ('ambulatorial', 'hospitalar', 'completo')),
  
  -- Informações Médicas
  grupo_sanguineo TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  observacoes_saude TEXT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  consentimento_lgpd BOOLEAN DEFAULT false,
  consentimento_lgpd_data TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Índices e Constraints
  CONSTRAINT pacientes_numero_carteirinha_convenio_uk UNIQUE (numero_carteirinha, convenio_id)
);

-- Índices
CREATE INDEX idx_pacientes_empresa ON pacientes(empresa_id);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_pacientes_nome ON pacientes USING gin(to_tsvector('portuguese', nome_completo));
CREATE INDEX idx_pacientes_convenio ON pacientes(convenio_id);
CREATE INDEX idx_pacientes_ativo ON pacientes(ativo);

-- Trigger para updated_at
CREATE TRIGGER pacientes_updated_at BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE pacientes IS 'Cadastro de pacientes para cirurgias OPME';

-- ============================================================================
-- 2. TABELA: convenios
-- ============================================================================
CREATE TABLE IF NOT EXISTS convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Institucionais
  nome TEXT NOT NULL,
  cnpj TEXT,
  ans_registro TEXT,
  tipo TEXT CHECK (tipo IN ('plano_saude', 'seguros', 'publico')),
  
  -- Contato
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  site TEXT,
  
  -- Dados Financeiros
  prazo_pagamento INT DEFAULT 30,
  taxa_administrativa NUMERIC(5,2) DEFAULT 0,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('ted', 'boleto', 'pix', 'cheque')),
  dia_fechamento INT,
  dia_pagamento INT,
  
  -- Configurações de Faturamento
  faturamento_eletronico BOOLEAN DEFAULT false,
  portal_faturamento TEXT,
  login_portal TEXT,
  exige_autorizacao BOOLEAN DEFAULT false,
  prazo_autorizacao INT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT convenios_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_convenios_empresa ON convenios(empresa_id);
CREATE INDEX idx_convenios_cnpj ON convenios(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_convenios_ans ON convenios(ans_registro) WHERE ans_registro IS NOT NULL;
CREATE INDEX idx_convenios_ativo ON convenios(ativo);

-- Trigger
CREATE TRIGGER convenios_updated_at BEFORE UPDATE ON convenios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE convenios IS 'Cadastro de convênios e planos de saúde';

-- ============================================================================
-- 3. TABELA: equipes_medicas
-- ============================================================================
CREATE TABLE IF NOT EXISTS equipes_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,
  medico_responsavel_id UUID NOT NULL REFERENCES medicos(id),
  especialidade TEXT,
  hospital_id UUID REFERENCES hospitais(id),
  
  -- Configurações Operacionais
  dias_atuacao TEXT[], -- ['Segunda', 'Terça', ...]
  horarios_preferencia TEXT,
  cirurgias_semana_media INT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT equipes_medicas_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_equipes_medicas_empresa ON equipes_medicas(empresa_id);
CREATE INDEX idx_equipes_medicas_responsavel ON equipes_medicas(medico_responsavel_id);
CREATE INDEX idx_equipes_medicas_hospital ON equipes_medicas(hospital_id);
CREATE INDEX idx_equipes_medicas_ativo ON equipes_medicas(ativo);

-- Trigger
CREATE TRIGGER equipes_medicas_updated_at BEFORE UPDATE ON equipes_medicas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE equipes_medicas IS 'Cadastro de equipes médicas';

-- ============================================================================
-- 4. TABELA: membros_equipe
-- ============================================================================
CREATE TABLE IF NOT EXISTS membros_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES equipes_medicas(id) ON DELETE CASCADE,
  medico_id UUID NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  funcao TEXT CHECK (funcao IN ('cirurgiao_principal', 'cirurgiao_auxiliar', 'anestesista', 'instrumentador', 'auxiliar_enfermagem')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT membros_equipe_uk UNIQUE (equipe_id, medico_id)
);

-- Índices
CREATE INDEX idx_membros_equipe_equipe ON membros_equipe(equipe_id);
CREATE INDEX idx_membros_equipe_medico ON membros_equipe(medico_id);

COMMENT ON TABLE membros_equipe IS 'Membros das equipes médicas';

-- ============================================================================
-- 5. TABELA: transportadoras
-- ============================================================================
CREATE TABLE IF NOT EXISTS transportadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Institucionais
  nome TEXT NOT NULL,
  cnpj TEXT,
  tipo TEXT CHECK (tipo IN ('rodoviario', 'aereo', 'courier', 'multimodal')),
  
  -- Contato
  telefone TEXT,
  email TEXT,
  site TEXT,
  
  -- Endereço
  endereco JSONB,
  
  -- Dados Operacionais
  prazo_entrega_medio INT, -- dias
  custo_km NUMERIC(10,2),
  raio_atendimento INT, -- km
  horario_coleta TEXT,
  
  -- Integração API
  possui_api BOOLEAN DEFAULT false,
  api_url TEXT,
  api_token TEXT,
  api_auth_type TEXT CHECK (api_auth_type IN ('bearer', 'basic', 'api_key', 'oauth2')),
  
  -- Avaliação
  avaliacao NUMERIC(2,1) CHECK (avaliacao >= 0 AND avaliacao <= 5),
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT transportadoras_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_transportadoras_empresa ON transportadoras(empresa_id);
CREATE INDEX idx_transportadoras_cnpj ON transportadoras(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_transportadoras_tipo ON transportadoras(tipo);
CREATE INDEX idx_transportadoras_ativo ON transportadoras(ativo);

-- Trigger
CREATE TRIGGER transportadoras_updated_at BEFORE UPDATE ON transportadoras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE transportadoras IS 'Cadastro de transportadoras para logística';

-- ============================================================================
-- 6. TABELA: grupos_produtos
-- ============================================================================
CREATE TABLE IF NOT EXISTS grupos_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT grupos_produtos_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_grupos_produtos_empresa ON grupos_produtos(empresa_id);
CREATE INDEX idx_grupos_produtos_ativo ON grupos_produtos(ativo);

COMMENT ON TABLE grupos_produtos IS 'Grupos de produtos OPME para organização';

-- ============================================================================
-- VIEWS: Cadastros KPIs
-- ============================================================================

CREATE OR REPLACE VIEW v_cadastros_kpis AS
SELECT
  e.id AS empresa_id,
  COUNT(DISTINCT m.id) FILTER (WHERE m.ativo = true) AS medicos_ativos,
  COUNT(DISTINCT h.id) FILTER (WHERE h.ativo = true) AS hospitais_ativos,
  COUNT(DISTINCT p.id) AS total_pacientes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.ativo = true) AS convenios_ativos,
  COUNT(DISTINCT f.id) FILTER (WHERE f.ativo = true) AS fornecedores_ativos,
  COUNT(DISTINCT pr.id) AS produtos_opme,
  COUNT(DISTINCT eq.id) FILTER (WHERE eq.ativo = true) AS equipes_medicas_ativas,
  COUNT(DISTINCT t.id) FILTER (WHERE t.ativo = true) AS transportadoras_ativas
FROM empresas e
LEFT JOIN medicos m ON m.empresa_id = e.id
LEFT JOIN hospitais h ON h.empresa_id = e.id
LEFT JOIN pacientes p ON p.empresa_id = e.id
LEFT JOIN convenios c ON c.empresa_id = e.id
LEFT JOIN fornecedores f ON f.empresa_id = e.id
LEFT JOIN produtos pr ON pr.empresa_id = e.id
LEFT JOIN equipes_medicas eq ON eq.empresa_id = e.id
LEFT JOIN transportadoras t ON t.empresa_id = e.id
GROUP BY e.id;

COMMENT ON VIEW v_cadastros_kpis IS 'KPIs consolidados de cadastros';

-- ============================================================================
-- GRANTS (RLS configurado separadamente)
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON convenios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON equipes_medicas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON membros_equipe TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transportadoras TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON grupos_produtos TO authenticated;
GRANT SELECT ON v_cadastros_kpis TO authenticated;

