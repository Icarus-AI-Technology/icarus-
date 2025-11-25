/**
 * Módulo: Gestão de Contratos
 * ----------------------------
 * Implementa 10 sub-módulos documentados em MODULOS_CONTRATOS_VENDAS_CRM_COMPLETO.md
 * com dados em tempo real via Supabase e integrações com IA (ContratosAI.ts).
 *
 * Sub-módulos:
 * 1. Dashboard Contratos
 * 2. Contratos Ativos
 * 3. Contratos a Vencer
 * 4. Workflow de Aprovação
 * 5. Cláusulas e Aditivos
 * 6. SLA e Indicadores
 * 7. Renovações
 * 8. Contratos Encerrados
 * 9. Análise com IA
 * 10. Relatórios de Contratos
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  Alert,
  Table,
  Dropdown,
  Button,
} from '@/components/oraclusx-ds';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  Sparkles,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  Download,
  Edit2,
  Eye,
  Loader2,
} from 'lucide-react';
import { useContratos, type Contrato, type ContratoAditivo, type ContratoSLA } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { format, formatDistanceToNow, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContratosAI } from '@/lib/services/ContratosAI';
import { cn } from '@/lib/utils';

interface ContratosDashboardCard {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  secondary?: string;
  intent: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

const formatterCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
});

const formatterDate = (value: string | null | undefined) => {
  if (!value) return '—';
  return format(new Date(value), 'dd/MM/yyyy', { locale: ptBR });
};

const statusBadgeMap: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'neutral' }
> = {
  ativo: { label: 'Ativo', variant: 'success' },
  em_aprovacao: { label: 'Em aprovação', variant: 'info' },
  renovacao: { label: 'Renovação', variant: 'warning' },
  vencendo: { label: 'Vencendo', variant: 'warning' },
  encerrado: { label: 'Encerrado', variant: 'default' },
  cancelado: { label: 'Cancelado', variant: 'error' },
  rascunho: { label: 'Rascunho', variant: 'info' },
};

const prazoLabels: Record<string, string> = {
  nenhum: 'Sem reajuste',
  ipca: 'IPCA',
  igpm: 'IGP-M',
  inpc: 'INPC',
  percentual_fixo: 'Percentual fixo',
};

const submodules = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'ativos', label: 'Contratos Ativos', icon: CheckCircle },
  { id: 'vencer', label: 'A vencer', icon: Clock },
  { id: 'workflow', label: 'Workflow Aprovação', icon: ShieldCheck },
  { id: 'clausulas', label: 'Cláusulas & Aditivos', icon: FileText },
  { id: 'sla', label: 'SLA & Indicadores', icon: BarChart3 },
  { id: 'renovacoes', label: 'Renovações', icon: RefreshCw },
  { id: 'encerrados', label: 'Encerrados', icon: AlertTriangle },
  { id: 'ia', label: 'Análise IA', icon: Sparkles },
  { id: 'relatorios', label: 'Relatórios', icon: Download },
];

const contratosAI = new ContratosAI();

export default function GestaoContratos() {
  const {
    contratos,
    kpis,
    alertas,
    loading,
    error,
    getClausulas,
    getAditivos,
    getSLAs,
    getAprovacoes,
    getAlertasContrato,
    registrarAprovacao,
    registrarAlerta,
  } = useContratos();
  const { addToast } = useToast();
  const [activeSubmodule, setActiveSubmodule] = useState<string>('dashboard');
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [clausulas, setClausulas] = useState<Awaited<ReturnType<typeof getClausulas>>>([]);
  const [aditivos, setAditivos] = useState<Awaited<ReturnType<typeof getAditivos>>>([]);
  const [slas, setSlas] = useState<Awaited<ReturnType<typeof getSLAs>>>([]);
  const [aprovacoes, setAprovacoes] = useState<Awaited<ReturnType<typeof getAprovacoes>>>([]);
  const [contratoAlertas, setContratoAlertas] = useState<
    Awaited<ReturnType<typeof getAlertasContrato>>
  >([]);
  const [iaInsights, setIaInsights] = useState<string>('');
  const [iaLoading, setIaLoading] = useState(false);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  useEffect(() => {
    if (!selectedContratoId) return;

    const loadDetails = async () => {
      setLoadingDetail(true);
      try {
        const [clausulasData, aditivosData, slasData, aprovacoesData, alertasData] =
          await Promise.all([
            getClausulas(selectedContratoId),
            getAditivos(selectedContratoId),
            getSLAs(selectedContratoId),
            getAprovacoes(selectedContratoId),
            getAlertasContrato(selectedContratoId),
          ]);

        setClausulas(clausulasData);
        setAditivos(aditivosData);
        setSlas(slasData);
        setAprovacoes(aprovacoesData);
        setContratoAlertas(alertasData);
      } catch (detailError) {
        console.error(detailError);
        addToast('Falha ao carregar dados do contrato', 'error');
      } finally {
        setLoadingDetail(false);
      }
    };

    loadDetails().catch(() => undefined);
  }, [
    selectedContratoId,
    getClausulas,
    getAditivos,
    getSLAs,
    getAprovacoes,
    getAlertasContrato,
    addToast,
  ]);

  const dashboardData: ContratosDashboardCard[] = useMemo(() => {
    return [
      {
        id: 'ativos',
        label: 'Contratos ativos',
        description: 'Ciclo vigente',
        icon: CheckCircle,
        value: `${kpis?.contratos_ativos ?? 0}`,
        secondary: `${formatterCurrency.format(kpis?.valor_total ?? 0)} comprometidos`,
        intent: 'success',
      },
      {
        id: 'renovacao',
        label: 'Em renovação',
        description: 'Processos abertos',
        icon: RefreshCw,
        value: `${kpis?.contratos_em_renovacao ?? 0}`,
        secondary: `${kpis?.taxa_renovacao ?? 0}% taxa renovação`,
        intent: 'warning',
      },
      {
        id: 'pendentes',
        label: 'Pendentes aprovação',
        description: 'Workflow',
        icon: ShieldCheck,
        value: `${kpis?.contratos_pendentes ?? 0}`,
        secondary: `${alertas.length} alertas críticos`,
        intent: 'error',
      },
      {
        id: 'vencimento',
        label: 'Vencendo (30 dias)',
        description: 'Ações urgentes',
        icon: AlertTriangle,
        value: `${kpis?.vencer_30 ?? 0}`,
        secondary: `${kpis?.vencer_90 ?? 0} em 90 dias`,
        intent: 'warning',
      },
    ];
  }, [kpis, alertas.length]);

  const contratosOrdenados = useMemo(() => {
    return [...contratos].sort((a, b) => {
      if (a.status === 'renovacao' && b.status !== 'renovacao') return -1;
      if (b.status === 'renovacao' && a.status !== 'renovacao') return 1;
      return new Date(a.data_fim).getTime() - new Date(b.data_fim).getTime();
    });
  }, [contratos]);

  const contratosVencendo = useMemo(() => {
    const hoje = new Date();
    return contratosOrdenados.filter((contrato) => {
      const vencimento = new Date(contrato.data_fim);
      return isBefore(vencimento, addDays(hoje, 30)) && contrato.status === 'ativo';
    });
  }, [contratosOrdenados]);

  const handleSelectContrato = (contratoId: string) => {
    setSelectedContratoId(contratoId);
    setActiveSubmodule('workflow');
  };

  const handleExecutarAnaliseIA = async (contratoId: string) => {
    setIaLoading(true);
    try {
      const contrato = contratos.find((item) => item.id === contratoId);
      if (!contrato) throw new Error('Contrato não encontrado');
      const result = await contratosAI.analisarContrato({
        contrato,
        clausulas,
        slas,
        aditivos,
      });
      setIaInsights(result.resumo);
      setActiveSubmodule('ia');
      addToast('Análise IA concluída', 'success');
    } catch (iaError) {
      console.error(iaError);
      addToast('Erro ao executar análise de IA', 'error');
    } finally {
      setIaLoading(false);
    }
  };

  const handleRegistrarAprovacao = async (
    contratoId: string,
    nivel: Parameters<typeof registrarAprovacao>[1],
    status: 'aprovado' | 'rejeitado'
  ) => {
    try {
      await registrarAprovacao(contratoId, nivel, status);
      addToast('Aprovação registrada', 'success');
    } catch (registerError) {
      console.error(registerError);
      addToast('Falha ao registrar aprovação', 'error');
    }
  };

  const handleRegistrarAlerta = async (
    contratoId: string,
    descricao: string,
    tipo: 'vencimento' | 'renovacao' | 'sla' | 'inadimplencia' | 'assinatura',
    severidade: 'info' | 'warning' | 'critical'
  ) => {
    try {
      await registrarAlerta({
        contrato_id: contratoId,
        descricao,
        tipo,
        severidade,
        data_alerta: new Date().toISOString(),
        resolvido: false,
        resolvido_em: null,
      });
      addToast('Alerta registrado', 'success');
    } catch (registerError) {
      console.error(registerError);
      addToast('Falha ao registrar alerta', 'error');
    }
  };

  const renderDashboard = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboardData.map((card) => (
          <Card key={card.id} className="neuro-raised h-full">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-[var(--text-primary)] text-body-sm orx-orx-font-medium">
                  {card.label}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
              <card.icon className="text-[var(--primary)]" />
            </CardHeader>
            <CardContent>
              <p className="text-heading text-[var(--text-primary)] font-display">{card.value}</p>
              {card.secondary && (
                <p className="text-body-xs text-[var(--text-secondary)] mt-2">{card.secondary}</p>
              )}
              <Badge variant={card.intent} className="mt-4 w-fit">
                Atualizado{' '}
                {kpis?.atualizado_em
                  ? formatDistanceToNow(new Date(kpis.atualizado_em), {
                      addSuffix: true,
                      locale: ptBR,
                    })
                  : 'agora'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="neuro-raised">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Alertas críticos</CardTitle>
            <CardDescription>Eventos com impacto imediato</CardDescription>
          </div>
          <Badge variant="warning">{alertas.length} alertas</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertas.length === 0 && (
            <p className="text-body-sm text-[var(--text-secondary)]">
              Nenhum alerta crítico no momento.
            </p>
          )}
          {alertas.map((alerta) => (
            <Alert
              key={alerta.id}
              type={
                alerta.severidade === 'critical'
                  ? 'error'
                  : alerta.severidade === 'warning'
                    ? 'warning'
                    : 'info'
              }
              message={`${alerta.descricao ?? 'Sem descrição'} • ${formatterDate(alerta.data_alerta)}`}
              title={
                alerta.numero_contrato
                  ? `${alerta.numero_contrato} - ${alerta.contrato_titulo}`
                  : (alerta.contrato_titulo ?? 'Contrato')
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderContratosAtivos = () => (
    <Table<Contrato>
      columns={[
        {
          header: 'Contrato',
          accessor: 'titulo',
          cell: ({ row }: { row: Contrato }) => (
            <div className="space-y-1">
              <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                {row.titulo}
              </p>
              <p className="text-body-xs text-[var(--text-secondary)]">#{row.numero_contrato}</p>
            </div>
          ),
        },
        {
          header: 'Vigência',
          accessor: 'data_inicio',
          cell: ({ row }: { row: Contrato }) => (
            <div className="text-body-xs text-[var(--text-secondary)]">
              {formatterDate(row.data_inicio)} • {formatterDate(row.data_fim)}
            </div>
          ),
        },
        {
          header: 'Valor',
          accessor: 'valor_total',
          cell: ({ row }: { row: Contrato }) => formatterCurrency.format(row.valor_total ?? 0),
        },
        {
          header: 'Status',
          accessor: 'status',
          cell: ({ row }: { row: Contrato }) => {
            const badge = statusBadgeMap[row.status] ?? statusBadgeMap.encerrado;
            return <Badge variant={badge.variant}>{badge.label}</Badge>;
          },
        },
        {
          header: 'Tipo',
          accessor: 'tipo',
          cell: ({ row }: { row: Contrato }) => <Badge variant="default">{row.tipo.replaceAll('_', '')}</Badge>,
        },
        {
          header: 'Ações',
          accessor: 'id',
          cell: ({ row }: { row: Contrato }) => (
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => handleSelectContrato(row.id)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="default" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Dropdown
                trigger={
                  <Button variant="default" size="sm">
                    •••
                  </Button>
                }
                items={[
                  {
                    id: 'alerta',
                    label: 'Registrar alerta',
                    onClick: () => handleRegistrarAlerta(row.id, 'Alerta manual', 'sla', 'warning'),
                  },
                  {
                    id: 'ia',
                    label: 'Executar IA',
                    onClick: () => handleExecutarAnaliseIA(row.id),
                  },
                ]}
              />
            </div>
          ),
        },
      ]}
      data={contratosOrdenados.filter(
        (contrato) => contrato.status === 'ativo' || contrato.status === 'renovacao'
      )}
      emptyState={{
        icon: FileText,
        title: 'Nenhum contrato ativo',
        description: 'Cadastre um contrato para começar a gestão.',
        action: {
          label: 'Novo contrato',
          onClick: () => addToast('Fluxo de criação em desenvolvimento', 'info'),
        },
      }}
    />
  );

  const renderContratosVencendo = () => (
    <div className="space-y-4">
      {contratosVencendo.length === 0 && (
        <p className="text-body-sm text-[var(--text-secondary)]">
          Sem contratos próximos do vencimento.
        </p>
      )}
      {contratosVencendo.map((contrato) => (
        <Card key={contrato.id} className="neuro-raised">
          <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <div>
              <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                {contrato.titulo}
              </p>
              <p className="text-body-xs text-[var(--text-secondary)]">
                #{contrato.numero_contrato} • {formatterCurrency.format(contrato.valor_total ?? 0)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">
                Vence em{' '}
                {formatDistanceToNow(new Date(contrato.data_fim), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </Badge>
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  handleRegistrarAlerta(contrato.id, 'Contrato a vencer', 'vencimento', 'critical')
                }
              >
                Criar alerta
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderWorkflow = () => (
    <div className="grid gap-6">
      {selectedContratoId ? (
        loadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            <Card className="neuro-raised">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Workflow de aprovação</CardTitle>
                  <CardDescription>Etapas e responsáveis pela aprovação</CardDescription>
                </div>
                <Badge variant="info">Contrato #{selectedContratoId.slice(0, 6)}</Badge>
              </CardHeader>
              <CardContent className="grid gap-3">
                {aprovacoes.map((aprovacao) => (
                  <div
                    key={aprovacao.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg neuro-inset"
                  >
                    <div>
                      <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                        {aprovacao.nivel.toUpperCase()}
                      </p>
                      <p className="text-body-xs text-[var(--text-secondary)]">
                        {aprovacao.status === 'aprovado'
                          ? 'Aprovado'
                          : aprovacao.status === 'rejeitado'
                            ? 'Rejeitado'
                            : 'Pendente'}
                        {aprovacao.aprovado_em &&
                          ` • ${formatDistanceToNow(new Date(aprovacao.aprovado_em), { addSuffix: true, locale: ptBR })}`}
                      </p>
                      {aprovacao.comentario && (
                        <p className="text-body-xs text-[var(--text-secondary)] mt-1">
                          {aprovacao.comentario}
                        </p>
                      )}
                    </div>
                    {aprovacao.status === 'pendente' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleRegistrarAprovacao(
                              selectedContratoId,
                              aprovacao.nivel,
                              'aprovado'
                            )
                          }
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleRegistrarAprovacao(
                              selectedContratoId,
                              aprovacao.nivel,
                              'rejeitado'
                            )
                          }
                        >
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="neuro-raised">
              <CardHeader>
                <CardTitle>Alertas do contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contratoAlertas.map((item) => (
                  <Alert
                    key={item.id}
                    type={
                      item.severidade === 'critical'
                        ? 'error'
                        : item.severidade === 'warning'
                          ? 'warning'
                          : 'info'
                    }
                    title={`${item.tipo.toUpperCase()} • ${formatterDate(item.data_alerta)}`}
                    message={item.descricao ?? 'Sem descrição'}
                  />
                ))}
                {contratoAlertas.length === 0 && (
                  <p className="text-body-sm text-[var(--text-secondary)]">
                    Nenhum alerta registrado.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )
      ) : (
        <Card className="neuro-raised">
          <CardContent className="py-12 text-center">
            <p className="text-body-sm text-[var(--text-secondary)] mb-4">
              Selecione um contrato na lista para visualizar o workflow de aprovação.
            </p>
            {renderContratosAtivos()}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderClausulasEAditivos = () => (
    <div className="grid gap-6">
      <Card className="neuro-raised">
        <CardHeader>
          <CardTitle>Cláusulas principais</CardTitle>
          <CardDescription>Texto contratual armazenado no banco</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedContratoId && clausulas.length > 0 ? (
            <div className="space-y-4">
              {clausulas.map((clausula) => (
                <div key={clausula.id} className="p-4 rounded-lg neuro-inset">
                  <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                    {clausula.titulo}
                  </p>
                  <p className="text-body-xs text-[var(--text-secondary)] mt-2 whitespace-pre-line">
                    {clausula.texto}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-[var(--text-secondary)]">
              Selecione um contrato para visualizar as cláusulas.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="neuro-raised">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Aditivos registrados</CardTitle>
            <CardDescription>Controle de alterações contratuais</CardDescription>
          </div>
          <Button size="sm" variant="default">
            <Plus className="w-4 h-4" /> Novo aditivo
          </Button>
        </CardHeader>
        <CardContent>
          {selectedContratoId && aditivos.length > 0 ? (
            <Table
              columns={[
                { header: 'Título', accessor: 'titulo' },
                {
                  header: 'Assinado em',
                  accessor: 'data_assinatura',
                  cell: ({ row }) => formatterDate(row.data_assinatura),
                },
                {
                  header: 'Valor ajuste',
                  accessor: 'valor_ajuste',
                  cell: ({ row }) => formatterCurrency.format(row.valor_ajuste ?? 0),
                },
              ]}
              data={aditivos}
            />
          ) : (
            <p className="text-body-sm text-[var(--text-secondary)]">Sem aditivos cadastrados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSLA = () => (
    <Card className="neuro-raised">
      <CardHeader>
        <CardTitle>SLA e indicadores</CardTitle>
        <CardDescription>Metas e penalidades associadas ao contrato</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedContratoId && slas.length > 0 ? (
          <Table
            columns={[
              { header: 'Indicador', accessor: 'indicador' },
              { header: 'Meta', accessor: 'meta' },
              { header: 'Penalidade', accessor: 'penalidade' },
              { header: 'Frequência', accessor: 'frequencia' },
            ]}
            data={slas}
          />
        ) : (
          <p className="text-body-sm text-[var(--text-secondary)]">
            Selecione um contrato para visualizar os SLAs.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderRenovacoes = () => (
    <Card className="neuro-raised">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Processos de renovação</CardTitle>
          <CardDescription>Contratos em renegociação de termos</CardDescription>
        </div>
        <RefreshCw className="w-4 h-4 text-[var(--text-secondary)]" />
      </CardHeader>
      <CardContent>
        <Table
          columns={[
            { header: 'Contrato', accessor: 'titulo' },
            {
              header: 'Valor',
              accessor: 'valor_total',
              cell: ({ row }) => formatterCurrency.format(row.valor_total ?? 0),
            },
            {
              header: 'Renovação automática',
              accessor: 'renovacao_automatica',
              cell: ({ row }) => (row.renovacao_automatica ? 'Sim' : 'Não'),
            },
            {
              header: 'Índice',
              accessor: 'indice_reajuste',
              cell: ({ row }) => prazoLabels[row.indice_reajuste ?? 'nenhum'],
            },
            {
              header: 'Prazo aviso',
              accessor: 'prazo_aviso_rescisao',
              cell: ({ row }) =>
                row.prazo_aviso_rescisao ? `${row.prazo_aviso_rescisao} dias` : '—',
            },
          ]}
          data={contratosOrdenados.filter((contrato) => contrato.status === 'renovacao')}
          emptyState={{
            icon: RefreshCw,
            title: 'Nenhuma renovação',
            description: 'Os contratos ativos serão listados aqui quando entrarem em renegociação.',
          }}
        />
      </CardContent>
    </Card>
  );

  const renderEncerrados = () => (
    <Table
      columns={[
        { header: 'Contrato', accessor: 'titulo' },
        { header: 'Motivo', accessor: 'observacoes' },
        {
          header: 'Encerrado em',
          accessor: 'updated_at',
          cell: ({ row }) => formatterDate(row.updated_at),
        },
        {
          header: 'Valor total',
          accessor: 'valor_total',
          cell: ({ row }) => formatterCurrency.format(row.valor_total ?? 0),
        },
      ]}
      data={contratosOrdenados.filter(
        (contrato) => contrato.status === 'encerrado' || contrato.status === 'cancelado'
      )}
      emptyState={{
        icon: AlertTriangle,
        title: 'Nenhum contrato encerrado',
        description:
          'Histórico ficará disponível aqui quando houver contratos concluídos ou cancelados.',
      }}
    />
  );

  const renderIA = () => (
    <Card className="neuro-raised">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Insights gerados por IA</CardTitle>
          <CardDescription>Recomendações contextuais ContratosAI</CardDescription>
        </div>
        <Button
          variant="default"
          size="sm"
          disabled={!selectedContratoId || iaLoading}
          onClick={() => selectedContratoId && handleExecutarAnaliseIA(selectedContratoId)}
        >
          <Sparkles className={cn('w-4 h-4', iaLoading && 'animate-spin')} />
          {iaLoading ? 'Executando...' : 'Executar análise'}
        </Button>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {iaInsights ? (
          <pre className="text-body-xs whitespace-pre-wrap text-[var(--text-secondary)] bg-[var(--surface)] p-4 rounded-xl neuro-inset">
            {iaInsights}
          </pre>
        ) : (
          <p className="text-body-sm text-[var(--text-secondary)]">
            Execute a análise para gerar recomendações.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderRelatorios = () => (
    <Card className="neuro-raised">
      <CardHeader>
        <CardTitle>Relatórios e exportações</CardTitle>
        <CardDescription>Exportação de dados para BI corporativo</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            id: 'vencimento',
            label: 'Contratos vencendo',
            description: 'CSV com contratos que vencem nos próximos 90 dias',
          },
          {
            id: 'slas',
            label: 'Indicadores SLA',
            description: 'Resumo dos SLAs cumpridos e descumpridos',
          },
          {
            id: 'financeiro',
            label: 'Financeiro consolidado',
            description: 'Visa a integração com Financeiro Avançado',
          },
        ].map((item) => (
          <Card key={item.id} className="neuro-inset">
            <CardContent className="pt-6">
              <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                {item.label}
              </p>
              <p className="text-body-xs text-[var(--text-secondary)] mt-2">{item.description}</p>
              <Button
                variant="default"
                size="sm"
                className="mt-4"
                onClick={() => addToast('Exportação em desenvolvimento', 'info')}
              >
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)]">
              Gestão de Contratos
            </h1>
            <p className="text-body-sm text-[var(--text-secondary)] mt-2">
              Controle completo de contratos de fornecimento, OPME, SLA e renovações com IA e
              alertas proativos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              <Download className="w-4 h-4" /> Exportar visão
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4" /> Novo contrato
            </Button>
          </div>
        </header>

        <Tabs
          value={activeSubmodule}
          onValueChange={setActiveSubmodule}
          className="neuro-raised"
          tabs={submodules.map((sub) => ({ value: sub.id, label: sub.label, icon: sub.icon }))}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-40 rounded-2xl border border-dashed border-[var(--border-muted)]"
              >
                <Spinner size="md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {activeSubmodule === 'dashboard' && renderDashboard()}
            {activeSubmodule === 'ativos' && renderContratosAtivos()}
            {activeSubmodule === 'vencer' && renderContratosVencendo()}
            {activeSubmodule === 'workflow' && renderWorkflow()}
            {activeSubmodule === 'clausulas' && renderClausulasEAditivos()}
            {activeSubmodule === 'sla' && renderSLA()}
            {activeSubmodule === 'renovacoes' && renderRenovacoes()}
            {activeSubmodule === 'encerrados' && renderEncerrados()}
            {activeSubmodule === 'ia' && renderIA()}
            {activeSubmodule === 'relatorios' && renderRelatorios()}
          </div>
        )}
      </div>
    </div>
  );
}
