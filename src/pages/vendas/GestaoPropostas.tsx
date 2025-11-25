/**
 * Gestão de Propostas Comerciais - ICARUS v5.0
 * CRM - Pipeline de vendas e propostas
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, FileText, DollarSign, Calendar, TrendingUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import { useDocumentTitle } from '@/hooks';

interface Proposta {
  id: string;
  numero: string;
  cliente: string;
  valor_total: number;
  status: 'rascunho' | 'enviada' | 'em_negociacao' | 'aprovada' | 'rejeitada';
  data_criacao: string;
  validade: string;
  vendedor: string;
}

const MOCK_PROPOSTAS: Proposta[] = [
  {
    id: '1',
    numero: 'PROP-2024-001',
    cliente: 'Hospital São Paulo',
    valor_total: 125000,
    status: 'em_negociacao',
    data_criacao: '2024-11-10',
    validade: '2024-12-10',
    vendedor: 'João Silva',
  },
];

export default function GestaoPropostas() {
  useDocumentTitle('Gestão de Propostas');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todas' | Proposta['status']>('todas');
  const [propostas] = useState<Proposta[]>(MOCK_PROPOSTAS);

  const kpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'total',
        icon: FileText,
        label: 'Total Propostas',
        value: propostas.length,
        subtitle: 'Ativas no pipeline',
        trend: '+3 novas',
        trendPositive: true,
      },
      {
        id: 'negociacao',
        icon: TrendingUp,
        label: 'Em Negociação',
        value: propostas.filter((p) => p.status === 'em_negociacao').length,
        subtitle: 'Etapa atual',
        trend: '-1 em 7 dias',
        trendPositive: false,
      },
      {
        id: 'aprovadas',
        icon: DollarSign,
        label: 'Aprovadas',
        value: propostas.filter((p) => p.status === 'aprovada').length,
        subtitle: 'Fechamentos do mês',
        trend: '+12%',
        trendPositive: true,
      },
      {
        id: 'valor',
        icon: DollarSign,
        label: 'Valor Total',
        value: 'R$ 1,2M',
        subtitle: 'Portfólio corrente',
        trend: '+6.5%',
        trendPositive: true,
      },
    ],
    [propostas]
  );

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'todas', label: 'Todas', count: propostas.length },
      {
        id: 'rascunho',
        label: 'Rascunhos',
        count: propostas.filter((p) => p.status === 'rascunho').length,
      },
      {
        id: 'enviada',
        label: 'Enviadas',
        count: propostas.filter((p) => p.status === 'enviada').length,
      },
      {
        id: 'em_negociacao',
        label: 'Em negociação',
        count: propostas.filter((p) => p.status === 'em_negociacao').length,
      },
      {
        id: 'aprovada',
        label: 'Aprovadas',
        count: propostas.filter((p) => p.status === 'aprovada').length,
      },
      {
        id: 'rejeitada',
        label: 'Rejeitadas',
        count: propostas.filter((p) => p.status === 'rejeitada').length,
      },
    ],
    [propostas]
  );

  const filteredPropostas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return propostas
      .filter((prop) => (activeTab === 'todas' ? true : prop.status === activeTab))
      .filter(
        (prop) =>
          prop.numero.toLowerCase().includes(term) || prop.cliente.toLowerCase().includes(term)
      );
  }, [activeTab, propostas, searchTerm]);

  return (
    <ModulePageNeumo
      title="Gestão de Propostas"
      subtitle="Pipeline de vendas e negociações"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      searchPlaceholder="Buscar proposta ou cliente..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros de propostas em desenvolvimento')}
      primaryActionLabel="Nova Proposta"
      onPrimaryAction={() => navigate('/vendas/propostas/nova')}
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/vendas')}
        >
          Voltar ao CRM
        </Button>
        <button className="ic-card-neumo px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
          <Filter className="w-4 h-4" />
          Exportar Pipeline
        </button>
      </div>

      <div className="space-y-4">
        {filteredPropostas.map((prop) => (
          <div key={prop.id} className="ic-card-neumo rounded-[28px] p-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{prop.numero}</h3>
                  <span
                    className={`
                      ic-kpi-pill px-3 py-1 text-xs font-semibold
                      ${prop.status === 'aprovada' ? 'text-emerald-300' : ''}
                      ${prop.status === 'em_negociacao' ? 'text-amber-300' : ''}
                      ${prop.status === 'enviada' ? 'text-sky-300' : ''}
                      ${prop.status === 'rejeitada' ? 'text-rose-300' : ''}
                      ${prop.status === 'rascunho' ? 'text-white/70' : ''}
                    `}
                  >
                    {prop.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-white/70">{prop.cliente}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Valor Total
                    </p>
                    <p className="text-sm font-semibold text-emerald-300">
                      R$ {prop.valor_total.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Vendedor</p>
                    <p className="text-sm font-medium text-white">{prop.vendedor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Validade
                    </p>
                    <p className="text-sm font-medium text-white">
                      {new Date(prop.validade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Ver detalhes
                </Button>
                <Button size="sm" variant="secondary">
                  Clonar proposta
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPropostas.length === 0 && (
        <div className="ic-card-neumo rounded-[32px] p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma proposta encontrada</h3>
          <p className="text-white/70">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </ModulePageNeumo>
  );
}
