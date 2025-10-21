/**
 * Dashboard de Compras e Fornecedores - ICARUS v5.0
 * 
 * Visão geral do módulo de compras
 * Design: OraclusX DS - Neumorphism Premium 3D
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  FileSearch,
  ShoppingBag,
  FileText,
  Globe,
  Cpu,
  Link as LinkIcon,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  RefreshCw,
  Plus,
  AlertTriangle,
} from 'lucide-react';

// ========================================
// COMPONENTE DE KPI CARD
// ========================================

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: string;
  subtitle?: string;
}

// KPICard component removed

// ========================================
// DASHBOARD DE COMPRAS
// ========================================

export const DashboardCompras: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Mock de dados (em produção, buscar do banco)
  const kpis = {
    cotacoesAbertas: 23,
    pedidosPendentes: 15,
    notasProcessadas: 142,
    comprasInternacionais: 8,
    valorTotalMes: 'R$ 2.450.000,00',
    economiaIA: 'R$ 187.500,00',
    fornecedoresAtivos: 45,
    tempoMedioCotacao: '2.5 dias',
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart size={32} style={{ color: 'var(--orx-info)' }} />
          <div>
            <h1
              style={{
                fontSize: '0.813rem',
                fontWeight: 700,
                color: 'var(--orx-text-primary)',
                marginBottom: '0.25rem',
                fontFamily: 'var(--orx-font-family)',
              }}
            >
              Compras e Fornecedores
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color: 'var(--orx-text-secondary)',
                fontFamily: 'var(--orx-font-family)',
              }}
            >
              Gestão completa de compras e relacionamento com fornecedores
            </p>
          </div>
        </div>
      </div>

      {/* KPIs Grid - 4 colunas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* KPICard removido - usar estatísticas inline */}}
          onClick={() => navigate('/compras/cotacoes')}
          trend={{ value: 18, direction: 'up' }}
          color="var(--orx-info)"
        />

        {/* KPICard removido - usar estatísticas inline */}}
          onClick={() => navigate('/compras/pedidos')}
          trend={{ value: 12, direction: 'down' }}
          color="var(--orx-purple-500)"
        />

        {/* KPICard removido - usar estatísticas inline */}}
          onClick={() => navigate('/compras/notas')}
          subtitle="Este mês"
          color="var(--orx-success)"
        />

        {/* KPICard removido - usar estatísticas inline */}}
          onClick={() => navigate('/compras/internacionais')}
          subtitle="Em andamento"
          color="var(--orx-warning)"
        />

        {/* KPICard removido - usar estatísticas inline */}}
          trend={{ value: 22, direction: 'up' }}
          color="var(--orx-teal-500)"
        />

        {/* KPICard removido - usar estatísticas inline */}}
          onClick={() => navigate('/compras/ia')}
          subtitle="Sugestões e otimizações"
          color="var(--orx-primary)"
        />

        {/* KPICard removido - usar estatísticas inline */}}
          onClick={() => navigate('/cadastros/fornecedores')}
          color="var(--orx-pink-500)"
        />

        {/* KPICard removido - usar estatísticas inline */}}
          subtitle="Meta: 3 dias"
          color="var(--orx-success)"
        />
      </div>

      {/* Ações Rápidas */}
      <div
        style={{
          background: 'var(--orx-bg-light)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '0.813rem',
            fontWeight: 600,
            color: 'var(--orx-text-primary)',
            marginBottom: '1rem',
            fontFamily: 'var(--orx-font-family)',
          }}
        >
          Ações Rápidas
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => navigate('/compras/cotacoes?action=nova')}
            className="colored-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: 'rgba(59, 130, 246, 0.85)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '0.75rem',
              fontSize: '0.813rem',
              fontWeight: 600,
              fontFamily: 'var(--orx-font-family)',
              cursor: 'pointer',
              transition: 'all 300ms',
              boxShadow: `
                4px 4px 8px rgba(0, 0, 0, 0.12),
                -2px -2px 6px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <Plus size={18} style={{ color: 'white' }} />
            <span style={{ color: 'white' }}>Nova Cotação</span>
          </button>

          <button
            onClick={() => navigate('/compras/pedidos?action=novo')}
            className="colored-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: 'rgba(139, 92, 246, 0.85)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '0.75rem',
              fontSize: '0.813rem',
              fontWeight: 600,
              fontFamily: 'var(--orx-font-family)',
              cursor: 'pointer',
              transition: 'all 300ms',
              boxShadow: `
                4px 4px 8px rgba(0, 0, 0, 0.12),
                -2px -2px 6px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <Plus size={18} style={{ color: 'white' }} />
            <span style={{ color: 'white' }}>Novo Pedido</span>
          </button>

          <button
            onClick={() => navigate('/compras/ia')}
            className="colored-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: 'rgba(99, 102, 241, 0.85)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '0.75rem',
              fontSize: '0.813rem',
              fontWeight: 600,
              fontFamily: 'var(--orx-font-family)',
              cursor: 'pointer',
              transition: 'all 300ms',
              boxShadow: `
                4px 4px 8px rgba(0, 0, 0, 0.12),
                -2px -2px 6px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <Cpu size={18} style={{ color: 'white' }} />
            <span style={{ color: 'white' }}>Sugestões IA</span>
          </button>

          <button
            onClick={() => navigate('/cadastros/fornecedores')}
            className="colored-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: 'rgba(20, 184, 166, 0.85)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '0.75rem',
              fontSize: '0.813rem',
              fontWeight: 600,
              fontFamily: 'var(--orx-font-family)',
              cursor: 'pointer',
              transition: 'all 300ms',
              boxShadow: `
                4px 4px 8px rgba(0, 0, 0, 0.12),
                -2px -2px 6px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <Package size={18} style={{ color: 'white' }} />
            <span style={{ color: 'white' }}>Gerenciar Fornecedores</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      <div
        style={{
          background: 'var(--orx-bg-light)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} style={{ color: 'var(--orx-warning)' }} />
          <h2
            style={{
              fontSize: '0.813rem',
              fontWeight: 600,
              color: 'var(--orx-text-primary)',
              fontFamily: 'var(--orx-font-family)',
            }}
          >
            Alertas e Pendências
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
            }}
          >
            <p
              style={{
                fontSize: '0.813rem',
                color: 'var(--orx-text-primary)',
                fontFamily: 'var(--orx-font-family)',
              }}
            >
              <strong>5 cotações</strong> aguardando resposta há mais de 3 dias
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '0.75rem',
            }}
          >
            <p
              style={{
                fontSize: '0.813rem',
                color: 'var(--orx-text-primary)',
                fontFamily: 'var(--orx-font-family)',
              }}
            >
              <strong>3 pedidos</strong> com atraso na entrega
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.75rem',
            }}
          >
            <p
              style={{
                fontSize: '0.813rem',
                color: 'var(--orx-text-primary)',
                fontFamily: 'var(--orx-font-family)',
              }}
            >
              <strong>IA sugere:</strong> Consolidar compras de 3 fornecedores (economia estimada de R$ 23.500,00)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCompras;

