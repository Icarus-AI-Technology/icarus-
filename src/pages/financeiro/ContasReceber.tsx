import { useMemo, useState } from 'react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { Button } from '@/components/oraclusx-ds/Button';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  RefreshCcw,
} from 'lucide-react';
import { useContasReceber } from '@/hooks/useContasReceber';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  todos: 'Todas',
  pendente: 'Pendentes',
  pago: 'Pagas',
  vencido: 'Vencidas',
  parcial: 'Parciais',
  cancelado: 'Canceladas',
};

const statusVariant: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error' | 'primary'
> = {
  pendente: 'warning',
  pago: 'success',
  vencido: 'error',
  parcial: 'info',
  cancelado: 'default',
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ContasReceber() {
  const { contas, loading, error } = useContasReceber();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('todos');

  const resumo = useMemo(() => {
    const total = contas.reduce(
      (acc, conta) => acc + (conta.valor_liquido ?? conta.valor_original ?? 0),
      0
    );
    const pago = contas
      .filter((conta) => conta.status === 'pago')
      .reduce((acc, conta) => acc + (conta.valor_pago ?? conta.valor_liquido ?? 0), 0);
    const pendente = total - pago;
    const vencido = contas
      .filter((conta) => conta.status === 'vencido')
      .reduce((acc, conta) => acc + (conta.valor_liquido ?? conta.valor_original ?? 0), 0);

    return { total, pago, pendente, vencido };
  }, [contas]);

  const moduleKpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'total',
        icon: DollarSign,
        label: 'Total a Receber',
        value: formatCurrency(resumo.total),
        subtitle: `${contas.length} títulos`,
        trend: '+3.2%',
        trendPositive: true,
      },
      {
        id: 'pago',
        icon: CheckCircle,
        label: 'Recebido (mês)',
        value: formatCurrency(resumo.pago),
        subtitle: 'Liquidados',
        trend: '+1.1%',
        trendPositive: true,
      },
      {
        id: 'pendente',
        icon: CreditCard,
        label: 'Pendentes',
        value: formatCurrency(resumo.pendente),
        subtitle: 'A receber',
        trend: '-0.8%',
        trendPositive: false,
      },
      {
        id: 'vencido',
        icon: AlertCircle,
        label: 'Vencidos',
        value: formatCurrency(resumo.vencido),
        subtitle: `${contas.filter((c) => c.status === 'vencido').length} títulos`,
        trend: '+0.5%',
        trendPositive: false,
      },
    ],
    [contas, resumo]
  );

  const moduleTabs = useMemo<ModuleTabItem[]>(() => {
    const counts = contas.reduce<Record<string, number>>((acc, conta) => {
      acc[conta.status] = (acc[conta.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: 'todos', label: 'Todas', count: contas.length },
      { id: 'pendente', label: 'Pendentes', count: counts.pendente ?? 0 },
      { id: 'vencido', label: 'Vencidas', count: counts.vencido ?? 0 },
      { id: 'pago', label: 'Pagas', count: counts.pago ?? 0 },
      { id: 'parcial', label: 'Parciais', count: counts.parcial ?? 0 },
    ];
  }, [contas]);

  const filteredContas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return contas
      .filter((conta) => (activeTab === 'todos' ? true : conta.status === activeTab))
      .filter(
        (conta) =>
          conta.cliente_nome?.toLowerCase().includes(term) ||
          conta.numero_documento?.toLowerCase().includes(term) ||
          conta.categoria?.toLowerCase().includes(term)
      )
      .sort(
        (a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime()
      );
  }, [contas, activeTab, searchTerm]);

  const renderStatusBadge = (status: string) => (
    <Badge variant={statusVariant[status] ?? 'default'}>{statusLabels[status] ?? status}</Badge>
  );

  return (
    <ModulePageNeumo
      title="Contas a Receber"
      subtitle="Fluxo financeiro e inadimplência monitorados em tempo real"
      kpis={moduleKpis}
      tabs={moduleTabs}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Buscar cliente, documento ou categoria..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros avançados de contas')}
      primaryActionLabel="+ Nova Conta"
      onPrimaryAction={() => alert('Abrir formulário de nova conta')}
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="ic-card-neumo rounded-[24px] p-4 text-rose-200 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">
            Exibindo {filteredContas.length} de {contas.length} contas
          </span>
          <Button
            variant="secondary"
            icon={<RefreshCcw className="w-4 h-4" />}
            onClick={() => setActiveTab('todos')}
          >
            Atualizar visão
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="ic-card-neumo rounded-[28px] p-10 text-center text-white/70">
              Carregando contas...
            </div>
          ) : filteredContas.length === 0 ? (
            <div className="ic-card-neumo rounded-[28px] p-10 text-center text-white/70">
              Nenhuma conta encontrada para o filtro atual.
            </div>
          ) : (
            filteredContas.map((conta) => (
              <div
                key={conta.id}
                className="ic-card-neumo rounded-[28px] p-5 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-[220px]">
                  <p className="text-white font-semibold leading-tight">{conta.cliente_nome}</p>
                  <p className="text-white/70 text-sm">
                    Documento #{conta.numero_documento} •{' '}
                    {statusLabels[conta.status] ?? conta.status}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-sm text-white/70">
                    <span>Emissão</span>
                    <strong className="text-white">
                      {new Date(conta.data_emissao).toLocaleDateString('pt-BR')}
                    </strong>
                  </div>
                  <div className="flex flex-col text-sm text-white/70">
                    <span>Vencimento</span>
                    <strong
                      className={cn('text-white', conta.status === 'vencido' && 'text-rose-300')}
                    >
                      {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-2xl font-semibold text-white">
                    {formatCurrency(conta.valor_liquido ?? conta.valor_original ?? 0)}
                  </span>
                  {renderStatusBadge(conta.status)}
                  {conta.dias_atraso && conta.dias_atraso > 0 && (
                    <span className="ic-kpi-pill px-3 py-1 text-xs text-rose-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {conta.dias_atraso} dias
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ModulePageNeumo>
  );
}
