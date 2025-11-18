-- Migration: 2025-10-28 audit + sanity adjustments
-- Captures schema and function changes performed via MCP Supabase

-- Buckets provisioned manually (documentos-dpo, notas-fiscais, imagens-produtos, relatorios, certificados, avatares)
-- Use storage API or scripts/supabase/storage_fix.ts to ensure idempotence.

-- Table: consignacao_materiais
CREATE TABLE IF NOT EXISTS public.consignacao_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remessa_consignacao_id UUID NOT NULL REFERENCES public.remessas_consignacao(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  quantidade NUMERIC(12,2) NOT NULL CHECK (quantidade > 0),
  valor_unitario NUMERIC(12,2) NOT NULL CHECK (valor_unitario >= 0),
  valor_total NUMERIC(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  status TEXT DEFAULT 'reservado',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: metricas_dashboard
CREATE TABLE IF NOT EXISTS public.metricas_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origem TEXT NOT NULL,
  data_referencia DATE NOT NULL,
  valor NUMERIC NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function: get_dashboard_kpis
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS TABLE (kpi text, media_valor numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT md.origem AS kpi, AVG(md.valor) AS media_valor
  FROM public.metricas_dashboard md
  WHERE md.data_referencia >= NOW() - INTERVAL '30 days'
  GROUP BY md.origem;
END;
$$;

-- Function: calcular_score_global_abbott
CREATE OR REPLACE FUNCTION public.calcular_score_global_abbott()
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_score numeric;
BEGIN
  SELECT AVG(valor)
  INTO v_score
  FROM public.metricas_dashboard
  WHERE origem = 'abbott' AND data_referencia >= NOW() - INTERVAL '30 days';

  RETURN COALESCE(v_score, 0);
END;
$$;

-- Function: atualizar_metricas_consignacao
CREATE OR REPLACE FUNCTION public.atualizar_metricas_consignacao()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.remessas_consignacao rc
  SET
    valor_total = COALESCE(sub.valor_total, 0),
    atualizado_em = NOW()
  FROM (
    SELECT remessa_consignacao_id,
           SUM(valor_total) AS valor_total
    FROM public.itens_consignacao
    GROUP BY remessa_consignacao_id
  ) sub
  WHERE rc.id = sub.remessa_consignacao_id;
END;
$$;

-- Function: compute_audit_hash
CREATE OR REPLACE FUNCTION public.compute_audit_hash(
  p_empresa_id uuid,
  p_usuario_id uuid,
  p_tabela text,
  p_registro_id uuid,
  p_acao text,
  p_dados_antes jsonb,
  p_dados_depois jsonb,
  p_salt text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_payload bytea;
BEGIN
  v_payload := convert_to(
    concat_ws('|',
      coalesce(p_empresa_id::text, ''),
      coalesce(p_usuario_id::text, ''),
      coalesce(p_tabela, ''),
      coalesce(p_registro_id::text, ''),
      coalesce(p_acao, ''),
      coalesce(p_dados_antes::text, ''),
      coalesce(p_dados_depois::text, ''),
      coalesce(p_salt, '')
    ),
    'UTF8'
  );

  RETURN encode(extensions.digest(v_payload, 'sha256'), 'hex');
END;
$$;

-- Grants for search_integrations schema (service role sanity CRUD)
GRANT USAGE ON SCHEMA search_integrations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA search_integrations TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA search_integrations TO service_role;
