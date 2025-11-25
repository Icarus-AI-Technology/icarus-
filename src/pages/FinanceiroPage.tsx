// src/pages/FinanceiroPage.tsx
import { useState, useEffect } from 'react';
import { legacySupabase as supabase } from '../lib/legacySupabase';
import { Card } from '../components/oraclusx-ds/Card';
import { Badge } from '../components/oraclusx-ds/Badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  Filter,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '../components/oraclusx-ds/Button';
import { NeumoInput } from '../components/oraclusx-ds/NeumoInput';
import { CardKpiNeumo } from '../components/oraclusx-ds/CardKpiNeumo';
import type { Database } from '../lib/database.types.generated';

type Transacao = Database['public']['Tables']['transacoes']['Row'];

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    fetchTransacoes();
  }, []);

  async function fetchTransacoes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .is('excluido_em', null)
        .order('data_transacao', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransacoes((data || []) as Transacao[]);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter((transacao) => {
    const matchSearch =
      transacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transacao.categoria?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = tipoFilter === 'todos' || transacao.tipo === tipoFilter;
    const matchStatus = statusFilter === 'todos' || transacao.status === statusFilter;

    return matchSearch && matchTipo && matchStatus;
  });

  // Calcular estatísticas
  const stats = {
    receitaTotal: transacoes
      .filter((t) => t.tipo === 'receita' && t.status === 'paga')
      .reduce((sum, t) => sum + (Number(t.valor) || 0), 0),
    despesaTotal: transacoes
      .filter((t) => t.tipo === 'despesa' && t.status === 'paga')
      .reduce((sum, t) => sum + (Number(t.valor) || 0), 0),
    aPagar: transacoes
      .filter((t) => t.tipo === 'despesa' && t.status === 'pendente')
      .reduce((sum, t) => sum + (Number(t.valor) || 0), 0),
    aReceber: transacoes
      .filter((t) => t.tipo === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + (Number(t.valor) || 0), 0),
  };

  const saldoLiquido = stats.receitaTotal - stats.despesaTotal;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'paga':
        return <Badge variant="success">Pago</Badge>;
      case 'pendente':
        return <Badge variant="warning">Pendente</Badge>;
      case 'cancelada':
        return <Badge variant="error">Cancelado</Badge>;
      case 'vencido':
        return <Badge variant="error">Vencido</Badge>;
      default:
        return <Badge variant="default">{status || 'N/A'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 bg-destructive/10">
          <p className="text-destructive font-semibold">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-1">
            Controle de receitas, despesas e fluxo de caixa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="neumo" leftIcon={FileText}>
            Relatórios
          </Button>
          <Button variant="primary" leftIcon={DollarSign}>
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Receita Total */}
        <CardKpiNeumo
          icon={TrendingUp}
          label="Receita Total"
          value={formatCurrency(stats.receitaTotal)}
          trendPositive={true}
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-500/20"
        />

        {/* Despesa Total */}
        <CardKpiNeumo
          icon={TrendingDown}
          label="Despesa Total"
          value={formatCurrency(stats.despesaTotal)}
          trendPositive={false}
          iconColor="text-red-600"
          iconBg="bg-red-100 dark:bg-red-500/20"
        />

        {/* Saldo Líquido */}
        <CardKpiNeumo
          icon={DollarSign}
          label="Saldo Líquido"
          value={formatCurrency(saldoLiquido)}
          trendPositive={saldoLiquido >= 0}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-500/20"
        />

        {/* A Pagar */}
        <CardKpiNeumo
          icon={AlertCircle}
          label="A Pagar"
          value={formatCurrency(stats.aPagar)}
          iconColor="text-orange-600"
          iconBg="bg-orange-100 dark:bg-orange-500/20"
        />

        {/* A Receber */}
        <CardKpiNeumo
          icon={Clock}
          label="A Receber"
          value={formatCurrency(stats.aReceber)}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-500/20"
        />
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <NeumoInput
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tipo Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              aria-label="Filtrar por tipo de transação"
            >
              <option value="todos">Todos Tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por status da transação"
          >
            <option value="todos">Todos Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
            <option value="vencido">Vencido</option>
          </select>

          {/* Export Button */}
          <Button variant="neumo" leftIcon={Download}>
            Exportar
          </Button>
        </div>
      </Card>

      {/* Transações Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">Data</th>
                <th className="text-left p-3 font-semibold">Descrição</th>
                <th className="text-left p-3 font-semibold">Categoria</th>
                <th className="text-center p-3 font-semibold">Tipo</th>
                <th className="text-right p-3 font-semibold">Valor</th>
                <th className="text-center p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    {searchTerm || tipoFilter !== 'todos' || statusFilter !== 'todos'
                      ? 'Nenhuma transação encontrada com os filtros aplicados'
                      : 'Nenhuma transação registrada'}
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((transacao) => (
                  <tr
                    key={transacao.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {transacao.data
                            ? new Date(transacao.data).toLocaleDateString('pt-BR')
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{transacao.descricao || 'N/A'}</span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {transacao.categoria || 'Sem categoria'}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={transacao.tipo === 'receita' ? 'success' : 'error'}>
                        {transacao.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-bold ${
                          transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transacao.tipo === 'receita' ? '+' : '-'}{' '}
                        {formatCurrency(Number(transacao.valor) || 0)}
                      </span>
                    </td>
                    <td className="p-3 text-center">{getStatusBadge(transacao.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-primary hover:underline text-sm">Editar</button>
                        <button className="text-muted-foreground hover:underline text-sm">
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
