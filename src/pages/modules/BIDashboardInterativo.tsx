/**
 * BI DASHBOARD INTERATIVO - ICARUS v5.0
 * Business Intelligence com analytics avançado
 */

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';

interface Produto {
  nome: string;
  vendas: number;
  receita: number;
  margem: number;
  variacao: string;
  variacaoUp: boolean;
}

interface Hospital {
  nome: string;
  pedidos: number;
  receita: number;
  ticketMedio: number;
  crescimento: string;
  crescimentoUp: boolean;
}

const PRODUTOS: Produto[] = [
  {
    nome: 'Prótese de Quadril Titanium Pro',
    vendas: 142,
    receita: 854_200,
    margem: 32.5,
    variacao: '+18%',
    variacaoUp: true,
  },
  {
    nome: 'Stent Cardíaco DES Premium',
    vendas: 287,
    receita: 718_500,
    margem: 28.8,
    variacao: '+12%',
    variacaoUp: true,
  },
  {
    nome: 'Placa Ortopédica Multiusos',
    vendas: 523,
    receita: 628_400,
    margem: 35.2,
    variacao: '+8%',
    variacaoUp: true,
  },
  {
    nome: 'Marca-passo Inteligente IoT',
    vendas: 89,
    receita: 534_000,
    margem: 25.1,
    variacao: '-5%',
    variacaoUp: false,
  },
];

const HOSPITAIS: Hospital[] = [
  {
    nome: 'Hospital Santa Maria',
    pedidos: 89,
    receita: 1_245_800,
    ticketMedio: 14_000,
    crescimento: '+22%',
    crescimentoUp: true,
  },
  {
    nome: 'Hospital São Lucas',
    pedidos: 67,
    receita: 987_600,
    ticketMedio: 14_740,
    crescimento: '+15%',
    crescimentoUp: true,
  },
  {
    nome: 'Clínica Ortopédica Silva',
    pedidos: 124,
    receita: 856_300,
    ticketMedio: 6_906,
    crescimento: '+8%',
    crescimentoUp: true,
  },
  {
    nome: 'Hospital Regional Norte',
    pedidos: 52,
    receita: 734_200,
    ticketMedio: 14_119,
    crescimento: '-3%',
    crescimentoUp: false,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function BIDashboardInterativo() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('mes_atual');
  const [selectedCategory, setSelectedCategory] = useState<string>('geral');
  const [searchTerm, setSearchTerm] = useState('');

  const kpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'faturamento',
        icon: DollarSign,
        label: 'Faturamento Total',
        value: 'R$ 3.8M',
        subtitle: 'vs. mês anterior',
        trend: '+15.3%',
        trendPositive: true,
      },
      {
        id: 'pedidos',
        icon: ShoppingCart,
        label: 'Pedidos Processados',
        value: '1.247',
        subtitle: 'Últimos 30 dias',
        trend: '+12.5%',
        trendPositive: true,
      },
      {
        id: 'ticket',
        icon: TrendingUp,
        label: 'Ticket Médio',
        value: 'R$ 3.048',
        subtitle: 'Por pedido',
        trend: '+2.3%',
        trendPositive: true,
      },
      {
        id: 'margem',
        icon: PieChart,
        label: 'Margem de Lucro',
        value: '28.5%',
        subtitle: 'Consolidado',
        trend: '-1.2%',
        trendPositive: false,
      },
    ],
    []
  );

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'geral', label: 'Visão Geral', count: 12 },
      { id: 'produtos', label: 'Produtos OPME', count: PRODUTOS.length },
      { id: 'hospitais', label: 'Hospitais', count: HOSPITAIS.length },
      { id: 'representantes', label: 'Representantes', count: 18 },
      { id: 'regioes', label: 'Regiões', count: 8 },
    ],
    []
  );

  const filteredProdutos = useMemo(
    () =>
      PRODUTOS.filter((produto) => produto.nome.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const filteredHospitais = useMemo(
    () =>
      HOSPITAIS.filter((hospital) =>
        hospital.nome.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  return (
    <ModulePageNeumo
      title="Business Intelligence"
      subtitle="Analytics avançado e insights estratégicos"
      kpis={kpis}
      tabs={tabs}
      activeTabId={selectedCategory}
      onTabChange={setSelectedCategory}
      searchPlaceholder="Buscar insights, produtos ou hospitais..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros avançados de BI')}
      primaryActionLabel="Exportar Insights"
      onPrimaryAction={() => window.dispatchEvent(new CustomEvent('icarus:export-bi'))}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Calendar className="h-4 w-4" />
            Período de análise
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Selecionar período de análise"
              className="ic-card-neumo rounded-3xl px-4 py-2 bg-transparent text-sm text-white focus:outline-none"
            >
              <option value="hoje">Hoje</option>
              <option value="semana_atual">Semana Atual</option>
              <option value="mes_atual">Mês Atual</option>
              <option value="trimestre">Trimestre</option>
              <option value="semestre">Semestre</option>
              <option value="ano">Ano</option>
            </select>
            <Button
              variant="secondary"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => window.dispatchEvent(new CustomEvent('icarus:refresh-bi'))}
            >
              Atualizar
            </Button>
            <Button
              variant="primary"
              icon={<Download className="h-4 w-4" />}
              onClick={() => window.dispatchEvent(new CustomEvent('icarus:export-bi'))}
            >
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/5 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="ic-icon-badge-neumo">
                  <Package className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">Produtos destaque</p>
                  <h2 className="text-lg font-semibold text-white">Top 4 OPME</h2>
                </div>
              </div>
              <span className="text-xs text-white/60">{selectedPeriod.replace(/_/g, ' ')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-white/50">
                  <tr>
                    <th className="pb-3 text-left font-medium">Produto</th>
                    <th className="pb-3 text-center font-medium">Vendas</th>
                    <th className="pb-3 text-right font-medium">Receita</th>
                    <th className="pb-3 text-center font-medium">Margem</th>
                    <th className="pb-3 text-center font-medium">Variação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProdutos.map((produto) => (
                    <tr key={produto.nome}>
                      <td className="py-3 pr-4 font-semibold text-white">{produto.nome}</td>
                      <td className="py-3 text-center text-white/80">{produto.vendas}</td>
                      <td className="py-3 text-right font-semibold text-white">
                        {formatCurrency(produto.receita)}
                      </td>
                      <td className="py-3 text-center text-emerald-300">{produto.margem}%</td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1 text-xs font-semibold ${
                            produto.variacaoUp ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {produto.variacaoUp ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {produto.variacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/5 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="ic-icon-badge-neumo">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">Hospitais chave</p>
                  <h2 className="text-lg font-semibold text-white">Maiores faturamentos</h2>
                </div>
              </div>
              <span className="text-xs text-white/60">Ticket Médio</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-white/50">
                  <tr>
                    <th className="pb-3 text-left font-medium">Hospital</th>
                    <th className="pb-3 text-center font-medium">Pedidos</th>
                    <th className="pb-3 text-right font-medium">Receita</th>
                    <th className="pb-3 text-right font-medium">Ticket Médio</th>
                    <th className="pb-3 text-center font-medium">Crescimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHospitais.map((hospital) => (
                    <tr key={hospital.nome}>
                      <td className="py-3 pr-4 font-semibold text-white">{hospital.nome}</td>
                      <td className="py-3 text-center text-white/80">{hospital.pedidos}</td>
                      <td className="py-3 text-right font-semibold text-white">
                        {formatCurrency(hospital.receita)}
                      </td>
                      <td className="py-3 text-right text-white/80">
                        {formatCurrency(hospital.ticketMedio)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1 text-xs font-semibold ${
                            hospital.crescimentoUp ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {hospital.crescimentoUp ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {hospital.crescimento}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ModulePageNeumo>
  );
}
