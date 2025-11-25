/**
 * Faturamento - ICARUS v5.0
 * Gestão de faturamento hospitalar e convênios
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, FileText, DollarSign, TrendingUp, AlertCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import { useDocumentTitle } from '@/hooks';

interface Fatura {
  id: string;
  numero: string;
  cirurgia_id: string;
  convenio: string;
  valor: number;
  status: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'paga';
  data_emissao: string;
}

const MOCK_FATURAS: Fatura[] = [
  {
    id: '1',
    numero: 'FAT-2024-001',
    cirurgia_id: 'CIR-123',
    convenio: 'Amil',
    valor: 15000,
    status: 'aprovada',
    data_emissao: '2024-11-01',
  },
];

export default function GestaoFaturamento() {
  useDocumentTitle('Faturamento');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todas' | Fatura['status']>('todas');
  const [faturas] = useState<Fatura[]>(MOCK_FATURAS);

  const kpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'total',
        icon: FileText,
        label: 'Total Faturas',
        value: faturas.length,
        subtitle: 'Últimos 30 dias',
        trend: '+12%',
        trendPositive: true,
      },
      {
        id: 'aprovadas',
        icon: TrendingUp,
        label: 'Aprovadas',
        value: faturas.filter((f) => f.status === 'aprovada' || f.status === 'paga').length,
        subtitle: 'Aprovadas / pagas',
        trend: '+5%',
        trendPositive: true,
      },
      {
        id: 'pendentes',
        icon: AlertCircle,
        label: 'Pendentes',
        value: faturas.filter((f) => f.status === 'pendente' || f.status === 'em_analise').length,
        subtitle: 'Aguardando análise',
        trend: '-3%',
        trendPositive: true,
      },
      {
        id: 'faturamento',
        icon: DollarSign,
        label: 'Faturamento Total',
        value: 'R$ 2,3M',
        subtitle: 'Período atual',
        trend: '+8.4%',
        trendPositive: true,
      },
    ],
    [faturas]
  );

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'todas', label: 'Todas', count: faturas.length },
      {
        id: 'pendente',
        label: 'Pendentes',
        count: faturas.filter((f) => f.status === 'pendente').length,
      },
      {
        id: 'em_analise',
        label: 'Em Análise',
        count: faturas.filter((f) => f.status === 'em_analise').length,
      },
      {
        id: 'aprovada',
        label: 'Aprovadas',
        count: faturas.filter((f) => f.status === 'aprovada').length,
      },
      {
        id: 'rejeitada',
        label: 'Rejeitadas',
        count: faturas.filter((f) => f.status === 'rejeitada').length,
      },
      { id: 'paga', label: 'Pagas', count: faturas.filter((f) => f.status === 'paga').length },
    ],
    [faturas]
  );

  const filteredFaturas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return faturas
      .filter((f) => (activeTab === 'todas' ? true : f.status === activeTab))
      .filter(
        (f) => f.numero.toLowerCase().includes(term) || f.convenio.toLowerCase().includes(term)
      );
  }, [activeTab, faturas, searchTerm]);

  return (
    <ModulePageNeumo
      title="Faturamento"
      subtitle="Gestão hospitalar de faturamento e convênios"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      searchPlaceholder="Buscar fatura ou convênio..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros financeiros em desenvolvimento')}
      primaryActionLabel="Nova Fatura"
      onPrimaryAction={() => navigate('/financeiro/faturamento/nova')}
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/financeiro')}
        >
          Voltar ao Financeiro
        </Button>
        <button className="ic-card-neumo px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
          <Filter className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      <div className="space-y-4">
        {filteredFaturas.map((fatura) => (
          <div key={fatura.id} className="ic-card-neumo rounded-[28px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{fatura.numero}</h3>
                  <span
                    className={`
                      ic-kpi-pill px-3 py-1 text-xs font-semibold
                      ${fatura.status === 'paga' ? 'text-emerald-300' : ''}
                      ${fatura.status === 'aprovada' ? 'text-sky-300' : ''}
                      ${fatura.status === 'em_analise' ? 'text-amber-300' : ''}
                      ${fatura.status === 'rejeitada' ? 'text-rose-300' : ''}
                      ${fatura.status === 'pendente' ? 'text-white/80' : ''}
                    `}
                  >
                    {fatura.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-white/60">Convênio</p>
                    <p className="text-sm font-medium text-white">{fatura.convenio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Valor</p>
                    <p className="text-sm font-semibold text-emerald-300">
                      R$ {fatura.valor.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Emissão</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(fatura.data_emissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm">
                  Detalhes
                </Button>
                <Button size="sm">Exportar XML</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModulePageNeumo>
  );
}
