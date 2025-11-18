-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 1/5)
-- MÓDULO CHATBOT/GPT RESEARCHER - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Sistema de chatbot inteligente com GPT:
-- - Conversas e sessões
-- - Mensagens com contexto
-- - Pesquisas automatizadas
-- - Histórico completo
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. CHATBOT_SESSOES (sessões de chat)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chatbot_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Identificação
  titulo TEXT,
  descricao TEXT,
  
  -- Contexto
  contexto_tipo TEXT CHECK (contexto_tipo IN (
    'geral', 'cirurgia', 'compras', 'vendas', 
    'estoque', 'financeiro', 'compliance', 'outro'
  )) DEFAULT 'geral',
  contexto_id UUID, -- ID da entidade relacionada
  
  -- Configurações
  modelo_ia TEXT DEFAULT 'gpt-4', -- Modelo de linguagem usado
  temperatura DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperatura BETWEEN 0 AND 2),
  max_tokens INTEGER DEFAULT 2000,
  
  -- Preferências
  idioma TEXT DEFAULT 'pt-BR',
  modo TEXT CHECK (modo IN ('assistente', 'pesquisador', 'especialista', 'tutor')) DEFAULT 'assistente',
  
  -- Estatísticas
  total_mensagens INTEGER DEFAULT 0,
  total_tokens_usados INTEGER DEFAULT 0,
  total_pesquisas INTEGER DEFAULT 0,
  
  -- Avaliação
  avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
  feedback TEXT,
  
  -- Status
  ativa BOOLEAN DEFAULT TRUE,
  ultima_interacao TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  encerrado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessoes_empresa ON public.chatbot_sessoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessoes_usuario ON public.chatbot_sessoes(usuario_id) WHERE ativa = TRUE;
CREATE INDEX IF NOT EXISTS idx_chatbot_sessoes_contexto ON public.chatbot_sessoes(contexto_tipo, contexto_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessoes_ativa ON public.chatbot_sessoes(ativa, ultima_interacao DESC) WHERE ativa = TRUE;

COMMENT ON TABLE public.chatbot_sessoes IS 'Sessões de conversa com chatbot IA';

-- ============================================
-- 2. CHATBOT_CONVERSAS (conversas dentro de sessões)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chatbot_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID NOT NULL REFERENCES public.chatbot_sessoes(id) ON DELETE CASCADE,
  
  -- Identificação
  titulo TEXT,
  topico TEXT,
  
  -- Thread
  conversa_pai_id UUID REFERENCES public.chatbot_conversas(id), -- Para threads aninhadas
  ordem INTEGER DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('ativa', 'pausada', 'encerrada')) DEFAULT 'ativa',
  
  -- Resumo
  resumo_automatico TEXT, -- Gerado pela IA
  tags TEXT[],
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversas_sessao ON public.chatbot_conversas(sessao_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversas_pai ON public.chatbot_conversas(conversa_pai_id) WHERE conversa_pai_id IS NOT NULL;

COMMENT ON TABLE public.chatbot_conversas IS 'Conversas organizadas dentro de sessões (threads)';

-- ============================================
-- 3. CHATBOT_MENSAGENS (mensagens do chat)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chatbot_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID NOT NULL REFERENCES public.chatbot_sessoes(id) ON DELETE CASCADE,
  conversa_id UUID REFERENCES public.chatbot_conversas(id) ON DELETE CASCADE,
  
  -- Remetente
  tipo_remetente TEXT CHECK (tipo_remetente IN ('usuario', 'assistente', 'sistema')) NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Conteúdo
  mensagem TEXT NOT NULL,
  mensagem_formatada TEXT, -- HTML ou Markdown
  
  -- Anexos
  anexos_urls TEXT[],
  imagens_urls TEXT[],
  
  -- Contexto da mensagem
  intencao TEXT, -- Intenção detectada pela IA
  entidades_json JSONB, -- Entidades extraídas (NER)
  sentimento TEXT CHECK (sentimento IN ('positivo', 'neutro', 'negativo')),
  confianca DECIMAL(5, 4), -- 0-1 score de confiança
  
  -- Resposta da IA
  modelo_usado TEXT,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,
  tempo_resposta_ms INTEGER,
  
  -- Avaliação da resposta
  util BOOLEAN,
  motivo_nao_util TEXT,
  
  -- Ações sugeridas
  acoes_sugeridas_json JSONB, -- Ex: criar cirurgia, gerar relatório
  acao_executada BOOLEAN DEFAULT FALSE,
  acao_resultado_json JSONB,
  
  -- Citações e fontes
  fontes_json JSONB, -- Documentos/URLs usados como contexto
  
  -- Flags
  erro BOOLEAN DEFAULT FALSE,
  erro_mensagem TEXT,
  requer_atencao_humana BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_sessao ON public.chatbot_mensagens(sessao_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_conversa ON public.chatbot_mensagens(conversa_id, criado_em) WHERE conversa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_usuario ON public.chatbot_mensagens(usuario_id, criado_em DESC) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_tipo ON public.chatbot_mensagens(tipo_remetente, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_atencao ON public.chatbot_mensagens(requer_atencao_humana, criado_em DESC) WHERE requer_atencao_humana = TRUE;

COMMENT ON TABLE public.chatbot_mensagens IS 'Mensagens individuais do chatbot (histórico completo)';

-- ============================================
-- 4. PESQUISAS_GPT (pesquisas automatizadas GPT Researcher)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pesquisas_gpt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Relacionamento com chat
  sessao_id UUID REFERENCES public.chatbot_sessoes(id),
  mensagem_id UUID REFERENCES public.chatbot_mensagens(id),
  
  -- Query
  query TEXT NOT NULL,
  query_refinada TEXT, -- Query refinada pela IA
  
  -- Tipo de pesquisa
  tipo TEXT CHECK (tipo IN (
    'web', 'documentos_internos', 'banco_dados', 
    'hibrida', 'especializada'
  )) DEFAULT 'hibrida',
  
  -- Configurações
  profundidade TEXT CHECK (profundidade IN ('rapida', 'normal', 'profunda')) DEFAULT 'normal',
  max_resultados INTEGER DEFAULT 10,
  idiomas TEXT[] DEFAULT ARRAY['pt', 'en'],
  
  -- Fontes pesquisadas
  fontes TEXT[], -- Ex: ["google", "pubmed", "anvisa", "documentos_internos"]
  urls_visitadas TEXT[],
  total_fontes_consultadas INTEGER DEFAULT 0,
  
  -- Resultados
  status TEXT CHECK (status IN (
    'pendente', 'em_andamento', 'concluida', 
    'erro', 'cancelada'
  )) DEFAULT 'pendente',
  
  progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  
  -- Relatório gerado
  relatorio_markdown TEXT,
  relatorio_html TEXT,
  resumo TEXT,
  
  -- Citações e referências
  referencias_json JSONB, -- Bibliográficas estruturadas
  fontes_primarias TEXT[],
  fontes_secundarias TEXT[],
  
  -- Metadados da pesquisa
  palavras_chave TEXT[],
  topicos_identificados TEXT[],
  entidades_mencionadas TEXT[],
  
  -- Qualidade
  score_relevancia DECIMAL(5, 2), -- 0-100
  score_confiabilidade DECIMAL(5, 2),
  score_atualidade DECIMAL(5, 2),
  
  -- Tempo e recursos
  tempo_execucao_segundos INTEGER,
  tokens_usados INTEGER,
  custo_estimado DECIMAL(10, 4), -- Em USD
  
  -- Exportação
  pdf_url TEXT,
  docx_url TEXT,
  
  -- Compartilhamento
  publico BOOLEAN DEFAULT FALSE,
  compartilhado_com UUID[], -- IDs de usuários
  
  -- Avaliação
  avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
  feedback TEXT,
  
  -- Datas
  iniciado_em TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pesquisas_gpt_empresa ON public.pesquisas_gpt(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_pesquisas_gpt_usuario ON public.pesquisas_gpt(usuario_id, criado_em DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_pesquisas_gpt_sessao ON public.pesquisas_gpt(sessao_id) WHERE sessao_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pesquisas_gpt_status ON public.pesquisas_gpt(status, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pesquisas_gpt_tipo ON public.pesquisas_gpt(tipo, profundidade);
CREATE INDEX IF NOT EXISTS idx_pesquisas_gpt_publico ON public.pesquisas_gpt(publico, score_relevancia DESC) WHERE publico = TRUE;

COMMENT ON TABLE public.pesquisas_gpt IS 'Pesquisas automatizadas com GPT Researcher';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_chatbot_sessoes_updated
  BEFORE UPDATE ON public.chatbot_sessoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_chatbot_conversas_updated
  BEFORE UPDATE ON public.chatbot_conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pesquisas_gpt_updated
  BEFORE UPDATE ON public.pesquisas_gpt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO CHATBOT/GPT RESEARCHER (4 tabelas)
-- ============================================

