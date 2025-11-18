/**
 * Componente: KPI Dashboard Consolidado
 * 
 * Visão 360° em tempo real de todos os KPIs da distribuidora OPME
 * Com alertas inteligentes e comparação com metas
 */

import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Progress,
} from '@/components/oraclusx-ds';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Activity,
  DollarSign,
  Package,
  ShieldCheck,
  RefreshCw,
  Bell,
  Settings,
  BarChart2,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';

interface KPI {
  kpi_id: string;
  nome: string;
  descricao: string;
  categoria: string;
  valor_meta: number;
  unidade: string;
  periodo: string;
  valor_atual: number;
  atingimento_percentual: number;
  status: 'critico' | 'alerta' | 'ok' | 'excelente';
  tendencia: 'crescimento' | 'estavel' | 'queda' | 'novo';
  variacao_percentual: number;
  ultima_atualizacao: string;
  alertas_ativos: number;
}

interface Alerta {
  id: string;
  kpi_nome: string;
  severidade: string;
  tipo: string;
  mensagem: string;
  acao_recomendada: string;
  created_at: string;
}

const CATEGORIA_ICONS: Record<string, typeof DollarSign | typeof BarChart2 | typeof Package | typeof ShieldCheck> = {
  vendas: DollarSign,
  financeiro: BarChart2,
  operacoes: Package,
  compliance: ShieldCheck,
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 | typeof AlertTriangle | typeof XCircle }> = {
  excelente: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-white', icon: CheckCircle2 },
  ok: { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', text: 'text-white', icon: CheckCircle2 },
  alerta: { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', text: 'text-white', icon: AlertTriangle },
  critico: { bg: 'bg-gradient-to-br from-red-500 to-red-600', text: 'text-white', icon: XCircle },
};

export default function KPIDashboardConsolidado() {
  useDocumentTitle('KPI Dashboard Consolidado');
  const { addToast } = useToast();

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    carregarDados();
    setupRealtime();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
    // setup and cleanup run once on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupRealtime = () => {
    const channel = supabase
      .channel('kpi-dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kpi_valores_historico',
        },
        () => {
          console.log('[Realtime] KPI atualizado');
          carregarDados();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kpi_alertas',
        },
        (payload) => {
          console.log('[Realtime] Novo alerta criado:', payload);
          carregarAlertas();
          addToast('Novo alerta de KPI criado!', 'warning');
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      await Promise.all([carregarKPIs(), carregarAlertas()]);
    } catch (error: unknown) {
      const err = error as Error;
      addToast(`Erro ao carregar dados: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarKPIs = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_kpi_dashboard_resumo')
        .select('*')
        .order('categoria');

      if (error) throw error;

      setKpis(data || []);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error as Error);
      // Mock data para demonstração
      setKpis([
        {
          kpi_id: '1',
          nome: 'faturamento_mensal',
          descricao: 'Faturamento total do mês',
          categoria: 'vendas',
          valor_meta: 2000000,
          unidade: 'BRL',
          periodo: 'mensal',
          valor_atual: 2150000,
          atingimento_percentual: 107.5,
          status: 'excelente',
          tendencia: 'crescimento',
          variacao_percentual: 8.3,
          ultima_atualizacao: new Date().toISOString(),
          alertas_ativos: 0,
        },
        {
          kpi_id: '2',
          nome: 'margem_percentual',
          descricao: 'Margem bruta percentual',
          categoria: 'vendas',
          valor_meta: 25,
          unidade: 'percentage',
          periodo: 'mensal',
          valor_atual: 26.5,
          atingimento_percentual: 106,
          status: 'excelente',
          tendencia: 'crescimento',
          variacao_percentual: 2.1,
          ultima_atualizacao: new Date().toISOString(),
          alertas_ativos: 0,
        },
        {
          kpi_id: '3',
          nome: 'contas_receber_vencidas',
          descricao: 'Contas a receber vencidas',
          categoria: 'financeiro',
          valor_meta: 0,
          unidade: 'BRL',
          periodo: 'mensal',
          valor_atual: 280000,
          atingimento_percentual: 0,
          status: 'alerta',
          tendencia: 'crescimento',
          variacao_percentual: 15.2,
          ultima_atualizacao: new Date().toISOString(),
          alertas_ativos: 1,
        },
        {
          kpi_id: '4',
          nome: 'prazo_entrega_medio',
          descricao: 'Prazo médio de entrega',
          categoria: 'operacoes',
          valor_meta: 2,
          unidade: 'days',
          periodo: 'mensal',
          valor_atual: 1.8,
          atingimento_percentual: 110,
          status: 'excelente',
          tendencia: 'estavel',
          variacao_percentual: -0.5,
          ultima_atualizacao: new Date().toISOString(),
          alertas_ativos: 0,
        },
        {
          kpi_id: '5',
          nome: 'taxa_conformidade_anvisa',
          descricao: 'Taxa de conformidade ANVISA',
          categoria: 'compliance',
          valor_meta: 100,
          unidade: 'percentage',
          periodo: 'mensal',
          valor_atual: 98.5,
          atingimento_percentual: 98.5,
          status: 'ok',
          tendencia: 'estavel',
          variacao_percentual: 0,
          ultima_atualizacao: new Date().toISOString(),
          alertas_ativos: 0,
        },
        {
          kpi_id: '6',
          nome: 'inadimplencia_percentual',
          descricao: 'Taxa de inadimplência',
          categoria: 'financeiro',
          valor_meta: 3,
          unidade: 'percentage',
          periodo: 'mensal',
          valor_atual: 6.2,
          atingimento_percentual: 48.4,
          status: 'critico',
          tendencia: 'crescimento',
          variacao_percentual: 28.5,
          ultima_atualizacao: new Date().toISOString(),
          alertas_ativos: 2,
        },
      ]);
    }
  };

  const carregarAlertas = async () => {
    try {
      const { data, error } = await supabase
        .from('kpi_alertas')
        .select(`
          id,
          severidade,
          tipo,
          mensagem,
          acao_recomendada,
          created_at,
          kpi_metas (nome)
        `)
        .eq('is_resolvido', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setAlertas(
        (data || []).map((a: { id: string; severidade: string; tipo: string; mensagem: string; acao_recomendada: string; created_at: string; kpi_metas?: { nome?: string } }) => ({
          id: a.id,
          severidade: a.severidade,
          tipo: a.tipo,
          mensagem: a.mensagem,
          acao_recomendada: a.acao_recomendada,
          created_at: a.created_at,
          kpi_nome: a.kpi_metas?.nome || 'N/A',
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar alertas:', error as Error);
      // Mock data
      setAlertas([
        {
          id: '1',
          kpi_nome: 'inadimplencia_percentual',
          severidade: 'critico',
          tipo: 'meta_nao_atingida',
          mensagem: 'Taxa de inadimplência está em 6.2% (crítico)',
          acao_recomendada: 'Acionar equipe de cobrança e revisar política de crédito',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          kpi_nome: 'contas_receber_vencidas',
          severidade: 'alto',
          tipo: 'tendencia_negativa',
          mensagem: 'Contas vencidas cresceram 15% no último mês',
          acao_recomendada: 'Intensificar ações de cobrança',
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleRecalcularKPIs = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('calcular_todos_kpis_mes');
      if (error) throw error;

      addToast('KPIs recalculados com sucesso!', 'success');
      carregarDados();
    } catch (error: unknown) {
      addToast(`Erro ao recalcular: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolverAlerta = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('kpi_alertas')
        .update({
          is_resolvido: true,
          resolvido_em: new Date().toISOString(),
          resolvido_por: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', alertaId);

      if (error) throw error;

      addToast('Alerta resolvido!', 'success');
      carregarAlertas();
    } catch (error: unknown) {
      addToast(`Erro ao resolver alerta: ${error.message}`, 'error');
    }
  };

  const formatarValor = (valor: number, unidade: string) => {
    switch (unidade) {
      case 'BRL':
        return formatCurrency(valor);
      case 'percentage':
        return formatPercent(valor);
      case 'days':
        return `${valor.toFixed(1)} dias`;
      case 'number':
        return formatNumber(valor);
      default:
        return valor.toString();
    }
  };

  const kpisFiltrados = categoriaFiltro
    ? kpis.filter((k) => k.categoria === categoriaFiltro)
    : kpis;

  const estatisticasPorCategoria = Array.from(
    new Set(kpis.map((k) => k.categoria))
  ).map((cat) => {
    const kpisCategoria = kpis.filter((k) => k.categoria === cat);
    return {
      categoria: cat,
      total: kpisCategoria.length,
      excelentes: kpisCategoria.filter((k) => k.status === 'excelente').length,
      ok: kpisCategoria.filter((k) => k.status === 'ok').length,
      alerta: kpisCategoria.filter((k) => k.status === 'alerta').length,
      criticos: kpisCategoria.filter((k) => k.status === 'critico').length,
    };
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2 flex items-center gap-3">
              KPI Dashboard Consolidado
              <Badge variant="default" className="bg-success/20 text-success animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </h1>
            <p className="text-[var(--text-secondary)]">
              Visão 360° em tempo real - Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={<Bell />}>
              Alertas ({alertas.length})
            </Button>
            <Button variant="secondary" icon={<Settings />}>
              Configurar
            </Button>
            <Button icon={<RefreshCw />} onClick={handleRecalcularKPIs} disabled={loading}>
              Recalcular
            </Button>
          </div>
        </div>

        {/* Alertas Críticos */}
        {alertas.filter((a) => a.severidade === 'critico').length > 0 && (
          <Card className="p-4 neuro-inset bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-red-700 dark:text-red-300 orx-font-semibold">
                {alertas.filter((a) => a.severidade === 'critico').length} Alertas Críticos
              </h3>
            </div>
            <div className="space-y-2">
              {alertas
                .filter((a) => a.severidade === 'critico')
                .map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-start justify-between p-3 bg-red-100 dark:bg-red-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-[0.813rem] orx-font-medium">{alerta.mensagem}</p>
                      <p className="text-[var(--text-secondary)] mt-1 text-[0.813rem]">
                        💡 {alerta.acao_recomendada}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleResolverAlerta(alerta.id)}>
                      Resolver
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Resumo por Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {estatisticasPorCategoria.map((est) => {
            const Icon = CATEGORIA_ICONS[est.categoria] || Target;
            const totalOk = est.excelentes + est.ok;
            const totalProblemas = est.alerta + est.criticos;

            return (
              <Card
                key={est.categoria}
                className={`p-4 neuro-raised cursor-pointer transition-all hover:scale-105 ${
                  categoriaFiltro === est.categoria ? 'ring-2 ring-[var(--primary)]' : ''
                }`}
                onClick={() =>
                  setCategoriaFiltro(categoriaFiltro === est.categoria ? null : est.categoria)
                }
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-[var(--primary)]" />
                    <h3 className="capitalize orx-font-semibold">{est.categoria}</h3>
                  </div>
                  <Badge variant="default">{est.total} KPIs</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[0.813rem]">
                    <span className="text-success">✓ Saudáveis</span>
                    <span className="orx-font-semibold">{totalOk}</span>
                  </div>
                  {totalProblemas > 0 && (
                    <div className="flex items-center justify-between text-[0.813rem]">
                      <span className="text-error">⚠ Problemas</span>
                      <span className="orx-font-semibold">{totalProblemas}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Grid de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpisFiltrados.map((kpi) => {
            const statusConfig = STATUS_COLORS[kpi.status];
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={kpi.kpi_id}
                className={`p-6 neuro-raised flex flex-col justify-between h-[220px] ${statusConfig.bg} ${statusConfig.text}`}
              >
                <div>
                    <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="opacity-90 mb-1 text-[0.813rem] orx-font-medium">{kpi.descricao}</h3>
                      <Badge variant="default" className="bg-white/20 text-white text-[0.813rem]">
                        {kpi.categoria}
                      </Badge>
                    </div>
                    <StatusIcon className="w-6 h-6 opacity-90" />
                  </div>
                  <div className="mb-2 text-[0.813rem] orx-font-bold">
                    {formatarValor(kpi.valor_atual, kpi.unidade)}
                  </div>
                  <div className="opacity-80 text-[0.813rem]">
                    Meta: {formatarValor(kpi.valor_meta, kpi.unidade)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between opacity-90 text-[0.813rem]">
                    <span>Atingimento</span>
                    <span className="orx-font-semibold">{kpi.atingimento_percentual.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(kpi.atingimento_percentual, 100)} />
                  <div className="flex items-center gap-2 opacity-80 text-[0.813rem]">
                    {kpi.tendencia === 'crescimento' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : kpi.tendencia === 'queda' ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    <span>
                      {kpi.variacao_percentual > 0 ? '+' : ''}
                      {kpi.variacao_percentual.toFixed(1)}% vs anterior
                    </span>
                    {kpi.alertas_ativos > 0 && (
                      <Badge variant="default" className="bg-white/20 text-white ml-auto">
                        <Bell className="w-3 h-3 mr-1" />
                        {kpi.alertas_ativos}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Lista de Alertas */}
        {alertas.length > 0 && (
          <Card className="p-6 neuro-raised">
            <h3 className="mb-4 flex items-center gap-2 text-[0.813rem] orx-font-semibold">
              <Bell className="w-5 h-5 text-[var(--primary)]" />
              Alertas Ativos ({alertas.length})
            </h3>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div key={alerta.id} className="p-4 neuro-flat rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="default"
                          className={`${
                            alerta.severidade === 'critico'
                              ? 'bg-error/20 text-error'
                              : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {alerta.severidade}
                        </Badge>
                        <span className="text-[0.813rem] orx-font-medium">{alerta.kpi_nome}</span>
                      </div>
                      <p className="mb-2 text-[0.813rem]">{alerta.mensagem}</p>
                      <p className="text-[var(--text-secondary)] text-[0.813rem]">
                        💡 {alerta.acao_recomendada}
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => handleResolverAlerta(alerta.id)}>
                      Resolver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

