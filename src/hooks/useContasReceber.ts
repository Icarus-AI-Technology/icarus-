/**
 * Hook: useContasReceber
 * Gestão de Contas a Receber com IA de Inadimplência
 * 
 * FUNCIONALIDADES:
 * - CRUD contas a receber
 * - Score de inadimplência (IA)
 * - Alertas de vencimento
 * - Realtime subscriptions
 * - Filtros avançados
 */

import { useState, useEffect, useCallback } from"react";
import { supabase } from"@/lib/supabase";

export interface ContaReceber {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  
  // Identificação
  numero_documento: string;
  cliente_id?: string;
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  
  // Valores
  valor_original: number;
  valor_pago: number;
  valor_desconto: number;
  valor_juros: number;
  valor_multa: number;
  valor_liquido: number;
  
  // Datas
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  
  // Status
  status:"pendente" |"pago" |"vencido" |"parcial" |"cancelado";
  
  // Classificação
  tipo_receita:"venda_opme" |"servico" |"consignacao" |"outro";
  categoria: string;
  centro_custo_id?: string;
  
  // Pagamento
  forma_pagamento?: string;
  banco_recebimento?: string;
  comprovante_url?: string;
  
  // IA Scores
  score_inadimplencia?: number; // 0-100
  risco_inadimplencia?:"baixo" |"médio" |"alto";
  dias_atraso?: number;
  
  // Relacionamentos
  fatura_id?: string;
  cirurgia_id?: string;
  
  // Observações
  observacoes?: string;
  
  // Histórico
  historico_pagamentos?: Array<{
    data: string;
    valor: number;
    forma_pagamento: string;
    observacao?: string;
  }>;
}

interface ContasReceberFilters {
  status?: ContaReceber["status"];
  data_inicio?: string;
  data_fim?: string;
  cliente_id?: string;
  vencidos?: boolean;
  risco?: ContaReceber["risco_inadimplencia"];
}

interface ContasReceberResumo {
  total_contas: number;
  valor_total: number;
  valor_pendente: number;
  valor_pago: number;
  valor_vencido: number;
  quantidade_vencidas: number;
  ticket_medio: number;
  prazo_medio_recebimento: number;
  taxa_inadimplencia: number;
}

export function useContasReceber() {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contas
  const fetchContas = useCallback(async (filters?: ContasReceberFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("contas_receber")
        .select("*")
        .order("data_vencimento", { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.data_inicio) {
        query = query.gte("data_vencimento", filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte("data_vencimento", filters.data_fim);
      }
      if (filters?.cliente_id) {
        query = query.eq("cliente_id", filters.cliente_id);
      }
      if (filters?.vencidos) {
        const dataAtual = new Date().toISOString().split("T")[0];
        query = query.lt("data_vencimento", dataAtual).eq("status","pendente");
      }
      if (filters?.risco) {
        query = query.eq("risco_inadimplencia", filters.risco);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setContas((data as ContaReceber[] | null) ?? []);
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao carregar contas a receber";
      setError(message);
      console.error("Erro useContasReceber:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create conta
  const createConta = useCallback(async (novaConta: Omit<ContaReceber,"id" |"created_at" |"updated_at" |"empresa_id">) => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from("contas_receber")
        .insert([novaConta])
        .select()
        .single();

      if (createError) throw createError;
      return data as ContaReceber;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao criar conta a receber";
      setError(message);
      console.error("Erro createConta:", err);
      return null;
    }
  }, []);

  // Update conta
  const updateConta = useCallback(async (id: string, updates: Partial<ContaReceber>) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from("contas_receber")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as ContaReceber;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao atualizar conta a receber";
      setError(message);
      console.error("Erro updateConta:", err);
      return null;
    }
  }, []);

  // Delete conta
  const deleteConta = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from("contas_receber")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao excluir conta a receber";
      setError(message);
      console.error("Erro deleteConta:", err);
      return false;
    }
  }, []);

  // Baixar conta (registrar pagamento)
  const baixarConta = useCallback(async (
    id: string,
    dataPagamento: string,
    valorPago: number,
    formaPagamento: string,
    observacao?: string
  ) => {
    try {
      setError(null);

      // Buscar conta atual
      const { data: contaAtual, error: fetchError } = await supabase
        .from("contas_receber")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const conta = contaAtual as ContaReceber;
      const novoValorPago = conta.valor_pago + valorPago;
      const valorLiquido = conta.valor_original - novoValorPago;

      // Determinar novo status
      let novoStatus: ContaReceber["status"] ="pago";
      if (novoValorPago < conta.valor_original) {
        novoStatus ="parcial";
      }

      // Adicionar ao histórico
      const historicoAtualizado = [
        ...(conta.historico_pagamentos || []),
        {
          data: dataPagamento,
          valor: valorPago,
          forma_pagamento: formaPagamento,
          observacao,
        },
      ];

      // Atualizar conta
      const { data, error: updateError } = await supabase
        .from("contas_receber")
        .update({
          valor_pago: novoValorPago,
          valor_liquido: valorLiquido,
          status: novoStatus,
          data_pagamento: novoStatus ==="pago" ? dataPagamento : conta.data_pagamento,
          historico_pagamentos: historicoAtualizado,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as ContaReceber;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao baixar conta";
      setError(message);
      console.error("Erro baixarConta:", err);
      return null;
    }
  }, []);

  // Get resumo
  const getResumo = useCallback(async () => {
    try {
      setError(null);
      const { data, error: resumoError } = await supabase
        .rpc("contas_receber_resumo");
 
       if (resumoError) throw resumoError;
       return data as ContasReceberResumo | null;
     } catch (error) {
   const err = error as Error;
       const message = err instanceof Error ? err.message :"Erro ao carregar resumo de contas a receber";
       setError(message);
       console.error("Erro getResumo:", err);
       const total = contas.reduce((acc, conta) => acc + conta.valor_liquido, 0);
       const pago = contas.filter((conta) => conta.status ==="pago").reduce((acc, conta) => acc + conta.valor_pago, 0);
       const pendente = total - pago;
       const vencido = contas.filter((conta) => conta.status ==="vencido").reduce((acc, conta) => acc + conta.valor_liquido, 0);

       return {
         total_contas: contas.length,
         valor_total: total,
         valor_pendente: pendente,
         valor_pago: pago,
         valor_vencido: vencido,
         quantidade_vencidas: contas.filter((conta) => conta.status ==="vencido").length,
         ticket_medio: contas.length > 0 ? total / contas.length : 0,
         prazo_medio_recebimento: 0,
         taxa_inadimplencia: total > 0 ? (vencido / total) * 100 : 0,
       } satisfies ContasReceberResumo;
     }
   }, [contas]);

  // Get contas vencidas
  const getContasVencidas = useCallback(async () => {
    return fetchContas({ vencidos: true });
  }, [fetchContas]);

  // Get contas por risco
  const getContasPorRisco = useCallback(async (risco: ContaReceber["risco_inadimplencia"]) => {
    return fetchContas({ risco });
  }, [fetchContas]);

  // Setup Realtime
  useEffect(() => {
    fetchContas();

    const channel = supabase
      .channel("contas_receber_changes")
      .on("postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"contas_receber",
        },
        (payload) => {
          console.log("Realtime contas_receber:", payload);
          fetchContas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContas]);

  return {
    contas,
    loading,
    error,
    fetchContas,
    createConta,
    updateConta,
    deleteConta,
    baixarConta,
    getResumo,
    getContasVencidas,
    getContasPorRisco,
  };
}
