-- Migration: Implementar RLS Policies - Multi-Tenant
-- Gerado por: Agente 03 - Passo 4 (RLS)
-- Data: 2025-10-25
-- Descrição: Implementa Row Level Security para todas as tabelas críticas

-- ⚠️ IMPORTANTE: Revisar com time de segurança antes de aplicar em produção!

-- ============================================================================
-- FUNÇÕES AUXILIARES (PRÉ-REQUISITO)
-- ============================================================================

-- Função para obter empresa_id do usuário atual
CREATE OR REPLACE FUNCTION public.current_empresa_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

COMMENT ON FUNCTION public.current_empresa_id IS 
  'Retorna empresa_id do usuário autenticado - Usado em RLS policies';


-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

COMMENT ON FUNCTION public.current_user_role IS 
  'Retorna role do usuário autenticado - Usado em RLS policies';


-- Função helper para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN current_user_role() IN ('Admin', 'Super Admin');
END;
$$;

COMMENT ON FUNCTION public.is_admin IS 
  'Verifica se usuário atual é Admin ou Super Admin';


-- ============================================================================
-- 1. CORE TABLES - PROFILES
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas seu próprio perfil
DROP POLICY IF EXISTS "users_see_own_profile" ON public.profiles;
CREATE POLICY "users_see_own_profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Usuários atualizam apenas seu próprio perfil
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Service role pode tudo
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
CREATE POLICY "service_role_all_profiles"
ON public.profiles
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================================================
-- 2. CORE TABLES - EMPRESAS
-- ============================================================================

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas sua empresa
DROP POLICY IF EXISTS "users_see_own_empresa" ON public.empresas;
CREATE POLICY "users_see_own_empresa"
ON public.empresas
FOR SELECT
USING (id = current_empresa_id());

-- Apenas admins atualizam empresa
DROP POLICY IF EXISTS "admins_update_empresa" ON public.empresas;
CREATE POLICY "admins_update_empresa"
ON public.empresas
FOR UPDATE
USING (
  id = current_empresa_id() AND
  is_admin()
);

-- Service role pode tudo
DROP POLICY IF EXISTS "service_role_all_empresas" ON public.empresas;
CREATE POLICY "service_role_all_empresas"
ON public.empresas
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================================================
-- 3. OPME - CIRURGIAS
-- ============================================================================

ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;

-- SELECT: Multi-tenant
DROP POLICY IF EXISTS "cirurgias_select" ON public.cirurgias;
CREATE POLICY "cirurgias_select"
ON public.cirurgias
FOR SELECT
USING (empresa_id = current_empresa_id());

-- INSERT: Admin, Gerente, Coordenador
DROP POLICY IF EXISTS "cirurgias_insert" ON public.cirurgias;
CREATE POLICY "cirurgias_insert"
ON public.cirurgias
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente', 'Coordenador')
);

-- UPDATE: Admin, Gerente ou Coordenador (se não finalizada)
DROP POLICY IF EXISTS "cirurgias_update" ON public.cirurgias;
CREATE POLICY "cirurgias_update"
ON public.cirurgias
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  (
    current_user_role() IN ('Admin', 'Super Admin', 'Gerente') OR
    (current_user_role() = 'Coordenador' AND status != 'FINALIZADA')
  )
);

-- DELETE: Apenas Admin
DROP POLICY IF EXISTS "cirurgias_delete" ON public.cirurgias;
CREATE POLICY "cirurgias_delete"
ON public.cirurgias
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);


-- ============================================================================
-- 4. OPME - ESTOQUE
-- ============================================================================

ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "estoque_select" ON public.estoque;
CREATE POLICY "estoque_select"
ON public.estoque
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "estoque_insert" ON public.estoque;
CREATE POLICY "estoque_insert"
ON public.estoque
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);

DROP POLICY IF EXISTS "estoque_update" ON public.estoque;
CREATE POLICY "estoque_update"
ON public.estoque
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);

DROP POLICY IF EXISTS "estoque_delete" ON public.estoque;
CREATE POLICY "estoque_delete"
ON public.estoque
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);


-- ============================================================================
-- 5. OPME - CONSIGNACAO_MATERIAIS
-- ============================================================================

ALTER TABLE public.consignacao_materiais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consignacao_select" ON public.consignacao_materiais;
CREATE POLICY "consignacao_select"
ON public.consignacao_materiais
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "consignacao_insert" ON public.consignacao_materiais;
CREATE POLICY "consignacao_insert"
ON public.consignacao_materiais
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente', 'Coordenador')
);

DROP POLICY IF EXISTS "consignacao_update" ON public.consignacao_materiais;
CREATE POLICY "consignacao_update"
ON public.consignacao_materiais
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  (
    current_user_role() IN ('Admin', 'Super Admin', 'Gerente') OR
    (current_user_role() = 'Operador' AND status = 'PENDENTE')
  )
);

DROP POLICY IF EXISTS "consignacao_delete" ON public.consignacao_materiais;
CREATE POLICY "consignacao_delete"
ON public.consignacao_materiais
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);


-- ============================================================================
-- 6. OPME - PRODUTOS_OPME
-- ============================================================================

ALTER TABLE public.produtos_opme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "produtos_opme_select" ON public.produtos_opme;
CREATE POLICY "produtos_opme_select"
ON public.produtos_opme
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "produtos_opme_modify" ON public.produtos_opme;
CREATE POLICY "produtos_opme_modify"
ON public.produtos_opme
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);


-- ============================================================================
-- 7. OPME - RASTREABILIDADE_OPME
-- ============================================================================

ALTER TABLE public.rastreabilidade_opme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rastreabilidade_select" ON public.rastreabilidade_opme;
CREATE POLICY "rastreabilidade_select"
ON public.rastreabilidade_opme
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "rastreabilidade_modify" ON public.rastreabilidade_opme;
CREATE POLICY "rastreabilidade_modify"
ON public.rastreabilidade_opme
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);


-- ============================================================================
-- 8. COMPLIANCE - COMPLIANCE_REQUISITOS_ABBOTT
-- ============================================================================

ALTER TABLE public.compliance_requisitos_abbott ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compliance_select" ON public.compliance_requisitos_abbott;
CREATE POLICY "compliance_select"
ON public.compliance_requisitos_abbott
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "compliance_modify" ON public.compliance_requisitos_abbott;
CREATE POLICY "compliance_modify"
ON public.compliance_requisitos_abbott
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);


-- ============================================================================
-- 9-11. FINANCIAL - CONTAS_RECEBER, CONTAS_PAGAR, FLUXO_CAIXA
-- ============================================================================

-- CONTAS_RECEBER
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contas_receber_select" ON public.contas_receber;
CREATE POLICY "contas_receber_select"
ON public.contas_receber
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "contas_receber_insert" ON public.contas_receber;
CREATE POLICY "contas_receber_insert"
ON public.contas_receber
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_receber_update" ON public.contas_receber;
CREATE POLICY "contas_receber_update"
ON public.contas_receber
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_receber_delete" ON public.contas_receber;
CREATE POLICY "contas_receber_delete"
ON public.contas_receber
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);

-- CONTAS_PAGAR (mesmas policies)
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contas_pagar_select" ON public.contas_pagar;
CREATE POLICY "contas_pagar_select"
ON public.contas_pagar
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "contas_pagar_insert" ON public.contas_pagar;
CREATE POLICY "contas_pagar_insert"
ON public.contas_pagar
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_pagar_update" ON public.contas_pagar;
CREATE POLICY "contas_pagar_update"
ON public.contas_pagar
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_pagar_delete" ON public.contas_pagar;
CREATE POLICY "contas_pagar_delete"
ON public.contas_pagar
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);

-- FLUXO_CAIXA (apenas leitura para roles não-financeiras)
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fluxo_caixa_select" ON public.fluxo_caixa;
CREATE POLICY "fluxo_caixa_select"
ON public.fluxo_caixa
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "fluxo_caixa_modify" ON public.fluxo_caixa;
CREATE POLICY "fluxo_caixa_modify"
ON public.fluxo_caixa
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);


-- ============================================================================
-- FIM DA MIGRATION - RLS POLICIES IMPLEMENTADAS
-- ============================================================================

-- Resumo:
-- ✅ 3 Funções auxiliares criadas
-- ✅ 2 Core tables (profiles, empresas)
-- ✅ 6 OPME tables (cirurgias, estoque, consignacao, produtos_opme, rastreabilidade, compliance)
-- ✅ 3 Financial tables (contas_receber, contas_pagar, fluxo_caixa)
-- ✅ Total: 11 tabelas com RLS habilitado

-- ⚠️ IMPORTANTE:
-- 1. Testar exaustivamente em staging antes de produção
-- 2. Validar com diferentes roles (Admin, Gerente, Coordenador, Operador)
-- 3. Monitorar performance após aplicação
-- 4. Considerar índices adicionais se necessário

