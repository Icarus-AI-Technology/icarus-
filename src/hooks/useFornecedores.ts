/**
 * Hook: useFornecedores
 * Gerenciamento de fornecedores
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Fornecedor {
  id: string;
  empresa_id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  inscricao_estadual?: string;
  tipo: "fabricante" | "distribuidor" | "representante" | "importador";
  categoria: string[];
  email: string;
  telefone: string;
  whatsapp?: string;
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
  banco?: {
    banco: string;
    agencia: string;
    conta: string;
    tipo: "corrente" | "poupanca";
  };
  status: "ativo" | "inativo" | "bloqueado";
  avaliacao?: number;
  observacoes?: string;
  tags?: string[];
  criado_em: string;
  atualizado_em: string;
}

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFornecedores();
  }, []);

  async function fetchFornecedores() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("fornecedores")
        .select("*")
        .order("razao_social");

      if (fetchError) throw fetchError;
      setFornecedores(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar fornecedores",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createFornecedor(
    fornecedorData: Omit<Fornecedor, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("fornecedores")
        .insert([fornecedorData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchFornecedores();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar fornecedor",
      );
    }
  }

  async function updateFornecedor(id: string, updates: Partial<Fornecedor>) {
    try {
      const { data, error: updateError } = await supabase
        .from("fornecedores")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchFornecedores();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar fornecedor",
      );
    }
  }

  async function deleteFornecedor(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("fornecedores")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchFornecedores();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar fornecedor",
      );
    }
  }

  return {
    fornecedores,
    loading,
    error,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    refresh: fetchFornecedores,
  };
}
