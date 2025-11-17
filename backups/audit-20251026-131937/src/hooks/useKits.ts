import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Hook para Kits de Consignação
 * Tabela: kits + itens_kit
 */

export interface Kit {
  id: string;
  empresa_id: string;
  cirurgia_id?: string;
  hospital_id: string;
  codigo_kit: string;
  status: "montagem" | "enviado" | "em_uso" | "devolvido" | "faturado";
  data_envio?: string;
  data_devolucao?: string;
  valor_total: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemKit {
  id: string;
  kit_id: string;
  produto_id: string;
  lote_id?: string;
  quantidade: number;
  utilizado: boolean;
  created_at?: string;
}

export const useKits = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Realtime subscription
  const handleError = useCallback((err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback;
    setError(message);
  }, []);

  const fetchKits = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("kits")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setKits((data as Kit[] | null) ?? []);
      setError(null);
    } catch (error) {
      const err = error as Error;
      handleError(err, "Erro ao carregar kits");
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchKits().catch((err: unknown) =>
      handleError(err, "Erro ao carregar kits"),
    );

    const subscription = supabase
      .channel("kits-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kits",
        },
        () => {
          fetchKits().catch((err: unknown) =>
            handleError(err, "Erro ao atualizar kits"),
          );
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchKits, handleError]);

  const criarKit = async (kit: Omit<Kit, "id">) => {
    try {
      const { data, error } = await supabase
        .from("kits")
        .insert(kit)
        .select()
        .single();

      if (error) throw error;

      return data as Kit;
    } catch (error) {
      const err = error as Error;
      handleError(err, "Erro ao criar kit");
      throw err;
    }
  };

  const atualizarKit = async (id: string, updates: Partial<Kit>) => {
    try {
      const { error } = await supabase
        .from("kits")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchKits();
    } catch (error) {
      const err = error as Error;
      handleError(err, "Erro ao atualizar kit");
      throw err;
    }
  };

  const adicionarItemKit = async (item: Omit<ItemKit, "id">) => {
    try {
      const { data, error } = await supabase
        .from("itens_kit")
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      return data as ItemKit;
    } catch (error) {
      const err = error as Error;
      handleError(err, "Erro ao adicionar item ao kit");
      throw err;
    }
  };

  const buscarItensKit = async (kitId: string) => {
    try {
      const { data, error } = await supabase
        .from("itens_kit")
        .select(
          `
          *,
          produto:produtos(*),
          lote:lotes(*)
        `,
        )
        .eq("kit_id", kitId);

      if (error) throw error;

      return (data as ItemKit[] | null) ?? [];
    } catch (error) {
      const err = error as Error;
      handleError(err, "Erro ao buscar itens do kit");
      throw err as PostgrestError;
    }
  };

  const enviarKit = async (id: string, dataEnvio: string) => {
    return atualizarKit(id, { status: "enviado", data_envio: dataEnvio });
  };

  const devolverKit = async (id: string, dataDevolucao: string) => {
    return atualizarKit(id, {
      status: "devolvido",
      data_devolucao: dataDevolucao,
    });
  };

  const faturarKit = async (id: string) => {
    return atualizarKit(id, { status: "faturado" });
  };

  return {
    kits,
    loading,
    error,
    fetchKits,
    criarKit,
    atualizarKit,
    adicionarItemKit,
    buscarItensKit,
    enviarKit,
    devolverKit,
    faturarKit,
  };
};
