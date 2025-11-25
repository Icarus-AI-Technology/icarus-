-- ============================================================================
-- ICARUS v5.0 (OraclusX) - Núcleo de IA + Auditoria Automatizada
-- Data: 2025-11-23
--
-- Este script consolida os ajustes obrigatórios solicitados:
--   • Padronização das tabelas agent_tasks / agent_logs / agent_reports
--   • Estrutura vetorial oficial (documentos + função match_documentos)
--   • Triggers Realtime para conclusão de tarefas
--   • Funções de auditoria completa do Supabase (schema, dados, storage, performance)
--   • Estruturas auxiliares para execuções de auditoria via LangGraph
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- ============================================================================
-- DOCUMENTOS (pgvector + busca híbrida)
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('public.documentos') IS NULL THEN
    IF to_regclass('public.documents') IS NOT NULL THEN
      ALTER TABLE public.documents RENAME TO documentos;
    ELSE
      CREATE TABLE public.documentos (
        id BIGSERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        embedding VECTOR(1536),
        empresa_id UUID REFERENCES public.empresas(id),
        checksum TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    END IF;
  END IF;
END
$$;

ALTER TABLE public.documentos
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

ALTER TABLE public.documentos
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id),
  ADD COLUMN IF NOT EXISTS checksum TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Índice HNSW (melhor custo em pgvector >= 0.7)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'documentos_embedding_hnsw'
  ) THEN
    EXECUTE 'CREATE INDEX documentos_embedding_hnsw ON public.documentos USING hnsw (embedding vector_cosine_ops)';
  END IF;
END
$$;

DROP FUNCTION IF EXISTS public.match_documents(vector, float, int);
DROP FUNCTION IF EXISTS public.match_documentos(vector, float, int, jsonb);

CREATE OR REPLACE FUNCTION public.match_documentos (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documentos d
  WHERE d.embedding IS NOT NULL
    AND (filter = '{}'::jsonb OR d.metadata @> filter)
    AND (1 - (d.embedding <=> query_embedding)) >= match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT COALESCE(match_count, 10);
END;
$$;

COMMENT ON FUNCTION public.match_documentos IS
  'Busca vetorial híbrida (pgvector + filtros JSONB) utilizada pelos agentes LangChain.';

-- ============================================================================
-- TABELAS AGENTES + CAMPOS REQUERIDOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  query TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE CASCADE,
  agent_name TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE CASCADE,
  report_id TEXT,
  report_url TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_tasks
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS query TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE public.agent_tasks
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

ALTER TABLE public.agent_reports
  ADD COLUMN IF NOT EXISTS report_url TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agent_reports'
      AND column_name = 'pdf_url'
  ) THEN
    EXECUTE 'UPDATE public.agent_reports SET report_url = COALESCE(report_url, pdf_url) WHERE report_url IS NULL';
  END IF;
END;
$$;

-- Trigger para notificar Realtime quando uma task é concluída
CREATE OR REPLACE FUNCTION public.notify_agent_task_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    PERFORM pg_notify(
      'agent_tasks_status',
      jsonb_build_object(
        'task_id', NEW.id,
        'empresa_id', NEW.empresa_id,
        'status', NEW.status,
        'completed_at', COALESCE(NEW.completed_at, NOW())
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agent_tasks_status_notify ON public.agent_tasks;
CREATE TRIGGER agent_tasks_status_notify
AFTER UPDATE OF status ON public.agent_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_agent_task_status();

-- ============================================================================
-- Tabelas de auditoria (runs + insights)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('schema', 'dados', 'storage', 'performance', 'full')),
  triggered_by UUID REFERENCES public.profiles(id),
  empresa_id UUID REFERENCES public.empresas(id),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  findings_count INTEGER DEFAULT 0,
  summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.audit_insights (
  insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.audit_runs(run_id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  referencia TEXT NOT NULL,
  severidade TEXT NOT NULL CHECK (severidade IN ('info', 'warning', 'critical')),
  insight TEXT NOT NULL,
  recomendacao TEXT,
  detalhes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_insights_run_idx ON public.audit_insights(run_id);
CREATE INDEX IF NOT EXISTS audit_insights_categoria_idx ON public.audit_insights(categoria);

-- ============================================================================
-- Funções auxiliares para auditoria automatizada
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_auditoria_schema(p_empresa UUID DEFAULT NULL)
RETURNS TABLE (
  categoria TEXT,
  referencia TEXT,
  severidade TEXT,
  insight TEXT,
  recomendacao TEXT,
  detalhes JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'schema' AS categoria,
    format('%I.%I', n.nspname, c.relname) AS referencia,
    'warning' AS severidade,
    'Tabela sem RLS habilitado' AS insight,
    'Habilite RLS com ALTER TABLE ... ENABLE ROW LEVEL SECURITY e crie políticas por empresa.' AS recomendacao,
    jsonb_build_object(
      'relrowsecurity', c.relrowsecurity,
      'estimated_rows', pg_total_relation_size(c.oid)
    ) AS detalhes
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = FALSE
    AND c.relname NOT LIKE 'pg_%';
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_auditoria_storage(p_empresa UUID DEFAULT NULL)
RETURNS TABLE (
  categoria TEXT,
  referencia TEXT,
  severidade TEXT,
  insight TEXT,
  recomendacao TEXT,
  detalhes JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'storage' AS categoria,
    format('%s/%s', so.bucket_id, so.name) AS referencia,
    'warning' AS severidade,
    'Objeto sem empresa associada no metadata (potencial órfão)' AS insight,
    'Atualize metadata->empresa_id e defina política RLS no bucket.' AS recomendacao,
    jsonb_build_object(
      'size', so.metadata->>'size',
      'last_accessed_at', so.last_accessed_at
    ) AS detalhes
  FROM storage.objects so
  WHERE (so.metadata->>'empresa_id') IS NULL
    AND (p_empresa IS NULL OR so.metadata->>'empresa_id' = p_empresa::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_auditoria_dados(p_empresa UUID DEFAULT NULL)
RETURNS TABLE (
  categoria TEXT,
  referencia TEXT,
  severidade TEXT,
  insight TEXT,
  recomendacao TEXT,
  detalhes JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH duplicated_tasks AS (
    SELECT
      query,
      COUNT(*) AS occurrences,
      jsonb_agg(id) AS task_ids
    FROM public.agent_tasks
    WHERE p_empresa IS NULL OR empresa_id = p_empresa
    GROUP BY query
    HAVING COUNT(*) > 1
  )
  SELECT
    'dados' AS categoria,
    dt.query AS referencia,
    'warning' AS severidade,
    'Consultas duplicadas encontradas em agent_tasks' AS insight,
    'Consolide tarefas repetidas ou ajuste a orquestração.' AS recomendacao,
    jsonb_build_object('task_ids', dt.task_ids, 'occurrences', dt.occurrences) AS detalhes
  FROM duplicated_tasks dt;

  RETURN QUERY
  SELECT
    'dados',
    'agent_reports' AS referencia,
    'info' AS severidade,
    'Relatórios sem link público configurado' AS insight,
    'Atualize report_url/pdfs armazenados no bucket reports.' AS recomendacao,
    jsonb_build_object('count', COUNT(*))
  FROM public.agent_reports
  WHERE report_url IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_auditoria_performance()
RETURNS TABLE (
  categoria TEXT,
  referencia TEXT,
  severidade TEXT,
  insight TEXT,
  recomendacao TEXT,
  detalhes JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'performance' AS categoria,
    format('%I.%I', schemaname, relname) AS referencia,
    'warning' AS severidade,
    'Seq Scan elevado observado' AS insight,
    'Avalie criação de índices ou revisão de filtros.' AS recomendacao,
    jsonb_build_object(
      'seq_scan', seq_scan,
      'idx_scan', idx_scan,
      'n_live_tup', n_live_tup
    ) AS detalhes
  FROM pg_stat_user_tables
  WHERE seq_scan > idx_scan * 2
  ORDER BY seq_scan DESC
  LIMIT 25;
END;
$$;

-- Função principal para registrar auditoria (utilizada pelo worker LangGraph)
DROP FUNCTION IF EXISTS public.fn_executar_auditoria(text, uuid, uuid);
CREATE OR REPLACE FUNCTION public.fn_executar_auditoria(
  p_scope TEXT DEFAULT 'full',
  p_empresa UUID DEFAULT NULL,
  p_user UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id UUID;
  v_total INTEGER := 0;
  v_rows INTEGER := 0;
BEGIN
  IF p_scope NOT IN ('schema', 'dados', 'storage', 'performance', 'full') THEN
    RAISE EXCEPTION 'Escopo inválido: %', p_scope;
  END IF;

  INSERT INTO public.audit_runs(scope, triggered_by, empresa_id)
  VALUES (p_scope, p_user, p_empresa)
  RETURNING run_id INTO v_run_id;

  IF p_scope IN ('schema', 'full') THEN
    INSERT INTO public.audit_insights(run_id, categoria, referencia, severidade, insight, recomendacao, detalhes)
    SELECT v_run_id, * FROM public.fn_auditoria_schema(p_empresa);
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    v_total := v_total + v_rows;
  END IF;

  IF p_scope IN ('dados', 'full') THEN
    INSERT INTO public.audit_insights(run_id, categoria, referencia, severidade, insight, recomendacao, detalhes)
    SELECT v_run_id, * FROM public.fn_auditoria_dados(p_empresa);
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    v_total := v_total + v_rows;
  END IF;

  IF p_scope IN ('storage', 'full') THEN
    INSERT INTO public.audit_insights(run_id, categoria, referencia, severidade, insight, recomendacao, detalhes)
    SELECT v_run_id, * FROM public.fn_auditoria_storage(p_empresa);
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    v_total := v_total + v_rows;
  END IF;

  IF p_scope IN ('performance', 'full') THEN
    INSERT INTO public.audit_insights(run_id, categoria, referencia, severidade, insight, recomendacao, detalhes)
    SELECT v_run_id, * FROM public.fn_auditoria_performance();
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    v_total := v_total + v_rows;
  END IF;

  UPDATE public.audit_runs
  SET status = 'completed',
      findings_count = v_total,
      completed_at = NOW()
  WHERE run_id = v_run_id;

  RETURN v_run_id;
EXCEPTION
  WHEN OTHERS THEN
    UPDATE public.audit_runs
    SET status = 'failed',
        summary = COALESCE(summary, '') || ' ' || SQLERRM
    WHERE run_id = v_run_id;
    RAISE;
END;
$$;

COMMENT ON FUNCTION public.fn_executar_auditoria IS
  'Executa auditoria automatizada (schema/dados/storage/performance) e registra os insights em audit_runs + audit_insights.';

COMMIT;

