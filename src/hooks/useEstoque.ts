/**
 * Hook: useEstoque
 * Gerenciamento de estoque com IA
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ItemEstoque {
  id: string;
  empresa_id: string;
  produto_id: string;
  produto?: {
    id: string;
    codigo: string;
    nome: string;
    unidade: string;
  };
  quantidade: number;
  estoque_minimo: number;
  estoque_maximo: number;
  ponto_reposicao: number;
  localizacao?: string;
  lote?: string;
  validade?: string;
  valor_unitario: number;
  status: "disponivel" | "reservado" | "baixo" | "critico" | "vencido";
  ultima_movimentacao?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface MovimentacaoEstoque {
  id: string;
  empresa_id: string;
  produto_id: string;
  tipo: "entrada" | "saida" | "ajuste" | "transferencia";
  quantidade: number;
  motivo: string;
  documento?: string;
  usuario_id: string;
  criado_em: string;
}

export function useEstoque() {
  const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEstoque();
    fetchMovimentacoes();

    // Setup Realtime subscription
    const channel: RealtimeChannel = supabase
      .channel("estoque-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "estoque",
        },
        (payload) => {
          console.log("[useEstoque] Realtime event:", payload);
          handleRealtimeEvent(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchEstoque() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("estoque")
        .select(
          `
          *,
          produto:produtos(id, codigo, nome, unidade)
        `,
        )
        .order("produto_id");

      if (fetchError) throw fetchError;
      setEstoque(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estoque");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMovimentacoes() {
    try {
      const { data, error: fetchError } = await supabase
        .from("movimentacoes_estoque")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setMovimentacoes(data || []);
    } catch (err) {
      console.error("Erro ao carregar movimentações:", err);
    }
  }

  function handleRealtimeEvent(payload: unknown) {
    const event = payload as {
      eventType: string;
      new: ItemEstoque;
      old: ItemEstoque;
    };

    switch (event.eventType) {
      case "INSERT":
        setEstoque((prev) => [...prev, event.new]);
        break;
      case "UPDATE":
        setEstoque((prev) =>
          prev.map((item) => (item.id === event.new.id ? event.new : item)),
        );
        break;
      case "DELETE":
        setEstoque((prev) => prev.filter((item) => item.id !== event.old.id));
        break;
    }
  }

  async function movimentar(
    movimentacao: Omit<MovimentacaoEstoque, "id" | "criado_em">,
  ) {
    try {
      const { data, error: movError } = await supabase
        .from("movimentacoes_estoque")
        .insert([movimentacao])
        .select()
        .single();

      if (movError) throw movError;

      await fetchEstoque();
      await fetchMovimentacoes();

      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao movimentar estoque",
      );
    }
  }

  async function ajustarEstoque(
    produtoId: string,
    novaQuantidade: number,
    motivo: string,
  ) {
    try {
      const item = estoque.find((e) => e.produto_id === produtoId);
      if (!item) throw new Error("Item não encontrado no estoque");

      const diferenca = novaQuantidade - item.quantidade;

      await movimentar({
        empresa_id: item.empresa_id,
        produto_id: produtoId,
        tipo: "ajuste",
        quantidade: Math.abs(diferenca),
        motivo,
        usuario_id: "current-user", // TODO: Get from auth context
      });

      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao ajustar estoque",
      );
    }
  }

  async function entrada(
    produtoId: string,
    quantidade: number,
    documento: string,
    motivo: string,
  ) {
    const item = estoque.find((e) => e.produto_id === produtoId);
    if (!item) throw new Error("Item não encontrado");

    return movimentar({
      empresa_id: item.empresa_id,
      produto_id: produtoId,
      tipo: "entrada",
      quantidade,
      motivo,
      documento,
      usuario_id: "current-user",
    });
  }

  async function saida(
    produtoId: string,
    quantidade: number,
    motivo: string,
    documento?: string,
  ) {
    const item = estoque.find((e) => e.produto_id === produtoId);
    if (!item) throw new Error("Item não encontrado");

    if (item.quantidade < quantidade) {
      throw new Error("Quantidade insuficiente em estoque");
    }

    return movimentar({
      empresa_id: item.empresa_id,
      produto_id: produtoId,
      tipo: "saida",
      quantidade,
      motivo,
      documento,
      usuario_id: "current-user",
    });
  }

  // Análise de estoque
  const estatisticas = {
    total: estoque.length,
    baixo: estoque.filter((e) => e.quantidade < e.estoque_minimo).length,
    critico: estoque.filter((e) => e.quantidade === 0).length,
    valorTotal: estoque.reduce(
      (sum, e) => sum + e.quantidade * e.valor_unitario,
      0,
    ),
  };

  return {
    estoque,
    movimentacoes,
    loading,
    error,
    estatisticas,
    movimentar,
    ajustarEstoque,
    entrada,
    saida,
    refresh: fetchEstoque,
  };
}
