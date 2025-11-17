/**
 * Hook: useHospitais
 * Gerenciamento de hospitais com Supabase
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Hospital {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  tipo: "publico" | "privado" | "filantrópico";
  status: "ativo" | "inativo";
  contato_principal: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface HospitaisState {
  hospitais: Hospital[];
  loading: boolean;
  error: string | null;
}

export function useHospitais() {
  const [state, setState] = useState<HospitaisState>({
    hospitais: [],
    loading: true,
    error: null,
  });

  const fetchHospitais = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("hospitais")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;

      setState({
        hospitais: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Erro ao carregar hospitais",
      }));
    }
  }, []);

  const getHospitalById = useCallback(
    async (id: string): Promise<Hospital | null> => {
      try {
        const { data, error } = await supabase
          .from("hospitais")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar hospital:", err);
        return null;
      }
    },
    [],
  );

  const createHospital = useCallback(
    async (
      hospital: Omit<Hospital, "id" | "created_at" | "updated_at">,
    ): Promise<Hospital | null> => {
      try {
        const { data, error } = await supabase
          .from("hospitais")
          .insert([hospital])
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          hospitais: [...prev.hospitais, data],
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao criar hospital",
        }));
        return null;
      }
    },
    [],
  );

  const updateHospital = useCallback(
    async (
      id: string,
      updates: Partial<Hospital>,
    ): Promise<Hospital | null> => {
      try {
        const { data, error } = await supabase
          .from("hospitais")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          hospitais: prev.hospitais.map((h) => (h.id === id ? data : h)),
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao atualizar hospital",
        }));
        return null;
      }
    },
    [],
  );

  const deleteHospital = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("hospitais").delete().eq("id", id);

      if (error) throw error;

      // Atualizar lista local
      setState((prev) => ({
        ...prev,
        hospitais: prev.hospitais.filter((h) => h.id !== id),
      }));

      return true;
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Erro ao deletar hospital",
      }));
      return false;
    }
  }, []);

  const getHospitaisByTipo = useCallback(async (tipo: Hospital["tipo"]) => {
    try {
      const { data, error } = await supabase
        .from("hospitais")
        .select("*")
        .eq("tipo", tipo)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar hospitais por tipo:", err);
      return [];
    }
  }, []);

  const getHospitaisAtivos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("hospitais")
        .select("*")
        .eq("status", "ativo")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar hospitais ativos:", err);
      return [];
    }
  }, []);

  const countByTipo = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("hospitais").select("tipo");

      if (error) throw error;

      const counts = data.reduce(
        (acc, h) => {
          acc[h.tipo] = (acc[h.tipo] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return counts;
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao contar hospitais:", err);
      return {};
    }
  }, []);

  useEffect(() => {
    fetchHospitais();
  }, [fetchHospitais]);

  return {
    ...state,
    fetchHospitais,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitaisByTipo,
    getHospitaisAtivos,
    countByTipo,
  };
}
