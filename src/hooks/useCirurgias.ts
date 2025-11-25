/**
 * Hook: useCirurgias
 * CRUD completo de cirurgias e procedimentos
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Cirurgia {
  id: string;
  medico_id?: string;
  hospital_id?: string;
  paciente_nome: string;
  procedimento: string;
  tipo_procedimento?: string; // Alias para 'procedimento' (compatibilidade)
  numero_cirurgia?: string;
  especialidade?: string;
  data_cirurgia: string;
  hora_cirurgia: string;
  hora_inicio?: string; // Hora de início da cirurgia (compatibilidade)
  sala?: string;
  status:
    | 'agendada'
    | 'confirmada'
    | 'preparacao'
    | 'andamento'
    | 'recuperacao'
    | 'concluida'
    | 'cancelada';
  urgencia?: 'eletiva' | 'urgente' | 'emergencia';
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
  observacoes?: string;
  valor_estimado?: number;
  paciente_idade?: number;
  comorbidades?: string[];
  created_at?: string;
  updated_at?: string;
  // Relations
  medico?: {
    nome: string;
    crm: string;
    especialidade: string;
  };
  hospital?: {
    nome: string;
  };
}

export function useCirurgias() {
  const [cirurgias, setCirurgias] = useState<Cirurgia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCirurgias();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('cirurgias_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cirurgias',
        },
        (payload) => {
          console.log('Cirurgia changed:', payload);
          fetchCirurgias(); // Recarregar lista
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCirurgias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cirurgias')
        .select(
          `
          *,
          medico:medicos(nome, crm, especialidade),
          hospital:hospitais(nome)
        `
        )
        .order('data_cirurgia', { ascending: true });

      if (error) throw error;
      setCirurgias(data || []);
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao carregar cirurgias');
    } finally {
      setLoading(false);
    }
  };

  const getCirurgiaById = async (id: string): Promise<Cirurgia | null> => {
    try {
      const { data, error } = await supabase
        .from('cirurgias')
        .select(
          `
          *,
          medico:medicos(nome, crm, especialidade),
          hospital:hospitais(nome)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao buscar cirurgia');
      return null;
    }
  };

  const createCirurgia = async (
    cirurgia: Omit<Cirurgia, 'id' | 'created_at' | 'updated_at' | 'medico' | 'hospital'>
  ) => {
    try {
      const { data, error } = await supabase.from('cirurgias').insert([cirurgia]).select().single();

      if (error) throw error;

      setCirurgias((prev) => [...prev, data]);
      return data;
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao criar cirurgia');
      throw err;
    }
  };

  const updateCirurgia = async (id: string, updates: Partial<Cirurgia>) => {
    try {
      const { data, error } = await supabase
        .from('cirurgias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCirurgias((prev) => prev.map((c) => (c.id === id ? data : c)));
      return data;
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cirurgia');
      throw err;
    }
  };

  const deleteCirurgia = async (id: string) => {
    try {
      const { error } = await supabase.from('cirurgias').delete().eq('id', id);

      if (error) throw error;

      setCirurgias((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao deletar cirurgia');
      throw err;
    }
  };

  const getCirurgiasByStatus = (status: Cirurgia['status']) => {
    return cirurgias.filter((c) => c.status === status);
  };

  const getCirurgiasHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return cirurgias.filter((c) => c.data_cirurgia === hoje);
  };

  const countByStatus = () => {
    const counts: Record<string, number> = {};
    cirurgias.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  };

  return {
    cirurgias,
    loading,
    error,
    fetchCirurgias,
    getCirurgiaById,
    createCirurgia,
    updateCirurgia,
    deleteCirurgia,
    getCirurgiasByStatus,
    getCirurgiasHoje,
    countByStatus,
  };
}
