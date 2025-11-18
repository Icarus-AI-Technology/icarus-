/**
 * CEO Intelligence Dashboard
 * Sistema: ICARUS v5.0
 * PADRONIZADO: Container, PageHeader, StatsGrid, CategoryTabs, AnimatedCard
 * 
 * Dashboard executivo com feed operacional agregado de todos os agentes de IA.
 * Exibe alertas estratégicos, recomendações priorizadas e métricas consolidadas.
 */

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Activity, RefreshCw, Download, Target } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useDocumentTitle } from '@/hooks';
import { supabase } from '@/lib/supabase';
import { CEOIntelligenceBridge } from '@/services/ceo/CEOIntelligenceBridge';
import {
  Container,
  PageHeader,
  StatsGrid,
  CategoryTabs,
  AnimatedCard,
  Button,
  Badge,
  type StatItem,
  type CategoryItem,
} from '@/components/oraclusx-ds';

interface DashboardMetrics {
  saude_clinica: number;
  saude_operacional: number;
  saude_compras: number;
  saude_logistica: number;
  alertas_criticos: number;
  alertas_altos: number;
  recomendacoes_pendentes: number;
}

interface OperationalEvent {
  id: string;
  agente_origem: string;
  categoria: string;
  titulo: string;
  descricao: string;
  severidade: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  acoes_sugeridas: string[];
}

interface StrategicAlert {
  id: string;
  titulo: string;
  descricao: string;
  severidade: 'low' | 'medium' | 'high' | 'critical';
  categoria: string;
  status: string;
  created_at: string;
  acoes_recomendadas: string[];
}

interface Recommendation {
  id: string;
  area: string;
  prioridade: 'low' | 'medium' | 'high' | 'critical';
  acao: string;
  impacto_esperado: number;
  tipo_impacto: string;
  roi_estimado: number;
  status: string;
  created_at: string;
}

export default function CEOIntelligenceDashboard() {
  useDocumentTitle('CEO Intelligence Dashboard');
  const { addToast } = useToast();

  type DashboardTab = 'feed' | 'alertas' | 'recomendacoes';

  const [activeTab, setActiveTab] = useState<DashboardTab>('feed');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<'24h' | '7d' | '30d'>('24h');

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [alerts, setAlerts] = useState<StrategicAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [feedData, alertsData, recsData, metricsData] = await Promise.all([
        supabase
          .from('ceo_operational_feed')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('ceo_strategic_alerts')
          .select('*')
          .eq('status', 'pendente')
          .order('severidade', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('ceo_recommendations')
          .select('*')
          .eq('status', 'pendente')
          .order('roi_estimado', { ascending: false })
          .limit(20),
        supabase
          .from('ceo_dashboard_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single(),
      ]);

      setEvents(feedData.data || []);
      setAlerts(alertsData.data || []);
      setRecommendations(recsData.data || []);
      setMetrics(metricsData.data?.kpis_gerais || {
        saude_clinica: 0,
        saude_operacional: 0,
        saude_compras: 0,
        saude_logistica: 0,
        alertas_criticos: alertsData.data?.filter(a => a.severidade === 'critical').length || 0,
        alertas_altos: alertsData.data?.filter(a => a.severidade === 'high').length || 0,
        recomendacoes_pendentes: recsData.data?.length || 0
      });

      addToast({
        type: 'success',
        message: 'Dashboard atualizado com sucesso',
        aiSource: 'CEO Intelligence'
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      addToast({
        type: 'error',
        message: 'Erro ao carregar dados do dashboard'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleRefreshMetrics = async () => {
    setRefreshing(true);
    try {
      await CEOIntelligenceBridge.updateCEOMetrics();
      await loadDashboardData();
      addToast({
        type: 'success',
        message: 'Métricas atualizadas com sucesso',
        aiSource: 'CEO Intelligence'
      });
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
      addToast({
        type: 'error',
        message: 'Erro ao atualizar métricas'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const summary = await CEOIntelligenceBridge.getExecutiveSummary();
      const reportData = JSON.stringify(summary, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ceo-intelligence-report-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        message: 'Relatório exportado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      addToast({
        type: 'error',
        message: 'Erro ao exportar relatório'
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const kpis: StatItem[] = [
    {
      title: 'Saúde Clínica',
      value: `${metrics?.saude_clinica || 0}%`,
      trend: '+5%',
      trendUp: true,
      icon: Activity
    },
    {
      title: 'Saúde Operacional',
      value: `${metrics?.saude_operacional || 0}%`,
      trend: '+3%',
      trendUp: true,
      icon: Building2
    },
    {
      title: 'Saúde Compras',
      value: `${metrics?.saude_compras || 0}%`,
      trend: '+7%',
      trendUp: true,
      icon: ShoppingCart
    },
    {
      title: 'Saúde Logística',
      value: `${metrics?.saude_logistica || 0}%`,
      trend: '+2%',
      trendUp: true,
      icon: Truck
    },
    {
      title: 'Alertas Críticos',
      value: metrics?.alertas_criticos || 0,
      trend: '-1',
      trendUp: true,
      icon: AlertTriangle
    },
    {
      title: 'Recomendações',
      value: metrics?.recomendacoes_pendentes || 0,
      trend: '+4',
      trendUp: true,
      icon: Target
    },
  ];

  const categories: CategoryItem[] = [
    { id: 'feed', label: 'Feed Operacional', icon: Activity, count: events.length },
    { id: 'alertas', label: 'Alertas Estratégicos', icon: AlertTriangle, count: alerts.length },
    { id: 'recomendacoes', label: 'Recomendações', icon: Brain, count: recommendations.length },
  ];

  const getSeverityVariant = (severity: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'default';
      default:
        return 'success';
    }
  };

  return (
    <Container maxWidth="7xl" padding="lg" className="min-h-screen orx-animate-fade-in">
      <PageHeader
        title="CEO Intelligence Dashboard"
        description="Dashboard executivo com inteligência agregada de todos os agentes"
        icon={Brain}
        badge={{ label: 'Executive', variant: 'info' }}
        actions={
          <div className="flex gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as '24h' | '7d' | '30d')}
              className="px-3 py-2 border border-[var(--orx-border-muted)] rounded-md bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] orx-transition-all"
            >
              <option value="24h">24 horas</option>
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
            </select>
            <Button
              variant="ghost"
              icon={<RefreshCw size={18} className={refreshing ? 'orx-spin' : ''} />}
              onClick={handleRefreshMetrics}
              disabled={refreshing}
            >
              Atualizar
            </Button>
            <Button
              variant="ghost"
              icon={<Download size={18} />}
              onClick={handleExportReport}
            >
              Exportar
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* StatsGrid com Gradiente Brand */}
        <div className="orx-gradient-brand rounded-2xl p-1">
          <div className="bg-[var(--orx-bg-light)] dark:bg-[var(--orx-bg-dark)] rounded-xl p-6">
            <StatsGrid stats={kpis} columns={6} animated loading={loading} />
          </div>
        </div>

        {/* CategoryTabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeTab}
          onCategoryChange={setActiveTab}
        />

        {/* Feed Operacional */}
        {activeTab === 'feed' && (
          <AnimatedCard
            animation="slideUp"
            hoverEffect="lift"
            className="orx-glass-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl neuro-inset bg-gradient-to-br from-[var(--orx-primary)]/10 to-[var(--orx-primary)]/5">
                <Activity size={24} className="text-[var(--orx-primary)]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--orx-text-primary)]">
                  Feed Operacional
                </h3>
                <p className="text-sm text-[var(--orx-text-secondary)]">
                  Eventos em tempo real de todos os agentes
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {events.slice(0, 10).map((event, index) => (
                <div
                  key={event.id}
                  className="neuro-flat p-4 rounded-lg orx-hover-lift orx-transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityVariant(event.severidade)} size="sm">
                        {event.agente_origem}
                      </Badge>
                      <span className="text-xs text-[var(--orx-text-secondary)]">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Badge variant={getSeverityVariant(event.severidade)} size="sm">
                      {event.severidade}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-[var(--orx-text-primary)] mb-1">
                    {event.titulo}
                  </h4>
                  <p className="text-sm text-[var(--orx-text-secondary)]">
                    {event.descricao}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}

        {/* Alertas Estratégicos */}
        {activeTab === 'alertas' && (
          <AnimatedCard
            animation="slideUp"
            hoverEffect="lift"
            className="orx-glass-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl neuro-inset bg-gradient-to-br from-[var(--orx-warning)]/10 to-[var(--orx-warning)]/5">
                <AlertTriangle size={24} className="text-[var(--orx-warning)]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--orx-text-primary)]">
                  Alertas Estratégicos
                </h3>
                <p className="text-sm text-[var(--orx-text-secondary)]">
                  {alerts.length} alertas pendentes
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="neuro-flat p-4 rounded-lg orx-hover-lift orx-transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={getSeverityVariant(alert.severidade)} size="sm">
                      {alert.categoria}
                    </Badge>
                    <span className="text-xs text-[var(--orx-text-secondary)]">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-[var(--orx-text-primary)] mb-1">
                    {alert.titulo}
                  </h4>
                  <p className="text-sm text-[var(--orx-text-secondary)]">
                    {alert.descricao}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}

        {/* Recomendações */}
        {activeTab === 'recomendacoes' && (
          <AnimatedCard
            animation="slideUp"
            hoverEffect="lift"
            className="orx-glass-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl neuro-inset bg-gradient-to-br from-[var(--orx-success)]/10 to-[var(--orx-success)]/5">
                <Target size={24} className="text-[var(--orx-success)]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--orx-text-primary)]">
                  Recomendações Estratégicas
                </h3>
                <p className="text-sm text-[var(--orx-text-secondary)]">
                  Ações priorizadas por ROI estimado
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="neuro-flat p-4 rounded-lg orx-hover-lift orx-transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="sm">
                        {rec.area}
                      </Badge>
                      <Badge variant={getSeverityVariant(rec.prioridade)} size="sm">
                        {rec.prioridade}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-[var(--orx-success)]">
                      ROI: {rec.roi_estimado}%
                    </span>
                  </div>
                  <h4 className="font-semibold text-[var(--orx-text-primary)] mb-1">
                    {rec.acao}
                  </h4>
                  <p className="text-sm text-[var(--orx-text-secondary)]">
                    Impacto: {rec.tipo_impacto} (+{rec.impacto_esperado}%)
                  </p>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}
      </div>
    </Container>
  );
}
