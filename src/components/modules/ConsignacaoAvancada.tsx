/**
 * Módulo 19: Consignação Avançada
 * Gestão de materiais em consignação
 */

import { useState } from"react";
import { Card } from"@/components/oraclusx-ds";
import { Package, MapPin, TrendingUp, Calendar, AlertCircle, CheckCircle, BarChart3 } from"lucide-react";
import { useDocumentTitle } from"@/hooks";

export default function ConsignacaoAvancada() {
  useDocumentTitle("Consignação Avançada");
  const [activeCategory, setActiveCategory] = useState("dashboard");

  const categories = [
    { id:"dashboard", label:"Dashboard", icon: BarChart3, count: 0, trend:"+0" },
    { id:"kits", label:"Kits Ativos", icon: Package, count: 0, trend:"+0" },
    { id:"locais", label:"Locais", icon: MapPin, count: 0, trend:"+0" },
    { id:"alertas", label:"Alertas", icon: AlertCircle, count: 0, trend:"+0" },
    { id:"devolvidos", label:"Devolvidos", icon: CheckCircle, count: 0, trend:"+0" },
  ];

  const kpis = [
    { title:"Kits Consignados", value:"0", trend:"+0%", icon: Package, color:"blue" },
    { title:"Valor Total", value:"R$ 0", trend:"+0%", icon: TrendingUp, color:"green" },
    { title:"Vencendo", value:"0", trend:"próx. 7d", icon: AlertCircle, color:"yellow" },
    { title:"Tempo Médio", value:"0d", trend:"+0d", icon: Calendar, color:"purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Consignação Avançada</h1>
            <p className="text-[var(--text-secondary)]">Gestão completa de kits e materiais em consignação</p>
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
          <Package className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 font-medium">Consignação Avançada</h3>
          <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}
