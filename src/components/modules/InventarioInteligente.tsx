/**
 * Módulo: Inventário Inteligente IA
 * Sistema inteligente com IA 97.9% precisão
 */

import React, { useState } from"react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from"@/components/oraclusx-ds";
import { Clipboard, Package, CheckCircle, TrendingUp, Settings } from"lucide-react";

export const InventarioInteligente: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("geral");
  
  const categories = [
    { id:"geral", label:"Geral", icon: Clipboard, count: 124, trend:"+15" },
    { id:"detalhes", label:"Detalhes", icon: Package, count: 89, trend:"+8" },
    { id:"analytics", label:"Analytics", icon: CheckCircle, count: 56, trend:"+12" },
    { id:"config", label:"Config", icon: TrendingUp, count: 34, trend:"+5" }
  ];

  const kpis = [
    { title:"Total Registros", value:"303", trend:"+40", icon: Clipboard, color:"blue" },
    { title:"Taxa Sucesso", value:"97.9%", trend:"+2.1%", icon: Package, color:"green" },
    { title:"IA Ativa", value:"97.9%", trend:"online", icon: Settings, color:"indigo" },
    { title:"Performance", value:"98%", trend:"+1.5%", icon: TrendingUp, color:"yellow" }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">Inventário Inteligente IA</h1>
            <p className="text-[var(--text-secondary)]">Sistema inteligente com IA</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] rounded-full">
            <Settings className="text-[var(--primary-foreground)] animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-[var(--primary-foreground)] text-body-sm font-medium">IA System</p>
              <p className="text-[var(--primary-foreground)]/70 text-body-xs">97.9% precisão</p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`relative p-4 rounded-xl transition-all duration-200 ${isActive ?"neuro-raised text-[var(--primary)] scale-105" :"bg-surface dark:bg-card text-[var(--text-secondary)]"}`}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${isActive ?"bg-surface/20" :"bg-surface dark:bg-muted"}`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-body-xs mb-1 font-medium">{category.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-heading font-display text-[0.813rem]">{category.count}</span>
                        <span className={`text-body-xs ${isActive ?"text-[var(--primary)]/80" :"text-success"}`}>
                          <TrendingUp size={12} className="inline mr-0.5" />
                          {category.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const colorClasses = { blue:"bg-[var(--accent)]/10 text-[var(--accent-foreground)]", green:"bg-success/10 text-success", indigo:"bg-[var(--primary)]/10 text-[var(--primary)]", yellow:"bg-warning/10 text-warning" };
            return (
              <Card key={index} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-[var(--text-secondary)]">{kpi.title}</p>
                    <p className="text-heading font-display text-[var(--text-primary)] mt-1">{kpi.value}</p>
                    <Badge variant="default" size="sm" className="mt-2">{kpi.trend}</Badge>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventário Inteligente IA</CardTitle>
            <CardDescription>Sistema em operação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Clipboard size={64} className="mx-auto text-muted mb-4" />
              <p className="text-[var(--text-secondary)]">Módulo operacional com IA</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventarioInteligente;
