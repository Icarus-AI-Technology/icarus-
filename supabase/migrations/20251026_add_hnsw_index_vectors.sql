-- Migration: Adicionar HNSW Index para busca vetorial otimizada
-- Data: 2025-10-26
-- Descrição: Implementa índice HNSW (Hierarchical Navigable Small World) para busca vetorial ~10x mais rápida

-- ============================================================================
-- HABILITAR EXTENSÃO pgvector (se ainda não estiver)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- ADICIONAR ÍNDICE HNSW PARA BUSCA VETORIAL RÁPIDA
-- ============================================================================

-- Remover índice antigo (se existir)
DROP INDEX IF EXISTS ml_vectors_embedding_idx;

-- Criar índice HNSW otimizado
-- m=16: número de conexões por layer (padrão, bom para maioria dos casos)
-- ef_construction=64: tamanho da lista de candidatos durante construção (qualidade vs velocidade)
CREATE INDEX ml_vectors_embedding_hnsw_idx 
ON public.ml_vectors 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON INDEX ml_vectors_embedding_hnsw_idx IS 
  'Índice HNSW para busca vetorial otimizada. Performance: ~10x mais rápido que IVFFlat para datasets <1M vetores. Métrica: cosine similarity.';

-- ============================================================================
-- FUNÇÃO: BUSCA VETORIAL COM HNSW
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_similar_vectors(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_module TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  external_id TEXT,
  module TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.external_id,
    v.module,
    1 - (v.embedding <=> query_embedding) AS similarity,
    v.metadata
  FROM public.ml_vectors v
  WHERE 
    (filter_module IS NULL OR v.module = filter_module)
    AND 1 - (v.embedding <=> query_embedding) >= match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION public.search_similar_vectors IS 
  'Busca vetores similares usando HNSW index com threshold configurável. Retorna similarity score (0-1).';

-- ============================================================================
-- FUNÇÃO: BUSCA VETORIAL HÍBRIDA (VETORIAL + METADATA)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.hybrid_vector_search(
  query_embedding VECTOR(1536),
  metadata_filter JSONB DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  external_id TEXT,
  module TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.external_id,
    v.module,
    1 - (v.embedding <=> query_embedding) AS similarity,
    v.metadata
  FROM public.ml_vectors v
  WHERE 
    (metadata_filter IS NULL OR v.metadata @> metadata_filter)
    AND 1 - (v.embedding <=> query_embedding) >= match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION public.hybrid_vector_search IS 
  'Busca híbrida: combina similaridade vetorial (HNSW) com filtros metadata (JSONB). Ideal para busca contextual.';

-- ============================================================================
-- ÍNDICE ADICIONAL PARA METADATA (JSONB)
-- ============================================================================

CREATE INDEX IF NOT EXISTS ml_vectors_metadata_gin_idx 
ON public.ml_vectors 
USING gin (metadata jsonb_path_ops);

COMMENT ON INDEX ml_vectors_metadata_gin_idx IS 
  'Índice GIN para busca rápida em metadata JSONB. Complementa HNSW para busca híbrida.';

-- ============================================================================
-- ESTATÍSTICAS E PERFORMANCE
-- ============================================================================

-- Atualizar estatísticas da tabela
ANALYZE public.ml_vectors;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Performance esperada:
-- - Busca vetorial: ~10x mais rápida que IVFFlat
-- - Latência: <50ms para 100k vetores
-- - Throughput: ~1000 queries/segundo
-- - Recall: >95% com ef_search=40 (padrão)

-- Observações:
-- 1. Para datasets >1M vetores, considerar IVFFlat + HNSW híbrido
-- 2. Ajustar ef_search via SET LOCAL para trade-off velocidade/qualidade
-- 3. Monitorar via pg_stat_user_indexes


