/**
 * Componente: API Gateway Dashboard
 * 
 * Monitoramento e gerenciamento de integrações externas
 * Rate limiting, circuit breaker, cache e health checks
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Progress,
} from '@/components/oraclusx-ds';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Server,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Database,
  GitBranch,
  Power,
  Activity,
  Clock,
  RefreshCw,
  Download,
  Gauge,
  Eye,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { APIGatewayService } from '@/lib/services/APIGatewayService';
import { formatNumber, formatPercent } from '@/lib/utils';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { OrxBarChart } from '@/components/charts/OrxBarChart';

interface APIMetric {
  endpoint_id: string;
  endpoint_nome: string;
  servico: string;
  criticidade: string;
  total_requests: number;
  success_count: number;
  error_count: number;
  avg_response_time_ms: number;
  max_response_time_ms: number;
  cache_hits: number;
  cache_hit_rate_percent: number;
  circuit_breaker_state: string;
  circuit_breaker_failures: number;
  active_alerts: number;
}

interface APIAlert {
  id: string;
  endpoint_nome: string;
  tipo: string;
  severidade: string;
  mensagem: string;
  created_at: string;
  is_resolved: boolean;
}

export function APIGatewayDashboard() {
  useDocumentTitle('API Gateway - Monitoramento');
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'alerts' | 'performance'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<APIMetric[]>([]);
  const [alerts, setAlerts] = useState<APIAlert[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsData, alertsData] = await Promise.all([
        APIGatewayService.getMetrics(),
        APIGatewayService.getActiveAlerts(),
      ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
    } catch (error) {
      const err = error as Error;
      console.error('[API_GATEWAY] Erro ao carregar métricas', err);
      addToast(`Erro ao carregar dados: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(carregarDados, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh, carregarDados]);

  const handleResolverAlerta = useCallback(async (alertId: string) => {
    const result = await APIGatewayService.resolveAlert(alertId);
    if (result.success) {
      addToast('Alerta resolvido com sucesso!', 'success');
      carregarDados();
    } else {
      addToast('Erro ao resolver alerta', 'error');
    }
  }, [addToast, carregarDados]);

  const handleResetCircuitBreaker = useCallback(async (endpointId: string) => {
    if (!confirm('Tem certeza que deseja resetar o circuit breaker deste endpoint?')) return;

    const result = await APIGatewayService.resetCircuitBreaker(endpointId);
    if (result.success) {
      addToast('Circuit breaker resetado!', 'success');
      carregarDados();
    } else {
      addToast('Erro ao resetar circuit breaker', 'error');
    }
  }, [addToast, carregarDados]);

  const handleLimparCache = useCallback(async () => {
    if (!confirm('Tem certeza que deseja limpar o cache expirado?')) return;

    const deleted = await APIGatewayService.cleanupCache();
    addToast(`${deleted} entradas de cache removidas`, 'success');
  }, [addToast]);

  // Calcular estatísticas gerais
  const totalRequests = metrics.reduce((sum, m) => sum + m.total_requests, 0);
  const totalSuccess = metrics.reduce((sum, m) => sum + m.success_count, 0);
  const avgResponseTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.avg_response_time_ms, 0) / metrics.length
    : 0;
  const totalCacheHits = metrics.reduce((sum, m) => sum + m.cache_hits, 0);
  const avgCacheHitRate = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.cache_hit_rate_percent || 0), 0) / metrics.length
    : 0;
  const successRate = totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0;

  const endpointsDown = metrics.filter(m => m.circuit_breaker_state === 'open').length;
  const endpointsHealthy = metrics.filter(m => m.circuit_breaker_state === 'closed').length;
  const endpointsWarning = metrics.filter(m => m.circuit_breaker_state === 'half_open').length;

  const criticalAlerts = alerts.filter(a => a.severidade === 'critica' && !a.is_resolved).length;
  const highAlerts = alerts.filter(a => a.severidade === 'alta' && !a.is_resolved).length;

  const kpis = [
    {
      title: 'Requisições Totais',
      value: formatNumber(totalRequests),
      icon: Activity,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'Taxa de Sucesso',
      value: formatPercent(successRate),
      icon: successRate >= 95 ? CheckCircle : AlertTriangle,
      color: successRate >= 95 ? 'green' : 'orange',
      trend: successRate >= 95 ? '+2%' : '-1%',
    },
    {
      title: 'Tempo Médio',
      value: `${Math.round(avgResponseTime)}ms`,
      icon: Clock,
      color: avgResponseTime < 500 ? 'green' : avgResponseTime < 1000 ? 'orange' : 'red',
      trend: avgResponseTime < 500 ? 'Ótimo' : 'Atenção',
    },
    {
      title: 'Cache Hit Rate',
      value: formatPercent(avgCacheHitRate),
      icon: Database,
      color: 'indigo',
      trend: `${formatNumber(totalCacheHits)} hits`,
    },
    {
      title: 'Endpoints Saudáveis',
      value: `${endpointsHealthy}/${metrics.length}`,
      icon: Server,
      color: endpointsDown > 0 ? 'red' : 'green',
      trend: endpointsDown > 0 ? `${endpointsDown} down` : 'Todos OK',
    },
    {
      title: 'Alertas Ativos',
      value: alerts.filter(a => !a.is_resolved).length,
      icon: AlertTriangle,
      color: criticalAlerts > 0 ? 'red' : highAlerts > 0 ? 'orange' : 'green',
      trend: criticalAlerts > 0 ? `${criticalAlerts} críticos` : 'Normal',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <span className="animate-spin">⏳</span>
            <span>Carregando métricas...</span>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4 sm:grid-cols-2">
            {kpis.map((kpi) => (
              <Card
                key={kpi.title}
                className={`p-6 neuro-raised flex flex-col justify-between h-[160px] ${
                  kpi.color === 'blue'
                    ? 'bg-[var(--orx-primary)] text-white'
                    : kpi.color === 'green'
                    ? 'bg-emerald-600 text-white'
                    : kpi.color === 'orange'
                    ? 'bg-orange-500 text-white'
                    : kpi.color === 'red'
                    ? 'bg-red-600 text-white'
                    : kpi.color === 'indigo'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-surface-light dark:bg-surface-dark text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="opacity-80 text-[0.813rem] font-medium">{kpi.title}</h3>
                  <kpi.icon className="w-5 h-5 opacity-80" />
                </div>
                <div className="mt-4 text-[0.813rem] font-bold">{kpi.value}</div>
                {kpi.trend && <p className="opacity-70 mt-2 text-[0.813rem]">{kpi.trend}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alertas Críticos */}
      {alerts.filter((alert) => !alert.is_resolved && alert.severidade === 'critica').length > 0 && (
        <Card className="p-4 neuro-inset bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-medium">Alertas Críticos</h4>
          </div>
          <div className="mt-3 space-y-2">
            {alerts
              .filter((alert) => !alert.is_resolved && alert.severidade === 'critica')
              .slice(0, 3)
              .map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                  <span className="text-[0.813rem]">{`${alert.endpoint_nome}: ${alert.mensagem}`}</span>
                  <Button size="sm" onClick={() => handleResolverAlerta(alert.id)}>
                    Resolver
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Gráfico de Sucesso vs Erros */}
      <Card className="p-6 neuro-raised">
        <h3 className="mb-4 text-[0.813rem] font-semibold">Performance por Endpoint</h3>
        <OrxBarChart
          data={metrics.slice(0, 10).map(m => ({ name: m.endpoint_nome, sucesso: m.success_count, erro: m.error_count }))}
          keys={["sucesso", "erro"]}
          indexBy="name"
          height={300}
          colors={["var(--orx-success)", "var(--orx-error)"]}
          groupMode="grouped"
        />
      </Card>
    </div>
  );

  const renderEndpoints = () => (
    <div className="space-y-6">
      <Card className="neuro-raised p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Requisições</TableHead>
              <TableHead>Sucesso</TableHead>
              <TableHead>Tempo Médio</TableHead>
              <TableHead>Cache</TableHead>
              <TableHead>Circuit Breaker</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.endpoint_id}>
                <TableCell className="font-medium">{metric.endpoint_nome}</TableCell>
                <TableCell>
                  <Badge variant="default">{metric.servico}</Badge>
                </TableCell>
                <TableCell>{formatNumber(metric.total_requests)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {formatPercent(
                      metric.total_requests > 0
                        ? (metric.success_count / metric.total_requests) * 100
                        : 0
                    )}
                    {metric.success_count / metric.total_requests >= 0.95 ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={`${
                      metric.avg_response_time_ms < 500
                        ? 'bg-success/20 text-success'
                        : metric.avg_response_time_ms < 1000
                        ? 'bg-warning/20 text-warning'
                        : 'bg-error/20 text-error'
                    }`}
                  >
                    {Math.round(metric.avg_response_time_ms)}ms
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatPercent(metric.cache_hit_rate_percent || 0)}
                  <span className="text-[var(--text-secondary)] ml-1 text-[0.813rem]">
                    ({metric.cache_hits})
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={`${
                      metric.circuit_breaker_state === 'closed'
                        ? 'bg-success/20 text-success'
                        : metric.circuit_breaker_state === 'open'
                        ? 'bg-error/20 text-error'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {metric.circuit_breaker_state === 'closed'
                      ? 'Fechado'
                      : metric.circuit_breaker_state === 'open'
                      ? 'Aberto'
                      : 'Meio-Aberto'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" icon={Eye} />
                        </TooltipTrigger>
                        <TooltipContent>Ver Detalhes</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {metric.circuit_breaker_state === 'open' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Power className="text-warning" />}
                              onClick={() => handleResetCircuitBreaker(metric.endpoint_id)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Resetar Circuit Breaker</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[0.813rem] font-semibold">Alertas Ativos ({alerts.filter((alert) => !alert.is_resolved).length})</h2>
        <Button variant="secondary" icon={RefreshCw} onClick={carregarDados}>
          Atualizar
        </Button>
      </div>

      {alerts.filter((alert) => !alert.is_resolved).length === 0 ? (
        <Card className="p-8 text-center neuro-flat">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
          <p className="text-[var(--text-secondary)]">Nenhum alerta ativo no momento</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts
            .filter(a => !a.is_resolved)
            .map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 neuro-flat border-l-4 ${
                  alert.severidade === 'critica'
                    ? 'border-error'
                    : alert.severidade === 'alta'
                    ? 'border-warning'
                    : 'border-[var(--primary)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="default"
                        className={`${
                          alert.severidade === 'critica'
                            ? 'bg-error/20 text-error'
                            : alert.severidade === 'alta'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-[var(--primary)]/20 text-[var(--primary)]'
                        }`}
                      >
                        {alert.severidade}
                      </Badge>
                      <Badge variant="default">{alert.tipo}</Badge>
                      <span className="text-[var(--text-secondary)] text-[0.813rem]">
                        {alert.endpoint_nome}
                      </span>
                    </div>
                    <p className="mb-1 text-[0.813rem] font-medium">{alert.mensagem}</p>
                    <p className="text-[var(--text-secondary)] text-[0.813rem]">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleResolverAlerta(alert.id)}>
                    Resolver
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <Card className="p-6 neuro-raised">
        <h3 className="mb-4 text-[0.813rem] font-semibold">Tempo de Resposta por Endpoint</h3>
        <OrxBarChart
          data={metrics.slice(0, 10).map(m => ({ name: m.endpoint_nome, tempo: m.avg_response_time_ms }))}
          keys={["tempo"]}
          indexBy="name"
          height={300}
          colors={["var(--orx-primary)"]}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 neuro-raised">
          <h3 className="mb-4 flex items-center gap-2 text-[0.813rem] font-semibold">
            <Database className="w-5 h-5 text-[var(--primary)]" />
            Cache Performance
          </h3>
          <div className="space-y-3">
            {metrics
              .filter(m => m.cache_hit_rate_percent > 0)
              .slice(0, 5)
              .map((metric) => (
                <div key={metric.endpoint_id} className="flex items-center justify-between p-3 neuro-flat rounded-lg">
                  <span className="text-[0.813rem]">{metric.endpoint_nome}</span>
                  <Badge variant="default" className="bg-[var(--primary)]/20 text-[var(--primary)]">
                    {formatPercent(metric.cache_hit_rate_percent)}
                  </Badge>
                </div>
              ))}
          </div>
          <Button className="w-full mt-4" variant="secondary" onClick={handleLimparCache}>
            Limpar Cache Expirado
          </Button>
        </Card>

        <Card className="p-6 neuro-raised">
          <h3 className="mb-4 flex items-center gap-2 text-[0.813rem] font-semibold">
            <GitBranch className="w-5 h-5 text-[var(--primary)]" />
            Circuit Breaker Status
          </h3>
          <div className="space-y-3">
            <div className="p-4 neuro-inset rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.813rem] font-medium">Fechados (Normal)</span>
                <Badge variant="default" className="bg-success/20 text-success">
                  {endpointsHealthy}
                </Badge>
              </div>
              <Progress value={Math.min((endpointsHealthy / metrics.length) * 100, 100)} />
            </div>

            {endpointsWarning > 0 && (
              <div className="p-4 neuro-inset rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.813rem] font-medium">Meio-Abertos (Teste)</span>
                  <Badge variant="default" className="bg-warning/20 text-warning">
                    {endpointsWarning}
                  </Badge>
                </div>
                <Progress value={Math.min((endpointsWarning / metrics.length) * 100, 100)} />
              </div>
            )}

            {endpointsDown > 0 && (
              <div className="p-4 neuro-inset rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.813rem] font-medium">Abertos (Offline)</span>
                  <Badge variant="default" className="bg-error/20 text-error">
                    {endpointsDown}
                  </Badge>
                </div>
                <Progress value={Math.min((endpointsDown / metrics.length) * 100, 100)} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              API Gateway - Monitoramento
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gerenciamento de integrações externas: SEFAZ, ANVISA, CFM, Receita Federal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-xl neuro-flat hover:neuro-raised transition-all flex items-center gap-2 ${
                autoRefresh ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh && '(30s)'}
            </button>
            <Button icon={Download} variant="secondary">
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'endpoints', label: 'Endpoints', icon: Server },
            { id: 'alerts', label: 'Alertas', icon: AlertCircle },
            { id: 'performance', label: 'Performance', icon: Gauge },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'neuro-raised text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'endpoints' && renderEndpoints()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'performance' && renderPerformance()}
      </div>
    </div>
  );
}

export default APIGatewayDashboard;

