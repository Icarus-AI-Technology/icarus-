/**
 * Hook: useLeads
 * Gerenciamento de leads/prospectos para CRM
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/lib/database.types.generated';

type LeadRow = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadStatus = Database['public']['Enums']['lead_status_enum'];
type LeadOrigem = Database['public']['Enums']['lead_origem_enum'];

export interface Lead {
  id: string;
  empresa_id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cargo?: string;
  especialidade?: string;
  origem?: LeadOrigem;
  status?: LeadStatus;
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

const VALID_ESTAGIOS: Lead['estagio'][] = [
  'novo',
  'contato',
  'qualificado',
  'proposta',
  'negociacao',
  'ganho',
  'perdido',
  'desqualificado',
];

const normalizeEstagio = (value: string | null): Lead['estagio'] =>
  value && VALID_ESTAGIOS.includes(value as Lead['estagio'])
    ? (value as Lead['estagio'])
    : 'desqualificado';

const normalizeLead = (row: LeadRow): Lead => ({
  id: row.id,
  empresa_id: row.empresa_id,
  nome: row.nome,
  email: row.email ?? '',
  telefone: row.telefone ?? '',
  empresa: row.empresa ?? row.empresa_origem ?? '',
  cargo: row.cargo ?? '',
  especialidade: row.especialidade ?? '',
  origem: (row.origem ?? 'website') as LeadOrigem,
  status: (row.status ?? 'ativo') as LeadStatus,
  valor_estimado: row.valor_estimado ?? 0,
  probabilidade: row.probabilidade ?? 0,
  data_contato: row.data_contato ?? undefined,
  data_fechamento_prevista: row.data_fechamento_prevista ?? undefined,
  observacoes: row.observacoes ?? '',
  responsavel_id: row.responsavel_id ?? undefined,
  tags: row.tags ?? [],
  estagio: normalizeEstagio(row.estagio),
  created_at: row.created_at ?? row.criado_em ?? new Date().toISOString(),
  updated_at: row.updated_at ?? row.atualizado_em ?? new Date().toISOString(),
});

const buildLeadInsert = (
  lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'> & { empresa_id: string }
): LeadInsert => ({
  empresa_id: lead.empresa_id,
  nome: lead.nome,
  email: lead.email,
  telefone: lead.telefone,
  empresa: lead.empresa ?? '',
  empresa_origem: lead.empresa ?? '',
  cargo: lead.cargo ?? '',
  especialidade: lead.especialidade ?? '',
  origem: lead.origem ?? 'website',
  status: lead.status ?? 'ativo',
  valor_estimado: lead.valor_estimado ?? 0,
  probabilidade: lead.probabilidade ?? 0,
  data_contato: lead.data_contato ?? null,
  data_fechamento_prevista: lead.data_fechamento_prevista ?? null,
  observacoes: lead.observacoes ?? '',
  responsavel_id: lead.responsavel_id ?? null,
  tags: lead.tags ?? [],
  estagio: lead.estagio ?? 'novo',
});

const buildLeadUpdatePayload = (updates: Partial<Lead>): Partial<LeadInsert> => {
  const payload: Partial<LeadInsert> = {};
  if (updates.nome !== undefined) payload.nome = updates.nome;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.telefone !== undefined) payload.telefone = updates.telefone;
  if (updates.empresa !== undefined) {
    payload.empresa = updates.empresa;
    payload.empresa_origem = updates.empresa;
  }
  if (updates.cargo !== undefined) payload.cargo = updates.cargo;
  if (updates.especialidade !== undefined) payload.especialidade = updates.especialidade;
  if (updates.origem !== undefined) payload.origem = updates.origem;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.valor_estimado !== undefined) payload.valor_estimado = updates.valor_estimado;
  if (updates.probabilidade !== undefined) payload.probabilidade = updates.probabilidade;
  if (updates.data_contato !== undefined) payload.data_contato = updates.data_contato ?? null;
  if (updates.data_fechamento_prevista !== undefined)
    payload.data_fechamento_prevista = updates.data_fechamento_prevista ?? null;
  if (updates.observacoes !== undefined) payload.observacoes = updates.observacoes ?? '';
  if (updates.responsavel_id !== undefined) payload.responsavel_id = updates.responsavel_id ?? null;
  if (updates.tags !== undefined) payload.tags = updates.tags ?? [];
  if (updates.estagio !== undefined) payload.estagio = updates.estagio;
  if (updates.empresa_id !== undefined) payload.empresa_id = updates.empresa_id;
  return payload;
};

export function useLeads() {
  const { empresaAtual } = useAuth();
  const [state, setState] = useState<LeadsState>({
    leads: [],
    loading: true,
    error: null,
  });

  const fetchLeads = useCallback(async () => {
    if (!empresaAtual?.id) {
      setState((prev) => ({ ...prev, leads: [], loading: false, error: null }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('empresa_id', empresaAtual.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data as LeadRow[] | null) ?? [];

      setState({
        leads: rows.map(normalizeLead),
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar leads',
      }));
    }
  }, [empresaAtual?.id]);

  const getLeadById = useCallback(async (id: string): Promise<Lead | null> => {
    try {
      const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();

      if (error) throw error;
      if (!data) return null;
      return normalizeLead(data as LeadRow);
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao buscar lead:', err);
      return null;
    }
  }, []);

  const createLead = useCallback(
    async (
      lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'empresa_id'>
    ): Promise<Lead | null> => {
      if (!empresaAtual?.id) {
        throw new Error('Empresa não definida para criação de lead');
      }
      try {
        const payload = buildLeadInsert({
          ...lead,
          empresa_id: empresaAtual.id,
        });

        const { data, error } = await supabase.from('leads').insert([payload]).select().single();

        if (error) throw error;

        if (!data) {
          return null;
        }

        const leadNormalizado = normalizeLead(data as LeadRow);

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          leads: [leadNormalizado, ...prev.leads],
        }));

        return leadNormalizado;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao criar lead',
        }));
        return null;
      }
    },
    [empresaAtual?.id]
  );

  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>): Promise<Lead | null> => {
      try {
        const payload = buildLeadUpdatePayload(updates);

        const { data, error } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        if (!data) {
          return null;
        }

        const leadNormalizado = normalizeLead(data as LeadRow);

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          leads: prev.leads.map((l) => (l.id === id ? leadNormalizado : l)),
        }));

        return leadNormalizado;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao atualizar lead',
        }));
        return null;
      }
    },
    []
  );

  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);

      if (error) throw error;

      // Atualizar lista local
      setState((prev) => ({
        ...prev,
        leads: prev.leads.filter((l) => l.id !== id),
      }));

      return true;
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar lead',
      }));
      return false;
    }
  }, []);

  const getLeadsByStatus = useCallback(
    async (status: LeadStatus) => {
      if (!empresaAtual?.id) return [];
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('status', status)
          .eq('empresa_id', empresaAtual.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return ((data as LeadRow[] | null) ?? []).map(normalizeLead);
      } catch (error) {
        const err = error as Error;
        console.error('Erro ao buscar leads por status:', err);
        return [];
      }
    },
    [empresaAtual?.id]
  );

  const getLeadsByOrigem = useCallback(
    async (origem: LeadOrigem) => {
      if (!empresaAtual?.id) return [];
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('origem', origem)
          .eq('empresa_id', empresaAtual.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return ((data as LeadRow[] | null) ?? []).map(normalizeLead);
      } catch (error) {
        const err = error as Error;
        console.error('Erro ao buscar leads por origem:', err);
        return [];
      }
    },
    [empresaAtual?.id]
  );

  const countByStatus = useCallback(async () => {
    if (!empresaAtual?.id) return {};
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('estagio, valor_estimado')
        .eq('empresa_id', empresaAtual.id);

      if (error) throw error;

      const rows = (data as Pick<LeadRow, 'estagio' | 'valor_estimado'>[] | null) ?? [];

      const counts = rows.reduce(
        (acc, lead) => {
          const estagio = normalizeEstagio(lead.estagio);
          if (!acc[estagio]) {
            acc[estagio] = { count: 0, valor: 0 };
          }
          acc[estagio].count += 1;
          acc[estagio].valor += lead.valor_estimado ?? 0;
          return acc;
        },
        {} as Record<string, { count: number; valor: number }>
      );

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
      { stage: 'Novo', ...(stats.novo ?? { count: 0, valor: 0 }) },
      { stage: 'Contato', ...(stats.contato ?? { count: 0, valor: 0 }) },
      { stage: 'Qualificado', ...(stats.qualificado ?? { count: 0, valor: 0 }) },
      { stage: 'Proposta', ...(stats.proposta ?? { count: 0, valor: 0 }) },
      { stage: 'Negociação', ...(stats.negociacao ?? { count: 0, valor: 0 }) },
      { stage: 'Ganho', ...(stats.ganho ?? { count: 0, valor: 0 }) },
    ];

    return funil;
  }, [countByStatus]);

  const getTaxaConversao = useCallback(async () => {
    if (!empresaAtual?.id) {
      return { total: 0, ganhos: 0, perdidos: 0, emAndamento: 0, taxaConversao: 0 };
    }
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('estagio')
        .eq('empresa_id', empresaAtual.id);

      if (error) throw error;

      const rows = (data as Pick<LeadRow, 'estagio'>[] | null) ?? [];

      const total = rows.length;
      const ganhos = rows.filter((l) => normalizeEstagio(l.estagio) === 'ganho').length;
      const perdidos = rows.filter((l) => normalizeEstagio(l.estagio) === 'perdido').length;
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
