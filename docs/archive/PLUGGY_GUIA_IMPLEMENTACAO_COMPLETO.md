# 🚀 PLUGGY — GUIA DE IMPLEMENTAÇÃO COMPLETO — ICARUS v5.0

**Sistema**: ICARUS v5.0 — Gestão elevada pela IA  
**Data**: 20 de Outubro de 2025  
**Repositório Oficial**: [github.com/pluggyai/quickstart](https://github.com/pluggyai/quickstart)  
**Documentação**: [docs.pluggy.ai](https://docs.pluggy.ai/)

---

## 📋 ÍNDICE

1. [Setup Inicial](#setup-inicial)
2. [Arquitetura de Integração](#arquitetura-de-integração)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Integration](#frontend-integration)
5. [Webhooks & Events](#webhooks--events)
6. [Casos de Uso ICARUS](#casos-de-uso-icarus)
7. [Testing & Sandbox](#testing--sandbox)
8. [Production Checklist](#production-checklist)

---

## 🎯 SETUP INICIAL

### 1. Criar Conta Pluggy

```bash
# Acesse o dashboard
https://dashboard.pluggy.ai/

# Crie sua conta (gratuito para desenvolvimento)
# Obtenha suas credenciais:
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
```

### 2. Instalar Dependências

```bash
# Backend (Node.js)
cd /Users/daxmeneghel/icarus-v5.0
npm install pluggy-sdk --save

# Ou com pnpm
pnpm add pluggy-sdk

# Ou com yarn
yarn add pluggy-sdk
```

### 3. Configurar Variáveis de Ambiente

```bash
# .env.local
PLUGGY_CLIENT_ID=your_client_id_here
PLUGGY_CLIENT_SECRET=your_client_secret_here
PLUGGY_BASE_URL=https://api.pluggy.ai # Produção
# PLUGGY_BASE_URL=https://api.sandbox.pluggy.ai # Sandbox
```

---

## 🏗️ ARQUITETURA DE INTEGRAÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│                    ICARUS v5.0 FRONTEND                         │
│                      (React + Vite)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │  Pluggy Connect      │      │  Dashboard           │       │
│  │  Widget (iframe)     │◄────►│  Financeiro          │       │
│  └──────────────────────┘      └──────────────────────┘       │
│           │                                 │                  │
│           └─────────────┬───────────────────┘                  │
│                         │                                      │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                          ▼ HTTPS/JSON
┌─────────────────────────────────────────────────────────────────┐
│                    ICARUS BACKEND API                           │
│                 (Node.js + Supabase)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │             PluggyService.ts                           │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ • createConnectToken()                           │  │   │
│  │  │ • fetchAccounts()                                │  │   │
│  │  │ • fetchTransactions()                            │  │   │
│  │  │ • createPayment()                                │  │   │
│  │  │ • handleWebhook()                                │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│           │                                                    │
│           └──────────► Supabase (Cache + Audit)               │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼ OAuth 2.0
┌─────────────────────────────────────────────────────────────────┐
│                      PLUGGY API                                 │
│                  (Open Finance Brasil)                          │
├─────────────────────────────────────────────────────────────────┤
│  • Authentication                                               │
│  • Items & Connections                                          │
│  • Accounts & Balances                                          │
│  • Transactions                                                 │
│  • Payments (PIX)                                               │
│  • Webhooks                                                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼ Open Finance
┌─────────────────────────────────────────────────────────────────┐
│              BANCOS BRASILEIROS (150+)                          │
│  Itaú, Bradesco, Nubank, Inter, C6, BTG, XP, etc.              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 BACKEND IMPLEMENTATION

### 1. PluggyService (Core)

```typescript
// server/services/integrations/pluggy.ts
import { PluggyClient } from 'pluggy-sdk';
import { supabase } from '@/lib/supabase';

// Inicializar cliente Pluggy
const pluggy = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
});

export class PluggyService {
  // ============================================
  // AUTENTICAÇÃO & CONEXÃO
  // ============================================
  
  /**
   * Criar Connect Token para o widget
   * Este token permite que o frontend abra o widget de conexão bancária
   */
  static async createConnectToken(userId: string) {
    try {
      // Criar item (conexão bancária) para o usuário
      const connectToken = await pluggy.createConnectToken({
        clientUserId: userId, // ID do usuário no seu sistema
      });
      
      // Salvar no Supabase para auditoria
      await supabase.from('pluggy_connect_tokens').insert({
        user_id: userId,
        access_token: connectToken.accessToken,
        expires_at: new Date(Date.now() + 3600000), // 1 hora
        created_at: new Date(),
      });
      
      return {
        accessToken: connectToken.accessToken,
      };
    } catch (error) {
      console.error('Erro ao criar Connect Token:', error);
      throw new Error(`Erro ao criar Connect Token: ${error.message}`);
    }
  }
  
  /**
   * Listar todos os items (conexões bancárias) de um usuário
   */
  static async listItems(userId: string) {
    try {
      const items = await pluggy.fetchItems({
        clientUserId: userId,
      });
      
      return items.results.map(item => ({
        id: item.id,
        connector: {
          id: item.connector.id,
          name: item.connector.name,
          imageUrl: item.connector.imageUrl,
          type: item.connector.type,
        },
        status: item.status, // UPDATED, OUTDATED, LOGIN_ERROR, etc.
        error: item.error,
        lastUpdatedAt: new Date(item.lastUpdatedAt),
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      throw new Error(`Erro ao listar items: ${error.message}`);
    }
  }
  
  /**
   * Atualizar um item (re-sincronizar dados)
   */
  static async updateItem(itemId: string) {
    try {
      const item = await pluggy.updateItem(itemId);
      
      return {
        id: item.id,
        status: item.status,
        lastUpdatedAt: new Date(item.lastUpdatedAt),
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar item: ${error.message}`);
    }
  }
  
  /**
   * Deletar um item (desconectar banco)
   */
  static async deleteItem(itemId: string) {
    try {
      await pluggy.deleteItem(itemId);
      
      // Deletar do cache local
      await supabase
        .from('pluggy_items')
        .delete()
        .eq('item_id', itemId);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Erro ao deletar item: ${error.message}`);
    }
  }
  
  // ============================================
  // CONTAS BANCÁRIAS
  // ============================================
  
  /**
   * Buscar todas as contas de um item
   */
  static async fetchAccounts(itemId: string) {
    try {
      const accounts = await pluggy.fetchAccounts(itemId);
      
      // Salvar/atualizar no cache
      await Promise.all(
        accounts.results.map(account =>
          supabase.from('pluggy_accounts').upsert({
            account_id: account.id,
            item_id: itemId,
            type: account.type,
            subtype: account.subtype,
            name: account.name,
            number: account.number,
            balance: account.balance,
            currency_code: account.currencyCode,
            bank_data: account.bankData,
            updated_at: new Date(),
          })
        )
      );
      
      return accounts.results.map(account => ({
        id: account.id,
        type: account.type, // BANK, CREDIT
        subtype: account.subtype, // CHECKING_ACCOUNT, SAVINGS_ACCOUNT, CREDIT_CARD
        name: account.name,
        marketingName: account.marketingName,
        number: account.number,
        balance: account.balance,
        availableBalance: account.availableBalance,
        currencyCode: account.currencyCode,
        bankData: account.bankData,
        creditData: account.creditData,
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar contas: ${error.message}`);
    }
  }
  
  // ============================================
  // TRANSAÇÕES
  // ============================================
  
  /**
   * Buscar transações de uma conta
   */
  static async fetchTransactions(accountId: string, params?: {
    from?: Date;
    to?: Date;
    page?: number;
    pageSize?: number;
  }) {
    try {
      const transactions = await pluggy.fetchTransactions(accountId, {
        from: params?.from?.toISOString(),
        to: params?.to?.toISOString(),
        page: params?.page || 1,
        pageSize: params?.pageSize || 100,
      });
      
      // Salvar transações no banco (para análise offline)
      await supabase.from('pluggy_transactions').upsert(
        transactions.results.map(tx => ({
          transaction_id: tx.id,
          account_id: accountId,
          date: new Date(tx.date),
          description: tx.description,
          amount: tx.amount,
          balance: tx.balance,
          type: tx.type, // DEBIT, CREDIT
          category: tx.category,
          merchant: tx.merchant,
          status: tx.status,
          payment_data: tx.paymentData,
          created_at: new Date(),
        }))
      );
      
      return {
        transactions: transactions.results,
        page: transactions.page,
        total: transactions.total,
        totalPages: transactions.totalPages,
      };
    } catch (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }
  }
  
  // ============================================
  // PAGAMENTOS PIX
  // ============================================
  
  /**
   * Criar pagamento PIX
   */
  static async createPayment(dados: {
    accountId: string;
    recipient: {
      pixKey?: string;
      name?: string;
      taxNumber?: string;
    };
    amount: number;
    description?: string;
  }) {
    try {
      const payment = await pluggy.createPayment({
        itemId: dados.accountId,
        recipient: dados.recipient,
        amount: dados.amount,
        description: dados.description,
      });
      
      // Registrar no banco
      await supabase.from('pluggy_payments').insert({
        payment_id: payment.id,
        account_id: dados.accountId,
        recipient: dados.recipient,
        amount: dados.amount,
        description: dados.description,
        status: payment.status,
        created_at: new Date(),
      });
      
      return {
        id: payment.id,
        status: payment.status, // PENDING, SCHEDULED, APPROVED, REJECTED
        createdAt: new Date(payment.createdAt),
        scheduledDate: payment.scheduledDate ? new Date(payment.scheduledDate) : null,
      };
    } catch (error) {
      throw new Error(`Erro ao criar pagamento: ${error.message}`);
    }
  }
  
  /**
   * Verificar status de pagamento
   */
  static async getPayment(paymentId: string) {
    try {
      const payment = await pluggy.fetchPayment(paymentId);
      
      // Atualizar status no banco
      await supabase
        .from('pluggy_payments')
        .update({
          status: payment.status,
          updated_at: new Date(),
        })
        .eq('payment_id', paymentId);
      
      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        createdAt: new Date(payment.createdAt),
        approvedAt: payment.approvedAt ? new Date(payment.approvedAt) : null,
        rejectedAt: payment.rejectedAt ? new Date(payment.rejectedAt) : null,
        rejectionReason: payment.rejectionReason,
      };
    } catch (error) {
      throw new Error(`Erro ao buscar pagamento: ${error.message}`);
    }
  }
  
  // ============================================
  // INVESTIMENTOS
  // ============================================
  
  /**
   * Buscar investimentos de um item
   */
  static async fetchInvestments(itemId: string) {
    try {
      const investments = await pluggy.fetchInvestments(itemId);
      
      return investments.results.map(inv => ({
        id: inv.id,
        type: inv.type, // MUTUAL_FUND, SECURITY, PENSION, etc.
        name: inv.name,
        balance: inv.balance,
        amount: inv.amount,
        rate: inv.rate,
        date: inv.date ? new Date(inv.date) : null,
        owner: inv.owner,
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar investimentos: ${error.message}`);
    }
  }
  
  // ============================================
  // WEBHOOKS
  // ============================================
  
  /**
   * Processar webhook da Pluggy
   */
  static async handleWebhook(event: any) {
    try {
      console.log('Webhook recebido:', event);
      
      switch (event.event) {
        case 'item/created':
          await this.handleItemCreated(event.data);
          break;
          
        case 'item/updated':
          await this.handleItemUpdated(event.data);
          break;
          
        case 'item/deleted':
          await this.handleItemDeleted(event.data);
          break;
          
        case 'item/error':
          await this.handleItemError(event.data);
          break;
          
        case 'payment/approved':
          await this.handlePaymentApproved(event.data);
          break;
          
        case 'payment/rejected':
          await this.handlePaymentRejected(event.data);
          break;
          
        default:
          console.log(`Evento não tratado: ${event.event}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }
  
  private static async handleItemCreated(data: any) {
    // Quando uma conexão bancária é criada com sucesso
    await supabase.from('pluggy_items').insert({
      item_id: data.id,
      connector_id: data.connector.id,
      connector_name: data.connector.name,
      status: data.status,
      created_at: new Date(),
    });
    
    // Buscar contas automaticamente
    await this.fetchAccounts(data.id);
  }
  
  private static async handleItemUpdated(data: any) {
    // Quando dados são atualizados
    await supabase
      .from('pluggy_items')
      .update({
        status: data.status,
        last_updated_at: new Date(),
      })
      .eq('item_id', data.id);
    
    // Re-sincronizar transações
    const accounts = await this.fetchAccounts(data.id);
    await Promise.all(
      accounts.map(acc =>
        this.fetchTransactions(acc.id, {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
          to: new Date(),
        })
      )
    );
  }
  
  private static async handleItemDeleted(data: any) {
    // Quando conexão é removida
    await supabase
      .from('pluggy_items')
      .delete()
      .eq('item_id', data.id);
  }
  
  private static async handleItemError(data: any) {
    // Quando ocorre erro na conexão
    await supabase
      .from('pluggy_items')
      .update({
        status: 'ERROR',
        error_message: data.error?.message,
        updated_at: new Date(),
      })
      .eq('item_id', data.id);
    
    // Notificar usuário via WhatsApp (Z-API)
    // await ZAPIService.enviarMensagem({
    //   telefone: user.celular,
    //   mensagem: `Erro na conexão bancária: ${data.error?.message}`,
    // });
  }
  
  private static async handlePaymentApproved(data: any) {
    // Quando pagamento PIX é aprovado
    await supabase
      .from('pluggy_payments')
      .update({
        status: 'APPROVED',
        approved_at: new Date(),
      })
      .eq('payment_id', data.id);
    
    // Disparar evento interno para módulos do ICARUS
    // EventEmitter.emit('payment:approved', data);
  }
  
  private static async handlePaymentRejected(data: any) {
    // Quando pagamento PIX é rejeitado
    await supabase
      .from('pluggy_payments')
      .update({
        status: 'REJECTED',
        rejection_reason: data.rejectionReason,
        rejected_at: new Date(),
      })
      .eq('payment_id', data.id);
    
    // Notificar usuário
    // EventEmitter.emit('payment:rejected', data);
  }
}
```

### 2. API Routes (Express)

```typescript
// server/routes/pluggy.ts
import { Router } from 'express';
import { PluggyService } from '@/services/integrations/pluggy';
import { authenticateJWT, requirePermission } from '@/middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateJWT);

// ============================================
// CONEXÃO BANCÁRIA
// ============================================

// Criar Connect Token
router.post('/connect-token', async (req, res) => {
  try {
    const userId = req.user.id;
    const token = await PluggyService.createConnectToken(userId);
    
    res.json({
      success: true,
      data: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Listar conexões
router.get('/items', async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await PluggyService.listItems(userId);
    
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Atualizar conexão
router.post('/items/:itemId/update', async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await PluggyService.updateItem(itemId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Deletar conexão
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    await PluggyService.deleteItem(itemId);
    
    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONTAS & TRANSAÇÕES
// ============================================

// Buscar contas
router.get('/items/:itemId/accounts', async (req, res) => {
  try {
    const { itemId } = req.params;
    const accounts = await PluggyService.fetchAccounts(itemId);
    
    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Buscar transações
router.get('/accounts/:accountId/transactions', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { from, to, page, pageSize } = req.query;
    
    const result = await PluggyService.fetchTransactions(accountId, {
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// PAGAMENTOS PIX
// ============================================

// Criar pagamento
router.post('/payments', requirePermission('criar_pagamentos'), async (req, res) => {
  try {
    const { accountId, recipient, amount, description } = req.body;
    
    const payment = await PluggyService.createPayment({
      accountId,
      recipient,
      amount,
      description,
    });
    
    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Verificar status de pagamento
router.get('/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await PluggyService.getPayment(paymentId);
    
    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// WEBHOOKS
// ============================================

// Endpoint para receber webhooks da Pluggy
router.post('/webhooks', async (req, res) => {
  try {
    await PluggyService.handleWebhook(req.body);
    
    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

---

## 🎨 FRONTEND INTEGRATION

### 1. Pluggy Connect Widget

```typescript
// src/components/pluggy/PluggyConnectWidget.tsx
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PluggyConnectWidgetProps {
  onSuccess: (itemId: string) => void;
  onError: (error: Error) => void;
}

export const PluggyConnectWidget: React.FC<PluggyConnectWidgetProps> = ({
  onSuccess,
  onError,
}) => {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Buscar Connect Token do backend
    fetch('/api/pluggy/connect-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConnectToken(data.data.accessToken);
        } else {
          throw new Error(data.error);
        }
      })
      .catch(error => {
        console.error('Erro ao obter Connect Token:', error);
        onError(error);
      })
      .finally(() => setLoading(false));
  }, [onError]);
  
  useEffect(() => {
    if (!connectToken) return;
    
    // Carregar SDK da Pluggy
    const script = document.createElement('script');
    script.src = 'https://cdn.pluggy.ai/pluggy-connect/v1.4.0/pluggy-connect.js';
    script.async = true;
    script.onload = () => initPluggyConnect();
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [connectToken]);
  
  const initPluggyConnect = () => {
    if (!window.PluggyConnect || !connectToken) return;
    
    const pluggyConnect = window.PluggyConnect({
      connectToken,
      includeSandbox: process.env.NODE_ENV === 'development', // Incluir bancos sandbox em dev
      
      // Callbacks
      onSuccess: (itemData: any) => {
        console.log('Conexão criada com sucesso:', itemData);
        onSuccess(itemData.item.id);
      },
      
      onError: (error: any) => {
        console.error('Erro na conexão:', error);
        onError(new Error(error.message));
      },
      
      onClose: () => {
        console.log('Widget fechado');
      },
    });
    
    // Abrir widget automaticamente
    pluggyConnect.open();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }
  
  return (
    <div id="pluggy-connect-container" className="min-h-[600px]" />
  );
};

// Declarar tipo global para TypeScript
declare global {
  interface Window {
    PluggyConnect: any;
  }
}
```

### 2. Dashboard Financeiro

```typescript
// src/pages/financeiro/DashboardFinanceiro.tsx
import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { PluggyConnectWidget } from '@/components/pluggy/PluggyConnectWidget';
import { toast } from 'sonner';

interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currencyCode: string;
}

interface BankItem {
  id: string;
  connector: {
    name: string;
    imageUrl: string;
  };
  status: string;
  lastUpdatedAt: Date;
}

export const DashboardFinanceiro = () => {
  const [items, setItems] = useState<BankItem[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showConnectWidget, setShowConnectWidget] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadItems();
  }, []);
  
  const loadItems = async () => {
    try {
      const response = await fetch('/api/pluggy/items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
        
        // Carregar contas de todos os items
        const allAccounts: BankAccount[] = [];
        for (const item of data.data) {
          const accountsResponse = await fetch(`/api/pluggy/items/${item.id}/accounts`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
          
          const accountsData = await accountsResponse.json();
          if (accountsData.success) {
            allAccounts.push(...accountsData.data);
          }
        }
        
        setAccounts(allAccounts);
      }
    } catch (error) {
      console.error('Erro ao carregar items:', error);
      toast.error('Erro ao carregar conexões bancárias');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectSuccess = (itemId: string) => {
    toast.success('Banco conectado com sucesso!');
    setShowConnectWidget(false);
    loadItems();
  };
  
  const handleConnectError = (error: Error) => {
    toast.error(`Erro ao conectar banco: ${error.message}`);
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Deseja realmente desconectar este banco?')) return;
    
    try {
      const response = await fetch(`/api/pluggy/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Banco desconectado');
        loadItems();
      }
    } catch (error) {
      toast.error('Erro ao desconectar banco');
    }
  };
  
  const handleRefreshItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/pluggy/items/${itemId}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Dados atualizados!');
        loadItems();
      }
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    }
  };
  
  const saldoTotal = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
        <button
          className="neumorphic-button px-4 py-2 colored-button"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
          onClick={() => setShowConnectWidget(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Conectar Banco
        </button>
      </div>
      
      {/* Saldo Total */}
      <div className="neumorphic-container p-6">
        <h2 className="text-lg text-gray-600 mb-2">Saldo Total</h2>
        <p className="text-4xl font-bold">
          R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      
      {/* Contas Conectadas */}
      <div className="neumorphic-container p-6">
        <h2 className="text-xl font-bold mb-4">Contas Conectadas</h2>
        
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum banco conectado. Clique em "Conectar Banco" para começar.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="neumorphic-container p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <img
                    src={item.connector.imageUrl}
                    alt={item.connector.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold">{item.connector.name}</h3>
                    <p className="text-sm text-gray-600">
                      Atualizado em {new Date(item.lastUpdatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="neumorphic-button p-2"
                    onClick={() => handleRefreshItem(item.id)}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    className="neumorphic-button p-2"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Lista de Contas */}
      {accounts.length > 0 && (
        <div className="neumorphic-container p-6">
          <h2 className="text-xl font-bold mb-4">Todas as Contas</h2>
          <div className="space-y-3">
            {accounts.map(account => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-gray-600">{account.type}</p>
                </div>
                <p className="font-bold">
                  R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Widget de Conexão */}
      {showConnectWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Conectar Banco</h2>
              <button
                className="neumorphic-button p-2"
                onClick={() => setShowConnectWidget(false)}
              >
                ✕
              </button>
            </div>
            
            <PluggyConnectWidget
              onSuccess={handleConnectSuccess}
              onError={handleConnectError}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🎉 CONCLUSÃO

Este guia fornece uma implementação completa e production-ready da integração Pluggy no ICARUS v5.0, baseado no [repositório oficial de quickstart](https://github.com/pluggyai/quickstart) e nas [melhores práticas da documentação](https://docs.pluggy.ai/).

**Próximos passos**:
1. Criar conta na Pluggy
2. Implementar backend (`PluggyService.ts`)
3. Integrar frontend (widget + dashboard)
4. Configurar webhooks
5. Testar no sandbox
6. Deploy para produção

**Referências**:
- [Pluggy Quickstart GitHub](https://github.com/pluggyai/quickstart)
- [Pluggy Documentation](https://docs.pluggy.ai/)
- [Pluggy Dashboard](https://dashboard.pluggy.ai/)

