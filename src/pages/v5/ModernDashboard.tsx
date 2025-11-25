import {
  Activity,
  Users,
  Package,
  AlertCircle,
  FileText,
  Receipt,
  Calculator,
  Database,
  Settings,
  BarChart3,
  MapPin,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { StatsCard } from '../../features/modern-dashboard/components/StatsCard';
import { QuickActions } from '../../features/modern-dashboard/components/QuickActions';
import { FinancialChart } from '../../features/modern-dashboard/components/FinancialChart';
import { OperationalMetrics } from '../../features/modern-dashboard/components/OperationalMetrics';

export function ModernDashboard() {
  // Mock data para o gráfico financeiro
  const financialData = Array.from({ length: 30 }, (_, i) => ({
    value: 3500000 + Math.random() * 500000,
  }));

  // Mock data para estoque crítico
  const stockData = Array.from({ length: 7 }, () => ({
    value: Math.floor(Math.random() * 15),
  }));

  const quickActions = [
    { icon: FileText, label: 'Novo Pedido', variant: 'primary' as const },
    { icon: Receipt, label: 'Nova NF', variant: 'primary' as const },
    { icon: Calculator, label: 'Orçamento', variant: 'primary' as const },
    { icon: Database, label: 'Cadastro', variant: 'primary' as const },
    { icon: BarChart3, label: 'Relatórios', variant: 'primary' as const },
    { icon: Settings, label: 'Configurar', variant: 'primary' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral do sistema ICARUS v5.0</p>
      </div>

      {/* KPI Cards - Grid Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Activity}
          title="Sistema Status"
          value="Online"
          subtitle="Todos os serviços operacionais"
          change={{ value: 2.3, isPositive: true }}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatsCard
          icon={Users}
          title="Médicos Ativos"
          value={847}
          subtitle="Cirurgiões cadastrados"
          change={{ value: 15, isPositive: true }}
          iconColor="text-violet-600"
          iconBgColor="bg-violet-100"
        />
        <StatsCard
          icon={Package}
          title="Produtos OPME"
          value="2.4K"
          subtitle="Itens no catálogo"
          change={{ value: 8.1, isPositive: true }}
          iconColor="text-cyan-600"
          iconBgColor="bg-cyan-100"
        />
        <StatsCard
          icon={AlertCircle}
          title="Pedidos Urgentes"
          value={12}
          subtitle="Requerem atenção"
          change={{ value: -3.2, isPositive: false }}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-100"
        />
      </div>

      {/* Métricas Financeiras e Geográficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialChart
          title="Faturamento Mensal"
          value="R$ 3.8M"
          data={financialData}
          color="#7c3aed"
          change={{ value: 12.5, isPositive: true }}
        />
        <div className="modern-card p-6">
          <p className="text-sm font-medium text-slate-500 mb-2">Distribuição Geográfica</p>
          <div className="flex items-end gap-4">
            <h3 className="text-4xl font-bold text-slate-900">147</h3>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-slate-600">cidades atendidas</span>
            </div>
          </div>
          <div className="mt-4 h-20 bg-gradient-to-r from-violet-100 via-violet-200 to-violet-300 rounded-lg"></div>
        </div>
      </div>

      {/* Métricas Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OperationalMetrics
          metrics={[
            {
              title: 'Estoque Crítico',
              value: 8,
              subtitle: 'Itens abaixo do mínimo',
              data: stockData,
              status: 'critical',
            },
            {
              title: 'Logística',
              value: '96.2%',
              subtitle: 'Taxa de entrega no prazo',
              status: 'success',
            },
            {
              title: 'Performance IA',
              value: '97.3%',
              subtitle: 'Acurácia dos modelos',
              status: 'success',
            },
          ]}
        />
      </div>

      {/* Ações Rápidas */}
      <QuickActions actions={quickActions} />

      {/* Widgets Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="modern-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-violet-100">
              <TrendingUp className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-900">Tendências</h3>
          </div>
          <p className="text-sm text-slate-600">
            Análise de vendas e previsões para os próximos 30 dias
          </p>
        </div>

        <div className="modern-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900">Automações</h3>
          </div>
          <p className="text-sm text-slate-600">24 processos automatizados ativos no sistema</p>
        </div>

        <div className="modern-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-cyan-100">
              <BarChart3 className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="font-bold text-slate-900">Relatórios</h3>
          </div>
          <p className="text-sm text-slate-600">
            Acesse relatórios detalhados e insights de negócio
          </p>
        </div>
      </div>
    </div>
  );
}
