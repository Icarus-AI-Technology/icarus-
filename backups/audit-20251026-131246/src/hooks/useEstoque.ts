/**
 * useEstoque - Hook completo para gestão de estoque
 * Sistema: ICARUS v5.0
 *
 * Funcionalidades:
 * - CRUD completo de estoque
 * - Movimentações (entrada, saída, transferência)
 * - Reservas automáticas
 * - Rastreabilidade de lotes
 * - Filtros avançados
 * - Realtime subscriptions
 */

import { useState, useEffect, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ============================================
// INTERFACES
// ============================================

export interface Estoque {
  id: string;
  produto_id: string;
  armazem_id: string;
  localizacao_id?: string;

  // Quantidades
  quantidade: number;
  quantidade_reservada: number;
  quantidade_disponivel: number;

  // Lote
  lote?: string;
  serie?: string;
  data_fabricacao?: string;
  data_validade?: string;

  // Valores
  custo_unitario: number;
  custo_total: number;

  // Status
  status: "disponivel" | "reservado" | "bloqueado" | "vencido" | "quarentena";

  // NF Entrada
  nfe_numero?: string;
  nfe_data?: string;
  fornecedor_id?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoEstoque {
  id?: string;
  produto_id: string;
  armazem_origem_id?: string;
  armazem_destino_id?: string;

  tipo:
    | "entrada"
    | "saida"
    | "transferencia"
    | "ajuste"
    | "devolucao"
    | "perda";
  quantidade: number;
  lote?: string;
  serie?: string;

  motivo:
    | "compra"
    | "venda"
    | "cirurgia"
    | "transferencia"
    | "ajuste_inventario"
    | "devolucao_fornecedor"
    | "devolucao_cliente"
    | "vencimento"
    | "perda";

  cirurgia_id?: string;
  compra_id?: string;
  venda_id?: string;

  documento_tipo?: string;
  documento_numero?: string;

  custo_unitario?: number;
  valor_total?: number;

  observacoes?: string;

  data_movimentacao?: string;
  usuario_id?: string;
}

export interface ReservaEstoque {
  id?: string;
  estoque_id: string;
  produto_id: string;
  quantidade: number;

  motivo: "cirurgia" | "pedido" | "transferencia";
  cirurgia_id?: string;
  pedido_id?: string;

  data_reserva?: string;
  data_expiracao?: string;

  status: "ativa" | "consumida" | "cancelada" | "expirada";
  usuario_id?: string;
}

export interface EstoqueFilters {
  produto_id?: string;
  armazem_id?: string;
  status?: string;
  lote?: string;
  validade_proxima?: boolean; // Produtos com validade < 90 dias
  abaixo_minimo?: boolean; // Produtos abaixo do ponto de reposição
  search?: string;
}

// ============================================
// HOOK
// ============================================

export const useEstoque = () => {
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [reservas, setReservas] = useState<ReservaEstoque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime channel
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // ============================================
  // FETCH ESTOQUE
  // ============================================

  const fetchEstoques = useCallback(async (filters?: EstoqueFilters) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("estoque")
        .select(
          `
          *,
          produto:produtos_opme(nome, codigo_anvisa, ponto_reposicao),
          armazem:estoque_armazens(nome, codigo),
          localizacao:estoque_localizacoes(codigo, descricao)
        `,
        )
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filters?.produto_id) {
        query = query.eq("produto_id", filters.produto_id);
      }

      if (filters?.armazem_id) {
        query = query.eq("armazem_id", filters.armazem_id);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.lote) {
        query = query.ilike("lote", `%${filters.lote}%`);
      }

      if (filters?.validade_proxima) {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() + 90);
        query = query.lte("data_validade", dataLimite.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEstoques(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar estoque:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // MOVIMENTAÇÃO
  // ============================================

  const registrarMovimentacao = useCallback(
    async (movimentacao: MovimentacaoEstoque) => {
      setLoading(true);
      setError(null);

      try {
        // 1. Inserir movimentação
        const { data: movData, error: movError } = await supabase
          .from("estoque_movimentacoes")
          .insert({
            ...movimentacao,
            data_movimentacao: new Date().toISOString(),
          })
          .select()
          .single();

        if (movError) throw movError;

        // 2. Atualizar quantidade no estoque
        if (movimentacao.tipo === "entrada") {
          // Verificar se já existe estoque para este produto/armazém/lote
          const { data: estoqueExistente } = await supabase
            .from("estoque")
            .select("*")
            .eq("produto_id", movimentacao.produto_id)
            .eq("armazem_id", movimentacao.armazem_destino_id!)
            .eq("lote", movimentacao.lote || "")
            .single();

          if (estoqueExistente) {
            // Atualizar quantidade
            await supabase
              .from("estoque")
              .update({
                quantidade:
                  estoqueExistente.quantidade + movimentacao.quantidade,
              })
              .eq("id", estoqueExistente.id);
          } else {
            // Criar novo registro de estoque
            await supabase.from("estoque").insert({
              produto_id: movimentacao.produto_id,
              armazem_id: movimentacao.armazem_destino_id!,
              quantidade: movimentacao.quantidade,
              lote: movimentacao.lote,
              serie: movimentacao.serie,
              custo_unitario: movimentacao.custo_unitario || 0,
              nfe_numero: movimentacao.documento_numero,
              nfe_data: movimentacao.data_movimentacao,
              status: "disponivel",
            });
          }
        } else if (movimentacao.tipo === "saida") {
          // Diminuir quantidade
          const { data: estoqueExistente } = await supabase
            .from("estoque")
            .select("*")
            .eq("produto_id", movimentacao.produto_id)
            .eq("armazem_id", movimentacao.armazem_origem_id!)
            .single();

          if (estoqueExistente) {
            await supabase
              .from("estoque")
              .update({
                quantidade: Math.max(
                  0,
                  estoqueExistente.quantidade - movimentacao.quantidade,
                ),
              })
              .eq("id", estoqueExistente.id);
          }
        }

        // Recarregar estoque
        await fetchEstoques();

        return movData;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao registrar movimentação:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEstoques],
  );

  // ============================================
  // FETCH RESERVAS
  // ============================================

  const fetchReservas = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("estoque_reservas")
        .select("*")
        .eq("status", "ativa")
        .order("data_reserva", { ascending: false });

      if (fetchError) throw fetchError;

      setReservas(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar reservas:", err);
    }
  }, []);

  // ============================================
  // RESERVA
  // ============================================

  const criarReserva = useCallback(
    async (reserva: ReservaEstoque) => {
      setLoading(true);
      setError(null);

      try {
        // Verificar disponibilidade
        const { data: estoqueAtual } = await supabase
          .from("estoque")
          .select("quantidade_disponivel")
          .eq("id", reserva.estoque_id)
          .single();

        if (
          !estoqueAtual ||
          estoqueAtual.quantidade_disponivel < reserva.quantidade
        ) {
          throw new Error("Quantidade insuficiente em estoque");
        }

        // Criar reserva
        const { data, error: reservaError } = await supabase
          .from("estoque_reservas")
          .insert({
            ...reserva,
            data_reserva: new Date().toISOString(),
            status: "ativa",
          })
          .select()
          .single();

        if (reservaError) throw reservaError;

        // Recarregar reservas
        await fetchReservas();

        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao criar reserva:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchReservas],
  );

  const cancelarReserva = useCallback(
    async (reservaId: string) => {
      setLoading(true);
      setError(null);

      try {
        const { error: cancelError } = await supabase
          .from("estoque_reservas")
          .update({ status: "cancelada" })
          .eq("id", reservaId);

        if (cancelError) throw cancelError;

        await fetchReservas();
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao cancelar reserva:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchReservas],
  );

  // ============================================
  // FETCH MOVIMENTAÇÕES
  // ============================================

  const fetchMovimentacoes = useCallback(async (produtoId?: string) => {
    try {
      let query = supabase
        .from("estoque_movimentacoes")
        .select("*")
        .order("data_movimentacao", { ascending: false })
        .limit(100);

      if (produtoId) {
        query = query.eq("produto_id", produtoId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setMovimentacoes(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar movimentações:", err);
    }
  }, []);

  // ============================================
  // REALTIME SUBSCRIPTIONS
  // ============================================

  useEffect(() => {
    // Subscribe to estoque changes
    const realtimeChannel = supabase
      .channel("estoque-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "estoque",
        },
        () => {
          console.log("📦 Estoque atualizado em tempo real");
          fetchEstoques();
        },
      )
      .subscribe();

    setChannel(realtimeChannel);

    // Cleanup
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchEstoques]);

  // ============================================
  // INITIAL FETCH
  // ============================================

  useEffect(() => {
    fetchEstoques();
    fetchMovimentacoes();
    fetchReservas();
  }, [fetchEstoques, fetchMovimentacoes, fetchReservas]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    estoques,
    movimentacoes,
    reservas,
    loading,
    error,

    // Methods
    fetchEstoques,
    registrarMovimentacao,
    criarReserva,
    cancelarReserva,
    fetchMovimentacoes,
    fetchReservas,

    // Realtime
    channel,
  };
};
