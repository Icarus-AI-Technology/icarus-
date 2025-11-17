/**
 * Hook: useKits
 * Gerenciamento de kits cirúrgicos
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Kit {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  especialidade: string;
  procedimento: string;
  items: Array<{
    produto_id: string;
    quantidade: number;
    observacao?: string;
  }>;
  valor_total: number;
  tempo_montagem_minutos: number;
  ativo: boolean;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export function useKits() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKits();
  }, []);

  async function fetchKits() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("kits_cirurgicos")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (fetchError) throw fetchError;
      setKits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar kits");
    } finally {
      setLoading(false);
    }
  }

  async function createKit(
    kitData: Omit<Kit, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("kits_cirurgicos")
        .insert([kitData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchKits();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao criar kit");
    }
  }

  async function updateKit(id: string, updates: Partial<Kit>) {
    try {
      const { data, error: updateError } = await supabase
        .from("kits_cirurgicos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchKits();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar kit",
      );
    }
  }

  async function deleteKit(id: string) {
    try {
      // Soft delete
      const { error: deleteError } = await supabase
        .from("kits_cirurgicos")
        .update({ ativo: false })
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchKits();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar kit",
      );
    }
  }

  async function buscarPorEspecialidade(especialidade: string) {
    try {
      const { data, error: searchError } = await supabase
        .from("kits_cirurgicos")
        .select("*")
        .eq("especialidade", especialidade)
        .eq("ativo", true);

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro na busca");
    }
  }

  return {
    kits,
    loading,
    error,
    createKit,
    updateKit,
    deleteKit,
    buscarPorEspecialidade,
    refresh: fetchKits,
  };
}
