/**
 * Gestão de Contratos - ICARUS v5.0
 * Contratos comerciais e jurídicos
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, FileSignature, Calendar, Building2, AlertCircle, Filter, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import { useDocumentTitle } from '@/hooks';

interface Contrato {
  id: string;
  numero: string;
  tipo: 'fornecimento' | 'consignacao' | 'prestacao_servicos' | 'parceria';
  cliente: string;
  valor_total: number;
  data_inicio: string;
  data_fim: string;
  status: 'ativo' | 'expirado' | 'suspenso' | 'cancelado';
  renovacao_automatica: boolean;
}

const MOCK_CONTRATOS: Contrato[] = [
  {
    id: '1',
    numero: 'CONT-2024-001',
    tipo: 'fornecimento',
    cliente: 'Hospital Sírio-Libanês',
    valor_total: 500000,
    data_inicio: '2024-01-01',
    data_fim: '2024-12-31',
    status: 'ativo',
    renovacao_automatica: true,
  },
];

export default function GestaoContratos() {
  useDocumentTitle('Gestão de Contratos');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | Contrato['status']>('todos');
  const [contratos] = useState<Contrato[]>(MOCK_CONTRATOS);

  const kpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'ativos',
        icon: FileSignature,
        label: 'Contratos Ativos',
        value: contratos.filter((c) => c.status === 'ativo').length,
        subtitle: `${contratos.length} no total`,
        trend: '+2 renovações',
        trendPositive: true,
      },
      {
        id: 'expirados',
        icon: AlertCircle,
        label: 'Expirando em 30 dias',
        value: contratos.filter((c) => c.status === 'expirado').length,
        subtitle: 'Monitoramento automático',
        trend: '+1 alerta',
        trendPositive: false,
      },
      {
        id: 'renovacao',
        icon: Building2,
        label: 'Renovação automática',
        value: contratos.filter((c) => c.renovacao_automatica).length,
        subtitle: 'Contratos com auto-renovação',
        trend: 'Sem ação pendente',
        trendPositive: true,
      },
      {
        id: 'valor',
        icon: DollarSign,
        label: 'Volume Contratado',
        value: 'R$ 500k',
        subtitle: 'Valor acumulado',
        trend: '+5.4%',
        trendPositive: true,
      },
    ],
    [contratos]
  );

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'todos', label: 'Todos', count: contratos.length },
      { id: 'ativo', label: 'Ativos', count: contratos.filter((c) => c.status === 'ativo').length },
      {
        id: 'expirado',
        label: 'Expirados',
        count: contratos.filter((c) => c.status === 'expirado').length,
      },
      {
        id: 'suspenso',
        label: 'Suspensos',
        count: contratos.filter((c) => c.status === 'suspenso').length,
      },
      {
        id: 'cancelado',
        label: 'Cancelados',
        count: contratos.filter((c) => c.status === 'cancelado').length,
      },
    ],
    [contratos]
  );

  const filteredContratos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return contratos
      .filter((c) => (activeTab === 'todos' ? true : c.status === activeTab))
      .filter(
        (c) => c.numero.toLowerCase().includes(term) || c.cliente.toLowerCase().includes(term)
      );
  }, [activeTab, contratos, searchTerm]);

  return (
    <ModulePageNeumo
      title="Gestão de Contratos"
      subtitle="Contratos comerciais e jurídicos"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      searchPlaceholder="Buscar contrato ou cliente..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros de contratos em desenvolvimento')}
      primaryActionLabel="Novo Contrato"
      onPrimaryAction={() => navigate('/vendas/contratos/novo')}
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
          Exportar Contratos
        </button>
      </div>

      <div className="space-y-4">
        {filteredContratos.map((contrato) => (
          <div key={contrato.id} className="ic-card-neumo rounded-[28px] p-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{contrato.numero}</h3>
                  <span
                    className={`
                      ic-kpi-pill px-3 py-1 text-xs font-semibold
                      ${contrato.status === 'ativo' ? 'text-emerald-300' : ''}
                      ${contrato.status === 'expirado' ? 'text-rose-300' : ''}
                      ${contrato.status === 'suspenso' ? 'text-amber-300' : ''}
                      ${contrato.status === 'cancelado' ? 'text-white/60' : ''}
                    `}
                  >
                    {contrato.status.toUpperCase()}
                  </span>
                  {contrato.renovacao_automatica && (
                    <span className="ic-kpi-pill px-3 py-1 text-xs text-sky-200">
                      Renovação Automática
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Building2 className="w-4 h-4" />
                  {contrato.cliente}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-white/60">Tipo</p>
                    <p className="text-sm font-medium text-white capitalize">
                      {contrato.tipo.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Valor Total</p>
                    <p className="text-sm font-semibold text-emerald-300">
                      R$ {contrato.valor_total.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Início
                    </p>
                    <p className="text-sm font-medium text-white">
                      {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Término
                    </p>
                    <p className="text-sm font-medium text-white">
                      {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  Renovar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModulePageNeumo>
  );
}
