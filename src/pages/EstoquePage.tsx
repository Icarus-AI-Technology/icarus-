// src/pages/EstoquePage.tsx
import { useState, useEffect } from 'react'
import { useEstoque } from '../hooks/useEstoque'
import { Card } from '../components/oraclusx-ds/card'
import { Badge } from '../components/oraclusx-ds/badge'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export function EstoquePage() {
  const empresaId = 'temp-empresa-id' // TODO: Pegar do context de autenticação
  const { estoques, loading, error, refreshEstoque } = useEstoque(empresaId)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  useEffect(() => {
    refreshEstoque()
  }, [refreshEstoque])

  // Filtrar estoques
  const estoquesFiltrados = estoques.filter((item) => {
    const matchSearch =
      item.produto_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.localizacao_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus =
      statusFilter === 'todos' ||
      item.status === statusFilter

    return matchSearch && matchStatus
  })

  // Calcular estatísticas
  const stats = {
    total: estoques.length,
    disponiveis: estoques.filter((e) => e.status === 'disponivel').length,
    reservados: estoques.filter((e) => e.status === 'reservado').length,
    baixo: estoques.filter((e) => {
      const qtd = e.quantidade_disponivel || 0
      const min = e.quantidade_minima || 0
      return qtd < min && e.status === 'disponivel'
    }).length,
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
          <h1 className="text-3xl font-bold text-foreground">Gestão de Estoque</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciar inventário e movimentações
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Adicionar Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Itens</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.disponiveis}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reservados</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.reservados}</h3>
            </div>
            <XCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.baixo}</h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
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
              placeholder="Buscar por produto ou localização..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos Status</option>
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="consignado">Consignado</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </Card>

      {/* Estoque Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">ID</th>
                <th className="text-left p-3 font-semibold">Produto</th>
                <th className="text-left p-3 font-semibold">Localização</th>
                <th className="text-right p-3 font-semibold">Qtd. Disponível</th>
                <th className="text-right p-3 font-semibold">Qtd. Mínima</th>
                <th className="text-center p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {estoquesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'todos'
                      ? 'Nenhum item encontrado com os filtros aplicados'
                      : 'Nenhum item em estoque cadastrado'}
                  </td>
                </tr>
              ) : (
                estoquesFiltrados.map((item) => {
                  const qtdDisponivel = item.quantidade_disponivel || 0
                  const qtdMinima = item.quantidade_minima || 0
                  const isEstoqueBaixo = qtdDisponivel < qtdMinima

                  return (
                    <tr key={item.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="p-3 text-sm font-mono text-muted-foreground">
                        {item.id.substring(0, 8)}...
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{item.produto_id?.substring(0, 8)}...</span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {item.localizacao_id?.substring(0, 8) || 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-bold ${
                            isEstoqueBaixo ? 'text-orange-600' : 'text-foreground'
                          }`}
                        >
                          {qtdDisponivel}
                        </span>
                      </td>
                      <td className="p-3 text-right text-muted-foreground">{qtdMinima}</td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            item.status === 'disponivel'
                              ? 'default'
                              : item.status === 'reservado'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {item.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-primary hover:underline text-sm">Editar</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

