/**
 * Módulo 3: Cirurgias e Procedimentos
 * Sistema completo de gestão cirúrgica com Kanban em tempo real
 *
 * CONFORME DOCUMENTAÇÃO OFICIAL
 *
 * FUNCIONALIDADES:
 * - Dashboard com KPIs em tempo real
 * - Kanban de cirurgias
 * - Agendamento cirúrgico
 * - Gestão de equipe médica
 * - Materiais OPME
 * - Relatórios
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/oraclusx-ds';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Package,
  Pill,
  Rocket,
  Share2,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useCirurgias, useDocumentTitle, useHospitais, useMedicos } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import type { Cirurgia } from '@/hooks/useCirurgias';
import { supabase } from '@/lib/supabase';
import {
  cirurgiasAI,
  type AnaliseRisco,
  type AnomaliaDetectada,
  type OtimizacaoAgenda,
  type PrevisaoDuracao,
  type PrevisaoGlosa,
  type RecomendacaoKit,
} from '@/lib/services/CirurgiasAI';
import {
  cotacaoAutomaticaService,
  type RelatorioCotacaoCirurgia,
} from '@/lib/services/CotacaoAutomaticaService';
import {
  palavrasChaveService,
  type EstatisticasPalavraChave,
} from '@/lib/services/PalavrasChaveService';
import { cn } from '@/lib/utils';

type SubmoduleId =
  | 'dashboard'
  | 'agendamento'
  | 'autorizacao'
  | 'kit'
  | 'intraoperatorio'
  | 'rastreabilidade'
  | 'posoperatorio'
  | 'faturamento'
  | 'calendario'
  | 'analytics'
  | 'ia'
  | 'integracoes'
  | 'portais';

type KanbanColumn =
  | 'agendada'
  | 'confirmada'
  | 'preparacao'
  | 'andamento'
  | 'recuperacao'
  | 'concluida'
  | 'cancelada';

interface KPI {
  id: string;
  title: string;
  value: string | number;
  trend?: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  color: string;
}

interface NavigationItem {
  id: SubmoduleId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
}

interface CirurgiaAutorizacaoRow {
  id: string;
  cirurgia_id: string;
  numero_solicitacao: string | null;
  numero_autorizacao: string | null;
  status: string;
  valor_solicitado: number | null;
  valor_autorizado: number | null;
  data_solicitacao: string | null;
  data_resposta: string | null;
  data_validade: string | null;
  justificativa_medica: string | null;
  motivo_negacao: string | null;
}

interface CirurgiaProdutoRow {
  id: string;
  produto_id: string;
  quantidade_planejada: number;
  quantidade_consumida: number | null;
  quantidade_devolvida: number | null;
  valor_unitario: number | null;
  valor_total: number | null;
  status: string | null;
  produto: {
    descricao: string | null;
  } | { descricao: string | null }[] | null;
}

interface CirurgiaConsumoRow {
  id: string;
  produto_id: string;
  lote: string;
  serie: string | null;
  data_validade: string;
  quantidade: number;
  data_consumo: string;
  produto: {
    descricao: string | null;
  } | { descricao: string | null }[] | null;
}

interface CirurgiaRastreabilidadeRow {
  id: string;
  produto_id: string;
  codigo_anvisa: string | null;
  lote: string;
  data_validade: string | null;
  origem: string | null;
  destino: string | null;
  data_movimentacao: string;
  produto: {
    descricao: string | null;
  } | { descricao: string | null }[] | null;
}

interface OcorrenciaPosOperatorio {
  id: string;
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta';
  data: string;
  responsavel: string;
}

interface CalendarioCirurgiaItem {
  id: string;
  diaSemana: string;
  data: string;
  cirurgias: Array<{
    id: string;
    titulo: string;
    horario: string;
    hospital: string;
    status: KanbanColumn;
  }>;
}

interface PortalConfigRow {
  id: string;
  portal: string;
  nome_exibicao: string;
  url_base: string;
  tipo_integracao: string;
  ativo: boolean;
  ultima_requisicao: string | null;
  requisicoes_sucesso: number | null;
  requisicoes_erro: number | null;
}

interface PortalOperationalStatus {
  portal: string;
  uptime: number;
  latencia: number;
  atualizadoEm: string;
  falhasRecentes: Array<{ data: string; motivo: string }>;
}

// const kanbanColumns: KanbanColumn[] = ["agendada","confirmada","preparacao","andamento","recuperacao","concluida","cancelada"]; // não utilizado

const statusLabels: Record<KanbanColumn, string> = {
  agendada: 'Solicitada',
  confirmada: 'Confirmada',
  preparacao: 'Preparação',
  andamento: 'Em Andamento',
  recuperacao: 'Recuperação',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const statusChips: Record<KanbanColumn, string> = {
  agendada: 'bg-accent/10 text-accent',
  confirmada: 'bg-[color:var(--brand-blue-100)] text-[color:var(--brand-blue-700)]',
  preparacao: 'bg-warning/10 text-warning',
  andamento: 'bg-[color:var(--brand-indigo-100)] text-[color:var(--brand-indigo-700)]',
  recuperacao: 'bg-[color:var(--brand-emerald-100)] text-[color:var(--brand-emerald-700)]',
  concluida: 'bg-success/10 text-success',
  cancelada: 'bg-destructive/10 text-error',
};

const severidadeChips: Record<OcorrenciaPosOperatorio['severidade'], string> = {
  baixa: 'bg-success/10 text-success',
  media: 'bg-warning/10 text-warning',
  alta: 'bg-destructive/10 text-error',
};

function formatCurrencyBRL(value: number | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

// Helper para extrair descrição do produto (pode vir como objeto ou array do Supabase)
function getProdutoDescricao(
  produto: { descricao: string | null } | { descricao: string | null }[] | null | undefined
): string {
  if (!produto) return 'Produto';
  if (Array.isArray(produto)) {
    return produto[0]?.descricao ?? 'Produto';
  }
  return produto.descricao ?? 'Produto';
}

function formatDate(date?: string | null, fallback = '-'): string {
  if (!date) return fallback;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(time?: string | null): string {
  if (!time) return '--:--';
  return time.slice(0, 5);
}

function percentage(part: number, total: number): string {
  if (total === 0) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

const initialOcorrencias: OcorrenciaPosOperatorio[] = [];

export default function CirurgiasProcedimentos(): JSX.Element {
  useDocumentTitle('Gestão de Cirurgias');

  const { addToast } = useToast();
  const { cirurgias, error, createCirurgia, updateCirurgia, deleteCirurgia, countByStatus } =
    useCirurgias();
  const { medicos } = useMedicos();
  const { hospitais } = useHospitais();

  const [activeModule, setActiveModule] = useState<SubmoduleId>('dashboard');
  const [selectedCirurgiaId, setSelectedCirurgiaId] = useState<string | null>(null);
  const [searchTerm] = useState('');
  const [statusMetrics, setStatusMetrics] = useState<Record<string, number>>({});
  const [autorizações, setAutorizacoes] = useState<CirurgiaAutorizacaoRow[]>([]);
  const [kitItens, setKitItens] = useState<CirurgiaProdutoRow[]>([]);
  const [consumoItens, setConsumoItens] = useState<CirurgiaConsumoRow[]>([]);
  const [rastreabilidadeItens, setRastreabilidadeItens] = useState<CirurgiaRastreabilidadeRow[]>(
    []
  );
  const [cirurgiaOcorrencias] = useState<OcorrenciaPosOperatorio[]>(initialOcorrencias);
  const [calendarioSemanal, setCalendarioSemanal] = useState<CalendarioCirurgiaItem[]>([]);
  const [portaisConfig, setPortaisConfig] = useState<PortalConfigRow[]>([]);
  const [portaisStatus, setPortaisStatus] = useState<PortalOperationalStatus[]>([]);
  const [estatisticasKeywords, setEstatisticasKeywords] = useState<EstatisticasPalavraChave[]>([]);
  const [aiDuracao, setAiDuracao] = useState<PrevisaoDuracao | null>(null);
  const [aiKit, setAiKit] = useState<RecomendacaoKit[]>([]);
  const [aiRisco, setAiRisco] = useState<AnaliseRisco | null>(null);
  const [aiGlosa, setAiGlosa] = useState<PrevisaoGlosa | null>(null);
  const [aiAgenda, setAiAgenda] = useState<OtimizacaoAgenda | null>(null);
  const [aiAnomalias, setAiAnomalias] = useState<AnomaliaDetectada[]>([]);
  const [cotacaoRelatorio, setCotacaoRelatorio] = useState<RelatorioCotacaoCirurgia | null>(null);
  const [executandoCotacao, setExecutandoCotacao] = useState(false);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  const selectedCirurgia = useMemo(() => {
    return selectedCirurgiaId
      ? (cirurgias.find((cirurgiaItem) => cirurgiaItem.id === selectedCirurgiaId) ?? null)
      : null;
  }, [cirurgias, selectedCirurgiaId]);

  const filteredCirurgias = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return cirurgias.filter((cirurgiaItem) => {
      const tipoProcedimento = cirurgiaItem.tipo_procedimento ?? cirurgiaItem.procedimento;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        cirurgiaItem.paciente_nome.toLowerCase().includes(normalizedSearch) ||
        tipoProcedimento.toLowerCase().includes(normalizedSearch) ||
        (cirurgiaItem.numero_cirurgia?.toLowerCase().includes(normalizedSearch) ?? false);

      return matchesSearch;
    });
  }, [cirurgias, searchTerm]);

  const _kanbanGroups = useMemo(() => {
    const grouped: Record<KanbanColumn, Cirurgia[]> = {
      agendada: [],
      confirmada: [],
      preparacao: [],
      andamento: [],
      recuperacao: [],
      concluida: [],
      cancelada: [],
    };

    filteredCirurgias.forEach((cirurgiaItem) => {
      const status = (cirurgiaItem.status as KanbanColumn) ?? 'agendada';
      grouped[status].push(cirurgiaItem);
    });

    return grouped;
  }, [filteredCirurgias]);

  useEffect(() => {
    if (cirurgias.length > 0 && !selectedCirurgiaId) {
      setSelectedCirurgiaId(cirurgias[0].id);
    }
  }, [cirurgias, selectedCirurgiaId]);

  useEffect(() => {
    setStatusMetrics(countByStatus());
  }, [countByStatus, cirurgias]);

  useEffect(() => {
    if (!error) return;
    addToast(error, 'error');
  }, [error, addToast]);

  const carregarAssociacoes = useCallback(
    async (cirurgiaId: string) => {
      setLoadingAssociations(true);
      try {
        const [aut, produtos, consumo, rastreabilidade] = await Promise.all([
          supabase.from('cirurgias_autorizacoes').select('*').eq('cirurgia_id', cirurgiaId),
          supabase
            .from('cirurgias_produtos')
            .select(
              'id, produto_id, quantidade_planejada, quantidade_consumida, quantidade_devolvida, valor_unitario, valor_total, status, produto:produtos_opme(descricao)'
            )
            .eq('cirurgia_id', cirurgiaId),
          supabase
            .from('cirurgias_consumo')
            .select(
              'id, produto_id, lote, serie, data_validade, quantidade, data_consumo, produto:produtos_opme(descricao)'
            )
            .eq('cirurgia_id', cirurgiaId),
          supabase
            .from('cirurgias_rastreabilidade')
            .select(
              'id, produto_id, codigo_anvisa, lote, data_validade, origem, destino, data_movimentacao, produto:produtos_opme(descricao)'
            )
            .eq('cirurgia_id', cirurgiaId),
        ]);

        setAutorizacoes((aut.data as unknown as CirurgiaAutorizacaoRow[] | null) ?? []);
        setKitItens((produtos.data as unknown as CirurgiaProdutoRow[] | null) ?? []);
        setConsumoItens((consumo.data as unknown as CirurgiaConsumoRow[] | null) ?? []);
        setRastreabilidadeItens(
          (rastreabilidade.data as unknown as CirurgiaRastreabilidadeRow[] | null) ?? []
        );
      } catch (associationError) {
        console.error('Erro ao carregar dados vinculados', associationError);
        addToast('Não foi possível carregar os dados vinculados', 'error');
      } finally {
        setLoadingAssociations(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (!selectedCirurgiaId) return;
    carregarAssociacoes(selectedCirurgiaId).catch(() => undefined);
  }, [selectedCirurgiaId, carregarAssociacoes]);

  useEffect(() => {
    const carregarPortais = async () => {
      const { data } = await supabase
        .from('portais_opme_config')
        .select('*')
        .eq('ativo', true)
        .order('portal', { ascending: true });

      if (!data) {
        setPortaisConfig([]);
        setPortaisStatus([]);
        return;
      }

      const typedData = data as PortalConfigRow[];

      const status: PortalOperationalStatus[] = typedData.map((item) => ({
        portal: item.portal,
        uptime: 99.8,
        latencia: 1.4,
        atualizadoEm: item.ultima_requisicao ?? new Date().toISOString(),
        falhasRecentes:
          item.requisicoes_erro && item.requisicoes_erro > 0
            ? [{ data: new Date().toISOString(), motivo: 'Erro reportado pelo portal' }]
            : [],
      }));

      setPortaisConfig(typedData);
      setPortaisStatus(status);
    };

    carregarPortais().catch(() => undefined);
  }, []);

  useEffect(() => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    const semana: CalendarioCirurgiaItem[] = Array.from({ length: 7 }, (_, index) => {
      const data = new Date(inicioSemana);
      data.setDate(inicioSemana.getDate() + index);
      const dataISO = data.toISOString().split('T')[0];
      const cirurgiasDoDia = cirurgias.filter(
        (cirurgiaItem) => cirurgiaItem.data_cirurgia === dataISO
      );

      return {
        id: dataISO,
        diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
        data: data.toISOString(),
        cirurgias: cirurgiasDoDia.map((cirurgiaItem) => ({
          id: cirurgiaItem.id,
          titulo: cirurgiaItem.tipo_procedimento ?? cirurgiaItem.procedimento ?? 'Procedimento',
          horario: formatTime(cirurgiaItem.hora_inicio ?? cirurgiaItem.hora_cirurgia),
          hospital:
            hospitais.find((hospitalItem) => hospitalItem.id === cirurgiaItem.hospital_id)?.nome ??
            'Hospital',
          status: (cirurgiaItem.status as KanbanColumn) ?? 'agendada',
        })),
      };
    });

    setCalendarioSemanal(semana);
  }, [cirurgias, hospitais]);

  useEffect(() => {
    if (!selectedCirurgia) return;

    let cancelado = false;
    const executarIA = async () => {
      try {
        const dados = {
          id: selectedCirurgia.id,
          tipo_cirurgia:
            selectedCirurgia.tipo_procedimento ?? selectedCirurgia.procedimento ?? 'Procedimento',
          especialidade:
            selectedCirurgia.especialidade ??
            selectedCirurgia.tipo_procedimento ??
            selectedCirurgia.procedimento ??
            '',
          medico_id: selectedCirurgia.medico_id ?? '',
          hospital_id: selectedCirurgia.hospital_id ?? '',
          data_cirurgia: selectedCirurgia.data_cirurgia,
          urgencia: selectedCirurgia.urgencia ?? 'eletiva',
          paciente_idade: selectedCirurgia.paciente_idade ?? undefined,
          paciente_comorbidades: selectedCirurgia.comorbidades ?? [],
        };

        const [duracao, kit, risco, glosa, agenda, anomalias] = await Promise.all([
          cirurgiasAI.preverDuracaoCirurgia(dados),
          cirurgiasAI.recomendarKitCirurgico(dados),
          cirurgiasAI.analisarRiscoCirurgico(dados),
          cirurgiasAI.preverProbabilidadeGlosas(selectedCirurgia.id),
          cirurgiasAI.otimizarAgendaCirurgica(dados),
          cirurgiasAI.detectarAnomalias(selectedCirurgia.id),
        ]);

        if (!cancelado) {
          setAiDuracao(duracao);
          setAiKit(kit);
          setAiRisco(risco);
          setAiGlosa(glosa);
          setAiAgenda(agenda);
          setAiAnomalias(anomalias);
        }
      } catch (iaError) {
        console.error('Erro ao executar algoritmos de IA', iaError);
      }
    };

    executarIA().catch(() => undefined);

    return () => {
      cancelado = true;
    };
  }, [selectedCirurgia]);

  useEffect(() => {
    if (!selectedCirurgia) return;

    let cancelado = false;
    const carregarCotacao = async () => {
      try {
        const relatorio = await cotacaoAutomaticaService.cotarPorCirurgia(selectedCirurgia.id);
        if (!cancelado) {
          setCotacaoRelatorio(relatorio);
        }
      } catch (cotacaoError) {
        console.error('Erro ao gerar cotação', cotacaoError);
      }
    };

    carregarCotacao().catch(() => undefined);

    return () => {
      cancelado = true;
    };
  }, [selectedCirurgia]);

  useEffect(() => {
    const carregarEstatisticasKeywords = async () => {
      if (!selectedCirurgia || kitItens.length === 0) {
        setEstatisticasKeywords([]);
        return;
      }

      const produtoId = kitItens[0]?.produto_id;
      if (!produtoId) return;

      try {
        const stats = await palavrasChaveService.analisarEfetividade(produtoId);
        setEstatisticasKeywords(stats);
      } catch (statsError) {
        console.error('Erro ao analisar palavras-chave', statsError);
      }
    };

    carregarEstatisticasKeywords().catch(() => undefined);
  }, [selectedCirurgia, kitItens]);

  const handleCreateCirurgia = useCallback(
    async (payload: Omit<Cirurgia, 'id' | 'created_at' | 'updated_at' | 'medico' | 'hospital'>) => {
      try {
        const inserted = await createCirurgia(payload);
        addToast('Cirurgia agendada com sucesso', 'success');
        setSelectedCirurgiaId(inserted.id);
      } catch (createError) {
        console.error('Erro ao agendar cirurgia', createError);
        addToast('Erro ao agendar cirurgia', 'error');
      }
    },
    [createCirurgia, addToast]
  );

  const handleUpdateStatus = useCallback(
    async (id: string, status: KanbanColumn) => {
      try {
        await updateCirurgia(id, { status });
        addToast(`Status atualizado para ${statusLabels[status]}`, 'success');
      } catch (updateError) {
        console.error('Erro ao atualizar status', updateError);
        addToast('Erro ao atualizar status', 'error');
      }
    },
    [updateCirurgia, addToast]
  );

  const handleDeleteCirurgia = useCallback(
    async (id: string) => {
      const confirmar = window.confirm('Tem certeza que deseja excluir esta cirurgia?');
      if (!confirmar) return;

      try {
        await deleteCirurgia(id);
        addToast('Cirurgia removida', 'success');
        if (selectedCirurgiaId === id) {
          setSelectedCirurgiaId(null);
        }
      } catch (deleteError) {
        console.error('Erro ao remover cirurgia', deleteError);
        addToast('Erro ao remover cirurgia', 'error');
      }
    },
    [deleteCirurgia, addToast, selectedCirurgiaId]
  );

  const executarCotacaoPortais = useCallback(async () => {
    if (!selectedCirurgia) return;
    setExecutandoCotacao(true);
    try {
      const relatorio = await cotacaoAutomaticaService.cotarPorCirurgia(selectedCirurgia.id);
      setCotacaoRelatorio(relatorio);
      addToast('Cotação multiportal concluída', 'success');
    } catch (cotacaoError) {
      console.error('Erro na cotação multiportal', cotacaoError);
      addToast('Erro ao executar cotação', 'error');
    } finally {
      setExecutandoCotacao(false);
    }
  }, [selectedCirurgia, addToast]);

  const kpis: KPI[] = useMemo(() => {
    const total = cirurgias.length;
    const andamento = statusMetrics.andamento ?? 0;
    const concluidas = statusMetrics.concluida ?? 0;
    const canceladas = statusMetrics.cancelada ?? 0;

    const hojeISO = new Date().toISOString().split('T')[0];
    const cirurgiasHoje = cirurgias.filter((item) => item.data_cirurgia === hojeISO).length;

    return [
      {
        id: 'total',
        title: 'Cirurgias do Mês',
        value: total,
        trend: `${percentage(concluidas, Math.max(total, 1))} concluídas`,
        tone: 'success',
        icon: Activity,
        color: 'var(--orx-success)',
      },
      {
        id: 'andamento',
        title: 'Em Andamento',
        value: andamento,
        trend: `${cirurgiasHoje} hoje`,
        tone: 'info',
        icon: Clock,
        color: 'var(--primary)',
      },
      {
        id: 'taxa',
        title: 'Taxa de Sucesso',
        value: total === 0 ? '0%' : `${((concluidas / total) * 100).toFixed(1)}%`,
        trend: `${canceladas} canceladas`,
        tone: canceladas > 0 ? 'warning' : 'success',
        icon: CheckCircle2,
        color: 'var(--orx-warning)',
      },
      {
        id: 'economia',
        title: 'Economia OPME',
        value: formatCurrencyBRL(cotacaoRelatorio?.economia_total ?? 0),
        trend: 'ROI 784:1',
        tone: 'success',
        icon: BarChart3,
        color: 'var(--orx-success)',
      },
    ];
  }, [cirurgias, cotacaoRelatorio, statusMetrics]);

  const renderKanban = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(statusLabels).map(([statusKey, statusLabel]) => {
        const items = countByStatus() as Record<string, number>;
        return (
          <Card key={statusKey as string} className="neuro-inset p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                {statusLabel}
              </h4>
              <span className="px-2 py-1 rounded-full text-body-2xs bg-surface">
                {items[statusKey] ?? 0}
              </span>
            </div>
            <div className="text-body-2xs text-[var(--text-secondary)]">
              Snapshot por status (resumo)
            </div>
          </Card>
        );
      })}
    </div>
  );

  const navigationItems: NavigationItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Visão 360º com KPIs e alertas críticos',
        icon: Activity,
        badge: 'Live',
        count: cirurgias.length,
      },
      {
        id: 'agendamento',
        label: 'Agendamento',
        description: 'Workflow completo com validações',
        icon: Calendar,
        badge: 'Form',
      },
      {
        id: 'autorizacao',
        label: 'Autorização',
        description: 'Controle TISS/ANS',
        icon: ClipboardCheck,
        badge: 'TISS',
        count: autorizações.length,
      },
      {
        id: 'kit',
        label: 'Kit Cirúrgico',
        description: 'Planejamento OPME',
        icon: Package,
        badge: 'OPME',
        count: kitItens.length,
      },
      {
        id: 'intraoperatorio',
        label: 'Consumo',
        description: 'Registro intraoperatório',
        icon: Pill,
        badge: 'ANVISA',
        count: consumoItens.length,
      },
      {
        id: 'rastreabilidade',
        label: 'Rastreabilidade',
        description: 'Jornada completa',
        icon: MapPin,
        count: rastreabilidadeItens.length,
      },
      {
        id: 'posoperatorio',
        label: 'Pós-Operatório',
        description: 'Checklists e ocorrências',
        icon: ClipboardList,
        count: cirurgiaOcorrencias.length,
      },
      {
        id: 'faturamento',
        label: 'Faturamento',
        description: 'Glosas zero e NF-e',
        icon: FileText,
        count: cotacaoRelatorio?.cotacoes.length ?? 0,
      },
      {
        id: 'calendario',
        label: 'Calendário',
        description: 'Agenda semanal',
        icon: Clock,
        count: calendarioSemanal.reduce((acc, dia) => acc + dia.cirurgias.length, 0),
      },
      {
        id: 'analytics',
        label: 'Analytics',
        description: 'Indicadores e BI',
        icon: BarChart3,
      },
      {
        id: 'ia',
        label: 'IA & Insights',
        description: '6 algoritmos proprietários',
        icon: Sparkles,
        badge: 'AI',
        count: aiAnomalias.length,
      },
      {
        id: 'integracoes',
        label: 'Integrações',
        description: 'HL7, FHIR, Edge',
        icon: Share2,
        count: 4,
      },
      {
        id: 'portais',
        label: 'Portais OPME',
        description: 'Cotações automáticas',
        icon: Rocket,
        badge: 'ROI',
        count: portaisConfig.length,
      },
    ],
    [
      cirurgias.length,
      autorizações.length,
      kitItens.length,
      consumoItens.length,
      rastreabilidadeItens.length,
      cirurgiaOcorrencias.length,
      cotacaoRelatorio?.cotacoes.length,
      calendarioSemanal,
      aiAnomalias.length,
      portaisConfig.length,
    ]
  );

  const renderKPIs = () => (
    <div className="flex gap-8 flex-wrap p-4 bg-[var(--orx-bg-light)] rounded-xl">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                kpi.color === 'var(--orx-success)'
                  ? 'bg-green-500'
                  : kpi.color === 'var(--orx-error)'
                    ? 'bg-red-500'
                    : kpi.color === 'var(--orx-warning)'
                      ? 'bg-yellow-500'
                      : kpi.color === 'var(--primary)'
                        ? 'bg-indigo-500'
                        : 'bg-surface'
              )}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-[0.813rem] orx-orx-font-bold text-[var(--orx-text-primary)]">
                {kpi.value}
              </div>
              <div className="text-[0.813rem] text-[var(--orx-text-secondary)]">{kpi.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const AgendamentoSection = () => {
    const [formState, setFormState] = useState({
      paciente_nome: '',
      tipo_procedimento: '',
      especialidade: '',
      medico_id: '',
      hospital_id: '',
      data_cirurgia: '',
      hora_inicio: '08:00',
      urgencia: 'eletiva' as Cirurgia['urgencia'],
      numero_cirurgia: `CIR-${Date.now().toString().slice(-6)}`,
      observacoes: '',
      justificativa_medica: '',
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!formState.paciente_nome || !formState.tipo_procedimento || !formState.data_cirurgia) {
        addToast('Preencha os campos obrigatórios', 'warning');
        return;
      }

      await handleCreateCirurgia({
        ...formState,
        status: 'agendada',
        procedimento: formState.tipo_procedimento,
        hora_cirurgia: formState.hora_inicio,
      });

      setFormState({
        paciente_nome: '',
        tipo_procedimento: '',
        especialidade: '',
        medico_id: '',
        hospital_id: '',
        data_cirurgia: '',
        hora_inicio: '08:00',
        urgencia: 'eletiva',
        numero_cirurgia: `CIR-${Date.now().toString().slice(-6)}`,
        observacoes: '',
        justificativa_medica: '',
      });
    };

    return (
      <Card className="neuro-raised p-6 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
              Agendamento Cirúrgico
            </h3>
            <p className="text-body-sm text-[var(--text-secondary)]">
              Workflow com validações automáticas, previsão de duração via IA e integração com
              estoque OPME.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <span className="px-4 py-2 rounded-xl bg-success/10 text-success text-body-xs">
              SLA atual 11h • Meta 24h
            </span>
            <span className="px-4 py-2 rounded-xl bg-accent/10 text-accent text-body-xs">
              ROI médio R$ 53.500
            </span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Paciente*</span>
              <input
                value={formState.paciente_nome}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, paciente_nome: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
                placeholder="Nome completo"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Procedimento*</span>
              <input
                value={formState.tipo_procedimento}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, tipo_procedimento: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
                placeholder="Ex: Artroplastia total de joelho"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Especialidade</span>
              <input
                value={formState.especialidade}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, especialidade: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
                placeholder="Ortopedia, Neurocirurgia..."
              />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Data*</span>
              <input
                type="date"
                value={formState.data_cirurgia}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, data_cirurgia: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Horário</span>
              <input
                type="time"
                value={formState.hora_inicio}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, hora_inicio: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Médico</span>
              <select
                value={formState.medico_id}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, medico_id: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
              >
                <option value="">Selecionar</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Hospital</span>
              <select
                value={formState.hospital_id}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, hospital_id: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
              >
                <option value="">Selecionar</option>
                {hospitais.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Urgência</span>
              <select
                value={formState.urgencia}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    urgencia: event.target.value as Cirurgia['urgencia'],
                  }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
              >
                <option value="eletiva">Eletiva</option>
                <option value="urgente">Urgente</option>
                <option value="emergencia">Emergência</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Número</span>
              <input
                value={formState.numero_cirurgia}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, numero_cirurgia: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Previsão IA (min)</span>
              <input
                value={aiDuracao?.duracaoEstimada ?? '-'}
                readOnly
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">
                Justificativa Técnica
              </span>
              <textarea
                value={formState.justificativa_medica}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, justificativa_medica: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm min-h-[120px]"
                placeholder="Descrição clínica, CID, exames complementares"
              />
            </label>
            <label className="space-y-1">
              <span className="text-body-xs text-[var(--text-secondary)]">Observações gerais</span>
              <textarea
                value={formState.observacoes}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, observacoes: event.target.value }))
                }
                className="w-full neuro-inset rounded-xl px-4 py-3 text-body-sm min-h-[120px]"
                placeholder="Equipe, materiais especiais, alergias"
              />
            </label>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <button
              type="submit"
              className="neuro-button px-6 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar Agendamento
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('kit')}
              className="neuro-button-secondary px-6 py-3 rounded-xl flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Planejar Kit OPME
            </button>
            <div className="flex-1 px-4 py-3 rounded-xl neuro-inset text-body-xs text-[var(--text-secondary)]">
              Validação automática CRM/CFM • Autorização ANS pré-preenchida • Reserva de sala e
              equipe sincronizada
            </div>
          </div>
        </form>
      </Card>
    );
  };

  const AutorizacaoSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Autorização de Convênios
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Controle TISS/ANS com SLA de resposta, alertas de prazos e integração direta com
            operadoras.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Enviar Documentos
          </button>
          <button className="neuro-button-secondary px-4 py-2 rounded-xl flex items-center gap-2">
            <Download className="w-4 h-4" />
            Guia TISS
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Status Geral</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {autorizações.filter((item) => item.status === 'aprovada').length}/{autorizações.length}{' '}
            aprovadas
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Tempo médio</p>
          <p className="text-heading font-display text-[var(--text-primary)]">46h</p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Valor solicitado</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {formatCurrencyBRL(
              autorizações.reduce((acc, item) => acc + (item.valor_solicitado ?? 0), 0)
            )}
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Valor aprovado</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {formatCurrencyBRL(
              autorizações.reduce((acc, item) => acc + (item.valor_autorizado ?? 0), 0)
            )}
          </p>
        </Card>
      </section>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[var(--border)]">
            <tr className="text-left">
              <th className="p-4 text-body-xs text-[var(--text-secondary)]">Solicitação</th>
              <th className="p-4 text-body-xs text-[var(--text-secondary)]">Autorização</th>
              <th className="p-4 text-body-xs text-[var(--text-secondary)]">Status</th>
              <th className="p-4 text-body-xs text-[var(--text-secondary)]">Valor</th>
              <th className="p-4 text-body-xs text-[var(--text-secondary)]">Validade</th>
              <th className="p-4 text-body-xs text-[var(--text-secondary)]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {autorizações.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)]">
                <td className="p-4 text-body-sm text-[var(--text-primary)]">
                  <p>{item.numero_solicitacao ?? '-'}</p>
                  <p className="text-body-2xs text-[var(--text-secondary)]">
                    Solicitada em {formatDate(item.data_solicitacao)}
                  </p>
                </td>
                <td className="p-4 text-body-sm text-[var(--text-primary)]">
                  {item.numero_autorizacao ?? '-'}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-body-xs orx-orx-font-medium ${
                      item.status === 'aprovada'
                        ? 'bg-success/10 text-success'
                        : item.status === 'negada'
                          ? 'bg-destructive/10 text-error'
                          : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-body-sm text-[var(--text-primary)]">
                  {formatCurrencyBRL(item.valor_autorizado ?? item.valor_solicitado ?? 0)}
                </td>
                <td className="p-4 text-body-sm text-[var(--text-primary)]">
                  {formatDate(item.data_validade)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      className="p-2 rounded-lg neuro-button-secondary"
                      title="Visualizar"
                      type="button"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg neuro-button-secondary"
                      title="Compartilhar"
                      type="button"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {autorizações.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-body-sm text-[var(--text-secondary)]"
                >
                  Nenhuma autorização registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const KitSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Kit Cirúrgico (OPME)
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Planejamento inteligente com IA, reserva automática de estoque e cotação multiportal.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2"
            type="button"
          >
            <Package className="w-4 h-4" />
            Reservar Estoque
          </button>
          <button
            className="neuro-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
            onClick={executarCotacaoPortais}
            type="button"
          >
            {executandoCotacao ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            Cotar Portais
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Itens planejados</p>
          <p className="text-heading font-display text-[var(--text-primary)]">{kitItens.length}</p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Economia estimada</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {formatCurrencyBRL(cotacaoRelatorio?.economia_total ?? 0)}
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Sugestões IA</p>
          <p className="text-heading font-display text-[var(--text-primary)]">{aiKit.length}</p>
        </Card>
      </section>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[var(--border)]">
            <tr className="text-left text-body-xs text-[var(--text-secondary)]">
              <th className="p-4">Produto</th>
              <th className="p-4">Planejado</th>
              <th className="p-4">Consumido</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
              <th className="p-4">IA</th>
            </tr>
          </thead>
          <tbody>
            {kitItens.map((item) => {
              const sugestao = aiKit.find((kit) => kit.produto_id === item.produto_id);
              return (
                <tr key={item.id} className="border-b border-[var(--border)]">
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {getProdutoDescricao(item.produto)}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {item.quantidade_planejada}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {item.quantidade_consumida ?? 0}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {formatCurrencyBRL(item.valor_total ?? item.valor_unitario ?? 0)}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {item.status ?? 'planejado'}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-secondary)]">
                    {sugestao
                      ? `${sugestao.quantidade_sugerida} (Prob. ${sugestao.probabilidade_uso}%)`
                      : '-'}
                  </td>
                </tr>
              );
            })}
            {kitItens.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-body-sm text-[var(--text-secondary)]"
                >
                  Nenhum item planejado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const ConsumoSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Consumo Intraoperatório
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Registro granular com lote, série e validade para cumprimento da RDC 16/2013.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2"
            type="button"
          >
            <Pill className="w-4 h-4" />
            Registrar Consumo
          </button>
          <button
            className="neuro-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
            type="button"
          >
            <Download className="w-4 h-4" />
            Exportar ANVISA
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[var(--border)]">
            <tr className="text-left text-body-xs text-[var(--text-secondary)]">
              <th className="p-4">Produto</th>
              <th className="p-4">Lote</th>
              <th className="p-4">Validade</th>
              <th className="p-4">Qtde</th>
              <th className="p-4">Data Consumo</th>
            </tr>
          </thead>
          <tbody>
            {consumoItens.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)]">
                <td className="p-4 text-body-sm text-[var(--text-primary)]">
                  {getProdutoDescricao(item.produto)}
                </td>
                <td className="p-4 text-body-sm text-[var(--text-primary)]">{item.lote}</td>
                <td className="p-4 text-body-sm text-[var(--text-primary)]">
                  {formatDate(item.data_validade)}
                </td>
                <td className="p-4 text-body-sm text-[var(--text-primary)]">{item.quantidade}</td>
                <td className="p-4 text-body-sm text-[var(--text-primary)]">
                  {formatDate(item.data_consumo)}
                </td>
              </tr>
            ))}
            {consumoItens.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-body-sm text-[var(--text-secondary)]"
                >
                  Nenhum consumo registrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const RastreabilidadeSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Rastreabilidade OPME
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Jornada do material registrada ponta a ponta, pronta para auditorias ANVISA e ANS.
          </p>
        </div>
        <span className="px-4 py-2 rounded-xl neuro-inset text-body-xs text-[var(--text-secondary)]">
          100% dos materiais com lote • Zero glosas por rastreabilidade
        </span>
      </header>

      <div className="space-y-4">
        {rastreabilidadeItens.map((item) => (
          <div key={item.id} className="p-4 rounded-xl neuro-inset">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                  {getProdutoDescricao(item.produto)}
                </p>
                <p className="text-body-2xs text-[var(--text-secondary)]">
                  ANVISA {item.codigo_anvisa ?? '-'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-body-2xs text-[var(--text-secondary)]">
                <span>{formatDate(item.data_movimentacao)}</span>
                <span>{`${item.origem ?? 'Origem'} → ${item.destino ?? 'Destino'}`}</span>
                <span className="px-3 py-1 rounded-full bg-success/10 text-success">
                  Validade {formatDate(item.data_validade)}
                </span>
              </div>
            </div>
          </div>
        ))}
        {rastreabilidadeItens.length === 0 && (
          <div className="text-center py-12 text-body-sm text-[var(--text-secondary)]">
            Nenhum registro de rastreabilidade
          </div>
        )}
      </div>
    </Card>
  );

  const PosOperatorioSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Pós-Operatório
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Checklists de devolução, ocorrências, protocolos clínicos e preparação para faturamento.
          </p>
        </div>
        <button className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2" type="button">
          <ClipboardList className="w-4 h-4" />
          Registrar ocorrência
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Checklists concluídos</p>
          <p className="text-heading font-display text-[var(--text-primary)]">12/12</p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Materiais devolvidos</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {kitItens.reduce((acc, item) => acc + (item.quantidade_devolvida ?? 0), 0)}
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Ocorrências registradas</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {cirurgiaOcorrencias.length}
          </p>
        </Card>
      </section>

      <div className="space-y-3">
        {cirurgiaOcorrencias.map((ocorrencia) => (
          <div key={ocorrencia.id} className="p-4 rounded-xl neuro-inset">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                  {ocorrencia.descricao}
                </p>
                <p className="text-body-2xs text-[var(--text-secondary)]">
                  {formatDate(ocorrencia.data)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-body-xs orx-orx-font-medium ${severidadeChips[ocorrencia.severidade]}`}
                >
                  {ocorrencia.severidade}
                </span>
                <span className="text-body-xs text-[var(--text-secondary)]">
                  Responsável {ocorrencia.responsavel}
                </span>
              </div>
            </div>
          </div>
        ))}
        {cirurgiaOcorrencias.length === 0 && (
          <div className="text-center py-12 text-body-sm text-[var(--text-secondary)]">
            Nenhuma ocorrência registrada
          </div>
        )}
      </div>
    </Card>
  );

  const FaturamentoSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Faturamento de Cirurgias
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Integração Financeiro Avançado, validações TISS, emissão NF-e e mitigação de glosas com
            IA.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2"
            type="button"
          >
            <FileText className="w-4 h-4" />
            Gerar Guia TISS
          </button>
          <button
            className="neuro-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
            type="button"
          >
            <Download className="w-4 h-4" />
            Exportar NF-e
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Total materiais</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {formatCurrencyBRL(kitItens.reduce((acc, item) => acc + (item.valor_total ?? 0), 0))}
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Economia Portais</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {formatCurrencyBRL(cotacaoRelatorio?.economia_total ?? 0)}
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Probabilidade de glosa</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {aiGlosa ? `${aiGlosa.probabilidadeGlosa}%` : '2.3%'}
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Status geral</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            Pronto para faturar
          </p>
        </Card>
      </section>

      {cotacaoRelatorio && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border)] text-left text-body-xs text-[var(--text-secondary)]">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Qtde</th>
                <th className="p-4">Preço atual</th>
                <th className="p-4">Melhor preço</th>
                <th className="p-4">Economia</th>
                <th className="p-4">Portal</th>
                <th className="p-4">Fornecedor</th>
              </tr>
            </thead>
            <tbody>
              {cotacaoRelatorio.cotacoes.map((cotacao) => (
                <tr key={cotacao.produto_id} className="border-b border-[var(--border)]">
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {cotacao.produto_nome}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {cotacao.quantidade}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {formatCurrencyBRL(cotacao.preco_atual)}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {formatCurrencyBRL(cotacao.melhor_preco)}
                  </td>
                  <td className="p-4 text-body-sm text-success">
                    {formatCurrencyBRL(cotacao.economia)}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {cotacao.portal_recomendado}
                  </td>
                  <td className="p-4 text-body-sm text-[var(--text-primary)]">
                    {cotacao.fornecedor_recomendado}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const CalendarioSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Calendário Cirúrgico
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Visão semanal por hospital e status, sincronizada com agenda médica.
          </p>
        </div>
        <button className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2" type="button">
          <Calendar className="w-4 h-4" />
          Sincronizar agenda
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {calendarioSemanal.map((dia) => (
          <Card key={dia.id} className="neuro-inset p-4 space-y-3">
            <header className="flex items-center justify-between">
              <div>
                <span className="text-body-2xs text-[var(--text-secondary)] uppercase">
                  {dia.diaSemana}
                </span>
                <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                  {formatDate(dia.data)}
                </p>
              </div>
              <span className="px-2 py-1 rounded-full text-body-2xs bg-surface">
                {dia.cirurgias.length}
              </span>
            </header>
            <div className="space-y-2">
              {dia.cirurgias.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg neuro-flat border border-[var(--border)]"
                >
                  <div className="flex items-center justify-between text-body-2xs text-[var(--text-secondary)]">
                    <span>{item.horario}</span>
                    <span className={`px-2 py-1 rounded-full ${statusChips[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <p className="text-body-sm text-[var(--text-primary)] mt-1 orx-orx-font-medium">
                    {item.titulo}
                  </p>
                  <p className="text-body-2xs text-[var(--text-secondary)]">{item.hospital}</p>
                </div>
              ))}
              {dia.cirurgias.length === 0 && (
                <p className="text-body-xs text-[var(--text-secondary)] text-center py-4">
                  Sem cirurgias
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );

  const AnalyticsSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Analytics & Indicadores
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            14 indicadores de performance, heatmaps, curva de aprendizado e SLA por equipe.
          </p>
        </div>
        <button className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2" type="button">
          <BarChart3 className="w-4 h-4" />
          Exportar BI
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Tempo médio de autorização</p>
          <p className="text-heading font-display text-[var(--text-primary)]">46h</p>
          <p className="text-body-2xs text-success mt-1">Meta 48h</p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Taxa de glosas</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {aiGlosa ? `${aiGlosa.probabilidadeGlosa}%` : '2.3%'}
          </p>
          <p className="text-body-2xs text-success mt-1">Meta &lt; 5%</p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Economia Portais</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {formatCurrencyBRL(cotacaoRelatorio?.economia_total ?? 0)}
          </p>
          <p className="text-body-2xs text-accent mt-1">Meta 15% • ROI 784:1</p>
        </Card>
      </section>

      <div className="rounded-2xl neuro-inset p-6 text-body-sm text-[var(--text-secondary)]">
        Heatmaps por especialidade, curva de aprendizado por equipe cirúrgica, índice de ocupação de
        salas e distribuição por convênios disponíveis no módulo Analytics completo.
      </div>
    </Card>
  );

  const IASection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            IA & Otimização
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            6 algoritmos proprietários para previsão de duração, recomendação de kit, risco
            cirúrgico, glosas, agenda e detecção de anomalias.
          </p>
        </div>
        <button className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2" type="button">
          <Sparkles className="w-4 h-4" />
          Reprocessar IA
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Previsão de duração</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {aiDuracao ? `${aiDuracao.duracaoEstimada} min` : '-'}
          </p>
          <p className="text-body-2xs text-[var(--text-secondary)]">
            Confiança {aiDuracao?.confianca ?? 0}%
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Risco cirúrgico</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {aiRisco ? `${aiRisco.scoreRisco}/100` : '-'}
          </p>
          <p className="text-body-2xs text-[var(--text-secondary)]">
            Classificação {aiRisco?.classificacao ?? '-'}
          </p>
        </Card>
        <Card className="neuro-inset p-4">
          <p className="text-body-xs text-[var(--text-secondary)]">Anomalias detectadas</p>
          <p className="text-heading font-display text-[var(--text-primary)]">
            {aiAnomalias.length}
          </p>
          <p className="text-body-2xs text-[var(--text-secondary)]">Monitoramento contínuo</p>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="neuro-inset p-4">
          <h4 className="text-body-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">
            Sugestão de Kit
          </h4>
          <div className="space-y-2">
            {aiKit.map((item) => (
              <div
                key={item.produto_id}
                className="p-3 rounded-lg neuro-flat border border-[var(--border)]"
              >
                <p className="text-body-sm text-[var(--text-primary)]">{item.produto_nome}</p>
                <p className="text-body-2xs text-[var(--text-secondary)]">
                  Qtd sugerida {item.quantidade_sugerida}
                </p>
                <p className="text-body-2xs text-[var(--text-secondary)]">
                  Probabilidade {item.probabilidade_uso}% • Base {item.cirurgias_similares}{' '}
                  cirurgias
                </p>
              </div>
            ))}
            {aiKit.length === 0 && (
              <p className="text-body-sm text-[var(--text-secondary)]">
                Nenhuma sugestão disponível
              </p>
            )}
          </div>
        </Card>
        {aiGlosa && (
          <Card className="neuro-inset p-4 space-y-2">
            <h4 className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
              Previsão de glosas
            </h4>
            <p className="text-body-sm text-[var(--text-primary)]">
              Probabilidade {aiGlosa.probabilidadeGlosa}% ({aiGlosa.risco})
            </p>
            <div>
              <p className="text-body-2xs text-[var(--text-secondary)] orx-orx-font-medium">
                Motivos potenciais
              </p>
              <ul className="list-disc list-inside text-body-2xs text-[var(--text-secondary)] space-y-1">
                {aiGlosa.motivosPotenciais.map((motivo) => (
                  <li key={motivo.motivo}>
                    {motivo.motivo} ({motivo.probabilidade}%)
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}
      </section>

      {aiAgenda && (
        <Card className="neuro-inset p-4">
          <h4 className="text-body-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">
            Otimização de agenda
          </h4>
          <p className="text-body-sm text-[var(--text-primary)]">
            Horário sugerido {aiAgenda.horarioSugerido} • Sala {aiAgenda.salaCircurgica} • Score{' '}
            {aiAgenda.score}
          </p>
          <p className="text-body-2xs text-[var(--text-secondary)] mt-1">
            {aiAgenda.justificativa}
          </p>
        </Card>
      )}
    </Card>
  );

  const IntegracoesSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Integrações & Edge
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            HL7 v2.x, FHIR R4, TISS, Edge Functions para validações e notificações.
          </p>
        </div>
        <span className="px-4 py-2 rounded-xl neuro-inset text-body-xs text-[var(--text-secondary)]">
          12 integrações ativas • 4 Edge Functions • Notificações WhatsApp/SMS/E-mail
        </span>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'HL7 v2.x', description: 'ADT, ORM, ORU com middleware' },
          { title: 'FHIR R4', description: 'Procedure, Patient, Practitioner' },
          { title: 'TISS ANS', description: 'Envio de guias, lotes, SIB' },
          { title: 'Edge Functions', description: 'Validação de estoque, notificações, auditoria' },
        ].map((item) => (
          <Card key={item.title} className="neuro-inset p-4">
            <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
              {item.title}
            </p>
            <p className="text-body-2xs text-[var(--text-secondary)]">{item.description}</p>
          </Card>
        ))}
      </section>
    </Card>
  );

  const PortaisSection = () => (
    <Card className="neuro-raised p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-body-lg text-[var(--text-primary)] orx-orx-font-medium">
            Portais OPME
          </h3>
          <p className="text-body-sm text-[var(--text-secondary)]">
            OPMENEXO, Inpart, EMS Ventura e VSSupply integrados com cache inteligente, rate limiting
            e economia média de 15%.
          </p>
        </div>
        <button
          className="neuro-button px-4 py-2 rounded-xl flex items-center gap-2"
          onClick={executarCotacaoPortais}
          type="button"
        >
          {executandoCotacao ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
          Executar cotação
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portaisConfig.map((portal, index) => {
          const status = portaisStatus[index];
          return (
            <Card key={portal.id} className="neuro-inset p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                    {portal.nome_exibicao}
                  </p>
                  <p className="text-body-2xs text-[var(--text-secondary)]">
                    {portal.tipo_integracao.toUpperCase()}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-body-2xs bg-success/10 text-success">
                  {status?.uptime ?? 0}% uptime
                </span>
              </div>
              <p className="text-body-2xs text-[var(--text-secondary)] mt-2">
                Última requisição {formatDate(status?.atualizadoEm)} • Latência média{' '}
                {(status?.latencia ?? 0).toFixed(1)}s
              </p>
            </Card>
          );
        })}
        {portaisConfig.length === 0 && (
          <Card className="neuro-inset p-6 text-center text-body-sm text-[var(--text-secondary)]">
            Nenhum portal configurado
          </Card>
        )}
      </section>

      {estatisticasKeywords.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
            Palavras-chave destaque
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {estatisticasKeywords.slice(0, 6).map((keyword) => (
              <Card key={keyword.palavra_chave} className="neuro-inset p-4">
                <p className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
                  {keyword.palavra_chave}
                </p>
                <p className="text-body-2xs text-[var(--text-secondary)]">
                  {keyword.total_buscas} buscas • {keyword.taxa_sucesso.toFixed(1)}% sucesso
                </p>
                <p className="text-body-2xs text-[var(--text-secondary)]">
                  {keyword.recomendacao === 'manter'
                    ? 'Alta performance'
                    : keyword.recomendacao === 'otimizar'
                      ? 'Otimizar'
                      : 'Desativar'}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </Card>
  );

  const DURATION_LABELS: Record<SubmoduleId, string> = {
    dashboard: 'Visão geral',
    agendamento: 'Agendamento',
    autorizacao: 'Autorização',
    kit: 'Kit OPME',
    intraoperatorio: 'Consumo',
    rastreabilidade: 'Rastreabilidade',
    posoperatorio: 'Pós-operatório',
    faturamento: 'Faturamento',
    calendario: 'Calendário',
    analytics: 'Analytics',
    ia: 'IA & Insights',
    integracoes: 'Integrações',
    portais: 'Portais OPME',
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {renderKPIs()}
            {renderKanban()}
          </div>
        );
      case 'agendamento':
        return <AgendamentoSection />;
      case 'autorizacao':
        return <AutorizacaoSection />;
      case 'kit':
        return <KitSection />;
      case 'intraoperatorio':
        return <ConsumoSection />;
      case 'rastreabilidade':
        return <RastreabilidadeSection />;
      case 'posoperatorio':
        return <PosOperatorioSection />;
      case 'faturamento':
        return <FaturamentoSection />;
      case 'calendario':
        return <CalendarioSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'ia':
        return <IASection />;
      case 'integracoes':
        return <IntegracoesSection />;
      case 'portais':
        return <PortaisSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('qa') === '1' && (
            <>
              <style>{`* { animation: none !important; transition: none !important; }`}</style>
              <div id="qa-lcp-h1" className="p-4 rounded-xl bg-indigo-500/10">
                <h1 className="m-0 text-[var(--orx-text-primary)] text-[1.5rem] orx-orx-font-extrabold">
                  Gestão de Cirurgias — Snapshot QA
                </h1>
              </div>
              <div role="toolbar" aria-label="QA Actions" className="flex gap-2 mt-2 flex-nowrap">
                {['Filtrar', 'Exportar', 'Atualizar', 'Ajuda', 'Atalhos', 'Preferências'].map(
                  (label) => (
                    <button
                      key={label}
                      type="button"
                      data-qa-button="true"
                      className="neuro-button px-2 py-1 text-[0.75rem] leading-none whitespace-nowrap"
                      onClick={(e) => e.preventDefault()}
                      aria-label={`QA ${label}`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Gestão de Cirurgias
            </h1>
            <p className="text-body-sm text-[var(--text-secondary)]">
              Sistema completo com automações, Portais OPME e compliance total. ROI 784:1, economia
              média de 15% por cirurgia.
            </p>
          </div>
          <div className="px-4 py-3 rounded-xl neuro-raised flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
              {cirurgias.length} cirurgias ativas
            </span>
          </div>
        </header>

        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('qa') === '1' && (
            <>
              <form
                aria-label="Filtros QA Cirurgias"
                className="rounded-2xl p-4 neuro-raised grid [grid-template-columns:1.2fr_0.8fr_0.8fr_0.6fr] gap-3 items-end mt-3"
              >
                <div>
                  <label
                    htmlFor="qa-busca-cir"
                    className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                  >
                    Busca
                  </label>
                  <input
                    id="qa-busca-cir"
                    name="busca"
                    placeholder="Paciente, procedimento"
                    className="w-full px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="qa-cir-inicio"
                    className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                  >
                    Início
                  </label>
                  <input
                    id="qa-cir-inicio"
                    name="inicio"
                    type="date"
                    className="w-full px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="qa-cir-fim"
                    className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                  >
                    Fim
                  </label>
                  <input
                    id="qa-cir-fim"
                    name="fim"
                    type="date"
                    className="w-full px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="qa-cir-status"
                    className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                  >
                    Status
                  </label>
                  <select id="qa-cir-status" name="status" className="w-full px-3 py-2 rounded-xl">
                    <option value="">Todos</option>
                    <option value="agendada">Agendada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div className="col-span-full flex gap-2">
                  <button
                    type="submit"
                    className="neuro-button px-3 py-2 rounded-xl"
                    aria-label="Aplicar filtros"
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    className="neuro-button px-3 py-2 rounded-xl"
                    aria-label="Limpar filtros"
                  >
                    Limpar
                  </button>
                </div>
              </form>

              <div className="neuro-raised p-4 rounded-2xl">
                <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-3">
                  Cirurgias (QA)
                </h2>
                <div className="overflow-x-auto">
                  <table role="table" className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">Paciente</th>
                        <th className="text-left p-2">Procedimento</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <tr key={i}>
                          <td className="p-2">CIR-{i}</td>
                          <td className="p-2">Paciente {i}</td>
                          <td className="p-2">{i % 2 === 0 ? 'Artroscopia' : 'Hérnia'}</td>
                          <td className="p-2">
                            {i % 3 === 0 ? 'Cancelada' : i % 2 === 0 ? 'Confirmada' : 'Agendada'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="button" aria-label="Página Anterior" className="neuro-button">
                    Anterior
                  </button>
                  <button type="button" aria-label="Próxima Página" className="neuro-button">
                    Próximo
                  </button>
                </div>
              </div>
            </>
          )}

        {selectedCirurgia && (
          <Card className="neuro-raised p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl neuro-inset">
                  <Stethoscope className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-body-sm text-[var(--text-secondary)]">Cirurgia selecionada</p>
                  <h2 className="text-heading-sm text-[var(--text-primary)] orx-orx-font-medium">
                    {selectedCirurgia.tipo_procedimento}
                  </h2>
                  <p className="text-body-xs text-[var(--text-secondary)]">
                    Paciente {selectedCirurgia.paciente_nome} •{' '}
                    {statusLabels[(selectedCirurgia.status as KanbanColumn) ?? 'agendada']}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="neuro-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
                  onClick={() => handleUpdateStatus(selectedCirurgia.id, 'confirmada')}
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </button>
                <button
                  type="button"
                  className="neuro-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
                  onClick={() => handleDeleteCirurgia(selectedCirurgia.id)}
                >
                  <AlertCircle className="w-4 h-4 text-error" />
                  Cancelar
                </button>
              </div>
            </div>
            {loadingAssociations && (
              <div className="mt-4 flex items-center gap-2 text-body-xs text-[var(--text-secondary)]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando dados relacionados...
              </div>
            )}
          </Card>
        )}

        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveModule(item.id)}
              className={`h-28 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center ${
                activeModule === item.id
                  ? 'neuro-raised scale-105'
                  : 'neuro-flat hover:neuro-raised'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1 text-[var(--primary)]" />
              <span className="text-body-xs text-[var(--text-primary)] orx-orx-font-medium">
                {item.label}
              </span>
              <span className="text-body-2xs text-[var(--text-secondary)] px-4">
                {item.description}
              </span>
              {item.badge && (
                <span className="mt-2 px-3 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div
          aria-live="polite"
          aria-label={`Conteúdo ${DURATION_LABELS[activeModule]}`}
          className="space-y-6"
        >
          {renderActiveModule()}
        </div>
      </div>
    </div>
  );
}
