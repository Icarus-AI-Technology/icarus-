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

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Truck,
  UserCheck,
  ShoppingBag,
  Calendar,
  MapPin,
} from 'lucide-react';
import type { PedidoCompra, AprovacaoPedido } from '../../types/compras';

export const PedidosCompra: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterDepartamento, setFilterDepartamento] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoCompra | null>(null);

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
    const matchDepartamento = filterDepartamento === 'todos' || pedido.departamento === filterDepartamento;

    return matchSearch && matchStatus && matchDepartamento;
  });

  // Funções
  const handleNovoPedido = () => {
    setPedidoSelecionado(null);
    setShowModal(true);
  };

  const handleEditarPedido = (pedido: PedidoCompra) => {
    setPedidoSelecionado(pedido);
    setShowModal(true);
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

  const handleAprovarPedido = (id: string) => {
    // Implementar aprovação
    console.log('Aprovar pedido:', id);
  };

  const handleReprovarPedido = (id: string) => {
    // Implementar reprovação
    console.log('Reprovar pedido:', id);
  };

  // Status Badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
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

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '0.5rem',
          background: config.bg,
          color: config.text,
          fontSize: '0.813rem',
          fontWeight: 600,
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Workflow de Aprovação
  const renderWorkflowAprovacao = (pedido: PedidoCompra) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
        }}
      >
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
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: statusColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  boxShadow: 'var(--orx-shadow-light-1)',
                }}
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
                  style={{
                    width: '24px',
                    height: '2px',
                    background:
                      aprovacao.status === 'aprovado' ? 'var(--orx-success-dark)' : 'var(--orx-text-muted)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '0.813rem',
              fontWeight: 'var(--orx-font-bold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Pedidos de Compra
          </h1>
          <p
            style={{
              fontSize: '0.813rem',
              color: 'var(--orx-text-secondary)',
            }}
          >
            Gestão de pedidos com aprovação multi-nível e rastreamento de recebimento
          </p>
        </div>
        <button
          onClick={handleNovoPedido}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            background: 'var(--orx-primary)',
            color: 'white',
            fontSize: '0.813rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              'var(--orx-shadow-light-1), var(--orx-shadow-light-2), 0 8px 16px rgba(99, 102, 241, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)';
          }}
        >
          <Plus size={20} />
          Novo Pedido
        </button>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
        }}
      >
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              style={{
                padding: '1.5rem',
                borderRadius: '1.25rem',
                background: 'var(--orx-bg-light)',
                boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '0.75rem',
                    background: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--orx-shadow-light-1)',
                  }}
                >
                  <Icon size={24} style={{ color: 'white' }} />
                </div>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.813rem',
                    fontWeight: 600,
                    color: kpi.trendUp ? 'var(--orx-success-dark)' : 'var(--orx-error-dark)',
                  }}
                >
                  {kpi.trendUp ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
                  {kpi.trend}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-bold)',
                    color: 'var(--orx-text-primary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {kpi.value}
                </div>
                <div
                  style={{
                    fontSize: '0.813rem',
                    color: 'var(--orx-text-secondary)',
                  }}
                >
                  {kpi.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '1.25rem',
          background: 'var(--orx-bg-light)',
          boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Busca */}
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--orx-text-secondary)',
              }}
            />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                background: 'var(--orx-bg-light)',
                color: 'var(--orx-text-primary)',
                fontSize: '0.813rem',
                boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.05), inset -2px -2px 4px rgba(255, 255, 255, 0.05)',
              }}
            />
          </div>

          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              background: 'var(--orx-bg-light)',
              color: 'var(--orx-text-primary)',
              fontSize: '0.813rem',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.05), inset -2px -2px 4px rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
            }}
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
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              background: 'var(--orx-bg-light)',
              color: 'var(--orx-text-primary)',
              fontSize: '0.813rem',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.05), inset -2px -2px 4px rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
            }}
          >
            <option value="todos">Todos os Departamentos</option>
            <option value="Cirurgia Ortopédica">Cirurgia Ortopédica</option>
            <option value="Cardiologia">Cardiologia</option>
            <option value="Neurologia">Neurologia</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div
        style={{
          borderRadius: '1.25rem',
          background: 'var(--orx-bg-light)',
          boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Nº Pedido
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Fornecedor
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Solicitante
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Valor Total
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Aprovação
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '3rem',
                      textAlign: 'center',
                      color: 'var(--orx-text-secondary)',
                    }}
                  >
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr
                    key={pedido.id}
                    style={{
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color: 'var(--orx-primary)',
                      }}
                    >
                      {pedido.numero_pedido}
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-primary)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{pedido.fornecedor_nome}</div>
                        <div style={{ fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>
                          {pedido.fornecedor_cnpj}
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-primary)',
                      }}
                    >
                      <div>
                        <div>{pedido.solicitante_nome}</div>
                        <div style={{ fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>
                          {pedido.departamento}
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color: 'var(--orx-text-primary)',
                      }}
                    >
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(pedido.total)}
                    </td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(pedido.status)}</td>
                    <td style={{ padding: '1rem' }}>{renderWorkflowAprovacao(pedido)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <button
                          onClick={() => handleVisualizarPedido(pedido)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            background: 'var(--orx-bg-light)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            boxShadow: 'var(--orx-shadow-light-1)',
                            transition: 'all 0.2s ease',
                          }}
                          title="Visualizar"
                        >
                          <Eye size={18} style={{ color: 'var(--orx-info-dark)' }} />
                        </button>
                        {pedido.status === 'rascunho' && (
                          <button
                            onClick={() => handleEditarPedido(pedido)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              background: 'var(--orx-bg-light)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              cursor: 'pointer',
                              boxShadow: 'var(--orx-shadow-light-1)',
                              transition: 'all 0.2s ease',
                            }}
                            title="Editar"
                          >
                            <Edit size={18} style={{ color: 'var(--orx-primary)' }} />
                          </button>
                        )}
                        {pedido.status === 'aprovado' && (
                          <button
                            onClick={() => handleEnviarPedido(pedido.id!)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              background: 'var(--orx-success-light)',
                              border: '1px solid var(--orx-success-dark)',
                              cursor: 'pointer',
                              boxShadow: 'var(--orx-shadow-light-1)',
                              transition: 'all 0.2s ease',
                            }}
                            title="Enviar para Fornecedor"
                          >
                            <Send size={18} style={{ color: 'var(--orx-success-dark)' }} />
                          </button>
                        )}
                        {(pedido.status === 'rascunho' || pedido.status === 'em_aprovacao') && (
                          <button
                            onClick={() => handleExcluirPedido(pedido.id!)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              background: 'var(--orx-bg-light)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              cursor: 'pointer',
                              boxShadow: 'var(--orx-shadow-light-1)',
                              transition: 'all 0.2s ease',
                            }}
                            title="Excluir"
                          >
                            <Trash2 size={18} style={{ color: 'var(--orx-error-dark)' }} />
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

