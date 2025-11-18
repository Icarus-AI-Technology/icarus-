-- ============================================
-- Migration: 20251118 - Finance Alignment (Pedidos & Transações)
-- ============================================

BEGIN;

-- =====================================================
-- 1. pedidos_compra aliases
-- =====================================================
ALTER TABLE public.pedidos_compra
  ADD COLUMN IF NOT EXISTS numero_pedido TEXT,
  ADD COLUMN IF NOT EXISTS status_en TEXT DEFAULT 'rascunho',
  ADD COLUMN IF NOT EXISTS desconto NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_frete NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_entrega_real DATE,
  ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES public.usuarios(id),
  ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.pedidos_compra
SET
  numero_pedido = COALESCE(numero_pedido, numero),
  status_en = COALESCE(status_en,
    CASE status
      WHEN 'rascunho' THEN 'rascunho'
      WHEN 'aguardando' THEN 'enviado'
      WHEN 'aprovado' THEN 'aprovado'
      WHEN 'processando' THEN 'em_transito'
      WHEN 'entregue' THEN 'entregue'
      WHEN 'cancelado' THEN 'cancelado'
      ELSE 'rascunho'
    END),
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em),
  desconto = COALESCE(desconto, 0),
  valor_frete = COALESCE(valor_frete, 0);

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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pedidos_compra_alias ON public.pedidos_compra;
CREATE TRIGGER trg_sync_pedidos_compra_alias
  BEFORE INSERT OR UPDATE ON public.pedidos_compra
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_pedidos_compra_alias();

-- =====================================================
-- 2. transacoes aliases
-- =====================================================
ALTER TABLE public.transacoes
  ADD COLUMN IF NOT EXISTS data TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_en TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS anexo_url TEXT,
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitais(id),
  ADD COLUMN IF NOT EXISTS cirurgia_id UUID REFERENCES public.cirurgias(id),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.transacoes
SET
  data = COALESCE(data, data_pagamento::timestamptz, data_vencimento::timestamptz),
  status_en = COALESCE(status_en,
    CASE status
      WHEN 'pago' THEN 'paga'
      WHEN 'cancelado' THEN 'cancelada'
      WHEN 'pendente' THEN 'pendente'
      WHEN 'vencido' THEN 'pendente'
      ELSE 'pendente'
    END),
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em);

ALTER TABLE public.transacoes
  DROP CONSTRAINT IF EXISTS transacoes_status_check;

ALTER TABLE public.transacoes
  ADD CONSTRAINT transacoes_status_check CHECK (
    status = ANY (ARRAY['pendente','pago','vencido','cancelado'])
  );

CREATE OR REPLACE FUNCTION public.sync_transacoes_alias()
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

  IF NEW.data IS NULL THEN
    NEW.data := COALESCE(NEW.data_pagamento::timestamptz, NEW.data_vencimento::timestamptz, NOW());
  END IF;

  IF NEW.data_pagamento IS NULL AND NEW.data IS NOT NULL THEN
    NEW.data_pagamento := NEW.data::date;
  END IF;

  IF NEW.status_en IS NULL THEN
    NEW.status_en := 'pendente';
  END IF;

  IF NEW.status_en = 'paga' THEN
    NEW.status := 'pago';
  ELSIF NEW.status_en = 'cancelada' THEN
    NEW.status := 'cancelado';
  ELSIF NEW.status_en = 'pendente' THEN
    NEW.status := 'pendente';
  ELSIF NEW.status_en = 'aprovada' THEN
    NEW.status := 'pendente';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_transacoes_alias ON public.transacoes;
CREATE TRIGGER trg_sync_transacoes_alias
  BEFORE INSERT OR UPDATE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_transacoes_alias();

COMMIT;
-- ============================================
-- Migration: 20251118 - Finance Alignment
-- Objetivo: alinhar tabelas Financeiro/Compras com os hooks do frontend
-- ============================================

BEGIN;

-- =====================================================
-- 1. Pedidos de Compra
-- =====================================================
ALTER TABLE public.pedidos_compra
  ADD COLUMN IF NOT EXISTS numero_pedido TEXT,
  ADD COLUMN IF NOT EXISTS valor_frete NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aprovado_por UUID,
  ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_en TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.pedidos_compra
SET
  numero_pedido = COALESCE(numero_pedido, numero),
  status_en = COALESCE(status_en, status),
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em);

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

  IF NEW.status_en IS NULL THEN
    NEW.status_en := NEW.status;
  END IF;

  IF NEW.status_en = 'aprovada' THEN
    NEW.status := 'aprovado';
  ELSIF NEW.status_en = 'enviado' THEN
    NEW.status := 'processando';
  ELSIF NEW.status_en = 'entregue' THEN
    NEW.status := 'entregue';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pedidos_compra_alias ON public.pedidos_compra;
CREATE TRIGGER trg_sync_pedidos_compra_alias
  BEFORE INSERT OR UPDATE ON public.pedidos_compra
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_pedidos_compra_alias();

-- =====================================================
-- 2. Contas a Receber
-- =====================================================
ALTER TABLE public.contas_receber
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cliente_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS valor_liquido NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS tipo_receita TEXT,
  ADD COLUMN IF NOT EXISTS banco_recebimento TEXT,
  ADD COLUMN IF NOT EXISTS comprovante_url TEXT,
  ADD COLUMN IF NOT EXISTS historico_pagamentos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS score_inadimplencia NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS risco_inadimplencia TEXT,
  ADD COLUMN IF NOT EXISTS dias_atraso INTEGER;

UPDATE public.contas_receber
SET
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em),
  valor_liquido = COALESCE(valor_liquido, valor_saldo),
  tipo_receita = COALESCE(tipo_receita, tipo),
  banco_recebimento = COALESCE(banco_recebimento, ''),
  historico_pagamentos = COALESCE(historico_pagamentos, '[]'::jsonb),
  score_inadimplencia = COALESCE(score_inadimplencia, 0),
  risco_inadimplencia = COALESCE(risco_inadimplencia, 'baixo'),
  dias_atraso = COALESCE(dias_atraso, 0);

CREATE OR REPLACE FUNCTION public.sync_contas_receber_alias()
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

  IF NEW.valor_liquido IS NULL THEN
    NEW.valor_liquido := COALESCE(NEW.valor_saldo, NEW.valor_original);
  END IF;

  IF NEW.tipo_receita IS NULL THEN
    NEW.tipo_receita := COALESCE(NEW.tipo, 'venda');
  END IF;

  IF NEW.historico_pagamentos IS NULL THEN
    NEW.historico_pagamentos := '[]'::jsonb;
  END IF;

  IF NEW.score_inadimplencia IS NULL THEN
    NEW.score_inadimplencia := 0;
  END IF;

  IF NEW.risco_inadimplencia IS NULL THEN
    NEW.risco_inadimplencia := 'baixo';
  END IF;

  IF NEW.dias_atraso IS NULL THEN
    NEW.dias_atraso := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_contas_receber_alias ON public.contas_receber;
CREATE TRIGGER trg_sync_contas_receber_alias
  BEFORE INSERT OR UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_contas_receber_alias();

-- =====================================================
-- 3. Contas a Pagar
-- =====================================================
ALTER TABLE public.contas_pagar
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS fornecedor_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS valor_liquido NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS tipo_despesa TEXT,
  ADD COLUMN IF NOT EXISTS centro_custo_nome TEXT,
  ADD COLUMN IF NOT EXISTS requer_aprovacao BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS aprovacao_nivel1 JSONB,
  ADD COLUMN IF NOT EXISTS aprovacao_nivel2 JSONB,
  ADD COLUMN IF NOT EXISTS aprovacao_nivel3 JSONB,
  ADD COLUMN IF NOT EXISTS banco_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS comprovante_url TEXT,
  ADD COLUMN IF NOT EXISTS data_agendamento DATE,
  ADD COLUMN IF NOT EXISTS historico_pagamentos JSONB DEFAULT '[]'::jsonb;

UPDATE public.contas_pagar
SET
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em),
  valor_liquido = COALESCE(valor_liquido, valor_saldo),
  tipo_despesa = COALESCE(tipo_despesa, tipo),
  centro_custo_nome = COALESCE(centro_custo_nome, ''),
  historico_pagamentos = COALESCE(historico_pagamentos, '[]'::jsonb);

CREATE OR REPLACE FUNCTION public.sync_contas_pagar_alias()
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

  IF NEW.valor_liquido IS NULL THEN
    NEW.valor_liquido := COALESCE(NEW.valor_saldo, NEW.valor_original);
  END IF;

  IF NEW.tipo_despesa IS NULL THEN
    NEW.tipo_despesa := COALESCE(NEW.tipo, 'fornecedor');
  END IF;

  IF NEW.historico_pagamentos IS NULL THEN
    NEW.historico_pagamentos := '[]'::jsonb;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_contas_pagar_alias ON public.contas_pagar;
CREATE TRIGGER trg_sync_contas_pagar_alias
  BEFORE INSERT OR UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_contas_pagar_alias();

-- =====================================================
-- 4. Transações
-- =====================================================
ALTER TABLE public.transacoes
  ADD COLUMN IF NOT EXISTS data DATE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status_en TEXT,
  ADD COLUMN IF NOT EXISTS hospital_id UUID,
  ADD COLUMN IF NOT EXISTS cirurgia_id UUID,
  ADD COLUMN IF NOT EXISTS anexo_url TEXT;

UPDATE public.transacoes
SET
  data = COALESCE(data, data_vencimento),
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em),
  status_en = COALESCE(status_en, status);

CREATE OR REPLACE FUNCTION public.sync_transacoes_alias()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.data IS NULL THEN
    NEW.data := COALESCE(NEW.data_vencimento, CURRENT_DATE);
  END IF;
  IF NEW.data_vencimento IS NULL THEN
    NEW.data_vencimento := NEW.data;
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

  IF NEW.status_en IS NULL THEN
    NEW.status_en := NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_transacoes_alias ON public.transacoes;
CREATE TRIGGER trg_sync_transacoes_alias
  BEFORE INSERT OR UPDATE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_transacoes_alias();

-- =====================================================
-- 5. Views/RPC utilitárias
-- =====================================================
CREATE OR REPLACE VIEW public.vw_active_sessions AS
SELECT
  us.id,
  us.usuario_id,
  us.session_token,
  us.ip_address,
  us.user_agent,
  us.dispositivo,
  us.navegador,
  us.inicio_em,
  us.termino_em
FROM public.user_sessions us
WHERE us.termino_em IS NULL OR us.termino_em > NOW();

CREATE OR REPLACE FUNCTION public.set_config(setting TEXT, value TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_catalog.set_config(setting, value, false);
  RETURN TRUE;
EXCEPTION WHEN others THEN
  RETURN FALSE;
END;
$$;

COMMIT;

