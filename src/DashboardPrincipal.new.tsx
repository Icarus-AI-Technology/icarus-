/**
 * Dashboard Principal - ICARUS v5.0
 * Design atualizado conforme mockup oficial
 * OraclusX Design System - Neumorphism Premium
 */

import { useState } from "react";
import { 
  Activity, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  MapPin, 
  AlertTriangle, 
  Truck, 
  Brain,
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useDocumentTitle } from "@/hooks";

export default function DashboardPrincipal() {
  useDocumentTitle("Dashboard Principal - ICARUS v5.0");
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--orx-bg-light)] dark:bg-[var(--orx-bg-dark)]">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--orx-text-primary)] mb-1">
              Dashboard Principal
            </h1>
            <p className="text-sm text-[var(--orx-text-secondary)]">
              Visão geral do sistema ICARUS v5.0
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="orx-button-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar Dados
            </button>
            <button
              className="orx-button-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
            >
              <FileText size={16} />
              Relatório Completo
            </button>
          </div>
        </div>

        {/* KPI Cards Grid - Primeira Linha */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Sistema Status */}
          <div className="orx-card p-5 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[var(--orx-text-secondary)] font-medium">
                Sistema Status
              </p>
              <p className="text-3xl font-bold text-[var(--orx-text-primary)]">
                98%
              </p>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={14} />
                <span>+2.3%</span>
              </div>
            </div>
          </div>

          {/* Médicos Ativos */}
          <div className="orx-card p-5 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[var(--orx-text-secondary)] font-medium">
                Médicos Ativos
              </p>
              <p className="text-3xl font-bold text-[var(--orx-text-primary)]">
                1.847
              </p>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={14} />
                <span>+12.5%</span>
              </div>
            </div>
          </div>

          {/* Produtos OPME */}
          <div className="orx-card p-5 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[var(--orx-text-secondary)] font-medium">
                Produtos OPME
              </p>
              <p className="text-3xl font-bold text-[var(--orx-text-primary)]">
                12.4K
              </p>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={14} />
                <span>+5.2%</span>
              </div>
            </div>
          </div>

          {/* Pedidos Urgentes */}
          <div className="orx-card p-5 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900">
                <ShoppingCart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[var(--orx-text-secondary)] font-medium">
                Pedidos Urgentes
              </p>
              <p className="text-3xl font-bold text-[var(--orx-text-primary)]">
                89
              </p>
              <div className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                <TrendingDown size={14} />
                <span>-8.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda Linha - Cards Grandes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Faturamento Mensal */}
          <div className="orx-card p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900">
                <DollarSign className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--orx-text-secondary)] font-medium mb-2">
                  Faturamento Mensal
                </p>
                <p className="text-4xl font-bold text-[var(--orx-text-primary)] mb-1">
                  R$ 3.8M
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--orx-text-secondary)]">R$ 127K média diária</span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp size={12} />
                    <span>+15.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribuição Geográfica */}
          <div className="orx-card p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950 dark:to-purple-900">
                <MapPin className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--orx-text-secondary)] font-medium mb-2">
                  Distribuição Geográfica
                </p>
                <p className="text-4xl font-bold text-[var(--orx-text-primary)] mb-1">
                  147
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--orx-text-secondary)]">28 cidades</span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp size={12} />
                    <span>+8.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terceira Linha - Cards de Alerta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Estoque Crítico */}
          <div className="orx-card p-5 rounded-2xl border-l-4 border-red-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--orx-text-primary)]">
                  Estoque Crítico
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--orx-text-primary)] mb-1">
              8
            </p>
            <p className="text-xs text-[var(--orx-text-secondary)]">
              produtos em falta
            </p>
          </div>

          {/* Logística */}
          <div className="orx-card p-5 rounded-2xl border-l-4 border-emerald-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--orx-text-primary)]">
                  Logística
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--orx-text-primary)] mb-1">
              96.2%
            </p>
            <p className="text-xs text-[var(--orx-text-secondary)]">
              entregas no prazo
            </p>
          </div>

          {/* Performance IA */}
          <div className="orx-card p-5 rounded-2xl border-l-4 border-purple-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--orx-text-primary)]">
                  Performance IA
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--orx-text-primary)] mb-1">
              97.3%
            </p>
            <p className="text-xs text-[var(--orx-text-secondary)]">
              precisão do sistema
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

