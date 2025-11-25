/**
 * Gestão de Lotes - ICARUS v5.0
 * Rastreabilidade completa de lotes OPME (ANVISA RDC 16/2013)
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, Package, Calendar, AlertTriangle, Shield, Recycle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';

interface Lote {
  id: string;
  numero_lote: string;
  produto_nome: string;
  fabricante: string;
  data_fabricacao: string;
  data_validade: string;
  quantidade: number;
  status: 'ativo' | 'vencido' | 'bloqueado' | 'recall';
}

const MOCK_LOTES: Lote[] = [
  {
    id: '1',
    numero_lote: 'LT2024001',
    produto_nome: 'Prótese de Joelho Titanium',
    fabricante: 'Abbott Medical',
    data_fabricacao: '2024-01-15',
    data_validade: '2027-01-15',
    quantidade: 25,
    status: 'ativo',
  },
];

export default function GestaoLotes() {
  useDocumentTitle('Gestão de Lotes');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | Lote['status']>('todos');
  const [lotes] = useState<Lote[]>(MOCK_LOTES);

  const kpis = useMemo<ModuleKpiItem[]>(() => {
    const total = lotes.length;
    const ativos = lotes.filter((lote) => lote.status === 'ativo').length;
    const vencidos = lotes.filter((lote) => lote.status === 'vencido').length;
    const bloqueados = lotes.filter((lote) => lote.status === 'bloqueado').length;
    const recall = lotes.filter((lote) => lote.status === 'recall').length;

    return [
      {
        id: 'ativos',
        icon: Package,
        label: 'Lotes Ativos',
        value: ativos,
        subtitle: `${((ativos / Math.max(total, 1)) * 100).toFixed(1)}% do estoque`,
        trend: '+1.6%',
        trendPositive: true,
      },
      {
        id: 'vencidos',
        icon: AlertTriangle,
        label: 'Vencidos',
        value: vencidos,
        subtitle: 'Ação imediata',
        trend: '-0.4%',
        trendPositive: false,
      },
      {
        id: 'bloqueados',
        icon: Shield,
        label: 'Bloqueados',
        value: bloqueados,
        subtitle: 'Em análise',
        trend: '+0.2%',
        trendPositive: false,
      },
      {
        id: 'recall',
        icon: Recycle,
        label: 'Recall / Recall parcial',
        value: recall,
        subtitle: 'Integração ANVISA',
        trend: '0 casos críticos',
        trendPositive: true,
      },
    ];
  }, [lotes]);

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'todos', label: 'Todos os Lotes', count: lotes.length },
      { id: 'ativo', label: 'Ativos', count: lotes.filter((l) => l.status === 'ativo').length },
      {
        id: 'vencido',
        label: 'Vencidos',
        count: lotes.filter((l) => l.status === 'vencido').length,
      },
      {
        id: 'bloqueado',
        label: 'Bloqueados',
        count: lotes.filter((l) => l.status === 'bloqueado').length,
      },
      { id: 'recall', label: 'Recall', count: lotes.filter((l) => l.status === 'recall').length },
    ],
    [lotes]
  );

  const filteredLotes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return lotes
      .filter((lote) => (activeTab === 'todos' ? true : lote.status === activeTab))
      .filter(
        (lote) =>
          lote.numero_lote.toLowerCase().includes(term) ||
          lote.produto_nome.toLowerCase().includes(term)
      );
  }, [activeTab, lotes, searchTerm]);

  return (
    <ModulePageNeumo
      title="Gestão de Lotes"
      subtitle="Rastreabilidade completa ANVISA RDC 16/2013"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      searchPlaceholder="Buscar por lote ou produto..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros avançados em breve')}
      primaryActionLabel="+ Registrar Lote"
      onPrimaryAction={() => navigate('/estoque/novo-lote')}
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/estoque')}
        >
          Voltar para Estoque
        </Button>
        <button className="ic-card-neumo px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
          <Filter className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="space-y-4">
        {filteredLotes.map((lote) => (
          <div key={lote.id} className="ic-card-neumo rounded-[28px] p-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">Lote: {lote.numero_lote}</h3>
                  <span
                    className={cn(
                      'ic-kpi-pill px-3 py-1 text-xs font-semibold',
                      lote.status === 'ativo' && 'text-emerald-300',
                      lote.status === 'vencido' && 'text-rose-300',
                      lote.status === 'bloqueado' && 'text-amber-300',
                      lote.status === 'recall' && 'text-sky-300'
                    )}
                  >
                    {lote.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-white/70">{lote.produto_nome}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-white/50">Fabricante</p>
                    <p className="text-sm font-semibold text-white">{lote.fabricante}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Validade
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(lote.data_validade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Quantidade</p>
                    <p className="text-sm font-semibold text-white">{lote.quantidade} unidades</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm">
                  Detalhes
                </Button>
                <Button size="sm">Imprimir Etiqueta</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModulePageNeumo>
  );
}
