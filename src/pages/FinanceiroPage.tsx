// src/pages/FinanceiroPage.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/oraclusx-ds/card'
import { Badge } from '../components/oraclusx-ds/badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  FileText,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { Database } from '../lib/database.types.generated'

type Transacao = Database['public']['Tables']['transacoes']['Row']

export function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  useEffect(() => {
    fetchTransacoes()
  }, [])

  async function fetchTransacoes() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .is('excluido_em', null)
        .order('data_transacao', { ascending: false })
        .limit(100)

      if (error) throw error
      setTransacoes(data || [])
    } catch (err) {
      console.error('Erro ao buscar transações:', err)
      setError('Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter((transacao) => {
    const matchSearch =
      transacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transacao.categoria?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchTipo = tipoFilter === 'todos' || transacao.tipo === tipoFilter
    const matchStatus = statusFilter === 'todos' || transacao.status === statusFilter

    return matchSearch && matchTipo && matchStatus
  })

  // Calcular estatísticas
  const stats = {
    receitaTotal: transacoes
      .filter((t) => t.tipo === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + (parseFloat(t.valor as string) || 0), 0),
    despesaTotal: transacoes
      .filter((t) => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + (parseFloat(t.valor as string) || 0), 0),
    aPagar: transacoes
      .filter((t) => t.tipo === 'despesa' && t.status === 'pendente')
      .reduce((sum, t) => sum + (parseFloat(t.valor as string) || 0), 0),
    aReceber: transacoes
      .filter((t) => t.tipo === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + (parseFloat(t.valor as string) || 0), 0),
  }

  const saldoLiquido = stats.receitaTotal - stats.despesaTotal

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-600">Pago</Badge>
      case 'pendente':
        return <Badge className="bg-orange-600">Pendente</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      case 'vencido':
        return <Badge className="bg-red-600">Vencido</Badge>
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 bg-destructive/10">
          <p className="text-destructive font-semibold">{error}</p>
        </Card>
      </div>
    )
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
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <FileText className="h-4 w-4" />
            Relatórios
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <DollarSign className="h-4 w-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Receita Total */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Receita Total
              </p>
              <h3 className="text-2xl font-bold mt-1 text-green-900 dark:text-green-100">
                {formatCurrency(stats.receitaTotal)}
              </h3>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        {/* Despesa Total */}
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Despesa Total</p>
              <h3 className="text-2xl font-bold mt-1 text-red-900 dark:text-red-100">
                {formatCurrency(stats.despesaTotal)}
              </h3>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        {/* Saldo Líquido */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Saldo Líquido
              </p>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  saldoLiquido >= 0
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}
              >
                {formatCurrency(saldoLiquido)}
              </h3>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        {/* A Pagar */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">A Pagar</p>
              <h3 className="text-2xl font-bold mt-1 text-orange-600">
                {formatCurrency(stats.aPagar)}
              </h3>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        {/* A Receber */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">A Receber</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {formatCurrency(stats.aReceber)}
              </h3>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tipo Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
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
          >
            <option value="todos">Todos Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
            <option value="vencido">Vencido</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
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
                          {transacao.data_transacao
                            ? new Date(transacao.data_transacao).toLocaleDateString('pt-BR')
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
                      <Badge
                        variant={transacao.tipo === 'receita' ? 'default' : 'secondary'}
                        className={
                          transacao.tipo === 'receita'
                            ? 'bg-green-600'
                            : 'bg-red-600 text-white'
                        }
                      >
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
                        {formatCurrency(parseFloat(transacao.valor as string) || 0)}
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
  )
}

