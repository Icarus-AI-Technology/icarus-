/**
 * Hook: useLotesFaturamento
 * Gestão de Lotes de Faturamento para Convênios
 *
 * FUNCIONALIDADES:
 * - CRUD de lotes de faturamento
 * - Agrupamento de cirurgias/procedimentos
 * - Envio para convênios (18+)
 * - Acompanhamento de status
 * - Detecção de glosas (IA)
 * - Realtime subscriptions
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface LoteFaturamento {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;

  // Identificação
  numero_lote: string;
  convenio_id: string;
  convenio_nome: string;

  // Período
  mes_referencia: string; // YYYY-MM
  data_fechamento: string;
  data_envio?: string;
  data_retorno?: string;

  // Valores
  quantidade_itens: number;
  valor_total: number;
  valor_glosado: number;
  valor_aprovado: number;
  valor_pago: number;

  // Status
  status:
    | "rascunho"
    | "fechado"
    | "enviado"
    | "processando"
    | "aprovado"
    | "glosado"
    | "pago"
    | "cancelado";

  // Glosas
  possui_glosas: boolean;
  quantidade_glosas: number;
  motivos_glosas?: Array<{
    item_id: string;
    motivo: string;
    valor: number;
  }>;

  // Análise IA
  risco_glosa?: "baixo" | "médio" | "alto";
  score_qualidade?: number; // 0-100

  // Arquivos
  arquivo_envio_url?: string;
  arquivo_retorno_url?: string;

  // Observações
  observacoes?: string;

  // Itens do lote
  itens?: Array<{
    id: string;
    cirurgia_id: string;
    paciente_nome: string;
    procedimento: string;
    data_procedimento: string;
    valor: number;
    status: "pendente" | "aprovado" | "glosado";
  }>;
}

interface LotesFaturamentoFilters {
  status?: LoteFaturamento["status"];
  convenio_id?: string;
  mes_referencia?: string;
  possui_glosas?: boolean;
  risco?: LoteFaturamento["risco_glosa"];
}

interface LotesFaturamentoResumo {
  total_lotes: number;
  lotes_enviados: number;
  lotes_aprovados: number;
  lotes_com_glosas: number;
  valor_total_periodo: number;
  valor_total_glosado: number;
  valor_total_aprovado: number;
  taxa_glosa: number; // percentual
  ticket_medio_lote: number;
}

export function useLotesFaturamento() {
  const [lotes, setLotes] = useState<LoteFaturamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lotes
  const fetchLotes = useCallback(async (filters?: LotesFaturamentoFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("lotes_faturamento")
        .select("*")
        .order("data_fechamento", { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.convenio_id) {
        query = query.eq("convenio_id", filters.convenio_id);
      }
      if (filters?.mes_referencia) {
        query = query.eq("mes_referencia", filters.mes_referencia);
      }
      if (filters?.possui_glosas !== undefined) {
        query = query.eq("possui_glosas", filters.possui_glosas);
      }
      if (filters?.risco) {
        query = query.eq("risco_glosa", filters.risco);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setLotes((data as LoteFaturamento[]) || []);
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar lotes de faturamento";
      setError(message);
      console.error("Erro useLotesFaturamento:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create lote
  const createLote = useCallback(
    async (
      novoLote: Omit<
        LoteFaturamento,
        "id" | "created_at" | "updated_at" | "empresa_id"
      >,
    ) => {
      try {
        setError(null);
        const { data, error: createError } = await supabase
          .from("lotes_faturamento")
          .insert([novoLote])
          .select()
          .single();

        if (createError) throw createError;
        return data as LoteFaturamento;
      } catch (error) {
        const err = error as Error;
        const message =
          err instanceof Error ? err.message : "Erro ao criar lote";
        setError(message);
        console.error("Erro createLote:", err);
        return null;
      }
    },
    [],
  );

  // Update lote
  const updateLote = useCallback(
    async (id: string, updates: Partial<LoteFaturamento>) => {
      try {
        setError(null);
        const { data, error: updateError } = await supabase
          .from("lotes_faturamento")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        return data as LoteFaturamento;
      } catch (error) {
        const err = error as Error;
        const message =
          err instanceof Error ? err.message : "Erro ao atualizar lote";
        setError(message);
        console.error("Erro updateLote:", err);
        return null;
      }
    },
    [],
  );

  // Delete lote
  const deleteLote = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from("lotes_faturamento")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao excluir lote";
      setError(message);
      console.error("Erro deleteLote:", err);
      return false;
    }
  }, []);

  // Fechar lote (impedir alterações)
  const fecharLote = useCallback(async (id: string) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from("lotes_faturamento")
        .update({
          status: "fechado",
          data_fechamento: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as LoteFaturamento;
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao fechar lote";
      setError(message);
      console.error("Erro fecharLote:", err);
      return null;
    }
  }, []);

  // Enviar lote para convênio
  const enviarLote = useCallback(async (id: string, arquivoUrl?: string) => {
    try {
      setError(null);

      // Buscar lote atual
      const { data: loteAtual, error: fetchError } = await supabase
        .from("lotes_faturamento")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Validar se está fechado
      if ((loteAtual as LoteFaturamento).status !== "fechado") {
        throw new Error("Lote deve estar fechado para ser enviado");
      }

      // Atualizar status
      const { data, error: updateError } = await supabase
        .from("lotes_faturamento")
        .update({
          status: "enviado",
          data_envio: new Date().toISOString(),
          arquivo_envio_url: arquivoUrl,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as LoteFaturamento;
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao enviar lote";
      setError(message);
      console.error("Erro enviarLote:", err);
      return null;
    }
  }, []);

  // Processar retorno do convênio
  const processarRetorno = useCallback(
    async (
      id: string,
      arquivoRetornoUrl: string,
      valorAprovado: number,
      valorGlosado: number,
      glosas?: LoteFaturamento["motivos_glosas"],
    ) => {
      try {
        setError(null);

        const possuiGlosas = valorGlosado > 0;
        const status: LoteFaturamento["status"] = possuiGlosas
          ? "glosado"
          : "aprovado";

        const { data, error: updateError } = await supabase
          .from("lotes_faturamento")
          .update({
            status,
            data_retorno: new Date().toISOString(),
            arquivo_retorno_url: arquivoRetornoUrl,
            valor_aprovado: valorAprovado,
            valor_glosado: valorGlosado,
            possui_glosas: possuiGlosas,
            quantidade_glosas: glosas?.length || 0,
            motivos_glosas: glosas,
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        return data as LoteFaturamento;
      } catch (error) {
        const err = error as Error;
        const message =
          err instanceof Error ? err.message : "Erro ao processar retorno";
        setError(message);
        console.error("Erro processarRetorno:", err);
        return null;
      }
    },
    [],
  );

  // Analisar lote com IA (detecção de glosas)
  const analisarLoteIA = useCallback(async (id: string) => {
    try {
      setError(null);

      // Importar GlosasDetectionAI dinamicamente
      const { glosasDetectionAI } = await import(
        "@/lib/services/GlosasDetectionAI"
      );

      // Buscar lote
      const { data: lote, error: fetchError } = await supabase
        .from("lotes_faturamento")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Analisar com IA
      const analise = await glosasDetectionAI.analisarLote(
        lote as LoteFaturamento,
      );

      // Atualizar lote com análise
      const { data, error: updateError } = await supabase
        .from("lotes_faturamento")
        .update({
          risco_glosa: analise.risco,
          score_qualidade: analise.score_qualidade,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { lote: data as LoteFaturamento, analise };
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao analisar lote com IA";
      setError(message);
      console.error("Erro analisarLoteIA:", err);
      return null;
    }
  }, []);

  // Get resumo
  const getResumo = useCallback(
    async (mesReferencia?: string): Promise<LotesFaturamentoResumo> => {
      try {
        let query = supabase.from("lotes_faturamento").select("*");

        if (mesReferencia) {
          query = query.eq("mes_referencia", mesReferencia);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const lotesData = (data as LoteFaturamento[]) || [];
        const total = lotesData.length;

        const enviados = lotesData.filter((l) =>
          ["enviado", "processando", "aprovado", "glosado", "pago"].includes(
            l.status,
          ),
        );
        const aprovados = lotesData.filter(
          (l) => l.status === "aprovado" || l.status === "pago",
        );
        const comGlosas = lotesData.filter((l) => l.possui_glosas);

        const valorTotal = lotesData.reduce((sum, l) => sum + l.valor_total, 0);
        const valorGlosado = lotesData.reduce(
          (sum, l) => sum + l.valor_glosado,
          0,
        );
        const valorAprovado = lotesData.reduce(
          (sum, l) => sum + l.valor_aprovado,
          0,
        );

        return {
          total_lotes: total,
          lotes_enviados: enviados.length,
          lotes_aprovados: aprovados.length,
          lotes_com_glosas: comGlosas.length,
          valor_total_periodo: valorTotal,
          valor_total_glosado: valorGlosado,
          valor_total_aprovado: valorAprovado,
          taxa_glosa: valorTotal > 0 ? (valorGlosado / valorTotal) * 100 : 0,
          ticket_medio_lote: total > 0 ? valorTotal / total : 0,
        };
      } catch (error) {
        const err = error as Error;
        console.error("Erro getResumo:", err);
        return {
          total_lotes: 0,
          lotes_enviados: 0,
          lotes_aprovados: 0,
          lotes_com_glosas: 0,
          valor_total_periodo: 0,
          valor_total_glosado: 0,
          valor_total_aprovado: 0,
          taxa_glosa: 0,
          ticket_medio_lote: 0,
        };
      }
    },
    [],
  );

  // Setup Realtime
  useEffect(() => {
    fetchLotes();

    const channel = supabase
      .channel("lotes_faturamento_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lotes_faturamento",
        },
        () => {
          fetchLotes();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLotes]);

  return {
    lotes,
    loading,
    error,
    fetchLotes,
    createLote,
    updateLote,
    deleteLote,
    fecharLote,
    enviarLote,
    processarRetorno,
    analisarLoteIA,
    getResumo,
  };
}
