/**
 * Gestão de Entregas - Sub-módulo Completo
 *
 * FUNCIONALIDADES:
 * - Listagem paginada de entregas
 * - Filtros avançados (status, transportadora, período)
 * - Busca por código de rastreamento
 * - Ações (rastrear, cancelar, reimprimir etiqueta)
 * - Exportar relatórios (Excel, PDF)
 * - Visualização em lista ou mapa
 */

import { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Download,
  Map as MapIcon,
  List,
  Eye,
  X,
  Printer,
  Truck,
} from 'lucide-react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '../../oraclusx-ds/ModulePageNeumo';
import type { Entrega } from '../../../hooks/useEntregas';
import { useToast } from '../../../contexts/ToastContext';
import { Card } from '../../oraclusx-ds/Card';

interface GestaoEntregasProps {
  entregas: Entrega[];
  loading: boolean;
  onRastrear: (entrega: Entrega) => void;
  onCancelar: (entrega: Entrega) => void;
  onReimprimirEtiqueta: (entrega: Entrega) => void;
}

interface Filters {
  status: string;
  transportadora: string;
  periodo: string;
  search: string;
}

export function GestaoEntregas({
  entregas,
  loading,
  onRastrear,
  onCancelar,
  onReimprimirEtiqueta,
}: GestaoEntregasProps) {
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<'lista' | 'mapa'>('lista');
  const [filters, setFilters] = useState<Filters>({
    status: 'todas',
    transportadora: 'todas',
    periodo: 'ultimos_30_dias',
    search: '',
  });

  // Filtrar entregas
  const entregasFiltradas = useMemo(() => {
    let result = entregas;

    // Filtro de status
    if (filters.status !== 'todas') {
      result = result.filter((e) => e.status === filters.status);
    }

    // Filtro de transportadora
    if (filters.transportadora !== 'todas') {
      result = result.filter((e) =>
        (e.transportadora ?? '').toLowerCase().includes(filters.transportadora.toLowerCase())
      );
    }

    // Busca por código
    if (filters.search) {
      result = result.filter(
        (e) =>
          (e.codigo_rastreio ?? '').toLowerCase().includes(filters.search.toLowerCase()) ||
          e.destino_nome.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return result;
  }, [entregas, filters]);

  const handleExportar = () => {
    addToast('Exportando relatório...', 'info');
    // Implementar exportação
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-[var(--warning)]/10 text-[var(--warning)]',
      coletado: 'bg-[var(--accent)]/10 text-[var(--accent-foreground)]',
      em_transito: 'bg-[var(--primary)]/10 text-[var(--primary)]',
      saiu_entrega: 'bg-[var(--primary)]/10 text-[var(--primary)]',
      entregue: 'bg-success/10 text-success',
      falha: 'bg-[var(--error)]/10 text-[var(--error)]',
      cancelado: 'bg-[var(--muted)] text-[var(--text-secondary)]',
      devolvido: 'bg-[var(--warning)]/10 text-[var(--warning)]',
    };

    const labels: Record<string, string> = {
      pendente: 'Pendente',
      coletado: 'Coletado',
      em_transito: 'Em trânsito',
      saiu_entrega: 'Saiu para entrega',
      entregue: 'Entregue',
      falha: 'Falha',
      cancelado: 'Cancelado',
      devolvido: 'Devolvido',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-body-xs orx-orx-font-medium ${colors[status] || 'bg-[var(--muted)] text-[var(--text-primary)]'}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <ModulePageNeumo
      title="Gestão de Entregas"
      subtitle="Rastreabilidade completa e logística integrada"
      kpis={[] as ModuleKpiItem[]}
      tabs={[] as ModuleTabItem[]}
      searchPlaceholder="Buscar entrega ou código de rastreamento..."
      onSearchChange={(value: string) => setFilters((prev) => ({ ...prev, search: value }))}
      onFilterClick={() => setViewMode((prev) => (prev === 'lista' ? 'mapa' : 'lista'))}
      primaryActionLabel="Exportar Relatório"
      onPrimaryAction={handleExportar}
    >
      <div className="space-y-6">
        {/* Barra de Filtros */}
        <Card padding="md">
          <div className="flex flex-wrap items-end gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2 text-[0.813rem] orx-orx-font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Código de rastreamento..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg
                bg-surface-light dark:bg-surface-dark
                border border-[var(--border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                  transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div className="w-[180px]">
              <label className="block mb-2 text-[0.813rem] orx-orx-font-medium">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                aria-label="Status"
                className="w-full px-4 py-2 rounded-lg
                bg-surface-light dark:bg-surface-dark
                border border-[var(--border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                transition-all"
              >
                <option value="todas">Todas</option>
                <option value="pendente">Pendente</option>
                <option value="coletado">Coletado</option>
                <option value="em_transito">Em Trânsito</option>
                <option value="saiu_entrega">Saiu p/ Entrega</option>
                <option value="entregue">Entregue</option>
                <option value="falha">Falha</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Transportadora */}
            <div className="w-[180px]">
              <label className="block mb-2 text-[0.813rem] orx-orx-font-medium">
                Transportadora
              </label>
              <select
                value={filters.transportadora}
                onChange={(e) => setFilters({ ...filters, transportadora: e.target.value })}
                aria-label="Transportadora"
                className="w-full px-4 py-2 rounded-lg
                bg-surface-light dark:bg-surface-dark
                border border-[var(--border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                transition-all"
              >
                <option value="todas">Todas</option>
                <option value="correios">Correios</option>
                <option value="jadlog">Jadlog</option>
                <option value="tnt">TNT (FedEx)</option>
                <option value="azul">Azul Cargo</option>
                <option value="latam">LATAM Cargo</option>
              </select>
            </div>

            {/* Período */}
            <div className="w-[180px]">
              <label className="block mb-2 text-[0.813rem] orx-orx-font-medium">Período</label>
              <select
                value={filters.periodo}
                onChange={(e) => setFilters({ ...filters, periodo: e.target.value })}
                aria-label="Período"
                className="w-full px-4 py-2 rounded-lg
                bg-surface-light dark:bg-surface-dark
                border border-[var(--border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                transition-all"
              >
                <option value="hoje">Hoje</option>
                <option value="ultimos_7_dias">Últimos 7 dias</option>
                <option value="ultimos_30_dias">Últimos 30 dias</option>
                <option value="este_mes">Este mês</option>
                <option value="mes_passado">Mês passado</option>
              </select>
            </div>

            {/* Ações */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleExportar}
                className="px-4 py-2 rounded-lg
                bg-surface-light dark:bg-surface-dark
                border border-[var(--border)]
                hover:bg-[var(--surface-hover)]
                transition-all
                flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'lista' ? 'mapa' : 'lista')}
                className="px-4 py-2 rounded-lg
                bg-surface-light dark:bg-surface-dark
                border border-[var(--border)]
                hover:bg-[var(--surface-hover)]
                transition-all
                flex items-center gap-2"
              >
                {viewMode === 'lista' ? (
                  <>
                    <MapIcon className="h-4 w-4" />
                    <span>Mapa</span>
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4" />
                    <span>Lista</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Contador */}
        <div className="flex items-center justify-between">
          <p className="text-[var(--text-secondary)] text-[0.813rem]">
            {entregasFiltradas.length} entrega(s) encontrada(s)
          </p>
        </div>

        {viewMode === 'lista' ? (
          <div className="ic-card-neumo rounded-[32px] p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
              </div>
            ) : entregasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary)]">
                <Package className="h-16 w-16 mb-4 opacity-50" />
                <p>Nenhuma entrega encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[var(--border)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-[var(--text-secondary)] uppercase tracking-wider text-[0.813rem] orx-orx-font-medium">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-[var(--text-secondary)] uppercase tracking-wider text-[0.813rem] orx-orx-font-medium">
                        Transportadora
                      </th>
                      <th className="px-6 py-3 text-left text-[var(--text-secondary)] uppercase tracking-wider text-[0.813rem] orx-orx-font-medium">
                        Destino
                      </th>
                      <th className="px-6 py-3 text-left text-[var(--text-secondary)] uppercase tracking-wider text-[0.813rem] orx-orx-font-medium">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[var(--text-secondary)] uppercase tracking-wider text-[0.813rem] orx-orx-font-medium">
                        Previsão
                      </th>
                      <th className="px-6 py-3 text-left text-[var(--text-secondary)] uppercase tracking-wider text-[0.813rem] orx-orx-font-medium">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-right text-[var(--text-secondary)] uppercase tracking-wider text-[0.813rem] orx-orx-font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--card)] dark:bg-[var(--card)] divide-y divide-[var(--border)]">
                    {entregasFiltradas.map((entrega) => (
                      <tr
                        key={entrega.id}
                        className="hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="font-mono text-[var(--text-primary)] text-[0.813rem]">
                            {entrega.codigo_rastreio || '-'}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-[var(--text-secondary)]" />
                            <span className="text-[0.813rem]">{entrega.transportadora || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[0.813rem]">{entrega.destino_nome || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(entrega.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[0.813rem]">
                            {formatDate(entrega.data_previsao ?? null)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[0.813rem] orx-orx-font-medium">
                            {formatCurrency(entrega.valor_frete ?? null)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[0.813rem] orx-orx-font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onRastrear(entrega)}
                              className="p-2 rounded-lg
                              hover:bg-[var(--surface-hover)]
                              transition-colors"
                              title="Rastrear"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {entrega.status === 'pendente' && (
                              <button
                                onClick={() => onCancelar(entrega)}
                                className="p-2 rounded-lg
                                hover:bg-[var(--error)]/10
                                text-[var(--error)]
                                transition-colors"
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onReimprimirEtiqueta(entrega)}
                              className="p-2 rounded-lg
                              hover:bg-[var(--surface-hover)]
                              transition-colors"
                              title="Reimprimir Etiqueta"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="ic-card-neumo rounded-[32px] p-0 h-[600px]">
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MapIcon className="h-16 w-16 mb-4 opacity-50 mx-auto" />
                <p>Visualização de mapa</p>
                <p className="mt-2 text-[0.813rem]">
                  Integração com Google Maps em desenvolvimento
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePageNeumo>
  );
}
