/**
 * Módulo: BI & Analytics IA
 * Business Intelligence com dashboards avançados e IA preditiva
 * IA Predição 96.5% precisão
 */

import React, { useState } from"react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Progress,
} from"@/components/oraclusx-ds";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Users,
} from"lucide-react";

export const BIAnalytics: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("geral");

  const categories = [
    { id:"geral", label:"Visão Geral", icon: BarChart3, count: 12, trend:"dashboards" },
    { id:"financeiro", label:"Financeiro", icon: DollarSign, count: 8, trend:"relatórios" },
    { id:"operacional", label:"Operacional", icon: Activity, count: 15, trend:"métricas" },
    { id:"clientes", label:"Clientes", icon: Users, count: 6, trend:"análises" },
  ];

  const kpis = [
    {
      title:"Faturamento Anual",
      value:"R$ 45.8M",
      trend:"+28.3%",
      icon: DollarSign,
      color:"green",
    },
    {
      title:"Crescimento Mensal",
      value:"+18.5%",
      trend:"vs mês anterior",
      icon: TrendingUp,
      color:"blue",
    },
    {
      title:"Margem Operacional",
      value:"42.7%",
      trend:"+3.2%",
      icon: PieChart,
      color:"indigo",
    },
    {
      title:"ROI Médio",
      value:"287%",
      trend:"+45%",
      icon: Activity,
      color:"yellow",
    },
  ];

  const dashboards = [
    { id: 1, titulo:"Performance Financeira", categoria:"Financeiro", metricas: 24, ultimaAtualizacao:"Há 5 min", status:"ativo" },
    { id: 2, titulo:"Operações Cirúrgicas", categoria:"Operacional", metricas: 18, ultimaAtualizacao:"Há 12 min", status:"ativo" },
    { id: 3, titulo:"Satisfação de Clientes", categoria:"Clientes", metricas: 12, ultimaAtualizacao:"Há 1 hora", status:"ativo" },
    { id: 4, titulo:"Estoque e Logística", categoria:"Operacional", metricas: 20, ultimaAtualizacao:"Há 30 min", status:"ativo" },
  ];

  const predicoes = [
    { titulo:"Faturamento Próximo Mês", valor:"R$ 4.2M", confianca: 96.5, tendencia:"alta" },
    { titulo:"Demanda OPME Q4", valor:"+32%", confianca: 94.2, tendencia:"alta" },
    { titulo:"Redução Custos", valor:"-8.5%", confianca: 91.8, tendencia:"baixa" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">BI & Analytics IA</h1>
            <p className="text-[var(--text-secondary)]">Business Intelligence com predições e insights avançados</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] rounded-full">
            <Settings className="text-[var(--primary-foreground)] animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-[var(--primary-foreground)] text-body-sm orx-orx-font-medium">IA Predição</p>
              <p className="text-[var(--primary-foreground)]/70 text-body-xs">96.5% precisão</p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    relative p-4 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ?"neuro-raised text-[var(--primary)] scale-105"
                        :"bg-surface dark:bg-card text-[var(--text-secondary)]"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive ?"bg-surface/20" :"bg-surface dark:bg-muted"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-body-xs mb-1 orx-orx-font-medium">{category.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-heading font-display text-[0.813rem]">{category.count}</span>
                        <span
                          className={`text-body-xs ${
                            isActive ?"text-[var(--primary)]/80" :"text-[var(--text-secondary)]"
                          }`}
                        >
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
            const colorClasses = {
              green:"bg-success/10 text-success",
              blue:"bg-[var(--accent)]/10 text-[var(--accent-foreground)]",
              indigo:"bg-[var(--primary)]/10 text-[var(--primary)]",
              yellow:"bg-warning/10 text-warning",
            } as const;

            return (
              <Card key={index} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-[var(--text-secondary)]">{kpi.title}</p>
                    <p className="text-heading font-display text-[var(--text-primary)] mt-1">
                      {kpi.value}
                    </p>
                    <Badge variant="default" size="sm" className="mt-2">
                      {kpi.trend}
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dashboards Ativos</CardTitle>
                  <CardDescription className="mt-1">
                    {dashboards.length} dashboards em tempo real
                  </CardDescription>
                </div>
                <Button size="sm" variant="default" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Período
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboards.map((dash) => (
                  <div
                    key={dash.id}
                    className="p-4 bg-surface dark:bg-card rounded-lg hover:neuro-raised transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-[var(--text-primary)] mb-1 orx-orx-font-medium">
                          {dash.titulo}
                        </h4>
                        <p className="text-body-xs text-[var(--text-secondary)]">
                          {dash.metricas} métricas · {dash.ultimaAtualizacao}
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        {dash.categoria}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Activity size={14} className="text-success" />
                      <span className="text-body-xs text-success orx-orx-font-medium">
                        Atualizado em tempo real
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Predições IA</CardTitle>
              <CardDescription className="mt-1">
                Insights preditivos para próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predicoes.map((pred, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm text-[var(--text-secondary)]">
                        {pred.titulo}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                          {pred.valor}
                        </span>
                        <TrendingUp
                          size={14}
                          className={
                            pred.tendencia ==="alta" ?"text-success" :"text-error"
                          }
                        />
                      </div>
                    </div>
                    <Progress value={pred.confianca} variant="primary" />
                    <p className="text-body-xs text-[var(--text-secondary)] mt-1">
                      Confiança: {pred.confianca}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="default" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filtrar
                </Button>
                <Button size="sm" variant="primary" className="flex items-center gap-2">
                  <Download size={16} />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {["Financeiro Completo","Operacional Mensal","Análise de Clientes"].map(
                (rel, i) => (
                  <div
                    key={i}
                    className="p-4 border border-[var(--border)] rounded-lg hover:neuro-raised transition-all cursor-pointer"
                  >
                    <BarChart3 className="text-[var(--text-primary)] mb-2" size={24} />
                    <h4 className="text-[var(--text-primary)] mb-1 orx-orx-font-medium">
                      {rel}
                    </h4>
                    <p className="text-body-xs text-[var(--text-secondary)]">Gerado automaticamente</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BIAnalytics;

