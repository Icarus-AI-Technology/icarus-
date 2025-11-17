/**
 * Hook: useOportunidades
 * Gerenciamento de oportunidades de vendas
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Oportunidade {
  id: string;
  empresa_id: string;
  lead_id?: string;
  titulo: string;
  descricao?: string;
  valor: number;
  probabilidade: number;
  estagio:
    | "prospeccao"
    | "qualificacao"
    | "proposta"
    | "negociacao"
    | "fechamento";
  status: "aberta" | "ganha" | "perdida" | "cancelada";
  data_fechamento_estimada?: string;
  data_fechamento_real?: string;
  responsavel_id?: string;
  origem: string;
  tags?: string[];
  criado_em: string;
  atualizado_em: string;
}

export function useOportunidades() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOportunidades();
  }, []);

  async function fetchOportunidades() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("oportunidades")
        .select("*")
        .order("criado_em", { ascending: false });

      if (fetchError) throw fetchError;
      setOportunidades(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar oportunidades",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createOportunidade(
    oportunidadeData: Omit<Oportunidade, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("oportunidades")
        .insert([oportunidadeData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchOportunidades();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar oportunidade",
      );
    }
  }

  async function updateOportunidade(
    id: string,
    updates: Partial<Oportunidade>,
  ) {
    try {
      const { data, error: updateError } = await supabase
        .from("oportunidades")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchOportunidades();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar oportunidade",
      );
    }
  }

  async function deleteOportunidade(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("oportunidades")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchOportunidades();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar oportunidade",
      );
    }
  }

  return {
    oportunidades,
    loading,
    error,
    createOportunidade,
    updateOportunidade,
    deleteOportunidade,
    refresh: fetchOportunidades,
  };
}
