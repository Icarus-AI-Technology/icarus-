-- Migration: Storage Configuration - Buckets e Policies
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: 2025-10-20
-- Descrição: Configuração de buckets e políticas de storage

-- ======================================
-- CRIAR BUCKETS
-- ======================================

-- Bucket: cirurgias (documentos de cirurgias, atestados, termos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cirurgias',
  'cirurgias',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: faturamento (NFes, XMLs, DANFEs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faturamento',
  'faturamento',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: compliance (documentos de conformidade, auditorias)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'compliance',
  'compliance',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: consignacao (guias de consignação, recibos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consignacao',
  'consignacao',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: uploads (uploads gerais, avatares, logos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- ======================================
-- POLÍTICAS: cirurgias
-- ======================================

-- SELECT: usuários veem apenas arquivos da sua empresa
CREATE POLICY "cirurgias_select_policy" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
    )
  );

-- INSERT: apenas usuários autorizados da empresa
CREATE POLICY "cirurgias_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- UPDATE: mesmo controle do INSERT
CREATE POLICY "cirurgias_update_policy" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- DELETE: apenas admins
CREATE POLICY "cirurgias_delete_policy" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLÍTICAS: faturamento
-- ======================================

CREATE POLICY "faturamento_select_policy" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
    )
  );

CREATE POLICY "faturamento_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY "faturamento_update_policy" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY "faturamento_delete_policy" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLÍTICAS: compliance, consignacao, uploads
-- ======================================

-- Policies similares para outros buckets (simplificadas)

CREATE POLICY "compliance_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'compliance' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "compliance_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'compliance' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "consignacao_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'consignacao' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "consignacao_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'consignacao' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "uploads_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "uploads_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

-- ======================================
-- ESTRUTURA DE PASTAS RECOMENDADA
-- ======================================

-- Convenção: {empresa_id}/{modulo}/{entidade_id}/{filename}
-- Exemplos:
--   cirurgias/11111111-1111-1111-1111-111111111111/cirurgia/abc-123/termo-consentimento.pdf
--   faturamento/11111111-1111-1111-1111-111111111111/nfe/2024/nota-12345.xml
--   compliance/11111111-1111-1111-1111-111111111111/auditorias/2024-Q1/relatorio.pdf

-- ======================================
-- VALIDAÇÃO
-- ======================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM storage.buckets WHERE name IN ('cirurgias', 'faturamento', 'compliance', 'consignacao', 'uploads');
  RAISE NOTICE 'Buckets configurados: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%cirurgias%';
  RAISE NOTICE 'Políticas de storage (cirurgias): %', v_count;
END $$;

