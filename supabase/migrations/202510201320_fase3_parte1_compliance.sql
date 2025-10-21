-- ============================================
-- Migration: FASE 3 - Compliance & Integrações (Parte 1/4)
-- MÓDULO COMPLIANCE/AUDITORIA - 6 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Compliance regulatório e auditoria:
-- - Requisitos normativos (ANVISA, RDC, ISO)
-- - Evidências documentais
-- - Auditorias internas/externas
-- - Não conformidades e ações corretivas
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. COMPLIANCE_REQUISITOS (requisitos regulatórios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.compliance_requisitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Classificação
  tipo TEXT CHECK (tipo IN (
    'anvisa', 'rdc', 'iso', 'lgpd', 'trabalhista', 
    'ambiental', 'qualidade', 'seguranca', 'outro'
  )) NOT NULL,
  categoria TEXT,
  
  -- Norma/legislação
  norma_base TEXT, -- Ex: "RDC 36/2015", "ISO 13485:2016"
  artigo_clausula TEXT,
  versao TEXT,
  
  -- Criticidade
  criticidade TEXT CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')) DEFAULT 'media',
  obrigatorio BOOLEAN DEFAULT TRUE,
  
  -- Periodicidade
  frequencia_verificacao TEXT CHECK (frequencia_verificacao IN (
    'diaria', 'semanal', 'quinzenal', 'mensal', 
    'trimestral', 'semestral', 'anual', 'sob_demanda'
  )),
  proxima_verificacao DATE,
  
  -- Responsável
  responsavel_id UUID REFERENCES public.usuarios(id),
  departamento TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('ativo', 'inativo', 'obsoleto', 'em_revisao')) DEFAULT 'ativo',
  
  -- Documentação
  documentos_urls TEXT[],
  checklist_json JSONB, -- Checklist de verificação estruturado
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_empresa ON public.compliance_requisitos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_tipo ON public.compliance_requisitos(tipo, criticidade) WHERE status = 'ativo';
CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_status ON public.compliance_requisitos(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_verificacao ON public.compliance_requisitos(proxima_verificacao) WHERE status = 'ativo';
CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_responsavel ON public.compliance_requisitos(responsavel_id) WHERE status = 'ativo';

COMMENT ON TABLE public.compliance_requisitos IS 'Requisitos regulatórios e normativos (ANVISA, ISO, LGPD)';

-- ============================================
-- 2. COMPLIANCE_EVIDENCIAS (evidências documentais)
-- ============================================
CREATE TABLE IF NOT EXISTS public.compliance_evidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  requisito_id UUID NOT NULL REFERENCES public.compliance_requisitos(id) ON DELETE CASCADE,
  
  -- Identificação
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN (
    'documento', 'foto', 'video', 'relatorio', 
    'planilha', 'certificado', 'laudo', 'ata', 'outro'
  )) NOT NULL,
  
  -- Arquivo
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER, -- bytes
  arquivo_hash TEXT, -- Para integridade
  
  -- Validade
  data_documento DATE,
  data_validade DATE,
  valido BOOLEAN DEFAULT TRUE,
  
  -- Relacionamentos
  auditoria_id UUID,
  nao_conformidade_id UUID,
  
  -- Classificação
  categoria TEXT,
  tags TEXT[],
  
  -- Aprovação
  aprovado BOOLEAN DEFAULT FALSE,
  aprovado_por_id UUID REFERENCES public.usuarios(id),
  data_aprovacao TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_compliance_evidencias_empresa ON public.compliance_evidencias(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_evidencias_requisito ON public.compliance_evidencias(requisito_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_evidencias_tipo ON public.compliance_evidencias(tipo) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_evidencias_validade ON public.compliance_evidencias(data_validade) WHERE valido = TRUE;
CREATE INDEX IF NOT EXISTS idx_compliance_evidencias_auditoria ON public.compliance_evidencias(auditoria_id) WHERE auditoria_id IS NOT NULL;

COMMENT ON TABLE public.compliance_evidencias IS 'Evidências documentais de conformidade regulatória';

-- ============================================
-- 3. AUDITORIAS (auditorias internas e externas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.auditorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  objetivo TEXT,
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('interna', 'externa', 'certificacao', 'vigilancia', 'inspetoria')) NOT NULL,
  escopo TEXT NOT NULL,
  
  -- Norma auditada
  normas_aplicaveis TEXT[], -- Ex: ["ISO 13485", "RDC 36/2015"]
  
  -- Planejamento
  data_planejamento DATE DEFAULT CURRENT_DATE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  duracao_horas INTEGER,
  
  -- Equipe auditora
  auditor_lider_id UUID REFERENCES public.usuarios(id),
  auditores TEXT[], -- Nomes dos auditores
  entidade_auditora TEXT, -- Se externa
  
  -- Área auditada
  departamentos_auditados TEXT[],
  processos_auditados TEXT[],
  
  -- Resultados
  pontuacao_geral DECIMAL(5, 2),
  percentual_conformidade DECIMAL(5, 2),
  total_conformidades INTEGER DEFAULT 0,
  total_nao_conformidades INTEGER DEFAULT 0,
  total_observacoes INTEGER DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN (
    'planejada', 'em_andamento', 'concluida', 
    'relatorio_pendente', 'finalizada', 'cancelada'
  )) DEFAULT 'planejada',
  
  -- Relatório
  relatorio_url TEXT,
  data_relatorio DATE,
  
  -- Conclusão
  conclusao TEXT,
  recomendacoes TEXT,
  pontos_fortes TEXT,
  oportunidades_melhoria TEXT,
  
  -- Certificação (se aplicável)
  certificado_emitido BOOLEAN DEFAULT FALSE,
  certificado_url TEXT,
  certificado_validade DATE,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_auditorias_empresa ON public.auditorias(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_auditorias_tipo ON public.auditorias(tipo, status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_auditorias_status ON public.auditorias(status, data_inicio DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_auditorias_datas ON public.auditorias(data_inicio, data_fim) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_auditorias_auditor ON public.auditorias(auditor_lider_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.auditorias IS 'Auditorias internas e externas (ISO, ANVISA, certificações)';

-- ============================================
-- 4. AUDITORIAS_ITENS (itens verificados na auditoria)
-- ============================================
CREATE TABLE IF NOT EXISTS public.auditorias_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias(id) ON DELETE CASCADE,
  requisito_id UUID REFERENCES public.compliance_requisitos(id),
  
  -- Identificação
  numero_item TEXT NOT NULL,
  clausula TEXT, -- Cláusula da norma
  descricao TEXT NOT NULL,
  
  -- Área
  departamento TEXT,
  processo TEXT,
  
  -- Verificação
  data_verificacao TIMESTAMPTZ DEFAULT NOW(),
  metodo_verificacao TEXT CHECK (metodo_verificacao IN (
    'entrevista', 'observacao', 'analise_documental', 
    'medicao', 'teste', 'outro'
  )),
  
  -- Resultado
  resultado TEXT CHECK (resultado IN (
    'conforme', 'nao_conforme_maior', 'nao_conforme_menor', 
    'observacao', 'oportunidade_melhoria', 'nao_aplicavel'
  )) NOT NULL,
  
  -- Evidências
  evidencias TEXT,
  evidencias_urls TEXT[],
  
  -- Criticidade
  criticidade TEXT CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  impacto TEXT,
  
  -- Não conformidade (se aplicável)
  nao_conformidade_id UUID,
  
  -- Responsável pela área auditada
  responsavel_area TEXT,
  
  -- Observações
  observacoes TEXT,
  comentarios_auditor TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditorias_itens_auditoria ON public.auditorias_itens(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_itens_requisito ON public.auditorias_itens(requisito_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_itens_resultado ON public.auditorias_itens(resultado) WHERE resultado LIKE 'nao_conforme%';
CREATE INDEX IF NOT EXISTS idx_auditorias_itens_nc ON public.auditorias_itens(nao_conformidade_id) WHERE nao_conformidade_id IS NOT NULL;

COMMENT ON TABLE public.auditorias_itens IS 'Itens verificados nas auditorias (checklist)';

-- ============================================
-- 5. NAO_CONFORMIDADES (não conformidades identificadas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.nao_conformidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Origem
  origem TEXT CHECK (origem IN (
    'auditoria_interna', 'auditoria_externa', 'inspetoria', 
    'reclamacao_cliente', 'auto_inspecao', 'evento_adverso', 'outro'
  )) NOT NULL,
  auditoria_id UUID REFERENCES public.auditorias(id),
  auditoria_item_id UUID REFERENCES public.auditorias_itens(id),
  
  -- Classificação
  tipo TEXT CHECK (tipo IN ('maior', 'menor', 'observacao', 'risco')) NOT NULL,
  categoria TEXT,
  
  -- Requisito violado
  requisito_id UUID REFERENCES public.compliance_requisitos(id),
  norma_clausula TEXT,
  
  -- Departamento/processo
  departamento TEXT,
  processo TEXT,
  
  -- Criticidade e impacto
  criticidade TEXT CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')) NOT NULL,
  impacto TEXT,
  risco_potencial TEXT,
  
  -- Datas
  data_identificacao DATE DEFAULT CURRENT_DATE,
  data_limite_resposta DATE NOT NULL,
  data_resposta DATE,
  
  -- Responsáveis
  identificada_por_id UUID REFERENCES public.usuarios(id),
  responsavel_tratamento_id UUID REFERENCES public.usuarios(id),
  
  -- Análise de causa raiz
  causa_raiz TEXT,
  metodo_analise TEXT, -- Ex: "5 Porquês", "Ishikawa", "FMEA"
  
  -- Status
  status TEXT CHECK (status IN (
    'aberta', 'em_analise', 'em_tratamento', 
    'aguardando_verificacao', 'fechada', 'cancelada'
  )) DEFAULT 'aberta',
  
  -- Recorrência
  recorrente BOOLEAN DEFAULT FALSE,
  nc_relacionada_id UUID REFERENCES public.nao_conformidades(id),
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_nao_conformidades_empresa ON public.nao_conformidades(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_auditoria ON public.nao_conformidades(auditoria_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_status ON public.nao_conformidades(status, criticidade) WHERE status NOT IN ('fechada', 'cancelada');
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_responsavel ON public.nao_conformidades(responsavel_tratamento_id) WHERE status IN ('aberta', 'em_tratamento');
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_tipo ON public.nao_conformidades(tipo, data_identificacao DESC) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.nao_conformidades IS 'Não conformidades identificadas (auditorias, inspeções)';

-- ============================================
-- 6. ACOES_CORRETIVAS (ações corretivas e preventivas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.acoes_corretivas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nao_conformidade_id UUID NOT NULL REFERENCES public.nao_conformidades(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('corretiva', 'preventiva', 'melhoria')) NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Classificação
  categoria TEXT CHECK (categoria IN (
    'imediata', 'correcao', 'analise_causa', 
    'acao_corretiva', 'acao_preventiva'
  )) NOT NULL,
  
  -- Planejamento
  plano_acao TEXT NOT NULL,
  recursos_necessarios TEXT,
  custo_estimado DECIMAL(12, 2),
  
  -- Responsável
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  participantes TEXT[],
  
  -- Datas
  data_planejamento DATE DEFAULT CURRENT_DATE,
  data_inicio_prevista DATE NOT NULL,
  data_inicio_real DATE,
  data_conclusao_prevista DATE NOT NULL,
  data_conclusao_real DATE,
  
  -- Status
  status TEXT CHECK (status IN (
    'planejada', 'em_andamento', 'concluida', 
    'verificada', 'eficaz', 'nao_eficaz', 'cancelada'
  )) DEFAULT 'planejada',
  
  -- Execução
  progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  atividades_realizadas TEXT,
  dificuldades_encontradas TEXT,
  
  -- Verificação de eficácia
  data_verificacao_eficacia DATE,
  verificada_por_id UUID REFERENCES public.usuarios(id),
  metodo_verificacao TEXT,
  resultado_verificacao TEXT,
  eficaz BOOLEAN,
  
  -- Evidências
  evidencias_urls TEXT[],
  
  -- Observações
  observacoes TEXT,
  licoes_aprendidas TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_acoes_corretivas_empresa ON public.acoes_corretivas(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_acoes_corretivas_nc ON public.acoes_corretivas(nao_conformidade_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_acoes_corretivas_responsavel ON public.acoes_corretivas(responsavel_id) WHERE status IN ('planejada', 'em_andamento');
CREATE INDEX IF NOT EXISTS idx_acoes_corretivas_status ON public.acoes_corretivas(status, data_conclusao_prevista) WHERE status NOT IN ('concluida', 'cancelada');
CREATE INDEX IF NOT EXISTS idx_acoes_corretivas_tipo ON public.acoes_corretivas(tipo, categoria) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.acoes_corretivas IS 'Ações corretivas e preventivas (CAPA)';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_compliance_requisitos_updated
  BEFORE UPDATE ON public.compliance_requisitos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_compliance_evidencias_updated
  BEFORE UPDATE ON public.compliance_evidencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_auditorias_updated
  BEFORE UPDATE ON public.auditorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_auditorias_itens_updated
  BEFORE UPDATE ON public.auditorias_itens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_nao_conformidades_updated
  BEFORE UPDATE ON public.nao_conformidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_acoes_corretivas_updated
  BEFORE UPDATE ON public.acoes_corretivas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO COMPLIANCE/AUDITORIA (6 tabelas)
-- ============================================

