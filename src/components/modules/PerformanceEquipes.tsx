import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/oraclusx-ds';
import { Users, TrendingUp, Award, BarChart3, Settings } from 'lucide-react';
export const PerformanceEquipes: React.FC = () => {
  const [a, setA] = useState('geral');
  const cats = [
    { id: 'geral', label: 'Geral', icon: Users, count: 124, trend: '+15' },
    { id: 'det', label: 'Detalhes', icon: TrendingUp, count: 89, trend: '+8' },
    { id: 'ana', label: 'Analytics', icon: Award, count: 56, trend: '+12' },
    { id: 'cfg', label: 'Config', icon: BarChart3, count: 34, trend: '+5' },
  ];
  const kpis = [
    { title: 'Total', value: '303', trend: '+40', icon: Users, color: 'blue' },
    { title: 'Taxa', value: '96.9%', trend: '+2%', icon: TrendingUp, color: 'green' },
    { title: 'IA', value: '96.9%', trend: 'on', icon: Settings, color: 'indigo' },
    { title: 'Perf', value: '98%', trend: '+1%', icon: TrendingUp, color: 'yellow' },
  ];
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Performance Equipes IA
            </h1>
            <p className="text-[var(--text-secondary)]">Sistema IA</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] rounded-full">
            <Settings className="text-[var(--primary-foreground)] animate-spin-slow" size={20} />
            <div className="text-left">
              <p
                className="text-[var(--primary-foreground)] text-body-sm"
                style={{ fontWeight: 500 }}
              >
                IA
              </p>
              <p className="text-[var(--primary-foreground)]/70 text-body-xs">96.9%</p>
            </div>
          </div>
        </header>
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cats.map((c) => {
              const I = c.icon;
              const act = a === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setA(c.id)}
                  className={`p-4 rounded-xl transition-all ${act ? 'neuro-raised text-[var(--primary)] scale-105' : 'bg-surface dark:bg-card'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${act ? 'bg-surface/20' : 'bg-surface dark:bg-muted'}`}
                    >
                      <I size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-body-xs mb-1" style={{ fontWeight: 500 }}>
                        {c.label}
                      </p>
                      <span className="text-heading font-display" style={{ fontSize: '0.813rem' }}>
                        {c.count}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {kpis.map((k, i) => {
            const I = k.icon;
            const cols = {
              blue: 'bg-[var(--accent)]/10 text-[var(--accent-foreground)]',
              green: 'bg-success/10 text-success',
              indigo: 'bg-[var(--primary)]/10 text-[var(--primary)]',
              yellow: 'bg-warning/10 text-warning',
            };
            return (
              <Card key={i} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-[var(--text-secondary)]">{k.title}</p>
                    <p className="text-heading font-display text-[var(--text-primary)] mt-1">
                      {k.value}
                    </p>
                    <Badge variant="default" size="sm" className="mt-2">
                      {k.trend}
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-lg ${cols[k.color as keyof typeof cols]}`}>
                    <I size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Performance Equipes IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-muted mb-4" />
              <p className="text-[var(--text-secondary)]">Módulo operacional IA</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default PerformanceEquipes;
