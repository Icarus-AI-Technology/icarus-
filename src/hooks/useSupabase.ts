// src/hooks/useSupabase.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types.generated'

type Tables = Database['public']['Tables']

export function useSupabaseQuery<T extends keyof Tables>(
  table: T,
  options?: {
    select?: string
    filter?: Record<string, unknown>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
  }
) {
  type Row = Tables[T]['Row']
  
  const [data, setData] = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        let query = supabase.from(table).select(options?.select || '*')

        // Aplicar filtros
        if (options?.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }

        // Aplicar ordenação
        if (options?.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true
          })
        }

        // Aplicar limite
        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error
        setData(data as Row[])
      } catch (err) {
        setError(err as Error)
        console.error(`Erro ao buscar ${String(table)}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [
    table,
    options?.select,
    options?.limit,
    options?.orderBy?.column,
    options?.orderBy?.ascending,
    JSON.stringify(options?.filter),
  ])

  return { data, loading, error }
}

// Hook para realtime
export function useSupabaseRealtime<T extends keyof Tables>(
  table: T,
  callback: (payload: unknown) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`public:${String(table)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: String(table) },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback])
}

