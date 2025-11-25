/**
 * API GATEWAY DASHBOARD - ICARUS v5.0
 * Monitoramento e métricas de APIs externas e internas
 */

import { useMemo, useState } from 'react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { Button } from '@/components/oraclusx-ds/Button';
import {
  CheckCircle,
  XCircle,
  Zap,
  TrendingUp,
  AlertTriangle,
  Globe,
  Database,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface API {
  id: string;
  nome: string;
  endpoint: string;
  tipo: 'interna' | 'externa';
  status: 'healthy' | 'degraded' | 'down';
  latenciaMedia: number;
  requestsHoje: number;
  taxaSucesso: number;
  ultimoCheck: string;
}

export default function APIGatewayDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('hoje');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('todas');

  const apis = useMemo<API[]>(
    () => [
      {
        id: '1',
        nome: 'SEFAZ - NF-e',
        endpoint: 'https://nfe.fazenda.gov.br/api/v1',
        tipo: 'externa',
        status: 'healthy',
        latenciaMedia: 245,
        requestsHoje: 1247,
        taxaSucesso: 99.2,
        ultimoCheck: '2025-10-20T16:45:00',
      },
      {
        id: '2',
        nome: 'ANVISA - Rastreabilidade',
        endpoint: 'https://portal.anvisa.gov.br/api/v2',
        tipo: 'externa',
        status: 'healthy',
        latenciaMedia: 512,
        requestsHoje: 847,
        taxaSucesso: 98.5,
        ultimoCheck: '2025-10-20T16:44:00',
      },
      {
        id: '3',
        nome: 'ViaCEP',
        endpoint: 'https://viacep.com.br/ws',
        tipo: 'externa',
        status: 'healthy',
        latenciaMedia: 89,
        requestsHoje: 2341,
        taxaSucesso: 99.8,
        ultimoCheck: '2025-10-20T16:45:00',
      },
      {
        id: '4',
        nome: 'Receita Federal',
        endpoint: 'https://www.receitafederal.gov.br/api',
        tipo: 'externa',
        status: 'degraded',
        latenciaMedia: 1842,
        requestsHoje: 456,
        taxaSucesso: 87.3,
        ultimoCheck: '2025-10-20T16:43:00',
      },
      {
        id: '5',
        nome: 'CFM - Validação CRM',
        endpoint: 'https://portal.cfm.org.br/api',
        tipo: 'externa',
        status: 'healthy',
        latenciaMedia: 654,
        requestsHoje: 123,
        taxaSucesso: 96.8,
        ultimoCheck: '2025-10-20T16:45:00',
      },
      {
        id: '6',
        nome: 'Supabase - Database',
        endpoint: 'https://[project].supabase.co',
        tipo: 'interna',
        status: 'healthy',
        latenciaMedia: 45,
        requestsHoje: 18924,
        taxaSucesso: 99.9,
        ultimoCheck: '2025-10-20T16:45:00',
      },
    ],
    []
  );

  const kpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'kpi-apis',
        icon: Globe,
        label: 'APIs Monitoradas',
        value: apis.length,
        subtitle: 'Conectadas',
        trend: '+0%',
        trendPositive: true,
      },
      {
        id: 'kpi-uptime',
        icon: CheckCircle,
        label: 'Uptime Médio',
        value: '99.2%',
        subtitle: 'Últimas 24h',
        trend: '+0.3%',
        trendPositive: true,
      },
      {
        id: 'kpi-latencia',
        icon: Zap,
        label: 'Latência Média',
        value: '245ms',
        subtitle: 'Global',
        trend: '-12ms',
        trendPositive: true,
      },
      {
        id: 'kpi-requests',
        icon: TrendingUp,
        label: 'Requests Hoje',
        value: '23.9K',
        subtitle: 'Até o momento',
        trend: '+15%',
        trendPositive: true,
      },
    ],
    [apis.length]
  );

  const tabs = useMemo<ModuleTabItem[]>(() => {
    const totalExternas = apis.filter((api) => api.tipo === 'externa').length;
    const totalInternas = apis.filter((api) => api.tipo === 'interna').length;
    const totalCritical = apis.filter((api) => api.status !== 'healthy').length;
    return [
      { id: 'todas', label: 'Todas', count: apis.length },
      { id: 'externa', label: 'Externas', count: totalExternas },
      { id: 'interna', label: 'Internas', count: totalInternas },
      { id: 'degraded', label: 'Degradadas', count: totalCritical },
      { id: 'down', label: 'Offline', count: apis.filter((api) => api.status === 'down').length },
    ];
  }, [apis]);

  const filteredApis = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return apis
      .filter((api) =>
        activeTab === 'todas' ? true : api.tipo === activeTab || api.status === activeTab
      )
      .filter(
        (api) => api.nome.toLowerCase().includes(term) || api.endpoint.toLowerCase().includes(term)
      );
  }, [apis, activeTab, searchTerm]);

  const getStatusLabel = (status: string) => {
    const labels = {
      healthy: 'Saudável',
      degraded: 'Degradado',
      down: 'Offline',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'healthy') return CheckCircle;
    if (status === 'degraded') return AlertTriangle;
    return XCircle;
  };

  return (
    <ModulePageNeumo
      title="API Gateway Dashboard"
      subtitle="Monitoramento e métricas de APIs externas e internas"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Buscar API por nome ou endpoint..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros avançados de APIs')}
      primaryActionLabel="Nova Integração"
      onPrimaryAction={() => alert('Cadastrar nova API')}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white/70 text-sm">
            Intervalo: {selectedPeriod === 'hoje' ? 'Hoje' : `Últimos ${selectedPeriod}`}
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Selecionar período"
              className="ic-card-neumo rounded-3xl px-4 py-2 bg-transparent text-sm text-white focus:outline-none"
            >
              <option value="hoje">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            <Button
              variant="secondary"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => alert('Filtros avançados')}
            >
              Filtros
            </Button>
            <Button
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => alert('Atualizando métricas')}
            >
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredApis.map((api) => {
            const StatusIcon = getStatusIcon(api.status);
            return (
              <div key={api.id} className="ic-card-neumo rounded-[32px] p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center ic-icon-badge-neumo">
                      {api.tipo === 'interna' ? (
                        <Database className="w-5 h-5" />
                      ) : (
                        <Globe className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{api.nome}</p>
                      <p className="text-white/60 text-xs">{api.endpoint}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      api.status === 'healthy'
                        ? 'success'
                        : api.status === 'down'
                          ? 'error'
                          : 'warning'
                    }
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {getStatusLabel(api.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
                  <div>
                    <p>Latência</p>
                    <strong className="text-white">{api.latenciaMedia}ms</strong>
                  </div>
                  <div>
                    <p>Requests</p>
                    <strong className="text-white">
                      {api.requestsHoje.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div>
                    <p>Sucesso</p>
                    <strong
                      className={api.taxaSucesso >= 95 ? 'text-emerald-300' : 'text-amber-300'}
                    >
                      {api.taxaSucesso}%
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModulePageNeumo>
  );
}
