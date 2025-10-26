/**
 * Dashboard Exemplo Completo
 * Demonstração de Charts + Stats + Layout System
 * 100% Neumorphism 3D Premium + Lucide React SVG + OraclusX DS
 */

import { DollarSign, Users, Activity, TrendingUp } from 'lucide-react';
import { Container, Grid } from '@/components/layout';
import { StatCard, LineChartComponent, BarChartComponent, AreaChartComponent, PieChartComponent } from './Charts';

// ============================================
// MOCK DATA
// ============================================

const revenueData = [
  { name: 'Jan', value: 45000 },
  { name: 'Fev', value: 52000 },
  { name: 'Mar', value: 48000 },
  { name: 'Abr', value: 61000 },
  { name: 'Mai', value: 55000 },
  { name: 'Jun', value: 67000 },
];

const salesData = [
  { name: 'Seg', value: 120 },
  { name: 'Ter', value: 150 },
  { name: 'Qua', value: 180 },
  { name: 'Qui', value: 140 },
  { name: 'Sex', value: 200 },
  { name: 'Sab', value: 90 },
  { name: 'Dom', value: 60 },
];

const productsData = [
  { name: 'Próteses', value: 35 },
  { name: 'Órteses', value: 25 },
  { name: 'Implantes', value: 20 },
  { name: 'Materiais', value: 15 },
  { name: 'Outros', value: 5 },
];

// ============================================
// DASHBOARD EXEMPLO
// ============================================

export default function DashboardExemplo() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <Container maxWidth="2xl">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-[var(--text-primary)] mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.813rem',
              fontWeight: 700,
            }}
          >
            Dashboard Executivo
          </h1>
          <p
            className="text-[var(--text-secondary)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          >
            Visão geral das operações em tempo real
          </p>
        </div>

        {/* KPIs */}
        <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="md" className="mb-8">
          <StatCard
            title="Faturamento Mensal"
            value="R$ 67.000"
            trend={12.5}
            icon={DollarSign}
          />
          <StatCard
            title="Novos Clientes"
            value="248"
            trend={8.2}
            icon={Users}
          />
          <StatCard
            title="Cirurgias Agendadas"
            value="34"
            trend={-3.1}
            icon={Activity}
          />
          <StatCard
            title="Taxa de Conversão"
            value="68%"
            trend={5.4}
            icon={TrendingUp}
          />
        </Grid>

        {/* Charts Row 1 */}
        <Grid cols={{ base: 1, lg: 2 }} gap="md" className="mb-8">
          <AreaChartComponent
            data={revenueData}
            dataKey="value"
            title="Faturamento Mensal"
            subtitle="Últimos 6 meses"
            height={300}
          />
          <BarChartComponent
            data={salesData}
            dataKey="value"
            title="Vendas Semanais"
            subtitle="Última semana"
            height={300}
          />
        </Grid>

        {/* Charts Row 2 */}
        <Grid cols={{ base: 1, lg: 2 }} gap="md">
          <PieChartComponent
            data={productsData}
            title="Distribuição de Produtos"
            subtitle="Por categoria"
            height={300}
          />
          <LineChartComponent
            data={revenueData}
            dataKey="value"
            title="Tendência de Crescimento"
            subtitle="Projeção linear"
            height={300}
            color="var(--orx-success)"
          />
        </Grid>
      </Container>
    </div>
  );
}

