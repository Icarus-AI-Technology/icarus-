// src/pages/ProdutosOPMEPage.tsx
import { useState } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import { Card } from '../components/oraclusx-ds/Card';
import { Badge } from '../components/oraclusx-ds/Badge';
import { Button } from '../components/oraclusx-ds/Button';
import { Input } from '../components/oraclusx-ds/Input';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  XCircle,
  AlertTriangle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { CardKpiNeumo } from '../components/oraclusx-ds/CardKpiNeumo';

export default function ProdutosOPMEPage() {
  const empresaId = 'temp-empresa-id'; // TODO: Pegar do context de autenticação
  const { produtos, loading, error, buscarEstoqueBaixo } = useProdutos(empresaId);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  // Filtrar produtos
  const produtosFiltrados = produtos
    ? produtos.filter((produto) => {
        const matchSearch =
          produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.registro_anvisa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus =
          statusFilter === 'todos' ||
          (statusFilter === 'ativo' && produto.ativo) ||
          (statusFilter === 'inativo' && !produto.ativo);

        return matchSearch && matchStatus;
      })
    : [];

  // Estatísticas
  const stats = {
    total: produtos?.length || 0,
    ativos: produtos?.filter((p) => p.ativo).length || 0,
    inativos: produtos?.filter((p) => !p.ativo).length || 0,
    semAnvisa: produtos?.filter((p) => !p.registro_anvisa).length || 0,
  };

  // Assuming 'user' context is available or passed, and 'empresa_id' is part of it.
  // For now, using the 'empresaId' defined at the top.
  const handleShowBaixoEstoque = async () => {
    // This function was previously calling `fetchProdutosBaixoEstoque()`.
    // Now it will use `buscarEstoqueBaixo` from the hook.
    const { data, error } = await buscarEstoqueBaixo(empresaId);
    if (error) {
      console.error('Erro ao buscar produtos com baixo estoque:', error);
    } else {
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
          <p className="text-destructive font-semibold">{error.message}</p>
        </Card>
      </div>
    );
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
          <Button
            variant="neumo"
            color="warning"
            onClick={handleShowBaixoEstoque}
            leftIcon={AlertTriangle}
          >
            Baixo Estoque
          </Button>
          <Button variant="neumo" color="primary" leftIcon={Plus}>
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardKpiNeumo
          icon={Package}
          label="Total Produtos"
          value={stats.total}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />

        <CardKpiNeumo
          icon={CheckCircle2}
          label="Ativos"
          value={stats.ativos}
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-500/20"
        />

        <CardKpiNeumo
          icon={XCircle}
          label="Inativos"
          value={stats.inativos}
          iconColor="text-gray-600"
          iconBg="bg-gray-100 dark:bg-gray-500/20"
        />

        <CardKpiNeumo
          icon={FileText}
          label="Sem Registro ANVISA"
          value={stats.semAnvisa}
          iconColor="text-red-600"
          iconBg="bg-red-100 dark:bg-red-500/20"
          subtitle={stats.semAnvisa > 0 ? 'Compliance Necessário' : undefined}
        />
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Input
              variant="neumo"
              placeholder="Buscar por nome, registro ANVISA ou código de barras..."
              leftIcon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label="Filtrar por categoria"
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativo' | 'inativo')}
            >
              <option value="todos">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          {/* Export Button */}
          <Button variant="neumo" leftIcon={Download}>
            Exportar
          </Button>
        </div>
      </Card>

      {/* Produtos Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">ID</th>
                <th className="text-left p-3 font-semibold">Nome</th>
                <th className="text-left p-3 font-semibold">Registro ANVISA</th>
                <th className="text-left p-3 font-semibold">Fabricante</th>
                <th className="text-center p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!produtosFiltrados || produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
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
                        {produto.id.substring(0, 8)}
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
                          <Badge variant="default" className="font-mono text-xs">
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
                      <Badge variant={produto.ativo ? 'success' : 'default'}>
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
  );
}
