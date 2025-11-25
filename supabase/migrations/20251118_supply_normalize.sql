-- ============================================
-- Migration: 20251118 - Supply Normalization (NULL → defaults)
-- ============================================

BEGIN;

-- =====================================================
-- 1. materiais_opme: normalizar campos string/numeric
-- =====================================================

UPDATE public.materiais_opme
SET
  descricao = COALESCE(descricao, ''),
  fabricante = COALESCE(fabricante, ''),
  categoria = COALESCE(categoria, ''),
  localizacao = COALESCE(localizacao, ''),
  lote = COALESCE(lote, ''),
  observacoes = COALESCE(observacoes, ''),
  registro_anvisa = COALESCE(registro_anvisa, ''),
  unidade_medida = COALESCE(unidade_medida, 'UN'),
  quantidade_estoque = COALESCE(quantidade_estoque, estoque_atual, 0),
  quantidade_minima = COALESCE(quantidade_minima, estoque_minimo, 0);

ALTER TABLE public.materiais_opme
  ALTER COLUMN descricao SET DEFAULT '',
  ALTER COLUMN fabricante SET DEFAULT '',
  ALTER COLUMN categoria SET DEFAULT '',
  ALTER COLUMN localizacao SET DEFAULT '',
  ALTER COLUMN lote SET DEFAULT '',
  ALTER COLUMN observacoes SET DEFAULT '',
  ALTER COLUMN registro_anvisa SET DEFAULT '',
  ALTER COLUMN quantidade_estoque SET DEFAULT 0,
  ALTER COLUMN quantidade_minima SET DEFAULT 0;

ALTER TABLE public.materiais_opme
  ALTER COLUMN descricao SET NOT NULL,
  ALTER COLUMN fabricante SET NOT NULL,
  ALTER COLUMN categoria SET NOT NULL,
  ALTER COLUMN localizacao SET NOT NULL,
  ALTER COLUMN lote SET NOT NULL,
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN registro_anvisa SET NOT NULL,
  ALTER COLUMN quantidade_estoque SET NOT NULL,
  ALTER COLUMN quantidade_minima SET NOT NULL;

-- =====================================================
-- 2. medicos: normalizar campos string
-- =====================================================

UPDATE public.medicos
SET
  email = COALESCE(email, ''),
  cep = COALESCE(cep, ''),
  endereco = COALESCE(endereco, ''),
  hospital_principal = COALESCE(hospital_principal, '');

ALTER TABLE public.medicos
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN cep SET DEFAULT '',
  ALTER COLUMN endereco SET DEFAULT '',
  ALTER COLUMN hospital_principal SET DEFAULT '';

ALTER TABLE public.medicos
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN cep SET NOT NULL,
  ALTER COLUMN endereco SET NOT NULL,
  ALTER COLUMN hospital_principal SET NOT NULL;

-- =====================================================
-- 3. pedidos_compra: garantir numero_pedido/status_en não nulos
-- =====================================================

UPDATE public.pedidos_compra
SET
  numero_pedido = COALESCE(numero_pedido, numero),
  status_en = COALESCE(status_en, 'rascunho'),
  desconto = COALESCE(desconto, 0),
  valor_frete = COALESCE(valor_frete, 0),
  created_at = COALESCE(created_at, criado_em, NOW()),
  updated_at = COALESCE(updated_at, atualizado_em, NOW());

ALTER TABLE public.pedidos_compra
  ALTER COLUMN numero_pedido SET DEFAULT 'N/A',
  ALTER COLUMN status_en SET DEFAULT 'rascunho',
  ALTER COLUMN desconto SET DEFAULT 0,
  ALTER COLUMN valor_frete SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.pedidos_compra
  ALTER COLUMN numero_pedido SET NOT NULL,
  ALTER COLUMN status_en SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

-- =====================================================
-- 4. transacoes: normalizar tipo/status/data
-- =====================================================

UPDATE public.transacoes
SET
  tipo = COALESCE(tipo, 'despesa'),
  status_en = COALESCE(status_en, 'pendente'),
  categoria = COALESCE(categoria, ''),
  descricao = COALESCE(descricao, ''),
  forma_pagamento = COALESCE(forma_pagamento, ''),
  observacoes = COALESCE(observacoes, ''),
  anexo_url = COALESCE(anexo_url, ''),
  data = COALESCE(data, data_pagamento::timestamptz, data_vencimento::timestamptz, NOW()),
  created_at = COALESCE(created_at, criado_em, NOW()),
  updated_at = COALESCE(updated_at, atualizado_em, NOW());

ALTER TABLE public.transacoes
  ALTER COLUMN tipo SET DEFAULT 'despesa',
  ALTER COLUMN status_en SET DEFAULT 'pendente',
  ALTER COLUMN categoria SET DEFAULT '',
  ALTER COLUMN descricao SET DEFAULT '',
  ALTER COLUMN forma_pagamento SET DEFAULT '',
  ALTER COLUMN observacoes SET DEFAULT '',
  ALTER COLUMN anexo_url SET DEFAULT '',
  ALTER COLUMN data SET DEFAULT NOW(),
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.transacoes
  ALTER COLUMN tipo SET NOT NULL,
  ALTER COLUMN status_en SET NOT NULL,
  ALTER COLUMN categoria SET NOT NULL,
  ALTER COLUMN descricao SET NOT NULL,
  ALTER COLUMN forma_pagamento SET NOT NULL,
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN anexo_url SET NOT NULL,
  ALTER COLUMN data SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

COMMIT;

