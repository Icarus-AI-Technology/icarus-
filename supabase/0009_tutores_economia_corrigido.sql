-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🚀 MIGRAÇÃO 0009 — TUTORES IA & ECONOMIA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Equipe: AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
-- Objetivo: Criar tabelas para Feature Flags, RAG, Tutores IA e Compliance
-- Estratégia: IF NOT EXISTS para evitar conflitos
-- RLS: Removido (será implementado na Fase S4)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 0. EXTENSION VECTOR (DEVE VIR PRIMEIRO!)
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. FEATURE FLAGS (A/B Testing)
-- ============================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_segments TEXT[],
  description TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE feature_flags IS 'Sistema de feature flags para A/B testing e rollout gradual';

-- ============================================
-- 2. BASE DE CONHECIMENTO (RAG)
-- ============================================

CREATE TABLE IF NOT EXISTS conhecimento_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id TEXT NOT NULL,
  conteudo_texto TEXT NOT NULL,
  embedding VECTOR(1536),
  categoria TEXT NOT NULL,
  modulo TEXT,
  tags TEXT[],
  url_origem TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conhecimento_embedding ON conhecimento_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_conhecimento_categoria ON conhecimento_base(categoria);
CREATE INDEX IF NOT EXISTS idx_conhecimento_modulo ON conhecimento_base(modulo);

COMMENT ON TABLE conhecimento_base IS 'Base de conhecimento para RAG (Retrieval Augmented Generation)';

-- ============================================
-- 3. LOGS DE TUTORES IA
-- ============================================

CREATE TABLE IF NOT EXISTS tutor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  modulo TEXT NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  feedback INTEGER CHECK (feedback >= 1 AND feedback <= 5),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutor_logs_usuario ON tutor_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tutor_logs_modulo ON tutor_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_tutor_logs_criado ON tutor_logs(criado_em DESC);

COMMENT ON TABLE tutor_logs IS 'Histórico de interações com tutores IA para melhoria contínua';

-- ============================================
-- 4. CERTIFICAÇÕES DE USUÁRIOS
-- ============================================

CREATE TABLE IF NOT EXISTS certificacoes_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  papel TEXT NOT NULL,
  data_certificacao TIMESTAMPTZ DEFAULT NOW(),
  data_validade TIMESTAMPTZ,
  evidencia_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_usuario ON certificacoes_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cert_validade ON certificacoes_usuario(data_validade);

COMMENT ON TABLE certificacoes_usuario IS 'Certificações e treinamentos dos usuários nos módulos';

-- ============================================
-- 5. ATUALIZAÇÕES DE LEGISLAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS legislacao_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_publicacao DATE,
  link_oficial TEXT,
  impacto_modulos TEXT[],
  status TEXT DEFAULT 'pendente',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leg_data ON legislacao_updates(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_leg_status ON legislacao_updates(status);

COMMENT ON TABLE legislacao_updates IS 'Atualizações de legislação (ANVISA, RFB, etc) capturadas automaticamente';

-- ============================================
-- 6. NOTIFICAÇÕES DE LEGISLAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS notificacoes_legislacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  legislacao_id UUID REFERENCES legislacao_updates(id),
  lida BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_usuario ON notificacoes_legislacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notif_lida ON notificacoes_legislacao(lida);

COMMENT ON TABLE notificacoes_legislacao IS 'Notificações de mudanças legislativas para usuários';

-- ============================================
-- 7. ATUALIZAR TABELA EXISTENTE (se existir)
-- ============================================

DO $$
BEGIN
  -- Adicionar colunas em documentos_regulatorios se a tabela existir
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documentos_regulatorios') THEN
    
    -- Adicionar coluna analise_ia_jsonb
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'documentos_regulatorios' 
        AND column_name = 'analise_ia_jsonb'
    ) THEN
      ALTER TABLE documentos_regulatorios ADD COLUMN analise_ia_jsonb JSONB;
    END IF;
    
    -- Adicionar coluna status_conformidade
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'documentos_regulatorios' 
        AND column_name = 'status_conformidade'
    ) THEN
      ALTER TABLE documentos_regulatorios ADD COLUMN status_conformidade TEXT;
    END IF;
    
  END IF;
END $$;

-- ============================================
-- 8. TRIGGERS DE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_feature_flags_updated_at'
  ) THEN
    CREATE TRIGGER update_feature_flags_updated_at
      BEFORE UPDATE ON feature_flags
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_conhecimento_updated_at'
  ) THEN
    CREATE TRIGGER update_conhecimento_updated_at
      BEFORE UPDATE ON conhecimento_base
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_legislacao_updated_at'
  ) THEN
    CREATE TRIGGER update_legislacao_updated_at
      BEFORE UPDATE ON legislacao_updates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

-- Verificação final
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'feature_flags',
      'conhecimento_base',
      'tutor_logs',
      'certificacoes_usuario',
      'legislacao_updates',
      'notificacoes_legislacao'
    );
  
  RAISE NOTICE 'Migração 0009 concluída! Tabelas criadas: %', table_count;
  RAISE NOTICE 'RLS será implementado na Fase S4 (Auth & Security)';
END $$;
