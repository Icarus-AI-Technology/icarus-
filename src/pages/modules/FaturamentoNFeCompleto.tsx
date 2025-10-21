/**
 * FATURAMENTO NF-e COMPLETO - ICARUS v5.0
 * Emissão, consulta e gerenciamento de Notas Fiscais Eletrônicas
 */

import { useState } from"react";
import {
  FileText,
  Send,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Printer,
  Mail,
  AlertTriangle,
  TrendingUp,
} from"lucide-react";

interface NFe {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso: string;
  destinatario: string;
  cnpj: string;
  valor: number;
  status:"emitida" |"autorizada" |"cancelada" |"denegada" |"rejeitada";
  emissaoEm: string;
  protocolo?: string;
}

export default function FaturamentoNFeCompleto() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todas");

  // Mock data
  const nfes: NFe[] = [
    {
      id:"1",
      numero:"000.123.456",
      serie:"1",
      chaveAcesso:"35231234567890123456789012345678901234567890",
      destinatario:"Hospital Santa Maria",
      cnpj:"12.345.678/0001-90",
      valor: 45800.00,
      status:"autorizada",
      emissaoEm:"2025-10-20T10:30:00",
      protocolo:"135230012345678",
    },
    {
      id:"2",
      numero:"000.123.457",
      serie:"1",
      chaveAcesso:"35231234567890123456789012345678901234567891",
      destinatario:"Clínica Ortopédica Silva",
      cnpj:"98.765.432/0001-10",
      valor: 28300.00,
      status:"autorizada",
      emissaoEm:"2025-10-20T11:15:00",
      protocolo:"135230012345679",
    },
    {
      id:"3",
      numero:"000.123.458",
      serie:"1",
      chaveAcesso:"35231234567890123456789012345678901234567892",
      destinatario:"Hospital São Lucas",
      cnpj:"11.222.333/0001-44",
      valor: 67200.00,
      status:"emitida",
      emissaoEm:"2025-10-20T14:20:00",
    },
  ];

  const kpis = [
    {
      title:"NF-e Emitidas Hoje",
      value:"12",
      trend:"+3",
      icon: FileText,
      iconBg:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
      color:"var(--orx-primary)",
    },
    {
      title:"Autorizadas",
      value:"10",
      trend:"83%",
      icon: CheckCircle,
      iconBg:"linear-gradient(135deg, var(--orx-success), #059669)",
      color:"var(--orx-success)",
    },
    {
      title:"Aguardando",
      value:"2",
      trend:"17%",
      icon: Clock,
      iconBg:"linear-gradient(135deg, var(--orx-warning), #D97706)",
      color:"var(--orx-warning)",
    },
    {
      title:"Valor Total",
      value:"R$ 186K",
      trend:"+12%",
      icon: TrendingUp,
      iconBg:"linear-gradient(135deg, var(--orx-purple-500), #7C3AED)",
      color:"var(--orx-purple-500)",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      autorizada:"var(--orx-success)",
      emitida:"var(--orx-warning)",
      cancelada:"var(--orx-gray-500)",
      denegada:"var(--orx-error)",
      rejeitada:"var(--orx-error-dark)",
    };
    return colors[status as keyof typeof colors] ||"var(--orx-gray-500)";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      autorizada:"Autorizada",
      emitida:"Emitida",
      cancelada:"Cancelada",
      denegada:"Denegada",
      rejeitada:"Rejeitada",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style:"currency",
      currency:"BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day:"2-digit",
      month:"2-digit",
      year:"numeric",
      hour:"2-digit",
      minute:"2-digit",
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
                fontFamily:"var(--orx-font-family)",
                fontWeight: 600,
                color:"var(--orx-text-primary)",
                marginBottom:"0.5rem",
              }}
            >
              Faturamento NF-e
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                fontFamily:"var(--orx-font-family)",
              }}
            >
              Emissão e gerenciamento de Notas Fiscais Eletrônicas
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
                background:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
                color:"white",
                fontWeight: 600,
                fontSize: '0.813rem',
                border:"none",
                boxShadow:"0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              <Plus size={18} />
              Nova NF-e
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
                background:"var(--orx-bg-light)",
                boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width:"56px",
                    height:"56px",
                    background: kpi.iconBg,
                    boxShadow:"0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <kpi.icon size={24} color="#ffffff" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                      marginBottom:"0.25rem",
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
                    color:"var(--orx-text-primary)",
                    fontFamily:"var(--orx-font-family)",
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
                    fontFamily:"var(--orx-font-family)",
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
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                style={{ color:"var(--orx-text-secondary)" }}
              />
              <input
                type="text"
                placeholder="Buscar por número, destinatário, CNPJ ou chave de acesso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl"
                style={{
                  background:"var(--orx-bg-light)",
                  boxShadow:"inset 2px 2px 4px rgba(0, 0, 0, 0.1)",
                  border:"1px solid rgba(99, 102, 241, 0.2)",
                  fontSize: '0.813rem',
                  fontFamily:"var(--orx-font-family)",
                  color:"var(--orx-text-primary)",
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} style={{ color:"var(--orx-text-secondary)" }} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl"
                style={{
                  background:"var(--orx-bg-light)",
                  boxShadow:"inset 2px 2px 4px rgba(0, 0, 0, 0.1)",
                  border:"1px solid rgba(99, 102, 241, 0.2)",
                  fontSize: '0.813rem',
                  fontFamily:"var(--orx-font-family)",
                  color:"var(--orx-text-primary)",
                }}
              >
                <option value="todas">Todas</option>
                <option value="autorizada">Autorizadas</option>
                <option value="emitida">Emitidas</option>
                <option value="cancelada">Canceladas</option>
                <option value="rejeitada">Rejeitadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* NF-e Table */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom:"2px solid rgba(99, 102, 241, 0.1)",
                  }}
                >
                  <th
                    style={{
                      padding:"1rem",
                      textAlign:"left",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    Número
                  </th>
                  <th
                    style={{
                      padding:"1rem",
                      textAlign:"left",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    Destinatário
                  </th>
                  <th
                    style={{
                      padding:"1rem",
                      textAlign:"left",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    CNPJ
                  </th>
                  <th
                    style={{
                      padding:"1rem",
                      textAlign:"right",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    Valor
                  </th>
                  <th
                    style={{
                      padding:"1rem",
                      textAlign:"center",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding:"1rem",
                      textAlign:"left",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    Emissão
                  </th>
                  <th
                    style={{
                      padding:"1rem",
                      textAlign:"center",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {nfes.map((nfe) => (
                  <tr
                    key={nfe.id}
                    style={{
                      borderBottom:"1px solid rgba(99, 102, 241, 0.05)",
                    }}
                  >
                    <td
                      style={{
                        padding:"1rem",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {nfe.numero}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-primary)",
                      }}
                    >
                      {nfe.destinatario}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-secondary)",
                      }}
                    >
                      {nfe.cnpj}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        textAlign:"right",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(nfe.valor)}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        textAlign:"center",
                      }}
                    >
                      <span
                        style={{
                          display:"inline-block",
                          padding:"0.375rem 0.75rem",
                          borderRadius:"0.5rem",
                          fontSize: '0.813rem',
                          fontWeight: 600,
                          fontFamily:"var(--orx-font-family)",
                          background: `${getStatusColor(nfe.status)}15`,
                          color: getStatusColor(nfe.status),
                        }}
                      >
                        {getStatusLabel(nfe.status)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-secondary)",
                      }}
                    >
                      {formatDate(nfe.emissaoEm)}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        textAlign:"center",
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Imprimir DANFE"
                          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                            padding:"0.5rem",
                            borderRadius:"0.5rem",
                            background:"var(--orx-bg-light)",
                            boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                            border:"none",
                            cursor:"pointer",
                          }}
                        >
                          <Printer size={16} style={{ color:"var(--orx-primary)" }} />
                        </button>
                        <button
                          title="Download XML"
                          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                            padding:"0.5rem",
                            borderRadius:"0.5rem",
                            background:"var(--orx-bg-light)",
                            boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                            border:"none",
                            cursor:"pointer",
                          }}
                        >
                          <Download size={16} style={{ color:"var(--orx-success)" }} />
                        </button>
                        <button
                          title="Enviar por E-mail"
                          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                            padding:"0.5rem",
                            borderRadius:"0.5rem",
                            background:"var(--orx-bg-light)",
                            boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                            border:"none",
                            cursor:"pointer",
                          }}
                        >
                          <Mail size={16} style={{ color:"var(--orx-purple-500)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

