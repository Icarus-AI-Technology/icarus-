/**
 * Módulo: Compras & Fornecedores - INTEGRADO COM BACKEND
 * Sistema completo de gestão de compras
 * Dados reais do Supabase com Realtime Sync
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  NavigationBar,
  Button,
  Badge,
} from '@/components/oraclusx-ds';
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  Plus,
  Search,
  AlertCircle,
} from 'lucide-react';
import { usePedidos } from '@/hooks';

export const ComprasFornecedores: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Hook do backend com Realtime
  const { pedidos, loading, error, getResumoPedidos, aprovarPedido, cancelarPedido } = usePedidos();

  const [resumo, setResumo] = useState({
    totalPedidos: 0,
    valorTotal: 0,
    aguardandoAprovacao: 0,
    emAndamento: 0,
    entregues: 0,
  });

  // Atualizar resumo
  useEffect(() => {
    const fetchResumo = async () => {
      const dados = await getResumoPedidos();
      setResumo(dados);
    };
    if (!loading) {
      fetchResumo();
    }
  }, [pedidos, loading, getResumoPedidos]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={18} /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart size={18} />, badge: pedidos.length },
    {
      id: 'aprovacoes',
      label: 'Aprovações',
      icon: <CheckCircle size={18} />,
      badge: resumo.aguardandoAprovacao,
    },
    { id: 'fornecedores', label: 'Fornecedores', icon: <Users size={18} /> },
  ];

  const purchaseStats = [
    {
      title: 'Total de Pedidos',
      value: loading ? '...' : resumo.totalPedidos.toString(),
      trend: '+12.5%',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Valor Total',
      value: loading ? '...' : `R$ ${(resumo.valorTotal / 1000).toFixed(0)}k`,
      trend: '+18.3%',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Aguardando Aprovação',
      value: loading ? '...' : resumo.aguardandoAprovacao.toString(),
      trend: 'Pendentes',
      icon: Clock,
      color: 'yellow',
    },
    {
      title: 'Em Andamento',
      value: loading ? '...' : resumo.emAndamento.toString(),
      trend: 'Processando',
      icon: AlertCircle,
      color: 'purple',
    },
  ];

  const getStatusColor = (
    status: string
  ): 'warning' | 'success' | 'primary' | 'error' | 'default' => {
    const colors: Record<string, 'warning' | 'success' | 'primary' | 'error' | 'default'> = {
      rascunho: 'default',
      enviado: 'warning',
      aprovado: 'success',
      em_transito: 'primary',
      entregue: 'success',
      cancelado: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      rascunho: 'Rascunho',
      enviado: 'Enviado',
      aprovado: 'Aprovado',
      em_transito: 'Em Trânsito',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  // Filtrar pedidos
  const filteredPedidos = pedidos.filter(
    (p) =>
      p.numero_pedido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fornecedor_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pedidos aguardando aprovação
  const pedidosParaAprovar = pedidos.filter((p) => p.status === 'enviado');

  const statTokenMap: Record<string, string> = {
    blue: 'bg-[var(--accent)]/10 text-[var(--accent-foreground)]',
    green: 'bg-success/10 text-success',
    yellow: 'bg-warning/10 text-warning',
    purple: 'bg-[var(--accent)]/10 text-[var(--accent-foreground)]',
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Compras & Fornecedores
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gestão completa com Realtime Sync e aprovações ⚡
            </p>
          </div>
          <Badge variant="success" className="animate-pulse">
            🔄 Sincronizando em tempo real
          </Badge>
        </header>

        {/* Navigation */}
        <NavigationBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {purchaseStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} padding="md">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p
                              className="text-body-sm text-[var(--text-secondary)] mb-1"
                              style={{ fontWeight: 500 }}
                            >
                              {stat.title}
                            </p>
                            <h3 className="text-heading-lg font-display text-[var(--text-primary)]">
                              {stat.value}
                            </h3>
                            <p className="text-body-xs text-success mt-2">{stat.trend}</p>
                          </div>
                          <div className={`p-3 rounded-full ${statTokenMap[stat.color]}`}>
                            <Icon size={20} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Purchases */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Pedidos Recentes ({pedidos.length})</CardTitle>
                  <Button variant="primary">
                    <Plus size={18} className="mr-2" />
                    Novo Pedido
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={48} className="animate-spin text-[var(--primary)]" />
                      <p className="ml-4 text-[var(--text-secondary)]">Carregando pedidos...</p>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-12 text-error">
                      <AlertCircle size={24} className="mr-2" />
                      <p>{error}</p>
                    </div>
                  ) : pedidos.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-[var(--text-secondary)]">Nenhum pedido registrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pedidos.slice(0, 10).map((pedido) => (
                        <div
                          key={pedido.id}
                          className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover:bg-surface dark:hover:bg-card transition-colors"
                        >
                          <div>
                            <h4 className="text-[var(--text-primary)]" style={{ fontWeight: 500 }}>
                              Pedido #{pedido.numero_pedido}
                            </h4>
                            <p className="text-body-sm text-[var(--text-secondary)]">
                              Data: {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')} •
                              Fornecedor: {pedido.fornecedor_id.substring(0, 8)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-body-lg font-display text-success">
                              R${' '}
                              {pedido.valor_total.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <Badge variant={getStatusColor(pedido.status)}>
                              {getStatusLabel(pedido.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pedidos Tab */}
          {activeTab === 'pedidos' && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Todos os Pedidos ({pedidos.length})</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar pedido..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-surface dark:bg-card text-[var(--text-primary)] w-64"
                    />
                  </div>
                  <Button variant="primary">
                    <Plus size={18} className="mr-2" />
                    Novo Pedido
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPedidos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--text-secondary)]">Nenhum pedido encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-body-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left py-3 px-4">Número</th>
                          <th className="text-left py-3 px-4">Data Pedido</th>
                          <th className="text-left py-3 px-4">Fornecedor</th>
                          <th className="text-left py-3 px-4">Entrega Prevista</th>
                          <th className="text-right py-3 px-4">Valor Total</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-center py-3 px-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPedidos.map((pedido) => (
                          <tr
                            key={pedido.id}
                            className="border-b border-[var(--border)] hover:bg-surface dark:hover:bg-card transition-colors"
                          >
                            <td className="py-3 px-4 font-mono text-body-xs">
                              #{pedido.numero_pedido}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 text-[var(--text-secondary)]">
                              {pedido.fornecedor_id.substring(0, 8)}...
                            </td>
                            <td className="py-3 px-4">
                              {pedido.data_entrega_prevista
                                ? new Date(pedido.data_entrega_prevista).toLocaleDateString('pt-BR')
                                : 'N/A'}
                            </td>
                            <td
                              className="py-3 px-4 text-right text-success"
                              style={{ fontWeight: 500 }}
                            >
                              R${' '}
                              {pedido.valor_total.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={getStatusColor(pedido.status)}>
                                {getStatusLabel(pedido.status)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="default" size="sm">
                                  Ver
                                </Button>
                                {pedido.status === 'enviado' && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => aprovarPedido(pedido.id, 'Admin')}
                                  >
                                    Aprovar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Aprovações Tab */}
          {activeTab === 'aprovacoes' && (
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Aguardando Aprovação ({pedidosParaAprovar.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pedidosParaAprovar.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto mb-4 text-success opacity-30" />
                    <p className="text-[var(--text-secondary)]">
                      Nenhum pedido aguardando aprovação!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pedidosParaAprovar.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="flex items-center justify-between p-4 border-l-4 border-[var(--warning)] bg-[var(--warning)]/10 rounded-lg"
                      >
                        <div>
                          <h4 className="text-[var(--text-primary)]" style={{ fontWeight: 500 }}>
                            Pedido #{pedido.numero_pedido}
                          </h4>
                          <p className="text-body-sm text-[var(--text-secondary)]">
                            Valor: R${' '}
                            {pedido.valor_total.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}{' '}
                            • Data: {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => cancelarPedido(pedido.id)}
                          >
                            Rejeitar
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => aprovarPedido(pedido.id, 'Admin')}
                          >
                            Aprovar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fornecedores Tab */}
          {activeTab === 'fornecedores' && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users size={48} className="mx-auto mb-4 text-muted" />
                <h3
                  className="text-body-lg text-[var(--text-primary)] mb-2"
                  style={{ fontWeight: 500 }}
                >
                  Gestão de Fornecedores
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Cadastro e avaliação de fornecedores
                </p>
                <Button variant="primary">
                  <Plus size={18} className="mr-2" />
                  Novo Fornecedor
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprasFornecedores;
