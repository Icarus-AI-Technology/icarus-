/**
 * Hook: useConciliacaoBancaria
 * Gestão de Conciliação Bancária com Matching Automático e Pluggy DDA
 * 
 * FUNCIONALIDADES:
 * - Import OFX/API bancária
 * - Matching automático (algoritmo de similaridade)
 * - Reconciliação manual
 * - Integração Pluggy DDA (Open Banking Brasil)
 * - Realtime subscriptions
 * - Dashboard de conciliação
 */

import { useState, useEffect, useCallback } from"react";
import { supabase } from"@/lib/supabase";

export interface ExtratoBancario {
  id: string;
  created_at: string;
  empresa_id: string;
  
  // Identificação
  banco_id: string;
  banco_nome: string;
  conta_numero: string;
  agencia: string;
  
  // Transação
  data: string; // Alias para data_transacao (para compatibilidade com FinanceiroAvancado)
  data_transacao: string;
  historico: string;
  documento?: string;
  valor: number;
  tipo:"credito" |"debito";
  
  // Saldo
  saldo_anterior: number;
  saldo_posterior: number;
  
  // Conciliação
  conciliado: boolean;
  status:"pendente" |"conciliado" |"divergente"; // Adicionado para FinanceiroAvancado
  data_conciliacao?: string;
  conta_financeira_id?: string; // ID da conta a receber/pagar vinculada
  tipo_conta?:"receber" |"pagar";
  match_score?: number; // 0-100 (score de similaridade)
  match_manual: boolean; // Se foi conciliado manualmente
  
  // Classificação
  categoria?: string;
  centro_custo_id?: string;
  
  // Observações
  observacoes?: string;
}

export interface SugestãoConciliação {
  extrato_id: string;
  conta_financeira_id: string;
  tipo_conta:"receber" |"pagar";
  match_score: number;
  motivo: string;
  dados_conta: {
    numero_documento?: string;
    cliente_fornecedor: string;
    valor: number;
    data_vencimento: string;
  };
}

interface ConciliacaoFilters {
  conciliado?: boolean;
  banco_id?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo?:"credito" |"debito";
}

interface ConciliacaoResumo {
  total_extratos: number;
  total_conciliados: number;
  total_pendentes: number;
  percentual_conciliado: number;
  valor_total_extratos: number;
  valor_conciliado: number;
  valor_pendente: number;
  media_match_score: number;
}

export function useConciliacaoBancaria() {
  const [extratos, setExtratos] = useState<ExtratoBancario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch extratos
  const fetchExtratos = useCallback(async (filters?: ConciliacaoFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("extrato_bancario")
        .select("*")
        .order("data_transacao", { ascending: false });

      // Aplicar filtros
      if (filters?.conciliado !== undefined) {
        query = query.eq("conciliado", filters.conciliado);
      }
      if (filters?.banco_id) {
        query = query.eq("banco_id", filters.banco_id);
      }
      if (filters?.data_inicio) {
        query = query.gte("data_transacao", filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte("data_transacao", filters.data_fim);
      }
      if (filters?.tipo) {
        query = query.eq("tipo", filters.tipo);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setExtratos((data as ExtratoBancario[]) || []);
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao carregar extratos bancários";
      setError(message);
      console.error("Erro useConciliacaoBancaria:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Import OFX
  const importarOFX = useCallback(async (arquivoOFX: string, bancoId: string) => {
    try {
      setError(null);
      // Importar ConciliacaoBancariaService dinamicamente
      const { conciliacaoBancariaService } = await import("@/lib/services/ConciliacaoBancariaService");
      const extratos = await conciliacaoBancariaService.parseOFX(arquivoOFX);
      
      // Salvar extratos no banco
      const { data, error: insertError } = await supabase
        .from("extrato_bancario")
        .insert(extratos.map((e) => ({ ...e, banco_id: bancoId })))
        .select();

      if (insertError) throw insertError;
      
      // Recarregar extratos
      await fetchExtratos();
      
      return (data as ExtratoBancario[]).length;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao importar OFX";
      setError(message);
      console.error("Erro importarOFX:", err);
      return 0;
    }
  }, [fetchExtratos]);

  // Buscar sugestões de conciliação
  const buscarSugestoes = useCallback(async (extratoId: string): Promise<SugestãoConciliação[]> => {
    try {
      const { conciliacaoBancariaService } = await import("@/lib/services/ConciliacaoBancariaService");
      
      // Buscar extrato
      const { data: extrato } = await supabase
        .from("extrato_bancario")
        .select("*")
        .eq("id", extratoId)
        .single();

      if (!extrato) return [];

      // Buscar sugestões usando algoritmo de matching
      const sugestoes = await conciliacaoBancariaService.buscarSugestoesConciliacao(extrato as ExtratoBancario);
      
      return sugestoes;
    } catch (error) {
   const err = error as Error;
      console.error("Erro buscarSugestoes:", err);
      return [];
    }
  }, []);

  // Conciliar manualmente
  const conciliarManual = useCallback(async (
    extratoId: string,
    contaFinanceiraId: string,
    tipoConta:"receber" |"pagar"
  ) => {
    try {
      setError(null);

      // Atualizar extrato
      const { data: extrato, error: updateError } = await supabase
        .from("extrato_bancario")
        .update({
          conciliado: true,
          data_conciliacao: new Date().toISOString(),
          conta_financeira_id: contaFinanceiraId,
          tipo_conta: tipoConta,
          match_manual: true,
          match_score: 100,
        })
        .eq("id", extratoId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar status da conta financeira
      const tabelaConta = tipoConta ==="receber" ?"contas_receber" :"contas_pagar";
      await supabase
        .from(tabelaConta)
        .update({ status:"pago" })
        .eq("id", contaFinanceiraId);

      return extrato as ExtratoBancario;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao conciliar manualmente";
      setError(message);
      console.error("Erro conciliarManual:", err);
      return null;
    }
  }, []);

  // Conciliar automático (todas as sugestões com score > 90)
  const conciliarAutomatico = useCallback(async (scoreMinimo: number = 90) => {
    try {
      setError(null);

      // Buscar extratos não conciliados
      const { data: extratosNaoConciliados } = await supabase
        .from("extrato_bancario")
        .select("*")
        .eq("conciliado", false);

      if (!extratosNaoConciliados || extratosNaoConciliados.length === 0) {
        return 0;
      }

      let totalConciliado = 0;

      for (const extrato of extratosNaoConciliados) {
        const sugestoes = await buscarSugestoes(extrato.id);
        
        // Conciliar se tiver sugestão com score >= scoreMinimo
        const melhorSugestao = sugestoes.find((s) => s.match_score >= scoreMinimo);
        if (melhorSugestao) {
          await conciliarManual(
            extrato.id,
            melhorSugestao.conta_financeira_id,
            melhorSugestao.tipo_conta
          );
          totalConciliado++;
        }
      }

      // Recarregar extratos
      await fetchExtratos();

      return totalConciliado;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro na conciliação automática";
      setError(message);
      console.error("Erro conciliarAutomatico:", err);
      return 0;
    }
  }, [buscarSugestoes, conciliarManual, fetchExtratos]);

  // Desconciliar
  const desconciliar = useCallback(async (extratoId: string) => {
    try {
      setError(null);

      const { data: extrato, error: updateError } = await supabase
        .from("extrato_bancario")
        .update({
          conciliado: false,
          data_conciliacao: null,
          conta_financeira_id: null,
          tipo_conta: null,
          match_manual: false,
          match_score: null,
        })
        .eq("id", extratoId)
        .select()
        .single();

      if (updateError) throw updateError;
      return extrato as ExtratoBancario;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao desconciliar";
      setError(message);
      console.error("Erro desconciliar:", err);
      return null;
    }
  }, []);

  // Get resumo
  const getResumo = useCallback(async (): Promise<ConciliacaoResumo> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("extrato_bancario")
        .select("*");

      if (fetchError) throw fetchError;

      const extratosData = (data as ExtratoBancario[]) || [];
      const total = extratosData.length;
      const conciliados = extratosData.filter((e) => e.conciliado);
      const pendentes = extratosData.filter((e) => !e.conciliado);

      const valorTotal = extratosData.reduce((sum, e) => sum + Math.abs(e.valor), 0);
      const valorConciliado = conciliados.reduce((sum, e) => sum + Math.abs(e.valor), 0);
      const valorPendente = pendentes.reduce((sum, e) => sum + Math.abs(e.valor), 0);

      const mediaScore = conciliados.length > 0
        ? conciliados.reduce((sum, e) => sum + (e.match_score || 0), 0) / conciliados.length
        : 0;

      return {
        total_extratos: total,
        total_conciliados: conciliados.length,
        total_pendentes: pendentes.length,
        percentual_conciliado: total > 0 ? (conciliados.length / total) * 100 : 0,
        valor_total_extratos: valorTotal,
        valor_conciliado: valorConciliado,
        valor_pendente: valorPendente,
        media_match_score: mediaScore,
      };
    } catch (error) {
   const err = error as Error;
      console.error("Erro getResumo:", err);
      return {
        total_extratos: 0,
        total_conciliados: 0,
        total_pendentes: 0,
        percentual_conciliado: 0,
        valor_total_extratos: 0,
        valor_conciliado: 0,
        valor_pendente: 0,
        media_match_score: 0,
      };
    }
  }, []);

  // Conectar Pluggy (Open Banking)
  const conectarPluggy = useCallback(async (bancoId: string) => {
    try {
      setError(null);
      // TODO: Implementar integração real com Pluggy
      // Por ora, retorna URL de simulação
      const pluggyURL = `https://pluggy.ai/connect?client_id=YOUR_CLIENT_ID&bank=${bancoId}`;
      return pluggyURL;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao conectar Pluggy";
      setError(message);
      console.error("Erro conectarPluggy:", err);
      return null;
    }
  }, []);

  // Setup Realtime
  useEffect(() => {
    fetchExtratos();

    const channel = supabase
      .channel("extrato_bancario_changes")
      .on("postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"extrato_bancario",
        },
        (payload) => {
          console.log("Realtime extrato_bancario:", payload);
          fetchExtratos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchExtratos]);

  return {
    extratos,
    loading,
    error,
    fetchExtratos,
    importarOFX,
    buscarSugestoes,
    conciliarManual,
    conciliarAutomatico,
    desconciliar,
    getResumo,
    conectarPluggy,
  };
}

