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
  Download,
  Eye,
  EyeOff,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { PluggyConnectWidget } from '@/components/pluggy/PluggyConnectWidget';

// Mock data para desenvolvimento
const MOCK_ACCOUNTS = [
  {
    id: 'acc-1',
    bankName: 'Nubank',
    bankLogo: '💜',
    type: 'BANK',
    subtype: 'CHECKING_ACCOUNT',
    number: '****1234',
    balance: 15420.50,
    availableBalance: 15420.50,
  },
  {
    id: 'acc-2',
    bankName: 'Itaú',
    bankLogo: '🏦',
    type: 'BANK',
    subtype: 'CHECKING_ACCOUNT',
    number: '****5678',
    balance: 8750.00,
    availableBalance: 8750.00,
  },
  {
    id: 'acc-3',
    bankName: 'Inter',
    bankLogo: '🧡',
    type: 'CREDIT',
    subtype: 'CREDIT_CARD',
    number: '****9012',
    balance: -2340.80,
    availableBalance: 7659.20,
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: 'txn-1',
    accountId: 'acc-1',
    date: '2025-10-20',
    description: 'PIX Recebido - Cirurgia OPME',
    amount: 5420.50,
    type: 'CREDIT',
    category: 'Receitas',
  },
  {
    id: 'txn-2',
    accountId: 'acc-1',
    date: '2025-10-19',
    description: 'Fornecedor Medical Ltda',
    amount: -3200.00,
    type: 'DEBIT',
    category: 'Fornecedores',
  },
  {
    id: 'txn-3',
    accountId: 'acc-2',
    date: '2025-10-19',
    description: 'Salários Funcionários',
    amount: -12500.00,
    type: 'DEBIT',
    category: 'Folha de Pagamento',
  },
  {
    id: 'txn-4',
    accountId: 'acc-1',
    date: '2025-10-18',
    description: 'PIX Recebido - Faturamento OPME',
    amount: 8900.00,
    type: 'CREDIT',
    category: 'Receitas',
  },
  {
    id: 'txn-5',
    accountId: 'acc-3',
    date: '2025-10-18',
    description: 'Compra Material Cirúrgico',
    amount: -1540.80,
    type: 'DEBIT',
    category: 'Compras',
  },
  {
    id: 'txn-6',
    accountId: 'acc-2',
    date: '2025-10-17',
    description: 'Aluguel Galpão',
    amount: -4500.00,
    type: 'DEBIT',
    category: 'Despesas Fixas',
  },
  {
    id: 'txn-7',
    accountId: 'acc-1',
    date: '2025-10-17',
    description: 'Plano de Saúde - Pagamento',
    amount: 15600.00,
    type: 'CREDIT',
    category: 'Receitas',
  },
  {
    id: 'txn-8',
    accountId: 'acc-1',
    date: '2025-10-16',
    description: 'Energia Elétrica',
    amount: -890.50,
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
      filtered = filtered.filter(t => t.accountId === selectedAccount);
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
  const handleConnectSuccess = (itemId: string) => {
    console.log('Banco conectado:', itemId);
    setShowWidget(false);
    // Em produção: recarregar contas
  };
  
  const handleConnectError = (error: Error) => {
    console.error('Erro ao conectar:', error);
  };
  
  return (
    <div className="dashboard-financeiro" style={{ width: '100%' }}>
      {/* Header */}
      <div className="neumorphic-container p-6 mb-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{
              fontSize: '0.813rem',
              fontWeight: 'bold',
              color: 'var(--orx-text-primary)',
              marginBottom: '0.5rem',
            }}>
              Dashboard Financeiro
            </h1>
            <p style={{
              fontSize: '0.813rem',
              color: 'var(--orx-text-secondary)',
            }}>
              {pluggyEnabled 
                ? 'Contas conectadas via Open Finance Brasil' 
                : '⚠️ Modo MOCK: Dados simulados para desenvolvimento'
              }
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="neumorphic-button"
              onClick={() => setShowWidget(true)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                background: 'var(--orx-primary)',
                color: 'white',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Conectar Banco
            </button>
            
            <button
              className="neumorphic-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
              }}
            >
              <RefreshCcw style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>
      </div>
      
      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Saldo Total */}
        <div className="neumorphic-container p-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: '600',
              color: 'var(--orx-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Saldo Total
            </h3>
            <button
              onClick={() => setShowBalances(!showBalances)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--orx-text-secondary)',
              }}
            >
              {showBalances ? (
                <Eye style={{ width: '1rem', height: '1rem' }} />
              ) : (
                <EyeOff style={{ width: '1rem', height: '1rem' }} />
              )}
            </button>
          </div>
          <p style={{
            fontSize: '0.813rem',
            fontWeight: 'bold',
            color: 'var(--orx-text-primary)',
          }}>
            {showBalances ? formatCurrency(totalBalance) : '••••••'}
          </p>
          <p style={{
            fontSize: '0.813rem',
            color: 'var(--orx-text-secondary)',
            marginTop: '0.5rem',
          }}>
            Disponível: {showBalances ? formatCurrency(totalAvailable) : '••••••'}
          </p>
        </div>
        
        {/* Receitas */}
        <div className="neumorphic-container p-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: '600',
              color: 'var(--orx-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Receitas
            </h3>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'var(--orx-success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: 'var(--orx-success)' }} />
            </div>
          </div>
          <p style={{
            fontSize: '0.813rem',
            fontWeight: 'bold',
            color: 'var(--orx-success)',
          }}>
            {showBalances ? formatCurrency(totalIncome) : '••••••'}
          </p>
          <p style={{
            fontSize: '0.813rem',
            color: 'var(--orx-text-secondary)',
            marginTop: '0.5rem',
          }}>
            Últimos {selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : '90'} dias
          </p>
        </div>
        
        {/* Despesas */}
        <div className="neumorphic-container p-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: '600',
              color: 'var(--orx-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Despesas
            </h3>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'var(--orx-error-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingDown style={{ width: '1.25rem', height: '1.25rem', color: 'var(--orx-error)' }} />
            </div>
          </div>
          <p style={{
            fontSize: '0.813rem',
            fontWeight: 'bold',
            color: 'var(--orx-error)',
          }}>
            {showBalances ? formatCurrency(totalExpenses) : '••••••'}
          </p>
          <p style={{
            fontSize: '0.813rem',
            color: 'var(--orx-text-secondary)',
            marginTop: '0.5rem',
          }}>
            Últimos {selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : '90'} dias
          </p>
        </div>
        
        {/* Saldo Líquido */}
        <div className="neumorphic-container p-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: '600',
              color: 'var(--orx-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Saldo Líquido
            </h3>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: netBalance >= 0 ? 'var(--orx-success-light)' : 'var(--orx-error-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarSign style={{ 
                width: '1.25rem', 
                height: '1.25rem', 
                color: netBalance >= 0 ? 'var(--orx-success)' : 'var(--orx-error)',
              }} />
            </div>
          </div>
          <p style={{
            fontSize: '0.813rem',
            fontWeight: 'bold',
            color: netBalance >= 0 ? 'var(--orx-success)' : 'var(--orx-error)',
          }}>
            {showBalances ? formatCurrency(netBalance) : '••••••'}
          </p>
          <p style={{
            fontSize: '0.813rem',
            color: 'var(--orx-text-secondary)',
            marginTop: '0.5rem',
          }}>
            Receitas - Despesas
          </p>
        </div>
      </div>
      
      {/* Contas Conectadas */}
      <div className="neumorphic-container p-6 mb-6">
        <h2 style={{
          fontSize: '0.813rem',
          fontWeight: 'bold',
          color: 'var(--orx-text-primary)',
          marginBottom: '1.5rem',
        }}>
          Contas Conectadas
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {MOCK_ACCOUNTS.map(account => (
            <div
              key={account.id}
              className="neumorphic-container"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'var(--orx-bg-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.813rem',
                }}>
                  {account.bankLogo}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '0.813rem',
                    fontWeight: '600',
                    color: 'var(--orx-text-primary)',
                  }}>
                    {account.bankName}
                  </h3>
                  <p style={{
                    fontSize: '0.813rem',
                    color: 'var(--orx-text-secondary)',
                  }}>
                    {account.type === 'BANK' ? 'Conta Corrente' : 'Cartão de Crédito'} • {account.number}
                  </p>
                </div>
              </div>
              
              <div>
                <p style={{
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-secondary)',
                  marginBottom: '0.25rem',
                }}>
                  {account.type === 'BANK' ? 'Saldo' : 'Fatura Atual'}
                </p>
                <p style={{
                  fontSize: '0.813rem',
                  fontWeight: 'bold',
                  color: account.balance >= 0 ? 'var(--orx-text-primary)' : 'var(--orx-error)',
                }}>
                  {showBalances ? formatCurrency(account.balance) : '••••••'}
                </p>
                {account.type === 'CREDIT' && (
                  <p style={{
                    fontSize: '0.813rem',
                    color: 'var(--orx-text-secondary)',
                    marginTop: '0.25rem',
                  }}>
                    Disponível: {showBalances ? formatCurrency(account.availableBalance) : '••••••'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Transações */}
      <div className="neumorphic-container p-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{
            fontSize: '0.813rem',
            fontWeight: 'bold',
            color: 'var(--orx-text-primary)',
          }}>
            Transações Recentes
          </h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--orx-gray-300)',
                background: 'var(--orx-bg-light)',
                color: 'var(--orx-text-primary)',
                fontSize: '0.813rem',
              }}
            >
              <option value="all">Todas as contas</option>
              {MOCK_ACCOUNTS.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.bankName} {acc.number}
                </option>
              ))}
            </select>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--orx-gray-300)',
                background: 'var(--orx-bg-light)',
                color: 'var(--orx-text-primary)',
                fontSize: '0.813rem',
              }}
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            
            <button
              className="neumorphic-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
              }}
            >
              <Download style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--orx-gray-200)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.813rem', fontWeight: '600', color: 'var(--orx-text-secondary)' }}>
                  Data
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.813rem', fontWeight: '600', color: 'var(--orx-text-secondary)' }}>
                  Descrição
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.813rem', fontWeight: '600', color: 'var(--orx-text-secondary)' }}>
                  Categoria
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.813rem', fontWeight: '600', color: 'var(--orx-text-secondary)' }}>
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn.id} style={{ borderBottom: '1px solid var(--orx-gray-100)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>
                    {formatDate(txn.date)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.813rem', color: 'var(--orx-text-primary)', fontWeight: '500' }}>
                    {txn.description}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>
                    {txn.category}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    fontSize: '0.813rem', 
                    fontWeight: '600',
                    textAlign: 'right',
                    color: txn.type === 'CREDIT' ? 'var(--orx-success)' : 'var(--orx-error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                  }}>
                    {txn.type === 'CREDIT' ? (
                      <ArrowUpRight style={{ width: '1rem', height: '1rem' }} />
                    ) : (
                      <ArrowDownRight style={{ width: '1rem', height: '1rem' }} />
                    )}
                    {formatCurrency(Math.abs(txn.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Widget */}
      {showWidget && (
        <PluggyConnectWidget
          userId="user-123"
          onSuccess={handleConnectSuccess}
          onError={handleConnectError}
          onClose={() => setShowWidget(false)}
        />
      )}
    </div>
  );
};

export default DashboardFinanceiro;

