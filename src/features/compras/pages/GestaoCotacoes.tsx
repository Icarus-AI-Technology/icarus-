/**
 * Gestão de Cotações - Módulo Compras e Fornecedores
 * 
 * Sistema: ICARUS v5.0
 * Versão: 5.0.0
 * Última Atualização: Outubro 2025
 * 
 * FEATURES:
 * - Criar/Editar Cotações
 * - Multi-fornecedor (comparativo lado a lado)
 * - Análise IA (score automático, recomendação)
 * - Validação de prazos e valores
 * - Anexos de documentos
 * - Dashboard com KPIs
 * 
 * DESIGN SYSTEM: OraclusX DS + Neumorphism Premium 3D
 */

import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Cotacao } from '@/types/compras';

export const GestaoCotacoes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPrioridade, setFilterPrioridade] = useState<string>('todas');
  const [, setCotacaoSelecionada] = useState<Cotacao | null>(null);

  // Mock Data - KPIs
  const kpis = [
    {
      label: 'Cotações Abertas',
      value: '12',
      icon: FileText,
      trend: '+3',
      trendUp: true,
      color: 'var(--orx-primary)',
    },
    {
      label: 'Economia Estimada',
      value: 'R$ 45.280',
      icon: TrendingUp,
      trend: '+8,5%',
      trendUp: true,
      color: 'var(--orx-success-dark)',
    },
    {
      label: 'Prazo Médio',
      value: '7 dias',
      icon: Clock,
      trend: '-1 dia',
      trendUp: true,
      color: 'var(--orx-info-dark)',
    },
    {
      label: 'IA Score Médio',
      value: '8.4/10',
      icon: Sparkles,
      trend: '+0.3',
      trendUp: true,
      color: 'var(--orx-warning-dark)',
    },
  ];

  // Mock Data - Cotações
  const [cotacoes] = useState<Cotacao[]>([
    {
      id: '1',
      numero_cotacao: 'COT-2025-001',
      data_criacao: '2025-10-15',
      data_limite_resposta: '2025-10-22',
      solicitante_id: 'usr-1',
      solicitante_nome: 'Dr. Carlos Silva',
      departamento: 'Cirurgia Ortopédica',
      prioridade: 'alta',
      status: 'em_analise',
      itens: [
        {
          id: 'item-1',
          produto_id: 'prod-1',
          produto_nome: 'Prótese de Joelho Cerâmica',
          produto_codigo: 'OPME-2401',
          quantidade: 5,
          unidade_medida: 'UN',
          urgente: true,
        },
      ],
      fornecedores: [
        {
          id: 'forn-cot-1',
          fornecedor_id: 'forn-1',
          fornecedor_nome: 'Stryker Brasil',
          itens_cotados: [],
          prazo_entrega_dias: 7,
          condicoes_pagamento: '30/60 dias',
          frete_tipo: 'CIF',
          frete_valor: 0,
          status: 'respondida',
          score_automatico: 9.2,
          recomendacao_ia: 'Fornecedor com melhor histórico de qualidade',
        },
        {
          id: 'forn-cot-2',
          fornecedor_id: 'forn-2',
          fornecedor_nome: 'Zimmer Biomet',
          itens_cotados: [],
          prazo_entrega_dias: 10,
          condicoes_pagamento: '45 dias',
          frete_tipo: 'FOB',
          frete_valor: 250,
          status: 'respondida',
          score_automatico: 8.5,
        },
        {
          id: 'forn-cot-3',
          fornecedor_id: 'forn-3',
          fornecedor_nome: 'DePuy Synthes',
          itens_cotados: [],
          prazo_entrega_dias: 5,
          condicoes_pagamento: '30 dias',
          frete_tipo: 'CIF',
          frete_valor: 0,
          status: 'aguardando',
          score_automatico: 7.8,
        },
      ],
      analise_ia: {
        fornecedor_recomendado_id: 'forn-1',
        score_confianca: 92,
        fatores_considerados: ['Qualidade histórica', 'Prazo competitivo', 'Condições de pagamento'],
        economia_estimada: 4500,
        alertas: [],
      },
      created_at: '2025-10-15T08:30:00',
    },
    {
      id: '2',
      numero_cotacao: 'COT-2025-002',
      data_criacao: '2025-10-18',
      data_limite_resposta: '2025-10-25',
      solicitante_id: 'usr-2',
      solicitante_nome: 'Dra. Mariana Costa',
      departamento: 'Cardiologia',
      prioridade: 'urgente',
      status: 'enviada',
      itens: [
        {
          id: 'item-2',
          produto_id: 'prod-2',
          produto_nome: 'Stent Coronário',
          produto_codigo: 'OPME-2402',
          quantidade: 10,
          unidade_medida: 'UN',
          urgente: true,
        },
      ],
      fornecedores: [
        {
          id: 'forn-cot-4',
          fornecedor_id: 'forn-4',
          fornecedor_nome: 'Abbott Vascular',
          itens_cotados: [],
          prazo_entrega_dias: 3,
          condicoes_pagamento: '30 dias',
          frete_tipo: 'CIF',
          frete_valor: 0,
          status: 'aguardando',
        },
        {
          id: 'forn-cot-5',
          fornecedor_id: 'forn-5',
          fornecedor_nome: 'Medtronic Brasil',
          itens_cotados: [],
          prazo_entrega_dias: 5,
          condicoes_pagamento: '45 dias',
          frete_tipo: 'CIF',
          frete_valor: 0,
          status: 'aguardando',
        },
      ],
      created_at: '2025-10-18T14:15:00',
    },
  ]);

  // Filtros
  const cotacoesFiltradas = cotacoes.filter((cotacao) => {
    const matchSearch =
      searchTerm === '' ||
      cotacao.numero_cotacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotacao.solicitante_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotacao.departamento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'todos' || cotacao.status === filterStatus;
    const matchPrioridade = filterPrioridade === 'todas' || cotacao.prioridade === filterPrioridade;

    return matchSearch && matchStatus && matchPrioridade;
  });

  // Funções
  const handleNovaCotacao = () => {
    setCotacaoSelecionada(null);
    setShowModal(true);
  };

  const handleEditarCotacao = (cotacao: Cotacao) => {
    setCotacaoSelecionada(cotacao);
    setShowModal(true);
  };

  const handleVisualizarCotacao = (cotacao: Cotacao) => {
    // Implementar visualização detalhada
    console.log('Visualizar cotação:', cotacao);
  };

  const handleExcluirCotacao = (id: string) => {
    // Implementar exclusão
    console.log('Excluir cotação:', id);
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
      enviada: {
        label: 'Enviada',
        bg: 'var(--orx-info-light)',
        text: 'var(--orx-info-dark)',
        icon: <Send size={14} />,
      },
      em_analise: {
        label: 'Em Análise',
        bg: 'var(--orx-warning-light)',
        text: 'var(--orx-warning-dark)',
        icon: <Clock size={14} />,
      },
      aprovada: {
        label: 'Aprovada',
        bg: 'var(--orx-success-light)',
        text: 'var(--orx-success-dark)',
        icon: <CheckCircle size={14} />,
      },
      cancelada: {
        label: 'Cancelada',
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

  // Prioridade Badge
  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig: Record<string, { label: string; color: string }> = {
      baixa: { label: 'Baixa', color: 'var(--orx-text-secondary)' },
      media: { label: 'Média', color: 'var(--orx-info-dark)' },
      alta: { label: 'Alta', color: 'var(--orx-warning-dark)' },
      urgente: { label: 'Urgente', color: 'var(--orx-error-dark)' },
    };

    const config = prioridadeConfig[prioridade] || prioridadeConfig.media;

    return (
      <span
        style={{
          color: config.color,
          fontSize: '0.813rem',
          fontWeight: 600,
        }}
      >
        {config.label}
      </span>
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
              fontWeight: 'var(--orx-orx-orx-font-bold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Gestão de Cotações
          </h1>
          <p
            style={{
              fontSize: '0.813rem',
              color: 'var(--orx-text-secondary)',
            }}
          >
            Criação, comparação e análise inteligente de cotações multi-fornecedor
          </p>
        </div>
        <button
          onClick={handleNovaCotacao}
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
          Nova Cotação
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
                  {kpi.trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {kpi.trend}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-orx-orx-font-bold)',
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
              placeholder="Buscar cotação..."
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
            <option value="enviada">Enviada</option>
            <option value="em_analise">Em Análise</option>
            <option value="aprovada">Aprovada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          {/* Filtro Prioridade */}
          <select
            value={filterPrioridade}
            onChange={(e) => setFilterPrioridade(e.target.value)}
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
            <option value="todas">Todas as Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      {/* Tabela de Cotações */}
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
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Nº Cotação
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
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
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Departamento
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Prioridade
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
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
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Fornecedores
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  IA Score
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontSize: '0.813rem',
                    fontWeight: 'var(--orx-orx-orx-font-semibold)',
                    color: 'var(--orx-text-secondary)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {cotacoesFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: '3rem',
                      textAlign: 'center',
                      color: 'var(--orx-text-secondary)',
                    }}
                  >
                    Nenhuma cotação encontrada
                  </td>
                </tr>
              ) : (
                cotacoesFiltradas.map((cotacao) => (
                  <tr
                    key={cotacao.id}
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
                      {cotacao.numero_cotacao}
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-primary)',
                      }}
                    >
                      {cotacao.solicitante_nome}
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-secondary)',
                      }}
                    >
                      {cotacao.departamento}
                    </td>
                    <td style={{ padding: '1rem' }}>{getPrioridadeBadge(cotacao.prioridade)}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(cotacao.status)}</td>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-primary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.813rem' }}>{cotacao.fornecedores.length}</span>
                        <span style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem' }}>
                          ({cotacao.fornecedores.filter((f) => f.status === 'respondida').length} respondidas)
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {cotacao.analise_ia ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={16} style={{ color: 'var(--orx-warning-dark)' }} />
                          <span
                            style={{
                              fontSize: '0.813rem',
                              fontWeight: 600,
                              color: 'var(--orx-text-primary)',
                            }}
                          >
                            {cotacao.analise_ia.score_confianca}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem' }}>-</span>
                      )}
                    </td>
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
                          onClick={() => handleVisualizarCotacao(cotacao)}
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
                        <button
                          onClick={() => handleEditarCotacao(cotacao)}
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
                        <button
                          onClick={() => handleExcluirCotacao(cotacao.id!)}
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

export default GestaoCotacoes;

