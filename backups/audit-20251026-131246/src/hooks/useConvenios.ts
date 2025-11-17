/**
 * Hook: useConvenios
 * Gestão de Convênios/Planos de Saúde
 *
 * FUNCIONALIDADES:
 * - CRUD de convênios
 * - Tabelas de preços por convênio
 * - Prazos de pagamento
 * - Status de integração
 * - Realtime subscriptions
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Convenio {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;

  // Identificação
  nome: string;
  cnpj: string;
  ans_registro?: string;

  // Tipo
  tipo: "plano_saude" | "seguros" | "publico";

  // Contato
  telefone?: string;
  whatsapp?: string;
  email: string;
  site?: string;

  // Endereço
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };

  // Financeiro
  prazo_pagamento: number; // dias
  taxa_administrativa: number; // percentual
  forma_pagamento: string;
  dia_fechamento?: number;
  dia_pagamento?: number;

  // Faturamento
  faturamento_eletronico: boolean;
  portal_faturamento?: string;
  login_portal?: string;
  senha_portal?: string; // Criptografada

  // Autorizações
  exige_autorizacao: boolean;
  prazo_autorizacao?: number; // dias

  // Tabela de Preços
  tabela_preco_id?: string;
  usa_tabela_tuss: boolean;
  percentual_tuss?: number; // % sobre TUSS

  // Status
  ativo: boolean;

  // Observações
  observacoes?: string;

  // Estatísticas
  total_faturado?: number;
  total_glosas?: number;
  taxa_glosa?: number;
}

interface ConveniosFilters {
  ativo?: boolean;
  tipo?: Convenio["tipo"];
  faturamento_eletronico?: boolean;
  exige_autorizacao?: boolean;
}

interface ConveniosResumo {
  total_convenios: number;
  convenios_ativos: number;
  com_faturamento_eletronico: number;
  valor_total_faturado: number;
  valor_total_glosas: number;
  taxa_glosa_media: number;
  ticket_medio_convenio: number;
}

export function useConvenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch convenios
  const fetchConvenios = useCallback(async (filters?: ConveniosFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("convenios")
        .select("*")
        .order("nome", { ascending: true });

      // Aplicar filtros
      if (filters?.ativo !== undefined) {
        query = query.eq("ativo", filters.ativo);
      }
      if (filters?.tipo) {
        query = query.eq("tipo", filters.tipo);
      }
      if (filters?.faturamento_eletronico !== undefined) {
        query = query.eq(
          "faturamento_eletronico",
          filters.faturamento_eletronico,
        );
      }
      if (filters?.exige_autorizacao !== undefined) {
        query = query.eq("exige_autorizacao", filters.exige_autorizacao);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setConvenios((data as Convenio[]) || []);
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao carregar convênios";
      setError(message);
      console.error("Erro useConvenios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create convenio
  const createConvenio = useCallback(
    async (
      novoConvenio: Omit<
        Convenio,
        "id" | "created_at" | "updated_at" | "empresa_id"
      >,
    ) => {
      try {
        setError(null);
        const { data, error: createError } = await supabase
          .from("convenios")
          .insert([novoConvenio])
          .select()
          .single();

        if (createError) throw createError;
        return data as Convenio;
      } catch (error) {
        const err = error as Error;
        const message =
          err instanceof Error ? err.message : "Erro ao criar convênio";
        setError(message);
        console.error("Erro createConvenio:", err);
        return null;
      }
    },
    [],
  );

  // Update convenio
  const updateConvenio = useCallback(
    async (id: string, updates: Partial<Convenio>) => {
      try {
        setError(null);
        const { data, error: updateError } = await supabase
          .from("convenios")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        return data as Convenio;
      } catch (error) {
        const err = error as Error;
        const message =
          err instanceof Error ? err.message : "Erro ao atualizar convênio";
        setError(message);
        console.error("Erro updateConvenio:", err);
        return null;
      }
    },
    [],
  );

  // Delete convenio
  const deleteConvenio = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from("convenios")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao excluir convênio";
      setError(message);
      console.error("Erro deleteConvenio:", err);
      return false;
    }
  }, []);

  // Get estatísticas do convênio
  const getEstatisticasConvenio = useCallback(async (convenioId: string) => {
    try {
      // Buscar lotes do convênio
      const { data: lotes, error: lotesError } = await supabase
        .from("lotes_faturamento")
        .select("valor_total, valor_glosado")
        .eq("convenio_id", convenioId);

      if (lotesError) throw lotesError;

      const lotesData =
        (lotes as Array<{
          valor_total: number;
          valor_glosado: number;
        }> | null) ?? [];
      const totalFaturado = lotesData.reduce(
        (sum, lote) => sum + (lote.valor_total ?? 0),
        0,
      );
      const totalGlosas = lotesData.reduce(
        (sum, lote) => sum + (lote.valor_glosado ?? 0),
        0,
      );
      const taxaGlosa =
        totalFaturado > 0 ? (totalGlosas / totalFaturado) * 100 : 0;

      // Atualizar convenio
      await supabase
        .from("convenios")
        .update({
          total_faturado: totalFaturado,
          total_glosas: totalGlosas,
          taxa_glosa: taxaGlosa,
        })
        .eq("id", convenioId);

      return {
        total_faturado: totalFaturado,
        total_glosas: totalGlosas,
        taxa_glosa: taxaGlosa,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Erro getEstatisticasConvenio:", err);
      return {
        total_faturado: 0,
        total_glosas: 0,
        taxa_glosa: 0,
      };
    }
  }, []);

  // Get resumo
  const getResumo = useCallback(async (): Promise<ConveniosResumo> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("convenios")
        .select("*");

      if (fetchError) throw fetchError;

      const conveniosData = (data as Convenio[]) || [];
      const total = conveniosData.length;
      const ativos = conveniosData.filter((c) => c.ativo);
      const comFaturamentoEletronico = conveniosData.filter(
        (c) => c.faturamento_eletronico,
      );

      const valorFaturado = conveniosData.reduce(
        (sum, c) => sum + (c.total_faturado || 0),
        0,
      );
      const valorGlosas = conveniosData.reduce(
        (sum, c) => sum + (c.total_glosas || 0),
        0,
      );

      const conveniosComTaxa = conveniosData.filter(
        (c) => c.taxa_glosa !== undefined && c.taxa_glosa > 0,
      );
      const taxaGlosaMedia =
        conveniosComTaxa.length > 0
          ? conveniosComTaxa.reduce((sum, c) => sum + (c.taxa_glosa || 0), 0) /
            conveniosComTaxa.length
          : 0;

      return {
        total_convenios: total,
        convenios_ativos: ativos.length,
        com_faturamento_eletronico: comFaturamentoEletronico.length,
        valor_total_faturado: valorFaturado,
        valor_total_glosas: valorGlosas,
        taxa_glosa_media: taxaGlosaMedia,
        ticket_medio_convenio:
          ativos.length > 0 ? valorFaturado / ativos.length : 0,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Erro getResumo:", err);
      return {
        total_convenios: 0,
        convenios_ativos: 0,
        com_faturamento_eletronico: 0,
        valor_total_faturado: 0,
        valor_total_glosas: 0,
        taxa_glosa_media: 0,
        ticket_medio_convenio: 0,
      };
    }
  }, []);

  // Setup Realtime
  useEffect(() => {
    fetchConvenios();

    const channel = supabase
      .channel("convenios_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "convenios",
        },
        () => {
          fetchConvenios();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConvenios]);

  return {
    convenios,
    loading,
    error,
    fetchConvenios,
    createConvenio,
    updateConvenio,
    deleteConvenio,
    getEstatisticasConvenio,
    getResumo,
  };
}
