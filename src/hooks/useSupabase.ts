// src/hooks/useSupabase.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types.generated';

type Tables = Database['public']['Tables'];

export function useSupabaseQuery<T extends keyof Tables>(
  table: T,
  options?: {
    select?: string;
    filter?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  type Row = Tables[T]['Row'];

  const [data, setData] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filterStr = JSON.stringify(options?.filter);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select(options?.select || '*');

      // Aplicar filtros
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Aplicar ordenação
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Aplicar limite
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setData(data as unknown as Row[]);
    } catch (err) {
      setError(err as Error);
      console.error(`Erro ao buscar ${String(table)}:`, err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, options?.select, options?.limit, options?.orderBy, filterStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para realtime
export function useSupabaseRealtime<T extends keyof Tables>(
  table: T,
  callback: (payload: unknown) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`public:${String(table)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: String(table) }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}
