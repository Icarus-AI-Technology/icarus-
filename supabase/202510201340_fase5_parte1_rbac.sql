-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 1/5)
-- MÓDULO RBAC - 5 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- ============================================

-- 1. ROLES (papéis de usuário)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  nivel INTEGER DEFAULT 1,
  sistema BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_roles_empresa ON public.roles(empresa_id) WHERE ativo = TRUE;

-- 2. PERMISSIONS (permissões granulares)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  recurso TEXT NOT NULL,
  acao TEXT CHECK (acao IN ('create', 'read', 'update', 'delete', 'execute', 'manage', 'all')) NOT NULL,
  sistema BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_permissions_empresa ON public.permissions(empresa_id);
CREATE INDEX IF NOT EXISTS idx_permissions_recurso ON public.permissions(recurso, acao);

-- 3. ROLE_PERMISSIONS (permissões por papel)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  concedido_em TIMESTAMPTZ DEFAULT NOW(),
  concedido_por_id UUID REFERENCES public.usuarios(id),
  UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- 4. USER_ROLES (papéis por usuário)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT TRUE,
  atribuido_por_id UUID REFERENCES public.usuarios(id),
  atribuido_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_usuario ON public.user_roles(usuario_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id) WHERE ativo = TRUE;

-- 5. PERMISSION_GROUPS (grupos de permissões)
CREATE TABLE IF NOT EXISTS public.permission_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  permissions_ids UUID[],
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_permission_groups_empresa ON public.permission_groups(empresa_id) WHERE ativo = TRUE;

CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_permission_groups_updated BEFORE UPDATE ON public.permission_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.roles IS 'Papéis/perfis de usuário (RBAC)';
COMMENT ON TABLE public.permissions IS 'Permissões granulares do sistema';
COMMENT ON TABLE public.role_permissions IS 'Permissões atribuídas a papéis';
COMMENT ON TABLE public.user_roles IS 'Papéis atribuídos a usuários';
COMMENT ON TABLE public.permission_groups IS 'Grupos de permissões para gestão';

