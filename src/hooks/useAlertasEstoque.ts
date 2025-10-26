/**
 * useAlertasEstoque - Hook para gestão de alertas de estoque
 * Sistema: ICARUS v5.0
 * 
 * Tipos de Alertas:
 * - Estoque baixo
 * - Ponto de reposição atingido
 * - Vencimento próximo
 * - Ruptura de estoque
 * - Excesso de estoque
 * - Lote bloqueado
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// INTERFACES
// ============================================

export interface AlertaEstoque {
  id: string;
  produto_id: string;
  tipo: 'estoque_baixo' | 'ponto_reposicao' | 'vencimento_proximo' | 
        'ruptura' | 'excesso' | 'lote_bloqueado';
  
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  mensagem: string;
  
  quantidade_atual?: number;
  quantidade_minima?: number;
  dias_vencimento?: number;
  
  status: 'ativo' | 'resolvido' | 'ignorado';
  
  data_resolucao?: string;
  resolvido_por?: string;
  
  created_at: string;
  
  // Joins
  produto?: {
    nome: string;
    codigo_anvisa?: string;
  };
}

export interface AlertaStats {
  total: number;
  criticos: number;
  altos: number;
  medios: number;
  baixos: number;
  porTipo: Record<string, number>;
}

// ============================================
// HOOK
// ============================================

export const useAlertasEstoque = () => {
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([]);
  const [stats, setStats] = useState<AlertaStats>({
    total: 0,
    criticos: 0,
    altos: 0,
    medios: 0,
    baixos: 0,
    porTipo: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH ALERTAS
  // ============================================
  
  const fetchAlertas = useCallback(async (somenteAtivos = true) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('estoque_alertas')
        .select(`
          *,
          produto:produtos_opme(nome, codigo_anvisa)
        `)
        .order('severidade', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (somenteAtivos) {
        query = query.eq('status', 'ativo');
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setAlertas(data || []);
      
      // Calcular estatísticas
      if (data) {
        const stats: AlertaStats = {
          total: data.length,
          criticos: data.filter(a => a.severidade === 'critica').length,
          altos: data.filter(a => a.severidade === 'alta').length,
          medios: data.filter(a => a.severidade === 'media').length,
          baixos: data.filter(a => a.severidade === 'baixa').length,
          porTipo: {}
        };
        
        // Contar por tipo
        data.forEach(alerta => {
          stats.porTipo[alerta.tipo] = (stats.porTipo[alerta.tipo] || 0) + 1;
        });
        
        setStats(stats);
      }
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao carregar alertas:', err);
      setError(err.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // CRIAR ALERTA
  // ============================================
  
  const criarAlerta = useCallback(async (
    produtoId: string,
    tipo: AlertaEstoque['tipo'],
    severidade: AlertaEstoque['severidade'],
    mensagem: string,
    dados?: {
      quantidade_atual?: number;
      quantidade_minima?: number;
      dias_vencimento?: number;
    }
  ) => {
    try {
      // Verificar se já existe alerta ativo para este produto e tipo
      const { data: existente } = await supabase
        .from('estoque_alertas')
        .select('id')
        .eq('produto_id', produtoId)
        .eq('tipo', tipo)
        .eq('status', 'ativo')
        .single();
      
      if (existente) {
        // Já existe alerta ativo, não criar duplicado
        return null;
      }
      
      const { data, error: createError } = await supabase
        .from('estoque_alertas')
        .insert({
          produto_id: produtoId,
          tipo,
          severidade,
          mensagem,
          ...dados,
          status: 'ativo'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Recarregar alertas
      await fetchAlertas();
      
      return data;
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao criar alerta:', err);
      throw err;
    }
  }, [fetchAlertas]);

  // ============================================
  // RESOLVER ALERTA
  // ============================================
  
  const resolverAlerta = useCallback(async (alertaId: string, usuarioId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('estoque_alertas')
        .update({
          status: 'resolvido',
          data_resolucao: new Date().toISOString(),
          resolvido_por: usuarioId
        })
        .eq('id', alertaId);
      
      if (updateError) throw updateError;
      
      await fetchAlertas();
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao resolver alerta:', err);
      setError(err.message ?? 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAlertas]);

  // ============================================
  // IGNORAR ALERTA
  // ============================================
  
  const ignorarAlerta = useCallback(async (alertaId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('estoque_alertas')
        .update({ status: 'ignorado' })
        .eq('id', alertaId);
      
      if (updateError) throw updateError;
      
      await fetchAlertas();
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao ignorar alerta:', err);
      setError(err.message ?? 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAlertas]);

  // ============================================
  // VERIFICAR E CRIAR ALERTAS AUTOMÁTICOS
  // ============================================
  
  const verificarAlertasAutomaticos = useCallback(async () => {
    try {
      // 1. Alertas de Ponto de Reposição
      const { data: produtosAbaixoPonto } = await supabase
        .rpc('produtos_abaixo_ponto_reposicao');
      
      if (produtosAbaixoPonto && produtosAbaixoPonto.length > 0) {
        for (const produto of produtosAbaixoPonto) {
          await criarAlerta(
            produto.produto_id,
            'ponto_reposicao',
            'alta',
            `Produto"${produto.produto_nome}" atingiu ponto de reposição`,
            {
              quantidade_atual: produto.quantidade_total,
              quantidade_minima: produto.ponto_reposicao
            }
          );
        }
      }
      
      // 2. Alertas de Vencimento Próximo (< 30 dias)
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 30);
      
      const { data: produtosVencendo } = await supabase
        .from('estoque_lotes')
        .select('produto_id, lote, data_validade, produtos_opme(nome)')
        .lte('data_validade', dataLimite.toISOString())
        .eq('status', 'ativo');
      
      if (produtosVencendo) {
        for (const lote of produtosVencendo) {
          const diasRestantes = Math.ceil(
            (new Date(lote.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          
          await criarAlerta(
            lote.produto_id,
            'vencimento_proximo',
            diasRestantes <= 7 ? 'critica' : diasRestantes <= 15 ? 'alta' : 'media',
            `Lote ${lote.lote} vence em ${diasRestantes} dias`,
            { dias_vencimento: diasRestantes }
          );
        }
      }
      
      // 3. Alertas de Ruptura (quantidade = 0)
      const { data: produtosZerados } = await supabase
        .from('estoque')
        .select('produto_id, produtos_opme(nome)')
        .eq('quantidade', 0)
        .eq('status', 'disponivel');
      
      if (produtosZerados) {
        for (const produto of produtosZerados) {
          await criarAlerta(
            produto.produto_id,
            'ruptura',
            'critica',
            `Produto em ruptura de estoque`,
            { quantidade_atual: 0 }
          );
        }
      }
      
      // Recarregar alertas após criar novos
      await fetchAlertas();
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao verificar alertas automáticos:', err);
    }
  }, [criarAlerta, fetchAlertas]);

  // ============================================
  // INITIAL FETCH
  // ============================================
  
  useEffect(() => {
    fetchAlertas();
    
    // Verificar alertas automáticos a cada 5 minutos
    const interval = setInterval(verificarAlertasAutomaticos, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchAlertas, verificarAlertasAutomaticos]);

  // ============================================
  // REALTIME SUBSCRIPTIONS
  // ============================================
  
  useEffect(() => {
    const channel = supabase
      .channel('alertas-estoque')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estoque_alertas'
        },
        () => {
          console.log('🚨 Alertas atualizados em tempo real');
          fetchAlertas();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlertas]);

  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Data
    alertas,
    stats,
    loading,
    error,
    
    // Methods
    fetchAlertas,
    criarAlerta,
    resolverAlerta,
    ignorarAlerta,
    verificarAlertasAutomaticos
  };
};

