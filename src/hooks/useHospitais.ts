/**
 * Hook: useHospitais
 * Gerenciamento de hospitais com Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types.generated';

type HospitalRow = Database['public']['Tables']['hospitais']['Row'];
type HospitalInsert = Database['public']['Tables']['hospitais']['Insert'];

export interface Hospital {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  tipo: 'publico' | 'privado' | 'filantrópico';
  status: 'ativo' | 'inativo';
  contato_principal: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface HospitaisState {
  hospitais: Hospital[];
  loading: boolean;
  error: string | null;
}

const toHospital = (row: HospitalRow): Hospital => ({
  id: row.id,
  nome: row.nome,
  cnpj: row.cnpj,
  endereco: row.endereco,
  cidade: row.cidade,
  estado: row.estado,
  cep: row.cep ?? '',
  telefone: row.telefone,
  email: row.email,
  tipo: (row.tipo ?? 'publico') as Hospital['tipo'],
  status: (row.status ?? 'ativo') as Hospital['status'],
  contato_principal: row.contato_principal ?? '',
  observacoes: row.observacoes ?? '',
  created_at: row.created_at ?? row.criado_em ?? new Date().toISOString(),
  updated_at: row.updated_at ?? row.atualizado_em ?? new Date().toISOString(),
});

const mapHospitalToUpdatePayload = (hospital: Partial<Hospital>): Partial<HospitalInsert> => {
  const payload: Partial<HospitalInsert> = {};
  if (hospital.nome !== undefined) payload.nome = hospital.nome;
  if (hospital.cnpj !== undefined) payload.cnpj = hospital.cnpj;
  if (hospital.endereco !== undefined) payload.endereco = hospital.endereco;
  if (hospital.cidade !== undefined) payload.cidade = hospital.cidade;
  if (hospital.estado !== undefined) payload.estado = hospital.estado;
  if (hospital.cep !== undefined) payload.cep = hospital.cep;
  if (hospital.telefone !== undefined) payload.telefone = hospital.telefone;
  if (hospital.email !== undefined) payload.email = hospital.email;
  if (hospital.tipo !== undefined) payload.tipo = hospital.tipo;
  if (hospital.status !== undefined) payload.status = hospital.status;
  if (hospital.contato_principal !== undefined)
    payload.contato_principal = hospital.contato_principal;
  if (hospital.observacoes !== undefined) payload.observacoes = hospital.observacoes;
  return payload;
};

export function useHospitais() {
  const [state, setState] = useState<HospitaisState>({
    hospitais: [],
    loading: true,
    error: null,
  });

  const fetchHospitais = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('hospitais')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;

      setState({
        hospitais: ((data as HospitalRow[] | null) ?? []).map(toHospital),
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar hospitais',
      }));
    }
  }, []);

  const getHospitalById = useCallback(async (id: string): Promise<Hospital | null> => {
    try {
      const { data, error } = await supabase.from('hospitais').select('*').eq('id', id).single();

      if (error) throw error;
      return data ? toHospital(data as HospitalRow) : null;
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao buscar hospital:', err);
      return null;
    }
  }, []);

  const createHospital = useCallback(
    async (
      hospital: Omit<Hospital, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Hospital | null> => {
      try {
        const payload: HospitalInsert = {
          nome: hospital.nome,
          cnpj: hospital.cnpj,
          endereco: hospital.endereco,
          cidade: hospital.cidade,
          estado: hospital.estado,
          cep: hospital.cep,
          telefone: hospital.telefone,
          email: hospital.email,
          tipo: hospital.tipo,
          status: hospital.status,
          contato_principal: hospital.contato_principal,
          observacoes: hospital.observacoes ?? '',
        };

        const { data, error } = await supabase
          .from('hospitais')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          hospitais: data ? [...prev.hospitais, toHospital(data as HospitalRow)] : prev.hospitais,
        }));

        return data ? toHospital(data as HospitalRow) : null;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao criar hospital',
        }));
        return null;
      }
    },
    []
  );

  const updateHospital = useCallback(
    async (id: string, updates: Partial<Hospital>): Promise<Hospital | null> => {
      try {
        const payload = mapHospitalToUpdatePayload(updates);

        const { data, error } = await supabase
          .from('hospitais')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          hospitais: prev.hospitais.map((h) =>
            h.id === id && data ? toHospital(data as HospitalRow) : h
          ),
        }));

        return data ? toHospital(data as HospitalRow) : null;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao atualizar hospital',
        }));
        return null;
      }
    },
    []
  );

  const deleteHospital = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('hospitais').delete().eq('id', id);

      if (error) throw error;

      // Atualizar lista local
      setState((prev) => ({
        ...prev,
        hospitais: prev.hospitais.filter((h) => h.id !== id),
      }));

      return true;
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar hospital',
      }));
      return false;
    }
  }, []);

  const getHospitaisByTipo = useCallback(async (tipo: Hospital['tipo']) => {
    try {
      const { data, error } = await supabase
        .from('hospitais')
        .select('*')
        .eq('tipo', tipo)
        .order('nome', { ascending: true });

      if (error) throw error;
      return ((data as HospitalRow[] | null) ?? []).map(toHospital);
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao buscar hospitais por tipo:', err);
      return [];
    }
  }, []);

  const getHospitaisAtivos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('hospitais')
        .select('*')
        .eq('status', 'ativo')
        .order('nome', { ascending: true });

      if (error) throw error;
      return ((data as HospitalRow[] | null) ?? []).map(toHospital);
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao buscar hospitais ativos:', err);
      return [];
    }
  }, []);

  const countByTipo = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('hospitais').select('tipo');

      if (error) throw error;

      const rows = (data as Pick<HospitalRow, 'tipo'>[] | null) ?? [];

      const counts = rows.reduce(
        (acc, h) => {
          const tipo = (h.tipo as Hospital['tipo']) ?? 'publico';
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return counts;
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao contar hospitais:', err);
      return {};
    }
  }, []);

  useEffect(() => {
    fetchHospitais();
  }, [fetchHospitais]);

  return {
    ...state,
    fetchHospitais,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitaisByTipo,
    getHospitaisAtivos,
    countByTipo,
  };
}
