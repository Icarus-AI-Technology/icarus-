// src/hooks/useEstoque.ts
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSupabaseQuery } from './useSupabase'
import type { Database } from '../lib/database.types.generated'

type EstoqueInsert = Database['public']['Tables']['estoque']['Insert']
type EstoqueUpdate = Database['public']['Tables']['estoque']['Update']

export function useEstoque(empresaId?: string) {
  const { data: estoques, loading, error } = useSupabaseQuery('estoque', {
    select: `
      *,
      produto:produtos_opme(*),
      armazem:estoque_armazens(*),
      localizacao:estoque_localizacoes(*)
    `,
    filter: empresaId ? { empresa_id: empresaId } : undefined,
    orderBy: { column: 'criado_em', ascending: false }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const createEstoque = useCallback(async (data: EstoqueInsert) => {
    try {
      setIsSubmitting(true)
      const { data: newEstoque, error } = await supabase
        .from('estoque')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { data: newEstoque, error: null }
    } catch (err) {
      console.error('Erro ao criar estoque:', err)
      return { data: null, error: err as Error }
    } finally {
      setIsSubmitting(false)
    }
  }, [])
  
  const updateEstoque = useCallback(async (id: string, data: EstoqueUpdate) => {
    try {
      setIsSubmitting(true)
      const { data: updatedEstoque, error } = await supabase
        .from('estoque')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: updatedEstoque, error: null }
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err)
      return { data: null, error: err as Error }
    } finally {
      setIsSubmitting(false)
        }
  }, [])

  const deleteEstoque = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true)
      const { error } = await supabase
            .from('estoque')
        .update({ excluido_em: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      console.error('Erro ao deletar estoque:', err)
      return { error: err as Error }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Buscar estoque por produto
  const getEstoquePorProduto = useCallback(async (produtoId: string) => {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*, armazem:estoque_armazens(*)')
        .eq('produto_id', produtoId)
        .is('excluido_em', null)
      
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Erro ao buscar estoque por produto:', err)
      return { data: null, error: err as Error }
    }
  }, [])

  // Movimentar estoque
  const movimentarEstoque = useCallback(async (
    estoqueId: string,
    quantidade: number,
    tipo: 'entrada' | 'saida' | 'ajuste'
  ) => {
    try {
      setIsSubmitting(true)
      
      // Buscar estoque atual
      const { data: estoqueAtual, error: fetchError } = await supabase
        .from('estoque')
        .select('quantidade_disponivel, empresa_id, produto_id')
        .eq('id', estoqueId)
        .single()
      
      if (fetchError) throw fetchError

      // Calcular nova quantidade
      let novaQuantidade = estoqueAtual.quantidade_disponivel || 0
      if (tipo === 'entrada' || tipo === 'ajuste') {
        novaQuantidade += quantidade
      } else if (tipo === 'saida') {
        novaQuantidade -= quantidade
      }

      // Atualizar estoque
      const { error: updateError } = await supabase
        .from('estoque')
        .update({ quantidade_disponivel: novaQuantidade })
        .eq('id', estoqueId)

      if (updateError) throw updateError

      // Registrar movimentação
      const { error: movError } = await supabase
        .from('estoque_movimentacoes')
        .insert({
          empresa_id: estoqueAtual.empresa_id,
          produto_id: estoqueAtual.produto_id,
          tipo,
          quantidade,
          observacao: `Movimentação ${tipo}`
        })

      if (movError) throw movError

      return { error: null }
    } catch (err) {
      console.error('Erro ao movimentar estoque:', err)
      return { error: err as Error }
    } finally {
      setIsSubmitting(false)
    }
  }, [])
  
  return {
    estoques,
    loading,
    error,
    isSubmitting,
    createEstoque,
    updateEstoque,
    deleteEstoque,
    getEstoquePorProduto,
    movimentarEstoque
  }
}
