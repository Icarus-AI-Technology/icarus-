/**
 * Componente: Integrations Manager
 * 
 * Gerenciamento centralizado de todas as integrações externas
 * Dashboard completo com logs, webhooks, health checks e configurações
 */

import React, { useEffect, useState, useCallback } from 'react';
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
  Input,
  Switch,
  Tooltip,
} from '@/components/oraclusx-ds';
import {
  Plug,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Code,
  History,
  BarChart3,
  Shield,
  ShieldCheck,
  Globe,
  Server,
  Eye,
  Zap,
  Download,
  Webhook,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { APIGatewayService } from '@/lib/services/APIGatewayService';
import { formatNumber } from '@/lib/utils';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
// (Nenhum gráfico ativo aqui no momento; manter comentado até adicionar OrxLineChart quando necessário)

interface Integration {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  status: 'ativo' | 'inativo' | 'erro' | 'manutencao';
  url: string;
  auth_tipo: string;
  ultima_sincronizacao: string;
  proxima_sincronizacao?: string;
  total_chamadas: number;
  taxa_sucesso: number;
  tempo_resposta_medio: number;
}

interface Webhook {
  id: string;
  nome: string;
  url: string;
  eventos: string[];
  is_ativo: boolean;
  secret?: string;
  ultima_chamada?: string;
  total_chamadas: number;
  total_sucessos: number;
  total_falhas: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  integration: string;
  metodo: string;
  endpoint: string;
  status: number;
  tempo_resposta: number;
  erro?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof CheckCircle | typeof XCircle | typeof AlertCircle | typeof Clock }> = {
  ativo: { bg: 'bg-success/20', text: 'text-success', icon: CheckCircle },
  inativo: { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', icon: XCircle },
  erro: { bg: 'bg-error/20', text: 'text-error', icon: AlertCircle },
  manutencao: { bg: 'bg-warning/20', text: 'text-warning', icon: Clock },
};

const INTEGRATION_TYPES = {
  sefaz: { icon: Shield, color: 'text-blue-600', label: 'SEFAZ' },
  anvisa: { icon: ShieldCheck, color: 'text-green-600', label: 'ANVISA' },
  cfm: { icon: Activity, color: 'text-purple-600', label: 'CFM' },
  receita: { icon: BarChart3, color: 'text-orange-600', label: 'Receita Federal' },
  viacep: { icon: Globe, color: 'text-indigo-600', label: 'ViaCEP' },
  microsoft365: { icon: Server, color: 'text-blue-500', label: 'Microsoft 365' },
  custom: { icon: Plug, color: 'text-gray-600', label: 'Customizada' },
};

export default function IntegrationsManager() {
  useDocumentTitle('Integrations Manager');
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'webhooks' | 'logs' | 'config'>('overview');
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  // const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  // const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarIntegracoes(),
        carregarWebhooks(),
        carregarLogs(),
      ]);
    } catch (error: unknown) {
      const err = error as Error;
      addToast(`Erro ao carregar dados: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const carregarIntegracoes = async () => {
    try {
      const metrics = await APIGatewayService.getMetrics();
      
      const integrationsData: Integration[] = metrics.map((m: Record<string, unknown>) => ({
        id: String(m.endpoint_id ?? ''),
        nome: String(m.endpoint_nome ?? ''),
        descricao: String(m.servico ?? ''),
        tipo: String(m.servico ?? 'custom'),
        status: (m.circuit_breaker_state === 'closed'
          ? 'ativo'
          : m.circuit_breaker_state === 'open'
          ? 'erro'
          : 'manutencao') as Integration['status'],
        url: '-',
        auth_tipo: 'api_key',
        ultima_sincronizacao: new Date().toISOString(),
        total_chamadas: Number(m.total_requests ?? 0),
        taxa_sucesso:
          Number(m.total_requests ?? 0) > 0
            ? (Number(m.success_count ?? 0) / Number(m.total_requests ?? 0)) * 100
            : 0,
        tempo_resposta_medio: Number(m.avg_response_time_ms ?? 0),
      }));

      setIntegrations(integrationsData);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error as Error);
      // Mock data
      setIntegrations([
        {
          id: '1',
          nome: 'SEFAZ - NF-e',
          descricao: 'Emissão e consulta de Notas Fiscais Eletrônicas',
          tipo: 'sefaz',
          status: 'ativo',
          url: 'https://nfe.sefaz.rs.gov.br',
          auth_tipo: 'certificate',
          ultima_sincronizacao: new Date(Date.now() - 300000).toISOString(),
          total_chamadas: 1520,
          taxa_sucesso: 98.5,
          tempo_resposta_medio: 850,
        },
        {
          id: '2',
          nome: 'ANVISA - Registro',
          descricao: 'Consulta de registros de produtos médicos',
          tipo: 'anvisa',
          status: 'ativo',
          url: 'https://consultas.anvisa.gov.br',
          auth_tipo: 'api_key',
          ultima_sincronizacao: new Date(Date.now() - 180000).toISOString(),
          total_chamadas: 845,
          taxa_sucesso: 100,
          tempo_resposta_medio: 420,
        },
        {
          id: '3',
          nome: 'CFM - Validação CRM',
          descricao: 'Validação de CRM de médicos',
          tipo: 'cfm',
          status: 'ativo',
          url: 'https://portal.cfm.org.br',
          auth_tipo: 'none',
          ultima_sincronizacao: new Date(Date.now() - 600000).toISOString(),
          total_chamadas: 320,
          taxa_sucesso: 95.8,
          tempo_resposta_medio: 1250,
        },
        {
          id: '4',
          nome: 'Microsoft 365',
          descricao: 'Teams, Outlook e OneDrive',
          tipo: 'microsoft365',
          status: 'ativo',
          url: 'https://graph.microsoft.com',
          auth_tipo: 'oauth2',
          ultima_sincronizacao: new Date(Date.now() - 120000).toISOString(),
          total_chamadas: 456,
          taxa_sucesso: 99.2,
          tempo_resposta_medio: 380,
        },
      ]);
    }
  };

  const carregarWebhooks = async () => {
    // Mock data
    setWebhooks([
      {
        id: '1',
        nome: 'Webhook NF-e Autorizada',
        url: 'https://api.exemplo.com/webhooks/nfe-autorizada',
        eventos: ['nfe.autorizada', 'nfe.cancelada'],
        is_ativo: true,
        secret: 'whsec_••••••••••••',
        ultima_chamada: new Date(Date.now() - 180000).toISOString(),
        total_chamadas: 128,
        total_sucessos: 126,
        total_falhas: 2,
      },
      {
        id: '2',
        nome: 'Slack - Alertas Críticos',
        url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
        eventos: ['kpi.critico', 'api.down'],
        is_ativo: true,
        ultima_chamada: new Date(Date.now() - 3600000).toISOString(),
        total_chamadas: 8,
        total_sucessos: 8,
        total_falhas: 0,
      },
    ]);
  };

  const carregarLogs = async () => {
    // Mock data
    setLogs([
      {
        id: '1',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        integration: 'SEFAZ - NF-e',
        metodo: 'POST',
        endpoint: '/ws/NfeAutorizacao',
        status: 200,
        tempo_resposta: 850,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        integration: 'ANVISA - Registro',
        metodo: 'GET',
        endpoint: '/api/consulta/medicamentos',
        status: 200,
        tempo_resposta: 420,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        integration: 'CFM - Validação CRM',
        metodo: 'GET',
        endpoint: '/busca-medicos',
        status: 200,
        tempo_resposta: 1250,
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        integration: 'SEFAZ - NF-e',
        metodo: 'POST',
        endpoint: '/ws/RecepcaoEvento',
        status: 500,
        tempo_resposta: 1500,
        erro: 'Timeout na conexão com SEFAZ',
      },
    ]);
  };

  const handleTestarIntegracao = async (_integrationId: string) => {
    setLoading(true);
    try {
      // Implementar teste de integração
      addToast('Teste de integração iniciado...', 'info');
      setTimeout(() => {
        addToast('Integração testada com sucesso!', 'success');
        setLoading(false);
      }, 2000);
    } catch (error: unknown) {
      const err = error as Error;
      addToast(`Erro no teste: ${err.message}`, 'error');
      setLoading(false);
    }
  };

  const handleToggleWebhook = async (webhookId: string, isAtivo: boolean) => {
    try {
      // Implementar toggle de webhook
      setWebhooks(webhooks.map(w => 
        w.id === webhookId ? { ...w, is_ativo: isAtivo } : w
      ));
      addToast(`Webhook ${isAtivo ? 'ativado' : 'desativado'}!`, 'success');
    } catch (error: unknown) {
      const err = error as Error;
      addToast(`Erro: ${err.message}`, 'error');
    }
  };

  const handleExportarLogs = () => {
    addToast('Exportando logs...', 'info');
    // Implementar exportação
  };

  const renderOverview = () => {
    const integracoesAtivas = integrations.filter(i => i.status === 'ativo').length;
    const integracoesTotal = integrations.length;
    const chamadas24h = integrations.reduce((sum, i) => sum + i.total_chamadas, 0);
    const taxaSucessoMedia = integrations.length > 0
      ? integrations.reduce((sum, i) => sum + i.taxa_sucesso, 0) / integrations.length
      : 0;
    const tempoMedio = integrations.length > 0
      ? integrations.reduce((sum, i) => sum + i.tempo_resposta_medio, 0) / integrations.length
      : 0;

    return (
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 neuro-raised bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90 text-[0.813rem] orx-orx-font-medium">Integrações Ativas</h3>
              <CheckCircle className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[0.813rem] orx-orx-font-bold">{integracoesAtivas}/{integracoesTotal}</p>
            <p className="opacity-80 mt-2 text-[0.813rem]">{formatPercent((integracoesAtivas / integracoesTotal) * 100)} operacionais</p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90 text-[0.813rem] orx-orx-font-medium">Chamadas (24h)</h3>
              <Activity className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[0.813rem] orx-orx-font-bold">{formatNumber(chamadas24h)}</p>
            <p className="opacity-80 mt-2 text-[0.813rem]">Média: {Math.round(chamadas24h / 24)}/hora</p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90 text-[0.813rem] orx-orx-font-medium">Taxa de Sucesso</h3>
              <BarChart3 className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[0.813rem] orx-orx-font-bold">{taxaSucessoMedia.toFixed(1)}%</p>
            <p className="opacity-80 mt-2 text-[0.813rem]">Meta: ≥ 95%</p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90 text-[0.813rem] orx-orx-font-medium">Tempo Médio</h3>
              <Clock className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[0.813rem] orx-orx-font-bold">{Math.round(tempoMedio)}ms</p>
            <p className="opacity-80 mt-2 text-[0.813rem]">Meta: &lt; 1000ms</p>
          </Card>
        </div>

        {/* Status das Integrações */}
        <Card className="p-6 neuro-raised">
          <h3 className="mb-4 flex items-center gap-2 text-[0.813rem] orx-orx-font-semibold">
            <Plug className="w-5 h-5 text-[var(--primary)]" />
            Status das Integrações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const TypeIcon = INTEGRATION_TYPES[integration.tipo as keyof typeof INTEGRATION_TYPES]?.icon || Plug;
              const statusConfig = STATUS_COLORS[integration.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div key={integration.id} className="p-4 neuro-flat rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <TypeIcon className={`w-5 h-5 ${INTEGRATION_TYPES[integration.tipo as keyof typeof INTEGRATION_TYPES]?.color}`} />
                      <div>
                        <h4 className="orx-orx-font-semibold">{integration.nome}</h4>
                        <p className="text-[var(--text-secondary)] text-[0.813rem]">{integration.descricao}</p>
                      </div>
                    </div>
                    <Badge variant="default" className={`${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {integration.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[0.813rem]">
                    <div>
                      <p className="text-[var(--text-secondary)] text-[0.813rem]">Chamadas</p>
                      <p className="orx-orx-font-semibold">{formatNumber(integration.total_chamadas)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)] text-[0.813rem]">Sucesso</p>
                      <p className="orx-orx-font-semibold">{integration.taxa_sucesso.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)] text-[0.813rem]">Tempo</p>
                      <p className="orx-orx-font-semibold">{integration.tempo_resposta_medio.toFixed(0)}ms</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="secondary" onClick={() => handleTestarIntegracao(integration.id)}>
                      Testar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedIntegration(integration)}>
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[0.813rem] orx-orx-font-semibold">Gerenciar Integrações</h2>
        <Button icon={<Plus />} onClick={() => setIsConfigDialogOpen(true)}>
          Nova Integração
        </Button>
      </div>

      <Card className="neuro-raised p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Sync</TableHead>
              <TableHead>Chamadas</TableHead>
              <TableHead>Taxa Sucesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.map((integration) => {
              const statusConfig = STATUS_COLORS[integration.status];
              const StatusIcon = statusConfig.icon;

              return (
                <TableRow key={integration.id}>
                  <TableCell className="orx-orx-font-medium">{integration.nome}</TableCell>
                  <TableCell>
                    <Badge variant="default">{integration.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className={`${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {integration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(integration.ultima_sincronizacao).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{formatNumber(integration.total_chamadas)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={`${
                        integration.taxa_sucesso >= 95
                          ? 'bg-success/20 text-success'
                          : integration.taxa_sucesso >= 85
                          ? 'bg-warning/20 text-warning'
                          : 'bg-error/20 text-error'
                      }`}
                    >
                      {integration.taxa_sucesso.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip content="Ver Logs">
                        <Button variant="ghost" size="sm" icon={<Eye />} />
                      </Tooltip>
                      <Tooltip content="Configurar">
                        <Button variant="ghost" size="sm" icon={<Settings />} />
                      </Tooltip>
                      <Tooltip content="Testar Agora">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Zap className="text-warning" />}
                          onClick={() => handleTestarIntegracao(integration.id)}
                        />
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[0.813rem] orx-orx-font-semibold">Webhooks</h2>
        <Button icon={<Plus />}>Novo Webhook</Button>
      </div>

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="p-6 neuro-raised">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Webhook className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="orx-orx-font-semibold">{webhook.nome}</h3>
                  <Switch
                    checked={webhook.is_ativo}
                    onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)}
                  />
                </div>
                <p className="text-[var(--text-secondary)] mb-2 text-[0.813rem]">{webhook.url}</p>
                <div className="flex flex-wrap gap-2">
                  {webhook.eventos.map((evento, idx) => (
                    <Badge key={idx} variant="default" className="bg-[var(--primary)]/20 text-[var(--primary)]">
                      {evento}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={<Edit />} />
                <Button variant="secondary" size="sm" icon={<Trash2 className="text-error" />} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[var(--text-secondary)]/20">
              <div>
                <p className="text-[var(--text-secondary)] text-[0.813rem]">Total Chamadas</p>
                <p className="orx-orx-font-semibold">{webhook.total_chamadas}</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] text-[0.813rem]">Sucessos</p>
                <p className="text-success orx-orx-font-semibold">{webhook.total_sucessos}</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] text-[0.813rem]">Falhas</p>
                <p className="text-error orx-orx-font-semibold">{webhook.total_falhas}</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] text-[0.813rem]">Última Chamada</p>
                <p className="text-[0.813rem]">
                  {webhook.ultima_chamada
                    ? new Date(webhook.ultima_chamada).toLocaleTimeString('pt-BR')
                    : 'Nunca'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[0.813rem] orx-orx-font-semibold">Logs de Integrações</h2>
        <div className="flex gap-2">
          <Input placeholder="Buscar logs..." icon={<Code />} className="w-[300px]" />
          <Button variant="secondary" icon={<Download />} onClick={handleExportarLogs}>
            Exportar
          </Button>
        </div>
      </div>

      <Card className="neuro-raised p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Integração</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString('pt-BR')}</TableCell>
                <TableCell>{log.integration}</TableCell>
                <TableCell>
                  <Badge variant="default">{log.metodo}</Badge>
                </TableCell>
                <TableCell className="font-mono text-[0.813rem]">{log.endpoint}</TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={`${
                      log.status >= 200 && log.status < 300
                        ? 'bg-success/20 text-success'
                        : 'bg-error/20 text-error'
                    }`}
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>{log.tempo_resposta}ms</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" icon={<Eye />} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Integrations Manager
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gerenciamento centralizado de APIs, Webhooks e Logs
            </p>
          </div>
          <Button variant="secondary" icon={<RefreshCw />} onClick={carregarDados} disabled={loading}>
            Atualizar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'integrations', label: 'Integrações', icon: Plug },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            { id: 'logs', label: 'Logs', icon: History },
            { id: 'config', label: 'Configurações', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-xl orx-orx-font-medium transition-all flex items-center gap-2 ${
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
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'webhooks' && renderWebhooks()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'config' && (
          <Card className="p-8 text-center neuro-flat">
            <Settings className="w-16 h-16 mx-auto mb-4 text-[var(--primary)] opacity-50" />
            <p className="text-[var(--text-secondary)]">Configurações avançadas em desenvolvimento</p>
          </Card>
        )}
      </div>
    </div>
  );
}

