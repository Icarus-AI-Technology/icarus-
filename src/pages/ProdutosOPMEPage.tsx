// src/pages/ProdutosOPMEPage.tsx
import { useState } from 'react'
import { useProdutos } from '../hooks/useProdutos'
import { Card } from '../components/oraclusx-ds/card'
import { Badge } from '../components/oraclusx-ds/badge'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react'

export function ProdutosOPMEPage() {
  const empresaId = 'temp-empresa-id' // TODO: Pegar do context de autenticação
  const { produtos, loading, error, fetchProdutosBaixoEstoque } = useProdutos(empresaId)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [showBaixoEstoque, setShowBaixoEstoque] = useState(false)

  // Filtrar produtos
  const produtosFiltrados = produtos.filter((produto) => {
    const matchSearch =
      produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.registro_anvisa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && produto.ativo) ||
      (statusFilter === 'inativo' && !produto.ativo)

    return matchSearch && matchStatus
  })

  // Estatísticas
  const stats = {
    total: produtos.length,
    ativos: produtos.filter((p) => p.ativo).length,
    inativos: produtos.filter((p) => !p.ativo).length,
    semAnvisa: produtos.filter((p) => !p.registro_anvisa).length,
  }

  const handleShowBaixoEstoque = async () => {
    setShowBaixoEstoque(true)
    await fetchProdutosBaixoEstoque()
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
          <h1 className="text-3xl font-bold text-foreground">Produtos OPME</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciar catálogo de Órteses, Próteses e Materiais Especiais
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShowBaixoEstoque}
            className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Baixo Estoque
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Produtos</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.ativos}</h3>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inativos</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-600">{stats.inativos}</h3>
            </div>
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
        </Card>

        <Card className="p-4 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sem Registro ANVISA</p>
              <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.semAnvisa}</h3>
            </div>
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          {stats.semAnvisa > 0 && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Compliance Necessário
            </Badge>
          )}
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
              placeholder="Buscar por nome, registro ANVISA ou código de barras..."
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
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativo' | 'inativo')}
            >
              <option value="todos">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </Card>

      {/* Produtos Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">Código</th>
                <th className="text-left p-3 font-semibold">Nome</th>
                <th className="text-left p-3 font-semibold">Registro ANVISA</th>
                <th className="text-left p-3 font-semibold">Fabricante</th>
                <th className="text-center p-3 font-semibold">Rastreável</th>
                <th className="text-center p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'todos'
                      ? 'Nenhum produto encontrado com os filtros aplicados'
                      : 'Nenhum produto OPME cadastrado'}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr
                    key={produto.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-mono text-sm text-muted-foreground">
                        {produto.codigo_barras || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{produto.nome}</span>
                      {produto.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {produto.descricao.substring(0, 50)}
                          {produto.descricao.length > 50 ? '...' : ''}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      {produto.registro_anvisa ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {produto.registro_anvisa}
                          </Badge>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Não registrado</span>
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {produto.fabricante || 'N/A'}
                    </td>
                    <td className="p-3 text-center">
                      {produto.requer_rastreabilidade ? (
                        <Badge variant="default">Sim</Badge>
                      ) : (
                        <Badge variant="secondary">Não</Badge>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-primary hover:underline text-sm">Editar</button>
                        <button className="text-muted-foreground hover:underline text-sm">
                          Histórico
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

