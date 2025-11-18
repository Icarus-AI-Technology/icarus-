/**
 * Módulo: Configurações Sistema IA
 * Central de configurações com IA
 */

import React, { useState } from"react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from"@/components/oraclusx-ds";
import { Settings, Shield, Bell, Users, TrendingUp, CheckCircle } from"lucide-react";

export const ConfiguracoesSistema: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("geral");
  
  const categories = [
    { id:"geral", label:"Geral", icon: Settings, count: 24, trend:"configs" },
    { id:"seguranca", label:"Segurança", icon: Shield, count: 12, trend:"políticas" },
    { id:"notificacoes", label:"Notificações", icon: Bell, count: 8, trend:"canais" },
    { id:"usuarios", label:"Usuários", icon: Users, count: 847, trend:"ativos" }
  ];

  const kpis = [
    { title:"Configs Ativas", value:"44", trend:"sistemas", icon: Settings, color:"blue" },
    { title:"Segurança", value:"100%", trend:"conforme", icon: Shield, color:"green" },
    { title:"IA Otimização", value:"98.4%", trend:"ativa", icon: TrendingUp, color:"indigo" },
    { title:"Uptime", value:"99.97%", trend:"30 dias", icon: CheckCircle, color:"yellow" }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-primary dark:text-gray-100 mb-2">Configurações Sistema IA</h1>
            <p className="text-secondary dark:text-muted">Central de configurações e preferências</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full">
            <Settings className="text-inverse animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-inverse text-body-sm orx-font-medium">IA Otimização</p>
              <p className="text-indigo-100 text-body-xs">98.4% ativa</p>
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
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Preferências do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Tema escuro/claro","Idioma do sistema","Fuso horário","Formato de data"].map((config, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface dark:bg-card rounded-lg">
                    <span className="text-body-sm text-primary dark:text-gray-100">{config}</span>
                    <CheckCircle className="text-success" size={18} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Políticas e proteções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["2FA obrigatório","Firewall ativo","Backup automático","Criptografia end-to-end"].map((sec, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface dark:bg-card rounded-lg">
                    <span className="text-body-sm text-primary dark:text-gray-100">{sec}</span>
                    <Shield className="text-success" size={18} />
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

export default ConfiguracoesSistema;
