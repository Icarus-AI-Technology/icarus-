import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/lib/database.types.generated';

type ContratoRow = Database['public']['Tables']['contratos']['Row'];
type ContratoInsert = Database['public']['Tables']['contratos']['Insert'];
type ContratoUpdate = Database['public']['Tables']['contratos']['Update'];
type ContratoClausulaRow = Database['public']['Tables']['contratos_clausulas']['Row'];
type ContratoClausulaInsert = Database['public']['Tables']['contratos_clausulas']['Insert'];
type ContratoAditivoRow = Database['public']['Tables']['contratos_aditivos']['Row'];

type ContratoSLARow = Database['public']['Tables']['contratos_sla']['Row'];
type ContratoSLAInsert = Database['public']['Tables']['contratos_sla']['Insert'];
type ContratoAprovacaoRow = Database['public']['Tables']['contratos_aprovacoes']['Row'];
type ContratoAprovacaoInsert = Database['public']['Tables']['contratos_aprovacoes']['Insert'];
type ContratoAlertaRow = Database['public']['Tables']['contratos_alertas']['Row'];
type ContratoAlertaInsert = Database['public']['Tables']['contratos_alertas']['Insert'];
type ContratoKpiViewRow = Database['public']['Views']['view_contratos_kpis']['Row'];
type ContratoAlertaViewRow = Database['public']['Views']['view_contratos_alertas']['Row'];

type ContratoStatus = Database['public']['Enums']['contrato_status_enum'];
type ContratoTipo = Database['public']['Enums']['contrato_tipo_enum'];
type ContratoIndice = Database['public']['Enums']['contrato_indice_enum'];
type ContratoPeriod = Database['public']['Enums']['contrato_periodicidade_enum'];
type ContratoAlertaTipo = Database['public']['Enums']['contrato_alerta_tipo_enum'];
type ContratoAlertaSeveridade = Database['public']['Enums']['contrato_alerta_severidade_enum'];
type ContratoAprovacaoNivel = Database['public']['Enums']['contrato_aprovacao_nivel_enum'];
type ContratoAprovacaoStatus = Database['public']['Enums']['contrato_aprovacao_status_enum'];

type Nullable<T> = T | null | undefined;

export interface Contrato {
  id: string;
  empresa_id: string;
  numero_contrato: string;
  titulo: string;
  tipo: ContratoTipo;
  status: ContratoStatus;
  contratante_id?: string | null;
  contratante_nome?: string | null;
  contratado_id?: string | null;
  contratado_nome?: string | null;
  contratado_documento?: string | null;
  data_inicio: string;
  data_fim: string;
  renovacao_automatica: boolean;
  prazo_aviso_rescisao: number;
  valor_total: number;
  forma_pagamento: string;
  indice_reajuste?: ContratoIndice | null;
  periodicidade_reajuste?: ContratoPeriod | null;
  percentual_reajuste?: number | null;
  clausulas_principais?: string | null;
  observacoes?: string | null;
  exige_aprovacao_juridico: boolean;
  exige_aprovacao_financeiro: boolean;
  exige_aprovacao_diretoria: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContratoClausula {
  id: string;
  contrato_id: string;
  titulo: string;
  texto: string;
  ordem: number;
  created_at: string;
}

export interface ContratoAditivo {
  id: string;
  contrato_id: string;
  titulo: string;
  descricao?: string | null;
  valor_ajuste: number;
  data_assinatura: string;
  arquivo_url?: string | null;
  created_at: string;
}

export interface ContratoSLA {
  id: string;
  contrato_id: string;
  indicador: string;
  meta: string;
  penalidade?: string | null;
  frequencia?: string | null;
  created_at: string;
}

export type NivelAprovacao = ContratoAprovacaoNivel;

export interface ContratoAprovacao {
  id: string;
  contrato_id: string;
  nivel: ContratoAprovacaoNivel;
  status: ContratoAprovacaoStatus;
  comentario?: string | null;
  usuario_id?: string | null;
  aprovado_em?: string | null;
  created_at: string;
}

export interface ContratoAlerta {
  id: string;
  contrato_id: string;
  tipo: ContratoAlertaTipo;
  descricao?: string | null;
  data_alerta: string;
  severidade: ContratoAlertaSeveridade;
  resolvido: boolean;
  resolvido_em?: string | null;
  created_at: string;
  contrato_titulo?: string | null;
  numero_contrato?: string | null;
  empresa_id?: string;
}

export interface ContratoKPIs {
  contratos_ativos: number;
  contratos_em_renovacao: number;
  contratos_pendentes: number;
  valor_total: number;
  vencer_30: number;
  vencer_90: number;
  taxa_renovacao: number;
  atualizado_em: string;
}

interface UseContratosState {
  contratos: Contrato[];
  loading: boolean;
  error: string | null;
  kpis: ContratoKPIs | null;
  alertas: ContratoAlerta[];
}

const normalizeContrato = (row: ContratoRow): Contrato => ({
  id: row.id,
  empresa_id: row.empresa_id,
  numero_contrato: row.numero_contrato,
  titulo: row.titulo,
  tipo: row.tipo ?? 'fornecimento_produtos',
  status: row.status ?? 'rascunho',
  contratante_id: row.contratante_id,
  contratante_nome: row.contratante_nome,
  contratado_id: row.contratado_id,
  contratado_nome: row.contratado_nome,
  contratado_documento: row.contratado_documento,
  data_inicio: row.data_inicio?.toString() ?? new Date().toISOString().slice(0, 10),
  data_fim: row.data_fim?.toString() ?? new Date().toISOString().slice(0, 10),
  renovacao_automatica: row.renovacao_automatica ?? false,
  prazo_aviso_rescisao: row.prazo_aviso_rescisao ?? 30,
  valor_total: Number(row.valor_total ?? 0),
  forma_pagamento: row.forma_pagamento ?? '',
  indice_reajuste: row.indice_reajuste,
  periodicidade_reajuste: row.periodicidade_reajuste,
  percentual_reajuste: row.percentual_reajuste,
  clausulas_principais: row.clausulas_principais,
  observacoes: row.observacoes,
  exige_aprovacao_juridico: row.exige_aprovacao_juridico ?? false,
  exige_aprovacao_financeiro: row.exige_aprovacao_financeiro ?? false,
  exige_aprovacao_diretoria: row.exige_aprovacao_diretoria ?? false,
  created_at: row.created_at ?? new Date().toISOString(),
  updated_at: row.updated_at ?? new Date().toISOString(),
});

const normalizeClausula = (row: ContratoClausulaRow): ContratoClausula => ({
  id: row.id,
  contrato_id: row.contrato_id,
  titulo: row.titulo,
  texto: row.texto,
  ordem: row.ordem ?? 0,
  created_at: row.created_at ?? new Date().toISOString(),
});

const normalizeAditivo = (row: ContratoAditivoRow): ContratoAditivo => ({
  id: row.id,
  contrato_id: row.contrato_id,
  titulo: row.titulo,
  descricao: row.descricao,
  valor_ajuste: Number(row.valor_ajuste ?? 0),
  data_assinatura: row.data_assinatura?.toString() ?? new Date().toISOString().slice(0, 10),
  arquivo_url: row.arquivo_url,
  created_at: row.created_at ?? new Date().toISOString(),
});

const normalizeSLA = (row: ContratoSLARow): ContratoSLA => ({
  id: row.id,
  contrato_id: row.contrato_id,
  indicador: row.indicador,
  meta: row.meta,
  penalidade: row.penalidade,
  frequencia: row.frequencia,
  created_at: row.created_at ?? new Date().toISOString(),
});

const normalizeAprovacao = (row: ContratoAprovacaoRow): ContratoAprovacao => ({
  id: row.id,
  contrato_id: row.contrato_id,
  nivel: row.nivel,
  status: row.status ?? 'pendente',
  comentario: row.comentario,
  usuario_id: row.usuario_id,
  aprovado_em: row.aprovado_em ?? null,
  created_at: row.created_at ?? new Date().toISOString(),
});

const normalizeAlerta = (row: ContratoAlertaViewRow | ContratoAlertaRow): ContratoAlerta => {
  const contratoId = 'contrato_id' in row ? row.contrato_id : null;
  const tipo = 'tipo' in row ? row.tipo : null;
  const severidade = 'severidade' in row ? row.severidade : null;

  return {
    id: row.id ?? '',
    contrato_id: contratoId ?? '',
    tipo: (tipo ?? 'vencimento') as ContratoAlertaTipo,
    descricao: row.descricao,
    data_alerta: row.data_alerta?.toString() ?? new Date().toISOString().slice(0, 10),
    severidade: (severidade ?? 'info') as ContratoAlertaSeveridade,
    resolvido: row.resolvido ?? false,
    resolvido_em: row.resolvido_em ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
    contrato_titulo: 'contrato_titulo' in row ? (row.contrato_titulo ?? undefined) : undefined,
    numero_contrato: 'numero_contrato' in row ? (row.numero_contrato ?? undefined) : undefined,
    empresa_id: 'empresa_id' in row ? (row.empresa_id ?? undefined) : undefined,
  };
};

const normalizeKpi = (row: ContratoKpiViewRow): ContratoKPIs => ({
  contratos_ativos: Number(row.contratos_ativos ?? 0),
  contratos_em_renovacao: Number(row.contratos_em_renovacao ?? 0),
  contratos_pendentes: Number(row.contratos_pendentes ?? 0),
  valor_total: Number(row.valor_total ?? 0),
  vencer_30: Number(row.vencer_30 ?? 0),
  vencer_90: Number(row.vencer_90 ?? 0),
  taxa_renovacao: Number(row.taxa_renovacao ?? 0),
  atualizado_em: row.atualizado_em ?? new Date().toISOString(),
});

const buildContratoInsert = (
  contrato: Omit<Contrato, 'id' | 'created_at' | 'updated_at' | 'empresa_id'>,
  empresaId: string
): ContratoInsert => ({
  empresa_id: empresaId,
  numero_contrato: contrato.numero_contrato,
  titulo: contrato.titulo,
  tipo: contrato.tipo,
  status: contrato.status,
  contratante_id: contrato.contratante_id ?? null,
  contratante_nome: contrato.contratante_nome ?? null,
  contratado_id: contrato.contratado_id ?? null,
  contratado_nome: contrato.contratado_nome ?? null,
  contratado_documento: contrato.contratado_documento ?? null,
  data_inicio: contrato.data_inicio,
  data_fim: contrato.data_fim,
  renovacao_automatica: contrato.renovacao_automatica,
  prazo_aviso_rescisao: contrato.prazo_aviso_rescisao,
  valor_total: contrato.valor_total,
  forma_pagamento: contrato.forma_pagamento ?? '',
  indice_reajuste: contrato.indice_reajuste ?? null,
  periodicidade_reajuste: contrato.periodicidade_reajuste ?? null,
  percentual_reajuste: contrato.percentual_reajuste ?? null,
  clausulas_principais: contrato.clausulas_principais ?? null,
  observacoes: contrato.observacoes ?? null,
  exige_aprovacao_juridico: contrato.exige_aprovacao_juridico,
  exige_aprovacao_financeiro: contrato.exige_aprovacao_financeiro,
  exige_aprovacao_diretoria: contrato.exige_aprovacao_diretoria,
});

const buildContratoUpdate = (updates: Partial<Contrato>): ContratoUpdate => {
  const payload: ContratoUpdate = {};
  const assign = <K extends keyof ContratoUpdate>(key: K, value: Nullable<ContratoUpdate[K]>) => {
    if (value !== undefined) {
      payload[key] = value as ContratoUpdate[K];
    }
  };

  assign('numero_contrato', updates.numero_contrato);
  assign('titulo', updates.titulo);
  assign('tipo', updates.tipo ?? null);
  assign('status', updates.status ?? null);
  assign('contratante_id', updates.contratante_id ?? null);
  assign('contratante_nome', updates.contratante_nome ?? null);
  assign('contratado_id', updates.contratado_id ?? null);
  assign('contratado_nome', updates.contratado_nome ?? null);
  assign('contratado_documento', updates.contratado_documento ?? null);
  assign('data_inicio', updates.data_inicio);
  assign('data_fim', updates.data_fim);
  assign('renovacao_automatica', updates.renovacao_automatica);
  assign('prazo_aviso_rescisao', updates.prazo_aviso_rescisao);
  assign('valor_total', updates.valor_total);
  assign('forma_pagamento', updates.forma_pagamento ?? null);
  assign('indice_reajuste', updates.indice_reajuste ?? null);
  assign('periodicidade_reajuste', updates.periodicidade_reajuste ?? null);
  assign('percentual_reajuste', updates.percentual_reajuste ?? null);
  assign('clausulas_principais', updates.clausulas_principais ?? null);
  assign('observacoes', updates.observacoes ?? null);
  assign('exige_aprovacao_juridico', updates.exige_aprovacao_juridico);
  assign('exige_aprovacao_financeiro', updates.exige_aprovacao_financeiro);
  assign('exige_aprovacao_diretoria', updates.exige_aprovacao_diretoria);
  assign('empresa_id', updates.empresa_id ?? null);

  return payload;
};

export function useContratos() {
  const { empresaAtual } = useAuth();
  const [state, setState] = useState<UseContratosState>({
    contratos: [],
    loading: true,
    error: null,
    kpis: null,
    alertas: [],
  });

  const ensureEmpresa = useCallback(() => {
    if (!empresaAtual?.id) {
      throw new Error('Empresa não selecionada');
    }
    return empresaAtual.id;
  }, [empresaAtual]);

  const fetchContratos = useCallback(async () => {
    if (!empresaAtual?.id) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('empresa_id', empresaAtual.id)
        .order('data_fim', { ascending: true });

      if (error) throw error;
      const rows = (data as ContratoRow[] | null) ?? [];
      setState((prev) => ({ ...prev, contratos: rows.map(normalizeContrato), loading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar contratos';
      setState((prev) => ({ ...prev, error: message, loading: false }));
    }
  }, [empresaAtual?.id]);

  const fetchKPIs = useCallback(async () => {
    if (!empresaAtual?.id) return;
    const { data, error } = await supabase
      .from('view_contratos_kpis')
      .select('*')
      .eq('empresa_id', empresaAtual.id)
      .single();

    if (!error && data) {
      setState((prev) => ({ ...prev, kpis: normalizeKpi(data as ContratoKpiViewRow) }));
    }
  }, [empresaAtual?.id]);

  const fetchAlertas = useCallback(async () => {
    if (!empresaAtual?.id) return;
    const { data, error } = await supabase
      .from('view_contratos_alertas')
      .select('*')
      .eq('empresa_id', empresaAtual.id)
      .order('data_alerta', { ascending: true });

    if (!error) {
      const rows = (data as ContratoAlertaViewRow[] | null) ?? [];
      setState((prev) => ({ ...prev, alertas: rows.map(normalizeAlerta) }));
    }
  }, [empresaAtual?.id]);

  const getContrato = useCallback(async (id: string) => {
    const { data, error } = await supabase.from('contratos').select('*').eq('id', id).single();

    if (error) throw error;
    return data ? normalizeContrato(data as ContratoRow) : null;
  }, []);

  const getClausulas = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from('contratos_clausulas')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('ordem', { ascending: true });

    if (error) throw error;
    return ((data as ContratoClausulaRow[] | null) ?? []).map(normalizeClausula);
  }, []);

  const getAditivos = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from('contratos_aditivos')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('data_assinatura', { ascending: false });

    if (error) throw error;
    return ((data as ContratoAditivoRow[] | null) ?? []).map(normalizeAditivo);
  }, []);

  const getSLAs = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from('contratos_sla')
      .select('*')
      .eq('contrato_id', contratoId);

    if (error) throw error;
    return ((data as ContratoSLARow[] | null) ?? []).map(normalizeSLA);
  }, []);

  const getAprovacoes = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from('contratos_aprovacoes')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return ((data as ContratoAprovacaoRow[] | null) ?? []).map(normalizeAprovacao);
  }, []);

  const getAlertasContrato = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from('contratos_alertas')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('data_alerta', { ascending: true });

    if (error) throw error;
    return ((data as ContratoAlertaRow[] | null) ?? []).map(normalizeAlerta);
  }, []);

  const createContrato = useCallback(
    async (
      payload: Omit<Contrato, 'id' | 'created_at' | 'updated_at' | 'empresa_id'> & {
        clausulas?: Omit<ContratoClausula, 'id' | 'created_at'>[];
        slas?: Omit<ContratoSLA, 'id' | 'created_at'>[];
      }
    ) => {
      const empresaId = ensureEmpresa();
      const { clausulas, slas, ...contratoData } = payload;
      const insertPayload = buildContratoInsert(contratoData, empresaId);
      const { data, error } = await supabase
        .from('contratos')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      const contratoCriado = normalizeContrato(data as ContratoRow);

      if (clausulas?.length) {
        const clausulasPayload: ContratoClausulaInsert[] = clausulas.map((clausula, index) => ({
          contrato_id: contratoCriado.id,
          titulo: clausula.titulo,
          texto: clausula.texto,
          ordem: clausula.ordem ?? index,
        }));
        await supabase.from('contratos_clausulas').insert(clausulasPayload);
      }

      if (slas?.length) {
        const slasPayload: ContratoSLAInsert[] = slas.map((sla) => ({
          contrato_id: contratoCriado.id,
          indicador: sla.indicador,
          meta: sla.meta,
          penalidade: sla.penalidade ?? null,
          frequencia: sla.frequencia ?? null,
        }));
        await supabase.from('contratos_sla').insert(slasPayload);
      }

      setState((prev) => ({ ...prev, contratos: [contratoCriado, ...prev.contratos] }));
      return contratoCriado;
    },
    [ensureEmpresa]
  );

  const updateContrato = useCallback(async (id: string, updates: Partial<Contrato>) => {
    const payload = buildContratoUpdate(updates);
    const { data, error } = await supabase
      .from('contratos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const contratoAtualizado = normalizeContrato(data as ContratoRow);
    setState((prev) => ({
      ...prev,
      contratos: prev.contratos.map((contrato) =>
        contrato.id === id ? contratoAtualizado : contrato
      ),
    }));

    return contratoAtualizado;
  }, []);

  const registrarAprovacao = useCallback(
    async (
      contratoId: string,
      nivel: ContratoAprovacaoNivel,
      status: Exclude<ContratoAprovacaoStatus, 'pendente'>,
      comentario?: string
    ) => {
      const payload: ContratoAprovacaoInsert = {
        contrato_id: contratoId,
        nivel,
        status,
        comentario: comentario ?? null,
      };

      const { error } = await supabase.from('contratos_aprovacoes').insert([payload]);
      if (error) throw error;
      await fetchContratos();
      await fetchKPIs();
    },
    [fetchContratos, fetchKPIs]
  );

  const registrarAlerta = useCallback(
    async (
      alerta: Omit<
        ContratoAlerta,
        'id' | 'created_at' | 'contrato_titulo' | 'numero_contrato' | 'empresa_id'
      >
    ) => {
      const payload: ContratoAlertaInsert = {
        contrato_id: alerta.contrato_id,
        tipo: alerta.tipo,
        descricao: alerta.descricao ?? null,
        data_alerta: alerta.data_alerta,
        severidade: alerta.severidade,
        resolvido: alerta.resolvido,
        resolvido_em: alerta.resolvido_em ?? null,
      };

      const { error } = await supabase.from('contratos_alertas').insert([payload]);
      if (error) throw error;
      await fetchAlertas();
    },
    [fetchAlertas]
  );

  const contratosPorStatus = useMemo(() => {
    return state.contratos.reduce(
      (acc, contrato) => {
        const key = contrato.status;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<ContratoStatus, number>
    );
  }, [state.contratos]);

  useEffect(() => {
    fetchContratos();
    fetchKPIs();
    fetchAlertas();

    const channel = supabase
      .channel('contratos_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contratos' }, () => {
        fetchContratos();
        fetchKPIs();
        fetchAlertas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContratos, fetchKPIs, fetchAlertas]);

  return {
    ...state,
    contratosPorStatus,
    fetchContratos,
    fetchKPIs,
    fetchAlertas,
    getContrato,
    getClausulas,
    getAditivos,
    getSLAs,
    getAprovacoes,
    getAlertasContrato,
    createContrato,
    updateContrato,
    registrarAprovacao,
    registrarAlerta,
  };
}
