-- ============================================
-- Migration 0005: Storage Policies
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Buckets para documentos (NF-e, romaneios, DANFE)
-- - Policies RLS multi-tenant para storage
-- - Validação de tipo/tamanho de arquivo
-- - Nomenclatura padronizada
-- ============================================

-- ============================================
-- BUCKET: documentos_cirurgias
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, -- Privado
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: documentos_fiscais
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_fiscais',
  'documentos_fiscais',
  FALSE,
  52428800, -- 50MB (XML NF-e pode ser grande)
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: anexos_produtos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos_produtos',
  'anexos_produtos',
  FALSE,
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: avatares (público)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatares',
  'avatares',
  TRUE, -- Público
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLICIES: documentos_cirurgias
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_storage_cirurgias_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text
  );

-- INSERT: Admin, operador
CREATE POLICY pol_storage_cirurgias_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'operador')
  );

-- UPDATE: Admin, operador
CREATE POLICY pol_storage_cirurgias_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'operador')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_cirurgias_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: documentos_fiscais
-- ============================================

-- SELECT: Admin, financeiro
CREATE POLICY pol_storage_fiscais_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- INSERT: Admin, financeiro
CREATE POLICY pol_storage_fiscais_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- UPDATE: Admin, financeiro
CREATE POLICY pol_storage_fiscais_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_fiscais_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: anexos_produtos
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_storage_produtos_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text
  );

-- INSERT: Admin, comercial, estoque
CREATE POLICY pol_storage_produtos_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- UPDATE: Admin, comercial, estoque
CREATE POLICY pol_storage_produtos_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_produtos_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: avatares (público)
-- ============================================

-- SELECT: Público
CREATE POLICY pol_storage_avatares_select
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatares');

-- INSERT: Próprio usuário
CREATE POLICY pol_storage_avatares_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Próprio usuário
CREATE POLICY pol_storage_avatares_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Próprio usuário
CREATE POLICY pol_storage_avatares_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- FUNÇÃO: Validar upload de arquivo
-- ============================================
CREATE OR REPLACE FUNCTION validar_upload_arquivo(
  p_bucket TEXT,
  p_nome_arquivo TEXT,
  p_tamanho BIGINT,
  p_mime_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_bucket_config RECORD;
  v_mime_permitido BOOLEAN;
BEGIN
  -- Buscar configuração do bucket
  SELECT * INTO v_bucket_config
  FROM storage.buckets
  WHERE id = p_bucket;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bucket % não existe', p_bucket;
  END IF;
  
  -- Validar tamanho
  IF p_tamanho > v_bucket_config.file_size_limit THEN
    RAISE EXCEPTION 'Arquivo excede tamanho máximo de % bytes', v_bucket_config.file_size_limit;
  END IF;
  
  -- Validar MIME type
  IF v_bucket_config.allowed_mime_types IS NOT NULL THEN
    SELECT p_mime_type = ANY(v_bucket_config.allowed_mime_types) INTO v_mime_permitido;
    
    IF NOT v_mime_permitido THEN
      RAISE EXCEPTION 'Tipo de arquivo % não permitido no bucket %', p_mime_type, p_bucket;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION validar_upload_arquivo IS 'Valida upload de arquivo (tamanho + MIME type)';

-- ============================================
-- FUNÇÃO: Gerar caminho padronizado para storage
-- ============================================
CREATE OR REPLACE FUNCTION gerar_caminho_storage(
  p_empresa_id UUID,
  p_entidade TEXT,
  p_registro_id UUID,
  p_extensao TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_caminho TEXT;
  v_timestamp TEXT;
BEGIN
  -- Formato: empresa_id/entidade/registro_id/timestamp.extensao
  v_timestamp := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
  v_caminho := CONCAT(
    p_empresa_id::text,
    '/',
    p_entidade,
    '/',
    p_registro_id::text,
    '/',
    v_timestamp,
    '.',
    p_extensao
  );
  
  RETURN v_caminho;
END;
$$;

COMMENT ON FUNCTION gerar_caminho_storage IS 'Gera caminho padronizado: empresa_id/entidade/registro_id/timestamp.ext';

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY pol_storage_cirurgias_select ON storage.objects IS 'Isolamento multi-tenant para documentos de cirurgias';
COMMENT ON POLICY pol_storage_fiscais_select ON storage.objects IS 'Apenas financeiro/admin acessam documentos fiscais';
COMMENT ON POLICY pol_storage_avatares_insert ON storage.objects IS 'Usuário pode fazer upload apenas do próprio avatar';

