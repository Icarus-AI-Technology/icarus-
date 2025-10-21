/**
 * BI DASHBOARD INTERATIVO - ICARUS v5.0
 * Business Intelligence com analytics avançado
 */

import { useState } from"react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from"lucide-react";

export default function BIDashboardInterativo() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("mes_atual");
  const [selectedCategory, setSelectedCategory] = useState<string>("geral");

  const kpis = [
    {
      title:"Faturamento Total",
      value:"R$ 3.8M",
      trend:"+15.3%",
      trendUp: true,
      icon: DollarSign,
      iconBg:"linear-gradient(135deg, var(--orx-success), #059669)",
      color:"var(--orx-success)",
      periodo:"vs. mês anterior",
    },
    {
      title:"Pedidos Processados",
      value:"1.247",
      trend:"+12.5%",
      trendUp: true,
      icon: ShoppingCart,
      iconBg:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
      color:"var(--orx-primary)",
      periodo:"vs. mês anterior",
    },
    {
      title:"Ticket Médio",
      value:"R$ 3.048",
      trend:"+2.3%",
      trendUp: true,
      icon: TrendingUp,
      iconBg:"linear-gradient(135deg, var(--orx-purple-500), #7C3AED)",
      color:"var(--orx-purple-500)",
      periodo:"vs. mês anterior",
    },
    {
      title:"Margem de Lucro",
      value:"28.5%",
      trend:"-1.2%",
      trendUp: false,
      icon: PieChart,
      iconBg:"linear-gradient(135deg, var(--orx-warning), #D97706)",
      color:"var(--orx-warning)",
      periodo:"vs. mês anterior",
    },
  ];

  const topProdutos = [
    {
      nome:"Prótese de Quadril Titanium Pro",
      vendas: 142,
      receita: 854200,
      margem: 32.5,
      variacao:"+18%",
      variacaoUp: true,
    },
    {
      nome:"Stent Cardíaco DES Premium",
      vendas: 287,
      receita: 718500,
      margem: 28.8,
      variacao:"+12%",
      variacaoUp: true,
    },
    {
      nome:"Placa Ortopédica Multiusos",
      vendas: 523,
      receita: 628400,
      margem: 35.2,
      variacao:"+8%",
      variacaoUp: true,
    },
    {
      nome:"Marca-passo Inteligente IoT",
      vendas: 89,
      receita: 534000,
      margem: 25.1,
      variacao:"-5%",
      variacaoUp: false,
    },
  ];

  const topHospitais = [
    {
      nome:"Hospital Santa Maria",
      pedidos: 89,
      receita: 1245800,
      ticketMedio: 14000,
      crescimento:"+22%",
      crescimentoUp: true,
    },
    {
      nome:"Hospital São Lucas",
      pedidos: 67,
      receita: 987600,
      ticketMedio: 14740,
      crescimento:"+15%",
      crescimentoUp: true,
    },
    {
      nome:"Clínica Ortopédica Silva",
      pedidos: 124,
      receita: 856300,
      ticketMedio: 6906,
      crescimento:"+8%",
      crescimentoUp: true,
    },
    {
      nome:"Hospital Regional Norte",
      pedidos: 52,
      receita: 734200,
      ticketMedio: 14119,
      crescimento:"-3%",
      crescimentoUp: false,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style:"currency",
      currency:"BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
              Business Intelligence
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                fontFamily:"var(--orx-font-family)",
              }}
            >
              Analytics avançado e insights estratégicos
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
                background:"var(--orx-bg-light)",
                boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                color:"var(--orx-text-primary)",
                fontWeight: 600,
                fontSize: '0.813rem',
                border:"1px solid rgba(99, 102, 241, 0.2)",
                cursor:"pointer",
              }}
            >
              <RefreshCw size={18} />
              Atualizar
            </button>
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
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} style={{ color:"var(--orx-text-secondary)" }} />
              <span
                style={{
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color:"var(--orx-text-primary)",
                  fontFamily:"var(--orx-font-family)",
                }}
              >
                Filtros:
              </span>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
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
              <option value="hoje">Hoje</option>
              <option value="semana_atual">Semana Atual</option>
              <option value="mes_atual">Mês Atual</option>
              <option value="trimestre">Trimestre</option>
              <option value="semestre">Semestre</option>
              <option value="ano">Ano</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              <option value="geral">Geral</option>
              <option value="produtos">Produtos OPME</option>
              <option value="hospitais">Hospitais</option>
              <option value="representantes">Representantes</option>
              <option value="regioes">Regiões</option>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {kpi.trendUp ? (
                    <TrendingUp size={16} style={{ color: kpi.color }} />
                  ) : (
                    <TrendingDown size={16} style={{ color: kpi.color }} />
                  )}
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
                <span
                  style={{
                    fontSize: '0.813rem',
                    color:"var(--orx-text-secondary)",
                    fontFamily:"var(--orx-font-family)",
                  }}
                >
                  {kpi.periodo}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Produtos */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width:"48px",
                  height:"48px",
                  background:"linear-gradient(135deg, var(--orx-warning), #D97706)",
                  boxShadow:"0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Package size={24} color="#ffffff" />
              </div>
              <h2
                style={{
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color:"var(--orx-text-primary)",
                  fontFamily:"var(--orx-font-family)",
                }}
              >
                Top 4 Produtos OPME
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom:"2px solid rgba(99, 102, 241, 0.1)" }}>
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
                    Produto
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
                    Vendas
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
                    Receita
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
                    Margem
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
                    Variação
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProdutos.map((produto, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom:"1px solid rgba(99, 102, 241, 0.05)" }}
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
                      {produto.nome}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        textAlign:"center",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-primary)",
                      }}
                    >
                      {produto.vendas}
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
                      {formatCurrency(produto.receita)}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        textAlign:"center",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-success)",
                        fontWeight: 600,
                      }}
                    >
                      {produto.margem}%
                    </td>
                    <td style={{ padding:"1rem", textAlign:"center" }}>
                      <span
                        style={{
                          display:"inline-flex",
                          alignItems:"center",
                          gap:"0.25rem",
                          fontSize: '0.813rem',
                          fontWeight: 600,
                          fontFamily:"var(--orx-font-family)",
                          color: produto.variacaoUp ?"var(--orx-success)" :"var(--orx-error)",
                        }}
                      >
                        {produto.variacaoUp ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {produto.variacao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Hospitais */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width:"48px",
                  height:"48px",
                  background:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
                  boxShadow:"0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Users size={24} color="#ffffff" />
              </div>
              <h2
                style={{
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color:"var(--orx-text-primary)",
                  fontFamily:"var(--orx-font-family)",
                }}
              >
                Top 4 Hospitais por Faturamento
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom:"2px solid rgba(99, 102, 241, 0.1)" }}>
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
                    Hospital
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
                    Pedidos
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
                    Receita
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
                    Ticket Médio
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
                    Crescimento
                  </th>
                </tr>
              </thead>
              <tbody>
                {topHospitais.map((hospital, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom:"1px solid rgba(99, 102, 241, 0.05)" }}
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
                      {hospital.nome}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        textAlign:"center",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-primary)",
                      }}
                    >
                      {hospital.pedidos}
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
                      {formatCurrency(hospital.receita)}
                    </td>
                    <td
                      style={{
                        padding:"1rem",
                        textAlign:"right",
                        fontSize: '0.813rem',
                        fontFamily:"var(--orx-font-family)",
                        color:"var(--orx-text-secondary)",
                      }}
                    >
                      {formatCurrency(hospital.ticketMedio)}
                    </td>
                    <td style={{ padding:"1rem", textAlign:"center" }}>
                      <span
                        style={{
                          display:"inline-flex",
                          alignItems:"center",
                          gap:"0.25rem",
                          fontSize: '0.813rem',
                          fontWeight: 600,
                          fontFamily:"var(--orx-font-family)",
                          color: hospital.crescimentoUp ?"var(--orx-success)" :"var(--orx-error)",
                        }}
                      >
                        {hospital.crescimentoUp ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {hospital.crescimento}
                      </span>
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

