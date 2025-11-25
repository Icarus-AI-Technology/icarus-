/**
 * Hook: useConvenios
 * Gestão de Convênios/Planos de Saúde
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types.generated';

type ConvenioRow = Database['public']['Tables']['convenios']['Row'];
type ConvenioInsert = Database['public']['Tables']['convenios']['Insert'];
type ConvenioUpdate = Database['public']['Tables']['convenios']['Update'];
type ConvenioTipo = Database['public']['Enums']['convenio_tipo_enum'];

type Nullable<T> = T | null | undefined;

export interface Convenio {
  id: string;
  empresa_id?: string | null;
  nome: string;
  cnpj: string;
  ans_registro?: string | null;
  tipo: ConvenioTipo;
  telefone: string;
  whatsapp?: string;
  email: string;
  site?: string | null;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string | null;
    bairro: string;
    cidade: string;
    uf: string;
  };
  prazo_pagamento: number;
  taxa_administrativa?: number | null;
  forma_pagamento?: string | null;
  dia_fechamento?: number | null;
  dia_pagamento?: number | null;
  faturamento_eletronico: boolean;
  portal_faturamento?: string | null;
  login_portal?: string | null;
  senha_portal?: string | null;
  exige_autorizacao: boolean;
  prazo_autorizacao?: number | null;
  tabela_preco_id?: string | null;
  usa_tabela_tuss: boolean;
  percentual_tuss?: number | null;
  ativo: boolean;
  observacoes?: string;
  total_faturado: number;
  total_glosas: number;
  taxa_glosa: number;
  created_at: string;
  updated_at: string;
}

interface ConveniosFilters {
  ativo?: boolean;
  tipo?: Convenio['tipo'];
  faturamento_eletronico?: boolean;
  exige_autorizacao?: boolean;
}

interface ConveniosResumo {
  total_convenios: number;
  convenios_ativos: number;
  com_faturamento_eletronico: number;
  valor_total_faturado: number;
  valor_total_glosas: number;
  taxa_glosa_media: number;
  ticket_medio_convenio: number;
}

const toConvenio = (row: ConvenioRow): Convenio => ({
  id: row.id,
  empresa_id: row.empresa_id ?? null,
  nome: row.nome ?? '',
  cnpj: row.cnpj ?? '',
  ans_registro: row.ans_registro ?? null,
  tipo: (row.tipo ?? 'plano_saude') as ConvenioTipo,
  telefone: row.telefone ?? '',
  whatsapp: row.whatsapp ?? row.telefone ?? '',
  email: row.email ?? '',
  site: row.site ?? null,
  endereco: {
    cep: row.endereco_cep ?? '',
    logradouro: row.endereco_logradouro ?? '',
    numero: row.endereco_numero ?? '',
    complemento: row.endereco_complemento ?? null,
    bairro: row.endereco_bairro ?? '',
    cidade: row.endereco_cidade ?? '',
    uf: row.endereco_uf ?? '',
  },
  prazo_pagamento: row.prazo_pagamento ?? 30,
  taxa_administrativa: row.taxa_administrativa ?? 0,
  forma_pagamento: row.forma_pagamento ?? null,
  dia_fechamento: row.dia_fechamento ?? null,
  dia_pagamento: row.dia_pagamento ?? null,
  faturamento_eletronico: row.faturamento_eletronico ?? false,
  portal_faturamento: row.portal_faturamento ?? null,
  login_portal: row.login_portal ?? null,
  senha_portal: row.senha_portal ?? null,
  exige_autorizacao: row.exige_autorizacao ?? false,
  prazo_autorizacao: row.prazo_autorizacao ?? null,
  tabela_preco_id: row.tabela_preco_id ?? null,
  usa_tabela_tuss: row.usa_tabela_tuss ?? false,
  percentual_tuss: row.percentual_tuss ?? null,
  ativo: row.ativo ?? true,
  observacoes: row.observacoes ?? '',
  total_faturado: row.total_faturado ?? 0,
  total_glosas: row.total_glosas ?? 0,
  taxa_glosa: row.taxa_glosa ?? 0,
  created_at: row.created_at ?? row.criado_em ?? new Date().toISOString(),
  updated_at: row.updated_at ?? row.atualizado_em ?? new Date().toISOString(),
});

const buildConvenioInsert = (
  convenio: Omit<Convenio, 'id' | 'created_at' | 'updated_at'>
): ConvenioInsert => ({
  empresa_id: convenio.empresa_id ?? null,
  nome: convenio.nome,
  cnpj: convenio.cnpj,
  ans_registro: convenio.ans_registro ?? null,
  tipo: convenio.tipo,
  telefone: convenio.telefone,
  whatsapp: convenio.whatsapp ?? convenio.telefone,
  email: convenio.email,
  site: convenio.site ?? null,
  endereco_cep: convenio.endereco?.cep ?? '',
  endereco_logradouro: convenio.endereco?.logradouro ?? '',
  endereco_numero: convenio.endereco?.numero ?? '',
  endereco_complemento: convenio.endereco?.complemento ?? null,
  endereco_bairro: convenio.endereco?.bairro ?? '',
  endereco_cidade: convenio.endereco?.cidade ?? '',
  endereco_uf: convenio.endereco?.uf ?? '',
  prazo_pagamento: convenio.prazo_pagamento,
  taxa_administrativa: convenio.taxa_administrativa ?? 0,
  forma_pagamento: convenio.forma_pagamento ?? null,
  dia_fechamento: convenio.dia_fechamento ?? null,
  dia_pagamento: convenio.dia_pagamento ?? null,
  faturamento_eletronico: convenio.faturamento_eletronico,
  portal_faturamento: convenio.portal_faturamento ?? null,
  login_portal: convenio.login_portal ?? null,
  senha_portal: convenio.senha_portal ?? null,
  exige_autorizacao: convenio.exige_autorizacao,
  prazo_autorizacao: convenio.prazo_autorizacao ?? null,
  tabela_preco_id: convenio.tabela_preco_id ?? null,
  usa_tabela_tuss: convenio.usa_tabela_tuss,
  percentual_tuss: convenio.percentual_tuss ?? null,
  ativo: convenio.ativo,
  observacoes: convenio.observacoes ?? '',
  total_faturado: convenio.total_faturado ?? 0,
  total_glosas: convenio.total_glosas ?? 0,
  taxa_glosa: convenio.taxa_glosa ?? 0,
});

const buildConvenioUpdate = (updates: Partial<Convenio>): ConvenioUpdate => {
  const payload: ConvenioUpdate = {};

  const setField = <K extends keyof ConvenioUpdate>(key: K, value: Nullable<ConvenioUpdate[K]>) => {
    if (value !== undefined) {
      payload[key] = value as ConvenioUpdate[K];
    }
  };

  setField('empresa_id', updates.empresa_id);
  setField('nome', updates.nome);
  setField('cnpj', updates.cnpj);
  setField('ans_registro', updates.ans_registro);
  setField('tipo', updates.tipo);
  setField('telefone', updates.telefone);
  if (updates.whatsapp !== undefined) {
    setField('whatsapp', updates.whatsapp);
  } else if (updates.telefone !== undefined) {
    setField('whatsapp', updates.telefone);
  }
  setField('email', updates.email);
  setField('site', updates.site);
  if (updates.endereco) {
    setField('endereco_cep', updates.endereco.cep);
    setField('endereco_logradouro', updates.endereco.logradouro);
    setField('endereco_numero', updates.endereco.numero);
    if (updates.endereco.complemento !== undefined) {
      setField('endereco_complemento', updates.endereco.complemento);
    }
    setField('endereco_bairro', updates.endereco.bairro);
    setField('endereco_cidade', updates.endereco.cidade);
    setField('endereco_uf', updates.endereco.uf);
  }
  setField('prazo_pagamento', updates.prazo_pagamento);
  setField('taxa_administrativa', updates.taxa_administrativa);
  setField('forma_pagamento', updates.forma_pagamento);
  setField('dia_fechamento', updates.dia_fechamento);
  setField('dia_pagamento', updates.dia_pagamento);
  setField('faturamento_eletronico', updates.faturamento_eletronico);
  setField('portal_faturamento', updates.portal_faturamento);
  setField('login_portal', updates.login_portal);
  setField('senha_portal', updates.senha_portal);
  setField('exige_autorizacao', updates.exige_autorizacao);
  setField('prazo_autorizacao', updates.prazo_autorizacao);
  setField('tabela_preco_id', updates.tabela_preco_id);
  setField('usa_tabela_tuss', updates.usa_tabela_tuss);
  setField('percentual_tuss', updates.percentual_tuss);
  setField('ativo', updates.ativo);
  setField('observacoes', updates.observacoes);
  setField('total_faturado', updates.total_faturado);
  setField('total_glosas', updates.total_glosas);
  setField('taxa_glosa', updates.taxa_glosa);

  return payload;
};

const defaultResumo: ConveniosResumo = {
  total_convenios: 0,
  convenios_ativos: 0,
  com_faturamento_eletronico: 0,
  valor_total_faturado: 0,
  valor_total_glosas: 0,
  taxa_glosa_media: 0,
  ticket_medio_convenio: 0,
};

export function useConvenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConvenios = useCallback(async (filters?: ConveniosFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('convenios').select('*').order('nome', { ascending: true });

      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters?.faturamento_eletronico !== undefined) {
        query = query.eq('faturamento_eletronico', filters.faturamento_eletronico);
      }
      if (filters?.exige_autorizacao !== undefined) {
        query = query.eq('exige_autorizacao', filters.exige_autorizacao);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const rows = (data as ConvenioRow[] | null) ?? [];
      setConvenios(rows.map(toConvenio));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar convênios';
      setError(message);
      console.error('Erro useConvenios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConvenio = useCallback(
    async (novoConvenio: Omit<Convenio, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        setError(null);
        const payload = buildConvenioInsert(novoConvenio);

        const { data, error: createError } = await supabase
          .from('convenios')
          .insert([payload])
          .select()
          .single();

        if (createError) throw createError;
        if (!data) return null;

        const convenio = toConvenio(data as ConvenioRow);
        setConvenios((prev) => [convenio, ...prev]);
        return convenio;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar convênio';
        setError(message);
        console.error('Erro createConvenio:', err);
        return null;
      }
    },
    []
  );

  const updateConvenio = useCallback(async (id: string, updates: Partial<Convenio>) => {
    try {
      setError(null);
      const payload = buildConvenioUpdate(updates);

      const { data, error: updateError } = await supabase
        .from('convenios')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) return null;

      const convenioAtualizado = toConvenio(data as ConvenioRow);
      setConvenios((prev) => prev.map((c) => (c.id === id ? convenioAtualizado : c)));
      return convenioAtualizado;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar convênio';
      setError(message);
      console.error('Erro updateConvenio:', err);
      return null;
    }
  }, []);

  const deleteConvenio = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase.from('convenios').delete().eq('id', id);

      if (deleteError) throw deleteError;
      setConvenios((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir convênio';
      setError(message);
      console.error('Erro deleteConvenio:', err);
      return false;
    }
  }, []);

  const getEstatisticasConvenio = useCallback(async (convenioId: string) => {
    try {
      const { data: lotes, error: lotesError } = await supabase
        .from('lotes_faturamento')
        .select('valor_total, valor_glosado')
        .eq('convenio_id', convenioId);

      if (lotesError) throw lotesError;

      const lotesData =
        (lotes as Array<{ valor_total: number | null; valor_glosado: number | null }> | null) ?? [];
      const totalFaturado = lotesData.reduce((sum, lote) => sum + (lote.valor_total ?? 0), 0);
      const totalGlosas = lotesData.reduce((sum, lote) => sum + (lote.valor_glosado ?? 0), 0);
      const taxaGlosa = totalFaturado > 0 ? (totalGlosas / totalFaturado) * 100 : 0;

      await supabase
        .from('convenios')
        .update({
          total_faturado: totalFaturado,
          total_glosas: totalGlosas,
          taxa_glosa: taxaGlosa,
        })
        .eq('id', convenioId);

      setConvenios((prev) =>
        prev.map((c) =>
          c.id === convenioId
            ? {
                ...c,
                total_faturado: totalFaturado,
                total_glosas: totalGlosas,
                taxa_glosa: taxaGlosa,
              }
            : c
        )
      );

      return {
        total_faturado: totalFaturado,
        total_glosas: totalGlosas,
        taxa_glosa: taxaGlosa,
      };
    } catch (err) {
      console.error('Erro getEstatisticasConvenio:', err);
      return {
        total_faturado: 0,
        total_glosas: 0,
        taxa_glosa: 0,
      };
    }
  }, []);

  const getResumo = useCallback(async (): Promise<ConveniosResumo> => {
    try {
      const { data, error: fetchError } = await supabase.from('convenios').select('*');

      if (fetchError) throw fetchError;

      const rows = (data as ConvenioRow[] | null) ?? [];
      const lista = rows.map(toConvenio);
      const total = lista.length;
      const ativos = lista.filter((c) => c.ativo);
      const comFaturamentoEletronico = lista.filter((c) => c.faturamento_eletronico);

      const valorFaturado = lista.reduce((sum, c) => sum + (c.total_faturado || 0), 0);
      const valorGlosas = lista.reduce((sum, c) => sum + (c.total_glosas || 0), 0);

      const conveniosComTaxa = lista.filter((c) => (c.taxa_glosa ?? 0) > 0);
      const taxaGlosaMedia =
        conveniosComTaxa.length > 0
          ? conveniosComTaxa.reduce((sum, c) => sum + (c.taxa_glosa || 0), 0) /
            conveniosComTaxa.length
          : 0;

      return {
        total_convenios: total,
        convenios_ativos: ativos.length,
        com_faturamento_eletronico: comFaturamentoEletronico.length,
        valor_total_faturado: valorFaturado,
        valor_total_glosas: valorGlosas,
        taxa_glosa_media: taxaGlosaMedia,
        ticket_medio_convenio: ativos.length > 0 ? valorFaturado / ativos.length : 0,
      };
    } catch (err) {
      console.error('Erro getResumo:', err);
      return defaultResumo;
    }
  }, []);

  useEffect(() => {
    fetchConvenios();

    const channel = supabase
      .channel('convenios_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'convenios',
        },
        () => {
          fetchConvenios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConvenios]);

  return {
    convenios,
    loading,
    error,
    fetchConvenios,
    createConvenio,
    updateConvenio,
    deleteConvenio,
    getEstatisticasConvenio,
    getResumo,
  };
}
