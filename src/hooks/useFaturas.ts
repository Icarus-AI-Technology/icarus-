/**
 * Hook: useFaturas
 * Gestão de notas fiscais/faturas (notas_fiscais)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types.generated';

type NotaFiscalRow = Database['public']['Tables']['notas_fiscais']['Row'];
type NotaFiscalInsert = Database['public']['Tables']['notas_fiscais']['Insert'];
type NotaFiscalUpdate = Database['public']['Tables']['notas_fiscais']['Update'];
type NotaStatus = Database['public']['Enums']['nota_status_app_enum'];
type NotaTipo = Database['public']['Enums']['nota_documento_tipo_enum'];
type NotaClienteTipo = Database['public']['Enums']['nota_cliente_tipo_enum'];

type Nullable<T> = T | null | undefined;

export interface Fatura {
  id: string;
  numero_nfe: string;
  serie: string;
  tipo: NotaTipo;
  cliente_tipo?: NotaClienteTipo;
  cliente_id?: string | null;
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  cliente_email?: string;
  cliente_telefone?: string;
  data_emissao: string;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  valor_produtos: number;
  valor_desconto?: number;
  valor_frete?: number;
  valor_impostos?: number;
  valor_total: number;
  status: NotaStatus;
  status_sefaz?: string | null;
  chave_acesso?: string | null;
  protocolo_autorizacao?: string | null;
  natureza_operacao?: string | null;
  cfop?: string | null;
  forma_pagamento?: string;
  observacoes?: string | null;
  motivo_cancelamento?: string | null;
  empresa_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface FaturasState {
  faturas: Fatura[];
  loading: boolean;
  error: string | null;
}

const DEFAULT_ISO = () => new Date().toISOString();

const normalizeStatus = (status: string | NotaStatus | null): NotaStatus => {
  const value = (status ?? 'pendente').toString().toLowerCase();
  const allowed: NotaStatus[] = [
    'rascunho',
    'pendente',
    'emitida',
    'autorizada',
    'cancelada',
    'paga',
  ];
  return (allowed.includes(value as NotaStatus) ? value : 'pendente') as NotaStatus;
};

const normalizeTipo = (tipo: string | NotaTipo | null): NotaTipo => {
  const allowed: NotaTipo[] = ['nfe', 'nfse', 'cte', 'mdfe'];
  const value = (tipo ?? 'nfe').toString().toLowerCase();
  return (allowed.includes(value as NotaTipo) ? value : 'nfe') as NotaTipo;
};

const toFatura = (row: NotaFiscalRow): Fatura => ({
  id: row.id,
  numero_nfe: row.numero_nfe ?? row.numero ?? '',
  serie: row.serie ?? '',
  tipo: normalizeTipo(row.tipo),
  cliente_tipo: (row.cliente_tipo ?? 'hospital') as NotaClienteTipo,
  cliente_id: row.cliente_id ?? null,
  cliente_nome: row.cliente_nome ?? row.destinatario_nome ?? '',
  cliente_cpf_cnpj: row.cliente_cpf_cnpj ?? row.destinatario_cpf_cnpj ?? '',
  cliente_email: row.cliente_email ?? '',
  cliente_telefone: row.cliente_telefone ?? '',
  data_emissao: row.data_emissao,
  data_vencimento: row.data_vencimento ?? null,
  data_pagamento: row.data_pagamento ?? null,
  valor_produtos: row.valor_produtos ?? 0,
  valor_desconto: row.valor_desconto ?? 0,
  valor_frete: row.valor_frete ?? 0,
  valor_impostos: row.valor_impostos ?? 0,
  valor_total: row.valor_total ?? 0,
  status: normalizeStatus(row.status),
  status_sefaz: row.status_sefaz,
  chave_acesso: row.chave_acesso,
  protocolo_autorizacao: row.protocolo_autorizacao ?? row.protocolo ?? null,
  natureza_operacao: row.natureza_operacao,
  cfop: row.cfop,
  forma_pagamento: row.forma_pagamento ?? '',
  observacoes: row.observacoes,
  motivo_cancelamento: row.motivo_cancelamento,
  empresa_id: row.empresa_id,
  created_at: row.created_at ?? row.criado_em ?? DEFAULT_ISO(),
  updated_at: row.updated_at ?? row.atualizado_em ?? DEFAULT_ISO(),
});

const buildInsert = (
  fatura: Omit<Fatura, 'id' | 'created_at' | 'updated_at'>
): NotaFiscalInsert => ({
  numero_nfe: fatura.numero_nfe,
  numero: fatura.numero_nfe,
  serie: fatura.serie,
  tipo: fatura.tipo ?? 'nfe',
  cliente_tipo: fatura.cliente_tipo ?? 'hospital',
  cliente_id: fatura.cliente_id ?? null,
  cliente_nome: fatura.cliente_nome,
  cliente_cpf_cnpj: fatura.cliente_cpf_cnpj,
  cliente_email: fatura.cliente_email ?? '',
  cliente_telefone: fatura.cliente_telefone ?? '',
  data_emissao: fatura.data_emissao,
  data_vencimento: fatura.data_vencimento ?? null,
  data_pagamento: fatura.data_pagamento ?? null,
  valor_produtos: fatura.valor_produtos,
  valor_desconto: fatura.valor_desconto ?? 0,
  valor_frete: fatura.valor_frete ?? 0,
  valor_impostos: fatura.valor_impostos ?? 0,
  valor_total: fatura.valor_total,
  status: fatura.status ?? 'pendente',
  status_sefaz: fatura.status_sefaz ?? null,
  chave_acesso: fatura.chave_acesso ?? null,
  protocolo_autorizacao: fatura.protocolo_autorizacao ?? null,
  natureza_operacao: fatura.natureza_operacao ?? null,
  cfop: fatura.cfop ?? null,
  forma_pagamento: fatura.forma_pagamento ?? '',
  observacoes: fatura.observacoes ?? null,
  motivo_cancelamento: fatura.motivo_cancelamento ?? null,
});

const buildUpdate = (updates: Partial<Fatura>): NotaFiscalUpdate => {
  const payload: NotaFiscalUpdate = {};
  const set = <K extends keyof NotaFiscalUpdate>(key: K, value: Nullable<NotaFiscalUpdate[K]>) => {
    if (value !== undefined) {
      payload[key] = value as NotaFiscalUpdate[K];
    }
  };

  set('numero_nfe', updates.numero_nfe);
  set('numero', updates.numero_nfe);
  set('serie', updates.serie);
  set('tipo', updates.tipo ?? null);
  set('cliente_tipo', updates.cliente_tipo ?? null);
  set('cliente_id', updates.cliente_id ?? null);
  set('cliente_nome', updates.cliente_nome);
  set('cliente_cpf_cnpj', updates.cliente_cpf_cnpj);
  set('cliente_email', updates.cliente_email ?? null);
  set('cliente_telefone', updates.cliente_telefone ?? null);
  set('data_emissao', updates.data_emissao);
  set('data_vencimento', updates.data_vencimento ?? null);
  set('data_pagamento', updates.data_pagamento ?? null);
  set('valor_produtos', updates.valor_produtos);
  set('valor_desconto', updates.valor_desconto);
  set('valor_frete', updates.valor_frete);
  set('valor_impostos', updates.valor_impostos);
  set('valor_total', updates.valor_total);
  set('status', updates.status ?? null);
  set('status_sefaz', updates.status_sefaz ?? null);
  set('chave_acesso', updates.chave_acesso ?? null);
  set('protocolo_autorizacao', updates.protocolo_autorizacao ?? null);
  set('natureza_operacao', updates.natureza_operacao ?? null);
  set('cfop', updates.cfop ?? null);
  set('forma_pagamento', updates.forma_pagamento ?? null);
  set('observacoes', updates.observacoes ?? null);
  set('motivo_cancelamento', updates.motivo_cancelamento ?? null);
  set('empresa_id', updates.empresa_id ?? null);

  return payload;
};

export function useFaturas() {
  const [state, setState] = useState<FaturasState>({ faturas: [], loading: true, error: null });

  const handleError = useCallback((error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : fallback;
    setState((prev) => ({ ...prev, loading: false, error: message }));
  }, []);

  const fetchFaturas = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      const rows = (data as NotaFiscalRow[] | null) ?? [];
      setState({ faturas: rows.map(toFatura), loading: false, error: null });
    } catch (error) {
      handleError(error, 'Erro ao carregar faturas');
    }
  }, [handleError]);

  const getFaturaById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? toFatura(data as NotaFiscalRow) : null;
    } catch (error) {
      console.error('Erro ao buscar fatura:', error);
      return null;
    }
  }, []);

  const createFatura = useCallback(
    async (fatura: Omit<Fatura, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const payload = buildInsert(fatura);
        const { data, error } = await supabase
          .from('notas_fiscais')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (!data) return null;

        const nova = toFatura(data as NotaFiscalRow);
        setState((prev) => ({ ...prev, faturas: [nova, ...prev.faturas] }));
        return nova;
      } catch (error) {
        handleError(error, 'Erro ao criar fatura');
        return null;
      }
    },
    [handleError]
  );

  const updateFatura = useCallback(
    async (id: string, updates: Partial<Fatura>) => {
      try {
        const payload = buildUpdate(updates);
        const { data, error } = await supabase
          .from('notas_fiscais')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!data) return null;

        const atualizada = toFatura(data as NotaFiscalRow);
        setState((prev) => ({
          ...prev,
          faturas: prev.faturas.map((f) => (f.id === id ? atualizada : f)),
        }));
        return atualizada;
      } catch (error) {
        handleError(error, 'Erro ao atualizar fatura');
        return null;
      }
    },
    [handleError]
  );

  const deleteFatura = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('notas_fiscais').delete().eq('id', id);

        if (error) throw error;
        setState((prev) => ({ ...prev, faturas: prev.faturas.filter((f) => f.id !== id) }));
        return true;
      } catch (error) {
        handleError(error, 'Erro ao deletar fatura');
        return false;
      }
    },
    [handleError]
  );

  const getFaturasByStatus = useCallback(async (status: NotaStatus) => {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .eq('status', status)
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      return ((data as NotaFiscalRow[] | null) ?? []).map(toFatura);
    } catch (error) {
      console.error('Erro ao buscar por status:', error);
      return [];
    }
  }, []);

  const getFaturasByPeriodo = useCallback(async (dataInicio: string, dataFim: string) => {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .gte('data_emissao', dataInicio)
        .lte('data_emissao', dataFim)
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      return ((data as NotaFiscalRow[] | null) ?? []).map(toFatura);
    } catch (error) {
      console.error('Erro ao buscar por período:', error);
      return [];
    }
  }, []);

  const emitirFatura = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from('notas_fiscais')
          .update({ status: 'emitida', data_emissao: DEFAULT_ISO() })
          .eq('id', id);

        if (error) throw error;
        await fetchFaturas();
        return true;
      } catch (error) {
        handleError(error, 'Erro ao emitir fatura');
        return false;
      }
    },
    [fetchFaturas, handleError]
  );

  const cancelarFatura = useCallback(
    async (id: string, motivo: string) => {
      try {
        const { error } = await supabase
          .from('notas_fiscais')
          .update({
            status: 'cancelada',
            motivo_cancelamento: motivo,
            data_cancelamento: DEFAULT_ISO(),
          })
          .eq('id', id);

        if (error) throw error;
        await fetchFaturas();
        return true;
      } catch (error) {
        handleError(error, 'Erro ao cancelar fatura');
        return false;
      }
    },
    [fetchFaturas, handleError]
  );

  const getResumoFaturas = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('notas_fiscais').select('status, valor_total');

      if (error) throw error;

      const rows = (data as Pick<NotaFiscalRow, 'status' | 'valor_total'>[] | null) ?? [];
      const totalFaturas = rows.length;
      const valorTotal = rows.reduce((sum, f) => sum + (f.valor_total ?? 0), 0);
      const statusCount = rows.reduce(
        (acc, f) => {
          const status = normalizeStatus(f.status);
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<NotaStatus, number>
      );

      const emitidas = (statusCount.emitida ?? 0) + (statusCount.autorizada ?? 0);
      const pagas = statusCount.paga ?? 0;
      const pendentes = statusCount.pendente ?? 0;
      const canceladas = statusCount.cancelada ?? 0;

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
      console.error('Erro ao calcular resumo de faturas:', error);
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
      const { data, error } = await supabase.from('notas_fiscais').select('status');

      if (error) throw error;

      const rows = (data as Pick<NotaFiscalRow, 'status'>[] | null) ?? [];
      return rows.reduce(
        (acc, row) => {
          const status = normalizeStatus(row.status);
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<NotaStatus, number>
      );
    } catch (error) {
      console.error('Erro ao contar faturas:', error);
      return {} as Record<NotaStatus, number>;
    }
  }, []);

  useEffect(() => {
    fetchFaturas();

    const channel = supabase
      .channel('notas_fiscais_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notas_fiscais' }, () => {
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
