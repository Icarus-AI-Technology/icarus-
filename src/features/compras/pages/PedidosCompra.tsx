/**
 * Pedidos de Compra - Módulo Compras e Fornecedores
 *
 * Sistema: ICARUS v5.0
 * Versão: 5.0.0
 * Última Atualização: Outubro 2025
 *
 * FEATURES:
 * - Criar/Editar Pedidos de Compra
 * - Geração automática a partir de cotações
 * - Workflow de aprovação multi-nível
 * - Rastreamento de recebimento
 * - Integração com fornecedores
 * - Dashboard com KPIs
 *
 * DESIGN SYSTEM: OraclusX DS + Neumorphism Premium 3D
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  UserCheck,
} from 'lucide-react';
import type { PedidoCompra } from '@/types/compras';

export const PedidosCompra: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterDepartamento, setFilterDepartamento] = useState<string>('todos');

  // Mock Data - KPIs
  const kpis = [
    {
      label: 'Pedidos Pendentes',
      value: '8',
      icon: Clock,
      trend: '-2',
      trendUp: false,
      color: 'var(--orx-warning-dark)',
    },
    {
      label: 'Em Aprovação',
      value: '5',
      icon: UserCheck,
      trend: '+1',
      trendUp: false,
      color: 'var(--orx-info-dark)',
    },
    {
      label: 'Valor Total (Mês)',
      value: 'R$ 284.500',
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'var(--orx-success-dark)',
    },
    {
      label: 'Recebimentos Pendentes',
      value: '12',
      icon: Package,
      trend: '+3',
      trendUp: false,
      color: 'var(--orx-primary)',
    },
  ];

  // Mock Data - Pedidos
  const [pedidos] = useState<PedidoCompra[]>([
    {
      id: '1',
      numero_pedido: 'PC-2025-001',
      data_emissao: '2025-10-18',
      data_entrega_prevista: '2025-10-25',
      cotacao_id: 'COT-2025-001',
      solicitante_id: 'usr-1',
      solicitante_nome: 'Dr. Carlos Silva',
      departamento: 'Cirurgia Ortopédica',
      centro_custo: 'CC-001',
      fornecedor_id: 'forn-1',
      fornecedor_nome: 'Stryker Brasil',
      fornecedor_cnpj: '12.345.678/0001-90',
      itens: [
        {
          id: 'item-1',
          produto_id: 'prod-1',
          produto_nome: 'Prótese de Joelho Cerâmica',
          produto_codigo: 'OPME-2401',
          quantidade: 5,
          unidade_medida: 'UN',
          preco_unitario: 8500,
          preco_total: 42500,
          quantidade_recebida: 0,
          status_recebimento: 'pendente',
        },
      ],
      subtotal: 42500,
      frete: 0,
      impostos: 7650,
      desconto: 0,
      total: 50150,
      condicoes_pagamento: '30/60 dias',
      prazo_entrega_dias: 7,
      local_entrega: {
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        responsavel_recebimento: 'João Santos',
        telefone: '(11) 98765-4321',
      },
      status: 'em_aprovacao',
      aprovacoes: [
        {
          nivel: 1,
          aprovador_id: 'usr-10',
          aprovador_nome: 'Dra. Maria Oliveira',
          aprovador_cargo: 'Coordenadora Cirurgia',
          status: 'aprovado',
          data_acao: '2025-10-18T10:30:00',
          observacoes: 'Aprovado conforme necessidade cirúrgica urgente',
        },
        {
          nivel: 2,
          aprovador_id: 'usr-11',
          aprovador_nome: 'Dr. Ricardo Ferreira',
          aprovador_cargo: 'Diretor Médico',
          status: 'pendente',
        },
        {
          nivel: 3,
          aprovador_id: 'usr-12',
          aprovador_nome: 'Sr. José Almeida',
          aprovador_cargo: 'Diretor Financeiro',
          status: 'pendente',
        },
      ],
      nivel_aprovacao_atual: 2,
      created_at: '2025-10-18T09:00:00',
    },
    {
      id: '2',
      numero_pedido: 'PC-2025-002',
      data_emissao: '2025-10-19',
      data_entrega_prevista: '2025-10-22',
      solicitante_id: 'usr-2',
      solicitante_nome: 'Dra. Mariana Costa',
      departamento: 'Cardiologia',
      centro_custo: 'CC-002',
      fornecedor_id: 'forn-4',
      fornecedor_nome: 'Abbott Vascular',
      fornecedor_cnpj: '98.765.432/0001-10',
      itens: [
        {
          id: 'item-2',
          produto_id: 'prod-2',
          produto_nome: 'Stent Coronário',
          produto_codigo: 'OPME-2402',
          quantidade: 10,
          unidade_medida: 'UN',
          preco_unitario: 4200,
          preco_total: 42000,
          quantidade_recebida: 0,
          status_recebimento: 'pendente',
        },
      ],
      subtotal: 42000,
      frete: 0,
      impostos: 7560,
      desconto: 500,
      total: 49060,
      condicoes_pagamento: '30 dias',
      prazo_entrega_dias: 3,
      local_entrega: {
        endereco: 'Av. Paulista, 1000',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        responsavel_recebimento: 'Ana Paula Silva',
        telefone: '(11) 91234-5678',
      },
      status: 'aprovado',
      aprovacoes: [
        {
          nivel: 1,
          aprovador_id: 'usr-13',
          aprovador_nome: 'Dr. Paulo Santos',
          aprovador_cargo: 'Coordenador Cardiologia',
          status: 'aprovado',
          data_acao: '2025-10-19T11:00:00',
        },
        {
          nivel: 2,
          aprovador_id: 'usr-11',
          aprovador_nome: 'Dr. Ricardo Ferreira',
          aprovador_cargo: 'Diretor Médico',
          status: 'aprovado',
          data_acao: '2025-10-19T14:30:00',
        },
        {
          nivel: 3,
          aprovador_id: 'usr-12',
          aprovador_nome: 'Sr. José Almeida',
          aprovador_cargo: 'Diretor Financeiro',
          status: 'aprovado',
          data_acao: '2025-10-19T16:00:00',
        },
      ],
      nivel_aprovacao_atual: 3,
      created_at: '2025-10-19T09:30:00',
    },
    {
      id: '3',
      numero_pedido: 'PC-2025-003',
      data_emissao: '2025-10-20',
      data_entrega_prevista: '2025-10-27',
      solicitante_id: 'usr-3',
      solicitante_nome: 'Dr. Roberto Lima',
      departamento: 'Neurologia',
      centro_custo: 'CC-003',
      fornecedor_id: 'forn-6',
      fornecedor_nome: 'Medtronic Neurovascular',
      fornecedor_cnpj: '11.222.333/0001-44',
      itens: [
        {
          id: 'item-3',
          produto_id: 'prod-3',
          produto_nome: 'Clip para Aneurisma',
          produto_codigo: 'OPME-2403',
          quantidade: 3,
          unidade_medida: 'UN',
          preco_unitario: 12000,
          preco_total: 36000,
          quantidade_recebida: 0,
          status_recebimento: 'pendente',
        },
      ],
      subtotal: 36000,
      frete: 250,
      impostos: 6525,
      desconto: 0,
      total: 42775,
      condicoes_pagamento: '45 dias',
      prazo_entrega_dias: 7,
      local_entrega: {
        endereco: 'Rua Augusta, 500',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01305-000',
        responsavel_recebimento: 'Carlos Mendes',
        telefone: '(11) 99876-5432',
      },
      status: 'enviado',
      aprovacoes: [
        {
          nivel: 1,
          aprovador_id: 'usr-14',
          aprovador_nome: 'Dra. Fernanda Costa',
          aprovador_cargo: 'Coordenadora Neurologia',
          status: 'aprovado',
          data_acao: '2025-10-20T10:00:00',
        },
        {
          nivel: 2,
          aprovador_id: 'usr-11',
          aprovador_nome: 'Dr. Ricardo Ferreira',
          aprovador_cargo: 'Diretor Médico',
          status: 'aprovado',
          data_acao: '2025-10-20T11:30:00',
        },
        {
          nivel: 3,
          aprovador_id: 'usr-12',
          aprovador_nome: 'Sr. José Almeida',
          aprovador_cargo: 'Diretor Financeiro',
          status: 'aprovado',
          data_acao: '2025-10-20T13:00:00',
        },
      ],
      nivel_aprovacao_atual: 3,
      created_at: '2025-10-20T09:00:00',
    },
  ]);

  // Filtros
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchSearch =
      searchTerm === '' ||
      pedido.numero_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.solicitante_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.fornecedor_nome?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'todos' || pedido.status === filterStatus;
    const matchDepartamento =
      filterDepartamento === 'todos' || pedido.departamento === filterDepartamento;

    return matchSearch && matchStatus && matchDepartamento;
  });

  // Funções
  const handleNovoPedido = () => {
    console.log('Novo pedido');
  };

  const handleEditarPedido = (pedido: PedidoCompra) => {
    console.log('Editar pedido:', pedido);
  };

  const handleVisualizarPedido = (pedido: PedidoCompra) => {
    // Implementar visualização detalhada
    console.log('Visualizar pedido:', pedido);
  };

  const handleExcluirPedido = (id: string) => {
    // Implementar exclusão
    console.log('Excluir pedido:', id);
  };

  const handleEnviarPedido = (id: string) => {
    // Implementar envio para fornecedor
    console.log('Enviar pedido:', id);
  };

  // Status Badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; bg: string; text: string; icon: React.ReactNode }
    > = {
      rascunho: {
        label: 'Rascunho',
        bg: 'var(--orx-bg-light)',
        text: 'var(--orx-text-secondary)',
        icon: <Edit size={14} />,
      },
      em_aprovacao: {
        label: 'Em Aprovação',
        bg: 'var(--orx-warning-light)',
        text: 'var(--orx-warning-dark)',
        icon: <Clock size={14} />,
      },
      aprovado: {
        label: 'Aprovado',
        bg: 'var(--orx-success-light)',
        text: 'var(--orx-success-dark)',
        icon: <CheckCircle size={14} />,
      },
      enviado: {
        label: 'Enviado',
        bg: 'var(--orx-info-light)',
        text: 'var(--orx-info-dark)',
        icon: <Send size={14} />,
      },
      recebido_parcial: {
        label: 'Recebido Parcial',
        bg: 'var(--orx-warning-light)',
        text: 'var(--orx-warning-dark)',
        icon: <Package size={14} />,
      },
      recebido_total: {
        label: 'Recebido Total',
        bg: 'var(--orx-success-light)',
        text: 'var(--orx-success-dark)',
        icon: <CheckCircle size={14} />,
      },
      cancelado: {
        label: 'Cancelado',
        bg: 'var(--orx-error-light)',
        text: 'var(--orx-error-dark)',
        icon: <XCircle size={14} />,
      },
    };

    const config = statusConfig[status] || statusConfig.rascunho;
    const bgClass: Record<string, string> = {
      'var(--orx-bg-light)': 'bg-[var(--orx-bg-light)]',
      'var(--orx-warning-light)': 'bg-[var(--orx-warning-light)]',
      'var(--orx-success-light)': 'bg-[var(--orx-success-light)]',
      'var(--orx-info-light)': 'bg-[var(--orx-info-light)]',
      'var(--orx-error-light)': 'bg-[var(--orx-error-light)]',
    };
    const textClass: Record<string, string> = {
      'var(--orx-text-secondary)': 'text-[var(--orx-text-secondary)]',
      'var(--orx-warning-dark)': 'text-[var(--orx-warning-dark)]',
      'var(--orx-success-dark)': 'text-[var(--orx-success-dark)]',
      'var(--orx-info-dark)': 'text-[var(--orx-info-dark)]',
      'var(--orx-error-dark)': 'text-[var(--orx-error-dark)]',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.813rem] orx-orx-font-semibold ${bgClass[config.bg]} ${textClass[config.text]}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Workflow de Aprovação
  const renderWorkflowAprovacao = (pedido: PedidoCompra) => {
    return (
      <div className="flex items-center gap-2 mt-2">
        {pedido.aprovacoes.map((aprovacao, index) => {
          const isAtual = index + 1 === pedido.nivel_aprovacao_atual;
          const statusColor =
            aprovacao.status === 'aprovado'
              ? 'var(--orx-success-dark)'
              : aprovacao.status === 'rejeitado'
                ? 'var(--orx-error-dark)'
                : isAtual
                  ? 'var(--orx-warning-dark)'
                  : 'var(--orx-text-muted)';

          return (
            <React.Fragment key={index}>
              <div
                title={`${aprovacao.aprovador_nome} (${aprovacao.aprovador_cargo})`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[0.813rem] orx-orx-font-semibold neuro-raised ${
                  statusColor === 'var(--orx-success-dark)'
                    ? 'bg-[var(--orx-success-dark)]'
                    : statusColor === 'var(--orx-error-dark)'
                      ? 'bg-[var(--orx-error-dark)]'
                      : statusColor === 'var(--orx-warning-dark)'
                        ? 'bg-[var(--orx-warning-dark)]'
                        : 'bg-[var(--orx-text-muted)]'
                }`}
              >
                {aprovacao.status === 'aprovado' ? (
                  <CheckCircle size={18} />
                ) : aprovacao.status === 'rejeitado' ? (
                  <XCircle size={18} />
                ) : (
                  aprovacao.nivel
                )}
              </div>
              {index < pedido.aprovacoes.length - 1 && (
                <div
                  className={`w-6 h-[2px] ${
                    aprovacao.status === 'aprovado'
                      ? 'bg-[var(--orx-success-dark)]'
                      : 'bg-[var(--orx-text-muted)]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[0.813rem] orx-orx-font-bold text-[var(--orx-text-primary)] mb-2">
            Pedidos de Compra
          </h1>
          <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
            Gestão de pedidos com aprovação multi-nível e rastreamento de recebimento
          </p>
        </div>
        <button
          onClick={handleNovoPedido}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--orx-primary)] text-white text-[0.813rem] orx-orx-font-semibold shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2),_0_8px_16px_rgba(99,102,241,0.3)]"
        >
          <Plus size={20} />
          Novo Pedido
        </button>
      </div>

      {/* KPIs */}
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorMap: Record<string, string> = {
            'var(--orx-warning-dark)': 'bg-[var(--orx-warning-dark)]',
            'var(--orx-info-dark)': 'bg-[var(--orx-info-dark)]',
            'var(--orx-success-dark)': 'bg-[var(--orx-success-dark)]',
            'var(--orx-primary)': 'bg-[var(--orx-primary)]',
          };
          const trendClass = kpi.trendUp
            ? 'text-[var(--orx-success-dark)]'
            : 'text-[var(--orx-error-dark)]';
          return (
            <div
              key={index}
              className="p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] border border-white/10 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-[var(--orx-shadow-light-1)] ${colorMap[kpi.color]}`}
                >
                  <Icon size={24} className="text-white" />
                </div>
                <span
                  className={`flex items-center gap-1 text-[0.813rem] orx-orx-font-semibold ${trendClass}`}
                >
                  {kpi.trendUp ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
                  {kpi.trend}
                </span>
              </div>
              <div>
                <div className="text-[0.813rem] orx-orx-font-bold text-[var(--orx-text-primary)] mb-1">
                  {kpi.value}
                </div>
                <div className="text-[0.813rem] text-[var(--orx-text-secondary)]">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] border border-white/10">
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {/* Busca */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--orx-text-secondary)]"
            />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-xl border border-black/10 bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),_inset_-2px_-2px_4px_rgba(255,255,255,0.05)]"
            />
          </div>

          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-3 px-4 rounded-xl border border-black/10 bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),_inset_-2px_-2px_4px_rgba(255,255,255,0.05)] cursor-pointer"
          >
            <option value="todos">Todos os Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="em_aprovacao">Em Aprovação</option>
            <option value="aprovado">Aprovado</option>
            <option value="enviado">Enviado</option>
            <option value="recebido_parcial">Recebido Parcial</option>
            <option value="recebido_total">Recebido Total</option>
            <option value="cancelado">Cancelado</option>
          </select>

          {/* Filtro Departamento */}
          <select
            value={filterDepartamento}
            onChange={(e) => setFilterDepartamento(e.target.value)}
            className="py-3 px-4 rounded-xl border border-black/10 bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),_inset_-2px_-2px_4px_rgba(255,255,255,0.05)] cursor-pointer"
          >
            <option value="todos">Todos os Departamentos</option>
            <option value="Cirurgia Ortopédica">Cirurgia Ortopédica</option>
            <option value="Cardiologia">Cardiologia</option>
            <option value="Neurologia">Neurologia</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="rounded-2xl bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[rgba(99,102,241,0.05)]">
                <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] border-b border-black/5">
                  Nº Pedido
                </th>
                <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] border-b border-black/5">
                  Fornecedor
                </th>
                <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] border-b border-black/5">
                  Solicitante
                </th>
                <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] border-b border-black/5">
                  Valor Total
                </th>
                <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] border-b border-black/5">
                  Status
                </th>
                <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] border-b border-black/5">
                  Aprovação
                </th>
                <th className="p-4 text-center text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] border-b border-black/5">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[var(--orx-text-secondary)]">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr
                    key={pedido.id}
                    className="border-b border-black/5 hover:bg-[rgba(99,102,241,0.03)] transition-colors"
                  >
                    <td className="p-4 text-[0.813rem] orx-orx-font-semibold text-[var(--orx-primary)]">
                      {pedido.numero_pedido}
                    </td>
                    <td className="p-4 text-[0.813rem] text-[var(--orx-text-primary)]">
                      <div>
                        <div className="orx-orx-font-semibold">{pedido.fornecedor_nome}</div>
                        <div className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                          {pedido.fornecedor_cnpj}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[0.813rem] text-[var(--orx-text-primary)]">
                      <div>
                        <div>{pedido.solicitante_nome}</div>
                        <div className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                          {pedido.departamento}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)]">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(pedido.total)}
                    </td>
                    <td className="p-4">{getStatusBadge(pedido.status)}</td>
                    <td className="p-4">{renderWorkflowAprovacao(pedido)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVisualizarPedido(pedido)}
                          className="p-2 rounded-lg bg-[var(--orx-bg-light)] border border-black/10 cursor-pointer shadow-[var(--orx-shadow-light-1)] transition"
                          title="Visualizar"
                        >
                          <Eye size={18} className="text-[var(--orx-info-dark)]" />
                        </button>
                        {pedido.status === 'rascunho' && (
                          <button
                            onClick={() => handleEditarPedido(pedido)}
                            className="p-2 rounded-lg bg-[var(--orx-bg-light)] border border-black/10 cursor-pointer shadow-[var(--orx-shadow-light-1)] transition"
                            title="Editar"
                          >
                            <Edit size={18} className="text-[var(--orx-primary)]" />
                          </button>
                        )}
                        {pedido.status === 'aprovado' && (
                          <button
                            onClick={() => handleEnviarPedido(pedido.id!)}
                            className="p-2 rounded-lg bg-[var(--orx-success-light)] border border-[var(--orx-success-dark)] cursor-pointer shadow-[var(--orx-shadow-light-1)] transition"
                            title="Enviar para Fornecedor"
                          >
                            <Send size={18} className="text-[var(--orx-success-dark)]" />
                          </button>
                        )}
                        {(pedido.status === 'rascunho' || pedido.status === 'em_aprovacao') && (
                          <button
                            onClick={() => handleExcluirPedido(pedido.id!)}
                            className="p-2 rounded-lg bg-[var(--orx-bg-light)] border border-black/10 cursor-pointer shadow-[var(--orx-shadow-light-1)] transition"
                            title="Excluir"
                          >
                            <Trash2 size={18} className="text-[var(--orx-error-dark)]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PedidosCompra;
