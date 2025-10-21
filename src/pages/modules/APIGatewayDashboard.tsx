/**
 * API GATEWAY DASHBOARD - ICARUS v5.0
 * Monitoramento e métricas de APIs externas e internas
 */

import { useState } from"react";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Server,
  Globe,
  Shield,
  Database,
} from"lucide-react";

interface API {
  id: string;
  nome: string;
  endpoint: string;
  tipo:"interna" |"externa";
  status:"healthy" |"degraded" |"down";
  latenciaMedia: number;
  requestsHoje: number;
  taxaSucesso: number;
  ultimoCheck: string;
}

export default function APIGatewayDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("hoje");

  // Mock data - APIs
  const apis: API[] = [
    {
      id:"1",
      nome:"SEFAZ - NF-e",
      endpoint:"https://nfe.fazenda.gov.br/api/v1",
      tipo:"externa",
      status:"healthy",
      latenciaMedia: 245,
      requestsHoje: 1247,
      taxaSucesso: 99.2,
      ultimoCheck:"2025-10-20T16:45:00",
    },
    {
      id:"2",
      nome:"ANVISA - Rastreabilidade",
      endpoint:"https://portal.anvisa.gov.br/api/v2",
      tipo:"externa",
      status:"healthy",
      latenciaMedia: 512,
      requestsHoje: 847,
      taxaSucesso: 98.5,
      ultimoCheck:"2025-10-20T16:44:00",
    },
    {
      id:"3",
      nome:"ViaCEP",
      endpoint:"https://viacep.com.br/ws",
      tipo:"externa",
      status:"healthy",
      latenciaMedia: 89,
      requestsHoje: 2341,
      taxaSucesso: 99.8,
      ultimoCheck:"2025-10-20T16:45:00",
    },
    {
      id:"4",
      nome:"Receita Federal",
      endpoint:"https://www.receitafederal.gov.br/api",
      tipo:"externa",
      status:"degraded",
      latenciaMedia: 1842,
      requestsHoje: 456,
      taxaSucesso: 87.3,
      ultimoCheck:"2025-10-20T16:43:00",
    },
    {
      id:"5",
      nome:"CFM - Validação CRM",
      endpoint:"https://portal.cfm.org.br/api",
      tipo:"externa",
      status:"healthy",
      latenciaMedia: 654,
      requestsHoje: 123,
      taxaSucesso: 96.8,
      ultimoCheck:"2025-10-20T16:45:00",
    },
    {
      id:"6",
      nome:"Supabase - Database",
      endpoint:"https://[project].supabase.co",
      tipo:"interna",
      status:"healthy",
      latenciaMedia: 45,
      requestsHoje: 18924,
      taxaSucesso: 99.9,
      ultimoCheck:"2025-10-20T16:45:00",
    },
  ];

  const kpis = [
    {
      title:"APIs Monitoradas",
      value:"6",
      trend:"100%",
      icon: Globe,
      iconBg:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
      color:"var(--orx-primary)",
    },
    {
      title:"Uptime Médio",
      value:"99.2%",
      trend:"+0.3%",
      icon: CheckCircle,
      iconBg:"linear-gradient(135deg, var(--orx-success), #059669)",
      color:"var(--orx-success)",
    },
    {
      title:"Latência Média",
      value:"245ms",
      trend:"-12ms",
      icon: Zap,
      iconBg:"linear-gradient(135deg, var(--orx-warning), #D97706)",
      color:"var(--orx-warning)",
    },
    {
      title:"Requests Hoje",
      value:"23.9K",
      trend:"+15%",
      icon: TrendingUp,
      iconBg:"linear-gradient(135deg, var(--orx-purple-500), #7C3AED)",
      color:"var(--orx-purple-500)",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      healthy:"var(--orx-success)",
      degraded:"var(--orx-warning)",
      down:"var(--orx-error)",
    };
    return colors[status as keyof typeof colors] ||"var(--orx-gray-500)";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      healthy:"Saudável",
      degraded:"Degradado",
      down:"Offline",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    if (status ==="healthy") return CheckCircle;
    if (status ==="degraded") return AlertTriangle;
    return XCircle;
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
              API Gateway Dashboard
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                fontFamily:"var(--orx-font-family)",
              }}
            >
              Monitoramento e métricas de APIs externas e internas
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-3 rounded-xl"
              style={{
                background:"var(--orx-bg-light)",
                boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                border:"1px solid rgba(99, 102, 241, 0.2)",
                fontSize: '0.813rem',
                fontFamily:"var(--orx-font-family)",
                color:"var(--orx-text-primary)",
              }}
            >
              <option value="hoje">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
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

        {/* APIs Grid */}
        <div className="grid grid-cols-2 gap-6">
          {apis.map((api) => {
            const StatusIcon = getStatusIcon(api.status);
            return (
              <div
                key={api.id}
                className="neumorphic-card p-6 rounded-2xl"
                style={{
                  background:"var(--orx-bg-light)",
                  boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{
                        width:"48px",
                        height:"48px",
                        background:
                          api.tipo ==="interna"
                            ?"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))"
                            :"linear-gradient(135deg, var(--orx-purple-500), #7C3AED)",
                        boxShadow:"0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {api.tipo ==="interna" ? (
                        <Database size={24} color="#ffffff" />
                      ) : (
                        <Globe size={24} color="#ffffff" />
                      )}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '0.813rem',
                          fontWeight: 600,
                          color:"var(--orx-text-primary)",
                          fontFamily:"var(--orx-font-family)",
                          marginBottom:"0.25rem",
                        }}
                      >
                        {api.nome}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.813rem',
                          color:"var(--orx-text-secondary)",
                          fontFamily:"var(--orx-font-family)",
                        }}
                      >
                        {api.endpoint}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      display:"inline-flex",
                      alignItems:"center",
                      gap:"0.5rem",
                      padding:"0.375rem 0.75rem",
                      borderRadius:"0.5rem",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      fontFamily:"var(--orx-font-family)",
                      background: `${getStatusColor(api.status)}15`,
                      color: getStatusColor(api.status),
                    }}
                  >
                    <StatusIcon size={14} />
                    {getStatusLabel(api.status)}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p
                      style={{
                        fontSize: '0.813rem',
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                        marginBottom:"0.25rem",
                      }}
                    >
                      Latência
                    </p>
                    <p
                      style={{
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        color:"var(--orx-text-primary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      {api.latenciaMedia}ms
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: '0.813rem',
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                        marginBottom:"0.25rem",
                      }}
                    >
                      Requests
                    </p>
                    <p
                      style={{
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        color:"var(--orx-text-primary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      {api.requestsHoje.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: '0.813rem',
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                        marginBottom:"0.25rem",
                      }}
                    >
                      Sucesso
                    </p>
                    <p
                      style={{
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        color: api.taxaSucesso >= 95 ?"var(--orx-success)" :"var(--orx-warning)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      {api.taxaSucesso}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

