/**
 * BI DASHBOARD INTERATIVO - ICARUS v5.0
 * Business Intelligence com analytics avançado
 */

import { useState } from"react";
import { BarChart3, TrendingUp, TrendingDown, PieChart, DollarSign, Package, Users, ShoppingCart, Calendar, Download, RefreshCw } from"lucide-react";
import { ModulePage } from "@/components/templates/ModulePage";
import { Button } from "@/components/ui/button";

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
      bgClass:"bg-gradient-to-br from-[var(--orx-success)] to-[#059669]",
      textClass:"text-[var(--orx-success)]",
      periodo:"vs. mês anterior",
    },
    {
      title:"Pedidos Processados",
      value:"1.247",
      trend:"+12.5%",
      trendUp: true,
      icon: ShoppingCart,
      bgClass:"bg-gradient-to-br from-[var(--orx-primary)] to-[var(--orx-primary-hover)]",
      textClass:"text-[var(--orx-primary)]",
      periodo:"vs. mês anterior",
    },
    {
      title:"Ticket Médio",
      value:"R$ 3.048",
      trend:"+2.3%",
      trendUp: true,
      icon: TrendingUp,
      bgClass:"bg-gradient-to-br from-[var(--orx-purple-500)] to-[#7C3AED]",
      textClass:"text-[var(--orx-purple-500)]",
      periodo:"vs. mês anterior",
    },
    {
      title:"Margem de Lucro",
      value:"28.5%",
      trend:"-1.2%",
      trendUp: false,
      icon: PieChart,
      bgClass:"bg-gradient-to-br from-[var(--orx-warning)] to-[#D97706]",
      textClass:"text-[var(--orx-warning)]",
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
    <ModulePage
      title="Business Intelligence"
      description="Analytics avançado e insights estratégicos"
      icon={<BarChart3 aria-hidden="true" className="h-5 w-5" />}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="neumorphic"
            size="default"
            className="inline-flex items-center gap-2"
            onClick={() => window.dispatchEvent(new CustomEvent('icarus:refresh-bi'))}
          >
            <RefreshCw size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Atualizar</span>
          </Button>
          <Button
            variant="neumorphic"
            size="default"
            className="inline-flex items-center gap-2"
            onClick={() => window.dispatchEvent(new CustomEvent('icarus:export-bi'))}
          >
            <Download size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Exportar</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="neumorphic-card p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-orx-soft">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} strokeWidth={1.5} className="text-[var(--orx-text-secondary)]" />
              <span className="text-[0.813rem] orx-font-semibold text-[var(--orx-text-primary)]">Filtros:</span>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-3 rounded-xl bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] shadow-inner-orx border border-[rgba(99,102,241,0.2)]"
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
              className="px-4 py-3 rounded-xl bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] shadow-inner-orx border border-[rgba(99,102,241,0.2)]"
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
              className="neumorphic-card p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-orx-soft"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex items-center justify-center rounded-2xl w-14 h-14 shadow-orx-medium ${kpi.bgClass}`}>
                  <kpi.icon size={24} color="#ffffff" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mb-1">{kpi.title}</p>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-[0.813rem] orx-font-bold text-[var(--orx-text-primary)] leading-none">{kpi.value}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {kpi.trendUp ? (
                    <TrendingUp size={16} className={kpi.textClass} />
                  ) : (
                    <TrendingDown size={16} className={kpi.textClass} />
                  )}
                  <span className={`text-[0.813rem] orx-font-semibold ${kpi.textClass}`}>{kpi.trend}</span>
                </div>
                <span className="text-[0.813rem] text-[var(--orx-text-secondary)]">{kpi.periodo}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Produtos */}
        <div className="neumorphic-card p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-orx-soft">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl w-12 h-12 shadow-orx-medium bg-gradient-to-br from-[var(--orx-warning)] to-[#D97706]">
                <Package size={24} color="#ffffff" />
              </div>
              <h2 className="text-[0.813rem] orx-font-semibold text-[var(--orx-text-primary)]">Top 4 Produtos OPME</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.1)]">
                  <th
                    className="p-4 text-left text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Produto
                  </th>
                  <th
                    className="p-4 text-center text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Vendas
                  </th>
                  <th
                    className="p-4 text-right text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Receita
                  </th>
                  <th
                    className="p-4 text-center text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Margem
                  </th>
                  <th
                    className="p-4 text-center text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Variação
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProdutos.map((produto, index) => (
                  <tr key={index} className="border-b border-[rgba(99,102,241,0.05)]">
                    <td
                      className="p-4 text-[0.813rem] text-[var(--orx-text-primary)] orx-font-semibold"
                    >
                      {produto.nome}
                    </td>
                    <td
                      className="p-4 text-center text-[0.813rem] text-[var(--orx-text-primary)]"
                    >
                      {produto.vendas}
                    </td>
                    <td
                      className="p-4 text-right text-[0.813rem] text-[var(--orx-text-primary)] orx-font-semibold"
                    >
                      {formatCurrency(produto.receita)}
                    </td>
                    <td
                      className="p-4 text-center text-[0.813rem] text-[var(--orx-success)] orx-font-semibold"
                    >
                      {produto.margem}%
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[0.813rem] orx-font-semibold ${produto.variacaoUp ? 'text-[var(--orx-success)]' : 'text-[var(--orx-error)]'}`}
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
        <div className="neumorphic-card p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-orx-soft">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl w-12 h-12 shadow-orx-medium bg-gradient-to-br from-[var(--orx-primary)] to-[var(--orx-primary-hover)]">
                <Users size={24} color="#ffffff" />
              </div>
              <h2 className="text-[0.813rem] orx-font-semibold text-[var(--orx-text-primary)]">Top 4 Hospitais por Faturamento</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.1)]">
                  <th
                    className="p-4 text-left text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Hospital
                  </th>
                  <th
                    className="p-4 text-center text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Pedidos
                  </th>
                  <th
                    className="p-4 text-right text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Receita
                  </th>
                  <th
                    className="p-4 text-right text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Ticket Médio
                  </th>
                  <th
                    className="p-4 text-center text-[0.813rem] orx-font-semibold text-[var(--orx-text-secondary)]"
                  >
                    Crescimento
                  </th>
                </tr>
              </thead>
              <tbody>
                {topHospitais.map((hospital, index) => (
                  <tr key={index} className="border-b border-[rgba(99,102,241,0.05)]">
                    <td
                      className="p-4 text-[0.813rem] text-[var(--orx-text-primary)] orx-font-semibold"
                    >
                      {hospital.nome}
                    </td>
                    <td
                      className="p-4 text-center text-[0.813rem] text-[var(--orx-text-primary)]"
                    >
                      {hospital.pedidos}
                    </td>
                    <td
                      className="p-4 text-right text-[0.813rem] text-[var(--orx-text-primary)] orx-font-semibold"
                    >
                      {formatCurrency(hospital.receita)}
                    </td>
                    <td
                      className="p-4 text-right text-[0.813rem] text-[var(--orx-text-secondary)]"
                    >
                      {formatCurrency(hospital.ticketMedio)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[0.813rem] orx-font-semibold ${hospital.crescimentoUp ? 'text-[var(--orx-success)]' : 'text-[var(--orx-error)]'}`}
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
    </ModulePage>
  );
}

