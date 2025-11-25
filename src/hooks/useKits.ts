import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types.generated';

/**
 * Hook para Kits de Consignação
 * Tabela: kits + itens_kit
 */

type KitRow = Database['public']['Tables']['kits']['Row'];
type KitInsert = Database['public']['Tables']['kits']['Insert'];
type KitStatus = Database['public']['Enums']['kit_status_enum'];
type ItemKitRow = Database['public']['Tables']['itens_kit']['Row'];
type ItemKitInsert = Database['public']['Tables']['itens_kit']['Insert'];

export interface Kit {
  id: string;
  empresa_id: string;
  cirurgia_id?: string | null;
  hospital_id: string;
  codigo_kit: string;
  status: KitStatus;
  data_envio?: string | null;
  data_devolucao?: string | null;
  valor_total: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemKit {
  id: string;
  kit_id: string;
  produto_id: string;
  lote_id?: string | null;
  quantidade: number;
  quantidade_consumida?: number;
  utilizado: boolean;
  created_at: string;
  updated_at: string;
}

const toKit = (row: KitRow): Kit => ({
  id: row.id,
  empresa_id: row.empresa_id,
  cirurgia_id: row.cirurgia_id,
  hospital_id: row.hospital_id ?? '',
  codigo_kit: row.codigo_kit ?? '',
  status: ((row.status as KitStatus) ?? 'montagem') as KitStatus,
  data_envio: row.data_envio ?? row.data_montagem,
  data_devolucao: row.data_devolucao ?? row.data_consumo,
  valor_total: row.valor_total ?? 0,
  observacoes: row.observacoes ?? row.descricao ?? '',
  created_at: row.created_at ?? row.criado_em ?? new Date().toISOString(),
  updated_at: row.updated_at ?? row.atualizado_em ?? new Date().toISOString(),
});

const toItemKit = (row: ItemKitRow): ItemKit => ({
  id: row.id,
  kit_id: row.kit_id,
  produto_id: row.produto_id,
  lote_id: row.lote_id,
  quantidade: row.quantidade ?? 0,
  quantidade_consumida: row.quantidade_consumida ?? 0,
  utilizado: row.utilizado ?? false,
  created_at: row.created_at ?? row.criado_em ?? new Date().toISOString(),
  updated_at: row.updated_at ?? row.atualizado_em ?? new Date().toISOString(),
});

const buildKitInsert = (kit: Omit<Kit, 'id'>): KitInsert => ({
  empresa_id: kit.empresa_id,
  cirurgia_id: kit.cirurgia_id ?? null,
  hospital_id: kit.hospital_id || null,
  codigo_kit: kit.codigo_kit,
  status: kit.status,
  data_envio: kit.data_envio ?? null,
  data_devolucao: kit.data_devolucao ?? null,
  valor_total: kit.valor_total,
  observacoes: kit.observacoes ?? '',
});

const mapKitUpdatePayload = (updates: Partial<Kit>): Partial<KitInsert> => {
  const payload: Partial<KitInsert> = {};
  if (updates.empresa_id !== undefined) payload.empresa_id = updates.empresa_id;
  if (updates.cirurgia_id !== undefined) payload.cirurgia_id = updates.cirurgia_id ?? null;
  if (updates.hospital_id !== undefined) payload.hospital_id = updates.hospital_id || null;
  if (updates.codigo_kit !== undefined) payload.codigo_kit = updates.codigo_kit;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.data_envio !== undefined) payload.data_envio = updates.data_envio ?? null;
  if (updates.data_devolucao !== undefined) payload.data_devolucao = updates.data_devolucao ?? null;
  if (updates.valor_total !== undefined) payload.valor_total = updates.valor_total;
  if (updates.observacoes !== undefined) payload.observacoes = updates.observacoes ?? '';
  return payload;
};

const buildItemInsert = (
  item: Omit<ItemKit, 'id' | 'created_at' | 'updated_at'>
): ItemKitInsert => ({
  kit_id: item.kit_id,
  produto_id: item.produto_id,
  lote_id: item.lote_id ?? null,
  quantidade: item.quantidade,
  quantidade_consumida: item.quantidade_consumida ?? 0,
  utilizado: item.utilizado,
});

export const useKits = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback;
    setError(message);
  }, []);

  const fetchKits = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('kits')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setKits(((data as KitRow[] | null) ?? []).map(toKit));
      setError(null);
    } catch (error) {
      handleError(error, 'Erro ao carregar kits');
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchKits().catch((err: unknown) => handleError(err, 'Erro ao carregar kits'));

    const subscription = supabase
      .channel('kits-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kits',
        },
        () => {
          fetchKits().catch((err: unknown) => handleError(err, 'Erro ao atualizar kits'));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchKits, handleError]);

  const criarKit = async (kit: Omit<Kit, 'id'>) => {
    try {
      const payload = buildKitInsert(kit);

      const { data, error } = await supabase.from('kits').insert(payload).select().single();

      if (error) throw error;

      return data ? toKit(data as KitRow) : null;
    } catch (error) {
      handleError(error, 'Erro ao criar kit');
      throw error;
    }
  };

  const atualizarKit = async (id: string, updates: Partial<Kit>) => {
    try {
      const payload = mapKitUpdatePayload(updates);

      const { error } = await supabase.from('kits').update(payload).eq('id', id);

      if (error) throw error;

      await fetchKits();
    } catch (error) {
      handleError(error, 'Erro ao atualizar kit');
      throw error;
    }
  };

  const adicionarItemKit = async (item: Omit<ItemKit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const payload = buildItemInsert(item);

      const { data, error } = await supabase.from('itens_kit').insert(payload).select().single();

      if (error) throw error;

      return data ? toItemKit(data as ItemKitRow) : null;
    } catch (error) {
      handleError(error, 'Erro ao adicionar item ao kit');
      throw error;
    }
  };

  const buscarItensKit = async (kitId: string) => {
    try {
      const { data, error } = await supabase.from('itens_kit').select('*').eq('kit_id', kitId);

      if (error) throw error;

      return ((data as ItemKitRow[] | null) ?? []).map(toItemKit);
    } catch (error) {
      handleError(error, 'Erro ao buscar itens do kit');
      throw error as PostgrestError;
    }
  };

  const enviarKit = async (id: string, dataEnvio: string) => {
    return atualizarKit(id, { status: 'enviado', data_envio: dataEnvio });
  };

  const devolverKit = async (id: string, dataDevolucao: string) => {
    return atualizarKit(id, { status: 'devolvido', data_devolucao: dataDevolucao });
  };

  const faturarKit = async (id: string) => {
    return atualizarKit(id, { status: 'faturado' });
  };

  return {
    kits,
    loading,
    error,
    fetchKits,
    criarKit,
    atualizarKit,
    adicionarItemKit,
    buscarItensKit,
    enviarKit,
    devolverKit,
    faturarKit,
  };
};
