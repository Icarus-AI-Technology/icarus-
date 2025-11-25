-- ============================================
-- 20251118 - Finance & Supply Enums Alignment
-- ============================================

BEGIN;

-- -------------------------------------------------
-- 1. Enum types (idempotent creation with DO block)
-- -------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.material_tipo_enum AS ENUM ('implante','instrumental','consumivel','dispositivo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.material_status_enum AS ENUM ('ativo','inativo','descontinuado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pedido_status_enum AS ENUM (
    'rascunho','enviado','aguardando','aprovado','em_transito','processando','entregue','cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pedido_status_en_enum AS ENUM (
    'draft','sent','pending','approved','in_transit','processing','delivered','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pedido_urgencia_enum AS ENUM ('normal','urgente','critico');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.transacao_tipo_enum AS ENUM ('receita','despesa');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.transacao_status_enum AS ENUM ('pendente','aprovada','paga','cancelada','vencido');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.transacao_status_en_enum AS ENUM ('pending','approved','paid','cancelled','overdue');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -------------------------------------------------
-- 2. Materiais: enforce enum usage
-- -------------------------------------------------

ALTER TABLE public.materiais_opme
  DROP CONSTRAINT IF EXISTS materiais_opme_status_check;

ALTER TABLE public.materiais_opme
  ALTER COLUMN tipo DROP DEFAULT,
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.materiais_opme
  ALTER COLUMN tipo TYPE public.material_tipo_enum USING LOWER(tipo)::public.material_tipo_enum,
  ALTER COLUMN status TYPE public.material_status_enum USING LOWER(status)::public.material_status_enum,
  ALTER COLUMN tipo SET DEFAULT 'consumivel',
  ALTER COLUMN status SET DEFAULT 'ativo',
  ALTER COLUMN tipo SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- -------------------------------------------------
-- 3. Pedidos de compra: enums + requisitos
-- -------------------------------------------------

DROP INDEX IF EXISTS public.idx_pedidos_urgencia;

-- Drop previous check constraints tied to TEXT columns
ALTER TABLE public.pedidos_compra
  DROP CONSTRAINT IF EXISTS pedidos_compra_status_check,
  DROP CONSTRAINT IF EXISTS pedidos_compra_urgencia_check;

-- Garantir valores compatíveis com os novos enums em inglês
UPDATE public.pedidos_compra
SET status_en = CASE status_en
  WHEN 'rascunho' THEN 'draft'
  WHEN 'enviado' THEN 'sent'
  WHEN 'aguardando' THEN 'pending'
  WHEN 'aprovado' THEN 'approved'
  WHEN 'em_transito' THEN 'in_transit'
  WHEN 'processando' THEN 'processing'
  WHEN 'entregue' THEN 'delivered'
  WHEN 'cancelado' THEN 'cancelled'
  ELSE 'draft'
END;

ALTER TABLE public.pedidos_compra
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status_en DROP DEFAULT,
  ALTER COLUMN urgencia DROP DEFAULT;

ALTER TABLE public.pedidos_compra
  ALTER COLUMN status TYPE public.pedido_status_enum USING status::public.pedido_status_enum,
  ALTER COLUMN status_en TYPE public.pedido_status_en_enum USING status_en::public.pedido_status_en_enum,
  ALTER COLUMN urgencia TYPE public.pedido_urgencia_enum USING urgencia::public.pedido_urgencia_enum,
  ALTER COLUMN fornecedor_id SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'rascunho',
  ALTER COLUMN status_en SET DEFAULT 'draft',
  ALTER COLUMN urgencia SET DEFAULT 'normal';

CREATE INDEX IF NOT EXISTS idx_pedidos_urgencia
  ON public.pedidos_compra (empresa_id, urgencia, status)
  WHERE excluido_em IS NULL
    AND status = ANY (ARRAY[
      'aguardando'::public.pedido_status_enum,
      'aprovado'::public.pedido_status_enum
    ]);

-- -------------------------------------------------
-- 4. Transações financeiras: enums consistentes
-- -------------------------------------------------

-- Infra de MVs depende das colunas abaixo → derruba temporariamente
DROP TRIGGER IF EXISTS trg_refresh_kpis_faturas ON public.faturas;
DROP TRIGGER IF EXISTS trg_refresh_kpis_cirurgias ON public.cirurgias;
DROP TRIGGER IF EXISTS trg_refresh_kpis_leads ON public.leads;
DROP TRIGGER IF EXISTS trg_refresh_kpis_transacoes ON public.transacoes;
DROP TRIGGER IF EXISTS trg_refresh_kpis_lotes ON public.lotes;

DROP FUNCTION IF EXISTS public.refresh_mv_kpis();

DROP MATERIALIZED VIEW IF EXISTS public.mv_kpis_empresa;
DROP MATERIALIZED VIEW IF EXISTS public.mv_cirurgias_kpis;
DROP VIEW IF EXISTS public.view_dashboard_financeiro;

DROP INDEX IF EXISTS public.idx_transacoes_vencidas;
DROP INDEX IF EXISTS public.idx_transacoes_vencimento;

ALTER TABLE public.transacoes
  DROP CONSTRAINT IF EXISTS transacoes_status_check,
  DROP CONSTRAINT IF EXISTS transacoes_tipo_check;

UPDATE public.transacoes
SET status = CASE status
  WHEN 'pago' THEN 'paga'
  ELSE status
END;

UPDATE public.transacoes
SET status_en = CASE status_en
  WHEN 'pago' THEN 'paid'
  WHEN 'pendente' THEN 'pending'
  ELSE status_en
END;

ALTER TABLE public.transacoes
  ALTER COLUMN tipo DROP DEFAULT,
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status_en DROP DEFAULT;

ALTER TABLE public.transacoes
  ALTER COLUMN tipo TYPE public.transacao_tipo_enum USING LOWER(tipo)::public.transacao_tipo_enum,
  ALTER COLUMN status TYPE public.transacao_status_enum USING status::public.transacao_status_enum,
  ALTER COLUMN status_en TYPE public.transacao_status_en_enum USING status_en::public.transacao_status_en_enum,
  ALTER COLUMN tipo SET DEFAULT 'despesa',
  ALTER COLUMN status SET DEFAULT 'pendente',
  ALTER COLUMN status_en SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_transacoes_vencidas
  ON public.transacoes (empresa_id, status)
  WHERE excluido_em IS NULL
    AND status = 'vencido'::public.transacao_status_enum;

CREATE INDEX IF NOT EXISTS idx_transacoes_vencimento
  ON public.transacoes (empresa_id, data_vencimento)
  WHERE excluido_em IS NULL
    AND status = 'pendente'::public.transacao_status_enum;

-- Recria MVs e infraestrutura de refresh (mesma definição de 20251020_mv_kpis_dashboard.sql)
CREATE MATERIALIZED VIEW public.mv_kpis_empresa AS
SELECT
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  COALESCE((
    SELECT SUM(f.valor_total)
    FROM faturas f
    WHERE f.empresa_id = e.id
      AND f.data_emissao >= date_trunc('month', CURRENT_DATE)
      AND f.status IN ('autorizada', 'paga')
      AND f.excluido_em IS NULL
  ), 0) AS faturamento_mensal,
  COALESCE((
    SELECT COUNT(*)
    FROM cirurgias c
    WHERE c.empresa_id = e.id
      AND c.status = 'agendada'
      AND c.data_cirurgia >= CURRENT_DATE
      AND c.excluido_em IS NULL
  ), 0) AS cirurgias_agendadas,
  CASE
    WHEN (
      SELECT COUNT(*)
      FROM leads l
      WHERE l.empresa_id = e.id
        AND l.criado_em >= CURRENT_DATE - INTERVAL '30 days'
        AND l.excluido_em IS NULL
    ) > 0
    THEN
      ROUND(
        (
          SELECT COUNT(*)::NUMERIC
          FROM leads l
          WHERE l.empresa_id = e.id
            AND l.estagio = 'fechamento'
            AND l.criado_em >= CURRENT_DATE - INTERVAL '30 days'
            AND l.excluido_em IS NULL
        ) * 100.0 / (
          SELECT COUNT(*)
          FROM leads l
          WHERE l.empresa_id = e.id
            AND l.criado_em >= CURRENT_DATE - INTERVAL '30 days'
            AND l.excluido_em IS NULL
        ),
        2
      )
    ELSE 0
  END AS taxa_conversao_crm,
  COALESCE((
    SELECT COUNT(DISTINCT l.produto_id)
    FROM lotes l
    JOIN produtos p ON p.id = l.produto_id
    WHERE p.empresa_id = e.id
      AND l.quantidade_disponivel < 10
      AND l.quantidade_disponivel > 0
      AND l.status = 'disponivel'
      AND l.excluido_em IS NULL
      AND p.excluido_em IS NULL
  ), 0) AS estoque_critico,
  COALESCE((
    SELECT SUM(t.valor)
    FROM transacoes t
    WHERE t.empresa_id = e.id
      AND t.tipo = 'receita'
      AND t.status = 'pendente'
      AND t.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      AND t.excluido_em IS NULL
  ), 0) AS contas_receber_vencendo,
  CASE
    WHEN (
      SELECT SUM(f.valor_total)
      FROM faturas f
      WHERE f.empresa_id = e.id
        AND f.data_emissao >= CURRENT_DATE - INTERVAL '30 days'
        AND f.status IN ('autorizada', 'paga')
        AND f.excluido_em IS NULL
    ) > 0
    THEN
      ROUND(
        (
          (
            SELECT SUM(f.valor_total - f.valor_desconto - f.valor_impostos)
            FROM faturas f
            WHERE f.empresa_id = e.id
              AND f.data_emissao >= CURRENT_DATE - INTERVAL '30 days'
              AND f.status IN ('autorizada', 'paga')
              AND f.excluido_em IS NULL
          ) * 100.0 / (
            SELECT SUM(f.valor_total)
            FROM faturas f
            WHERE f.empresa_id = e.id
              AND f.data_emissao >= CURRENT_DATE - INTERVAL '30 days'
              AND f.status IN ('autorizada', 'paga')
              AND f.excluido_em IS NULL
          )
        ),
        2
      )
    ELSE 0
  END AS margem_lucro,
  NOW() AS atualizado_em
FROM empresas e
WHERE e.excluido_em IS NULL;

CREATE UNIQUE INDEX idx_mv_kpis_empresa_id
  ON public.mv_kpis_empresa(empresa_id);

CREATE MATERIALIZED VIEW public.mv_cirurgias_kpis AS
SELECT
  empresa_id,
  COUNT(*) FILTER (WHERE criado_em >= CURRENT_DATE - INTERVAL '30 days') AS total_mes,
  COUNT(*) FILTER (WHERE status = 'agendada') AS agendadas,
  COUNT(*) FILTER (WHERE status = 'confirmada') AS confirmadas,
  COUNT(*) FILTER (WHERE status = 'concluida') AS concluidas,
  COUNT(*) FILTER (WHERE status = 'cancelada') AS canceladas,
  COUNT(*) FILTER (WHERE prioridade = 'urgente') AS urgentes,
  COUNT(*) FILTER (WHERE prioridade = 'alta') AS alta_prioridade,
  COALESCE(SUM(valor_estimado), 0) AS valor_estimado_total,
  NOW() AS atualizado_em
FROM cirurgias
WHERE excluido_em IS NULL
GROUP BY empresa_id;

CREATE UNIQUE INDEX idx_mv_cirurgias_kpis_empresa
  ON public.mv_cirurgias_kpis(empresa_id);

CREATE OR REPLACE FUNCTION public.refresh_mv_kpis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpis_empresa;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cirurgias_kpis;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_refresh_kpis_faturas
AFTER INSERT OR UPDATE OR DELETE ON public.faturas
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_mv_kpis();

CREATE TRIGGER trg_refresh_kpis_cirurgias
AFTER INSERT OR UPDATE OR DELETE ON public.cirurgias
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_mv_kpis();

CREATE TRIGGER trg_refresh_kpis_leads
AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_mv_kpis();

CREATE TRIGGER trg_refresh_kpis_transacoes
AFTER INSERT OR UPDATE OR DELETE ON public.transacoes
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_mv_kpis();

CREATE TRIGGER trg_refresh_kpis_lotes
AFTER INSERT OR UPDATE OR DELETE ON public.lotes
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_mv_kpis();

GRANT SELECT ON public.mv_kpis_empresa TO authenticated;
GRANT SELECT ON public.mv_cirurgias_kpis TO authenticated;

REFRESH MATERIALIZED VIEW public.mv_kpis_empresa;
REFRESH MATERIALIZED VIEW public.mv_cirurgias_kpis;

CREATE OR REPLACE VIEW public.view_dashboard_financeiro AS
SELECT 
  SUM(CASE WHEN tipo = 'receita' AND status = 'paga' THEN valor ELSE 0 END) AS receitas_recebidas,
  SUM(CASE WHEN tipo = 'despesa' AND status = 'paga' THEN valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN tipo = 'receita' AND status = 'pendente' THEN valor ELSE 0 END) AS receitas_pendentes,
  SUM(CASE WHEN tipo = 'despesa' AND status = 'pendente' THEN valor ELSE 0 END) AS despesas_pendentes
FROM transacoes
WHERE DATE_PART('month', data_vencimento) = DATE_PART('month', CURRENT_DATE);

COMMIT;

