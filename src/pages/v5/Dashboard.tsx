import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Activity,
  Calendar,
  AlertTriangle,
  Truck,
  Cpu,
  FileText,
} from 'lucide-react';
import { Card, CardBody, Chip } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { SecondaryCard } from '../../components/SecondaryCard';
import AgendaOPME from '../../components/modules/AgendaOPME';

interface StatCardProps {
  title: string;
  subtitle: string;
  value: string;
  trend: 'up' | 'down';
  trendValue: string;
  icon: React.ElementType;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  value,
  trend,
  trendValue,
  icon: Icon,
  iconColor,
}) => (
  <Card 
    className="bg-[#11131f] border border-white/5 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 group relative overflow-hidden"
    shadow="lg"
    style={{ borderRadius: '2rem' }}
  >
    <CardBody className="p-6">
      {/* Background decoration glow */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${iconColor}`}
      ></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10 text-white`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
        <Chip
          size="sm"
          variant="flat"
          color={trend === 'up' ? 'success' : 'danger'}
          startContent={trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          classNames={{
            base: trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400',
            content: "font-bold text-xs flex items-center gap-1 px-1"
          }}
        >
          {trendValue}
        </Chip>
      </div>
    </CardBody>
  </Card>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="p-2">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Dashboard Principal</h2>
          <p className="text-gray-400 text-sm">Visão geral do sistema ICARUS v5.0</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-900/20"
            radius="lg"
            startContent={<Activity size={16} />}
          >
            Atualizar Dados
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-900/20"
            radius="lg"
          >
            Relatório Completo
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Sistema Status"
          subtitle="Disponibilidade"
          value="98%"
          trend="up"
          trendValue="+2.3%"
          icon={Activity}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="Médicos Ativos"
          subtitle="Últimos 30 dias"
          value="1.847"
          trend="up"
          trendValue="+12.5%"
          icon={Users}
          iconColor="bg-indigo-500"
        />
        <StatCard
          title="Produtos OPME"
          subtitle="Catálogo homologado"
          value="12.4K"
          trend="up"
          trendValue="+5.2%"
          icon={Package}
          iconColor="bg-orange-500"
        />
        <StatCard
          title="Pedidos Urgentes"
          subtitle="Últimos 7 dias"
          value="89"
          trend="down"
          trendValue="-8.1%"
          icon={Calendar}
          iconColor="bg-pink-500"
        />
      </div>

      {/* Big Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faturamento - Coluna Larga */}
        <Card 
          className="lg:col-span-2 bg-[#11131f] border border-white/5 shadow-lg relative overflow-hidden"
          style={{ borderRadius: '2rem' }}
        >
          <CardBody className="p-8">
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white">Faturamento Mensal</h3>
            </div>

            <div className="flex items-baseline gap-4 mb-2 relative z-10">
              <h2 className="text-4xl font-bold text-white">R$ 3.8M</h2>
              <span className="text-sm text-gray-500">R$ 127K média diária</span>
            </div>
            <div className="text-emerald-400 text-sm font-bold flex items-center gap-1 mb-6 relative z-10">
              <TrendingUp size={14} /> +15.3%{' '}
              <span className="text-gray-500 font-normal ml-1">vs. mês anterior</span>
            </div>

            {/* Gráfico */}
            <div className="h-64 w-full mt-4 relative z-10">
              <RevenueChart />
            </div>

            {/* Decorative Background Glow */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none"></div>
          </CardBody>
        </Card>

        {/* Agenda Cirúrgica (Substituindo Mapa) */}
        <Card 
          className="bg-[#11131f] border border-white/5 shadow-lg overflow-hidden"
          style={{ borderRadius: '2rem' }}
        >
          <CardBody className="p-8">
            <AgendaOPME />
          </CardBody>
        </Card>
      </div>

      {/* Bottom Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-20">
        <SecondaryCard
          title="Estoque Crítico"
          value="8"
          subtext="produtos em falta"
          icon={AlertTriangle}
          colorClass="bg-red-500"
          accentColor="text-red-500"
        />
        <SecondaryCard
          title="Logística"
          value="96.2%"
          subtext="entregas no prazo"
          icon={Truck}
          colorClass="bg-emerald-500"
          accentColor="text-emerald-500"
        />
        <SecondaryCard
          title="Performance IA"
          value="97.3%"
          subtext="precisão do sistema"
          icon={Cpu}
          colorClass="bg-purple-500"
          accentColor="text-purple-500"
        />
      </div>
    </div>
  );
};
