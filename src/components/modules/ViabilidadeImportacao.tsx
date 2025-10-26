/**
 * Módulo 26: Viabilidade de Importação
 * Análise de custos e viabilidade para importações
 */

import { useState } from"react";
import { Card } from"@/components/oraclusx-ds";
import { Calculator, DollarSign, TrendingUp, Globe, Plane, FileText, BarChart3 } from"lucide-react";
import { useDocumentTitle } from"@/hooks";

export default function ViabilidadeImportacao() {
  useDocumentTitle("Viabilidade de Importação");
  const [activeCategory, setActiveCategory] = useState("dashboard");

  const categories = [
    { id:"dashboard", label:"Dashboard", icon: BarChart3, count: 0, trend:"+0" },
    { id:"simulacoes", label:"Simulações", icon: Calculator, count: 0, trend:"+0" },
    { id:"custos", label:"Custos", icon: DollarSign, count: 0, trend:"+0" },
    { id:"fornecedores", label:"Fornecedores", icon: Globe, count: 0, trend:"+0" },
    { id:"relatorios", label:"Relatórios", icon: FileText, count: 0, trend:"+0" },
  ];

  const kpis = [
    { title:"Simulações Ativas", value:"0", trend:"+0", icon: Calculator, color:"blue" },
    { title:"Viabilidade Média", value:"0%", trend:"+0%", icon: TrendingUp, color:"green" },
    { title:"Economia Est.", value:"$ 0", trend:"+0%", icon: DollarSign, color:"indigo" },
    { title:"Tempo Médio", value:"0d", trend:"+0d", icon: Plane, color:"purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Viabilidade de Importação</h1>
            <p className="text-[var(--text-secondary)]">Análise de custos e viabilidade para importações</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((category) => (
            <button key={category.id} onClick={() => setActiveCategory(category.id)}
              className={`flex flex-col items-center justify-center h-24 text-center rounded-xl transition-all duration-200 ${activeCategory === category.id ?"neuro-raised scale-105" :"neuro-flat hover:neuro-raised"}`}>
              <category.icon className="w-5 h-5 mb-1 text-[var(--primary)]" />
              <span className="text-body-xs text-[var(--text-primary)] font-medium">{category.label}</span>
              <span className="text-body-lg font-display text-[var(--text-primary)] mt-1">{category.count}</span>
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
                  <p className="text-body-xs text-success mt-2"><TrendingUp className="w-3 h-3 inline" /> {kpi.trend}</p>
                </div>
                <div className="p-3 rounded-xl neuro-inset">
                  <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="neuro-raised p-12 text-center">
          <Calculator className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 font-medium">Viabilidade de Importação</h3>
          <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}

