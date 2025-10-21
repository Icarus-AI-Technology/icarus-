-- ============================================
-- STORAGE POLICIES - icarus_new
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================
-- URL: https://supabase.com/dashboard/project/ttswvavcisdnonytslom/editor
--
-- IMPORTANTE: Estas policies implementam multi-tenancy
-- Cada empresa só acessa arquivos na pasta {empresa_id}/
-- ============================================

-- Policy 1: SELECT (visualizar arquivos da própria empresa)
CREATE POLICY IF NOT EXISTS icarus_new_select_own_empresa
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = (
    SELECT NULLIF(
      current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
      ''
    )::uuid
  )
);

-- Policy 2: INSERT (fazer upload para a própria empresa)
CREATE POLICY IF NOT EXISTS icarus_new_insert_own_empresa
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = (
    SELECT NULLIF(
      current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
      ''
    )::uuid
  )
);

-- Policy 3: UPDATE (atualizar metadados da própria empresa)
CREATE POLICY IF NOT EXISTS icarus_new_update_own_empresa
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = (
    SELECT NULLIF(
      current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
      ''
    )::uuid
  )
)
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = (
    SELECT NULLIF(
      current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
      ''
    )::uuid
  )
);

-- Policy 4: DELETE (excluir - apenas admin e comercial)
CREATE POLICY IF NOT EXISTS icarus_new_delete_admin_only
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = (
    SELECT NULLIF(
      current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
      ''
    )::uuid
  ) AND
  COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'perfil',
    'operador'
  ) IN ('admin', 'comercial')
);

-- ============================================
-- VERIFICAR POLICIES CRIADAS
-- ============================================
SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN policyname LIKE '%select%' THEN '✅ SELECT'
    WHEN policyname LIKE '%insert%' THEN '✅ INSERT'
    WHEN policyname LIKE '%update%' THEN '✅ UPDATE'
    WHEN policyname LIKE '%delete%' THEN '✅ DELETE'
  END as tipo
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE 'icarus_new_%'
ORDER BY policyname;

-- Resultado esperado: 4 policies
-- ✅ icarus_new_delete_admin_only (DELETE)
-- ✅ icarus_new_insert_own_empresa (INSERT)
-- ✅ icarus_new_select_own_empresa (SELECT)
-- ✅ icarus_new_update_own_empresa (UPDATE)

