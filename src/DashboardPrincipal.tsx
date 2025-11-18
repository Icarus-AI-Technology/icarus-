/**
 * Dashboard Principal - ICARUS v5.0
 * Módulo: 01 - Core Business
 * 
 * Visão consolidada de todos os KPIs críticos do negócio OPME
 * 100% conformidade com OraclusX Design System
 */

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Stethoscope, 
  AlertTriangle, 
  Package, 
  Calendar,
  RefreshCw,
  Download,
  Settings,
  Maximize2
} from "lucide-react";
import { Card } from "../components/oraclusx-ds/Card";
import { Button } from "../components/oraclusx-ds/Button";
import { IconButtonNeu } from "../components/oraclusx-ds/IconButtonNeu";
import { SubModulesNavigation } from "../components/oraclusx-ds/SubModulesNavigation";
import { OrxBarChart } from "../components/charts/OrxBarChart";
import { OrxLineChart } from "../components/charts/OrxLineChart";
import { OrxPieChart } from "../components/charts/OrxPieChart";

/**
 * KPI Card Component - PADRÃO OFICIAL OraclusX DS
 * 
 * ESPECIFICAÇÃO:
 * - Background: #6366F1 (indigo médio)
 * - Texto: #FFFFFF (branco)
 * - Sombra: Neuromórfica
 * - Altura: 140px
 */
interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, trend, onClick }) => {
  return (
    <div
      className="
        kpi-card
        bg-[#6366F1] text-white
        h-[140px]
        cursor-pointer
        transition-transform hover:scale-105
        shadow-[8px_8px_16px_rgba(99,102,241,0.3),-4px_-4px_12px_rgba(255,255,255,0.1)]
        rounded-xl p-6
      "
      onClick={onClick}
    >
      <div className="flex items-start justify-between h-full">
        {/* Ícone */}
        <div className="
          w-14 h-14 rounded-xl
          bg-white/10
          flex items-center justify-center
        ">
          <span className="text-white orx-text-2xl">
            {icon}
          </span>
        </div>

        {/* Valor e Label */}
        <div className="flex-1 ml-4">
          <p className="orx-text-sm text-white/80 mb-1">
            {label}
          </p>
          <p className="orx-text-3xl orx-font-bold text-white kpi-value">
            {value}
          </p>
          
          {/* Tendência */}
          {trend && (
            <div className={`
              flex items-center gap-1 mt-2
              orx-text-sm
              ${trend.direction === 'up' ? 'text-green-300' :
                trend.direction === 'down' ? 'text-red-300' :
                'text-white/60'
              }
            `}>
              {trend.direction === 'up' && <TrendingUp size={16} />}
              {trend.direction === 'down' && <TrendingDown size={16} />}
              {trend.direction === 'neutral' && <span>→</span>}
              <span>{trend.percentage}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Principal Component
 */
export default function DashboardPrincipal() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const currentPeriod = 'Hoje';

  // Dados mockados para demonstração
  const kpis = {
    cirurgiasHoje: 12,
    cirurgiasMes: 147,
    faturamentoMes: 'R$ 2.847.500',
    ticketMedio: 'R$ 19.372',
    estoqueBaixo: 23,
    contasReceber: 'R$ 1.234.000',
    taxaInadimplencia: '2.3',
    margemLucro: '18.5'
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExportPDF = () => {
    alert('Exportar PDF - Em desenvolvimento');
  };

  const handleFullScreen = () => {
    document.documentElement.requestFullscreen();
  };

  // Sub-navegação do Dashboard
  const tabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: <Calendar size={16} /> },
    { id: 'cirurgias-hoje', label: 'Cirurgias do Dia', icon: <Stethoscope size={16} /> },
    { id: 'estoque-critico', label: 'Estoque Crítico', icon: <Package size={16} /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={16} /> },
    { id: 'alertas', label: 'Alertas', icon: <AlertTriangle size={16} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="orx-text-3xl orx-font-bold text-[var(--orx-text-primary)] mb-2">
            Dashboard Principal
          </h1>
          <p className="text-[var(--orx-text-secondary)]">
            Visão consolidada em tempo real dos KPIs críticos do negócio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
          >
            Atualizar
          </Button>
          <Button
            variant="secondary"
            icon={<Calendar size={18} />}
          >
            {currentPeriod}
          </Button>
          <IconButtonNeu
            icon={<Download size={18} />}
            onClick={handleExportPDF}
            tooltip="Exportar PDF"
          />
          <IconButtonNeu
            icon={<Settings size={18} />}
            tooltip="Configurar"
          />
          <IconButtonNeu
            icon={<Maximize2 size={18} />}
            onClick={handleFullScreen}
            tooltip="Tela Cheia"
          />
        </div>
      </div>

      {/* Sub-navegação */}
      <SubModulesNavigation
        items={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Conteúdo baseado na aba ativa */}
      {activeTab === 'visao-geral' && (
        <>
          {/* Grid de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="Cirurgias Hoje"
              value={kpis.cirurgiasHoje}
              icon={<Stethoscope size={28} />}
              trend={{ direction: 'up', percentage: 8.5 }}
            />
            <KPICard
              label="Cirurgias do Mês"
              value={kpis.cirurgiasMes}
              icon={<Calendar size={28} />}
              trend={{ direction: 'up', percentage: 12.3 }}
            />
            <KPICard
              label="Faturamento do Mês"
              value={kpis.faturamentoMes}
              icon={<DollarSign size={28} />}
              trend={{ direction: 'up', percentage: 15.7 }}
            />
            <KPICard
              label="Ticket Médio"
              value={kpis.ticketMedio}
              icon={<TrendingUp size={28} />}
              trend={{ direction: 'up', percentage: 4.2 }}
            />
            <KPICard
              label="Estoque Baixo"
              value={kpis.estoqueBaixo}
              icon={<Package size={28} />}
              trend={{ direction: 'down', percentage: 3.1 }}
            />
            <KPICard
              label="Contas a Receber"
              value={kpis.contasReceber}
              icon={<DollarSign size={28} />}
              trend={{ direction: 'neutral', percentage: 0 }}
            />
            <KPICard
              label="Taxa Inadimplência"
              value={`${kpis.taxaInadimplencia}%`}
              icon={<AlertTriangle size={28} />}
              trend={{ direction: 'down', percentage: 0.5 }}
            />
            <KPICard
              label="Margem de Lucro"
              value={`${kpis.margemLucro}%`}
              icon={<TrendingUp size={28} />}
              trend={{ direction: 'up', percentage: 2.1 }}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card title="Faturamento Mensal" padding="lg">
              <OrxBarChart
                data={[
                  { name: 'Jan', value: 2400000 },
                  { name: 'Fev', value: 2100000 },
                  { name: 'Mar', value: 2800000 },
                  { name: 'Abr', value: 2600000 },
                  { name: 'Mai', value: 2847500 },
                ]}
              />
            </Card>

            <Card title="Evolução de Cirurgias" padding="lg">
              <OrxLineChart
                data={[
                  { name: 'Jan', value: 135 },
                  { name: 'Fev', value: 128 },
                  { name: 'Mar', value: 152 },
                  { name: 'Abr', value: 143 },
                  { name: 'Mai', value: 147 },
                ]}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Distribuição por Especialidade" padding="lg">
              <OrxPieChart
                data={[
                  { name: 'Ortopedia', value: 35 },
                  { name: 'Cardiologia', value: 25 },
                  { name: 'Neurologia', value: 20 },
                  { name: 'Outras', value: 20 },
                ]}
              />
            </Card>

            <Card title="Status de Estoque" padding="lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="orx-text-sm">Produtos em Estoque Alto</span>
                  <span className="orx-font-bold text-green-600">234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="orx-text-sm">Produtos em Estoque Médio</span>
                  <span className="orx-font-bold text-yellow-600">87</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="orx-text-sm">Produtos em Estoque Baixo</span>
                  <span className="orx-font-bold text-red-600">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="orx-text-sm">Produtos em Falta</span>
                  <span className="orx-font-bold text-red-800">5</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'cirurgias-hoje' && (
        <Card title="Cirurgias Agendadas para Hoje" padding="lg">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[var(--orx-surface-light)] rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                    <Stethoscope size={24} className="text-[#6366F1]" />
                  </div>
                  <div>
                    <p className="orx-font-semibold">Cirurgia #{i}</p>
                    <p className="orx-text-sm text-[var(--orx-text-secondary)]">Dr. João Silva - Hospital ABC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="orx-font-semibold">{8 + i}:00</p>
                  <p className="orx-text-sm text-[var(--orx-text-secondary)]">Ortopedia</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'estoque-critico' && (
        <Card title="Produtos com Estoque Crítico" padding="lg">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[var(--orx-surface-light)] rounded-lg">
                <div>
                  <p className="orx-font-semibold">Produto OPME #{i}</p>
                  <p className="orx-text-sm text-[var(--orx-text-secondary)]">Código: OPME-{1000 + i}</p>
                </div>
                <div className="text-right">
                  <p className="orx-font-bold text-red-600">{5 - i} unidades</p>
                  <p className="orx-text-sm text-[var(--orx-text-secondary)]">Mínimo: 10</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'financeiro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Contas a Receber" padding="lg">
            <div className="text-center">
              <p className="orx-text-4xl orx-font-bold text-[#6366F1]">R$ 1.234.000</p>
              <p className="orx-text-sm text-[var(--orx-text-secondary)] mt-2">Em aberto</p>
            </div>
          </Card>
          <Card title="Contas a Pagar" padding="lg">
            <div className="text-center">
              <p className="orx-text-4xl orx-font-bold text-[#6366F1]">R$ 876.500</p>
              <p className="orx-text-sm text-[var(--orx-text-secondary)] mt-2">A vencer</p>
            </div>
          </Card>
          <Card title="Saldo Disponível" padding="lg">
            <div className="text-center">
              <p className="orx-text-4xl orx-font-bold text-green-600">R$ 456.200</p>
              <p className="orx-text-sm text-[var(--orx-text-secondary)] mt-2">Líquido</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'alertas' && (
        <Card title="Alertas Prioritários" padding="lg">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="orx-font-semibold text-red-900">Estoque Crítico</p>
                <p className="orx-text-sm text-red-700">5 produtos em falta, 18 abaixo do mínimo</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0" />
              <div>
                <p className="orx-font-semibold text-yellow-900">Contas Vencidas</p>
                <p className="orx-text-sm text-yellow-700">3 contas a receber vencidas há mais de 30 dias</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <AlertTriangle size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="orx-font-semibold text-blue-900">Certificações</p>
                <p className="orx-text-sm text-blue-700">2 certificações ANVISA vencem em 15 dias</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
