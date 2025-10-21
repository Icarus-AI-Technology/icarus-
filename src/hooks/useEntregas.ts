/**
 * Hook: useEntregas
 * Gerenciamento de entregas e logística com Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Entrega {
  id: string;
  codigo_rastreio: string;
  origem_tipo?: 'deposito' | 'fornecedor' | 'hospital';
  origem_id?: string;
  origem_nome: string;
  origem_endereco: string;
  origem_cidade?: string;
  origem_estado?: string;
  origem_cep?: string;
  destino_tipo?: 'hospital' | 'medico' | 'clinica' | 'deposito';
  destino_id?: string;
  destino_nome: string;
  destino_endereco: string;
  destino_cidade?: string;
  destino_estado?: string;
  destino_cep?: string;
  status:
    | 'pendente'
    | 'coletado'
    | 'em_transito'
    | 'saiu_entrega'
    | 'entregue'
    | 'devolvido'
    | 'cancelado';
  data_coleta?: string;
  data_previsao?: string;
  data_entrega?: string;
  transportadora?: string;
  tipo_entrega?: 'normal' | 'expressa' | 'urgente';
  valor_frete?: number;
  pedido_id?: string;
  cirurgia_id?: string;
  peso_kg?: number;
  volumes?: number;
  nota_fiscal?: string;
  observacoes?: string;
  ocorrencias?: string;
  motorista?: string;
  veiculo_placa?: string;
  telefone_contato?: string;
  assinado_por?: string;
  assinado_em?: string;
  documento_assinante?: string;
  created_at: string;
  updated_at: string;
}

export interface EntregaHistorico {
  id: string;
  entrega_id: string;
  status: string;
  localizacao?: string;
  cidade?: string;
  estado?: string;
  observacao?: string;
  created_at: string;
}

interface EntregasState {
  entregas: Entrega[];
  loading: boolean;
  error: string | null;
}

export function useEntregas() {
  const [state, setState] = useState<EntregasState>({
    entregas: [],
    loading: true,
    error: null,
  });

  const fetchEntregas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState({
        entregas: data || [],
        loading: false,
        error: null,
      });
    } catch (_error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar entregas',
      }));
    }
  }, []);

  const getEntregaById = useCallback(async (id: string): Promise<Entrega | null> => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (_error) {
      console.error('Erro ao buscar entrega:', error);
      return null;
    }
  }, []);

  const getEntregaByCodigo = useCallback(async (codigo: string): Promise<Entrega | null> => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('codigo_rastreio', codigo)
        .single();

      if (error) throw error;
      return data;
    } catch (_error) {
      console.error('Erro ao buscar entrega por código:', error);
      return null;
    }
  }, []);

  const createEntrega = useCallback(async (entrega: Omit<Entrega, 'id' | 'created_at' | 'updated_at'>): Promise<Entrega | null> => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .insert([entrega])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        entregas: [data, ...prev.entregas],
      }));

      return data;
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar entrega',
      }));
      return null;
    }
  }, []);

  const updateEntrega = useCallback(async (id: string, updates: Partial<Entrega>): Promise<Entrega | null> => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        entregas: prev.entregas.map(e => e.id === id ? data : e),
      }));

      return data;
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar entrega',
      }));
      return null;
    }
  }, []);

  const deleteEntrega = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('entregas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        entregas: prev.entregas.filter(e => e.id !== id),
      }));

      return true;
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar entrega',
      }));
      return false;
    }
  }, []);

  const getEntregasByStatus = useCallback(async (status: Entrega['status']) => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('status', status)
        .order('data_previsao', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (_error) {
      console.error('Erro ao buscar entregas por status:', error);
      return [];
    }
  }, []);

  const getEntregasAtrasadas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .in('status', ['pendente', 'coletado', 'em_transito', 'saiu_entrega'])
        .lt('data_previsao', new Date().toISOString().split('T')[0])
        .order('data_previsao', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (_error) {
      console.error('Erro ao buscar entregas atrasadas:', error);
      return [];
    }
  }, []);

  const getHistoricoEntrega = useCallback(async (entregaId: string): Promise<EntregaHistorico[]> => {
    try {
      const { data, error } = await supabase
        .from('entrega_historico')
        .select('*')
        .eq('entrega_id', entregaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (_error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }, []);

  const addHistorico = useCallback(async (entregaId: string, historico: Omit<EntregaHistorico, 'id' | 'entrega_id' | 'created_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('entrega_historico')
        .insert([{ ...historico, entrega_id: entregaId }]);

      if (error) throw error;
      return true;
    } catch (_error) {
      console.error('Erro ao adicionar histórico:', error);
      return false;
    }
  }, []);

  const confirmarEntrega = useCallback(async (id: string, assinatura: { nome: string; documento: string }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('entregas')
        .update({
          status: 'entregue',
          data_entrega: new Date().toISOString(),
          assinado_por: assinatura.nome,
          documento_assinante: assinatura.documento,
          assinado_em: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchEntregas();
      return true;
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao confirmar entrega',
      }));
      return false;
    }
  }, [fetchEntregas]);

  const getEstatisticas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('status, data_previsao');

      if (error) throw error;

      const total = data.length;
      const hoje = new Date().toISOString().split('T')[0];
      
      const pendentes = data.filter(e => ['pendente', 'coletado'].includes(e.status)).length;
      const emTransito = data.filter(e => ['em_transito', 'saiu_entrega'].includes(e.status)).length;
      const entregues = data.filter(e => e.status === 'entregue').length;
      const atrasadas = data.filter(e => 
        ['pendente', 'coletado', 'em_transito', 'saiu_entrega'].includes(e.status) && 
        e.data_previsao && e.data_previsao < hoje
      ).length;

      const taxaEntrega = total > 0 ? (entregues / total) * 100 : 0;

      return {
        total,
        pendentes,
        emTransito,
        entregues,
        atrasadas,
        taxaEntrega,
      };
    } catch (_error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total: 0,
        pendentes: 0,
        emTransito: 0,
        entregues: 0,
        atrasadas: 0,
        taxaEntrega: 0,
      };
    }
  }, []);

  const countByStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('status');

      if (error) throw error;

      const counts = data.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return counts;
    } catch (_error) {
      console.error('Erro ao contar entregas:', error);
      return {};
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchEntregas();

    const channel = supabase
      .channel('entregas_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entregas' }, (payload) => {
        console.log('Entrega change received!', payload);
        fetchEntregas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEntregas]);

  return {
    ...state,
    fetchEntregas,
    getEntregaById,
    getEntregaByCodigo,
    createEntrega,
    updateEntrega,
    deleteEntrega,
    getEntregasByStatus,
    getEntregasAtrasadas,
    getHistoricoEntrega,
    addHistorico,
    confirmarEntrega,
    getEstatisticas,
    countByStatus,
  };
}

