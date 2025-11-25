-- ============================================
-- Migration: 20251118 - RBAC Audit Alignment
-- ============================================

BEGIN;

-- 1. Expand audit_log schema to match RBACService expectations
ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS modulo TEXT,
  ADD COLUMN IF NOT EXISTS entidade_tipo TEXT,
  ADD COLUMN IF NOT EXISTS entidade_id UUID,
  ADD COLUMN IF NOT EXISTS descricao TEXT,
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS sucesso BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS nivel_sensibilidade TEXT DEFAULT 'interno';

-- Generated column mirroring criado_em for consistency with frontend naming
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'audit_log'
      AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.audit_log
      ADD COLUMN created_at TIMESTAMPTZ GENERATED ALWAYS AS (criado_em) STORED;
  END IF;
END $$;

-- Backfill missing metadata with safe defaults
UPDATE public.audit_log
SET
  modulo = COALESCE(modulo, 'desconhecido'),
  descricao = COALESCE(descricao, ''),
  nivel_sensibilidade = COALESCE(nivel_sensibilidade, 'interno'),
  sucesso = COALESCE(sucesso, TRUE);

-- Helpful indexes for new columns
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_modulo ON public.audit_log (modulo);
CREATE INDEX IF NOT EXISTS idx_audit_sucesso ON public.audit_log (sucesso);

DROP FUNCTION IF EXISTS public.log_audit(
  CHARACTER VARYING,
  CHARACTER VARYING,
  UUID,
  JSONB,
  JSONB
);

DROP FUNCTION IF EXISTS public.log_audit(
  UUID,
  CHARACTER VARYING,
  CHARACTER VARYING,
  CHARACTER VARYING,
  UUID,
  TEXT,
  JSONB,
  JSONB,
  BOOLEAN,
  CHARACTER VARYING
);

CREATE OR REPLACE FUNCTION public.log_audit(
  p_user_id UUID,
  p_acao TEXT,
  p_modulo TEXT,
  p_entidade_tipo TEXT DEFAULT NULL,
  p_entidade_id UUID DEFAULT NULL,
  p_descricao TEXT DEFAULT NULL,
  p_dados_antes JSONB DEFAULT NULL,
  p_dados_depois JSONB DEFAULT NULL,
  p_sucesso BOOLEAN DEFAULT TRUE,
  p_nivel_sensibilidade TEXT DEFAULT 'interno'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_audit_id UUID;
  v_user_email TEXT;
  v_ip_address INET;
  v_user_agent TEXT;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  v_ip_address := inet_client_addr();
  v_user_agent := current_setting('request.headers', TRUE)::json->>'user-agent';

  INSERT INTO public.audit_log (
    user_id,
    user_email,
    acao,
    modulo,
    entidade_tipo,
    entidade_id,
    descricao,
    dados_antes,
    dados_depois,
    sucesso,
    ip_address,
    user_agent,
    nivel_sensibilidade
  )
  VALUES (
    p_user_id,
    v_user_email,
    p_acao,
    p_modulo,
    p_entidade_tipo,
    p_entidade_id,
    p_descricao,
    p_dados_antes,
    p_dados_depois,
    p_sucesso,
    v_ip_address,
    v_user_agent,
    p_nivel_sensibilidade
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

COMMENT ON FUNCTION public.log_audit IS 'Registra eventos de auditoria completos, com metadados usados pela camada RBAC.';

COMMIT;

