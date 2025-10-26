/**
 * Hook: useCentroCustos
 * Gestão de Centros de Custo com Rateio e Realizado vs Orçado
 * 
 * FUNCIONALIDADES:
 * - CRUD centros de custo
 * - Orçamento por centro de custo
 * - Realizado vs Orçado (variação)
 * - Rateio de despesas
 * - Hierarquia de centros de custo
 * - Realtime subscriptions
 */

import { useState, useEffect, useCallback } from"react";
import { supabase } from"@/lib/supabase";

export interface CentroCusto {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  
  // Identificação
  codigo: string;
  nome: string;
  descricao?: string;
  
  // Hierarquia
  centro_pai_id?: string;
  centro_pai_nome?: string;
  nivel: number; // 1, 2, 3... (hierarquia)
  
  // Responsável
  responsavel_id?: string;
  responsavel_nome?: string;
  
  // Orçamento
  orcamento_mensal: number;
  orcamento_anual: number;
  
  // Status
  status:"ativo" |"inativo" |"suspenso"; // Adicionado para FinanceiroAvancado
  ativo: boolean;
  
  // Tipo
  tipo:"operacional" |"administrativo" |"comercial" |"financeiro" |"outro";
  
  // Classificação
  categoria: string;
  tags?: string[];
  
  // Observações
  observacoes?: string;
}

export interface CentroCustoRealizado {
  centro_custo_id: string;
  centro_custo_nome: string;
  periodo: string; // YYYY-MM
  
  // Valores
  orcamento: number;
  realizado: number;
  variacao: number; // realizado - orcamento
  percentual_utilizado: number; // (realizado / orcamento) * 100
  
  // Detalhamento
  quantidade_transacoes: number;
  ticket_medio: number;
  
  // Status
  status:"dentro_orcamento" |"acima_orcamento" |"sem_orcamento";
}

interface CentroCustosFilters {
  ativo?: boolean;
  tipo?: CentroCusto["tipo"];
  centro_pai_id?: string;
  nivel?: number;
}

interface CentroCustosResumo {
  total_centros: number;
  total_orcamento_mensal: number;
  total_orcamento_anual: number;
  total_realizado_mes: number;
  variacao_mes: number;
  percentual_utilizado: number;
  centros_acima_orcamento: number;
}

export function useCentroCustos() {
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch centros
  const fetchCentros = useCallback(async (filters?: CentroCustosFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("centro_custos")
        .select("*")
        .order("codigo", { ascending: true });

      // Aplicar filtros
      if (filters?.ativo !== undefined) {
        query = query.eq("ativo", filters.ativo);
      }
      if (filters?.tipo) {
        query = query.eq("tipo", filters.tipo);
      }
      if (filters?.centro_pai_id) {
        query = query.eq("centro_pai_id", filters.centro_pai_id);
      }
      if (filters?.nivel) {
        query = query.eq("nivel", filters.nivel);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setCentros((data as CentroCusto[]) || []);
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao carregar centros de custo";
      setError(message);
      console.error("Erro useCentroCustos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create centro
  const createCentro = useCallback(async (novoCentro: Omit<CentroCusto,"id" |"created_at" |"updated_at" |"empresa_id">) => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from("centro_custos")
        .insert([novoCentro])
        .select()
        .single();

      if (createError) throw createError;
      return data as CentroCusto;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao criar centro de custo";
      setError(message);
      console.error("Erro createCentro:", err);
      return null;
    }
  }, []);

  // Update centro
  const updateCentro = useCallback(async (id: string, updates: Partial<CentroCusto>) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from("centro_custos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as CentroCusto;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao atualizar centro de custo";
      setError(message);
      console.error("Erro updateCentro:", err);
      return null;
    }
  }, []);

  // Delete centro
  const deleteCentro = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from("centro_custos")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
   const err = error as Error;
      const message = err instanceof Error ? err.message :"Erro ao excluir centro de custo";
      setError(message);
      console.error("Erro deleteCentro:", err);
      return false;
    }
  }, []);

  // Get realizado por centro
  const getRealizadoPorCentro = useCallback(async (
    centroCustoId: string,
    periodo: string // YYYY-MM
  ): Promise<CentroCustoRealizado | null> => {
    try {
      // Buscar centro
      const { data: centro, error: centroError } = await supabase
        .from("centro_custos")
        .select("*")
        .eq("id", centroCustoId)
        .single();

      if (centroError) throw centroError;

      const centroDados = centro as CentroCusto;

      // Buscar despesas do período
      const [ano, mes] = periodo.split("-");
      const dataInicio = `${ano}-${mes}-01`;
      const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
      const dataFim = `${ano}-${mes}-${ultimoDia}`;

      const { data: despesas, error: despesasError } = await supabase
        .from("contas_pagar")
        .select("valor_original")
        .eq("centro_custo_id", centroCustoId)
        .gte("data_emissao", dataInicio)
        .lte("data_emissao", dataFim);

      if (despesasError) throw despesasError;

      const totalRealizado = ((despesas as Array<{ valor_original: number }> | null) ?? []).reduce(
        (sum, d) => sum + (d.valor_original ?? 0),
        0
      );

      const orcamento = centroDados.orcamento_mensal;
      const variacao = totalRealizado - orcamento;
      const percentualUtilizado = orcamento > 0 ? (totalRealizado / orcamento) * 100 : 0;

      let status: CentroCustoRealizado["status"] ="dentro_orcamento";
      if (orcamento === 0) {
        status ="sem_orcamento";
      } else if (totalRealizado > orcamento) {
        status ="acima_orcamento";
      }

      return {
        centro_custo_id: centroDados.id,
        centro_custo_nome: centroDados.nome,
        periodo,
        orcamento,
        realizado: totalRealizado,
        variacao,
        percentual_utilizado: percentualUtilizado,
        quantidade_transacoes: despesas?.length ?? 0,
        ticket_medio: despesas && despesas.length > 0 ? totalRealizado / despesas.length : 0,
        status,
      };
    } catch (error) {
   const err = error as Error;
      console.error("Erro getRealizadoPorCentro:", err);
      return null;
    }
  }, []);

  // Get todos realizados (período)
  const getTodosRealizados = useCallback(async (periodo: string): Promise<CentroCustoRealizado[]> => {
    try {
      const { data: centrosAtivos } = await supabase
        .from("centro_custos")
        .select("*")
        .eq("ativo", true);

      if (!centrosAtivos) return [];

      const realizados: CentroCustoRealizado[] = [];
      for (const centro of centrosAtivos) {
        const realizado = await getRealizadoPorCentro(centro.id, periodo);
        if (realizado) {
          realizados.push(realizado);
        }
      }

      return realizados;
    } catch (error) {
   const err = error as Error;
      console.error("Erro getTodosRealizados:", err);
      return [];
    }
  }, [getRealizadoPorCentro]);

  // Get resumo
  const getResumo = useCallback(async (): Promise<CentroCustosResumo> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("centro_custos")
        .select("*")
        .eq("ativo", true);

      if (fetchError) throw fetchError;

      const centrosData = (data as CentroCusto[]) || [];
      const totalCentros = centrosData.length;
      const totalOrcamentoMensal = centrosData.reduce((sum, c) => sum + c.orcamento_mensal, 0);
      const totalOrcamentoAnual = centrosData.reduce((sum, c) => sum + c.orcamento_anual, 0);

      // Calcular realizado do mês atual
      const hoje = new Date();
      const periodoAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2,"0")}`;
      const realizados = await getTodosRealizados(periodoAtual);

      const totalRealizadoMes = realizados.reduce((sum, r) => sum + r.realizado, 0);
      const variacaoMes = totalRealizadoMes - totalOrcamentoMensal;
      const percentualUtilizado = totalOrcamentoMensal > 0
        ? (totalRealizadoMes / totalOrcamentoMensal) * 100
        : 0;

      const centrosAcimaOrcamento = realizados.filter((r) => r.status ==="acima_orcamento").length;

      return {
        total_centros: totalCentros,
        total_orcamento_mensal: totalOrcamentoMensal,
        total_orcamento_anual: totalOrcamentoAnual,
        total_realizado_mes: totalRealizadoMes,
        variacao_mes: variacaoMes,
        percentual_utilizado: percentualUtilizado,
        centros_acima_orcamento: centrosAcimaOrcamento,
      };
    } catch (error) {
   const err = error as Error;
      console.error("Erro getResumo:", err);
      return {
        total_centros: 0,
        total_orcamento_mensal: 0,
        total_orcamento_anual: 0,
        total_realizado_mes: 0,
        variacao_mes: 0,
        percentual_utilizado: 0,
        centros_acima_orcamento: 0,
      };
    }
  }, [getTodosRealizados]);

  // Get hierarquia (árvore de centros)
  const getHierarquia = useCallback(async (): Promise<CentroCusto[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("centro_custos")
        .select("*")
        .eq("ativo", true)
        .order("nivel", { ascending: true })
        .order("codigo", { ascending: true });

      if (fetchError) throw fetchError;
      return (data as CentroCusto[]) || [];
    } catch (error) {
   const err = error as Error;
      console.error("Erro getHierarquia:", err);
      return [];
    }
  }, []);

  // Setup Realtime
  useEffect(() => {
    fetchCentros();

    const channel = supabase
      .channel("centro_custos_changes")
      .on("postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"centro_custos",
        },
        () => {
          fetchCentros();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCentros]);

  return {
    centros,
    loading,
    error,
    fetchCentros,
    createCentro,
    updateCentro,
    deleteCentro,
    getRealizadoPorCentro,
    getTodosRealizados,
    getResumo,
    getHierarquia,
  };
}

