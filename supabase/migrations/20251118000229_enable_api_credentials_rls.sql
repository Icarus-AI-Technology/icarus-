-- Enable RLS and policies for api_credentials & audit trail
-- Keeps client-side access via policies scoped to empresa_id

-- 1) Função para garantir empresa/perfil ao inserir/atualizar -----------------
CREATE OR REPLACE FUNCTION public.set_api_credentials_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa UUID;
BEGIN
  v_empresa := public.current_empresa_id();

  IF v_empresa IS NULL THEN
    RAISE EXCEPTION 'Usuário autenticado sem empresa vinculada';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.empresa_id IS NULL THEN
      NEW.empresa_id := v_empresa;
    ELSIF NEW.empresa_id <> v_empresa THEN
      RAISE EXCEPTION 'Não é permitido gravar credenciais de outra empresa';
    END IF;

    IF NEW.criado_por IS NULL THEN
      NEW.criado_por := auth.uid();
    END IF;
  ELSE
    IF NEW.empresa_id <> OLD.empresa_id THEN
      RAISE EXCEPTION 'empresa_id não pode ser alterado';
    END IF;
  END IF;

  NEW.atualizado_por := auth.uid();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_api_credentials_tenant ON public.api_credentials;
CREATE TRIGGER set_api_credentials_tenant
BEFORE INSERT OR UPDATE ON public.api_credentials
FOR EACH ROW
EXECUTE FUNCTION public.set_api_credentials_tenant();

-- 2) Ativar RLS ---------------------------------------------------------------
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_credentials_audit ENABLE ROW LEVEL SECURITY;

-- 3) Policies para api_credentials --------------------------------------------
DROP POLICY IF EXISTS api_credentials_service_role ON public.api_credentials;
CREATE POLICY api_credentials_service_role
ON public.api_credentials
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS api_credentials_select ON public.api_credentials;
CREATE POLICY api_credentials_select
ON public.api_credentials
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND empresa_id = public.current_empresa_id()
);

DROP POLICY IF EXISTS api_credentials_insert ON public.api_credentials;
CREATE POLICY api_credentials_insert
ON public.api_credentials
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND upper(public.current_user_role()) IN ('ADMIN', 'SUPER ADMIN', 'FINANCEIRO', 'FINANCE MANAGER')
);

DROP POLICY IF EXISTS api_credentials_update ON public.api_credentials;
CREATE POLICY api_credentials_update
ON public.api_credentials
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND upper(public.current_user_role()) IN ('ADMIN', 'SUPER ADMIN', 'FINANCEIRO', 'FINANCE MANAGER')
);

DROP POLICY IF EXISTS api_credentials_delete ON public.api_credentials;
CREATE POLICY api_credentials_delete
ON public.api_credentials
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 4) Policies para api_credentials_audit (somente service role) ---------------
DROP POLICY IF EXISTS api_credentials_audit_service_role ON public.api_credentials_audit;
CREATE POLICY api_credentials_audit_service_role
ON public.api_credentials_audit
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON FUNCTION public.set_api_credentials_tenant IS
  'Garante empresa_id/criado_por/atualizado_por com base no usuário autenticado';

