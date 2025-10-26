/**
 * Hook: useContasPagar
 * Gestão de Contas a Pagar com Workflow de Aprovação
 * 
 * FUNCIONALIDADES:
 * - CRUD contas a pagar
 * - Workflow de aprovação (3 níveis)
 * - Agendamento de pagamentos
 * - Realtime subscriptions
 * - Filtros avançados
 * - Integração com Centro de Custos
 */

import { useState, useEffect, useCallback } from"react";
import { supabase } from"@/lib/supabase";

export interface ContaPagar {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  
  // Identificação
  numero_documento: string;
  fornecedor_id?: string;
  fornecedor_nome: string;
  fornecedor_cpf_cnpj: string;
  
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
  status:"pendente" |"aprovada" |"pago" |"vencido" |"cancelado" |"agendado";
  
  // Workflow de Aprovação
  requer_aprovacao: boolean;
  aprovacao_nivel1?: {
    aprovador_id: string;
    aprovador_nome: string;
    data_aprovacao: string;
    observacao?: string;
  };
  aprovacao_nivel2?: {
    aprovador_id: string;
    aprovador_nome: string;
    data_aprovacao: string;
    observacao?: string;
  };
  aprovacao_nivel3?: {
    aprovador_id: string;
    aprovador_nome: string;
    data_aprovacao: string;
    observacao?: string;
  };
  
  // Classificação
  tipo_despesa:"fornecedor" |"operacional" |"administrativa" |"impostos" |"folha" |"outro";
  categoria: string;
  centro_custo_id?: string;
  centro_custo_nome?: string;
  
  // Pagamento
  forma_pagamento?: string;
  banco_pagamento?: string;
  comprovante_url?: string;
  data_agendamento?: string;
  
  // Relacionamentos
  pedido_compra_id?: string;
  nota_fiscal_numero?: string;
  
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

interface ContasPagarFilters {
  status?: ContaPagar["status"];
  data_inicio?: string;
  data_fim?: string;
  fornecedor_id?: string;
  centro_custo_id?: string;
  vencidos?: boolean;
  pendente_aprovacao?: boolean;
}

interface ContasPagarResumo {
  total_contas: number;
  valor_total: number;
  valor_pendente: number;
  valor_pago: number;
  valor_vencido: number;
  quantidade_vencidas: number;
  ticket_medio: number;
  prazo_medio_pagamento: number;
  pendentes_aprovacao: number;
}

export function useContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contas
  const fetchContas = useCallback(async (filters?: ContasPagarFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("contas_pagar")
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
      if (filters?.fornecedor_id) {
        query = query.eq("fornecedor_id", filters.fornecedor_id);
      }
      if (filters?.centro_custo_id) {
        query = query.eq("centro_custo_id", filters.centro_custo_id);
      }
      if (filters?.vencidos) {
        const hoje = new Date().toISOString().split("T")[0];
        query = query.lt("data_vencimento", hoje).in("status", ["pendente","aprovada"]);
      }
      if (filters?.pendente_aprovacao) {
        query = query.eq("status","pendente").eq("requer_aprovacao", true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setContas((data as ContaPagar[] | null) ?? []);
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao carregar contas a pagar";
      setError(message);
      console.error("Erro useContasPagar:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create conta
  const createConta = useCallback(async (novaConta: Omit<ContaPagar,"id" |"created_at" |"updated_at" |"empresa_id">) => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from("contas_pagar")
        .insert([novaConta])
        .select()
        .single();

      if (createError) throw createError;
      return data as ContaPagar;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao criar conta a pagar";
      setError(message);
      console.error("Erro createConta:", err);
      return null;
    }
  }, []);

  // Update conta
  const updateConta = useCallback(async (id: string, updates: Partial<ContaPagar>) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from("contas_pagar")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as ContaPagar;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao atualizar conta a pagar";
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
        .from("contas_pagar")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao excluir conta a pagar";
      setError(message);
      console.error("Erro deleteConta:", err);
      return false;
    }
  }, []);

  // Aprovar conta
  const aprovarConta = useCallback(async (
    id: string,
    nivel: 1 | 2 | 3,
    aprovadorId: string,
    aprovadorNome: string,
    observacao?: string
  ) => {
    try {
      setError(null);

      const { data: contaAtual, error: fetchError } = await supabase
        .from("contas_pagar")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const aprovacao = {
        aprovador_id: aprovadorId,
        aprovador_nome: aprovadorNome,
        data_aprovacao: new Date().toISOString(),
        observacao,
      };

      const updates: Partial<ContaPagar> = {
        [`aprovacao_nivel${nivel}`]: aprovacao,
      };

      // Se é última aprovação, mudar status
      if (nivel === 3 || !(contaAtual as ContaPagar).requer_aprovacao) {
        updates.status ="aprovada";
      }

      const { data, error: updateError } = await supabase
        .from("contas_pagar")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as ContaPagar;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao aprovar conta";
      setError(message);
      console.error("Erro aprovarConta:", err);
      return null;
    }
  }, []);

  // Agendar pagamento
  const agendarPagamento = useCallback(async (
    id: string,
    dataAgendamento: string,
    formaPagamento: string,
    bancoId: string
  ) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from("contas_pagar")
        .update({
          status:"agendado",
          data_agendamento: dataAgendamento,
          forma_pagamento: formaPagamento,
          banco_pagamento: bancoId,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as ContaPagar;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao agendar pagamento";
      setError(message);
      console.error("Erro agendarPagamento:", err);
      return null;
    }
  }, []);

  // Pagar conta
  const pagarConta = useCallback(async (
    id: string,
    dataPagamento: string,
    valorPago: number,
    formaPagamento: string,
    comprovante?: string
  ) => {
    try {
      setError(null);

      const { data: contaAtual, error: fetchError } = await supabase
        .from("contas_pagar")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const conta = contaAtual as ContaPagar;
      const novoValorPago = conta.valor_pago + valorPago;
      const valorLiquido = conta.valor_original - novoValorPago;

      const historicoAtualizado = [
        ...(conta.historico_pagamentos || []),
        {
          data: dataPagamento,
          valor: valorPago,
          forma_pagamento: formaPagamento,
        },
      ];

      const { data, error: updateError } = await supabase
        .from("contas_pagar")
        .update({
          valor_pago: novoValorPago,
          valor_liquido: valorLiquido,
          status:"pago",
          data_pagamento: dataPagamento,
          comprovante_url: comprovante,
          historico_pagamentos: historicoAtualizado,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as ContaPagar;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao pagar conta";
      setError(message);
      console.error("Erro pagarConta:", err);
      return null;
    }
  }, []);

  // Get resumo
  const getResumo = useCallback(async () => {
    try {
      setError(null);
      const { data, error: resumoError } = await supabase
        .rpc("contas_pagar_resumo");
 
       if (resumoError) throw resumoError;
       return data as ContasPagarResumo;
     } catch (error) {
   const err = error as Error;
       const message = err instanceof Error ? err.message :"Erro ao carregar resumo de contas a pagar";
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
         prazo_medio_pagamento: 0,
         pendentes_aprovacao: contas.filter((conta) => conta.requer_aprovacao).length,
       } satisfies ContasPagarResumo;
     }
   }, [contas]);

  // Setup Realtime
  useEffect(() => {
    fetchContas();

    const channel = supabase
      .channel("contas_pagar_changes")
      .on("postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"contas_pagar",
        },
        (payload) => {
          console.log("Realtime contas_pagar:", payload);
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
    aprovarConta,
    agendarPagamento,
    pagarConta,
    getResumo,
  };
}

