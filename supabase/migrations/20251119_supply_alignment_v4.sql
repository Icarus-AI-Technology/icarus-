-- ============================================
-- Migration: 20251119 - Supply Alignment v4
-- Objetivo: eliminar nullables em Materiais, Médicos e Pedidos
-- ============================================

BEGIN;

-- =====================================================
-- 1. Materiais OPME - validade obrigatória
-- =====================================================
UPDATE public.materiais_opme
SET validade = CURRENT_DATE
WHERE validade IS NULL;

ALTER TABLE public.materiais_opme
  ALTER COLUMN validade SET DEFAULT CURRENT_DATE,
  ALTER COLUMN validade SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_materiais_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quantidade_estoque IS NULL THEN
    NEW.quantidade_estoque := COALESCE(NEW.estoque_atual, 0);
  END IF;
  IF NEW.estoque_atual IS NULL THEN
    NEW.estoque_atual := NEW.quantidade_estoque;
  END IF;

  IF NEW.quantidade_minima IS NULL THEN
    NEW.quantidade_minima := COALESCE(NEW.estoque_minimo, 0);
  END IF;
  IF NEW.estoque_minimo IS NULL THEN
    NEW.estoque_minimo := NEW.quantidade_minima;
  END IF;

  IF NEW.tipo IS NULL THEN
    NEW.tipo := COALESCE(NEW.categoria, 'consumivel');
  END IF;

  IF NEW.validade IS NULL THEN
    NEW.validade := CURRENT_DATE;
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- 2. Médicos - status enum + defaults
-- =====================================================
DO $$
BEGIN
  CREATE TYPE public.medico_status_enum AS ENUM ('ativo','inativo','suspenso');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP VIEW IF EXISTS public.view_medicos_stats;

UPDATE public.medicos
SET status = CASE
  WHEN status IS NULL OR status::text = '' THEN 'ativo'
  WHEN LOWER(status::text) IN ('ativo','inativo','suspenso') THEN LOWER(status::text)
  ELSE 'ativo'
END;

ALTER TABLE public.medicos
  DROP CONSTRAINT IF EXISTS medicos_status_check,
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.medicos
  ALTER COLUMN status TYPE public.medico_status_enum USING (
    CASE
      WHEN status IS NULL OR status::text = '' THEN 'ativo'
      WHEN LOWER(status::text) IN ('ativo','inativo','suspenso') THEN LOWER(status::text)
      ELSE 'ativo'
    END
  )::public.medico_status_enum,
  ALTER COLUMN status SET DEFAULT 'ativo',
  ALTER COLUMN status SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_medicos_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := COALESCE(NEW.criado_em, NOW());
  END IF;
  IF NEW.criado_em IS NULL THEN
    NEW.criado_em := NEW.created_at;
  END IF;

  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;
  NEW.atualizado_em := NEW.updated_at;

  IF NEW.telefone IS NULL THEN
    NEW.telefone := '';
  END IF;

  IF NEW.status IS NULL THEN
    NEW.status := 'ativo';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE VIEW public.view_medicos_stats AS
SELECT
  m.id,
  m.nome,
  m.especialidade,
  COUNT(c.id) AS total_cirurgias,
  AVG(c.valor_estimado) AS ticket_medio,
  SUM(c.valor_estimado) AS faturamento_total
FROM public.medicos m
LEFT JOIN public.cirurgias c ON m.id = c.medico_id
WHERE m.status = 'ativo'::public.medico_status_enum
GROUP BY m.id, m.nome, m.especialidade;

-- =====================================================
-- 3. Pedidos de Compra - datas & empresa defaults
-- =====================================================
UPDATE public.pedidos_compra
SET data_entrega_prevista = COALESCE(data_entrega_real, data_pedido, CURRENT_DATE)
WHERE data_entrega_prevista IS NULL;

ALTER TABLE public.pedidos_compra
  ALTER COLUMN data_entrega_prevista SET DEFAULT CURRENT_DATE,
  ALTER COLUMN data_entrega_prevista SET NOT NULL,
  ALTER COLUMN empresa_id SET DEFAULT current_empresa();

CREATE OR REPLACE FUNCTION public.sync_pedidos_compra_alias()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.numero_pedido IS NULL THEN
    NEW.numero_pedido := NEW.numero;
  END IF;
  IF NEW.numero IS NULL THEN
    NEW.numero := NEW.numero_pedido;
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := COALESCE(NEW.criado_em, NOW());
  END IF;
  IF NEW.criado_em IS NULL THEN
    NEW.criado_em := NEW.created_at;
  END IF;

  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;
  NEW.atualizado_em := NEW.updated_at;

  IF NEW.desconto IS NULL THEN
    NEW.desconto := 0;
  END IF;
  IF NEW.valor_frete IS NULL THEN
    NEW.valor_frete := 0;
  END IF;

  IF NEW.status_en IS NULL THEN
    NEW.status_en := 'rascunho';
  END IF;

  IF NEW.status_en = 'rascunho' THEN
    NEW.status := 'rascunho';
  ELSIF NEW.status_en = 'enviado' THEN
    NEW.status := 'aguardando';
  ELSIF NEW.status_en = 'aprovado' THEN
    NEW.status := 'aprovado';
  ELSIF NEW.status_en = 'em_transito' THEN
    NEW.status := 'processando';
  ELSIF NEW.status_en = 'entregue' THEN
    NEW.status := 'entregue';
  ELSIF NEW.status_en = 'cancelado' THEN
    NEW.status := 'cancelado';
  END IF;

  IF NEW.data_entrega_prevista IS NULL THEN
    NEW.data_entrega_prevista := COALESCE(NEW.data_entrega_real, NEW.data_pedido, CURRENT_DATE);
  END IF;

  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := current_empresa();
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;
