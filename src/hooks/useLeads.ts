/**
 * Hook: useLeads
 * Gerenciamento de leads/prospectos para CRM
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Lead {
  id: string;
  empresa_id?: string;
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cargo?: string;
  especialidade?: string;
  origem: 'website' | 'indicacao' | 'evento' | 'cold_call' | 'linkedin' | 'outro';
  status?: 'ativo' | 'inativo' | 'arquivado';
  valor_estimado?: number;
  probabilidade?: number; // 0-100
  data_contato?: string;
  data_fechamento_prevista?: string;
  observacoes?: string;
  responsavel_id?: string;
  tags?: string[];
  estagio:
    | 'novo'
    | 'contato'
    | 'qualificado'
    | 'proposta'
    | 'negociacao'
    | 'ganho'
    | 'perdido'
    | 'desqualificado';
  created_at: string;
  updated_at: string;
}

interface LeadsState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
}

export function useLeads() {
  const { empresaAtual } = useAuth();
  const [state, setState] = useState<LeadsState>({
    leads: [],
    loading: true,
    error: null,
  });

  const fetchLeads = useCallback(async () => {
    if (!empresaAtual?.id) {
      setState(prev => ({ ...prev, leads: [], loading: false, error: null }));
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('empresa_id', empresaAtual.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState({
        leads: (data || []).map((lead) => ({
          ...lead,
          estagio:
            lead.estagio && [
              'novo',
              'contato',
              'qualificado',
              'proposta',
              'negociacao',
              'ganho',
              'perdido',
              'desqualificado',
            ].includes(lead.estagio)
              ? lead.estagio
              : 'desqualificado',
        })),
        loading: false,
        error: null,
      });
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar leads',
      }));
    }
  }, [empresaAtual?.id]);

  const getLeadById = useCallback(async (id: string): Promise<Lead | null> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        estagio:
          data.estagio && [
            'novo',
            'contato',
            'qualificado',
            'proposta',
            'negociacao',
            'ganho',
            'perdido',
            'desqualificado',
          ].includes(data.estagio)
            ? data.estagio
            : 'desqualificado',
      };
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar lead:', err);
      return null;
    }
  }, []);

  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'empresa_id'>): Promise<Lead | null> => {
    if (!empresaAtual?.id) {
      throw new Error('Empresa não definida para criação de lead');
    }
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...lead, empresa_id: empresaAtual.id }])
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return null;
      }

      const leadNormalizado: Lead = {
        ...data,
        estagio:
          data.estagio && [
            'novo',
            'contato',
            'qualificado',
            'proposta',
            'negociacao',
            'ganho',
            'perdido',
            'desqualificado',
          ].includes(data.estagio)
            ? data.estagio
            : 'desqualificado',
      };

      // Atualizar lista local
      setState(prev => ({
        ...prev,
        leads: [leadNormalizado, ...prev.leads],
      }));

      return leadNormalizado;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar lead',
      }));
      return null;
    }
  }, [empresaAtual?.id]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>): Promise<Lead | null> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return null;
      }

      const leadNormalizado: Lead = {
        ...data,
        estagio:
          data.estagio && [
            'novo',
            'contato',
            'qualificado',
            'proposta',
            'negociacao',
            'ganho',
            'perdido',
            'desqualificado',
          ].includes(data.estagio)
            ? data.estagio
            : 'desqualificado',
      };

      // Atualizar lista local
      setState(prev => ({
        ...prev,
        leads: prev.leads.map(l => l.id === id ? leadNormalizado : l),
      }));

      return leadNormalizado;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar lead',
      }));
      return null;
    }
  }, []);

  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualizar lista local
      setState(prev => ({
        ...prev,
        leads: prev.leads.filter(l => l.id !== id),
      }));

      return true;
    } catch (error) {
   const err = error as Error;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar lead',
      }));
      return false;
    }
  }, []);

  const getLeadsByStatus = useCallback(async (status: Lead['status']) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', status)
        .eq('empresa_id', empresaAtual?.id ?? null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data || []) as Lead[]).map((lead) => ({
        ...lead,
        estagio:
          lead.estagio && [
            'novo',
            'contato',
            'qualificado',
            'proposta',
            'negociacao',
            'ganho',
            'perdido',
            'desqualificado',
          ].includes(lead.estagio)
            ? lead.estagio
            : 'desqualificado',
      }));
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar leads por status:', err);
      return [];
    }
  }, [empresaAtual?.id]);

  const getLeadsByOrigem = useCallback(async (origem: Lead['origem']) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('origem', origem)
        .eq('empresa_id', empresaAtual?.id ?? null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data || []) as Lead[]).map((lead) => ({
        ...lead,
        estagio:
          lead.estagio && [
            'novo',
            'contato',
            'qualificado',
            'proposta',
            'negociacao',
            'ganho',
            'perdido',
            'desqualificado',
          ].includes(lead.estagio)
            ? lead.estagio
            : 'desqualificado',
      }));
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar leads por origem:', err);
      return [];
    }
  }, [empresaAtual?.id]);

  const countByStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('status, valor_estimado')
        .eq('empresa_id', empresaAtual?.id ?? null);

      if (error) throw error;

      const counts = data.reduce((acc, lead) => {
        if (!acc[lead.status]) {
          acc[lead.status] = { count: 0, valor: 0 };
        }
        acc[lead.status].count += 1;
        acc[lead.status].valor += lead.valor_estimado || 0;
        return acc;
      }, {} as Record<string, { count: number; valor: number }>);

      return counts;
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao contar leads:', err);
      return {};
    }
  }, [empresaAtual?.id]);

  const getFunil = useCallback(async () => {
    const stats = await countByStatus();
    
    const funil = [
      { stage: 'Novo', ...stats.novo },
      { stage: 'Contato', ...stats.contato },
      { stage: 'Qualificado', ...stats.qualificado },
      { stage: 'Proposta', ...stats.proposta },
      { stage: 'Negociação', ...stats.negociacao },
      { stage: 'Ganho', ...stats.ganho },
    ];

    return funil;
  }, [countByStatus]);

  const getTaxaConversao = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('status')
        .eq('empresa_id', empresaAtual?.id ?? null);

      if (error) throw error;

      const total = data.length;
      const ganhos = data.filter(l => l.status === 'ganho').length;
      const perdidos = data.filter(l => l.status === 'perdido').length;
      const emAndamento = total - ganhos - perdidos;

      return {
        total,
        ganhos,
        perdidos,
        emAndamento,
        taxaConversao: total > 0 ? (ganhos / total) * 100 : 0,
      };
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao calcular taxa de conversão:', err);
      return { total: 0, ganhos: 0, perdidos: 0, emAndamento: 0, taxaConversao: 0 };
    }
  }, [empresaAtual?.id]);

  // Realtime subscription
  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('leads_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        console.log('Lead change received!', payload);
        fetchLeads(); // Re-fetch on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  return {
    ...state,
    fetchLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    getLeadsByStatus,
    getLeadsByOrigem,
    countByStatus,
    getFunil,
    getTaxaConversao,
  };
}

