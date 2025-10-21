-- ============================================
-- Migration: 20251019_contracts_crm
-- Descrição: Estruturas completas para Gestão de Contratos e CRM/Vendas
-- Requisitos: OraclusX DS / ICARUS v5
-- ============================================

BEGIN;

-- ============================================
-- 1. Tabelas de Contratos
-- ============================================

CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  numero_contrato TEXT NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'fornecimento_produtos',
    'prestacao_servicos',
    'opme_hospital',
    'locacao',
    'parceria',
    'seguro',
    'outro'
  )),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN (
    'rascunho',
    'em_aprovacao',
    'ativo',
    'renovacao',
    'encerrado',
    'cancelado'
  )),
  contratante_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  contratante_nome TEXT,
  contratado_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  contratado_nome TEXT,
  contratado_documento TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  renovacao_automatica BOOLEAN DEFAULT false,
  prazo_aviso_rescisao INTEGER,
  valor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  indice_reajuste TEXT CHECK (indice_reajuste IN ('nenhum','ipca','igpm','inpc','percentual_fixo')),
  periodicidade_reajuste TEXT CHECK (periodicidade_reajuste IS NULL OR periodicidade_reajuste IN ('anual','semestral')),
  percentual_reajuste NUMERIC(5,2),
  clausulas_principais TEXT,
  observacoes TEXT,
  exige_aprovacao_juridico BOOLEAN DEFAULT false,
  exige_aprovacao_financeiro BOOLEAN DEFAULT false,
  exige_aprovacao_diretoria BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (empresa_id, numero_contrato)
);

CREATE INDEX IF NOT EXISTS idx_contratos_empresa_status ON contratos(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_contratos_datas ON contratos(empresa_id, data_fim);

-- Clausulas
CREATE TABLE IF NOT EXISTS contratos_clausulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  texto TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_clausulas_contrato ON contratos_clausulas(contrato_id);

-- Aditivos
CREATE TABLE IF NOT EXISTS contratos_aditivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_ajuste NUMERIC(14,2) DEFAULT 0,
  data_assinatura DATE NOT NULL,
  arquivo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_aditivos_contrato ON contratos_aditivos(contrato_id);

-- SLA
CREATE TABLE IF NOT EXISTS contratos_sla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  indicador TEXT NOT NULL,
  meta TEXT NOT NULL,
  penalidade TEXT,
  frequencia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_sla_contrato ON contratos_sla(contrato_id);

-- Aprovações
CREATE TABLE IF NOT EXISTS contratos_aprovacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  nivel TEXT NOT NULL CHECK (nivel IN ('juridico','financeiro','diretoria','comercial','operacional')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado')),
  comentario TEXT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_aprovacoes_contrato ON contratos_aprovacoes(contrato_id);

-- Alertas
CREATE TABLE IF NOT EXISTS contratos_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('vencimento','renovacao','sla','inadimplencia','assinatura')),
  descricao TEXT,
  data_alerta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severidade TEXT CHECK (severidade IN ('info','warning','critical')) DEFAULT 'warning',
  resolvido BOOLEAN DEFAULT false,
  resolvido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_alertas_status ON contratos_alertas(contrato_id, resolvido);

-- Documentos
CREATE TABLE IF NOT EXISTS contratos_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  tipo TEXT,
  nome_arquivo TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION trg_contratos_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contratos_set_updated_at BEFORE UPDATE ON contratos
FOR EACH ROW EXECUTE FUNCTION trg_contratos_set_updated_at();

-- ============================================
-- 2. Tabelas CRM / Vendas
-- ============================================

-- Ajustar tabela de leads existente
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS origem TEXT CHECK (origem IN ('website','indicacao','evento','cold_call','linkedin','google_ads','facebook_ads','outro')) DEFAULT 'outro';

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS orcamento TEXT CHECK (orcamento IN ('ate_10k','10k_50k','50k_100k','acima_100k','nao_informado'));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS prazo_decisao TEXT CHECK (prazo_decisao IN ('imediato','curto','medio','longo','indefinido'));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS tomador_decisao BOOLEAN DEFAULT false;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS necessidade TEXT;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS score_ia INTEGER;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS proxima_acao TEXT;

-- Normalizar constraint estagio
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'leads'::regclass
    AND contype = 'c'
    AND conname LIKE 'leads_estagio%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE leads DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE leads
  ADD CONSTRAINT leads_estagio_check
  CHECK (estagio IN (
    'novo',
    'contato',
    'qualificado',
    'proposta',
    'negociacao',
    'ganho',
    'perdido',
    'desqualificado'
  ));

-- Oportunidades
CREATE TABLE IF NOT EXISTS oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  valor NUMERIC(14,2) DEFAULT 0,
  etapa TEXT NOT NULL CHECK (etapa IN (
    'prospeccao',
    'contato_inicial',
    'qualificacao',
    'apresentacao',
    'proposta',
    'negociacao',
    'fechamento',
    'ganho',
    'perdido'
  )),
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','fechada_ganho','fechada_perdido','congelada')),
  probabilidade INTEGER CHECK (probabilidade BETWEEN 0 AND 100) DEFAULT 50,
  data_fechamento_prevista DATE,
  data_fechamento_real DATE,
  responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  cliente_segmento TEXT,
  origem TEXT,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_empresa_etapa ON oportunidades(empresa_id, etapa);
CREATE INDEX IF NOT EXISTS idx_oportunidades_responsavel ON oportunidades(responsavel_id);

CREATE TRIGGER oportunidades_set_updated_at BEFORE UPDATE ON oportunidades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Interações
CREATE TABLE IF NOT EXISTS oportunidade_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('email','ligacao','reuniao','whatsapp','video','outro')),
  descricao TEXT,
  metadata JSONB,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  ocorreu_em TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interacoes_oportunidade ON oportunidade_interacoes(oportunidade_id);

-- Tarefas / Follow-ups
CREATE TABLE IF NOT EXISTS oportunidade_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida','cancelada')),
  due_date DATE,
  responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  concluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tarefas_oportunidade ON oportunidade_tarefas(oportunidade_id, status);

-- Propostas
CREATE TABLE IF NOT EXISTS oportunidade_propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  numero TEXT,
  valor NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','enviada','aceita','rejeitada','cancelada')),
  url_pdf TEXT,
  criada_em TIMESTAMPTZ DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_propostas_oportunidade ON oportunidade_propostas(oportunidade_id);

-- Campanhas
CREATE TABLE IF NOT EXISTS campanhas_marketing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('email','whatsapp','sms','ads','outro')),
  publico_alvo TEXT,
  enviados INTEGER DEFAULT 0,
  abertos INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  conversoes INTEGER DEFAULT 0,
  taxa_abertura NUMERIC(5,2),
  taxa_cliques NUMERIC(5,2),
  status TEXT CHECK (status IN ('rascunho','agendada','em_andamento','finalizada','pausada')) DEFAULT 'rascunho',
  disparo_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campanhas_empresa_status ON campanhas_marketing(empresa_id, status);

-- Clientes 360
CREATE TABLE IF NOT EXISTS crm_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  documento TEXT,
  segmento TEXT,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  status TEXT CHECK (status IN ('ativo','inativo','prospect')) DEFAULT 'ativo',
  ltv NUMERIC(14,2) DEFAULT 0,
  dias_ultima_compra INTEGER,
  nps NUMERIC(4,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_clientes_empresa_status ON crm_clientes(empresa_id, status);

-- ============================================
-- 3. Views e indicadores
-- ============================================

CREATE OR REPLACE VIEW view_contratos_kpis AS
SELECT
  empresa_id,
  COUNT(*) FILTER (WHERE status = 'ativo') AS contratos_ativos,
  COUNT(*) FILTER (WHERE status = 'renovacao') AS contratos_em_renovacao,
  COUNT(*) FILTER (WHERE status = 'em_aprovacao') AS contratos_pendentes,
  SUM(valor_total) FILTER (WHERE status IN ('ativo','renovacao')) AS valor_total,
  COUNT(*) FILTER (WHERE data_fim BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS vencer_30,
  COUNT(*) FILTER (WHERE data_fim BETWEEN CURRENT_DATE + INTERVAL '31 days' AND CURRENT_DATE + INTERVAL '90 days') AS vencer_90,
  ROUND(
    COALESCE(
      100 * (
        COUNT(*) FILTER (WHERE status = 'ativo' AND renovacao_automatica)
      )::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE status = 'ativo'), 0)
    ,0)
  ,2) AS taxa_renovacao,
  MAX(updated_at) AS atualizado_em
FROM contratos
GROUP BY empresa_id;

CREATE OR REPLACE VIEW view_contratos_alertas AS
SELECT
  ca.*, c.titulo AS contrato_titulo, c.numero_contrato
FROM contratos_alertas ca
JOIN contratos c ON c.id = ca.contrato_id;

CREATE OR REPLACE VIEW view_crm_funil AS
SELECT
  empresa_id,
  etapa,
  COUNT(*) AS total,
  SUM(valor) AS valor_total
FROM oportunidades
GROUP BY empresa_id, etapa;

CREATE OR REPLACE VIEW view_crm_taxa_conversao AS
SELECT
  empresa_id,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE etapa = 'ganho') AS ganhos,
  COUNT(*) FILTER (WHERE etapa = 'perdido') AS perdidos,
  COUNT(*) FILTER (WHERE etapa NOT IN ('ganho','perdido')) AS em_andamento,
  ROUND(
    COALESCE(
      100 * COUNT(*) FILTER (WHERE etapa = 'ganho')::NUMERIC / NULLIF(COUNT(*),0)
    ,0)
  ,2) AS taxa_conversao
FROM leads
GROUP BY empresa_id;

CREATE OR REPLACE VIEW view_crm_pipeline_resumo AS
SELECT
  empresa_id,
  SUM(valor) AS valor_total,
  COUNT(*) AS total_oportunidades,
  AVG(probabilidade) AS probabilidade_media
FROM oportunidades
GROUP BY empresa_id;

CREATE OR REPLACE VIEW view_crm_campanhas_stats AS
SELECT
  empresa_id,
  COUNT(*) FILTER (WHERE status IN ('agendada','em_andamento')) AS campanhas_ativas,
  AVG(taxa_abertura) AS taxa_abertura_media,
  AVG(taxa_cliques) AS taxa_cliques_media,
  SUM(conversoes) AS total_conversoes
FROM campanhas_marketing
GROUP BY empresa_id;

-- ============================================
-- 4. Comentários
-- ============================================

COMMENT ON TABLE contratos IS 'Gestão completa de contratos (ICARUS v5)';
COMMENT ON TABLE contratos_clausulas IS 'Cláusulas adicionais por contrato';
COMMENT ON TABLE contratos_aditivos IS 'Aditivos e renovações contratuais';
COMMENT ON TABLE contratos_sla IS 'Indicadores SLA associados ao contrato';
COMMENT ON TABLE contratos_aprovacoes IS 'Workflow hierárquico de aprovação';
COMMENT ON TABLE contratos_alertas IS 'Alertas automáticos (renovação, SLA, vencimento)';
COMMENT ON TABLE oportunidades IS 'Pipeline de vendas / oportunidades CRM';
COMMENT ON TABLE oportunidade_interacoes IS 'Histórico de interações (360º)';
COMMENT ON TABLE oportunidade_tarefas IS 'Tarefas e follow-ups do pipeline';
COMMENT ON TABLE oportunidade_propostas IS 'Propostas comerciais ligadas à oportunidade';
COMMENT ON TABLE campanhas_marketing IS 'Campanhas e disparos multicanal';
COMMENT ON TABLE crm_clientes IS 'Base consolidada de clientes (visão 360º)';

COMMIT;


