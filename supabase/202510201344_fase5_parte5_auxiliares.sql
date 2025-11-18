-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 5/5)
-- TABELAS AUXILIARES - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. COMENTARIOS (comentários genéricos)
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  comentario_pai_id UUID REFERENCES public.comentarios(id),
  mencoes_ids UUID[],
  anexos_urls TEXT[],
  editado BOOLEAN DEFAULT FALSE,
  editado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comentarios_empresa ON public.comentarios(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_comentarios_entidade ON public.comentarios(entidade_tipo, entidade_id, criado_em DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON public.comentarios(usuario_id, criado_em DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_comentarios_pai ON public.comentarios(comentario_pai_id) WHERE comentario_pai_id IS NOT NULL;

-- 2. TAGS (tags para categorização)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#808080',
  descricao TEXT,
  categoria TEXT,
  entidade_tipo TEXT,
  entidade_id UUID,
  uso_count INTEGER DEFAULT 0,
  criado_por_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome, entidade_tipo)
);

CREATE INDEX IF NOT EXISTS idx_tags_empresa ON public.tags(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tags_nome ON public.tags(nome);
CREATE INDEX IF NOT EXISTS idx_tags_entidade ON public.tags(entidade_tipo, entidade_id) WHERE entidade_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tags_categoria ON public.tags(categoria);

-- 3. FAVORITOS (itens favoritos dos usuários)
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  entidade_nome TEXT,
  ordem INTEGER DEFAULT 0,
  pasta TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, entidade_tipo, entidade_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON public.favoritos(usuario_id, ordem);
CREATE INDEX IF NOT EXISTS idx_favoritos_entidade ON public.favoritos(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_pasta ON public.favoritos(usuario_id, pasta) WHERE pasta IS NOT NULL;

CREATE TRIGGER trg_comentarios_updated BEFORE UPDATE ON public.comentarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.comentarios IS 'Comentários em entidades do sistema';
COMMENT ON TABLE public.tags IS 'Tags para categorização e busca';
COMMENT ON TABLE public.favoritos IS 'Favoritos dos usuários';

-- ============================================
-- FIM FASE 5 FINAL - 17 TABELAS COMPLETAS
-- RBAC: 5, Health: 3, Relatórios: 3, Pluggy: 3, Auxiliares: 3
-- TOTAL GERAL: 103 TABELAS (99% do schema)
-- ============================================

