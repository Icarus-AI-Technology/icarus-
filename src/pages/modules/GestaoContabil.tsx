/**
 * GESTÃO CONTÁBIL - ICARUS v5.0
 * Contabilidade completa + DRE + Plano de Contas
 */

import { useMemo, useState } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';

interface DREItem {
  grupo: string;
  descricao: string;
  valor: number;
  percentual: number;
}

const DRE_DATA: DREItem[] = [
  { grupo: 'RECEITA', descricao: 'Receita Bruta', valor: 4_200_000, percentual: 100.0 },
  { grupo: 'RECEITA', descricao: '(-) Deduções', valor: -420_000, percentual: -10.0 },
  { grupo: 'RECEITA', descricao: '(=) Receita Líquida', valor: 3_780_000, percentual: 90.0 },
  { grupo: 'CUSTOS', descricao: '(-) CMV', valor: -1_890_000, percentual: -45.0 },
  { grupo: 'RESULTADO', descricao: '(=) Lucro Bruto', valor: 1_890_000, percentual: 45.0 },
  { grupo: 'DESPESAS', descricao: '(-) Despesas Operacionais', valor: -630_000, percentual: -15.0 },
  {
    grupo: 'DESPESAS',
    descricao: '(-) Despesas Administrativas',
    valor: -252_000,
    percentual: -6.0,
  },
  { grupo: 'DESPESAS', descricao: '(-) Despesas Comerciais', valor: -168_000, percentual: -4.0 },
  { grupo: 'RESULTADO', descricao: '(=) EBITDA', valor: 1_134_000, percentual: 27.0 },
  { grupo: 'FINANCEIRO', descricao: '(-) Despesas Financeiras', valor: -126_000, percentual: -3.0 },
  { grupo: 'FINANCEIRO', descricao: '(+) Receitas Financeiras', valor: 42_000, percentual: 1.0 },
  {
    grupo: 'RESULTADO',
    descricao: '(=) Lucro Antes dos Impostos',
    valor: 1_050_000,
    percentual: 25.0,
  },
  { grupo: 'IMPOSTOS', descricao: '(-) Impostos', valor: -158_000, percentual: -3.8 },
  { grupo: 'RESULTADO', descricao: '(=) Lucro Líquido', valor: 892_000, percentual: 21.2 },
];

const GROUP_COLORS: Record<string, string> = {
  RECEITA: 'var(--orx-success)',
  CUSTOS: 'var(--orx-error)',
  DESPESAS: 'var(--orx-warning)',
  RESULTADO: 'var(--orx-primary)',
  FINANCEIRO: 'var(--orx-purple-500)',
  IMPOSTOS: 'var(--orx-error-dark)',
};

const PERIOD_LABELS: Record<string, string> = {
  hoje: 'Hoje',
  semana_atual: 'Semana Atual',
  mes_atual: 'Mês Atual',
  trimestre: 'Trimestre',
  semestre: 'Semestre',
  ano: 'Ano Fiscal',
};

const PLACEHOLDER_BY_TAB: Record<string, string> = {
  balanco:
    'Visualize ativos, passivos e patrimônio líquido por período, com projeções automatizadas de compliance.',
  planocontas:
    'Gerencie seu plano de contas com sincronização automática com o ERP e versionamento de estruturas.',
  centros:
    'Acompanhe centros de custo e rateios inteligentes com alertas de desvios acima do limite definido.',
  obrigacoes: 'Controle obrigações fiscais e calendários de entregas com alertas inteligentes.',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function GestaoContabil() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('mes_atual');
  const [activeTab, setActiveTab] = useState<string>('dre');
  const [searchTerm, setSearchTerm] = useState('');

  const kpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'receita',
        icon: DollarSign,
        label: 'Receita Bruta',
        value: 'R$ 4.2M',
        subtitle: 'vs. mês anterior',
        trend: '+18.5%',
        trendPositive: true,
      },
      {
        id: 'lucro',
        icon: TrendingUp,
        label: 'Lucro Líquido',
        value: 'R$ 892K',
        subtitle: 'Acumulado no período',
        trend: '+12.3%',
        trendPositive: true,
      },
      {
        id: 'margem',
        icon: PieChart,
        label: 'Margem Líquida',
        value: '21.2%',
        subtitle: 'Receita Líquida',
        trend: '-0.8%',
        trendPositive: false,
      },
      {
        id: 'ebitda',
        icon: BarChart3,
        label: 'EBITDA',
        value: 'R$ 1.1M',
        subtitle: 'Últimos 30 dias',
        trend: '+15.7%',
        trendPositive: true,
      },
    ],
    []
  );

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'dre', label: 'DRE', count: DRE_DATA.length },
      { id: 'balanco', label: 'Balanço', count: 12 },
      { id: 'planocontas', label: 'Plano de Contas', count: 64 },
      { id: 'centros', label: 'Centros de Custo', count: 18 },
      { id: 'obrigacoes', label: 'Obrigações Fiscais', count: 6 },
    ],
    []
  );

  const filteredDre = useMemo(
    () =>
      DRE_DATA.filter((item) => item.descricao.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const renderPlaceholder = (tabId: string) => (
    <div className="rounded-[28px] border border-white/5 bg-white/5 p-10 text-center text-white/70">
      {PLACEHOLDER_BY_TAB[tabId] ?? 'Conteúdo em desenvolvimento para esta aba.'}
    </div>
  );

  const renderDre = () => (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/5 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="ic-icon-badge-neumo">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">Visão financeira</p>
              <h2 className="text-lg font-semibold text-white">
                Demonstração do Resultado do Exercício
              </h2>
            </div>
          </div>
          <Button
            variant="secondary"
            icon={<Filter className="h-4 w-4" />}
            onClick={() => alert('Filtros avançados do DRE')}
          >
            Ajustar Filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-white/60 border-b border-white/10">
              <tr>
                <th className="pb-3 text-left font-medium">Descrição</th>
                <th className="pb-3 text-right font-medium">Valor</th>
                <th className="pb-3 text-right font-medium">% Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDre.map((item) => {
                const isTotal = item.descricao.includes('(=)');
                const groupColor = GROUP_COLORS[item.grupo] ?? 'var(--orx-text-secondary)';
                return (
                  <tr key={item.descricao} className={isTotal ? 'bg-white/5' : undefined}>
                    <td className="py-3 pr-4 text-white">
                      <div className="flex items-center gap-2">
                        {!isTotal && (
                          <span
                            className="h-4 w-1 rounded-full"
                            style={{ background: groupColor }}
                          />
                        )}
                        <span className={isTotal ? 'font-semibold' : 'text-white/80'}>
                          {item.descricao}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`py-3 text-right font-semibold ${
                        item.valor < 0 ? 'text-rose-300' : 'text-white'
                      }`}
                    >
                      {formatCurrency(item.valor)}
                    </td>
                    <td
                      className={`py-3 text-right ${
                        item.percentual < 0 ? 'text-rose-300' : 'text-white/70'
                      }`}
                    >
                      {item.percentual.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/5 bg-white/5 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Legenda de Grupos</h3>
        <div className="flex flex-wrap gap-4">
          {Object.keys(GROUP_COLORS).map((grupo) => (
            <div key={grupo} className="flex items-center gap-2">
              <span className="h-4 w-4 rounded" style={{ background: GROUP_COLORS[grupo] }} />
              <span className="text-sm text-white/80">{grupo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ModulePageNeumo
      title="Gestão Contábil"
      subtitle="Contabilidade completa com DRE inteligente e plano de contas integrado"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Buscar contas, grupos ou lançamentos..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros contábeis em desenvolvimento')}
      primaryActionLabel="Exportar DRE"
      onPrimaryAction={() => window.dispatchEvent(new CustomEvent('icarus:export-dre'))}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Calendar className="h-4 w-4" />
            Período: {PERIOD_LABELS[selectedPeriod] || 'Período Customizado'}
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Selecionar período contábil"
              className="ic-card-neumo rounded-3xl px-4 py-2 bg-transparent text-sm text-white focus:outline-none"
            >
              {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              icon={<Filter className="h-4 w-4" />}
              onClick={() => alert('Filtros contábeis em desenvolvimento')}
            >
              Filtros
            </Button>
          </div>
        </div>

        {activeTab === 'dre' ? renderDre() : renderPlaceholder(activeTab)}
      </div>
    </ModulePageNeumo>
  );
}
