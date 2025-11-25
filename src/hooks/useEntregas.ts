/**
 * Hook: useEntregas
 * Gerenciamento de entregas e logística com Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types.generated';

type EntregaRow = Database['public']['Tables']['entregas']['Row'];
type EntregaInsert = Database['public']['Tables']['entregas']['Insert'];
type EntregaUpdate = Database['public']['Tables']['entregas']['Update'];
type EntregaStatus = Database['public']['Enums']['entrega_status_enum'];
type EntregaOrigemTipo = Database['public']['Enums']['entrega_origem_tipo_enum'];
type EntregaDestinoTipo = Database['public']['Enums']['entrega_destino_tipo_enum'];
type EntregaModalidade = Database['public']['Enums']['entrega_modalidade_enum'];

type EntregaHistoricoRow = Database['public']['Tables']['entrega_historico']['Row'];
type EntregaHistoricoInsert = Database['public']['Tables']['entrega_historico']['Insert'];

const DEFAULT_CREATED_AT = () => new Date().toISOString();

export interface Entrega {
  id: string;
  codigo_rastreio: string;
  origem_tipo?: EntregaOrigemTipo;
  origem_id?: string | null;
  origem_nome: string;
  origem_endereco: string;
  origem_cidade?: string;
  origem_estado?: string;
  origem_cep?: string;
  destino_tipo?: EntregaDestinoTipo;
  destino_id?: string | null;
  destino_nome: string;
  destino_endereco: string;
  destino_cidade?: string;
  destino_estado?: string;
  destino_cep?: string;
  status: EntregaStatus;
  data_coleta?: string | null;
  data_previsao?: string | null;
  data_entrega?: string | null;
  transportadora?: string | null;
  tipo_entrega?: EntregaModalidade;
  valor_frete?: number;
  pedido_id?: string | null;
  cirurgia_id?: string | null;
  peso_kg?: number;
  volumes?: number;
  nota_fiscal?: string | null;
  observacoes?: string;
  ocorrencias?: string;
  motorista?: string;
  veiculo_placa?: string;
  telefone_contato?: string;
  assinado_por?: string | null;
  assinado_em?: string | null;
  documento_assinante?: string | null;
  empresa_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EntregaHistorico {
  id: string;
  entrega_id: string;
  status: EntregaStatus;
  localizacao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacao?: string | null;
  created_at: string;
}

interface EntregasState {
  entregas: Entrega[];
  loading: boolean;
  error: string | null;
}

const normalizeStatus = (status: EntregaStatus | string | null): EntregaStatus => {
  const value = (status ?? 'pendente').toString().toLowerCase();
  const allowed: EntregaStatus[] = [
    'pendente',
    'coletado',
    'em_transito',
    'saiu_entrega',
    'entregue',
    'devolvido',
    'cancelado',
  ];
  return (allowed.includes(value as EntregaStatus) ? value : 'pendente') as EntregaStatus;
};

const normalizeOrigem = (tipo: EntregaOrigemTipo | string | null): EntregaOrigemTipo => {
  const mapping: Record<string, EntregaOrigemTipo> = {
    fornecedor: 'fornecedor',
    hospital: 'hospital',
    deposito: 'deposito',
  };
  return mapping[(tipo ?? 'deposito').toString().toLowerCase()] ?? 'deposito';
};

const normalizeDestino = (tipo: EntregaDestinoTipo | string | null): EntregaDestinoTipo => {
  const mapping: Record<string, EntregaDestinoTipo> = {
    hospital: 'hospital',
    medico: 'medico',
    clinica: 'clinica',
    deposito: 'deposito',
  };
  return mapping[(tipo ?? 'hospital').toString().toLowerCase()] ?? 'hospital';
};

const normalizeModalidade = (tipo: EntregaModalidade | string | null): EntregaModalidade => {
  const mapping: Record<string, EntregaModalidade> = {
    normal: 'normal',
    expressa: 'expressa',
    urgente: 'urgente',
  };
  return mapping[(tipo ?? 'normal').toString().toLowerCase()] ?? 'normal';
};

const toEntrega = (row: EntregaRow): Entrega => ({
  id: row.id,
  codigo_rastreio: row.codigo_rastreio,
  origem_tipo: normalizeOrigem(row.origem_tipo),
  origem_id: row.origem_id,
  origem_nome: row.origem_nome,
  origem_endereco: row.origem_endereco,
  origem_cidade: row.origem_cidade ?? '',
  origem_estado: row.origem_estado ?? '',
  origem_cep: row.origem_cep ?? '',
  destino_tipo: normalizeDestino(row.destino_tipo),
  destino_id: row.destino_id,
  destino_nome: row.destino_nome,
  destino_endereco: row.destino_endereco,
  destino_cidade: row.destino_cidade ?? '',
  destino_estado: row.destino_estado ?? '',
  destino_cep: row.destino_cep ?? '',
  status: normalizeStatus(row.status),
  data_coleta: row.data_coleta,
  data_previsao: row.data_previsao,
  data_entrega: row.data_entrega,
  transportadora: row.transportadora,
  tipo_entrega: normalizeModalidade(row.tipo_entrega),
  valor_frete: row.valor_frete ?? 0,
  pedido_id: row.pedido_id,
  cirurgia_id: row.cirurgia_id,
  peso_kg: row.peso_kg ?? 0,
  volumes: row.volumes ?? 0,
  nota_fiscal: row.nota_fiscal,
  observacoes: row.observacoes ?? '',
  ocorrencias: row.ocorrencias ?? '',
  motorista: row.motorista ?? '',
  veiculo_placa: row.veiculo_placa ?? '',
  telefone_contato: row.telefone_contato ?? '',
  assinado_por: row.assinado_por,
  assinado_em: row.assinado_em,
  documento_assinante: row.documento_assinante,
  empresa_id: row.empresa_id,
  created_at: row.created_at ?? DEFAULT_CREATED_AT(),
  updated_at: row.updated_at ?? DEFAULT_CREATED_AT(),
});

const toHistorico = (row: EntregaHistoricoRow): EntregaHistorico => ({
  id: row.id,
  entrega_id: row.entrega_id ?? '',
  status: normalizeStatus(row.status),
  localizacao: row.localizacao,
  cidade: row.cidade,
  estado: row.estado,
  observacao: row.observacao,
  created_at: row.created_at ?? DEFAULT_CREATED_AT(),
});

const buildEntregaInsert = (
  entrega: Omit<Entrega, 'id' | 'created_at' | 'updated_at'>
): EntregaInsert => ({
  codigo_rastreio: entrega.codigo_rastreio,
  origem_nome: entrega.origem_nome,
  origem_endereco: entrega.origem_endereco,
  origem_cidade: entrega.origem_cidade ?? '',
  origem_estado: entrega.origem_estado ?? '',
  origem_cep: entrega.origem_cep ?? '',
  origem_id: entrega.origem_id ?? null,
  origem_tipo: entrega.origem_tipo ?? 'deposito',
  destino_nome: entrega.destino_nome,
  destino_endereco: entrega.destino_endereco,
  destino_cidade: entrega.destino_cidade ?? '',
  destino_estado: entrega.destino_estado ?? '',
  destino_cep: entrega.destino_cep ?? '',
  destino_id: entrega.destino_id ?? null,
  destino_tipo: entrega.destino_tipo ?? 'hospital',
  status: entrega.status ?? 'pendente',
  data_coleta: entrega.data_coleta ?? null,
  data_previsao: entrega.data_previsao ?? null,
  data_entrega: entrega.data_entrega ?? null,
  transportadora: entrega.transportadora ?? null,
  tipo_entrega: entrega.tipo_entrega ?? 'normal',
  valor_frete: entrega.valor_frete ?? 0,
  pedido_id: entrega.pedido_id ?? null,
  cirurgia_id: entrega.cirurgia_id ?? null,
  peso_kg: entrega.peso_kg ?? 0,
  volumes: entrega.volumes ?? 0,
  nota_fiscal: entrega.nota_fiscal ?? null,
  observacoes: entrega.observacoes ?? '',
  ocorrencias: entrega.ocorrencias ?? '',
  motorista: entrega.motorista ?? '',
  veiculo_placa: entrega.veiculo_placa ?? '',
  telefone_contato: entrega.telefone_contato ?? '',
  assinado_por: entrega.assinado_por ?? null,
  assinado_em: entrega.assinado_em ?? null,
  documento_assinante: entrega.documento_assinante ?? null,
  empresa_id: entrega.empresa_id ?? null,
});

const buildEntregaUpdate = (updates: Partial<Entrega>): EntregaUpdate => {
  const payload: EntregaUpdate = {};
  const setField = <K extends keyof EntregaUpdate>(
    key: K,
    value: EntregaUpdate[K] | null | undefined
  ) => {
    if (value !== undefined) {
      payload[key] = value as EntregaUpdate[K];
    }
  };

  setField('codigo_rastreio', updates.codigo_rastreio);
  setField('origem_nome', updates.origem_nome);
  setField('origem_endereco', updates.origem_endereco);
  setField('origem_cidade', updates.origem_cidade ?? null);
  setField('origem_estado', updates.origem_estado ?? null);
  setField('origem_cep', updates.origem_cep ?? null);
  setField('origem_id', updates.origem_id ?? null);
  setField('origem_tipo', updates.origem_tipo ?? null);
  setField('destino_nome', updates.destino_nome);
  setField('destino_endereco', updates.destino_endereco);
  setField('destino_cidade', updates.destino_cidade ?? null);
  setField('destino_estado', updates.destino_estado ?? null);
  setField('destino_cep', updates.destino_cep ?? null);
  setField('destino_id', updates.destino_id ?? null);
  setField('destino_tipo', updates.destino_tipo ?? null);
  setField('status', updates.status ?? null);
  setField('data_coleta', updates.data_coleta ?? null);
  setField('data_previsao', updates.data_previsao ?? null);
  setField('data_entrega', updates.data_entrega ?? null);
  setField('transportadora', updates.transportadora ?? null);
  setField('tipo_entrega', updates.tipo_entrega ?? null);
  setField('valor_frete', updates.valor_frete);
  setField('pedido_id', updates.pedido_id ?? null);
  setField('cirurgia_id', updates.cirurgia_id ?? null);
  setField('peso_kg', updates.peso_kg);
  setField('volumes', updates.volumes);
  setField('nota_fiscal', updates.nota_fiscal ?? null);
  setField('observacoes', updates.observacoes ?? null);
  setField('ocorrencias', updates.ocorrencias ?? null);
  setField('motorista', updates.motorista ?? null);
  setField('veiculo_placa', updates.veiculo_placa ?? null);
  setField('telefone_contato', updates.telefone_contato ?? null);
  setField('assinado_por', updates.assinado_por ?? null);
  setField('assinado_em', updates.assinado_em ?? null);
  setField('documento_assinante', updates.documento_assinante ?? null);
  setField('empresa_id', updates.empresa_id ?? null);

  return payload;
};

const buildHistoricoInsert = (
  entregaId: string,
  historico: Omit<EntregaHistorico, 'id' | 'entrega_id' | 'created_at'>
): EntregaHistoricoInsert => ({
  entrega_id: entregaId,
  status: historico.status ?? 'pendente',
  localizacao: historico.localizacao ?? null,
  cidade: historico.cidade ?? null,
  estado: historico.estado ?? null,
  observacao: historico.observacao ?? null,
});

export function useEntregas() {
  const [state, setState] = useState<EntregasState>({
    entregas: [],
    loading: true,
    error: null,
  });

  const handleError = useCallback((error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : fallback;
    setState((prev) => ({ ...prev, error: message, loading: false }));
  }, []);

  const fetchEntregas = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = (data as EntregaRow[] | null) ?? [];
      setState({ entregas: rows.map(toEntrega), loading: false, error: null });
    } catch (error) {
      handleError(error, 'Erro ao carregar entregas');
    }
  }, [handleError]);

  const getEntregaById = useCallback(async (id: string): Promise<Entrega | null> => {
    try {
      const { data, error } = await supabase.from('entregas').select('*').eq('id', id).single();

      if (error) throw error;
      return data ? toEntrega(data as EntregaRow) : null;
    } catch (error) {
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
      return data ? toEntrega(data as EntregaRow) : null;
    } catch (error) {
      console.error('Erro ao buscar entrega por código:', error);
      return null;
    }
  }, []);

  const createEntrega = useCallback(
    async (entrega: Omit<Entrega, 'id' | 'created_at' | 'updated_at'>): Promise<Entrega | null> => {
      try {
        const payload = buildEntregaInsert(entrega);
        const { data, error } = await supabase.from('entregas').insert([payload]).select().single();

        if (error) throw error;
        if (!data) return null;

        const novaEntrega = toEntrega(data as EntregaRow);
        setState((prev) => ({ ...prev, entregas: [novaEntrega, ...prev.entregas] }));
        return novaEntrega;
      } catch (error) {
        handleError(error, 'Erro ao criar entrega');
        return null;
      }
    },
    [handleError]
  );

  const updateEntrega = useCallback(
    async (id: string, updates: Partial<Entrega>) => {
      try {
        const payload = buildEntregaUpdate(updates);
        const { data, error } = await supabase
          .from('entregas')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!data) return null;

        const atualizada = toEntrega(data as EntregaRow);
        setState((prev) => ({
          ...prev,
          entregas: prev.entregas.map((entrega) => (entrega.id === id ? atualizada : entrega)),
        }));

        return atualizada;
      } catch (error) {
        handleError(error, 'Erro ao atualizar entrega');
        return null;
      }
    },
    [handleError]
  );

  const deleteEntrega = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('entregas').delete().eq('id', id);

        if (error) throw error;
        setState((prev) => ({
          ...prev,
          entregas: prev.entregas.filter((entrega) => entrega.id !== id),
        }));

        return true;
      } catch (error) {
        handleError(error, 'Erro ao deletar entrega');
        return false;
      }
    },
    [handleError]
  );

  const getEntregasByStatus = useCallback(async (status: EntregaStatus) => {
    try {
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('status', status)
        .order('data_previsao', { ascending: true });

      if (error) throw error;
      return ((data as EntregaRow[] | null) ?? []).map(toEntrega);
    } catch (error) {
      console.error('Erro ao buscar entregas por status:', error);
      return [];
    }
  }, []);

  const getEntregasAtrasadas = useCallback(async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .in('status', ['pendente', 'coletado', 'em_transito', 'saiu_entrega'])
        .lt('data_previsao', hoje)
        .order('data_previsao', { ascending: true });

      if (error) throw error;
      return ((data as EntregaRow[] | null) ?? []).map(toEntrega);
    } catch (error) {
      console.error('Erro ao buscar entregas atrasadas:', error);
      return [];
    }
  }, []);

  const getHistoricoEntrega = useCallback(async (entregaId: string) => {
    try {
      const { data, error } = await supabase
        .from('entrega_historico')
        .select('*')
        .eq('entrega_id', entregaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data as EntregaHistoricoRow[] | null) ?? []).map(toHistorico);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }, []);

  const addHistorico = useCallback(
    async (
      entregaId: string,
      historico: Omit<EntregaHistorico, 'id' | 'entrega_id' | 'created_at'>
    ) => {
      try {
        const payload = buildHistoricoInsert(entregaId, historico);
        const { error } = await supabase.from('entrega_historico').insert([payload]);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Erro ao adicionar histórico:', error);
        return false;
      }
    },
    []
  );

  const confirmarEntrega = useCallback(
    async (id: string, assinatura: { nome: string; documento: string }) => {
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
      } catch (error) {
        handleError(error, 'Erro ao confirmar entrega');
        return false;
      }
    },
    [fetchEntregas, handleError]
  );

  const getEstatisticas = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('entregas').select('status, data_previsao');

      if (error) throw error;

      const rows = (data as Pick<EntregaRow, 'status' | 'data_previsao'>[] | null) ?? [];
      const hoje = new Date().toISOString().split('T')[0];
      const total = rows.length;
      const pendentes = rows.filter((e) =>
        ['pendente', 'coletado'].includes(normalizeStatus(e.status))
      ).length;
      const emTransito = rows.filter((e) =>
        ['em_transito', 'saiu_entrega'].includes(normalizeStatus(e.status))
      ).length;
      const entregues = rows.filter((e) => normalizeStatus(e.status) === 'entregue').length;
      const atrasadas = rows.filter((e) => {
        const status = normalizeStatus(e.status);
        return (
          ['pendente', 'coletado', 'em_transito', 'saiu_entrega'].includes(status) &&
          e.data_previsao !== null &&
          e.data_previsao < hoje
        );
      }).length;

      const taxaEntrega = total > 0 ? (entregues / total) * 100 : 0;

      return { total, pendentes, emTransito, entregues, atrasadas, taxaEntrega };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return { total: 0, pendentes: 0, emTransito: 0, entregues: 0, atrasadas: 0, taxaEntrega: 0 };
    }
  }, []);

  const countByStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('entregas').select('status');

      if (error) throw error;

      const rows = (data as Pick<EntregaRow, 'status'>[] | null) ?? [];
      return rows.reduce(
        (acc, row) => {
          const status = normalizeStatus(row.status);
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<EntregaStatus, number>
      );
    } catch (error) {
      console.error('Erro ao contar entregas:', error);
      return {} as Record<EntregaStatus, number>;
    }
  }, []);

  useEffect(() => {
    fetchEntregas();

    const channel = supabase
      .channel('entregas_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entregas' }, () => {
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
