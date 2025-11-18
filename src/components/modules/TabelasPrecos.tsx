/**
 * Módulo 23-25: Tabelas de Preços (Viewer, Form, Import)
 * Sistema completo de gestão de tabelas de preços
 */

import { useState } from"react";
import { Card } from"@/components/oraclusx-ds";
import { DollarSign, Eye, Edit, Upload, Download, TrendingUp, BarChart3 } from"lucide-react";
import { useDocumentTitle } from"@/hooks";

export default function TabelasPrecos() {
  useDocumentTitle("Tabelas de Preços");
  const [activeCategory, setActiveCategory] = useState("viewer");

  const categories = [
    { id:"viewer", label:"Visualizar", icon: Eye, count: 0, trend:"+0" },
    { id:"form", label:"Editar", icon: Edit, count: 0, trend:"+0" },
    { id:"import", label:"Importar", icon: Upload, count: 0, trend:"+0" },
    { id:"export", label:"Exportar", icon: Download, count: 0, trend:"+0" },
    { id:"analytics", label:"Analytics", icon: BarChart3, count: 0, trend:"+0" },
  ];

  const kpis = [
    { title:"Tabelas Ativas", value:"0", trend:"+0", icon: DollarSign, color:"blue" },
    { title:"Total Produtos", value:"0", trend:"+0", icon: Eye, color:"green" },
    { title:"Preço Médio", value:"R$ 0", trend:"+0%", icon: TrendingUp, color:"indigo" },
    { title:"Última Atualização", value:"0d", trend:"+0d", icon: Edit, color:"purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Tabelas de Preços</h1>
            <p className="text-[var(--text-secondary)]">Gestão completa: Viewer, Form e Import</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((category) => (
            <button key={category.id} onClick={() => setActiveCategory(category.id)}
              className={`flex flex-col items-center justify-center h-24 text-center rounded-xl transition-all duration-200 ${activeCategory === category.id ?"neuro-raised scale-105" :"neuro-flat hover:neuro-raised"}`}>
              <category.icon className="w-5 h-5 mb-1 text-[var(--primary)]" />
              <span className="text-body-xs text-[var(--text-primary)] orx-orx-font-medium">{category.label}</span>
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
                  <p className="text-body-xs text-success mt-2">{kpi.trend}</p>
                </div>
                <div className="p-3 rounded-xl neuro-inset">
                  <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="neuro-raised p-12 text-center">
          <DollarSign className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">Tabelas de Preços</h3>
          <p className="text-[var(--text-secondary)]">Módulos 23, 24 e 25 unificados - Em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}

