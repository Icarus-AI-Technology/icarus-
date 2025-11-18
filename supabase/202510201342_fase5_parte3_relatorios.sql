-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 3/5)
-- MÓDULO RELATÓRIOS REGULATÓRIOS - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. RELATORIOS_REGULATORIOS (relatórios gerados)
CREATE TABLE IF NOT EXISTS public.relatorios_regulatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  template_id UUID,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('anvisa', 'ans', 'receita_federal', 'vigilancia', 'trabalho', 'ambiental', 'outro')) NOT NULL,
  periodicidade TEXT CHECK (periodicidade IN ('mensal', 'trimestral', 'semestral', 'anual', 'sob_demanda')),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  status TEXT CHECK (status IN ('rascunho', 'gerando', 'concluido', 'enviado', 'erro')) DEFAULT 'rascunho',
  dados_json JSONB,
  arquivo_url TEXT,
  arquivo_hash TEXT,
  gerado_por_id UUID REFERENCES public.usuarios(id),
  gerado_em TIMESTAMPTZ,
  enviado_em TIMESTAMPTZ,
  protocolo_envio TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_relatorios_regulatorios_empresa ON public.relatorios_regulatorios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_regulatorios_tipo ON public.relatorios_regulatorios(tipo, periodo_fim DESC);
CREATE INDEX IF NOT EXISTS idx_relatorios_regulatorios_status ON public.relatorios_regulatorios(status, criado_em DESC);

-- 2. RELATORIOS_TEMPLATES (templates de relatórios)
CREATE TABLE IF NOT EXISTS public.relatorios_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL,
  formato TEXT CHECK (formato IN ('pdf', 'xlsx', 'csv', 'xml', 'json')) DEFAULT 'pdf',
  template_conteudo TEXT,
  query_sql TEXT,
  configuracao_json JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  sistema BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_relatorios_templates_empresa ON public.relatorios_templates(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_relatorios_templates_tipo ON public.relatorios_templates(tipo);

-- 3. RELATORIOS_AGENDAMENTOS (agendamentos automáticos)
CREATE TABLE IF NOT EXISTS public.relatorios_agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  cron_expressao TEXT NOT NULL,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  destinatarios_emails TEXT[],
  destinatarios_ids UUID[],
  parametros_json JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relatorios_agendamentos_empresa ON public.relatorios_agendamentos(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_relatorios_agendamentos_proxima ON public.relatorios_agendamentos(proxima_execucao) WHERE ativo = TRUE;

CREATE TRIGGER trg_relatorios_regulatorios_updated BEFORE UPDATE ON public.relatorios_regulatorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_relatorios_templates_updated BEFORE UPDATE ON public.relatorios_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_relatorios_agendamentos_updated BEFORE UPDATE ON public.relatorios_agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.relatorios_regulatorios IS 'Relatórios regulatórios gerados';
COMMENT ON TABLE public.relatorios_templates IS 'Templates de relatórios reutilizáveis';
COMMENT ON TABLE public.relatorios_agendamentos IS 'Agendamentos automáticos de relatórios';

