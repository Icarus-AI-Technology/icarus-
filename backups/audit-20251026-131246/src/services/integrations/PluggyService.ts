/**
 * 🔌 PLUGGY SERVICE — TEMPLATE COM MOCK DATA
 *
 * Service completo para integração Pluggy (Open Finance Brasil)
 *
 * ⚠️ MODO TEMPLATE:
 * - Todos os métodos retornam MOCK DATA até a integração real ser ativada
 * - Para ativar: Configure PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env
 * - Instale: npm install pluggy-sdk
 * - Descomente a importação do PluggyClient
 *
 * @see https://docs.pluggy.ai/
 * @see docs/PLUGGY_SETUP_GUIDE.md
 */

// Minimal inline types for template mode (replace with '@/types/pluggy' when integrating)
type PluggyConnectToken = { accessToken: string; expiresAt: Date };
type PluggyItem = {
  id: string;
  connector: {
    id: number;
    name: string;
    imageUrl?: string;
    primaryColor?: string;
    type?: string;
    country?: string;
    hasMFA?: boolean;
    supportsPaymentInitiation?: boolean;
  };
  status: string;
  error: string | null;
  executionStatus: string;
  lastUpdatedAt: string;
  createdAt: string;
};
type PluggyAccount = {
  id: string;
  itemId: string;
  type: "BANK" | "CREDIT" | string;
  subtype?: string;
  number?: string;
  name?: string;
  marketingName?: string;
  balance: number;
  currencyCode?: string;
  bankData?: { transferNumber?: string; closingBalance?: number };
  creditData?: {
    level?: string;
    brand?: string;
    balanceCloseDate?: string;
    balanceDueDate?: string;
    availableCreditLimit?: number;
    creditLimit?: number;
    minimumPayment?: number;
  };
  owner?: string;
  taxNumber?: string;
};
type PluggyTransaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  balance?: number;
  currencyCode?: string;
  type: "CREDIT" | "DEBIT" | string;
  status?: string;
  category?: string;
  merchant?: { name?: string; businessName?: string; cnpj?: string };
};
type TransactionListResponse = {
  results: PluggyTransaction[];
  page: number;
  total: number;
  totalPages: number;
};
type PluggyPayment = {
  id: string;
  itemId: string;
  accountId: string;
  recipient: { pixKey: string; name?: string };
  amount: number;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  scheduledDate?: string;
  createdAt: string;
  approvedAt?: string;
};
type CreatePaymentRequest = {
  itemId: string;
  accountId: string;
  recipient: { pixKey: string; name?: string };
  amount: number;
  description?: string;
  scheduledDate?: string;
};
type PluggyInvestment = {
  id: string;
  itemId: string;
  type: string;
  balance: number;
  name?: string;
  code?: string;
  issuer?: string;
  rate?: number;
  amount?: number;
  amountProfit?: number;
  dueDate?: string;
  purchaseDate?: string;
  currencyCode?: string;
  owner?: string;
};
type PluggyWebhook = { event: string; data: Record<string, unknown> };

// ============================================
// CONFIGURAÇÃO
// ============================================

// 🔧 INTEGRAÇÃO REAL (descomente quando tiver credenciais)
// import { PluggyClient } from 'pluggy-sdk';
//
// const pluggy = new PluggyClient({
//   clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID || '',
//   clientSecret: import.meta.env.VITE_PLUGGY_CLIENT_SECRET || '',
// });

const runtimeEnv: Record<string, string | undefined> =
  // Vite runtime
  typeof import.meta !== "undefined" &&
  typeof (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env !== "undefined"
    ? (import.meta as unknown as { env: Record<string, string | undefined> })
        .env
    : // Node/PM2
      typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {};

const getRuntimeEnv = (key: string): string | undefined => runtimeEnv?.[key];

const PLUGGY_ENABLED = getRuntimeEnv("VITE_PLUGGY_ENABLED") === "true";

console.log(
  "🔌 Pluggy Service:",
  PLUGGY_ENABLED ? "✅ ATIVADO" : "⏸️ MODO TEMPLATE (Mock Data)",
);

// ============================================
// MOCK DATA (Dados de exemplo para desenvolvimento)
// ============================================

const MOCK_ITEMS: PluggyItem[] = [
  {
    id: "item-001",
    connector: {
      id: 201,
      name: "Nubank",
      imageUrl: "https://cdn.pluggy.ai/assets/connector-icons/NU.svg",
      primaryColor: "#820AD1",
      type: "PERSONAL_BANK",
      country: "BR",
      hasMFA: true,
      supportsPaymentInitiation: true,
    },
    status: "UPDATED",
    error: null,
    executionStatus: "SUCCESS",
    lastUpdatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-002",
    connector: {
      id: 202,
      name: "Itaú",
      imageUrl: "https://cdn.pluggy.ai/assets/connector-icons/ITAU.svg",
      primaryColor: "#EC7000",
      type: "BUSINESS_BANK",
      country: "BR",
      hasMFA: true,
      supportsPaymentInitiation: true,
    },
    status: "UPDATED",
    error: null,
    executionStatus: "SUCCESS",
    lastUpdatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_ACCOUNTS: PluggyAccount[] = [
  {
    id: "acc-001",
    itemId: "item-001",
    type: "BANK",
    subtype: "CHECKING_ACCOUNT",
    number: "****1234",
    name: "Conta Corrente",
    marketingName: "NuConta",
    balance: 45680.5,
    currencyCode: "BRL",
    bankData: {
      transferNumber: "260-001-12345678-9",
      closingBalance: 45680.5,
    },
    owner: "ICARUS DISTRIBUIDORA LTDA",
    taxNumber: "12.345.678/0001-90",
  },
  {
    id: "acc-002",
    itemId: "item-001",
    type: "CREDIT",
    subtype: "CREDIT_CARD",
    number: "****5678",
    name: "Cartão de Crédito",
    marketingName: "Nubank Ultravioleta",
    balance: -2340.8,
    currencyCode: "BRL",
    creditData: {
      level: "BLACK",
      brand: "MASTERCARD",
      balanceCloseDate: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      balanceDueDate: new Date(
        Date.now() + 12 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      availableCreditLimit: 47659.2,
      creditLimit: 50000.0,
      minimumPayment: 234.08,
    },
  },
  {
    id: "acc-003",
    itemId: "item-002",
    type: "BANK",
    subtype: "CHECKING_ACCOUNT",
    number: "****9012",
    name: "Conta Empresa",
    marketingName: "Itaú Empresas",
    balance: 128340.25,
    currencyCode: "BRL",
    bankData: {
      transferNumber: "341-1234-56789-0",
      closingBalance: 128340.25,
    },
    owner: "ICARUS DISTRIBUIDORA LTDA",
    taxNumber: "12.345.678/0001-90",
  },
];

const MOCK_TRANSACTIONS: PluggyTransaction[] = [
  {
    id: "tx-001",
    accountId: "acc-001",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: "PIX Recebido - Pagamento Cliente",
    amount: 8540.0,
    balance: 45680.5,
    currencyCode: "BRL",
    type: "CREDIT",
    status: "POSTED",
    category: "Income",
    merchant: {
      name: "Hospital São Lucas",
      businessName: "HOSPITAL SAO LUCAS LTDA",
      cnpj: "98.765.432/0001-10",
    },
  },
  {
    id: "tx-002",
    accountId: "acc-001",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Pagamento Fornecedor OPME",
    amount: -12340.5,
    balance: 37140.5,
    currencyCode: "BRL",
    type: "DEBIT",
    status: "POSTED",
    category: "Suppliers",
    merchant: {
      name: "Medical Supplies Brasil",
      businessName: "MEDICAL SUPPLIES BRASIL LTDA",
      cnpj: "11.222.333/0001-44",
    },
  },
  {
    id: "tx-003",
    accountId: "acc-003",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Folha de Pagamento",
    amount: -45680.0,
    balance: 128340.25,
    currencyCode: "BRL",
    type: "DEBIT",
    status: "POSTED",
    category: "Payroll",
  },
];

// ============================================
// SERVICE CLASS
// ============================================

export class PluggyService {
  // ============================================
  // AUTENTICAÇÃO & CONEXÃO
  // ============================================

  /**
   * Criar Connect Token para o widget
   * Este token permite que o frontend abra o widget de conexão bancária
   */
  static async createConnectToken(userId: string): Promise<PluggyConnectToken> {
    console.log(`📝 Creating Connect Token for user: ${userId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Retornar token fake
      return {
        accessToken: `mock_token_${userId}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hora
      };
    }

    // 🔧 INTEGRAÇÃO REAL (descomente quando ativado)
    // try {
    //   const connectToken = await pluggy.createConnectToken({
    //     clientUserId: userId,
    //   });
    //
    //   return {
    //     accessToken: connectToken.accessToken,
    //     expiresAt: new Date(Date.now() + 3600000),
    //   };
    // } catch (error) {
    // const err = error as Error;
    //   console.error('Error creating Connect Token:', err);
    //   throw new Error(`Erro ao criar Connect Token: ${err.message}`);
    // }

    throw new Error(
      "Pluggy não está habilitado. Configure VITE_PLUGGY_ENABLED=true",
    );
  }

  /**
   * Listar todos os items (conexões bancárias) de um usuário
   */
  static async listItems(userId: string): Promise<PluggyItem[]> {
    console.log(`📋 Listing items for user: ${userId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Retornar dados fake
      return MOCK_ITEMS;
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const items = await pluggy.fetchItems({
    //     clientUserId: userId,
    //   });
    //
    //   return items.results;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao listar items: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  /**
   * Atualizar um item (re-sincronizar dados)
   */
  static async updateItem(itemId: string): Promise<PluggyItem> {
    console.log(`🔄 Updating item: ${itemId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Retornar item atualizado
      const item = MOCK_ITEMS.find((i) => i.id === itemId);
      if (!item) throw new Error("Item não encontrado");

      return {
        ...item,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const item = await pluggy.updateItem(itemId);
    //   return item;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao atualizar item: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  /**
   * Deletar um item (desconectar banco)
   */
  static async deleteItem(itemId: string): Promise<{ success: boolean }> {
    console.log(`🗑️ Deleting item: ${itemId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Simular exclusão
      return { success: true };
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   await pluggy.deleteItem(itemId);
    //   return { success: true };
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao deletar item: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  // ============================================
  // CONTAS BANCÁRIAS
  // ============================================

  /**
   * Buscar todas as contas de um item
   */
  static async fetchAccounts(itemId: string): Promise<PluggyAccount[]> {
    console.log(`💳 Fetching accounts for item: ${itemId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Filtrar contas por item
      return MOCK_ACCOUNTS.filter((acc) => acc.itemId === itemId);
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const accounts = await pluggy.fetchAccounts(itemId);
    //   return accounts.results;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao buscar contas: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  /**
   * Buscar todas as contas de todos os items de um usuário
   */
  static async fetchAllAccounts(userId: string): Promise<PluggyAccount[]> {
    console.log(`💳 Fetching all accounts for user: ${userId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Retornar todas as contas
      return MOCK_ACCOUNTS;
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const items = await this.listItems(userId);
    //   const allAccounts: PluggyAccount[] = [];
    //
    //   for (const item of items) {
    //     const accounts = await this.fetchAccounts(item.id);
    //     allAccounts.push(...accounts);
    //   }
    //
    //   return allAccounts;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao buscar todas as contas: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  // ============================================
  // TRANSAÇÕES
  // ============================================

  /**
   * Buscar transações de uma conta
   */
  static async fetchTransactions(
    accountId: string,
    params?: {
      from?: Date;
      to?: Date;
      page?: number;
      pageSize?: number;
    },
  ): Promise<TransactionListResponse> {
    console.log(`📊 Fetching transactions for account: ${accountId}`, params);

    if (!PLUGGY_ENABLED) {
      // MOCK: Filtrar transações por conta
      const transactions = MOCK_TRANSACTIONS.filter(
        (tx) => tx.accountId === accountId,
      );

      return {
        results: transactions,
        page: params?.page || 1,
        total: transactions.length,
        totalPages: 1,
      };
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const transactions = await pluggy.fetchTransactions(accountId, {
    //     from: params?.from?.toISOString(),
    //     to: params?.to?.toISOString(),
    //     page: params?.page || 1,
    //     pageSize: params?.pageSize || 100,
    //   });
    //
    //   return transactions;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao buscar transações: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  // ============================================
  // PAGAMENTOS PIX
  // ============================================

  /**
   * Criar pagamento PIX
   */
  static async createPayment(
    dados: CreatePaymentRequest,
  ): Promise<PluggyPayment> {
    console.log(`💸 Creating PIX payment:`, dados);

    if (!PLUGGY_ENABLED) {
      // MOCK: Retornar pagamento criado
      const mockPayment: PluggyPayment = {
        id: `pay-${Date.now()}`,
        itemId: dados.itemId,
        accountId: dados.accountId,
        recipient: dados.recipient,
        amount: dados.amount,
        description: dados.description,
        status: "PENDING",
        scheduledDate: dados.scheduledDate,
        createdAt: new Date().toISOString(),
      };

      return mockPayment;
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const payment = await pluggy.createPayment(dados);
    //   return payment;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao criar pagamento: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  /**
   * Verificar status de pagamento
   */
  static async getPayment(paymentId: string): Promise<PluggyPayment> {
    console.log(`🔍 Getting payment status: ${paymentId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Retornar pagamento aprovado
      const mockPayment: PluggyPayment = {
        id: paymentId,
        itemId: "item-001",
        accountId: "acc-001",
        recipient: {
          pixKey: "12345678901",
          name: "Fornecedor Exemplo",
        },
        amount: 1000.0,
        description: "Pagamento teste",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 60000).toISOString(),
        approvedAt: new Date().toISOString(),
      };

      return mockPayment;
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const payment = await pluggy.fetchPayment(paymentId);
    //   return payment;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao buscar pagamento: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  // ============================================
  // INVESTIMENTOS
  // ============================================

  /**
   * Buscar investimentos de um item
   */
  static async fetchInvestments(itemId: string): Promise<PluggyInvestment[]> {
    console.log(`📈 Fetching investments for item: ${itemId}`);

    if (!PLUGGY_ENABLED) {
      // MOCK: Retornar investimentos fake
      return [
        {
          id: "inv-001",
          itemId,
          type: "FIXED_INCOME",
          balance: 50000.0,
          name: "CDB Itaú 110% CDI",
          code: "CDB-ITU-001",
          issuer: "Itaú Unibanco",
          rate: 110,
          amount: 45000.0,
          amountProfit: 5000.0,
          dueDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          purchaseDate: new Date(
            Date.now() - 180 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          currencyCode: "BRL",
          owner: "ICARUS DISTRIBUIDORA LTDA",
        },
      ];
    }

    // 🔧 INTEGRAÇÃO REAL
    // try {
    //   const investments = await pluggy.fetchInvestments(itemId);
    //   return investments.results;
    // } catch (error) {
    // const err = error as Error;
    //   throw new Error(`Erro ao buscar investimentos: ${err.message}`);
    // }

    throw new Error("Pluggy não está habilitado");
  }

  // ============================================
  // WEBHOOKS
  // ============================================

  /**
   * Processar webhook da Pluggy
   */
  static async handleWebhook(
    event: PluggyWebhook,
  ): Promise<{ success: boolean }> {
    console.log("🔔 Webhook recebido:", event);

    // Lógica de processamento de webhooks
    // (funciona mesmo em modo MOCK para testes locais)

    switch (event.event) {
      case "item/created":
        console.log("✅ Item criado:", event.data);
        break;

      case "item/updated":
        console.log("🔄 Item atualizado:", event.data);
        break;

      case "item/deleted":
        console.log("🗑️ Item deletado:", event.data);
        break;

      case "item/error":
        console.log("❌ Erro no item:", event.data);
        break;

      case "payment/approved":
        console.log("✅ Pagamento aprovado:", event.data);
        break;

      case "payment/rejected":
        console.log("❌ Pagamento rejeitado:", event.data);
        break;

      default:
        console.log(`⚠️ Evento não tratado: ${event.event}`);
    }

    return { success: true };
  }

  // ============================================
  // ANÁLISES & INSIGHTS
  // ============================================

  /**
   * Obter saldo total consolidado de todas as contas
   */
  static async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.fetchAllAccounts(userId);

    return accounts
      .filter((acc) => acc.type === "BANK") // Apenas contas bancárias
      .reduce((sum, acc) => sum + acc.balance, 0);
  }

  /**
   * Obter resumo de categorias de despesas
   */
  static async getExpenseCategories(
    accountId: string,
    from: Date,
    to: Date,
  ): Promise<Array<{ category: string; total: number; count: number }>> {
    const { results } = await this.fetchTransactions(accountId, { from, to });

    const expenses = results.filter((tx) => tx.type === "DEBIT");

    const categories = expenses.reduce<
      Record<string, { category: string; total: number; count: number }>
    >((acc, tx) => {
      const category = tx.category || "Outros";
      if (!acc[category]) {
        acc[category] = { category, total: 0, count: 0 };
      }
      acc[category].total += Math.abs(tx.amount);
      acc[category].count += 1;
      return acc;
    }, {});

    return Object.values(categories).sort((a, b) => b.total - a.total);
  }
}

export default PluggyService;
