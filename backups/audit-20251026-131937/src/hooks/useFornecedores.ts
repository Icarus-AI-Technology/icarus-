import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Hook para Fornecedores
 * Tabela: fornecedores
 */

export interface EnderecoFornecedor {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;
}

export interface Fornecedor {
  id: string;
  empresa_id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  email: string;
  telefone?: string;
  endereco?: EnderecoFornecedor | null;
  tipo: "nacional" | "internacional";
  categoria: string;
  ativo: boolean;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const fetchFornecedores = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("fornecedores")
        .select("*")
        .order("razao_social");

      if (fetchError) throw fetchError;

      setFornecedores((data as Fornecedor[] | null) ?? []);
      setError(null);
    } catch (error) {
      const err = error as Error;
      setError(
        err instanceof Error ? err.message : "Erro ao carregar fornecedores",
      );
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  };

  const criarFornecedor = async (fornecedor: Omit<Fornecedor, "id">) => {
    try {
      const { data, error } = await supabase
        .from("fornecedores")
        .insert(fornecedor)
        .select()
        .single();

      if (error) throw error;

      await fetchFornecedores();
      return data as Fornecedor;
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao criar fornecedor";
      setError(message);
      throw err;
    }
  };

  const atualizarFornecedor = async (
    id: string,
    updates: Partial<Fornecedor>,
  ) => {
    try {
      const { error } = await supabase
        .from("fornecedores")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchFornecedores();
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar fornecedor";
      setError(message);
      throw err;
    }
  };

  const deletarFornecedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fornecedores")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchFornecedores();
    } catch (error) {
      const err = error as Error;
      const message =
        err instanceof Error ? err.message : "Erro ao deletar fornecedor";
      setError(message);
      throw err;
    }
  };

  return {
    fornecedores,
    loading,
    error,
    fetchFornecedores,
    criarFornecedor,
    atualizarFornecedor,
    deletarFornecedor,
  };
};
