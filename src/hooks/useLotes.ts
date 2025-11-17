/**
 * Hook: useLotes
 * Gerenciamento de lotes OPME
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Lote {
  id: string;
  empresa_id: string;
  produto_id: string;
  numero_lote: string;
  data_fabricacao: string;
  data_validade: string;
  quantidade: number;
  quantidade_disponivel: number;
  fornecedor_id: string;
  nota_fiscal?: string;
  certificado_qualidade?: string;
  anvisa_registro?: string;
  status: "disponivel" | "em_uso" | "bloqueado" | "vencido" | "recall";
  motivo_bloqueio?: string;
  localizacao?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export function useLotes() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLotes();
  }, []);

  async function fetchLotes() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("lotes")
        .select("*")
        .order("data_validade");

      if (fetchError) throw fetchError;
      setLotes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  }

  async function createLote(
    loteData: Omit<Lote, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("lotes")
        .insert([loteData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchLotes();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar lote",
      );
    }
  }

  async function updateLote(id: string, updates: Partial<Lote>) {
    try {
      const { data, error: updateError } = await supabase
        .from("lotes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchLotes();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar lote",
      );
    }
  }

  async function bloquearLote(id: string, motivo: string) {
    try {
      await updateLote(id, {
        status: "bloqueado",
        motivo_bloqueio: motivo,
      });
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao bloquear lote",
      );
    }
  }

  async function buscarPorProduto(produtoId: string) {
    try {
      const { data, error: searchError } = await supabase
        .from("lotes")
        .select("*")
        .eq("produto_id", produtoId)
        .eq("status", "disponivel")
        .order("data_validade");

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro na busca");
    }
  }

  async function buscarVencidos() {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const { data, error: searchError } = await supabase
        .from("lotes")
        .select("*")
        .lt("data_validade", hoje)
        .neq("status", "vencido");

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro na busca");
    }
  }

  return {
    lotes,
    loading,
    error,
    createLote,
    updateLote,
    bloquearLote,
    buscarPorProduto,
    buscarVencidos,
    refresh: fetchLotes,
  };
}
