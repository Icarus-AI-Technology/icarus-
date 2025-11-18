-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 4/5)
-- MÓDULO PLUGGY (Integração Bancária) - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. PLUGGY_CONNECTIONS (conexões bancárias)
CREATE TABLE IF NOT EXISTS public.pluggy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  banco_id UUID REFERENCES public.bancos(id),
  pluggy_item_id TEXT NOT NULL UNIQUE,
  instituicao_nome TEXT NOT NULL,
  instituicao_tipo TEXT,
  status TEXT CHECK (status IN ('ativa', 'atualizando', 'erro', 'desconectada', 'expirada')) DEFAULT 'ativa',
  ultima_sincronizacao TIMESTAMPTZ,
  proxima_sincronizacao TIMESTAMPTZ,
  erro_mensagem TEXT,
  consentimento_expira_em TIMESTAMPTZ,
  webhook_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pluggy_connections_empresa ON public.pluggy_connections(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pluggy_connections_banco ON public.pluggy_connections(banco_id);
CREATE INDEX IF NOT EXISTS idx_pluggy_connections_pluggy_id ON public.pluggy_connections(pluggy_item_id);

-- 2. PLUGGY_ACCOUNTS (contas bancárias via Pluggy)
CREATE TABLE IF NOT EXISTS public.pluggy_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.pluggy_connections(id) ON DELETE CASCADE,
  banco_id UUID REFERENCES public.bancos(id),
  pluggy_account_id TEXT NOT NULL UNIQUE,
  tipo TEXT,
  subtipo TEXT,
  nome TEXT,
  numero TEXT,
  saldo DECIMAL(12, 2),
  moeda TEXT DEFAULT 'BRL',
  disponibilizado_em TIMESTAMPTZ,
  ultima_atualizacao TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pluggy_accounts_connection ON public.pluggy_accounts(connection_id);
CREATE INDEX IF NOT EXISTS idx_pluggy_accounts_banco ON public.pluggy_accounts(banco_id);
CREATE INDEX IF NOT EXISTS idx_pluggy_accounts_pluggy_id ON public.pluggy_accounts(pluggy_account_id);

-- 3. PLUGGY_TRANSACTIONS (transações bancárias)
CREATE TABLE IF NOT EXISTS public.pluggy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.pluggy_accounts(id) ON DELETE CASCADE,
  pluggy_transaction_id TEXT NOT NULL UNIQUE,
  data DATE NOT NULL,
  descricao TEXT,
  valor DECIMAL(12, 2) NOT NULL,
  tipo TEXT CHECK (tipo IN ('credito', 'debito')) NOT NULL,
  categoria TEXT,
  merchant TEXT,
  payment_method TEXT,
  saldo_apos DECIMAL(12, 2),
  provisionado BOOLEAN DEFAULT FALSE,
  metadata_json JSONB,
  sincronizado_fluxo_caixa BOOLEAN DEFAULT FALSE,
  fluxo_caixa_id UUID,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pluggy_transactions_account ON public.pluggy_transactions(account_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_pluggy_transactions_pluggy_id ON public.pluggy_transactions(pluggy_transaction_id);
CREATE INDEX IF NOT EXISTS idx_pluggy_transactions_data ON public.pluggy_transactions(data DESC);
CREATE INDEX IF NOT EXISTS idx_pluggy_transactions_sync ON public.pluggy_transactions(sincronizado_fluxo_caixa) WHERE NOT sincronizado_fluxo_caixa;

CREATE TRIGGER trg_pluggy_connections_updated BEFORE UPDATE ON public.pluggy_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_pluggy_accounts_updated BEFORE UPDATE ON public.pluggy_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.pluggy_connections IS 'Conexões bancárias via Pluggy';
COMMENT ON TABLE public.pluggy_accounts IS 'Contas bancárias sincronizadas';
COMMENT ON TABLE public.pluggy_transactions IS 'Transações bancárias importadas';

