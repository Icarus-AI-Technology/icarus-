/**
 * Dashboard Principal - ICARUS v5.0
 * Módulo: 01 - Core Business
 * 
 * Visão consolidada de todos os KPIs críticos do negócio OPME
 * 100% conformidade com OraclusX Design System
 */

import { useState, useEffect, type KeyboardEvent, type ReactNode } from "react";
import { DollarSign, Stethoscope, AlertTriangle, Package, Calendar, RefreshCw, Download, Settings, Maximize2, Home, TrendingUp } from 'lucide-react';
import {
  Container,
  Section,
  PageHeader,
  StatsGrid,
  AnimatedCard,
  Card,
  Button,
  IconButtonNeu,
  NavigationBar
} from "@/components/oraclusx-ds";
import { OrxBarChart } from "../components/charts/OrxBarChart";
import { OrxLineChart } from "../components/charts/OrxLineChart";
import { OrxPieChart } from "../components/charts/OrxPieChart";
import type { AISuggestion } from "../components/shared/AITutor";
import { AIOrchestrator } from "../services/ai/AIOrchestrator";

const STATIC_KPIS = {
  cirurgiasHoje: 12,
  cirurgiasMes: 147,
  faturamentoMes: "R$ 2.847.500",
  ticketMedio: "R$ 19.372",
  estoqueBaixo: 23,
  contasReceber: "R$ 1.234.000",
  taxaInadimplencia: "2.3",
  margemLucro: "18.5"
} as const;

/**
 * Dashboard Principal Component
 */
export default function DashboardPrincipal() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const currentPeriod = 'Hoje';
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  // Dados mockados para demonstração
  const kpis = STATIC_KPIS;

  const suggestionPriorityLabels: Record<AISuggestion['priority'], string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica'
  };

  const suggestionPriorityClasses: Record<AISuggestion['priority'], string> = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };

  // Carregar sugestões da IA ao montar o componente
  useEffect(() => {
    const loadAISuggestions = async () => {
      try {
        const suggestions = await AIOrchestrator.getContextualSuggestions('dashboard', {
          moduleName: 'Dashboard Principal',
          kpis: {
            faturamento_meta: 88, // 88% da meta
            estoque_critico: kpis.estoqueBaixo,
          }
        });
        setAiSuggestions(suggestions);
      } catch (error) {
        console.error('Erro ao carregar sugestões da IA:', error);
      }
    };

    loadAISuggestions();
  }, [kpis.estoqueBaixo]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExportPDF = () => {
    alert('Exportar PDF - Em desenvolvimento');
  };

  const handleFullScreen = () => {
    document.documentElement.requestFullscreen();
  };

  // Sub-navegação do Dashboard
  const tabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: <Calendar size={16} /> },
    { id: 'cirurgias-hoje', label: 'Cirurgias do Dia', icon: <Stethoscope size={16} /> },
    { id: 'estoque-critico', label: 'Estoque Crítico', icon: <Package size={16} /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={16} /> },
    { id: 'alertas', label: 'Alertas', icon: <AlertTriangle size={16} /> }
  ];

  return (
    <Container maxWidth="7xl" padding="lg">
      <Section spacing="lg">
        {/* Header do Módulo */}
        <PageHeader
          title="Dashboard Principal"
          description="Visão consolidada em tempo real dos KPIs críticos do negócio"
          icon={Home}
          badge={{ label: "Realtime", variant: "success" }}
          actions={
            <>
              <Button
                variant="secondary"
                icon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />}
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
              <Button
                variant="secondary"
                icon={<Calendar size={18} />}
              >
                {currentPeriod}
              </Button>
              <IconButtonNeu
                icon={Download}
                onClick={handleExportPDF}
                aria-label="Exportar PDF"
              />
              <IconButtonNeu
                icon={Settings}
                aria-label="Configurar"
              />
              <IconButtonNeu
                icon={Maximize2}
                onClick={handleFullScreen}
                aria-label="Tela Cheia"
              />
            </>
          }
        />

        {aiSuggestions.length > 0 && (
          <div className="grid gap-[var(--orx-spacing-md)] md:grid-cols-3">
            {aiSuggestions.slice(0, 3).map((suggestion, index) => (
              <AnimatedCard
                key={suggestion.id}
                animation="slide"
                delay={index * 50}
                hoverLift
                className="border border-[var(--orx-border-muted)]"
                padding="lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--orx-text-secondary)]">
                      {suggestion.type}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[var(--orx-text-primary)]">
                      {suggestion.title}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${suggestionPriorityClasses[suggestion.priority]}`}
                  >
                    {suggestionPriorityLabels[suggestion.priority]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--orx-text-secondary)]">
                  {suggestion.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--orx-text-secondary)]">
                  <span>Confiança: {Math.round(suggestion.confidence)}%</span>
                  {suggestion.action && (
                    <button
                      type="button"
                      onClick={suggestion.action.handler}
                      className="text-[var(--orx-primary)] hover:underline"
                    >
                      {suggestion.action.label}
                    </button>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Sub-navegação */}
        <NavigationBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'visao-geral' && (
          <>
            {/* Grid de KPIs - Usando StatsGrid */}
            <StatsGrid
              columns={4}
              animated
              stats={[
                {
                  label: "Cirurgias Hoje",
                  value: kpis.cirurgiasHoje,
                  icon: Stethoscope,
                  colorScheme: "pink",
                  trend: { value: 8.5, label: 'vs. média' }
                },
                {
                  label: "Cirurgias do Mês",
                  value: kpis.cirurgiasMes,
                  icon: Calendar,
                  colorScheme: "pink",
                  trend: { value: 12.3, label: 'vs. mês anterior' }
                },
                {
                  label: "Faturamento do Mês",
                  value: kpis.faturamentoMes,
                  icon: DollarSign,
                  colorScheme: "emerald",
                  trend: { value: 15.7, label: 'vs. mês anterior' }
                },
                {
                  label: "Ticket Médio",
                  value: kpis.ticketMedio,
                  icon: TrendingUp,
                  colorScheme: "emerald",
                  trend: { value: 4.2, label: 'vs. mês anterior' }
                },
                {
                  label: "Estoque Baixo",
                  value: kpis.estoqueBaixo,
                  icon: Package,
                  colorScheme: "blue",
                  trend: { value: -3.1, label: 'vs. semana anterior' }
                },
                {
                  label: "Contas a Receber",
                  value: kpis.contasReceber,
                  icon: DollarSign,
                  colorScheme: "yellow",
                  trend: { value: 0, label: 'estável' }
                },
                {
                  label: "Taxa Inadimplência",
                  value: `${kpis.taxaInadimplencia}%`,
                  icon: AlertTriangle,
                  colorScheme: "red",
                  trend: { value: -0.5, label: 'vs. mês anterior' }
                },
                {
                  label: "Margem de Lucro",
                  value: `${kpis.margemLucro}%`,
                  icon: TrendingUp,
                  colorScheme: "emerald",
                  trend: { value: 2.1, label: 'vs. mês anterior' }
                }
              ]}
            />

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--orx-spacing-lg)] mt-[var(--orx-spacing-lg)]">
              <Card title="Faturamento Mensal" padding="lg">
                <OrxBarChart
                  data={[
                    { mes: 'Jan', faturamento: 2400000 },
                    { mes: 'Fev', faturamento: 2100000 },
                    { mes: 'Mar', faturamento: 2800000 },
                    { mes: 'Abr', faturamento: 2600000 },
                    { mes: 'Mai', faturamento: 2847500 },
                  ]}
                  keys={['faturamento']}
                  indexBy="mes"
                />
              </Card>

              <Card title="Evolução de Cirurgias" padding="lg">
                <OrxLineChart
                  data={[
                    {
                      id: 'Cirurgias',
                      data: [
                        { x: 'Jan', y: 135 },
                        { x: 'Fev', y: 128 },
                        { x: 'Mar', y: 152 },
                        { x: 'Abr', y: 143 },
                        { x: 'Mai', y: 147 },
                      ]
                    }
                  ]}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--orx-spacing-lg)]">
              <Card title="Distribuição por Especialidade" padding="lg">
                <OrxPieChart
                  data={[
                    { id: 'Ortopedia', label: 'Ortopedia', value: 35 },
                    { id: 'Cardiologia', label: 'Cardiologia', value: 25 },
                    { id: 'Neurologia', label: 'Neurologia', value: 20 },
                    { id: 'Outras', label: 'Outras', value: 20 },
                  ]}
                />
              </Card>

              <Card title="Status de Estoque" padding="lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Produtos em Estoque Alto</span>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--orx-success-dark)' }}
                    >
                      234
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Produtos em Estoque Médio</span>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--orx-warning-dark)' }}
                    >
                      87
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Produtos em Estoque Baixo</span>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--orx-error-dark)' }}
                    >
                      23
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Produtos em Falta</span>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--orx-error-dark)' }}
                    >
                      5
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'cirurgias-hoje' && (
          <Card title="Cirurgias Agendadas para Hoje" padding="lg">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{
                    background: 'hsl(var(--surface))',
                    boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--orx-primary)'
                      }}
                    >
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <p className="font-semibold">Cirurgia #{i}</p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--orx-text-secondary)' }}
                      >
                        Dr. João Silva - Hospital ABC
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{8 + i}:00</p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--orx-text-secondary)' }}
                    >
                      Ortopedia
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'estoque-critico' && (
          <Card title="Produtos com Estoque Crítico" padding="lg">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{
                    background: 'hsl(var(--surface))',
                    boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)'
                  }}
                >
                  <div>
                    <p className="font-semibold">Produto OPME #{i}</p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--orx-text-secondary)' }}
                    >
                      Código: OPME-{1000 + i}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-bold"
                      style={{ color: 'var(--orx-error-dark)' }}
                    >
                      {5 - i} unidades
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--orx-text-secondary)' }}
                    >
                      Mínimo: 10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'financeiro' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Contas a Receber" padding="lg">
              <div className="text-center">
                <p
                  className="text-4xl font-bold"
                  style={{ color: 'var(--orx-primary)' }}
                >
                  R$ 1.234.000
                </p>
                <p className="text-sm text-[var(--orx-text-secondary)] mt-2">Em aberto</p>
              </div>
            </Card>
            <Card title="Contas a Pagar" padding="lg">
              <div className="text-center">
                <p
                  className="text-4xl font-bold"
                  style={{ color: 'var(--orx-primary)' }}
                >
                  R$ 876.500
                </p>
                <p className="text-sm text-[var(--orx-text-secondary)] mt-2">A vencer</p>
              </div>
            </Card>
            <Card title="Saldo Disponível" padding="lg">
              <div className="text-center">
                <p
                  className="text-4xl font-bold"
                  style={{ color: 'var(--orx-success)' }}
                >
                  R$ 456.200
                </p>
                <p className="text-sm text-[var(--orx-text-secondary)] mt-2">Líquido</p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'alertas' && (
          <Card title="Alertas Prioritários" padding="lg">
            <div className="space-y-3">
              <div
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{
                  background: 'var(--orx-error-light)',
                  boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)'
                }}
              >
                <AlertTriangle size={24} className="flex-shrink-0" style={{ color: 'var(--orx-error)' }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--orx-error-dark)' }}>Estoque Crítico</p>
                  <p className="text-sm" style={{ color: 'var(--orx-text-secondary)' }}>5 produtos em falta, 18 abaixo do mínimo</p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{
                  background: 'var(--orx-warning-light)',
                  boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)'
                }}
              >
                <AlertTriangle size={24} className="flex-shrink-0" style={{ color: 'var(--orx-warning)' }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--orx-warning-dark)' }}>Contas Vencidas</p>
                  <p className="text-sm" style={{ color: 'var(--orx-text-secondary)' }}>3 contas a receber vencidas há mais de 30 dias</p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{
                  background: 'var(--orx-info-light)',
                  boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)'
                }}
              >
                <AlertTriangle size={24} className="flex-shrink-0" style={{ color: 'var(--orx-info)' }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--orx-info-dark)' }}>Certificações</p>
                  <p className="text-sm" style={{ color: 'var(--orx-text-secondary)' }}>2 certificações ANVISA vencem em 15 dias</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </Section>
    </Container>
  );
}
