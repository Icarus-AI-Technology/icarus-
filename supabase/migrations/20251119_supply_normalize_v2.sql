-- ============================================
-- Migration: 20251119 - Supply/Compras Normalize v2
-- Objetivo: eliminar NULLs em campos exigidos pelos hooks
-- ============================================

BEGIN;

-- -------------------------------------------------
-- 0. Fornecedor placeholder para materiais sem vínculo
-- -------------------------------------------------
INSERT INTO public.fornecedores (
  id,
  empresa_id,
  nome,
  cnpj,
  email,
  telefone,
  endereco,
  categoria,
  status
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Fornecedor Padrão Icarus',
  '19131243000197',
  'fornecedor.padrao@icarus.com',
  '',
  '',
  'padrao',
  'ativo'
WHERE NOT EXISTS (
  SELECT 1 FROM public.fornecedores WHERE id = '00000000-0000-0000-0000-000000000000'
);

-- -------------------------------------------------
-- 1. Materiais OPME - garantir valores obrigatórios
-- -------------------------------------------------
UPDATE public.materiais_opme
SET fornecedor_id = '00000000-0000-0000-0000-000000000000'::uuid
WHERE fornecedor_id IS NULL;

UPDATE public.materiais_opme
SET valor_unitario = COALESCE(valor_unitario, 0),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.materiais_opme
  ALTER COLUMN fornecedor_id SET NOT NULL,
  ALTER COLUMN valor_unitario SET DEFAULT 0,
  ALTER COLUMN valor_unitario SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

-- Atualizar trigger de sincronização para assegurar fornecedor_id
CREATE OR REPLACE FUNCTION public.sync_materiais_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_default_fornecedor UUID := '00000000-0000-0000-0000-000000000000';
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

  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;

  IF NEW.fornecedor_id IS NULL THEN
    NEW.fornecedor_id := v_default_fornecedor;
  END IF;

  RETURN NEW;
END;
$$;

-- -------------------------------------------------
-- 2. Médicos - valores numéricos obrigatórios
-- -------------------------------------------------
UPDATE public.medicos
SET volume_anual_estimado = COALESCE(volume_anual_estimado, 0),
    taxa_sucesso = COALESCE(taxa_sucesso, 0),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.medicos
  ALTER COLUMN volume_anual_estimado SET DEFAULT 0,
  ALTER COLUMN volume_anual_estimado SET NOT NULL,
  ALTER COLUMN taxa_sucesso SET DEFAULT 0,
  ALTER COLUMN taxa_sucesso SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

-- -------------------------------------------------
-- 3. Pedidos de compra - data_pedido obrigatória
-- -------------------------------------------------
UPDATE public.pedidos_compra
SET data_pedido = COALESCE(data_pedido, CURRENT_DATE);

ALTER TABLE public.pedidos_compra
  ALTER COLUMN data_pedido SET DEFAULT CURRENT_DATE,
  ALTER COLUMN data_pedido SET NOT NULL;

COMMIT;

