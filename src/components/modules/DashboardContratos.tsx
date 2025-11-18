/**
 * Módulo: Dashboard Contratos IA
 * Analytics de contratos com IA
 */

import React, { useState } from"react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Progress } from"@/components/oraclusx-ds";
import { BarChart3, PieChart, TrendingUp, DollarSign, Settings } from"lucide-react";

export const DashboardContratos: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("visao-geral");
  
  const categories = [
    { id:"visao-geral", label:"Visão Geral", icon: BarChart3, count: 142, trend:"contratos" },
    { id:"financeiro", label:"Financeiro", icon: DollarSign, count:"8.4M", trend:"valor" },
    { id:"performance", label:"Performance", icon: TrendingUp, count:"98%", trend:"taxa" },
    { id:"analytics", label:"Analytics", icon: PieChart, count: 24, trend:"métricas" }
  ];

  const kpis = [
    { title:"Contratos Totais", value:"142", trend:"+12", icon: BarChart3, color:"blue" },
    { title:"Valor Anual", value:"R$ 8.4M", trend:"+15.3%", icon: DollarSign, color:"green" },
    { title:"Taxa Renovação", value:"94.7%", trend:"+2.1%", icon: TrendingUp, color:"indigo" },
    { title:"IA Insights", value:"156", trend:"hoje", icon: Settings, color:"yellow" }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-primary dark:text-gray-100 mb-2">Dashboard Contratos IA</h1>
            <p className="text-secondary dark:text-muted">Analytics e insights de contratos</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full">
            <Settings className="text-inverse animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-inverse text-body-sm orx-font-medium">IA Analytics</p>
              <p className="text-indigo-100 text-body-xs">156 insights</p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`relative p-4 rounded-xl transition-all duration-200 ${isActive ?"bg-primary text-inverse shadow-lg scale-105" :"bg-surface dark:bg-card text-secondary dark:text-muted hover:shadow-md hover:scale-102"}`}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${isActive ?"bg-surface/20" :"bg-surface dark:bg-muted"}`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-body-xs mb-1 orx-font-medium">{category.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-heading font-display text-[0.813rem]">{category.count}</span>
                        <span className={`text-body-xs ${isActive ?"text-inverse/80" :"text-secondary dark:text-muted"}`}>
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
            const colorClasses = { blue:"bg-blue-100 dark:bg-blue-900/30 text-accent dark:text-accent-light", green:"bg-success/10 dark:bg-green-900/30 text-success dark:text-green-400", indigo:"bg-indigo-100 dark:bg-indigo-900/30 text-primary dark:text-indigo-400", yellow:"bg-warning/10 dark:bg-yellow-900/30 text-warning dark:text-yellow-400" };
            return (
              <Card key={index} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-secondary dark:text-muted">{kpi.title}</p>
                    <p className="text-heading font-display text-primary dark:text-gray-100 mt-1">{kpi.value}</p>
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Contratos</CardTitle>
              <CardDescription>Métricas principais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-secondary dark:text-muted">Taxa Renovação</span>
                    <span className="text-body-sm orx-font-medium">94.7%</span>
                  </div>
                  <Progress value={94.7} variant="success" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-secondary dark:text-muted">Satisfação Cliente</span>
                    <span className="text-body-sm orx-font-medium">91.2%</span>
                  </div>
                  <Progress value={91.2} variant="primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights IA</CardTitle>
              <CardDescription>Recomendações automáticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Renovação prioritária","Oportunidade upsell","Risco de churn"].map((insight, i) => (
                  <div key={i} className="p-3 bg-surface dark:bg-card rounded-lg">
                    <p className="text-body-sm text-primary dark:text-gray-100">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardContratos;
