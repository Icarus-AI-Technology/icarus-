-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔍 MIGRAÇÃO 0010 — FULL-TEXT SEARCH (PostgreSQL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Objetivo: Implementar busca nativa PostgreSQL (sem Meilisearch/Docker)
-- Substitui: Meilisearch
-- Economia: US$ 600-1.2k/ano
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. HABILITAR EXTENSÕES
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS unaccent; -- Remove acentos

-- ============================================
-- 2. CRIAR ÍNDICES FULL-TEXT SEARCH
-- ============================================

-- Índice para conhecimento_base (busca em português)
CREATE INDEX IF NOT EXISTS idx_conhecimento_fts 
ON conhecimento_base 
USING GIN (to_tsvector('portuguese', conteudo_texto));

-- Índice trigram para busca aproximada
CREATE INDEX IF NOT EXISTS idx_conhecimento_trgm 
ON conhecimento_base 
USING GIN (conteudo_texto gin_trgm_ops);

-- Índice para legislacao_updates
CREATE INDEX IF NOT EXISTS idx_legislacao_fts 
ON legislacao_updates 
USING GIN (to_tsvector('portuguese', 
  COALESCE(titulo, '') || ' ' || COALESCE(descricao, '')));

-- ============================================
-- 3. FUNÇÃO DE BUSCA INTELIGENTE
-- ============================================

CREATE OR REPLACE FUNCTION buscar_conhecimento(
  query_text TEXT,
  limit_results INTEGER DEFAULT 10,
  min_rank REAL DEFAULT 0.1
)
RETURNS TABLE (
  id UUID,
  documento_id TEXT,
  conteudo_texto TEXT,
  categoria TEXT,
  modulo TEXT,
  rank REAL,
  relevancia TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cb.documento_id,
    cb.conteudo_texto,
    cb.categoria,
    cb.modulo,
    ts_rank(
      to_tsvector('portuguese', cb.conteudo_texto), 
      plainto_tsquery('portuguese', query_text)
    ) as rank,
    CASE 
      WHEN ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                   plainto_tsquery('portuguese', query_text)) > 0.5 
        THEN 'alta'
      WHEN ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                   plainto_tsquery('portuguese', query_text)) > 0.2 
        THEN 'media'
      ELSE 'baixa'
    END as relevancia
  FROM conhecimento_base cb
  WHERE to_tsvector('portuguese', cb.conteudo_texto) 
        @@ plainto_tsquery('portuguese', query_text)
        AND ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                    plainto_tsquery('portuguese', query_text)) >= min_rank
  ORDER BY rank DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_conhecimento IS 'Busca full-text em português na base de conhecimento com ranking';

-- ============================================
-- 4. FUNÇÃO DE BUSCA APROXIMADA (TYPOS)
-- ============================================

CREATE OR REPLACE FUNCTION buscar_similar(
  query_text TEXT,
  min_similarity REAL DEFAULT 0.3,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  documento_id TEXT,
  conteudo_texto TEXT,
  categoria TEXT,
  modulo TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cb.documento_id,
    cb.conteudo_texto,
    cb.categoria,
    cb.modulo,
    similarity(cb.conteudo_texto, query_text) as similarity
  FROM conhecimento_base cb
  WHERE cb.conteudo_texto % query_text
        AND similarity(cb.conteudo_texto, query_text) >= min_similarity
  ORDER BY similarity DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_similar IS 'Busca por similaridade (tolera typos)';

-- ============================================
-- 5. FUNÇÃO DE BUSCA EM LEGISLAÇÃO
-- ============================================

CREATE OR REPLACE FUNCTION buscar_legislacao(
  query_text TEXT,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  data_publicacao DATE,
  link_oficial TEXT,
  impacto_modulos TEXT[],
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lu.id,
    lu.titulo,
    lu.descricao,
    lu.data_publicacao,
    lu.link_oficial,
    lu.impacto_modulos,
    ts_rank(
      to_tsvector('portuguese', 
        COALESCE(lu.titulo, '') || ' ' || COALESCE(lu.descricao, '')), 
      plainto_tsquery('portuguese', query_text)
    ) as rank
  FROM legislacao_updates lu
  WHERE to_tsvector('portuguese', 
        COALESCE(lu.titulo, '') || ' ' || COALESCE(lu.descricao, '')) 
        @@ plainto_tsquery('portuguese', query_text)
  ORDER BY rank DESC, lu.data_publicacao DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_legislacao IS 'Busca full-text em atualizações de legislação';

-- ============================================
-- 6. VIEW MATERIALIZADA PARA PERFORMANCE
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_busca_rapida AS
SELECT 
  id,
  documento_id,
  conteudo_texto,
  categoria,
  modulo,
  to_tsvector('portuguese', conteudo_texto) as tsv
FROM conhecimento_base;

CREATE INDEX IF NOT EXISTS idx_mv_busca_fts 
ON mv_busca_rapida USING GIN (tsv);

-- Função para refresh da view
CREATE OR REPLACE FUNCTION refresh_busca_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_busca_rapida;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_busca_cache IS 'Atualiza cache de busca (executar periodicamente)';

-- ============================================
-- 7. FUNÇÃO DE AUTOCOMPLETE/SUGESTÕES
-- ============================================

CREATE OR REPLACE FUNCTION sugerir_termos(
  prefix_text TEXT,
  limit_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  sugestao TEXT,
  frequencia BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    word as sugestao,
    COUNT(*) as frequencia
  FROM (
    SELECT unnest(tsvector_to_array(to_tsvector('portuguese', conteudo_texto))) as word
    FROM conhecimento_base
  ) words
  WHERE word LIKE prefix_text || '%'
  GROUP BY word
  ORDER BY frequencia DESC, word
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sugerir_termos IS 'Autocomplete de termos de busca';

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%_fts';
  
  RAISE NOTICE 'Migração 0010 concluída! Índices FTS criados: %', index_count;
  RAISE NOTICE 'Substituindo Meilisearch por PostgreSQL FTS (economia: US$ 600-1.2k/ano)';
END $$;

