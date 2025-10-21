/**
 * 🔌 PLUGGY — MIGRATIONS SUPABASE
 * 
 * Migrações para criar todas as tabelas necessárias para cache e auditoria
 * dos dados da integração Pluggy (Open Finance Brasil)
 */

-- ============================================
-- TABELA: pluggy_connect_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_connect_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_pluggy_tokens_user (user_id),
  INDEX idx_pluggy_tokens_expires (expires_at)
);

COMMENT ON TABLE pluggy_connect_tokens IS 'Tokens de conexão do Pluggy Connect Widget';

-- ============================================
-- TABELA: pluggy_items
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  connector_id INTEGER NOT NULL,
  connector_name TEXT NOT NULL,
  connector_image_url TEXT,
  status TEXT NOT NULL, -- UPDATED, UPDATING, LOGIN_ERROR, etc.
  error_code TEXT,
  error_message TEXT,
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_pluggy_items_user (user_id),
  INDEX idx_pluggy_items_status (status),
  INDEX idx_pluggy_items_connector (connector_id)
);

COMMENT ON TABLE pluggy_items IS 'Conexões bancárias (items) do usuário via Pluggy';

-- ============================================
-- TABELA: pluggy_accounts
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id TEXT UNIQUE NOT NULL,
  item_id TEXT NOT NULL REFERENCES pluggy_items(item_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- BANK, CREDIT
  subtype TEXT NOT NULL, -- CHECKING_ACCOUNT, SAVINGS_ACCOUNT, CREDIT_CARD
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  marketing_name TEXT,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  available_balance DECIMAL(15, 2),
  currency_code TEXT NOT NULL DEFAULT 'BRL',
  bank_data JSONB,
  credit_data JSONB,
  owner TEXT,
  tax_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_pluggy_accounts_item (item_id),
  INDEX idx_pluggy_accounts_type (type),
  INDEX idx_pluggy_accounts_balance (balance)
);

COMMENT ON TABLE pluggy_accounts IS 'Contas bancárias e cartões de crédito conectados via Pluggy';

-- ============================================
-- TABELA: pluggy_transactions
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT UNIQUE NOT NULL,
  account_id TEXT NOT NULL REFERENCES pluggy_accounts(account_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  description_raw TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  balance DECIMAL(15, 2),
  currency_code TEXT NOT NULL DEFAULT 'BRL',
  provider_code TEXT,
  type TEXT NOT NULL, -- DEBIT, CREDIT
  status TEXT NOT NULL, -- PENDING, POSTED
  category TEXT,
  merchant JSONB,
  payment_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_pluggy_transactions_account (account_id),
  INDEX idx_pluggy_transactions_date (date),
  INDEX idx_pluggy_transactions_type (type),
  INDEX idx_pluggy_transactions_category (category),
  INDEX idx_pluggy_transactions_amount (amount)
);

COMMENT ON TABLE pluggy_transactions IS 'Transações bancárias sincronizadas via Pluggy';

-- ============================================
-- TABELA: pluggy_payments
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  recipient JSONB NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL, -- PENDING, SCHEDULED, APPROVED, REJECTED, CANCELLED
  scheduled_date DATE,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_pluggy_payments_user (user_id),
  INDEX idx_pluggy_payments_status (status),
  INDEX idx_pluggy_payments_date (scheduled_date),
  INDEX idx_pluggy_payments_amount (amount)
);

COMMENT ON TABLE pluggy_payments IS 'Pagamentos PIX via Pluggy';

-- ============================================
-- TABELA: pluggy_investments
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investment_id TEXT UNIQUE NOT NULL,
  item_id TEXT NOT NULL REFERENCES pluggy_items(item_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- MUTUAL_FUND, SECURITY, EQUITY, FIXED_INCOME, PENSION
  number TEXT,
  balance DECIMAL(15, 2) NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  issuer TEXT,
  isin TEXT,
  rate DECIMAL(10, 4),
  amount DECIMAL(15, 2),
  amount_profit DECIMAL(15, 2),
  amount_withdrawal DECIMAL(15, 2),
  due_date DATE,
  issue_date DATE,
  purchase_date DATE,
  currency_code TEXT NOT NULL DEFAULT 'BRL',
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_pluggy_investments_item (item_id),
  INDEX idx_pluggy_investments_type (type),
  INDEX idx_pluggy_investments_balance (balance)
);

COMMENT ON TABLE pluggy_investments IS 'Investimentos sincronizados via Pluggy';

-- ============================================
-- TABELA: pluggy_webhooks
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id TEXT NOT NULL,
  event TEXT NOT NULL, -- item/created, item/updated, payment/approved, etc.
  data JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_pluggy_webhooks_event (event),
  INDEX idx_pluggy_webhooks_processed (processed),
  INDEX idx_pluggy_webhooks_created (created_at)
);

COMMENT ON TABLE pluggy_webhooks IS 'Log de webhooks recebidos da Pluggy';

-- ============================================
-- TABELA: pluggy_sync_log
-- ============================================
CREATE TABLE IF NOT EXISTS pluggy_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- accounts, transactions, investments
  status TEXT NOT NULL, -- success, error
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Índices
  INDEX idx_pluggy_sync_item (item_id),
  INDEX idx_pluggy_sync_type (sync_type),
  INDEX idx_pluggy_sync_status (status),
  INDEX idx_pluggy_sync_started (started_at)
);

COMMENT ON TABLE pluggy_sync_log IS 'Log de sincronizações com a Pluggy API';

-- ============================================
-- TRIGGERS: updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pluggy_items_updated_at
  BEFORE UPDATE ON pluggy_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER pluggy_accounts_updated_at
  BEFORE UPDATE ON pluggy_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER pluggy_payments_updated_at
  BEFORE UPDATE ON pluggy_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER pluggy_investments_updated_at
  BEFORE UPDATE ON pluggy_investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS
ALTER TABLE pluggy_connect_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pluggy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pluggy_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pluggy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pluggy_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pluggy_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pluggy_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pluggy_sync_log ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuários só podem ver seus próprios dados
CREATE POLICY "Users can view own pluggy tokens"
  ON pluggy_connect_tokens FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can view own pluggy items"
  ON pluggy_items FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can view own pluggy accounts"
  ON pluggy_accounts FOR SELECT
  USING (item_id IN (
    SELECT item_id FROM pluggy_items WHERE user_id = auth.uid()::TEXT
  ));

CREATE POLICY "Users can view own pluggy transactions"
  ON pluggy_transactions FOR SELECT
  USING (account_id IN (
    SELECT account_id FROM pluggy_accounts WHERE item_id IN (
      SELECT item_id FROM pluggy_items WHERE user_id = auth.uid()::TEXT
    )
  ));

CREATE POLICY "Users can view own pluggy payments"
  ON pluggy_payments FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can view own pluggy investments"
  ON pluggy_investments FOR SELECT
  USING (item_id IN (
    SELECT item_id FROM pluggy_items WHERE user_id = auth.uid()::TEXT
  ));

-- Webhooks e logs: apenas sistema pode acessar
CREATE POLICY "Only service role can access webhooks"
  ON pluggy_webhooks FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can access sync log"
  ON pluggy_sync_log FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Saldo total consolidado por usuário
CREATE OR REPLACE VIEW pluggy_user_balance AS
SELECT 
  i.user_id,
  COUNT(DISTINCT a.account_id) AS total_accounts,
  SUM(CASE WHEN a.type = 'BANK' THEN a.balance ELSE 0 END) AS bank_balance,
  SUM(CASE WHEN a.type = 'CREDIT' THEN a.balance ELSE 0 END) AS credit_balance,
  SUM(a.balance) AS total_balance
FROM pluggy_items i
JOIN pluggy_accounts a ON i.item_id = a.item_id
WHERE i.status = 'UPDATED'
GROUP BY i.user_id;

COMMENT ON VIEW pluggy_user_balance IS 'Saldo consolidado por usuário';

-- View: Transações recentes (últimos 30 dias)
CREATE OR REPLACE VIEW pluggy_recent_transactions AS
SELECT 
  t.*,
  a.name AS account_name,
  i.user_id
FROM pluggy_transactions t
JOIN pluggy_accounts a ON t.account_id = a.account_id
JOIN pluggy_items i ON a.item_id = i.item_id
WHERE t.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY t.date DESC, t.created_at DESC;

COMMENT ON VIEW pluggy_recent_transactions IS 'Transações dos últimos 30 dias';

-- ============================================
-- GRANTS
-- ============================================

-- Permitir que authenticated users acessem as tabelas
GRANT SELECT, INSERT, UPDATE ON pluggy_connect_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pluggy_items TO authenticated;
GRANT SELECT ON pluggy_accounts TO authenticated;
GRANT SELECT ON pluggy_transactions TO authenticated;
GRANT SELECT, INSERT ON pluggy_payments TO authenticated;
GRANT SELECT ON pluggy_investments TO authenticated;

-- Service role tem acesso total
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

