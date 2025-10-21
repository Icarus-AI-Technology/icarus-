import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para Lotes OPME (Rastreabilidade ANVISA)
 * Tabela: lotes
 */

export interface Lote {
  id: string;
  empresa_id: string;
  produto_id: string;
  numero_lote: string;
  numero_serie?: string;
  data_fabricacao: string;
  data_validade: string;
  quantidade_inicial: number;
  quantidade_disponivel: number;
  status: 'disponivel' | 'reservado' | 'utilizado' | 'vencido';
  fornecedor_id?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useLotes = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Alertas
  const [lotesProximosVencimento, setLotesProximosVencimento] = useState<Lote[]>([]);
  const [lotesVencidos, setLotesVencidos] = useState<Lote[]>([]);

  const handleError = useCallback((err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback;
    setError(message);
  }, []);

  const fetchLotes = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('lotes')
        .select(`
          *,
          produto:produtos(nome, codigo, categoria)
        `)
        .order('data_validade', { ascending: true });

      if (fetchError) throw fetchError;

      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      // Filtrar lotes por vencimento
      const proximosVencimento = ((data ?? []) as Lote[]).filter(lote => {
        const validade = new Date(lote.data_validade);
        return validade > hoje && validade <= em30Dias;
      });

      const vencidos = ((data ?? []) as Lote[]).filter(lote => {
        const validade = new Date(lote.data_validade);
        return validade <= hoje;
      });

      setLotes((data as Lote[] | null) ?? []);
      setLotesProximosVencimento(proximosVencimento);
      setLotesVencidos(vencidos);
      setError(null);
    } catch (_err) {
      handleError(err, 'Erro ao carregar lotes');
      setLotes([]);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchLotes().catch((err: unknown) => handleError(err, 'Erro ao carregar lotes'));
  }, [fetchLotes, handleError]);

  const criarLote = async (lote: Omit<Lote, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('lotes')
        .insert(lote)
        .select()
        .single();

      if (error) throw error;

      await fetchLotes();
      return data as Lote;
    } catch (_err) {
      handleError(err, 'Erro ao criar lote');
      throw err;
    }
  };

  const atualizarLote = async (id: string, updates: Partial<Lote>) => {
    try {
      const { error } = await supabase
        .from('lotes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchLotes();
    } catch (_err) {
      handleError(err, 'Erro ao atualizar lote');
      throw err;
    }
  };

  const consumirLote = async (id: string, quantidade: number) => {
    try {
      // Busca lote atual
      const { data: lote, error: fetchError } = await supabase
        .from('lotes')
        .select('quantidade_disponivel')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const quantidadeDisponivel = (lote?.quantidade_disponivel ?? 0) - quantidade;

      if (quantidadeDisponivel < 0) {
        throw new Error('Quantidade insuficiente no lote');
      }

      // Atualiza quantidade
      const { error } = await supabase
        .from('lotes')
        .update({
          quantidade_disponivel: quantidadeDisponivel,
          status: quantidadeDisponivel === 0 ? 'utilizado' : 'disponivel'
        })
        .eq('id', id);

      if (error) throw error;

      await fetchLotes();
    } catch (_err) {
      handleError(err, 'Erro ao consumir lote');
      throw err;
    }
  };

  const buscarPorNumeroLote = async (numeroLote: string) => {
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select(`
          *,
          produto:produtos(*)
        `)
        .eq('numero_lote', numeroLote)
        .single();

      if (error) throw error;

      return data as Lote;
    } catch (_err) {
      handleError(err, 'Erro ao buscar lote');
      throw err;
    }
  };

  return {
    lotes,
    loading,
    error,
    lotesProximosVencimento,
    lotesVencidos,
    fetchLotes,
    criarLote,
    atualizarLote,
    consumirLote,
    buscarPorNumeroLote
  };
};

