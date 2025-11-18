-- Migration: 20251029_perf_indexes_general.sql
-- Objetivo: Índices gerais para performance (empresa_id, ativos, status) e FKs sem índice

-- 1) Índices gerais em todas as tabelas do schema public
DO $$
DECLARE
  t RECORD;
  v_has_empresa_id boolean;
  v_has_excluido_em boolean;
  v_has_status boolean;
  v_has_criado boolean;
BEGIN
  FOR t IN (
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  ) LOOP
    -- empresa_id
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t.tablename AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t.tablename AND column_name='excluido_em'
    ) INTO v_has_excluido_em;
    IF v_has_empresa_id THEN
      IF v_has_excluido_em THEN
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (empresa_id) WHERE excluido_em IS NULL',
                       'idx_'||t.tablename||'_empresa_ativos', t.tablename);
      ELSE
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (empresa_id)',
                       'idx_'||t.tablename||'_empresa', t.tablename);
      END IF;
    END IF;

    -- status
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t.tablename AND column_name='status'
    ) INTO v_has_status;
    IF v_has_status THEN
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (status)',
                     'idx_'||t.tablename||'_status', t.tablename);
    END IF;

    -- criado_em
    -- criado_em ou created_at (cria o que existir)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t.tablename AND column_name='criado_em'
    ) THEN
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (criado_em DESC)',
                     'idx_'||t.tablename||'_criado_em', t.tablename);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t.tablename AND column_name='created_at'
    ) THEN
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (created_at DESC)',
                     'idx_'||t.tablename||'_created_at', t.tablename);
    END IF;
  END LOOP;
END $$;

-- 2) Índices para FKs sem índice
DO $$
DECLARE
  r RECORD;
  v_idxname text;
BEGIN
  FOR r IN (
    SELECT
      n.nspname AS schemaname,
      c.relname AS tablename,
      a.attname AS colname
    FROM pg_constraint ct
    JOIN pg_class c ON c.oid = ct.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN unnest(ct.conkey) WITH ORDINALITY AS cols(attnum, ord) ON TRUE
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = cols.attnum
    WHERE ct.contype = 'f' AND n.nspname = 'public'
  ) LOOP
    v_idxname := 'idx_fk_'||r.tablename||'_'||r.colname;
    BEGIN
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I.%I (%I)', v_idxname, r.schemaname, r.tablename, r.colname);
    EXCEPTION WHEN OTHERS THEN
      -- Ignorar colunas não indexáveis
      NULL;
    END;
  END LOOP;
END $$;


