-- ============================================================================
-- CRIAR STORAGE BUCKETS - ICARUS
-- ============================================================================
-- Projeto: gvbkviozlhxorjoavmky
-- Data: 2025-11-17
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
-- 2. Copie e cole este SQL
-- 3. Execute
-- 4. Verifique em: Storage → Buckets
-- ============================================================================

-- ============================================
-- BUCKET 1: documentos_cirurgias
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, -- Privado
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 2: documentos_fiscais
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_fiscais',
  'documentos_fiscais',
  FALSE, -- Privado
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 3: anexos_produtos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos_produtos',
  'anexos_produtos',
  FALSE, -- Privado
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 4: avatares
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatares',
  'avatares',
  TRUE, -- Público
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 5: icarus_new
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icarus_new',
  'icarus_new',
  FALSE, -- Privado
  52428800, -- 50MB
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
-- VALIDAR CRIAÇÃO
-- ============================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_types_count,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- ============================================
-- RESULTADO ESPERADO: 5 buckets
-- ============================================
-- documentos_cirurgias | FALSE | 10MB
-- documentos_fiscais   | FALSE | 50MB
-- anexos_produtos      | FALSE | 5MB
-- avatares             | TRUE  | 1MB
-- icarus_new           | FALSE | 50MB
-- ============================================

