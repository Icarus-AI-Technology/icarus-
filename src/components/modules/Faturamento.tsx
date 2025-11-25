import { useState, useEffect } from 'react';
import { Card, Progress } from '@/components/oraclusx-ds';
import {
  FileText,
  Download,
  Eye,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Plus,
  Loader2,
  Send,
} from 'lucide-react';
import { useDocumentTitle, useFaturas } from '@/hooks';
import type { Fatura } from '@/hooks/useFaturas';
import { useToast } from '@/contexts/ToastContext';

export default function Faturamento() {
  useDocumentTitle('Faturamento e NF-e');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'nfe' | 'dda' | 'pluggy'>('dashboard');

  // Backend Integration
  const { faturas, loading, error, getResumoFaturas, emitirFatura, cancelarFatura } = useFaturas();
  const { addToast } = useToast();

  const [resumo, setResumo] = useState({
    totalFaturas: 0,
    valorTotal: 0,
    emitidas: 0,
    pagas: 0,
    pendentes: 0,
    canceladas: 0,
    taxaPagamento: 0,
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      getResumoFaturas().then(setResumo);
    }
  }, [activeTab, getResumoFaturas, faturas]);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  const getStatusColor = (status: Fatura['status']): string => {
    const colors: Record<Fatura['status'], string> = {
      rascunho: 'text-secondary bg-surface',
      pendente: 'text-warning bg-warning/5',
      emitida: 'text-accent bg-blue-50',
      autorizada: 'text-success bg-success/5',
      cancelada: 'text-error bg-destructive/5',
      paga: 'text-emerald-600 bg-emerald-50',
    };
    return colors[status] || 'text-secondary bg-surface';
  };

  const getStatusIcon = (status: Fatura['status']) => {
    const icons: Record<Fatura['status'], JSX.Element> = {
      rascunho: <FileText className="w-4 h-4" />,
      pendente: <Clock className="w-4 h-4" />,
      emitida: <FileText className="w-4 h-4" />,
      autorizada: <CheckCircle className="w-4 h-4" />,
      cancelada: <XCircle className="w-4 h-4" />,
      paga: <DollarSign className="w-4 h-4" />,
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const handleEmitirFatura = async (id: string) => {
    const success = await emitirFatura(id);
    if (success) {
      addToast('Fatura emitida com sucesso!', 'success');
    }
  };

  const handleCancelarFatura = async (id: string) => {
    const motivo = prompt('Digite o motivo do cancelamento:');
    if (!motivo) return;

    const success = await cancelarFatura(id, motivo);
    if (success) {
      addToast('Fatura cancelada com sucesso!', 'success');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* KPIs */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="neuro-raised p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-sm text-[var(--text-secondary)] mb-1">Total Faturado</p>
                <h3 className="text-heading font-display text-[var(--text-primary)]">
                  {formatCurrency(resumo.valorTotal)}
                </h3>
                <p className="text-body-xs text-success mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Realtime
                </p>
              </div>
              <div className="p-3 rounded-xl neuro-inset">
                <DollarSign className="w-6 h-6 text-[var(--primary)]" />
              </div>
            </div>
          </Card>

          <Card className="neuro-raised p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-sm text-[var(--text-secondary)] mb-1">NF-e Emitidas</p>
                <h3 className="text-heading font-display text-[var(--text-primary)]">
                  {resumo.emitidas}
                </h3>
                <p className="text-body-xs text-[var(--text-secondary)] mt-2">
                  Total: {resumo.totalFaturas}
                </p>
              </div>
              <div className="p-3 rounded-xl neuro-inset">
                <FileText className="w-6 h-6 text-[var(--primary)]" />
              </div>
            </div>
          </Card>

          <Card className="neuro-raised p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-sm text-[var(--text-secondary)] mb-1">Pendentes</p>
                <h3 className="text-heading font-display text-[var(--text-primary)]">
                  {resumo.pendentes}
                </h3>
                <p className="text-body-xs text-warning mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Aguardando
                </p>
              </div>
              <div className="p-3 rounded-xl neuro-inset">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="neuro-raised p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-sm text-[var(--text-secondary)] mb-1">Taxa de Pagamento</p>
                <h3 className="text-heading font-display text-[var(--text-primary)]">
                  {resumo.taxaPagamento.toFixed(0)}%
                </h3>
                <p className="text-body-xs text-[var(--text-secondary)] mt-2">
                  {resumo.pagas} de {resumo.totalFaturas} pagas
                </p>
              </div>
              <div className="p-3 rounded-xl neuro-inset">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Gráfico de Status */}
      {!loading && (
        <Card className="neuro-raised p-6">
          <h3 className="text-body-lg text-[var(--text-primary)] mb-4 orx-orx-font-medium">
            Distribuição de Status
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-body-sm mb-1">
                <span className="text-[var(--text-secondary)]">Autorizadas</span>
                <span className="text-[var(--text-primary)] orx-orx-font-medium">
                  {resumo.emitidas} (
                  {resumo.totalFaturas > 0
                    ? ((resumo.emitidas / resumo.totalFaturas) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2">
                <Progress
                  value={Math.min(
                    resumo.totalFaturas > 0 ? (resumo.emitidas / resumo.totalFaturas) * 100 : 0,
                    100
                  )}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm mb-1">
                <span className="text-[var(--text-secondary)]">Pendentes</span>
                <span className="text-[var(--text-primary)] orx-orx-font-medium">
                  {resumo.pendentes} (
                  {resumo.totalFaturas > 0
                    ? ((resumo.pendentes / resumo.totalFaturas) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2">
                <Progress
                  value={Math.min(
                    resumo.totalFaturas > 0 ? (resumo.pendentes / resumo.totalFaturas) * 100 : 0,
                    100
                  )}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm mb-1">
                <span className="text-[var(--text-secondary)]">Pagas</span>
                <span className="text-[var(--text-primary)] orx-orx-font-medium">
                  {resumo.pagas} ({resumo.taxaPagamento.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2">
                <Progress value={Math.min(resumo.taxaPagamento, 100)} />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderNFe = () => (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <button className="neuro-button px-6 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova NF-e
          </button>
          <button className="neuro-button-secondary px-4 py-2 rounded-xl" aria-label="Filtrar NF-e">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar NF-e..."
              className="w-full pl-10 pr-4 py-2 rounded-xl neuro-inset text-body-sm"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Tabela de NF-e */}
      {!loading && (
        <Card className="neuro-raised overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Número
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Cliente
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Data Emissão
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Valor
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Status
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {faturas.map((fatura) => (
                  <tr
                    key={fatura.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-[var(--text-primary)] orx-orx-font-medium">
                          {fatura.numero_nfe}
                        </p>
                        <p className="text-body-xs text-[var(--text-secondary)]">
                          Série {fatura.serie}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-[var(--text-primary)]">{fatura.cliente_nome}</p>
                        <p className="text-body-xs text-[var(--text-secondary)]">
                          {fatura.cliente_cpf_cnpj}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {formatDate(fatura.data_emissao)}
                    </td>
                    <td className="p-4 text-[var(--text-primary)] orx-orx-font-medium">
                      {formatCurrency(fatura.valor_total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-xs orx-orx-font-medium ${getStatusColor(fatura.status)}`}
                      >
                        {getStatusIcon(fatura.status)}
                        {fatura.status.charAt(0).toUpperCase() + fatura.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all"
                          title="Download XML"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {fatura.status === 'pendente' && (
                          <button
                            onClick={() => handleEmitirFatura(fatura.id)}
                            className="p-2 rounded-lg neuro-button hover:neuro-pressed transition-all"
                            title="Emitir NF-e"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {['emitida', 'autorizada'].includes(fatura.status) && (
                          <button
                            onClick={() => handleCancelarFatura(fatura.id)}
                            className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all text-error"
                            title="Cancelar NF-e"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {faturas.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">Nenhuma NF-e encontrada</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderDDA = () => (
    <Card className="neuro-raised p-12 text-center">
      <Calendar className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
      <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">
        DDA - Débito Direto Autorizado
      </h3>
      <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
    </Card>
  );

  const renderPluggy = () => (
    <Card className="neuro-raised p-12 text-center">
      <AlertCircle className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
      <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">
        Integração Pluggy
      </h3>
      <p className="text-[var(--text-secondary)]">Open Banking em desenvolvimento</p>
    </Card>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Faturamento e NF-e
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gestão fiscal completa com emissão automática e integração SEFAZ
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success/50 animate-pulse" />
            <span className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
              Realtime Sync
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'nfe', label: 'NF-e', icon: FileText },
            { id: 'dda', label: 'DDA', icon: Calendar },
            { id: 'pluggy', label: 'Open Banking', icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-xl orx-orx-font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'neuro-raised text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'nfe' && renderNFe()}
        {activeTab === 'dda' && renderDDA()}
        {activeTab === 'pluggy' && renderPluggy()}
      </div>
    </div>
  );
}
