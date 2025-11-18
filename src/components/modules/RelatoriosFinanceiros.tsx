/**
 * Módulo 9: Relatórios Financeiros
 * Relatórios financeiros completos e personalizáveis
 */

import { Card } from"@/components/oraclusx-ds";
import { useState } from "react";
import {
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  LineChart,
} from"lucide-react";
import { useDocumentTitle } from"@/hooks";

export default function RelatoriosFinanceiros() {
  useDocumentTitle("Relatórios Financeiros");
  const [activeCategory, setActiveCategory] = useState("dashboard");

  const categories = [
    { id:"dashboard", label:"Dashboard", icon: BarChart3, count: 0, trend:"+0" },
    { id:"dre", label:"DRE", icon: FileText, count: 0, trend:"+0" },
    { id:"fluxo", label:"Fluxo Caixa", icon: TrendingUp, count: 0, trend:"+0" },
    { id:"balanco", label:"Balanço", icon: PieChart, count: 0, trend:"+0" },
    { id:"analises", label:"Análises", icon: LineChart, count: 0, trend:"+0" },
    { id:"export", label:"Exportar", icon: Download, count: 0, trend:"+0" },
  ];

  const kpis = [
    { title:"Receita Total", value:"R$ 0", trend:"+0%", icon: DollarSign, color:"green" },
    { title:"Lucro Líquido", value:"R$ 0", trend:"+0%", icon: TrendingUp, color:"blue" },
    { title:"Margem (%)", value:"0%", trend:"+0%", icon: PieChart, color:"indigo" },
    { title:"EBITDA", value:"R$ 0", trend:"+0%", icon: BarChart3, color:"purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Relatórios Financeiros</h1>
            <p className="text-[var(--text-secondary)]">
              Relatórios completos: DRE, Fluxo de Caixa, Balanço e Análises
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">Out/2025</span>
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
              <span className="text-body-xs text-[var(--text-primary)] orx-orx-font-medium">{category.label}</span>
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
          ))}
        </div>

        <Card className="neuro-raised p-12 text-center">
          <FileText className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">Relatórios Financeiros</h3>
          <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}

