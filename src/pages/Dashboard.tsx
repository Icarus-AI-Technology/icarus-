/**
 * Módulo 1: Dashboard Principal
 * Visão 360° do desempenho da distribuidora OPME em tempo real
 */

import { useState } from"react";
import { Card } from"@/components/oraclusx-ds";
import {
  Home,
  TrendingUp,
  Activity,
  DollarSign,
  Package,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from"lucide-react";
import { useDocumentTitle } from"@/hooks";

export default function Dashboard() {
  useDocumentTitle("Dashboard Principal");
  const [activeCategory, setActiveCategory] = useState("overview");

  const categories = [
    { id:"overview", label:"Visão Geral", icon: Home, count: 0, trend:"+0" },
    { id:"cirurgias", label:"Cirurgias Hoje", icon: Activity, count: 0, trend:"+0" },
    { id:"estoque", label:"Estoque Crítico", icon: Package, count: 0, trend:"+0" },
    { id:"financeiro", label:"Financeiro", icon: DollarSign, count: 0, trend:"+0" },
    { id:"alertas", label:"Alertas", icon: AlertCircle, count: 0, trend:"+0" },
    { id:"analytics", label:"Analytics", icon: BarChart3, count: 0, trend:"+0" },
  ];

  const kpis = [
    { title:"Cirurgias (Mês)", value:"0", trend:"+0%", icon: Activity, color:"blue" },
    { title:"Faturamento", value:"R$ 0", trend:"+0%", icon: DollarSign, color:"green" },
    { title:"Ticket Médio", value:"R$ 0", trend:"+0%", icon: TrendingUp, color:"indigo" },
    { title:"Taxa de Sucesso", value:"0%", trend:"+0%", icon: CheckCircle, color:"purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Dashboard Principal</h1>
            <p className="text-[var(--text-secondary)]">
              Visão consolidada de todos os KPIs críticos do negócio OPME em tempo real
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success/50 animate-pulse" />
            <span className="text-body-sm  text-[var(--text-primary)]" style={{ fontWeight: 500 }}>Realtime Sync</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex flex-col items-center justify-center h-24 text-center rounded-xl transition-all duration-200 ${
                activeCategory === category.id ?"neuro-raised scale-105" :"neuro-flat hover:neuro-raised"
              }`}
            >
              <category.icon className="w-5 h-5 mb-1 text-[var(--primary)]" />
              <span className="text-body-xs  text-[var(--text-primary)]" style={{ fontWeight: 500 }}>{category.label}</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-body-lg font-display text-[var(--text-primary)]">{category.count}</span>
              </div>
            </button>
          ))}
        </div>

        {/* KPIs em Grid 12 Colunas - Conforme Spec */}
        <div className="grid grid-cols-12 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="col-span-12 sm:col-span-6 lg:col-span-3">
              <Card className="neuro-raised p-6 h-[140px]">
                <div className="flex items-start justify-between h-full">
                  <div>
                    <p className="text-body-sm text-[var(--text-secondary)] mb-1">{kpi.title}</p>
                    <h3 className="text-heading font-display text-[var(--text-primary)]">{kpi.value}</h3>
                    <p className="text-body-xs text-success mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {kpi.trend}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl neuro-inset">
                    <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <Card className="neuro-raised p-12 text-center">
          <Home className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm  text-[var(--text-primary)] mb-2" style={{ fontWeight: 500 }}>Dashboard Principal</h3>
          <p className="text-[var(--text-secondary)]">Integração com dados reais em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}
