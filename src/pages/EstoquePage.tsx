// src/pages/EstoquePage.tsx
import { useState, useEffect } from 'react';
import { useEstoque } from '../hooks/useEstoque';
import { Card } from '../components/oraclusx-ds/Card';
import { Badge } from '../components/oraclusx-ds/Badge';
import { Package, Plus, Filter, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/oraclusx-ds/Button';
import { CardKpiNeumo } from '../components/oraclusx-ds/CardKpiNeumo';
import { NeumoInput } from '../components/oraclusx-ds/NeumoInput';

export default function EstoquePage() {
  const empresaId = 'temp-empresa-id'; // TODO: Pegar do context de autenticação
  const { estoques, loading, error, refreshEstoque } = useEstoque(empresaId);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    refreshEstoque();
  }, [refreshEstoque]);

  // Filtrar estoques
  const estoquesFiltrados = estoques
    ? estoques.filter((item) => {
        const matchSearch =
          item.produto_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.localizacao_id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = statusFilter === 'todos' || item.status === statusFilter;

        return matchSearch && matchStatus;
      })
    : [];

  // Calcular estatísticas
  const stats = {
    total: estoques?.length || 0,
    disponiveis: estoques?.filter((e) => e.status === 'disponivel').length || 0,
    reservados: estoques?.filter((e) => e.status === 'reservado').length || 0,
    baixo:
      estoques?.filter((e) => {
        const qtd = e.quantidade_disponivel || 0;
        // @ts-expect-error - quantidade_minima pode não estar no tipo gerado mas existir no banco
        const min = e.quantidade_minima || 0;
        return qtd < min && e.status === 'disponivel';
      }).length || 0,
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
          <h1 className="text-3xl font-bold text-foreground">Gestão de Estoque</h1>
          <p className="text-muted-foreground mt-1">Gerenciar inventário e movimentações</p>
        </div>
        <Button variant="primary" leftIcon={Plus}>
          Adicionar Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardKpiNeumo
          icon={Package}
          label="Total Itens"
          value={stats.total}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />

        <CardKpiNeumo
          icon={CheckCircle}
          label="Disponíveis"
          value={stats.disponiveis}
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-500/20"
        />

        <CardKpiNeumo
          icon={XCircle}
          label="Reservados"
          value={stats.reservados}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-500/20"
        />

        <CardKpiNeumo
          icon={AlertTriangle}
          label="Estoque Baixo"
          value={stats.baixo}
          iconColor="text-orange-600"
          iconBg="bg-orange-100 dark:bg-orange-500/20"
        />
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <NeumoInput
              placeholder="Buscar por produto ou localização..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label="Filtro de Status"
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
          <Button variant="neumo" leftIcon={Download}>
            Exportar
          </Button>
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
              {!estoquesFiltrados || estoquesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'todos'
                      ? 'Nenhum item encontrado com os filtros aplicados'
                      : 'Nenhum item em estoque cadastrado'}
                  </td>
                </tr>
              ) : (
                estoquesFiltrados.map((item) => {
                  const qtdDisponivel = item.quantidade_disponivel || 0;
                  const qtdMinima = 0;
                  const isEstoqueBaixo = qtdDisponivel < qtdMinima;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border hover:bg-accent/50 transition-colors"
                    >
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
                              ? 'success'
                              : item.status === 'reservado'
                                ? 'info'
                                : 'default'
                          }
                        >
                          {item.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-primary hover:underline text-sm">Editar</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
