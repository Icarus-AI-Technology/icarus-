/**
 * Hook: useTransacoes
 * Gerenciamento de transações financeiras com Supabase
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Transacao {
  id: string;
  tipo: "receita" | "despesa";
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: "pendente" | "aprovada" | "paga" | "cancelada";
  forma_pagamento?: string;
  observacoes?: string;
  medico_id?: string;
  hospital_id?: string;
  cirurgia_id?: string;
  anexo_url?: string;
  created_at: string;
  updated_at: string;
}

interface TransacoesState {
  transacoes: Transacao[];
  loading: boolean;
  error: string | null;
}

export function useTransacoes() {
  const [state, setState] = useState<TransacoesState>({
    transacoes: [],
    loading: true,
    error: null,
  });

  const fetchTransacoes = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .order("data", { ascending: false });

      if (error) throw error;

      setState({
        transacoes: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao carregar transações",
      }));
    }
  }, []);

  const getTransacaoById = useCallback(
    async (id: string): Promise<Transacao | null> => {
      try {
        const { data, error } = await supabase
          .from("transacoes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar transação:", err);
        return null;
      }
    },
    [],
  );

  const createTransacao = useCallback(
    async (
      transacao: Omit<Transacao, "id" | "created_at" | "updated_at">,
    ): Promise<Transacao | null> => {
      try {
        const { data, error } = await supabase
          .from("transacoes")
          .insert([transacao])
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          transacoes: [data, ...prev.transacoes],
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao criar transação",
        }));
        return null;
      }
    },
    [],
  );

  const updateTransacao = useCallback(
    async (
      id: string,
      updates: Partial<Transacao>,
    ): Promise<Transacao | null> => {
      try {
        const { data, error } = await supabase
          .from("transacoes")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          transacoes: prev.transacoes.map((t) => (t.id === id ? data : t)),
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao atualizar transação",
        }));
        return null;
      }
    },
    [],
  );

  const deleteTransacao = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("transacoes").delete().eq("id", id);

      if (error) throw error;

      // Atualizar lista local
      setState((prev) => ({
        ...prev,
        transacoes: prev.transacoes.filter((t) => t.id !== id),
      }));

      return true;
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Erro ao deletar transação",
      }));
      return false;
    }
  }, []);

  const getTransacoesByTipo = useCallback(async (tipo: Transacao["tipo"]) => {
    try {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("tipo", tipo)
        .order("data", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar transações por tipo:", err);
      return [];
    }
  }, []);

  const getTransacoesByStatus = useCallback(
    async (status: Transacao["status"]) => {
      try {
        const { data, error } = await supabase
          .from("transacoes")
          .select("*")
          .eq("status", status)
          .order("data", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar transações por status:", err);
        return [];
      }
    },
    [],
  );

  const getTransacoesByPeriodo = useCallback(
    async (dataInicio: string, dataFim: string) => {
      try {
        const { data, error } = await supabase
          .from("transacoes")
          .select("*")
          .gte("data", dataInicio)
          .lte("data", dataFim)
          .order("data", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar transações por período:", err);
        return [];
      }
    },
    [],
  );

  const getResumoFinanceiro = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("transacoes")
        .select("tipo, valor, status");

      if (error) throw error;

      const receitas = data
        .filter((t) => t.tipo === "receita" && t.status === "paga")
        .reduce((sum, t) => sum + t.valor, 0);

      const despesas = data
        .filter((t) => t.tipo === "despesa" && t.status === "paga")
        .reduce((sum, t) => sum + t.valor, 0);

      const pendentes = data
        .filter((t) => t.status === "pendente")
        .reduce((sum, t) => sum + t.valor, 0);

      const saldo = receitas - despesas;

      return {
        receitas,
        despesas,
        saldo,
        pendentes,
        totalTransacoes: data.length,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao calcular resumo financeiro:", err);
      return {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        pendentes: 0,
        totalTransacoes: 0,
      };
    }
  }, []);

  const countByStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("transacoes")
        .select("status");

      if (error) throw error;

      const counts = data.reduce(
        (acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return counts;
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao contar transações:", err);
      return {};
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchTransacoes();

    const channel = supabase
      .channel("transacoes_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transacoes" },
        (payload) => {
          console.log("Transação change received!", payload);
          fetchTransacoes(); // Re-fetch on any change
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransacoes]);

  return {
    ...state,
    fetchTransacoes,
    getTransacaoById,
    createTransacao,
    updateTransacao,
    deleteTransacao,
    getTransacoesByTipo,
    getTransacoesByStatus,
    getTransacoesByPeriodo,
    getResumoFinanceiro,
    countByStatus,
  };
}
