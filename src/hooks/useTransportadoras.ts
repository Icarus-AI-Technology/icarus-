/**
 * Hook: useTransportadoras
 * Gerenciamento de transportadoras
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Transportadora {
  id: string;
  empresa_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual?: string;
  tipo: "correios" | "jadlog" | "tnt" | "fedex" | "braspress" | "outra";
  servicos: string[];
  email: string;
  telefone: string;
  website?: string;
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  contato_comercial?: {
    nome: string;
    email: string;
    telefone: string;
  };
  api_key?: string;
  api_secret?: string;
  api_config?: Record<string, unknown>;
  prazo_medio: number; // dias
  custo_medio_kg: number;
  percentual_seguro: number;
  status: "ativo" | "inativo";
  avaliacao?: number;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export function useTransportadoras() {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransportadoras();
  }, []);

  async function fetchTransportadoras() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("transportadoras")
        .select("*")
        .order("nome_fantasia");

      if (fetchError) throw fetchError;
      setTransportadoras(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar transportadoras",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createTransportadora(
    transportadoraData: Omit<
      Transportadora,
      "id" | "criado_em" | "atualizado_em"
    >,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("transportadoras")
        .insert([transportadoraData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchTransportadoras();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar transportadora",
      );
    }
  }

  async function updateTransportadora(
    id: string,
    updates: Partial<Transportadora>,
  ) {
    try {
      const { data, error: updateError } = await supabase
        .from("transportadoras")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchTransportadoras();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar transportadora",
      );
    }
  }

  async function deleteTransportadora(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("transportadoras")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchTransportadoras();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar transportadora",
      );
    }
  }

  return {
    transportadoras,
    loading,
    error,
    createTransportadora,
    updateTransportadora,
    deleteTransportadora,
    refresh: fetchTransportadoras,
  };
}
