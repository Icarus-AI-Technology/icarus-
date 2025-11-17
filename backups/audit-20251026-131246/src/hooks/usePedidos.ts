/**
 * Hook: usePedidos
 * Gerenciamento de pedidos de compra com Supabase
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Pedido {
  id: string;
  numero_pedido: string;
  fornecedor_id: string;
  data_pedido: string;
  data_entrega_prevista?: string;
  data_entrega_real?: string;
  status:
    | "rascunho"
    | "enviado"
    | "aprovado"
    | "em_transito"
    | "entregue"
    | "cancelado";
  valor_total: number;
  desconto?: number;
  valor_frete?: number;
  observacoes?: string;
  aprovado_por?: string;
  data_aprovacao?: string;
  created_at: string;
  updated_at: string;
}

interface PedidosState {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
}

export function usePedidos() {
  const [state, setState] = useState<PedidosState>({
    pedidos: [],
    loading: true,
    error: null,
  });

  const fetchPedidos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("pedidos_compra")
        .select("*")
        .order("data_pedido", { ascending: false });

      if (error) throw error;

      setState({
        pedidos: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Erro ao carregar pedidos",
      }));
    }
  }, []);

  const getPedidoById = useCallback(
    async (id: string): Promise<Pedido | null> => {
      try {
        const { data, error } = await supabase
          .from("pedidos_compra")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar pedido:", err);
        return null;
      }
    },
    [],
  );

  const createPedido = useCallback(
    async (
      pedido: Omit<Pedido, "id" | "created_at" | "updated_at">,
    ): Promise<Pedido | null> => {
      try {
        const { data, error } = await supabase
          .from("pedidos_compra")
          .insert([pedido])
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          pedidos: [data, ...prev.pedidos],
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao criar pedido",
        }));
        return null;
      }
    },
    [],
  );

  const updatePedido = useCallback(
    async (id: string, updates: Partial<Pedido>): Promise<Pedido | null> => {
      try {
        const { data, error } = await supabase
          .from("pedidos_compra")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          pedidos: prev.pedidos.map((p) => (p.id === id ? data : p)),
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao atualizar pedido",
        }));
        return null;
      }
    },
    [],
  );

  const deletePedido = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("pedidos_compra")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Atualizar lista local
      setState((prev) => ({
        ...prev,
        pedidos: prev.pedidos.filter((p) => p.id !== id),
      }));

      return true;
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Erro ao deletar pedido",
      }));
      return false;
    }
  }, []);

  const getPedidosByStatus = useCallback(async (status: Pedido["status"]) => {
    try {
      const { data, error } = await supabase
        .from("pedidos_compra")
        .select("*")
        .eq("status", status)
        .order("data_pedido", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar pedidos por status:", err);
      return [];
    }
  }, []);

  const getPedidosByFornecedor = useCallback(async (fornecedor_id: string) => {
    try {
      const { data, error } = await supabase
        .from("pedidos_compra")
        .select("*")
        .eq("fornecedor_id", fornecedor_id)
        .order("data_pedido", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar pedidos por fornecedor:", err);
      return [];
    }
  }, []);

  const getPedidosByPeriodo = useCallback(
    async (dataInicio: string, dataFim: string) => {
      try {
        const { data, error } = await supabase
          .from("pedidos_compra")
          .select("*")
          .gte("data_pedido", dataInicio)
          .lte("data_pedido", dataFim)
          .order("data_pedido", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar pedidos por período:", err);
        return [];
      }
    },
    [],
  );

  const aprovarPedido = useCallback(
    async (id: string, aprovadoPor: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("pedidos_compra")
          .update({
            status: "aprovado",
            aprovado_por: aprovadoPor,
            data_aprovacao: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // Re-fetch para atualizar
        await fetchPedidos();
        return true;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao aprovar pedido",
        }));
        return false;
      }
    },
    [fetchPedidos],
  );

  const cancelarPedido = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("pedidos_compra")
          .update({ status: "cancelado" })
          .eq("id", id);

        if (error) throw error;

        // Re-fetch para atualizar
        await fetchPedidos();
        return true;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao cancelar pedido",
        }));
        return false;
      }
    },
    [fetchPedidos],
  );

  const getResumoPedidos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos_compra")
        .select("status, valor_total");

      if (error) throw error;

      const totalPedidos = data.length;
      const valorTotal = data.reduce((sum, p) => sum + p.valor_total, 0);

      const aguardandoAprovacao = data.filter(
        (p) => p.status === "enviado",
      ).length;
      const emAndamento = data.filter((p) =>
        ["aprovado", "em_transito"].includes(p.status),
      ).length;
      const entregues = data.filter((p) => p.status === "entregue").length;

      return {
        totalPedidos,
        valorTotal,
        aguardandoAprovacao,
        emAndamento,
        entregues,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao calcular resumo de pedidos:", err);
      return {
        totalPedidos: 0,
        valorTotal: 0,
        aguardandoAprovacao: 0,
        emAndamento: 0,
        entregues: 0,
      };
    }
  }, []);

  const countByStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos_compra")
        .select("status");

      if (error) throw error;

      const counts = data.reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return counts;
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao contar pedidos:", err);
      return {};
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchPedidos();

    const channel = supabase
      .channel("pedidos_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos_compra" },
        (payload) => {
          console.log("Pedido change received!", payload);
          fetchPedidos(); // Re-fetch on any change
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPedidos]);

  return {
    ...state,
    fetchPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido,
    getPedidosByStatus,
    getPedidosByFornecedor,
    getPedidosByPeriodo,
    aprovarPedido,
    cancelarPedido,
    getResumoPedidos,
    countByStatus,
  };
}
