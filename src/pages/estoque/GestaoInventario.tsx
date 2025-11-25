/**
 * Inventário de Estoque - ICARUS v5.0
 * Contagem física e ajustes de inventário
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, Package, AlertTriangle, Shield, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import { useDocumentTitle } from '@/hooks';

interface InventarioItem {
  id: string;
  produto_nome: string;
  quantidade_sistema: number;
  quantidade_fisica?: number;
  diferenca?: number;
  status: 'pendente' | 'contado' | 'ajustado';
  data_contagem?: string;
}

const MOCK_INVENTARIO: InventarioItem[] = [
  {
    id: '1',
    produto_nome: 'Parafuso Pedicular 5.5mm x 50mm',
    quantidade_sistema: 150,
    quantidade_fisica: 148,
    diferenca: -2,
    status: 'contado',
    data_contagem: '2024-11-17',
  },
];

export default function GestaoInventario() {
  useDocumentTitle('Inventário de Estoque');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | InventarioItem['status']>('todos');
  const [inventario] = useState<InventarioItem[]>(MOCK_INVENTARIO);

  const kpis = useMemo<ModuleKpiItem[]>(() => {
    const total = inventario.length;
    const pendentes = inventario.filter((item) => item.status === 'pendente').length;
    const contados = inventario.filter((item) => item.status === 'contado').length;
    const ajustados = inventario.filter((item) => item.status === 'ajustado').length;
    const divergencias = inventario.filter((item) => (item.diferenca ?? 0) !== 0).length;

    return [
      {
        id: 'pendentes',
        icon: AlertTriangle,
        label: 'Pendentes',
        value: pendentes,
        subtitle: `${Math.round((pendentes / Math.max(total, 1)) * 100)}% da lista`,
        trend: '-5% desde última semana',
        trendPositive: true,
      },
      {
        id: 'contados',
        icon: ListChecks,
        label: 'Contados',
        value: contados,
        subtitle: `${contados}/${total} processados`,
        trend: '+8% produtividade',
        trendPositive: true,
      },
      {
        id: 'ajustados',
        icon: Shield,
        label: 'Ajustados',
        value: ajustados,
        subtitle: 'Sincronizado com ERP',
        trend: '+2 ajustes aprovados',
        trendPositive: true,
      },
      {
        id: 'divergencias',
        icon: Package,
        label: 'Divergências',
        value: divergencias,
        subtitle: 'Necessário validar',
        trend: '-12% vs. mês anterior',
        trendPositive: true,
      },
    ];
  }, [inventario]);

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'todos', label: 'Todos', count: inventario.length },
      {
        id: 'pendente',
        label: 'Pendentes',
        count: inventario.filter((item) => item.status === 'pendente').length,
      },
      {
        id: 'contado',
        label: 'Contados',
        count: inventario.filter((item) => item.status === 'contado').length,
      },
      {
        id: 'ajustado',
        label: 'Ajustados',
        count: inventario.filter((item) => item.status === 'ajustado').length,
      },
    ],
    [inventario]
  );

  const filteredInventario = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return inventario
      .filter((item) => (activeTab === 'todos' ? true : item.status === activeTab))
      .filter((item) => item.produto_nome.toLowerCase().includes(term));
  }, [activeTab, inventario, searchTerm]);

  return (
    <ModulePageNeumo
      title="Inventário de Estoque"
      subtitle="Contagem física, divergências e ajustes"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      searchPlaceholder="Buscar produto ou código..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros avançados em desenvolvimento')}
      primaryActionLabel="Novo Inventário"
      onPrimaryAction={() => navigate('/estoque/inventario/novo')}
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/estoque')}
        >
          Voltar para Estoque
        </Button>
        <Button icon={<ClipboardList className="w-4 h-4" />}>Exportar Relatório</Button>
      </div>

      <div className="space-y-4">
        {filteredInventario.map((item) => (
          <div key={item.id} className="ic-card-neumo rounded-[28px] p-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{item.produto_nome}</h3>
                  <span
                    className={`
                      ic-kpi-pill px-3 py-1 text-xs font-semibold
                      ${item.status === 'ajustado' ? 'text-emerald-200' : ''}
                      ${item.status === 'contado' ? 'text-sky-200' : ''}
                      ${item.status === 'pendente' ? 'text-amber-200' : ''}
                    `}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-white/50">Qtd. Sistema</p>
                    <p className="text-lg font-semibold text-white">{item.quantidade_sistema}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Qtd. Física</p>
                    <p className="text-lg font-semibold text-white">
                      {item.quantidade_fisica ?? '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Diferença</p>
                    <p
                      className={`text-lg font-semibold ${
                        (item.diferenca ?? 0) < 0
                          ? 'text-rose-300'
                          : (item.diferenca ?? 0) > 0
                            ? 'text-amber-300'
                            : 'text-emerald-300'
                      }`}
                    >
                      {item.diferenca !== undefined
                        ? item.diferenca > 0
                          ? `+${item.diferenca}`
                          : item.diferenca
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Última contagem</p>
                    <p className="text-lg font-semibold text-white">
                      {item.data_contagem
                        ? new Date(item.data_contagem).toLocaleDateString('pt-BR')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm">
                  Ajustar
                </Button>
                <Button size="sm">Gerar relatório</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModulePageNeumo>
  );
}
