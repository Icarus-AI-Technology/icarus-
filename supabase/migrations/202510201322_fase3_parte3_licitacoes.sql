-- ============================================
-- Migration: FASE 3 - Compliance & Integrações (Parte 3/4)
-- MÓDULO LICITAÇÕES - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Gestão de licitações públicas e privadas:
-- - Cadastro de licitações
-- - Itens licitados
-- - Propostas enviadas
-- - Documentos e habilitação
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. LICITACOES (processos licitatórios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.licitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_processo TEXT NOT NULL,
  numero_edital TEXT,
  objeto TEXT NOT NULL,
  descricao TEXT,
  
  -- Tipo de licitação
  modalidade TEXT CHECK (modalidade IN (
    'pregao_eletronico', 'pregao_presencial', 'concorrencia', 
    'tomada_precos', 'convite', 'leilao', 'dispensa', 
    'inexigibilidade', 'rdc', 'dialogo_competitivo'
  )) NOT NULL,
  
  tipo_contratacao TEXT CHECK (tipo_contratacao IN (
    'menor_preco', 'melhor_tecnica', 'tecnica_preco', 
    'maior_desconto', 'maior_lance'
  )) DEFAULT 'menor_preco',
  
  -- Órgão licitante
  orgao_nome TEXT NOT NULL,
  orgao_cnpj TEXT,
  orgao_esfera TEXT CHECK (orgao_esfera IN ('federal', 'estadual', 'municipal', 'privado')),
  orgao_cidade TEXT,
  orgao_estado TEXT,
  
  -- Dados do certame
  uasg TEXT, -- Código UASG (Unidade Administrativa de Serviços Gerais)
  portal TEXT, -- Ex: "comprasnet", "BLL", "próprio"
  url_portal TEXT,
  
  -- Datas importantes
  data_publicacao DATE,
  data_abertura TIMESTAMPTZ NOT NULL,
  data_encerramento TIMESTAMPTZ,
  data_julgamento DATE,
  data_homologacao DATE,
  data_adjudicacao DATE,
  
  -- Valores
  valor_estimado DECIMAL(12, 2),
  valor_referencia DECIMAL(12, 2),
  
  -- Participação
  permite_consorcio BOOLEAN DEFAULT FALSE,
  permite_subcontratacao BOOLEAN DEFAULT FALSE,
  exclusiva_mepps BOOLEAN DEFAULT FALSE, -- Micro e pequenas empresas
  cota_mepps DECIMAL(5, 2), -- Percentual de cota
  
  -- Garantia
  exige_garantia BOOLEAN DEFAULT FALSE,
  percentual_garantia DECIMAL(5, 2),
  
  -- Documentação exigida
  documentos_habilitacao TEXT[],
  exige_amostra BOOLEAN DEFAULT FALSE,
  exige_visita_tecnica BOOLEAN DEFAULT FALSE,
  
  -- Status da empresa
  status_participacao TEXT CHECK (status_participacao IN (
    'identificada', 'em_analise', 'participando', 
    'proposta_enviada', 'vencedora', 'perdedora', 
    'desistiu', 'inabilitada', 'nao_participou'
  )) DEFAULT 'identificada',
  
  -- Resultado
  vencedora BOOLEAN DEFAULT FALSE,
  valor_vencedor DECIMAL(12, 2),
  empresa_vencedora TEXT,
  
  -- Contrato gerado
  contrato_id UUID,
  numero_contrato TEXT,
  
  -- Responsável interno
  responsavel_id UUID REFERENCES public.usuarios(id),
  
  -- Documentos
  edital_url TEXT,
  documentos_urls TEXT[],
  
  -- Observações
  observacoes TEXT,
  estrategia_participacao TEXT,
  motivo_nao_participacao TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero_processo)
);

CREATE INDEX IF NOT EXISTS idx_licitacoes_empresa ON public.licitacoes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_licitacoes_modalidade ON public.licitacoes(modalidade, data_abertura DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_licitacoes_status ON public.licitacoes(status_participacao) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_licitacoes_abertura ON public.licitacoes(data_abertura DESC);
CREATE INDEX IF NOT EXISTS idx_licitacoes_responsavel ON public.licitacoes(responsavel_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_licitacoes_orgao ON public.licitacoes(orgao_nome) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.licitacoes IS 'Processos licitatórios públicos e privados';

-- ============================================
-- 2. LICITACOES_ITENS (itens do edital)
-- ============================================
CREATE TABLE IF NOT EXISTS public.licitacoes_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  
  -- Identificação do item
  numero_item INTEGER NOT NULL,
  lote INTEGER, -- Se for licitação por lote
  grupo INTEGER,
  
  -- Descrição
  descricao TEXT NOT NULL,
  especificacao_tecnica TEXT,
  unidade_medida TEXT DEFAULT 'UN',
  
  -- Produto relacionado (se conhecido)
  produto_id UUID REFERENCES public.produtos(id),
  
  -- Quantidades
  quantidade DECIMAL(10, 3) NOT NULL,
  quantidade_minima DECIMAL(10, 3),
  quantidade_maxima DECIMAL(10, 3),
  
  -- Valores de referência
  valor_unitario_referencia DECIMAL(12, 2),
  valor_total_referencia DECIMAL(12, 2),
  
  -- Marca/fabricante
  marca_referencia TEXT,
  aceita_similar BOOLEAN DEFAULT TRUE,
  
  -- Classificação
  codigo_catmat TEXT, -- Código CATMAT (Catálogo de Materiais)
  ncm TEXT, -- Nomenclatura Comum do Mercosul
  
  -- Entrega
  prazo_entrega_dias INTEGER,
  local_entrega TEXT,
  
  -- Amostra
  exige_amostra BOOLEAN DEFAULT FALSE,
  prazo_amostra_dias INTEGER,
  
  -- Observações
  observacoes TEXT,
  criterios_aceitacao TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_licitacoes_itens_licitacao ON public.licitacoes_itens(licitacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_licitacoes_itens_produto ON public.licitacoes_itens(produto_id) WHERE produto_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_licitacoes_itens_lote ON public.licitacoes_itens(licitacao_id, lote) WHERE lote IS NOT NULL;

COMMENT ON TABLE public.licitacoes_itens IS 'Itens licitados (conforme edital)';

-- ============================================
-- 3. PROPOSTAS_LICITACAO (propostas enviadas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.propostas_licitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_proposta TEXT NOT NULL,
  versao INTEGER DEFAULT 1,
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('comercial', 'tecnica', 'habilitacao', 'completa')) NOT NULL,
  fase TEXT CHECK (fase IN ('inicial', 'lance', 'melhor_oferta', 'negociacao', 'final')),
  
  -- Elaboração
  elaborada_por_id UUID NOT NULL REFERENCES public.usuarios(id),
  data_elaboracao DATE DEFAULT CURRENT_DATE,
  
  -- Envio
  data_envio TIMESTAMPTZ,
  metodo_envio TEXT CHECK (metodo_envio IN ('portal', 'email', 'presencial', 'correios')),
  protocolo_envio TEXT,
  
  -- Valores propostos
  valor_total_proposta DECIMAL(12, 2) NOT NULL,
  desconto_percentual DECIMAL(5, 2),
  
  -- Itens propostos (JSON com detalhes por item)
  itens_propostos_json JSONB NOT NULL,
  
  -- Condições comerciais
  prazo_entrega_dias INTEGER,
  condicoes_pagamento TEXT,
  validade_proposta_dias INTEGER DEFAULT 60,
  percentual_garantia DECIMAL(5, 2),
  
  -- Documentos anexados
  proposta_comercial_url TEXT,
  proposta_tecnica_url TEXT,
  documentos_habilitacao_urls TEXT[],
  amostras_urls TEXT[],
  
  -- Classificação
  classificacao INTEGER, -- Posição no ranking
  pontuacao_tecnica DECIMAL(5, 2),
  pontuacao_comercial DECIMAL(5, 2),
  pontuacao_final DECIMAL(5, 2),
  
  -- Status
  status TEXT CHECK (status IN (
    'rascunho', 'enviada', 'em_analise', 
    'habilitada', 'inabilitada', 'classificada', 
    'desclassificada', 'vencedora', 'perdedora'
  )) DEFAULT 'rascunho',
  
  -- Resultado
  motivo_inabilitacao TEXT,
  motivo_desclassificacao TEXT,
  
  -- Lance (se pregão)
  lance_inicial DECIMAL(12, 2),
  lance_final DECIMAL(12, 2),
  total_lances INTEGER DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  estrategia TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, licitacao_id, numero_proposta, versao)
);

CREATE INDEX IF NOT EXISTS idx_propostas_licitacao_empresa ON public.propostas_licitacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_propostas_licitacao_licitacao ON public.propostas_licitacao(licitacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_propostas_licitacao_elaborada_por ON public.propostas_licitacao(elaborada_por_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_propostas_licitacao_status ON public.propostas_licitacao(status) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.propostas_licitacao IS 'Propostas enviadas para licitações';

-- ============================================
-- 4. DOCUMENTOS_LICITACAO (documentos e habilitação)
-- ============================================
CREATE TABLE IF NOT EXISTS public.documentos_licitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  proposta_id UUID REFERENCES public.propostas_licitacao(id),
  
  -- Tipo de documento
  tipo TEXT CHECK (tipo IN (
    'edital', 'adendo', 'esclarecimento', 'impugnacao',
    'certidao_federal', 'certidao_estadual', 'certidao_municipal',
    'certidao_trabalhista', 'certidao_falencia', 'certidao_negativa',
    'balanco_patrimonial', 'demonstrativo_financeiro', 'contrato_social',
    'licenca_funcionamento', 'registro_anvisa', 'certificado_qualidade',
    'atestado_capacidade', 'declaracao', 'procuracao', 'outro'
  )) NOT NULL,
  
  -- Identificação
  titulo TEXT NOT NULL,
  descricao TEXT,
  numero_documento TEXT,
  
  -- Arquivo
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER, -- bytes
  arquivo_hash TEXT,
  
  -- Origem
  origem TEXT CHECK (origem IN ('empresa', 'orgao', 'terceiro')) DEFAULT 'empresa',
  emitido_por TEXT,
  
  -- Validade
  data_emissao DATE,
  data_validade DATE,
  valido BOOLEAN DEFAULT TRUE,
  
  -- Obrigatoriedade
  obrigatorio BOOLEAN DEFAULT FALSE,
  exigido_edital BOOLEAN DEFAULT FALSE,
  
  -- Upload
  enviado_portal BOOLEAN DEFAULT FALSE,
  data_envio_portal TIMESTAMPTZ,
  
  -- Análise
  analisado BOOLEAN DEFAULT FALSE,
  aprovado BOOLEAN,
  data_analise TIMESTAMPTZ,
  parecer TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_documentos_licitacao_empresa ON public.documentos_licitacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_licitacao_licitacao ON public.documentos_licitacao(licitacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_licitacao_proposta ON public.documentos_licitacao(proposta_id) WHERE proposta_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_licitacao_tipo ON public.documentos_licitacao(tipo) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_licitacao_validade ON public.documentos_licitacao(data_validade) WHERE valido = TRUE;

COMMENT ON TABLE public.documentos_licitacao IS 'Documentos de habilitação e edital';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_licitacoes_updated
  BEFORE UPDATE ON public.licitacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_licitacoes_itens_updated
  BEFORE UPDATE ON public.licitacoes_itens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_propostas_licitacao_updated
  BEFORE UPDATE ON public.propostas_licitacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_documentos_licitacao_updated
  BEFORE UPDATE ON public.documentos_licitacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO LICITAÇÕES (4 tabelas)
-- ============================================

