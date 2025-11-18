import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook Genérico para Produtos OPME
 * Tabela: produtos
 */

export interface ProdutoOPME {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  registro_anvisa?: string;
  fabricante?: string;
  categoria: string;
  preco_unitario: number;
  estoque_minimo?: number;
  estoque_atual?: number;
  unidade_medida: string;
  ativo: boolean;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProdutos = () => {
  const [produtos, setProdutos] = useState<ProdutoOPME[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null);

  const fetchProdutos = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('produtos')
        .select('*')
        .order('nome');

      if (filtroCategoria) {
        query = query.eq('categoria', filtroCategoria);
      }

      if (filtroAtivo !== null) {
        query = query.eq('ativo', filtroAtivo);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setProdutos((data as ProdutoOPME[] | null) ?? []);
      setError(null);
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setError(message);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, [filtroCategoria, filtroAtivo]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const criarProduto = async (produto: Omit<ProdutoOPME, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(produto)
        .select()
        .single();

      if (error) throw error;

      await fetchProdutos();
      return data as ProdutoOPME;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message : 'Erro ao criar produto';
      setError(message);
      throw err;
    }
  };

  const atualizarProduto = async (id: string, updates: Partial<ProdutoOPME>) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchProdutos();
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(message);
      throw err;
    }
  };

  const deletarProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProdutos();
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message : 'Erro ao deletar produto';
      setError(message);
      throw err;
    }
  };

  return {
    produtos,
    loading,
    error,
    filtroCategoria,
    setFiltroCategoria,
    filtroAtivo,
    setFiltroAtivo,
    fetchProdutos,
    criarProduto,
    atualizarProduto,
    deletarProduto
  };
};

