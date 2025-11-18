/**
 * Módulo 8: Contas a Receber IA
 * Gestão inteligente de recebíveis com predições e automação
 */

import { useState } from"react";
import { Card } from"@/components/oraclusx-ds";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Bot,
  BarChart3,
  FileText,
} from"lucide-react";
import { useDocumentTitle } from"@/hooks";

export default function ContasReceberIA() {
  useDocumentTitle("Contas a Receber IA");
  const [activeCategory, setActiveCategory] = useState("dashboard");

  const categories = [
    { id:"dashboard", label:"Dashboard IA", icon: Bot, count: 0, trend:"+0" },
    { id:"abertas", label:"Contas Abertas", icon: Clock, count: 0, trend:"+0" },
    { id:"vencidas", label:"Vencidas", icon: AlertCircle, count: 0, trend:"+0" },
    { id:"pagas", label:"Pagas", icon: CheckCircle, count: 0, trend:"+0" },
    { id:"predicoes", label:"Predições IA", icon: BarChart3, count: 0, trend:"+0" },
    { id:"relatorios", label:"Relatórios", icon: FileText, count: 0, trend:"+0" },
  ];

  const kpis = [
    { title:"Total a Receber", value:"R$ 0", trend:"+0%", icon: DollarSign, color:"blue" },
    { title:"Contas Vencidas", value:"0", trend:"+0%", icon: AlertCircle, color:"red" },
    { title:"Taxa Inadimplência", value:"0%", trend:"+0%", icon: TrendingUp, color:"yellow" },
    { title:"Prev. Recebimento", value:"R$ 0", trend:"IA: 95%", icon: Bot, color:"purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Contas a Receber IA</h1>
            <p className="text-[var(--text-secondary)]">
              Gestão inteligente de recebíveis com predições de inadimplência e automação
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--primary)] animate-pulse" />
          <span className="text-body-sm text-[var(--text-primary)] orx-font-medium">IA: 95% precisão</span>
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
              <span className="text-body-xs text-[var(--text-primary)] orx-font-medium">{category.label}</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-body-lg font-display text-[var(--text-primary)]">{category.count}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="neuro-raised p-6 h-[140px]">
              <div className="flex items-start justify-between h-full">
                <div>
                  <p className="text-body-sm text-[var(--text-secondary)] mb-1">{kpi.title}</p>
                  <h3 className="text-heading font-display text-[var(--text-primary)]">{kpi.value}</h3>
                  <p className={`text-body-xs mt-2 flex items-center gap-1 ${
                    kpi.color ==="red" ?"text-error" :
                    kpi.color ==="yellow" ?"text-warning" :
                    kpi.color ==="purple" ?"text-purple-600" :"text-success"
                  }`}>
                    {kpi.color ==="green" && <TrendingUp className="w-3 h-3" />}
                    {kpi.trend}
                  </p>
                </div>
                <div className="p-3 rounded-xl neuro-inset">
                  <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="neuro-raised p-12 text-center">
          <Bot className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-font-medium">Contas a Receber IA</h3>
          <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}

