/**
 * Hook: useMedicos
 * CRUD completo de médicos cirurgiões
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Medico {
  id: string;
  nome: string;
  crm: string;
  crm_uf: string;
  especialidade: string;
  telefone?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  hospital_principal?: string;
  volume_anual_estimado?: number;
  taxa_sucesso?: number;
  cirurgias_realizadas?: number;
  status?: "ativo" | "inativo" | "suspenso";
  created_at?: string;
  updated_at?: string;
}

export function useMedicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar todos os médicos
  useEffect(() => {
    fetchMedicos();
  }, []);

  const fetchMedicos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("medicos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setMedicos(data || []);
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : "Erro ao carregar médicos");
    } finally {
      setLoading(false);
    }
  };

  // Buscar médico por ID
  const getMedicoById = async (id: string): Promise<Medico | null> => {
    try {
      const { data, error } = await supabase
        .from("medicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : "Erro ao buscar médico");
      return null;
    }
  };

  // Criar novo médico
  const createMedico = async (
    medico: Omit<Medico, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("medicos")
        .insert([medico])
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setMedicos((prev) => [...prev, data]);
      return data;
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : "Erro ao criar médico");
      throw err;
    }
  };

  // Atualizar médico
  const updateMedico = async (id: string, updates: Partial<Medico>) => {
    try {
      const { data, error } = await supabase
        .from("medicos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setMedicos((prev) => prev.map((m) => (m.id === id ? data : m)));
      return data;
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : "Erro ao atualizar médico");
      throw err;
    }
  };

  // Deletar médico
  const deleteMedico = async (id: string) => {
    try {
      const { error } = await supabase.from("medicos").delete().eq("id", id);

      if (error) throw error;

      // Atualizar lista local
      setMedicos((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : "Erro ao deletar médico");
      throw err;
    }
  };

  // Buscar médicos por especialidade
  const getMedicosByEspecialidade = async (especialidade: string) => {
    try {
      const { data, error } = await supabase
        .from("medicos")
        .select("*")
        .eq("especialidade", especialidade)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : "Erro ao buscar médicos");
      return [];
    }
  };

  // Buscar médicos por status
  const getMedicosByStatus = async (status: string) => {
    try {
      const { data, error } = await supabase
        .from("medicos")
        .select("*")
        .eq("status", status)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : "Erro ao buscar médicos");
      return [];
    }
  };

  // Buscar médicos ativos
  const getMedicosAtivos = () => {
    return medicos.filter((m) => m.status === "ativo");
  };

  // Contar médicos por especialidade
  const countByEspecialidade = () => {
    const counts: Record<string, number> = {};
    medicos.forEach((m) => {
      counts[m.especialidade] = (counts[m.especialidade] || 0) + 1;
    });
    return counts;
  };

  return {
    medicos,
    loading,
    error,
    fetchMedicos,
    getMedicoById,
    createMedico,
    updateMedico,
    deleteMedico,
    getMedicosByEspecialidade,
    getMedicosByStatus,
    getMedicosAtivos,
    countByEspecialidade,
  };
}
