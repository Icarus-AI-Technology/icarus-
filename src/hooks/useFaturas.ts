/**
 * Hook: useFaturas
 * Gerenciamento de faturas e NF-e
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Fatura {
  id: string;
  empresa_id: string;
  numero_fatura: string;
  cliente_id: string;
  valor_total: number;
  status: "pendente" | "emitida" | "enviada" | "paga" | "cancelada";
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  nfe_numero?: string;
  nfe_chave?: string;
  nfe_xml?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export function useFaturas() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFaturas();
  }, []);

  async function fetchFaturas() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("faturas")
        .select("*")
        .order("criado_em", { ascending: false });

      if (fetchError) throw fetchError;
      setFaturas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar faturas");
    } finally {
      setLoading(false);
    }
  }

  async function createFatura(
    faturaData: Omit<Fatura, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("faturas")
        .insert([faturaData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchFaturas();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar fatura",
      );
    }
  }

  async function updateFatura(id: string, updates: Partial<Fatura>) {
    try {
      const { data, error: updateError } = await supabase
        .from("faturas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchFaturas();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar fatura",
      );
    }
  }

  async function deleteFatura(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("faturas")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchFaturas();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar fatura",
      );
    }
  }

  return {
    faturas,
    loading,
    error,
    createFatura,
    updateFatura,
    deleteFatura,
    refresh: fetchFaturas,
  };
}
