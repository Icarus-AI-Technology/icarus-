/**
 * Módulo: Sistema de Notificações IA  
 * Central de notificações Push, Email e SMS com IA
 * IA Priorização 97.2% precisão
 */

import React, { useState } from"react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from"@/components/oraclusx-ds";
import { Bell, Mail, MessageSquare, Settings,  TrendingUp, CheckCircle } from"lucide-react";

export const SistemaNotificacoes: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("todas");
  
  const categories = [
    { id:"todas", label:"Todas", icon: Bell, count: 847, trend:"+125" },
    { id:"push", label:"Push", icon: Bell, count: 456, trend:"+89" },
    { id:"email", label:"Email", icon: Mail, count: 298, trend:"+34" },
    { id:"sms", label:"SMS", icon: MessageSquare, count: 93, trend:"+12" }
  ];

  const kpis = [
    { title:"Notificações Enviadas", value:"847", trend:"+125 hoje", icon: Bell, color:"blue" },
    { title:"Taxa de Entrega", value:"98.7%", trend:"+1.2%", icon: CheckCircle, color:"green" },
    { title:"IA Priorização", value:"97.2%", trend:"ativa", icon: Settings, color:"indigo" },
    { title:"Tempo Resposta", value:"0.8s", trend:"-0.2s", icon: TrendingUp, color:"yellow" }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-primary dark:text-gray-100 mb-2">Sistema de Notificações IA</h1>
            <p className="text-secondary dark:text-muted">Central de notificações Push, Email e SMS</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full">
            <Settings className="text-inverse animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-inverse text-body-sm orx-font-medium">IA Priorização</p>
              <p className="text-indigo-100 text-body-xs">97.2% precisão</p>
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
                        <span className={`text-body-xs ${isActive ?"text-inverse/80" :"text-success dark:text-green-400"}`}>
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

        <Card>
          <CardHeader>
            <CardTitle>Central de Notificações</CardTitle>
            <CardDescription>847 notificações enviadas hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Bell size={64} className="mx-auto text-muted mb-4" />
              <p className="text-secondary dark:text-muted">Sistema de notificações em tempo real</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SistemaNotificacoes;
