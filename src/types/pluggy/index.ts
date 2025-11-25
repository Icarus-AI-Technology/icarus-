/**
 * 🔌 PLUGGY API — TYPE DEFINITIONS
 *
 * Tipos TypeScript para toda a integração Pluggy (Open Finance Brasil)
 *
 * @see https://docs.pluggy.ai/
 */

// ============================================
// CONFIGURAÇÃO & AUTENTICAÇÃO
// ============================================

export interface PluggyConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  enabled: boolean; // Flag para ativar/desativar integração
}

export interface PluggyConnectToken {
  accessToken: string;
  expiresAt: Date;
}

// ============================================
// ITEMS (CONEXÕES BANCÁRIAS)
// ============================================

export interface PluggyConnector {
  id: number;
  name: string;
  imageUrl: string;
  primaryColor: string;
  type: 'PERSONAL_BANK' | 'BUSINESS_BANK' | 'INVESTMENT';
  country: string;
  hasMFA: boolean;
  supportsPaymentInitiation: boolean;
}

export type ItemStatus =
  | 'UPDATED'
  | 'UPDATING'
  | 'WAITING_USER_INPUT'
  | 'WAITING_USER_ACTION'
  | 'LOGIN_ERROR'
  | 'OUTDATED';

export interface PluggyItem {
  id: string;
  connector: PluggyConnector;
  status: ItemStatus;
  error: {
    code: string;
    message: string;
  } | null;
  executionStatus: string;
  lastUpdatedAt: string;
  createdAt: string;
  webhookUrl?: string;
  clientUserId?: string;
}

// ============================================
// CONTAS BANCÁRIAS
// ============================================

export type AccountType = 'BANK' | 'CREDIT';

export type AccountSubtype = 'CHECKING_ACCOUNT' | 'SAVINGS_ACCOUNT' | 'CREDIT_CARD';

export interface AccountBankData {
  transferNumber?: string;
  closingBalance?: number;
}

export interface AccountCreditData {
  level?: string;
  brand?: string;
  balanceCloseDate?: string;
  balanceDueDate?: string;
  availableCreditLimit?: number;
  balanceForeignCurrency?: number;
  minimumPayment?: number;
  creditLimit?: number;
}

export interface PluggyAccount {
  id: string;
  itemId: string;
  type: AccountType;
  subtype: AccountSubtype;
  number: string;
  name: string;
  marketingName?: string;
  balance: number;
  currencyCode: string;
  bankData?: AccountBankData;
  creditData?: AccountCreditData;
  owner?: string;
  taxNumber?: string;
}

// ============================================
// TRANSAÇÕES
// ============================================

export type TransactionType = 'DEBIT' | 'CREDIT';

export type TransactionStatus = 'PENDING' | 'POSTED';

export interface TransactionPaymentData {
  payer?: string;
  payee?: string;
  paymentMethod?: string;
  reason?: string;
  referenceNumber?: string;
}

export interface PluggyTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  descriptionRaw?: string;
  amount: number;
  balance?: number;
  currencyCode: string;
  providerCode?: string;
  type: TransactionType;
  status: TransactionStatus;
  category?: string;
  merchant?: {
    name: string;
    businessName?: string;
    cnpj?: string;
  };
  paymentData?: TransactionPaymentData;
}

export interface TransactionListResponse {
  results: PluggyTransaction[];
  page: number;
  total: number;
  totalPages: number;
}

// ============================================
// PAGAMENTOS PIX
// ============================================

export type PaymentStatus = 'PENDING' | 'SCHEDULED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PaymentRecipient {
  pixKey?: string;
  name?: string;
  taxNumber?: string;
  bankAccount?: {
    bankCode: string;
    branchNumber: string;
    accountNumber: string;
    accountType: 'CHECKING' | 'SAVINGS';
  };
}

export interface PluggyPayment {
  id: string;
  itemId: string;
  accountId: string;
  recipient: PaymentRecipient;
  amount: number;
  description?: string;
  status: PaymentStatus;
  scheduledDate?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface CreatePaymentRequest {
  itemId: string;
  accountId: string;
  recipient: PaymentRecipient;
  amount: number;
  description?: string;
  scheduledDate?: string;
}

// ============================================
// INVESTIMENTOS
// ============================================

export type InvestmentType = 'MUTUAL_FUND' | 'SECURITY' | 'EQUITY' | 'FIXED_INCOME' | 'PENSION';

export interface PluggyInvestment {
  id: string;
  itemId: string;
  type: InvestmentType;
  number?: string;
  balance: number;
  name: string;
  code?: string;
  issuer?: string;
  isin?: string;
  rate?: number;
  amount?: number;
  amountProfit?: number;
  amountWithdrawal?: number;
  dueDate?: string;
  issueDate?: string;
  purchaseDate?: string;
  currencyCode: string;
  owner?: string;
}

// ============================================
// IDENTIDADE (KYC)
// ============================================

export interface PluggyIdentity {
  id: string;
  itemId: string;
  fullName: string;
  taxNumber: string;
  documentNumber?: string;
  birthDate?: string;
  emails?: string[];
  phoneNumbers?: string[];
  addresses?: Array<{
    fullAddress: string;
    primaryAddress: boolean;
    type: string;
    postalCode?: string;
    streetName?: string;
    streetNumber?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
  }>;
}

// ============================================
// WEBHOOKS
// ============================================

export type WebhookEvent =
  | 'item/created'
  | 'item/updated'
  | 'item/deleted'
  | 'item/error'
  | 'item/waiting_user_input'
  | 'item/login_error'
  | 'payment/approved'
  | 'payment/rejected';

export interface PluggyWebhook {
  event: WebhookEvent;
  data: unknown;
  webhookId: string;
  createdAt: string;
}

// ============================================
// CACHE LOCAL (SUPABASE)
// ============================================

export interface PluggyItemCache {
  id: string;
  item_id: string;
  user_id: string;
  connector_id: number;
  connector_name: string;
  connector_image_url: string;
  status: ItemStatus;
  error_code?: string;
  error_message?: string;
  last_updated_at?: Date;
  created_at: Date;
}

export interface PluggyAccountCache {
  id: string;
  account_id: string;
  item_id: string;
  type: AccountType;
  subtype: AccountSubtype;
  number: string;
  name: string;
  balance: number;
  currency_code: string;
  bank_data?: AccountBankData;
  credit_data?: AccountCreditData;
  owner?: string;
  tax_number?: string;
  updated_at: Date;
  created_at: Date;
}

export interface PluggyTransactionCache {
  id: string;
  transaction_id: string;
  account_id: string;
  date: Date;
  description: string;
  amount: number;
  balance?: number;
  type: TransactionType;
  status: TransactionStatus;
  category?: string;
  merchant?: { name?: string; businessName?: string; cnpj?: string };
  payment_data?: TransactionPaymentData;
  created_at: Date;
}

export interface PluggyPaymentCache {
  id: string;
  payment_id: string;
  user_id: string;
  item_id: string;
  account_id: string;
  recipient: PaymentRecipient;
  amount: number;
  description?: string;
  status: PaymentStatus;
  scheduled_date?: Date;
  approved_at?: Date;
  rejected_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at?: Date;
}

// ============================================
// ANÁLISES & INSIGHTS (LLM FINANCEIRA)
// ============================================

export interface TransactionCategory {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface CashFlowAnalysis {
  period: {
    from: Date;
    to: Date;
  };
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  categoriesExpenses: TransactionCategory[];
  categoriesIncome: TransactionCategory[];
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
  }>;
}

export interface FinancialHealthScore {
  score: number; // 0-100
  level: 'critical' | 'warning' | 'good' | 'excellent';
  factors: Array<{
    name: string;
    score: number;
    weight: number;
    description: string;
  }>;
  recommendations: string[];
}

export interface BankFeeAnalysis {
  totalFees: number;
  possibleSavings: number;
  fees: Array<{
    description: string;
    amount: number;
    date: Date;
    avoidable: boolean;
    reason?: string;
  }>;
}

// ============================================
// CONFIGURAÇÃO DE FEATURES
// ============================================

export interface PluggyFeatures {
  connectWidget: boolean;
  accountsSync: boolean;
  transactionsSync: boolean;
  paymentInitiation: boolean;
  investments: boolean;
  identity: boolean;
  webhooks: boolean;
  aiAnalysis: boolean; // Integração com LLM Financeira
}

export const PLUGGY_DEFAULT_CONFIG: PluggyConfig = {
  clientId: '',
  clientSecret: '',
  baseUrl: 'https://api.pluggy.ai',
  enabled: false, // Desabilitado até ter credenciais
};

export const PLUGGY_DEFAULT_FEATURES: PluggyFeatures = {
  connectWidget: true,
  accountsSync: true,
  transactionsSync: true,
  paymentInitiation: true,
  investments: true,
  identity: false,
  webhooks: true,
  aiAnalysis: true,
};
