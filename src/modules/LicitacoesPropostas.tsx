/**
 * LICITAÇÕES E PROPOSTAS - ICARUS v5.0
 * Gestão completa de licitações públicas e privadas
 */

import { useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
} from 'lucide-react';

interface Licitacao {
  id: string;
  numero: string;
  orgao: string;
  objeto: string;
  modalidade: string;
  valorEstimado: number;
  dataAbertura: string;
  status: 'aberta' | 'em_analise' | 'proposta_enviada' | 'vencida' | 'perdida' | 'cancelada';
  prazoEntrega: string;
}

export default function LicitacoesPropostas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todas');

  const licitacoes: Licitacao[] = [
    {
      id: '1',
      numero: 'PE 123/2025',
      orgao: 'Hospital Universitário Federal',
      objeto: 'Aquisição de Próteses Ortopédicas',
      modalidade: 'Pregão Eletrônico',
      valorEstimado: 450000,
      dataAbertura: '2025-10-25T09:00:00',
      status: 'aberta',
      prazoEntrega: '2025-10-23',
    },
    {
      id: '2',
      numero: 'CC 045/2025',
      orgao: 'Secretaria Municipal de Saúde',
      objeto: 'Fornecimento de Materiais OPME',
      modalidade: 'Concorrência',
      valorEstimado: 1250000,
      dataAbertura: '2025-10-28T14:00:00',
      status: 'em_analise',
      prazoEntrega: '2025-10-27',
    },
    {
      id: '3',
      numero: 'PE 098/2025',
      orgao: 'Hospital Regional Norte',
      objeto: 'Stents Cardíacos e Acessórios',
      modalidade: 'Pregão Eletrônico',
      valorEstimado: 680000,
      dataAbertura: '2025-10-20T10:00:00',
      status: 'proposta_enviada',
      prazoEntrega: '2025-10-19',
    },
    {
      id: '4',
      numero: 'TP 012/2025',
      orgao: 'Fundação Hospitalar do Estado',
      objeto: 'Próteses Cardiovasculares',
      modalidade: 'Tomada de Preços',
      valorEstimado: 890000,
      dataAbertura: '2025-10-15T09:00:00',
      status: 'vencida',
      prazoEntrega: '2025-10-14',
    },
  ];

  const kpis = [
    {
      title: 'Licitações Ativas',
      value: '24',
      trend: '+6',
      icon: FileText,
      iconBg: 'linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))',
      color: 'var(--orx-primary)',
    },
    {
      title: 'Propostas Enviadas',
      value: '18',
      trend: '+3',
      icon: Upload,
      iconBg: 'linear-gradient(135deg, var(--orx-purple-500), #7C3AED)',
      color: 'var(--orx-purple-500)',
    },
    {
      title: 'Taxa de Sucesso',
      value: '67%',
      trend: '+5%',
      icon: TrendingUp,
      iconBg: 'linear-gradient(135deg, var(--orx-success), #059669)',
      color: 'var(--orx-success)',
    },
    {
      title: 'Valor em Análise',
      value: 'R$ 3.2M',
      trend: '+18%',
      icon: DollarSign,
      iconBg: 'linear-gradient(135deg, var(--orx-warning), #D97706)',
      color: 'var(--orx-warning)',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      aberta: 'var(--orx-primary)',
      em_analise: 'var(--orx-warning)',
      proposta_enviada: 'var(--orx-purple-500)',
      vencida: 'var(--orx-success)',
      perdida: 'var(--orx-error)',
      cancelada: 'var(--orx-gray-500)',
    };
    return colors[status as keyof typeof colors] || 'var(--orx-gray-500)';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      aberta: 'Aberta',
      em_analise: 'Em Análise',
      proposta_enviada: 'Proposta Enviada',
      vencida: 'Vencida',
      perdida: 'Perdida',
      cancelada: 'Cancelada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'vencida') return CheckCircle;
    if (status === 'perdida') return XCircle;
    if (status === 'em_analise' || status === 'proposta_enviada') return Clock;
    if (status === 'cancelada') return AlertTriangle;
    return FileText;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              style={{
                fontSize: '0.813rem',
                fontFamily: 'var(--orx-font-family)',
                fontWeight: 600,
                color: 'var(--orx-text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              Licitações e Propostas
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color: 'var(--orx-text-secondary)',
                fontFamily: 'var(--orx-font-family)',
              }}
            >
              Gestão completa de licitações públicas e privadas
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="neumorphic-button flex items-center gap-2 px-6 py-3 rounded-xl"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.813rem',
                border: 'none',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Plus size={18} />
              Nova Licitação
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="neumorphic-card p-6 rounded-2xl"
              style={{
                background: 'var(--orx-bg-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: kpi.iconBg,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <kpi.icon size={24} color="#ffffff" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {kpi.title}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    color: 'var(--orx-text-primary)',
                    fontFamily: 'var(--orx-font-family)',
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 600,
                    color: kpi.color,
                    fontFamily: 'var(--orx-font-family)',
                  }}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background: 'var(--orx-bg-light)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--orx-text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Buscar por número, órgão ou objeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl"
                style={{
                  background: 'var(--orx-bg-light)',
                  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.813rem',
                  fontFamily: 'var(--orx-font-family)',
                  color: 'var(--orx-text-primary)',
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} style={{ color: 'var(--orx-text-secondary)' }} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl"
                style={{
                  background: 'var(--orx-bg-light)',
                  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.813rem',
                  fontFamily: 'var(--orx-font-family)',
                  color: 'var(--orx-text-primary)',
                }}
              >
                <option value="todas">Todas</option>
                <option value="aberta">Abertas</option>
                <option value="em_analise">Em Análise</option>
                <option value="proposta_enviada">Proposta Enviada</option>
                <option value="vencida">Vencidas</option>
                <option value="perdida">Perdidas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Licitações Table */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background: 'var(--orx-bg-light)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(99, 102, 241, 0.1)' }}>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                    }}
                  >
                    Número
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                    }}
                  >
                    Órgão
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                    }}
                  >
                    Objeto
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                    }}
                  >
                    Valor Estimado
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                    }}
                  >
                    Abertura
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {licitacoes.map((licitacao) => {
                  const StatusIcon = getStatusIcon(licitacao.status);
                  return (
                    <tr
                      key={licitacao.id}
                      style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.05)' }}
                    >
                      <td
                        style={{
                          padding: '1rem',
                          fontSize: '0.813rem',
                          fontFamily: 'var(--orx-font-family)',
                          color: 'var(--orx-text-primary)',
                          fontWeight: 600,
                        }}
                      >
                        {licitacao.numero}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          fontSize: '0.813rem',
                          fontFamily: 'var(--orx-font-family)',
                          color: 'var(--orx-text-primary)',
                        }}
                      >
                        {licitacao.orgao}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          fontSize: '0.813rem',
                          fontFamily: 'var(--orx-font-family)',
                          color: 'var(--orx-text-secondary)',
                        }}
                      >
                        {licitacao.objeto}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          textAlign: 'right',
                          fontSize: '0.813rem',
                          fontFamily: 'var(--orx-font-family)',
                          color: 'var(--orx-text-primary)',
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(licitacao.valorEstimado)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            fontFamily: 'var(--orx-font-family)',
                            background: `${getStatusColor(licitacao.status)}15`,
                            color: getStatusColor(licitacao.status),
                          }}
                        >
                          <StatusIcon size={14} />
                          {getStatusLabel(licitacao.status)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          fontSize: '0.813rem',
                          fontFamily: 'var(--orx-font-family)',
                          color: 'var(--orx-text-secondary)',
                        }}
                      >
                        {formatDate(licitacao.dataAbertura)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Visualizar"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              background: 'var(--orx-bg-light)',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={16} style={{ color: 'var(--orx-primary)' }} />
                          </button>
                          <button
                            title="Download Edital"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              background: 'var(--orx-bg-light)',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Download size={16} style={{ color: 'var(--orx-success)' }} />
                          </button>
                          <button
                            title="Enviar Proposta"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              background: 'var(--orx-bg-light)',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Upload size={16} style={{ color: 'var(--orx-purple-500)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
