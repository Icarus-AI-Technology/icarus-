/**
 * 💰 DASHBOARD FINANCEIRO — PLUGGY INTEGRATION
 *
 * Dashboard consolidado de todas as contas bancárias conectadas via Pluggy
 * Funciona em modo MOCK com dados simulados
 *
 * Features:
 * - Saldo consolidado (todas as contas)
 * - Lista de contas conectadas
 * - Transações recentes
 * - Gráficos de análise
 * - Filtros por período
 * - Botão para conectar novos bancos
 * - Dark mode support
 * - Responsivo
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCcw,
  Eye,
  EyeOff,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react';
import { PluggyConnectWidget } from '@/components/pluggy/PluggyConnectWidget';
import { Button } from '@/components/oraclusx-ds/Button';

// Mock data para desenvolvimento
const MOCK_ACCOUNTS = [
  {
    id: 'acc-1',
    bankName: 'Nubank',
    bankLogo: '💜',
    type: 'BANK',
    subtype: 'CHECKING_ACCOUNT',
    number: '****1234',
    balance: 15420.5,
    availableBalance: 15420.5,
  },
  {
    id: 'acc-2',
    bankName: 'Itaú',
    bankLogo: '🏦',
    type: 'BANK',
    subtype: 'CHECKING_ACCOUNT',
    number: '****5678',
    balance: 8750.0,
    availableBalance: 8750.0,
  },
  {
    id: 'acc-3',
    bankName: 'Inter',
    bankLogo: '🧡',
    type: 'CREDIT',
    subtype: 'CREDIT_CARD',
    number: '****9012',
    balance: -2340.8,
    availableBalance: 7659.2,
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: 'txn-1',
    accountId: 'acc-1',
    date: '2025-10-20',
    description: 'PIX Recebido - Cirurgia OPME',
    amount: 5420.5,
    type: 'CREDIT',
    category: 'Receitas',
  },
  {
    id: 'txn-2',
    accountId: 'acc-1',
    date: '2025-10-19',
    description: 'Fornecedor Medical Ltda',
    amount: -3200.0,
    type: 'DEBIT',
    category: 'Fornecedores',
  },
  {
    id: 'txn-3',
    accountId: 'acc-2',
    date: '2025-10-19',
    description: 'Salários Funcionários',
    amount: -12500.0,
    type: 'DEBIT',
    category: 'Folha de Pagamento',
  },
  {
    id: 'txn-4',
    accountId: 'acc-1',
    date: '2025-10-18',
    description: 'PIX Recebido - Faturamento OPME',
    amount: 8900.0,
    type: 'CREDIT',
    category: 'Receitas',
  },
  {
    id: 'txn-5',
    accountId: 'acc-3',
    date: '2025-10-18',
    description: 'Compra Material Cirúrgico',
    amount: -1540.8,
    type: 'DEBIT',
    category: 'Compras',
  },
  {
    id: 'txn-6',
    accountId: 'acc-2',
    date: '2025-10-17',
    description: 'Aluguel Galpão',
    amount: -4500.0,
    type: 'DEBIT',
    category: 'Despesas Fixas',
  },
  {
    id: 'txn-7',
    accountId: 'acc-1',
    date: '2025-10-17',
    description: 'Plano de Saúde - Pagamento',
    amount: 15600.0,
    type: 'CREDIT',
    category: 'Receitas',
  },
  {
    id: 'txn-8',
    accountId: 'acc-1',
    date: '2025-10-16',
    description: 'Energia Elétrica',
    amount: -890.5,
    type: 'DEBIT',
    category: 'Despesas Fixas',
  },
];

export const DashboardFinanceiro: React.FC = () => {
  const [showWidget, setShowWidget] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const pluggyEnabled = import.meta.env.VITE_PLUGGY_ENABLED === 'true';

  // Calcular saldos
  const totalBalance = useMemo(() => {
    return MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);
  }, []);

  const totalAvailable = useMemo(() => {
    return MOCK_ACCOUNTS.reduce((sum, acc) => {
      return sum + (acc.type === 'BANK' ? acc.balance : acc.availableBalance);
    }, 0);
  }, []);

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    let filtered = MOCK_TRANSACTIONS;

    // Por conta
    if (selectedAccount !== 'all') {
      filtered = filtered.filter((t) => t.accountId === selectedAccount);
    }

    // Por período (simulado)
    // Em produção, usar datas reais

    return filtered;
  }, [selectedAccount]);

  // Calcular receitas e despesas
  const { totalIncome, totalExpenses } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, txn) => {
        if (txn.type === 'CREDIT') {
          acc.totalIncome += txn.amount;
        } else {
          acc.totalExpenses += Math.abs(txn.amount);
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );
  }, [filteredTransactions]);

  const netBalance = totalIncome - totalExpenses;

  // Formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  // Handlers
  const handleConnectSuccess = () => {
    setShowWidget(false);
    // Em produção: recarregar contas
  };

  const handleConnectError = (error: Error) => {
    console.error('Erro ao conectar:', error);
  };

  return (
    <div className="w-full dashboard-financeiro">
      {/* Header */}
      <div className="p-6 mb-6 neumorphic-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-xl font-bold text-primary">Dashboard Financeiro</h1>
            <p className="text-sm text-muted">
              {pluggyEnabled
                ? 'Contas conectadas via Open Finance Brasil'
                : '⚠️ Modo MOCK: Dados simulados para desenvolvimento'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              
              variant="primary"
              onClick={() => setShowWidget(true)}
              leftIcon={Plus}
            >
              Conectar Banco
            </Button>

            <Button   className="px-3">
              <RefreshCcw size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Saldo Total */}
        <div className="p-6 neumorphic-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted">
              Saldo Total
            </h3>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="text-muted hover:text-primary transition-colors"
            >
              {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {showBalances ? formatCurrency(totalBalance) : 'R$ ••••••'}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Disponível: {showBalances ? formatCurrency(totalAvailable) : '••••••'}
          </p>
        </div>

        {/* Receitas */}
        <div className="p-6 neumorphic-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted">
              Receitas (Mês)
            </h3>
            <div className="p-1.5 rounded-full bg-success/10 text-success">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-success">
              {showBalances ? formatCurrency(totalIncome) : 'R$ ••••••'}
            </span>
          </div>
          <p className="mt-2 text-xs text-success flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.5% vs mês anterior
          </p>
        </div>

        {/* Despesas */}
        <div className="p-6 neumorphic-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted">
              Despesas (Mês)
            </h3>
            <div className="p-1.5 rounded-full bg-danger/10 text-danger">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-danger">
              {showBalances ? formatCurrency(totalExpenses) : 'R$ ••••••'}
            </span>
          </div>
          <p className="mt-2 text-xs text-danger flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            +5.2% vs mês anterior
          </p>
        </div>

        {/* Resultado */}
        <div className="p-6 neumorphic-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted">
              Resultado Líquido
            </h3>
            <div
              className={`p-1.5 rounded-full ${netBalance >= 0 ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'}`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${netBalance >= 0 ? 'text-primary' : 'text-danger'}`}
            >
              {showBalances ? formatCurrency(netBalance) : 'R$ ••••••'}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Margem: {totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lista de Contas */}
        <div className="lg:col-span-1">
          <div className="h-full p-6 neumorphic-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary">Minhas Contas</h3>
              <button className="text-xs font-medium text-primary hover:underline">
                Gerenciar
              </button>
            </div>

            <div className="space-y-4">
              {MOCK_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(selectedAccount === acc.id ? 'all' : acc.id)}
                  className={`p-4 rounded-xl transition-all cursor-pointer border ${
                    selectedAccount === acc.id
                      ? 'bg-primary/5 border-primary shadow-neumo-sm-inset'
                      : 'bg-surface border-transparent hover:bg-surface-hover shadow-neumo-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{acc.bankLogo}</span>
                      <div>
                        <p className="font-semibold text-primary">{acc.bankName}</p>
                        <p className="text-xs text-muted">
                          {acc.type === 'CREDIT' ? 'Cartão de Crédito' : 'Conta Corrente'}
                        </p>
                      </div>
                    </div>
                    {selectedAccount === acc.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <p className="text-xs text-muted">{acc.number}</p>
                    <p className={`font-bold ${acc.balance < 0 ? 'text-danger' : 'text-primary'}`}>
                      {showBalances ? formatCurrency(acc.balance) : '••••••'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="lg:col-span-2">
          <div className="h-full p-6 neumorphic-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary">Transações Recentes</h3>
              <div className="flex gap-2">
                {['7d', '15d', '30d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? 'bg-primary text-white shadow-neumo-sm'
                        : 'text-muted hover:text-primary hover:bg-surface-hover'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl">
              <table className="w-full">
                <thead className="bg-surface-hover">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-muted">
                      Data
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-muted">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-muted">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-right uppercase text-muted">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="transition-colors hover:bg-surface-hover/50">
                      <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                        {formatDate(txn.date)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-primary">{txn.description}</p>
                        <p className="text-xs text-muted">
                          {MOCK_ACCOUNTS.find((a) => a.id === txn.accountId)?.bankName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-surface-hover text-muted">
                          {txn.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-bold text-right whitespace-nowrap ${
                          txn.type === 'CREDIT' ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {txn.type === 'CREDIT' ? '+' : ''} {formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <Button  variant="ghost" className="text-sm text-primary">
                Ver Extrato Completo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Pluggy (Modal) */}
      {showWidget && pluggyEnabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl p-6 bg-surface rounded-2xl shadow-neumo-lg">
            <button
              onClick={() => setShowWidget(false)}
              className="absolute top-4 right-4 text-muted hover:text-primary"
            >
              ✕
            </button>
            <PluggyConnectWidget
              userId="user-123"
              onSuccess={handleConnectSuccess}
              onError={handleConnectError}
            />
          </div>
        </div>
      )}

      {showWidget && !pluggyEnabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-8 text-center bg-surface rounded-2xl shadow-neumo-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-warning/10 text-warning">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-primary">Modo de Desenvolvimento</h3>
            <p className="mb-6 text-muted">
              A integração com a Pluggy está desativada no momento. Configure as variáveis de
              ambiente VITE_PLUGGY_ENABLED=true para ativar.
            </p>
            <Button  variant="primary" onClick={() => setShowWidget(false)}>
              Entendi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFinanceiro;
