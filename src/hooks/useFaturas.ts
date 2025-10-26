/**
 * Hook: useFaturas
 * Gerenciamento de faturas e NF-e com Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Fatura {
  id: string;
  numero_nfe: string;
  serie: string;
  tipo: 'nfe' | 'nfse' | 'cte' | 'mdfe';
  cliente_tipo?: 'medico' | 'hospital' | 'outro';
  cliente_id?: string;
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  data_emissao: string;
  data_vencimento?: string;
  data_pagamento?: string;
  valor_produtos: number;
  valor_desconto?: number;
  valor_frete?: number;
  valor_impostos?: number;
  valor_total: number;
  status: 'rascunho' | 'pendente' | 'emitida' | 'autorizada' | 'cancelada' | 'paga';
  status_sefaz?: string;
  chave_acesso?: string;
  protocolo_autorizacao?: string;
  natureza_operacao?: string;
  cfop?: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface FaturasState {
  faturas: Fatura[];
  loading: boolean;
  error: string | null;
}

export function useFaturas() {
  const [state, setState] = useState<FaturasState>({
    faturas: [],
    loading: true,
    error: null,
  });

  const fetchFaturas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .order('data_emissao', { ascending: false });

      if (error) throw error;

      setState({
        faturas: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar faturas',
      }));
    }
  }, []);

  const getFaturaById = useCallback(async (id: string): Promise<Fatura | null> => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar fatura:', err);
      return null;
    }
  }, []);

  const createFatura = useCallback(async (fatura: Omit<Fatura, 'id' | 'created_at' | 'updated_at'>): Promise<Fatura | null> => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .insert([fatura])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        faturas: [data, ...prev.faturas],
      }));

      return data;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar fatura',
      }));
      return null;
    }
  }, []);

  const updateFatura = useCallback(async (id: string, updates: Partial<Fatura>): Promise<Fatura | null> => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        faturas: prev.faturas.map(f => f.id === id ? data : f),
      }));

      return data;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar fatura',
      }));
      return null;
    }
  }, []);

  const deleteFatura = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        faturas: prev.faturas.filter(f => f.id !== id),
      }));

      return true;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar fatura',
      }));
      return false;
    }
  }, []);

  const getFaturasByStatus = useCallback(async (status: Fatura['status']) => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .eq('status', status)
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar faturas por status:', err);
      return [];
    }
  }, []);

  const getFaturasByPeriodo = useCallback(async (dataInicio: string, dataFim: string) => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .gte('data_emissao', dataInicio)
        .lte('data_emissao', dataFim)
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar faturas por período:', err);
      return [];
    }
  }, []);

  const emitirFatura = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('faturas')
        .update({
          status: 'emitida',
          data_emissao: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchFaturas();
      return true;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao emitir fatura',
      }));
      return false;
    }
  }, [fetchFaturas]);

  const cancelarFatura = useCallback(async (id: string, motivo: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('faturas')
        .update({
          status: 'cancelada',
          motivo_cancelamento: motivo,
          data_cancelamento: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchFaturas();
      return true;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao cancelar fatura',
      }));
      return false;
    }
  }, [fetchFaturas]);

  const getResumoFaturas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('status, valor_total');

      if (error) throw error;

      const totalFaturas = data.length;
      const valorTotal = data.reduce((sum, f) => sum + f.valor_total, 0);
      
      const emitidas = data.filter(f => ['emitida', 'autorizada'].includes(f.status)).length;
      const pagas = data.filter(f => f.status === 'paga').length;
      const pendentes = data.filter(f => f.status === 'pendente').length;
      const canceladas = data.filter(f => f.status === 'cancelada').length;

      return {
        totalFaturas,
        valorTotal,
        emitidas,
        pagas,
        pendentes,
        canceladas,
        taxaPagamento: totalFaturas > 0 ? (pagas / totalFaturas) * 100 : 0,
      };
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao calcular resumo de faturas:', err);
      return {
        totalFaturas: 0,
        valorTotal: 0,
        emitidas: 0,
        pagas: 0,
        pendentes: 0,
        canceladas: 0,
        taxaPagamento: 0,
      };
    }
  }, []);

  const countByStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('status');

      if (error) throw error;

      const counts = data.reduce((acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return counts;
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao contar faturas:', err);
      return {};
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchFaturas();

    const channel = supabase
      .channel('faturas_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faturas' }, (payload) => {
        console.log('Fatura change received!', payload);
        fetchFaturas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFaturas]);

  return {
    ...state,
    fetchFaturas,
    getFaturaById,
    createFatura,
    updateFatura,
    deleteFatura,
    getFaturasByStatus,
    getFaturasByPeriodo,
    emitirFatura,
    cancelarFatura,
    getResumoFaturas,
    countByStatus,
  };
}

