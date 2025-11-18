import { useCallback, useEffect, useMemo, useState } from"react";
import { supabase } from"@/lib/supabase";
import { useAuth } from"./useAuth";

export type EtapaOportunidade =
  |"prospeccao"
  |"contato_inicial"
  |"qualificacao"
  |"apresentacao"
  |"proposta"
  |"negociacao"
  |"fechamento"
  |"ganho"
  |"perdido";

export interface Oportunidade {
  id: string;
  empresa_id: string;
  lead_id: string | null;
  titulo: string;
  valor: number;
  etapa: EtapaOportunidade;
  status:"aberta" |"fechada_ganho" |"fechada_perdido" |"congelada";
  probabilidade: number;
  data_fechamento_prevista: string | null;
  data_fechamento_real: string | null;
  responsavel_id: string | null;
  cliente_nome: string | null;
  cliente_segmento: string | null;
  origem: string | null;
  nota: string | null;
  created_at: string;
  updated_at: string;
}

interface OportunidadeInteracao {
  id: string;
  oportunidade_id: string;
  tipo: string | null;
  descricao: string | null;
  metadata: Record<string, unknown> | null;
  usuario_id: string | null;
  ocorreu_em: string;
  created_at: string;
}

interface OportunidadeTarefa {
  id: string;
  oportunidade_id: string;
  titulo: string;
  status:"pendente" |"em_andamento" |"concluida" |"cancelada";
  due_date: string | null;
  responsavel_id: string | null;
  created_at: string;
  concluido_em: string | null;
}

interface OportunidadeProposta {
  id: string;
  oportunidade_id: string;
  numero: string | null;
  valor: number;
  status:"rascunho" |"enviada" |"aceita" |"rejeitada" |"cancelada";
  url_pdf: string | null;
  criada_em: string;
  atualizada_em: string;
}

interface UseOportunidadesState {
  oportunidades: Oportunidade[];
  loading: boolean;
  error: string | null;
  resumoPipeline: {
    valor_total: number;
    total_oportunidades: number;
    probabilidade_media: number;
  } | null;
  funil: Array<{ etapa: EtapaOportunidade; total: number; valor_total: number }>;
}

export function useOportunidades() {
  const { empresaAtual } = useAuth();
  const [state, setState] = useState<UseOportunidadesState>({
    oportunidades: [],
    loading: true,
    error: null,
    resumoPipeline: null,
    funil: [],
  });

  const fetchOportunidades = useCallback(async () => {
    if (!empresaAtual?.id) return;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("oportunidades")
        .select("*")
        .eq("empresa_id", empresaAtual.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        oportunidades: (data as Oportunidade[] | null) ?? [],
        loading: false,
      }));
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message :"Erro ao carregar oportunidades",
        loading: false,
      }));
    }
  }, [empresaAtual?.id]);

  const fetchResumo = useCallback(async () => {
    if (!empresaAtual?.id) return;

    const [{ data: resumo }, { data: funil }] = await Promise.all([
      supabase
        .from("view_crm_pipeline_resumo")
        .select("valor_total,total_oportunidades,probabilidade_media")
        .eq("empresa_id", empresaAtual.id)
        .single(),
      supabase
        .from("view_crm_funil")
        .select("etapa,total,valor_total")
        .eq("empresa_id", empresaAtual.id),
    ]);

    if (resumo) {
      setState(prev => ({
        ...prev,
        resumoPipeline: resumo as UseOportunidadesState["resumoPipeline"],
      }));
    }

    if (funil) {
      setState(prev => ({
        ...prev,
        funil: (funil as Array<{ etapa: EtapaOportunidade; total: number; valor_total: number }>),
      }));
    }
  }, [empresaAtual?.id]);

  const createOportunidade = useCallback(
    async (payload: Omit<Oportunidade,"id" |"created_at" |"updated_at">) => {
      const { data, error } = await supabase
        .from("oportunidades")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const oportunidade = data as Oportunidade;

      setState(prev => ({
        ...prev,
        oportunidades: [oportunidade, ...prev.oportunidades],
      }));

      await fetchResumo();
      return oportunidade;
    },
    [fetchResumo]
  );

  const updateOportunidade = useCallback(async (id: string, updates: Partial<Oportunidade>) => {
    const { data, error } = await supabase
      .from("oportunidades")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const oportunidade = data as Oportunidade;

    setState(prev => ({
      ...prev,
      oportunidades: prev.oportunidades.map(item => (item.id === id ? oportunidade : item)),
    }));

    await fetchResumo();
    return oportunidade;
  }, [fetchResumo]);

  const deleteOportunidade = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("oportunidades")
      .delete()
      .eq("id", id);

    if (error) throw error;

    setState(prev => ({
      ...prev,
      oportunidades: prev.oportunidades.filter(item => item.id !== id),
    }));

    await fetchResumo();
  }, [fetchResumo]);

  const getOportunidade = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("oportunidades")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Oportunidade;
  }, []);

  const getInteracoes = useCallback(async (oportunidadeId: string) => {
    const { data, error } = await supabase
      .from("oportunidade_interacoes")
      .select("*")
      .eq("oportunidade_id", oportunidadeId)
      .order("ocorreu_em", { ascending: false });

    if (error) throw error;
    return (data as OportunidadeInteracao[] | null) ?? [];
  }, []);

  const registrarInteracao = useCallback(async (payload: Omit<OportunidadeInteracao,"id" |"created_at">) => {
    const { error } = await supabase.from("oportunidade_interacoes").insert([payload]);
    if (error) throw error;
  }, []);

  const getTarefas = useCallback(async (oportunidadeId: string) => {
    const { data, error } = await supabase
      .from("oportunidade_tarefas")
      .select("*")
      .eq("oportunidade_id", oportunidadeId)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return (data as OportunidadeTarefa[] | null) ?? [];
  }, []);

  const createTarefa = useCallback(async (payload: Omit<OportunidadeTarefa,"id" |"created_at" |"concluido_em">) => {
    const { error } = await supabase.from("oportunidade_tarefas").insert([payload]);
    if (error) throw error;
  }, []);

  const atualizarStatusTarefa = useCallback(async (id: string, status: OportunidadeTarefa["status"]) => {
    const { error } = await supabase
      .from("oportunidade_tarefas")
      .update({ status, concluido_em: status ==="concluida" ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) throw error;
  }, []);

  const getPropostas = useCallback(async (oportunidadeId: string) => {
    const { data, error } = await supabase
      .from("oportunidade_propostas")
      .select("*")
      .eq("oportunidade_id", oportunidadeId)
      .order("criada_em", { ascending: false });

    if (error) throw error;
    return (data as OportunidadeProposta[] | null) ?? [];
  }, []);

  const registrarProposta = useCallback(async (payload: Omit<OportunidadeProposta,"id" |"criada_em" |"atualizada_em">) => {
    const { error } = await supabase.from("oportunidade_propostas").insert([payload]);
    if (error) throw error;
  }, []);

  const updateEtapa = useCallback(async (id: string, etapa: EtapaOportunidade) => {
    return updateOportunidade(id, { etapa });
  }, [updateOportunidade]);

  const oportunidadesPorEtapa = useMemo(() => {
    return state.oportunidades.reduce(
      (acc, oportunidade) => {
        if (!acc[oportunidade.etapa]) {
          acc[oportunidade.etapa] = [];
        }
        acc[oportunidade.etapa].push(oportunidade);
        return acc;
      },
      {} as Record<EtapaOportunidade, Oportunidade[]>
    );
  }, [state.oportunidades]);

  useEffect(() => {
    fetchOportunidades();
    fetchResumo();

    const channel = supabase
      .channel("oportunidades_channel")
      .on("postgres_changes", { event:"*", schema:"public", table:"oportunidades" }, () => {
        fetchOportunidades();
        fetchResumo();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOportunidades, fetchResumo]);

  return {
    ...state,
    oportunidadesPorEtapa,
    fetchOportunidades,
    fetchResumo,
    createOportunidade,
    updateOportunidade,
    deleteOportunidade,
    getOportunidade,
    getInteracoes,
    registrarInteracao,
    getTarefas,
    createTarefa,
    atualizarStatusTarefa,
    getPropostas,
    registrarProposta,
    updateEtapa,
  };
}

export default useOportunidades;

