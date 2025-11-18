/**
 * Módulo 29: ChatBot Metrics Dashboard
 * Dashboard de métricas do chatbot
 */

import { useState } from"react";
import { Card } from"@/components/oraclusx-ds";
import { MessageCircle, Users, TrendingUp, Clock, Bot, Star, BarChart3 } from"lucide-react";
import { useDocumentTitle } from"@/hooks";

export function ChatBotMetrics() {
  useDocumentTitle("ChatBot Metrics");
  const [activeCategory, setActiveCategory] = useState("dashboard");

  const categories = [
    { id:"dashboard", label:"Dashboard", icon: BarChart3, count: 0, trend:"+0" },
    { id:"conversas", label:"Conversas", icon: MessageCircle, count: 0, trend:"+0" },
    { id:"usuarios", label:"Usuários", icon: Users, count: 0, trend:"+0" },
    { id:"satisfacao", label:"Satisfação", icon: Star, count: 0, trend:"+0" },
    { id:"performance", label:"Performance", icon: TrendingUp, count: 0, trend:"+0" },
  ];

  const kpis = [
    { title:"Conversas (24h)", value:"0", trend:"+0", icon: MessageCircle, color:"blue" },
    { title:"Usuários Ativos", value:"0", trend:"+0%", icon: Users, color:"green" },
    { title:"Taxa Resolução", value:"0%", trend:"+0%", icon: TrendingUp, color:"indigo" },
    { title:"Tempo Resposta", value:"0s", trend:"+0s", icon: Clock, color:"purple" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">ChatBot Metrics</h1>
            <p className="text-[var(--text-secondary)]">Dashboard de métricas e performance do chatbot</p>
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
          <Bot className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 font-medium">ChatBot Metrics</h3>
          <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}

export default ChatBotMetrics;

