/**
 * Dashboards Analíticos - ICARUS v5.0
 * Centro de inteligência e análise de dados
 */

import { useState } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Package, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface Dashboard {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'financeiro' | 'operacional' | 'comercial' | 'compliance';
  icon: typeof BarChart3;
  metricas_chave: number;
}

const DASHBOARDS: Dashboard[] = [
  {
    id: '1',
    nome: 'Dashboard Executivo',
    descricao: 'Visão consolidada de todos os KPIs',
    categoria: 'operacional',
    icon: Activity,
    metricas_chave: 12
  },
  {
    id: '2',
    nome: 'Análise Financeira',
    descricao: 'Receitas, despesas e fluxo de caixa',
    categoria: 'financeiro',
    icon: DollarSign,
    metricas_chave: 8
  },
  {
    id: '3',
    nome: 'Performance de Vendas',
    descricao: 'Pipeline, conversão e faturamento',
    categoria: 'comercial',
    icon: TrendingUp,
    metricas_chave: 10
  },
  {
    id: '4',
    nome: 'Gestão de Estoque',
    descricao: 'Giro, ruptura e validade',
    categoria: 'operacional',
    icon: Package,
    metricas_chave: 6
  }
];

export default function DashboardsAnaliticos() {
  useDocumentTitle('Dashboards Analíticos');
  const navigate = useNavigate();
  const [dashboards] = useState<Dashboard[]>(DASHBOARDS);

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <NeumoButton variant="secondary" leftIcon={ArrowLeft} onClick={() => navigate('/relatorios')} className="mb-4">
            Voltar
          </NeumoButton>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
              <BarChart3 className="w-6 h-6 text-orx-primary" />
            </div>
            <div>
              <h1 className="orx-text-3xl orx-orx-font-bold text-orx-text-primary">Dashboards Analíticos</h1>
              <p className="text-orx-text-secondary mt-1">Centro de inteligência e análise de dados</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo hover:shadow-neumo-lg transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-orx-primary/10">
                  <dashboard.icon className="w-8 h-8 text-orx-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="orx-text-xl orx-orx-font-semibold text-orx-text-primary">
                      {dashboard.nome}
                    </h3>
                    <span className={`px-3 py-1 orx-text-xs orx-orx-font-medium rounded-lg ${
                      dashboard.categoria === 'financeiro' ? 'bg-orx-success/10 text-orx-success' :
                      dashboard.categoria === 'comercial' ? 'bg-orx-info/10 text-orx-info' :
                      dashboard.categoria === 'operacional' ? 'bg-orx-warning/10 text-orx-warning' :
                      'bg-orx-primary/10 text-orx-primary'
                    }`}>
                      {dashboard.categoria.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-orx-text-secondary mb-4">
                    {dashboard.descricao}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="orx-text-xs text-orx-text-muted">Métricas-chave</p>
                      <p className="orx-text-lg orx-orx-font-bold text-orx-text-primary">
                        {dashboard.metricas_chave} KPIs
                      </p>
                    </div>
                    
                    <NeumoButton variant="secondary" size="sm">
                      Visualizar
                    </NeumoButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
          <h2 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Exportar Dados', 'Configurar Alertas', 'Agendar Relatório', 'Compartilhar'].map((action, idx) => (
              <NeumoButton key={idx} variant="secondary" size="sm" className="w-full">
                {action}
              </NeumoButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

