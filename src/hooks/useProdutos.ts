// src/hooks/useProdutos.ts
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSupabaseQuery } from './useSupabase'
import type { Database } from '../lib/database.types.generated'

type ProdutoInsert = Database['public']['Tables']['produtos_opme']['Insert']
type ProdutoUpdate = Database['public']['Tables']['produtos_opme']['Update']

export function useProdutos(empresaId?: string) {
  const { data: produtos, loading, error } = useSupabaseQuery('produtos_opme', {
    select: '*',
    filter: empresaId ? { empresa_id: empresaId, excluido_em: null } : { excluido_em: null },
    orderBy: { column: 'nome', ascending: true }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const createProduto = useCallback(async (data: ProdutoInsert) => {
    try {
      setIsSubmitting(true)
      const { data: newProduto, error } = await supabase
        .from('produtos_opme')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { data: newProduto, error: null }
    } catch (err) {
      console.error('Erro ao criar produto:', err)
      return { data: null, error: err as Error }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const updateProduto = useCallback(async (id: string, data: ProdutoUpdate) => {
    try {
      setIsSubmitting(true)
      const { data: updatedProduto, error } = await supabase
        .from('produtos_opme')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: updatedProduto, error: null }
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
      return { data: null, error: err as Error }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const deleteProduto = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('produtos_opme')
        .update({ excluido_em: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      return { error: err as Error }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Buscar produto por registro ANVISA
  const buscarPorRegistroANVISA = useCallback(async (registroAnvisa: string) => {
    try {
      const { data, error } = await supabase
        .from('produtos_opme')
        .select('*')
        .eq('registro_anvisa', registroAnvisa)
        .is('excluido_em', null)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data, error: null }
    } catch (err) {
      console.error('Erro ao buscar produto por ANVISA:', err)
      return { data: null, error: err as Error }
    }
  }, [])

  // Buscar produtos com estoque baixo
  const buscarEstoqueBaixo = useCallback(async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('produtos_opme')
        .select(`
          *,
          estoque:estoque(quantidade_disponivel)
        `)
        .eq('empresa_id', empresaId)
        .is('excluido_em', null)

      if (error) throw error

      // Filtrar produtos com estoque abaixo do ponto de reposição
      const produtosBaixo = (data as Array<{
        estoque?: Array<{ quantidade_disponivel?: number }>
        ponto_reposicao?: number
      }> | null)?.filter((produto) => {
        const estoqueTotal = (produto.estoque ?? []).reduce(
          (sum: number, e) => sum + (e.quantidade_disponivel ?? 0),
          0,
        )
        return estoqueTotal < (produto.ponto_reposicao ?? 10)
      }) as unknown

      return { data: produtosBaixo, error: null }
    } catch (err) {
      console.error('Erro ao buscar produtos com estoque baixo:', err)
      return { data: null, error: err as Error }
    }
  }, [])

  return {
    produtos,
    loading,
    error,
    isSubmitting,
    createProduto,
    updateProduto,
    deleteProduto,
    buscarPorRegistroANVISA,
    buscarEstoqueBaixo
  }
}
