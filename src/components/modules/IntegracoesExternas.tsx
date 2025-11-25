/**
 * Módulo: Integrações Externas IA
 * APIs externas e webhooks com IA
 */

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/oraclusx-ds';
import { Link2, Zap, Globe, Settings, TrendingUp, CheckCircle } from 'lucide-react';

export const IntegracoesExternas: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ativas');

  const categories = [
    { id: 'ativas', label: 'Ativas', icon: CheckCircle, count: 24, trend: '+5' },
    { id: 'apis', label: 'APIs', icon: Link2, count: 18, trend: '+3' },
    { id: 'webhooks', label: 'Webhooks', icon: Zap, count: 12, trend: '+2' },
    { id: 'terceiros', label: 'Terceiros', icon: Globe, count: 8, trend: '+1' },
  ];

  const kpis = [
    { title: 'Integrações Ativas', value: '24', trend: '+5 hoje', icon: Link2, color: 'blue' },
    { title: 'Chamadas/dia', value: '45.8K', trend: '+12.3%', icon: Zap, color: 'green' },
    { title: 'Taxa Sucesso', value: '99.2%', trend: '+0.8%', icon: CheckCircle, color: 'indigo' },
    { title: 'Latência Média', value: '120ms', trend: '-15ms', icon: TrendingUp, color: 'yellow' },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Integrações Externas IA
            </h1>
            <p className="text-[var(--text-secondary)]">APIs, Webhooks e integrações terceiras</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] rounded-full">
            <Settings className="text-[var(--primary-foreground)] animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-[var(--primary-foreground)] text-body-sm orx-orx-font-medium">
                IA Monitoramento
              </p>
              <p className="text-[var(--primary-foreground)]/70 text-body-xs">99.2% uptime</p>
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
                  className={`relative p-4 rounded-xl transition-all duration-200 ${isActive ? 'neuro-raised text-[var(--primary)] scale-105' : 'bg-surface dark:bg-card text-[var(--text-secondary)]'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${isActive ? 'bg-surface/20' : 'bg-surface dark:bg-muted'}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-body-xs mb-1 orx-orx-font-medium">{category.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-heading font-display text-[0.813rem]">
                          {category.count}
                        </span>
                        <span
                          className={`text-body-xs ${isActive ? 'text-[var(--primary)]/80' : 'text-success'}`}
                        >
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
            const colorClasses = {
              blue: 'bg-[var(--accent)]/10 text-[var(--accent-foreground)]',
              green: 'bg-success/10 text-success',
              indigo: 'bg-[var(--primary)]/10 text-[var(--primary)]',
              yellow: 'bg-warning/10 text-warning',
            };
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
                  <div
                    className={`p-3 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]}`}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Integrações Configuradas</CardTitle>
            <CardDescription>24 integrações ativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Link2 size={64} className="mx-auto text-muted mb-4" />
              <p className="text-[var(--text-secondary)]">APIs e webhooks integrados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegracoesExternas;
