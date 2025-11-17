import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export type ContratoStatus =
  | "rascunho"
  | "em_aprovacao"
  | "ativo"
  | "renovacao"
  | "encerrado"
  | "cancelado";

export interface Contrato {
  id: string;
  empresa_id: string;
  numero_contrato: string;
  titulo: string;
  tipo:
    | "fornecimento_produtos"
    | "prestacao_servicos"
    | "opme_hospital"
    | "locacao"
    | "parceria"
    | "seguro"
    | "outro";
  status: ContratoStatus;
  contratante_id: string | null;
  contratante_nome: string | null;
  contratado_id: string | null;
  contratado_nome: string | null;
  contratado_documento: string | null;
  data_inicio: string;
  data_fim: string;
  renovacao_automatica: boolean;
  prazo_aviso_rescisao: number | null;
  valor_total: number;
  forma_pagamento: string | null;
  indice_reajuste:
    | "nenhum"
    | "ipca"
    | "igpm"
    | "inpc"
    | "percentual_fixo"
    | null;
  periodicidade_reajuste: "anual" | "semestral" | null;
  percentual_reajuste: number | null;
  clausulas_principais: string | null;
  observacoes: string | null;
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
}

export interface ContratoAditivo {
  id: string;
  contrato_id: string;
  titulo: string;
  descricao: string | null;
  valor_ajuste: number;
  data_assinatura: string;
  arquivo_url: string | null;
}

export interface ContratoSLA {
  id: string;
  contrato_id: string;
  indicador: string;
  meta: string;
  penalidade: string | null;
  frequencia: string | null;
}

export type NivelAprovacao =
  | "juridico"
  | "financeiro"
  | "diretoria"
  | "comercial"
  | "operacional";

export interface ContratoAprovacao {
  id: string;
  contrato_id: string;
  nivel: NivelAprovacao;
  status: "pendente" | "aprovado" | "rejeitado";
  comentario: string | null;
  usuario_id: string | null;
  aprovado_em: string | null;
  created_at: string;
}

export interface ContratoAlerta {
  id: string;
  contrato_id: string;
  tipo: "vencimento" | "renovacao" | "sla" | "inadimplencia" | "assinatura";
  descricao: string | null;
  data_alerta: string;
  severidade: "info" | "warning" | "critical";
  resolvido: boolean;
  resolvido_em: string | null;
  created_at: string;
  contrato_titulo?: string;
  numero_contrato?: string;
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

export function useContratos() {
  const { empresaAtual } = useAuth();
  const [state, setState] = useState<UseContratosState>({
    contratos: [],
    loading: true,
    error: null,
    kpis: null,
    alertas: [],
  });

  const fetchContratos = useCallback(async () => {
    if (!empresaAtual?.id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("empresa_id", empresaAtual.id)
        .order("data_fim", { ascending: true });

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        contratos: (data as Contrato[] | null) ?? [],
        loading: false,
      }));
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Erro ao carregar contratos",
        loading: false,
      }));
    }
  }, [empresaAtual?.id]);

  const fetchKPIs = useCallback(async () => {
    if (!empresaAtual?.id) return;

    const { data, error } = await supabase
      .from("view_contratos_kpis")
      .select("*")
      .eq("empresa_id", empresaAtual.id)
      .single();

    if (!error && data) {
      setState((prev) => ({
        ...prev,
        kpis: data as ContratoKPIs,
      }));
    }
  }, [empresaAtual?.id]);

  const fetchAlertas = useCallback(async () => {
    if (!empresaAtual?.id) return;

    const { data, error } = await supabase
      .from("view_contratos_alertas")
      .select("*")
      .eq("empresa_id", empresaAtual.id)
      .order("data_alerta", { ascending: true });

    if (!error) {
      setState((prev) => ({
        ...prev,
        alertas: (data as ContratoAlerta[] | null) ?? [],
      }));
    }
  }, [empresaAtual?.id]);

  const getContrato = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Contrato;
  }, []);

  const getClausulas = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from("contratos_clausulas")
      .select("*")
      .eq("contrato_id", contratoId)
      .order("ordem", { ascending: true });

    if (error) throw error;
    return (data as ContratoClausula[] | null) ?? [];
  }, []);

  const getAditivos = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from("contratos_aditivos")
      .select("*")
      .eq("contrato_id", contratoId)
      .order("data_assinatura", { ascending: false });

    if (error) throw error;
    return (data as ContratoAditivo[] | null) ?? [];
  }, []);

  const getSLAs = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from("contratos_sla")
      .select("*")
      .eq("contrato_id", contratoId);

    if (error) throw error;
    return (data as ContratoSLA[] | null) ?? [];
  }, []);

  const getAprovacoes = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from("contratos_aprovacoes")
      .select("*")
      .eq("contrato_id", contratoId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data as ContratoAprovacao[] | null) ?? [];
  }, []);

  const getAlertasContrato = useCallback(async (contratoId: string) => {
    const { data, error } = await supabase
      .from("contratos_alertas")
      .select("*")
      .eq("contrato_id", contratoId)
      .order("data_alerta", { ascending: true });

    if (error) throw error;
    return (data as ContratoAlerta[] | null) ?? [];
  }, []);

  const createContrato = useCallback(
    async (
      payload: Omit<Contrato, "id" | "created_at" | "updated_at"> & {
        clausulas?: ContratoClausula[];
        slas?: ContratoSLA[];
      },
    ) => {
      const { clausulas, slas, ...contratoData } = payload;

      const { data, error } = await supabase
        .from("contratos")
        .insert([contratoData])
        .select()
        .single();

      if (error) throw error;

      const contratoCriado = data as Contrato;

      if (clausulas?.length) {
        await supabase.from("contratos_clausulas").insert(
          clausulas.map((clausula, index) => ({
            ...clausula,
            ordem: index,
            contrato_id: contratoCriado.id,
          })),
        );
      }

      if (slas?.length) {
        await supabase
          .from("contratos_sla")
          .insert(
            slas.map((sla) => ({ ...sla, contrato_id: contratoCriado.id })),
          );
      }

      setState((prev) => ({
        ...prev,
        contratos: [contratoCriado, ...prev.contratos],
      }));

      return contratoCriado;
    },
    [],
  );

  const updateContrato = useCallback(
    async (id: string, updates: Partial<Contrato>) => {
      const { data, error } = await supabase
        .from("contratos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const contratoAtualizado = data as Contrato;

      setState((prev) => ({
        ...prev,
        contratos: prev.contratos.map((contrato) =>
          contrato.id === id ? contratoAtualizado : contrato,
        ),
      }));

      return contratoAtualizado;
    },
    [],
  );

  const registrarAprovacao = useCallback(
    async (
      contratoId: string,
      nivel: NivelAprovacao,
      status: "aprovado" | "rejeitado",
      comentario?: string,
    ) => {
      const payload = {
        contrato_id: contratoId,
        nivel,
        status,
        comentario: comentario ?? null,
      };

      const { error } = await supabase
        .from("contratos_aprovacoes")
        .insert([payload]);

      if (error) throw error;

      await fetchContratos();
      await fetchKPIs();
    },
    [fetchContratos, fetchKPIs],
  );

  const registrarAlerta = useCallback(
    async (alerta: Omit<ContratoAlerta, "id" | "created_at">) => {
      const { error } = await supabase
        .from("contratos_alertas")
        .insert([alerta]);
      if (error) throw error;
      await fetchAlertas();
    },
    [fetchAlertas],
  );

  const contratosPorStatus = useMemo(() => {
    return state.contratos.reduce(
      (acc, contrato) => {
        acc[contrato.status] = (acc[contrato.status] || 0) + 1;
        return acc;
      },
      {} as Record<ContratoStatus, number>,
    );
  }, [state.contratos]);

  useEffect(() => {
    fetchContratos();
    fetchKPIs();
    fetchAlertas();

    const channel = supabase
      .channel("contratos_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contratos" },
        () => {
          fetchContratos();
          fetchKPIs();
          fetchAlertas();
        },
      )
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

export default useContratos;
