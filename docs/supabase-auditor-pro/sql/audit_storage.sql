-- ============================================================================
-- AUDITORIA DE STORAGE & BUCKETS
-- ============================================================================

-- Listar todos os buckets e suas configurações
CREATE OR REPLACE FUNCTION auditor.listar_buckets_armazenamento()
RETURNS TABLE(
  bucket_id TEXT,
  bucket_name TEXT,
  is_public BOOLEAN,
  file_size_limit BIGINT,
  allowed_mime_types TEXT[],
  total_objects BIGINT,
  total_size_bytes BIGINT,
  total_size TEXT
)
SECURITY DEFINER
SET search_path = storage
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::TEXT,
    b.name::TEXT,
    b.public::BOOLEAN,
    b.file_size_limit,
    b.allowed_mime_types::TEXT[],
    COUNT(o.id) as total_objects,
    COALESCE(SUM((o.metadata->>'size')::BIGINT), 0)::BIGINT as total_size_bytes,
    pg_size_pretty(COALESCE(SUM((o.metadata->>'size')::BIGINT), 0)::BIGINT) as total_size
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON o.bucket_id = b.id
  GROUP BY b.id, b.name, b.public, b.file_size_limit, b.allowed_mime_types
  ORDER BY total_size_bytes DESC;
END;
$$;

-- Detectar arquivos órfãos (sem referência em tabelas do banco)
CREATE OR REPLACE FUNCTION auditor.detectar_arquivos_orfaos(
  reference_table TEXT DEFAULT 'public.files',
  reference_column TEXT DEFAULT 'storage_path'
)
RETURNS TABLE(
  bucket_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  created_at TIMESTAMP,
  last_accessed TIMESTAMP,
  days_orphan INT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = storage
LANGUAGE plpgsql
AS $$
BEGIN
  -- Nota: Esta função é um template
  -- Requer customização com base no schema específico do projeto
  RETURN QUERY
  SELECT 
    b.name::TEXT as bucket_name,
    o.name::TEXT as file_path,
    (o.metadata->>'size')::BIGINT as file_size,
    o.created_at::TIMESTAMP,
    o.updated_at::TIMESTAMP as last_accessed,
    EXTRACT(DAY FROM NOW() - o.created_at)::INT as days_orphan,
    'DELETE FROM storage.objects WHERE id = ''' || o.id || ''';' as suggestion
  FROM storage.objects o
  JOIN storage.buckets b ON b.id = o.bucket_id
  WHERE NOT EXISTS (
    -- Esta subquery precisa ser adaptada para cada projeto
    SELECT 1 FROM public.users u WHERE u.avatar_url = o.name
    UNION
    SELECT 1 FROM public.posts p WHERE p.image_url = o.name
  )
  AND EXTRACT(DAY FROM NOW() - o.created_at) > 30
  ORDER BY file_size DESC;
END;
$$;

-- Detectar arquivos duplicados (mesmo hash/conteúdo)
CREATE OR REPLACE FUNCTION auditor.detectar_arquivos_duplicados()
RETURNS TABLE(
  bucket_name TEXT,
  file_hash TEXT,
  duplicate_count BIGINT,
  file_paths TEXT[],
  total_wasted_size BIGINT,
  total_wasted_size_pretty TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = storage
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name::TEXT as bucket_name,
    (o.metadata->>'eTag')::TEXT as file_hash,
    COUNT(*)::BIGINT as duplicate_count,
    ARRAY_AGG(o.name)::TEXT[] as file_paths,
    (SUM((o.metadata->>'size')::BIGINT) - MIN((o.metadata->>'size')::BIGINT))::BIGINT as total_wasted_size,
    pg_size_pretty((SUM((o.metadata->>'size')::BIGINT) - MIN((o.metadata->>'size')::BIGINT))::BIGINT) as total_wasted_size_pretty,
    'Manter apenas 1 arquivo e atualizar referências'::TEXT as suggestion
  FROM storage.objects o
  JOIN storage.buckets b ON b.id = o.bucket_id
  WHERE o.metadata->>'eTag' IS NOT NULL
  GROUP BY b.name, o.metadata->>'eTag'
  HAVING COUNT(*) > 1
  ORDER BY total_wasted_size DESC;
END;
$$;

-- Calcular tamanho total por bucket
CREATE OR REPLACE FUNCTION auditor.calcular_tamanho_buckets()
RETURNS TABLE(
  bucket_name TEXT,
  total_files BIGINT,
  total_size_bytes BIGINT,
  total_size TEXT,
  avg_file_size BIGINT,
  avg_file_size_pretty TEXT,
  largest_file TEXT,
  largest_file_size TEXT
)
SECURITY DEFINER
SET search_path = storage
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name::TEXT,
    COUNT(o.id)::BIGINT as total_files,
    COALESCE(SUM((o.metadata->>'size')::BIGINT), 0)::BIGINT as total_size_bytes,
    pg_size_pretty(COALESCE(SUM((o.metadata->>'size')::BIGINT), 0)) as total_size,
    COALESCE(AVG((o.metadata->>'size')::BIGINT), 0)::BIGINT as avg_file_size,
    pg_size_pretty(COALESCE(AVG((o.metadata->>'size')::BIGINT), 0)::BIGINT) as avg_file_size_pretty,
    (
      SELECT o2.name 
      FROM storage.objects o2 
      WHERE o2.bucket_id = b.id 
      ORDER BY (o2.metadata->>'size')::BIGINT DESC 
      LIMIT 1
    )::TEXT as largest_file,
    (
      SELECT pg_size_pretty((o2.metadata->>'size')::BIGINT)
      FROM storage.objects o2 
      WHERE o2.bucket_id = b.id 
      ORDER BY (o2.metadata->>'size')::BIGINT DESC 
      LIMIT 1
    )::TEXT as largest_file_size
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON o.bucket_id = b.id
  GROUP BY b.id, b.name
  ORDER BY total_size_bytes DESC;
END;
$$;

-- Calcular tamanho por tipo de arquivo (MIME type)
CREATE OR REPLACE FUNCTION auditor.calcular_tamanho_por_mime()
RETURNS TABLE(
  bucket_name TEXT,
  mime_type TEXT,
  total_files BIGINT,
  total_size_bytes BIGINT,
  total_size TEXT,
  percentage_of_bucket NUMERIC
)
SECURITY DEFINER
SET search_path = storage
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH bucket_totals AS (
    SELECT 
      bucket_id,
      SUM((metadata->>'size')::BIGINT) as bucket_total_size
    FROM storage.objects
    GROUP BY bucket_id
  )
  SELECT 
    b.name::TEXT,
    (o.metadata->>'mimetype')::TEXT as mime_type,
    COUNT(o.id)::BIGINT as total_files,
    SUM((o.metadata->>'size')::BIGINT)::BIGINT as total_size_bytes,
    pg_size_pretty(SUM((o.metadata->>'size')::BIGINT)) as total_size,
    ROUND(
      (SUM((o.metadata->>'size')::BIGINT)::NUMERIC / NULLIF(bt.bucket_total_size, 0)) * 100,
      2
    ) as percentage_of_bucket
  FROM storage.objects o
  JOIN storage.buckets b ON b.id = o.bucket_id
  LEFT JOIN bucket_totals bt ON bt.bucket_id = o.bucket_id
  WHERE o.metadata->>'mimetype' IS NOT NULL
  GROUP BY b.name, o.metadata->>'mimetype', bt.bucket_total_size
  ORDER BY total_size_bytes DESC;
END;
$$;

-- Sugerir limpeza automática de arquivos antigos
CREATE OR REPLACE FUNCTION auditor.sugerir_limpeza_arquivos_antigos(days_threshold INT DEFAULT 365)
RETURNS TABLE(
  bucket_name TEXT,
  file_path TEXT,
  file_size TEXT,
  created_at TIMESTAMP,
  days_old INT,
  severity TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = storage
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name::TEXT,
    o.name::TEXT,
    pg_size_pretty((o.metadata->>'size')::BIGINT) as file_size,
    o.created_at::TIMESTAMP,
    EXTRACT(DAY FROM NOW() - o.created_at)::INT as days_old,
    CASE 
      WHEN EXTRACT(DAY FROM NOW() - o.created_at) > (days_threshold * 2) THEN 'ALTO'
      WHEN EXTRACT(DAY FROM NOW() - o.created_at) > days_threshold THEN 'MÉDIO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    'DELETE FROM storage.objects WHERE id = ''' || o.id || ''';' as suggestion
  FROM storage.objects o
  JOIN storage.buckets b ON b.id = o.bucket_id
  WHERE EXTRACT(DAY FROM NOW() - o.created_at) > days_threshold
  ORDER BY o.created_at ASC;
END;
$$;

-- Auditar policies de storage buckets
CREATE OR REPLACE FUNCTION auditor.auditar_politicas_armazenamento()
RETURNS TABLE(
  bucket_name TEXT,
  policy_name TEXT,
  policy_definition TEXT,
  is_permissive BOOLEAN,
  severity TEXT,
  risk TEXT
)
SECURITY DEFINER
SET search_path = storage
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT name FROM storage.buckets WHERE id = p.tablename::TEXT)::TEXT as bucket_name,
    p.policyname::TEXT,
    COALESCE(p.qual::TEXT, p.with_check::TEXT) as policy_definition,
    (LOWER(p.permissive) = 'permissive') as is_permissive,
    CASE 
      WHEN (p.qual IS NULL OR p.qual IN ('true', '(true)'))
       AND (p.with_check IS NULL OR p.with_check IN ('true', '(true)')) THEN 'CRÍTICO'
      WHEN COALESCE(p.qual, p.with_check, '') ILIKE '%public%' THEN 'ALTO'
      ELSE 'MÉDIO'
    END::TEXT as severity,
    CASE 
      WHEN (p.qual IS NULL OR p.qual IN ('true', '(true)'))
       AND (p.with_check IS NULL OR p.with_check IN ('true', '(true)')) THEN 'Policy permite acesso irrestrito'
      WHEN COALESCE(p.qual, p.with_check, '') ILIKE '%public%' THEN 'Policy pode expor arquivos publicamente'
      ELSE 'Revisar policy manualmente'
    END::TEXT as risk
  FROM pg_policies p
  WHERE p.schemaname = 'storage'
    AND p.tablename = 'objects'
  ORDER BY severity, bucket_name;
END;
$$;

COMMENT ON FUNCTION auditor.listar_buckets_armazenamento IS 'Lista todos os buckets com estatísticas';
COMMENT ON FUNCTION auditor.detectar_arquivos_orfaos IS 'Detecta arquivos sem referência no banco (requer customização)';
COMMENT ON FUNCTION auditor.detectar_arquivos_duplicados IS 'Encontra arquivos duplicados pelo hash';
COMMENT ON FUNCTION auditor.calcular_tamanho_buckets IS 'Calcula tamanho total por bucket';
COMMENT ON FUNCTION auditor.calcular_tamanho_por_mime IS 'Agrupa tamanhos por tipo de arquivo';
COMMENT ON FUNCTION auditor.sugerir_limpeza_arquivos_antigos IS 'Sugere limpeza de arquivos antigos';
COMMENT ON FUNCTION auditor.auditar_politicas_armazenamento IS 'Audita policies de segurança do storage';

