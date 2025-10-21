-- ============================================
-- Migration: Storage Bucket icarus_new
-- Data: 2025-10-18
-- Versão: 1.1
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Cria bucket icarus_new para armazenamento geral
-- - Policies RLS multi-tenant por empresa_id
-- - Estrutura de pastas: {empresa_id}/{categoria}/{arquivo}
-- ============================================

-- ============================================
-- 1. CRIAR BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icarus_new',
  'icarus_new',
  false, -- privado, requer autenticação
  52428800, -- 50MB limite por arquivo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. POLICIES RLS - SELECT (visualizar)
-- ============================================
CREATE POLICY "icarus_new_select_own_empresa"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 3. POLICIES RLS - INSERT (upload)
-- ============================================
CREATE POLICY "icarus_new_insert_own_empresa"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 4. POLICIES RLS - UPDATE (atualizar)
-- ============================================
CREATE POLICY "icarus_new_update_own_empresa"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
)
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 5. POLICIES RLS - DELETE (excluir)
-- ============================================
CREATE POLICY "icarus_new_delete_admin_only"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa() AND
  public.current_perfil() IN ('admin', 'comercial')
);

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "icarus_new_select_own_empresa" ON storage.objects IS 
  'Permite visualizar arquivos da própria empresa (multi-tenant)';

COMMENT ON POLICY "icarus_new_insert_own_empresa" ON storage.objects IS 
  'Permite upload de arquivos para a própria empresa';

COMMENT ON POLICY "icarus_new_delete_admin_only" ON storage.objects IS 
  'Permite exclusão apenas para admin e comercial';

-- ============================================
-- ESTRUTURA DE PASTAS SUGERIDA
-- ============================================
-- {empresa_id}/cirurgias/{cirurgia_id}/documento.pdf
-- {empresa_id}/produtos/{produto_id}/imagem.jpg
-- {empresa_id}/usuarios/{usuario_id}/avatar.png
-- {empresa_id}/documentos/contrato.pdf
-- {empresa_id}/nfe/{numero_nfe}.xml
-- {empresa_id}/nfe/{numero_nfe}.pdf

