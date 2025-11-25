import { useMemo, useState } from 'react';
import { ClipboardList, DollarSign, PackageSearch, Settings, Filter } from 'lucide-react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import { NeumoForm } from '@/components/oraclusx-ds/forms/NeumoForm';
import { NeumoField } from '@/components/oraclusx-ds/forms/NeumoField';
import { Input } from '@/components/oraclusx-ds/Input';
import { Textarea } from '@/components/oraclusx-ds/Textarea';

interface Cotacao {
  id: string;
  fornecedor: string;
  status: 'rascunho' | 'enviada' | 'recebida' | 'aprovada' | 'rejeitada';
  total: number;
  prazoResposta: string;
}

const MOCK_COTACOES: Cotacao[] = [
  {
    id: 'COT-0451',
    fornecedor: 'MedSupply Brasil',
    status: 'recebida',
    total: 48750,
    prazoResposta: '2024-12-05',
  },
  {
    id: 'COT-0450',
    fornecedor: 'Ortopmed Distribuidora',
    status: 'enviada',
    total: 0,
    prazoResposta: '2024-12-06',
  },
];

export default function GestaoCotacoes() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'todas' | Cotacao['status']>('todas');
  const [form, setForm] = useState({ fornecedor: '', status: '', total: '', prazo: '' });
  const [internalNotes, setInternalNotes] = useState('');

  const kpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'ativas',
        icon: ClipboardList,
        label: 'Cotações Ativas',
        value: MOCK_COTACOES.length,
        subtitle: 'Em andamento',
        trend: '+2 hoje',
        trendPositive: true,
      },
      {
        id: 'recebidas',
        icon: DollarSign,
        label: 'Recebidas',
        value: MOCK_COTACOES.filter((c) => c.status === 'recebida').length,
        subtitle: 'Aguardando análise',
        trend: '+1 nesta semana',
        trendPositive: true,
      },
      {
        id: 'aprovadas',
        icon: PackageSearch,
        label: 'Aprovadas',
        value: MOCK_COTACOES.filter((c) => c.status === 'aprovada').length,
        subtitle: 'Integradas com compras',
        trend: 'Fluxo estável',
        trendPositive: true,
      },
      {
        id: 'valor',
        icon: DollarSign,
        label: 'Valor Total em análise',
        value: 'R$ 48,7K',
        subtitle: 'Calculado por média',
        trend: '+3.4%',
        trendPositive: true,
      },
    ],
    []
  );

  const tabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'todas', label: 'Todas', count: MOCK_COTACOES.length },
      {
        id: 'rascunho',
        label: 'Rascunhos',
        count: MOCK_COTACOES.filter((c) => c.status === 'rascunho').length,
      },
      {
        id: 'enviada',
        label: 'Enviadas',
        count: MOCK_COTACOES.filter((c) => c.status === 'enviada').length,
      },
      {
        id: 'recebida',
        label: 'Recebidas',
        count: MOCK_COTACOES.filter((c) => c.status === 'recebida').length,
      },
      {
        id: 'aprovada',
        label: 'Aprovadas',
        count: MOCK_COTACOES.filter((c) => c.status === 'aprovada').length,
      },
      {
        id: 'rejeitada',
        label: 'Rejeitadas',
        count: MOCK_COTACOES.filter((c) => c.status === 'rejeitada').length,
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return MOCK_COTACOES.filter((cotacao) =>
      activeTab === 'todas' ? true : cotacao.status === activeTab
    ).filter(
      (cotacao) =>
        cotacao.id.toLowerCase().includes(term) || cotacao.fornecedor.toLowerCase().includes(term)
    );
  }, [activeTab, search]);

  return (
    <ModulePageNeumo
      title="Gestão de Cotações"
      subtitle="Coordene e acompanhe cotações de materiais OPME"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      searchPlaceholder="Buscar cotação ou fornecedor..."
      onSearchChange={setSearch}
      onFilterClick={() => alert('Filtros avançados em desenvolvimento')}
      primaryActionLabel="Nova Cotação"
      onPrimaryAction={() => alert('Ação: Nova cotação')}
    >
      <div className="flex items-center justify-between mb-4">
        <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
          Exportar Planilha
        </Button>
        <Button icon={<Settings className="w-4 h-4" />}>Configurar fornecedores</Button>
      </div>

      <div className="space-y-4">
        {filtered.map((cotacao) => (
          <div key={cotacao.id} className="ic-card-neumo rounded-[24px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{cotacao.id}</h3>
                  <span className="ic-kpi-pill px-3 py-1 text-xs font-semibold text-white/80">
                    {cotacao.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-white/70">{cotacao.fornecedor}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-white/60">Prazo de resposta</p>
                    <p className="text-white font-medium">
                      {new Date(cotacao.prazoResposta).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60">Valor estimado</p>
                    <p className="text-emerald-300 font-semibold">
                      {cotacao.total ? `R$ ${cotacao.total.toLocaleString('pt-BR')}` : 'Aguardando'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Ver detalhes
                </Button>
                <Button size="sm">Transformar em pedido</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="ic-card-neumo rounded-[24px] p-10 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-white/50" />
          <p className="text-white/70">Nenhuma cotação encontrada</p>
        </div>
      )}

      <NeumoForm
        title="Resumo da Cotação"
        description="Preencha os dados principais da cotação selecionada."
      >
        <div className="grid md:grid-cols-2 gap-4">
          <NeumoField label="Fornecedor">
            <Input
              value={form.fornecedor}
              onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
            />
          </NeumoField>
          <NeumoField label="Status">
            <Input
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </NeumoField>
          <NeumoField label="Total">
            <Input
              value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
            />
          </NeumoField>
          <NeumoField label="Prazo">
            <Input
              value={form.prazo}
              onChange={(e) => setForm({ ...form, prazo: e.target.value })}
            />
          </NeumoField>
        </div>
      </NeumoForm>

      <NeumoForm
        title="Notas Internas"
        description="Compartilhe observações com a equipe sobre fornecedores, prazos ou condições específicas."
        actions={<Button>Salvar notas</Button>}
      >
        <NeumoField label="Observações">
          <Textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={5}
            placeholder="Observações para a equipe..."
          />
        </NeumoField>
      </NeumoForm>
    </ModulePageNeumo>
  );
}
