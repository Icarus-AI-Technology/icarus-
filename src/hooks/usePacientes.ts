/**
 * Hook: usePacientes
 * Gerenciamento de pacientes
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Paciente {
  id: string;
  empresa_id: string;
  nome: string;
  cpf: string;
  rg?: string;
  data_nascimento: string;
  sexo: "M" | "F" | "Outro";
  email?: string;
  telefone: string;
  whatsapp?: string;
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  convenio_id?: string;
  numero_carteirinha?: string;
  plano?: string;
  validade_carteirinha?: string;
  responsavel?: {
    nome: string;
    parentesco: string;
    cpf: string;
    telefone: string;
  };
  alergias?: string[];
  comorbidades?: string[];
  observacoes?: string;
  status: "ativo" | "inativo";
  criado_em: string;
  atualizado_em: string;
}

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  async function fetchPacientes() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("pacientes")
        .select("*")
        .order("nome");

      if (fetchError) throw fetchError;
      setPacientes(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar pacientes",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createPaciente(
    pacienteData: Omit<Paciente, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("pacientes")
        .insert([pacienteData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchPacientes();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar paciente",
      );
    }
  }

  async function updatePaciente(id: string, updates: Partial<Paciente>) {
    try {
      const { data, error: updateError } = await supabase
        .from("pacientes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchPacientes();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar paciente",
      );
    }
  }

  async function deletePaciente(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("pacientes")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchPacientes();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar paciente",
      );
    }
  }

  async function buscarPorCPF(cpf: string) {
    try {
      const { data, error: searchError } = await supabase
        .from("pacientes")
        .select("*")
        .eq("cpf", cpf)
        .single();

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Paciente não encontrado",
      );
    }
  }

  return {
    pacientes,
    loading,
    error,
    createPaciente,
    updatePaciente,
    deletePaciente,
    buscarPorCPF,
    refresh: fetchPacientes,
  };
}
