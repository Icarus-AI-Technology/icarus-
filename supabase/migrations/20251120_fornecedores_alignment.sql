-- ============================================
-- Migration: 20251120 - Fornecedores Alignment
-- ============================================

BEGIN;

DO $$ BEGIN
  CREATE TYPE public.fornecedor_origem_enum AS ENUM ('nacional','internacional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.fornecedor_segmento_enum AS ENUM ('fabricante','distribuidor','importador','prestador_servicos','servico_logistico','outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.fornecedor_status_enum AS ENUM ('ativo','inativo','suspenso','pendente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.fornecedores
  ADD COLUMN IF NOT EXISTS razao_social TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS tipo public.fornecedor_origem_enum DEFAULT 'nacional'::public.fornecedor_origem_enum NOT NULL,
  ADD COLUMN IF NOT EXISTS segmento public.fornecedor_segmento_enum DEFAULT 'distribuidor'::public.fornecedor_segmento_enum NOT NULL,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS endereco_json JSONB DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS dados_bancarios JSONB DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS certificacoes JSONB DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS contato_comercial JSONB DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS contato_financeiro JSONB DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS site TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS prazo_pagamento INTEGER DEFAULT 30 NOT NULL,
  ADD COLUMN IF NOT EXISTS condicoes_pagamento TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS prazo_entrega_medio INTEGER DEFAULT 7 NOT NULL,
  ADD COLUMN IF NOT EXISTS tempo_resposta_cotacao INTEGER DEFAULT 24 NOT NULL,
  ADD COLUMN IF NOT EXISTS pedido_minimo NUMERIC(14,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS horario_atendimento TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS aceita_consignacao BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS faz_entrega BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS raio_entrega INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS avaliacao_qualidade NUMERIC(5,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS avaliacao_pontualidade NUMERIC(5,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS avaliacao_atendimento NUMERIC(5,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS avaliacao_preco NUMERIC(5,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS banco TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS agencia TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS conta TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS pix TEXT DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

UPDATE public.fornecedores
SET
  razao_social = CASE
    WHEN COALESCE(razao_social, '') = '' THEN COALESCE(nome, CONCAT('Fornecedor ', RIGHT(id::text, 6)))
    ELSE razao_social
  END,
  nome_fantasia = CASE
    WHEN COALESCE(nome_fantasia, '') = '' THEN COALESCE(nome, razao_social)
    ELSE nome_fantasia
  END,
  nome = CASE
    WHEN COALESCE(nome, '') = '' THEN COALESCE(razao_social, 'Fornecedor sem nome')
    ELSE nome
  END,
  categoria = COALESCE(categoria, 'geral'),
  telefone = COALESCE(telefone, ''),
  email = COALESCE(email, ''),
  segmento = COALESCE(segmento, 'distribuidor'::public.fornecedor_segmento_enum),
  tipo = COALESCE(tipo, 'nacional'::public.fornecedor_origem_enum),
  observacoes = COALESCE(observacoes, ''),
  endereco_json = CASE
    WHEN endereco_json <> '{}'::jsonb THEN endereco_json
    WHEN endereco IS NULL OR btrim(endereco) = '' THEN '{}'::jsonb
    ELSE jsonb_build_object('rua', endereco)
  END,
  dados_bancarios = COALESCE(dados_bancarios, '{}'::jsonb),
  certificacoes = COALESCE(certificacoes, '{}'::jsonb),
  contato_comercial = COALESCE(contato_comercial, '{}'::jsonb),
  contato_financeiro = COALESCE(contato_financeiro, '{}'::jsonb),
  whatsapp = COALESCE(NULLIF(whatsapp, ''), telefone, ''),
  site = COALESCE(site, ''),
  inscricao_estadual = COALESCE(inscricao_estadual, ''),
  prazo_pagamento = COALESCE(prazo_pagamento, 30),
  condicoes_pagamento = COALESCE(condicoes_pagamento, ''),
  prazo_entrega_medio = COALESCE(prazo_entrega_medio, 7),
  tempo_resposta_cotacao = COALESCE(tempo_resposta_cotacao, 24),
  pedido_minimo = COALESCE(pedido_minimo, 0),
  horario_atendimento = COALESCE(horario_atendimento, '08:00-18:00'),
  aceita_consignacao = COALESCE(aceita_consignacao, FALSE),
  faz_entrega = COALESCE(faz_entrega, TRUE),
  raio_entrega = COALESCE(raio_entrega, 0),
  avaliacao_qualidade = COALESCE(avaliacao_qualidade, rating, 0),
  avaliacao_pontualidade = COALESCE(avaliacao_pontualidade, rating, 0),
  avaliacao_atendimento = COALESCE(avaliacao_atendimento, rating, 0),
  avaliacao_preco = COALESCE(avaliacao_preco, rating, 0),
  banco = COALESCE(banco, ''),
  agencia = COALESCE(agencia, ''),
  conta = COALESCE(conta, ''),
  pix = COALESCE(pix, ''),
  created_at = COALESCE(created_at, criado_em, NOW()),
  updated_at = COALESCE(updated_at, atualizado_em, NOW()),
  deleted_at = COALESCE(deleted_at, excluido_em);

ALTER TABLE public.fornecedores
  ALTER COLUMN nome SET DEFAULT 'Fornecedor sem nome',
  ALTER COLUMN nome SET NOT NULL,
  ALTER COLUMN categoria SET DEFAULT 'geral',
  ALTER COLUMN categoria SET NOT NULL,
  ALTER COLUMN telefone SET DEFAULT '',
  ALTER COLUMN telefone SET NOT NULL,
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa();

UPDATE public.fornecedores SET volume_compras = 0 WHERE volume_compras IS NULL;
ALTER TABLE public.fornecedores ALTER COLUMN volume_compras SET DEFAULT 0;

UPDATE public.fornecedores SET rating = 0 WHERE rating IS NULL;
ALTER TABLE public.fornecedores ALTER COLUMN rating SET DEFAULT 0;

ALTER TABLE public.fornecedores RENAME COLUMN endereco TO endereco_legacy;
ALTER TABLE public.fornecedores RENAME COLUMN endereco_json TO endereco;
ALTER TABLE public.fornecedores DROP COLUMN IF EXISTS endereco_legacy;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fornecedores_empresa_cnpj_unique
  ON public.fornecedores (empresa_id, cnpj)
  WHERE cnpj IS NOT NULL AND cnpj <> '';

CREATE INDEX IF NOT EXISTS idx_fornecedores_tipo ON public.fornecedores (tipo);
CREATE INDEX IF NOT EXISTS idx_fornecedores_segmento ON public.fornecedores (segmento);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON public.fornecedores (empresa_id, ativo);

CREATE OR REPLACE FUNCTION public.sync_fornecedores_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.razao_social IS NULL OR btrim(NEW.razao_social) = '' THEN
    NEW.razao_social := COALESCE(NULLIF(NEW.nome, ''), 'Fornecedor ' || RIGHT(NEW.id::text, 6));
  END IF;
  IF NEW.nome IS NULL OR btrim(NEW.nome) = '' THEN
    NEW.nome := NEW.razao_social;
  END IF;
  IF NEW.nome_fantasia IS NULL OR btrim(NEW.nome_fantasia) = '' THEN
    NEW.nome_fantasia := NEW.razao_social;
  END IF;
  IF NEW.tipo IS NULL THEN
    NEW.tipo := 'nacional';
  END IF;
  IF NEW.segmento IS NULL THEN
    NEW.segmento := 'distribuidor';
  END IF;
  IF NEW.endereco IS NULL THEN
    NEW.endereco := '{}'::jsonb;
  END IF;
  IF NEW.dados_bancarios IS NULL THEN
    NEW.dados_bancarios := '{}'::jsonb;
  END IF;
  IF NEW.certificacoes IS NULL THEN
    NEW.certificacoes := '{}'::jsonb;
  END IF;
  IF NEW.contato_comercial IS NULL THEN
    NEW.contato_comercial := '{}'::jsonb;
  END IF;
  IF NEW.contato_financeiro IS NULL THEN
    NEW.contato_financeiro := '{}'::jsonb;
  END IF;
  IF NEW.whatsapp IS NULL OR NEW.whatsapp = '' THEN
    NEW.whatsapp := COALESCE(NEW.telefone, '');
  END IF;
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NEW.created_at;
  END IF;
  IF NEW.criado_em IS NULL OR NEW.criado_em <> NEW.created_at THEN
    NEW.criado_em := NEW.created_at;
  END IF;
  IF NEW.atualizado_em IS NULL OR NEW.atualizado_em <> NEW.updated_at THEN
    NEW.atualizado_em := NEW.updated_at;
  END IF;
  IF NEW.deleted_at IS NULL THEN
    NEW.excluido_em := NULL;
  ELSE
    NEW.excluido_em := NEW.deleted_at;
  END IF;
  IF NEW.status IS NULL THEN
    NEW.status := CASE WHEN COALESCE(NEW.ativo, TRUE) THEN 'ativo' ELSE 'inativo' END;
  ELSE
    NEW.ativo := LOWER(NEW.status) = 'ativo';
  END IF;
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_fornecedores_alias ON public.fornecedores;
CREATE TRIGGER trg_sync_fornecedores_alias
  BEFORE INSERT OR UPDATE ON public.fornecedores
  FOR EACH ROW EXECUTE FUNCTION public.sync_fornecedores_alias_columns();

GRANT SELECT ON public.fornecedores TO authenticated;

COMMIT;
