/**
 * Hook: useEquipesMedicas
 * Gerenciamento de equipes médicas
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface EquipeMedica {
  id: string;
  empresa_id: string;
  nome: string;
  especialidade: string;
  cirurgiao_principal_id: string;
  membros: Array<{
    medico_id: string;
    funcao:
      | "cirurgiao"
      | "auxiliar"
      | "anestesista"
      | "instrumentador"
      | "circulante";
    ordem: number;
  }>;
  hospitais_atuacao: string[];
  dias_disponiveis?: string[];
  horarios_preferencia?: {
    inicio: string;
    fim: string;
  };
  procedimentos_realizados?: string[];
  taxa_sucesso?: number;
  tempo_medio_cirurgia?: number;
  ativa: boolean;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export function useEquipesMedicas() {
  const [equipes, setEquipes] = useState<EquipeMedica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipes();
  }, []);

  async function fetchEquipes() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("equipes_medicas")
        .select("*")
        .eq("ativa", true)
        .order("nome");

      if (fetchError) throw fetchError;
      setEquipes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar equipes");
    } finally {
      setLoading(false);
    }
  }

  async function createEquipe(
    equipeData: Omit<EquipeMedica, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("equipes_medicas")
        .insert([equipeData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchEquipes();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar equipe",
      );
    }
  }

  async function updateEquipe(id: string, updates: Partial<EquipeMedica>) {
    try {
      const { data, error: updateError } = await supabase
        .from("equipes_medicas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchEquipes();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar equipe",
      );
    }
  }

  async function deleteEquipe(id: string) {
    try {
      // Soft delete
      const { error: deleteError } = await supabase
        .from("equipes_medicas")
        .update({ ativa: false })
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchEquipes();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar equipe",
      );
    }
  }

  async function buscarPorEspecialidade(especialidade: string) {
    try {
      const { data, error: searchError } = await supabase
        .from("equipes_medicas")
        .select("*")
        .eq("especialidade", especialidade)
        .eq("ativa", true);

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro na busca");
    }
  }

  return {
    equipes,
    loading,
    error,
    createEquipe,
    updateEquipe,
    deleteEquipe,
    buscarPorEspecialidade,
    refresh: fetchEquipes,
  };
}
