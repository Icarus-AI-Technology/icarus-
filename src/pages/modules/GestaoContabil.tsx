/**
 * GESTÃO CONTÁBIL - ICARUS v5.0
 * Contabilidade completa + DRE + Plano de Contas
 */

import { useState } from "react";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Download,
  Calendar,
} from "lucide-react";
import { ModulePage } from "@/components/templates/ModulePage";
import { Button } from "@/components/ui/button";

interface DREItem {
  grupo: string;
  descricao: string;
  valor: number;
  percentual: number;
}

export default function GestaoContabil() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("mes_atual");

  const kpis = [
    {
      title:"Receita Bruta",
      value:"R$ 4.2M",
      trend:"+18.5%",
      trendUp: true,
      icon: DollarSign,
      iconBg:"linear-gradient(135deg, var(--orx-success), #059669)",
      color:"var(--orx-success)",
    },
    {
      title:"Lucro Líquido",
      value:"R$ 892K",
      trend:"+12.3%",
      trendUp: true,
      icon: TrendingUp,
      iconBg:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
      color:"var(--orx-primary)",
    },
    {
      title:"Margem Líquida",
      value:"21.2%",
      trend:"-0.8%",
      trendUp: false,
      icon: PieChart,
      iconBg:"linear-gradient(135deg, var(--orx-warning), #D97706)",
      color:"var(--orx-warning)",
    },
    {
      title:"EBITDA",
      value:"R$ 1.1M",
      trend:"+15.7%",
      trendUp: true,
      icon: BarChart3,
      iconBg:"linear-gradient(135deg, var(--orx-purple-500), #7C3AED)",
      color:"var(--orx-purple-500)",
    },
  ];

  const dreData: DREItem[] = [
    { grupo:"RECEITA", descricao:"Receita Bruta", valor: 4200000, percentual: 100.0 },
    { grupo:"RECEITA", descricao:"(-) Deduções", valor: -420000, percentual: -10.0 },
    { grupo:"RECEITA", descricao:"(=) Receita Líquida", valor: 3780000, percentual: 90.0 },
    { grupo:"CUSTOS", descricao:"(-) CMV", valor: -1890000, percentual: -45.0 },
    { grupo:"RESULTADO", descricao:"(=) Lucro Bruto", valor: 1890000, percentual: 45.0 },
    { grupo:"DESPESAS", descricao:"(-) Despesas Operacionais", valor: -630000, percentual: -15.0 },
    { grupo:"DESPESAS", descricao:"(-) Despesas Administrativas", valor: -252000, percentual: -6.0 },
    { grupo:"DESPESAS", descricao:"(-) Despesas Comerciais", valor: -168000, percentual: -4.0 },
    { grupo:"RESULTADO", descricao:"(=) EBITDA", valor: 1134000, percentual: 27.0 },
    { grupo:"FINANCEIRO", descricao:"(-) Despesas Financeiras", valor: -126000, percentual: -3.0 },
    { grupo:"FINANCEIRO", descricao:"(+) Receitas Financeiras", valor: 42000, percentual: 1.0 },
    { grupo:"RESULTADO", descricao:"(=) Lucro Antes dos Impostos", valor: 1050000, percentual: 25.0 },
    { grupo:"IMPOSTOS", descricao:"(-) Impostos", valor: -158000, percentual: -3.8 },
    { grupo:"RESULTADO", descricao:"(=) Lucro Líquido", valor: 892000, percentual: 21.2 },
  ];

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    return new Intl.NumberFormat("pt-BR", {
      style:"currency",
      currency:"BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value < 0 ? -absValue : absValue);
  };

  const getGrupoColor = (grupo: string) => {
    const colors = {
      RECEITA:"var(--orx-success)",
      CUSTOS:"var(--orx-error)",
      DESPESAS:"var(--orx-warning)",
      RESULTADO:"var(--orx-primary)",
      FINANCEIRO:"var(--orx-purple-500)",
      IMPOSTOS:"var(--orx-error-dark)",
    };
    return colors[grupo as keyof typeof colors] ||"var(--orx-gray-500)";
  };

  return (
    <ModulePage
      title="Gestão Contábil"
      description="Contabilidade completa + DRE + Plano de Contas"
      icon={<Calculator aria-hidden="true" className="h-5 w-5" />}
      actions={
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2">
            <Calendar size={20} strokeWidth={1.5} className="flex-shrink-0 text-[var(--orx-text-secondary)]" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-xl"
              style={{
                background:"var(--orx-bg-light)",
                boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                border:"1px solid rgba(99, 102, 241, 0.2)",
                fontSize:"0.813rem",
                fontFamily:"var(--orx-font-family)",
                color:"var(--orx-text-primary)",
              }}
            >
              <option value="mes_atual">Mês Atual</option>
              <option value="trimestre">Trimestre</option>
              <option value="semestre">Semestre</option>
              <option value="ano">Ano</option>
            </select>
          </div>
          <Button
            variant="neumorphic"
            size="default"
            className="inline-flex items-center gap-2"
            onClick={() => window.dispatchEvent(new CustomEvent('icarus:export-dre'))}
          >
            <Download size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Exportar DRE</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
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
                  <kpi.icon size={24} color="#ffffff" strokeWidth={1.5} />
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
            </div>
          ))}
        </div>

        {/* DRE Table */}
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
                <Calculator size={24} color="#ffffff" />
              </div>
              <h2
                style={{
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color:"var(--orx-text-primary)",
                  fontFamily:"var(--orx-font-family)",
                }}
              >
                Demonstração do Resultado do Exercício (DRE)
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
                    Descrição
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
                      textAlign:"right",
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    % Receita
                  </th>
                </tr>
              </thead>
              <tbody>
                {dreData.map((item, index) => {
                  const isResultado = item.grupo ==="RESULTADO";
                  const isTotal = item.descricao.includes("=)");
                  
                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom:"1px solid rgba(99, 102, 241, 0.05)",
                        backgroundColor: isResultado
                          ?"rgba(99, 102, 241, 0.05)"
                          :"transparent",
                      }}
                    >
                      <td
                        style={{
                          padding:"1rem",
                          fontSize: isTotal ?"0.9375rem" :"0.875rem",
                          fontFamily:"var(--orx-font-family)",
                          color:"var(--orx-text-primary)",
                          fontWeight: isTotal ? 700 : 400,
                          paddingLeft: isTotal ?"1rem" :"2rem",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {!isTotal && (
                            <div
                              style={{
                                width:"3px",
                                height:"16px",
                                background: getGrupoColor(item.grupo),
                                borderRadius:"2px",
                              }}
                            />
                          )}
                          {item.descricao}
                        </div>
                      </td>
                      <td
                        style={{
                          padding:"1rem",
                          textAlign:"right",
                          fontSize: isTotal ?"0.9375rem" :"0.875rem",
                          fontFamily:"var(--orx-font-family)",
                          color: item.valor < 0 ?"var(--orx-error)" :"var(--orx-text-primary)",
                          fontWeight: isTotal ? 700 : 600,
                        }}
                      >
                        {formatCurrency(item.valor)}
                      </td>
                      <td
                        style={{
                          padding:"1rem",
                          textAlign:"right",
                          fontSize: '0.813rem',
                          fontFamily:"var(--orx-font-family)",
                          color:
                            item.percentual < 0
                              ?"var(--orx-error)"
                              :"var(--orx-text-secondary)",
                          fontWeight: isTotal ? 700 : 400,
                        }}
                      >
                        {item.percentual.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda Grupos */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <h3
            style={{
              fontSize: '0.813rem',
              fontWeight: 600,
              color:"var(--orx-text-primary)",
              fontFamily:"var(--orx-font-family)",
              marginBottom:"1rem",
            }}
          >
            Legenda de Grupos
          </h3>
          <div className="flex flex-wrap gap-4">
            {["RECEITA","CUSTOS","DESPESAS","RESULTADO","FINANCEIRO","IMPOSTOS"].map(
              (grupo) => (
                <div key={grupo} className="flex items-center gap-2">
                  <div
                    style={{
                      width:"16px",
                      height:"16px",
                      background: getGrupoColor(grupo),
                      borderRadius:"4px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.813rem',
                      color:"var(--orx-text-primary)",
                      fontFamily:"var(--orx-font-family)",
                    }}
                  >
                    {grupo}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  );
}

