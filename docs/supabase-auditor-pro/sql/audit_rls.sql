-- ============================================================================
-- AUDITORIA DE RLS (Row Level Security) & SEGURANÇA
-- ============================================================================

-- Detectar tabelas sem RLS habilitado
CREATE OR REPLACE FUNCTION auditor.detectar_tabelas_sem_rls()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  total_rows BIGINT,
  has_user_id BOOLEAN,
  severity TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::TEXT,
    c.relname::TEXT,
    s.n_live_tup as total_rows,
    EXISTS(
      SELECT 1 
      FROM information_schema.columns cols
      WHERE cols.table_schema = n.nspname 
        AND cols.table_name = c.relname 
        AND cols.column_name IN ('user_id', 'owner_id', 'created_by')
    ) as has_user_id,
    CASE 
      WHEN n.nspname = 'public' AND c.relname LIKE '%user%' THEN 'CRÍTICO'
      WHEN n.nspname = 'public' THEN 'ALTO'
      ELSE 'MÉDIO'
    END::TEXT as severity,
    'ALTER TABLE ' || n.nspname || '.' || c.relname || ' ENABLE ROW LEVEL SECURITY;' as suggestion
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    AND NOT c.relrowsecurity
    AND n.nspname NOT LIKE 'pg_%'
  ORDER BY 
    CASE 
      WHEN n.nspname = 'public' AND c.relname LIKE '%user%' THEN 1
      WHEN n.nspname = 'public' THEN 2
      ELSE 3
    END,
    s.n_live_tup DESC NULLS LAST;
END;
$$;

-- Listar todas as policies RLS
CREATE OR REPLACE FUNCTION auditor.listar_politicas_rls()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  policy_name TEXT,
  policy_type TEXT,
  policy_roles TEXT[],
  policy_using TEXT,
  policy_check TEXT,
  is_permissive BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    policyname::TEXT,
    cmd::TEXT as policy_type,
    roles::TEXT[],
    qual::TEXT as policy_using,
    with_check::TEXT as policy_check,
    (permissive = 'permissive') as is_permissive
  FROM pg_policies
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY schemaname, tablename, policyname;
END;
$$;

-- Detectar policies muito permissivas (usando = true)
CREATE OR REPLACE FUNCTION auditor.detectar_politicas_permissivas()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  policy_name TEXT,
  policy_type TEXT,
  policy_definition TEXT,
  severity TEXT,
  risk TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    policyname::TEXT,
    cmd::TEXT,
    qual::TEXT as policy_definition,
    'CRÍTICO'::TEXT as severity,
    'Policy permite acesso irrestrito a todos os dados'::TEXT as risk
  FROM pg_policies
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    AND (
      qual = 'true' 
      OR qual LIKE '%true%' 
      OR with_check = 'true'
      OR qual IS NULL
    )
  ORDER BY schemaname, tablename;
END;
$$;

-- Verificar se auth.users tem RLS
CREATE OR REPLACE FUNCTION auditor.verificar_auth_users_rls()
RETURNS TABLE(
  has_rls BOOLEAN,
  total_policies INT,
  severity TEXT,
  message TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  rls_enabled BOOLEAN;
  policy_count INT;
BEGIN
  SELECT c.relrowsecurity INTO rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'auth' AND c.relname = 'users';
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'auth' AND tablename = 'users';
  
  RETURN QUERY
  SELECT 
    COALESCE(rls_enabled, false) as has_rls,
    COALESCE(policy_count, 0) as total_policies,
    CASE 
      WHEN NOT COALESCE(rls_enabled, false) THEN 'CRÍTICO'
      WHEN COALESCE(policy_count, 0) = 0 THEN 'ALTO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    CASE 
      WHEN NOT COALESCE(rls_enabled, false) THEN 'Tabela auth.users NÃO possui RLS habilitado!'
      WHEN COALESCE(policy_count, 0) = 0 THEN 'RLS habilitado mas sem policies configuradas'
      ELSE 'RLS configurado corretamente'
    END::TEXT as message;
END;
$$;

-- Auditar roles e grants excessivos
CREATE OR REPLACE FUNCTION auditor.auditar_concessoes_excessivas()
RETURNS TABLE(
  grantee TEXT,
  table_schema TEXT,
  table_name TEXT,
  privilege_type TEXT,
  is_grantable BOOLEAN,
  severity TEXT,
  risk TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.grantee::TEXT,
    tp.table_schema::TEXT,
    tp.table_name::TEXT,
    tp.privilege_type::TEXT,
    CASE WHEN tp.is_grantable = 'YES' THEN true ELSE false END as is_grantable,
    CASE 
      WHEN tp.grantee = 'PUBLIC' AND tp.privilege_type IN ('INSERT', 'UPDATE', 'DELETE') THEN 'CRÍTICO'
      WHEN tp.grantee = 'PUBLIC' THEN 'ALTO'
      WHEN tp.privilege_type = 'DELETE' AND tp.grantee NOT IN ('postgres', 'service_role') THEN 'MÉDIO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    CASE 
      WHEN tp.grantee = 'PUBLIC' THEN 'Role PUBLIC possui privilégios - qualquer um pode acessar'
      WHEN tp.is_grantable = 'YES' THEN 'Usuário pode conceder privilégios a outros'
      ELSE 'Grant potencialmente excessivo'
    END::TEXT as risk
  FROM information_schema.table_privileges tp
  WHERE tp.table_schema NOT IN ('pg_catalog', 'information_schema')
    AND (
      tp.grantee = 'PUBLIC'
      OR (tp.privilege_type IN ('DELETE', 'TRUNCATE') AND tp.grantee NOT IN ('postgres', 'service_role'))
      OR tp.is_grantable = 'YES'
    )
  ORDER BY 
    CASE 
      WHEN tp.grantee = 'PUBLIC' AND tp.privilege_type IN ('INSERT', 'UPDATE', 'DELETE') THEN 1
      WHEN tp.grantee = 'PUBLIC' THEN 2
      ELSE 3
    END,
    tp.table_schema, tp.table_name;
END;
$$;

-- Detectar tabelas públicas (schema public) sem proteção
CREATE OR REPLACE FUNCTION auditor.detectar_tabelas_publicas_desprotegidas()
RETURNS TABLE(
  table_name TEXT,
  has_rls BOOLEAN,
  policy_count INT,
  total_rows BIGINT,
  public_grants TEXT[],
  severity TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::TEXT,
    c.relrowsecurity as has_rls,
    COALESCE(
      (SELECT COUNT(*)::INT FROM pg_policies p WHERE p.tablename = c.relname AND p.schemaname = 'public'),
      0
    ) as policy_count,
    s.n_live_tup as total_rows,
    ARRAY(
      SELECT privilege_type 
      FROM information_schema.table_privileges 
      WHERE table_schema = 'public' 
        AND table_name = c.relname 
        AND grantee = 'PUBLIC'
    )::TEXT[] as public_grants,
    CASE 
      WHEN NOT c.relrowsecurity AND ARRAY_LENGTH(ARRAY(
        SELECT privilege_type FROM information_schema.table_privileges 
        WHERE table_schema = 'public' AND table_name = c.relname AND grantee = 'PUBLIC'
      ), 1) > 0 THEN 'CRÍTICO'
      WHEN NOT c.relrowsecurity THEN 'ALTO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    CASE 
      WHEN NOT c.relrowsecurity THEN 
        'ALTER TABLE public.' || c.relname || ' ENABLE ROW LEVEL SECURITY; -- Adicione policies apropriadas'
      ELSE 'Tabela protegida adequadamente'
    END::TEXT as suggestion
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_stat_user_tables s ON s.schemaname = 'public' AND s.tablename = c.relname
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
  ORDER BY 
    CASE 
      WHEN NOT c.relrowsecurity AND ARRAY_LENGTH(ARRAY(
        SELECT privilege_type FROM information_schema.table_privileges 
        WHERE table_schema = 'public' AND table_name = c.relname AND grantee = 'PUBLIC'
      ), 1) > 0 THEN 1
      WHEN NOT c.relrowsecurity THEN 2
      ELSE 3
    END,
    s.n_live_tup DESC NULLS LAST;
END;
$$;

COMMENT ON FUNCTION auditor.detectar_tabelas_sem_rls IS 'Lista tabelas sem RLS habilitado';
COMMENT ON FUNCTION auditor.listar_politicas_rls IS 'Lista todas as policies RLS do banco';
COMMENT ON FUNCTION auditor.detectar_politicas_permissivas IS 'Detecta policies muito permissivas (using = true)';
COMMENT ON FUNCTION auditor.verificar_auth_users_rls IS 'Verifica se auth.users tem RLS configurado';
COMMENT ON FUNCTION auditor.auditar_concessoes_excessivas IS 'Audita grants excessivos e perigosos';
COMMENT ON FUNCTION auditor.detectar_tabelas_publicas_desprotegidas IS 'Detecta tabelas públicas sem proteção adequada';

