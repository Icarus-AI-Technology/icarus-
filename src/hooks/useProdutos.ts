/**
 * Hook: useProdutos
 * Gerenciamento de produtos OPME
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Produto {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  categoria: string;
  subcategoria?: string;
  fabricante?: string;
  fornecedor_id?: string;
  unidade: string;
  ncm?: string;
  anvisa?: string;
  valor_unitario: number;
  custo_medio: number;
  estoque_minimo: number;
  estoque_maximo: number;
  ponto_reposicao: number;
  ativo: boolean;
  controlado: boolean;
  rastreavel: boolean;
  consignado: boolean;
  tags?: string[];
  especificacoes?: Record<string, unknown>;
  criado_em: string;
  atualizado_em: string;
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (fetchError) throw fetchError;
      setProdutos(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar produtos",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createProduto(
    produtoData: Omit<Produto, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("produtos")
        .insert([produtoData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchProdutos();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar produto",
      );
    }
  }

  async function updateProduto(id: string, updates: Partial<Produto>) {
    try {
      const { data, error: updateError } = await supabase
        .from("produtos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchProdutos();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar produto",
      );
    }
  }

  async function deleteProduto(id: string) {
    try {
      // Soft delete
      const { error: deleteError } = await supabase
        .from("produtos")
        .update({ ativo: false })
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchProdutos();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar produto",
      );
    }
  }

  async function buscarPorCodigo(codigo: string) {
    try {
      const { data, error: searchError } = await supabase
        .from("produtos")
        .select("*")
        .eq("codigo", codigo)
        .single();

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Produto não encontrado",
      );
    }
  }

  async function buscarPorAnvisa(anvisa: string) {
    try {
      const { data, error: searchError } = await supabase
        .from("produtos")
        .select("*")
        .eq("anvisa", anvisa)
        .single();

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Produto não encontrado",
      );
    }
  }

  return {
    produtos,
    loading,
    error,
    createProduto,
    updateProduto,
    deleteProduto,
    buscarPorCodigo,
    buscarPorAnvisa,
    refresh: fetchProdutos,
  };
}
