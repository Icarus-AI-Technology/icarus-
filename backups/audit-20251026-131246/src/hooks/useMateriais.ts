/**
 * Hook: useMateriais
 * Gerenciamento de materiais OPME com Supabase
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Material {
  id: string;
  nome: string;
  descricao?: string; // Adicionado para EstoqueIA
  codigo: string;
  tipo: "implante" | "instrumental" | "consumivel" | "dispositivo";
  categoria: string;
  fabricante: string;
  fornecedor_id?: string;
  registro_anvisa?: string;
  quantidade_estoque: number;
  quantidade_minima: number;
  unidade_medida: string;
  valor_unitario: number;
  localizacao?: string;
  lote?: string;
  validade?: string;
  status: "ativo" | "inativo" | "descontinuado";
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumoEstoque {
  totalItens: number;
  totalAtivos: number;
  valorTotal: number;
  alertasEstoque: number;
  alertasVencimento: number;
}

interface MateriaisState {
  materiais: Material[];
  loading: boolean;
  error: string | null;
}

export function useMateriais() {
  const [state, setState] = useState<MateriaisState>({
    materiais: [],
    loading: true,
    error: null,
  });

  const fetchMateriais = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("materiais_opme")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;

      setState({
        materiais: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Erro ao carregar materiais",
      }));
    }
  }, []);

  const getMaterialById = useCallback(
    async (id: string): Promise<Material | null> => {
      try {
        const { data, error } = await supabase
          .from("materiais_opme")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar material:", err);
        return null;
      }
    },
    [],
  );

  const createMaterial = useCallback(
    async (
      material: Omit<Material, "id" | "created_at" | "updated_at">,
    ): Promise<Material | null> => {
      try {
        const { data, error } = await supabase
          .from("materiais_opme")
          .insert([material])
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          materiais: [...prev.materiais, data],
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao criar material",
        }));
        return null;
      }
    },
    [],
  );

  const updateMaterial = useCallback(
    async (
      id: string,
      updates: Partial<Material>,
    ): Promise<Material | null> => {
      try {
        const { data, error } = await supabase
          .from("materiais_opme")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Atualizar lista local
        setState((prev) => ({
          ...prev,
          materiais: prev.materiais.map((m) => (m.id === id ? data : m)),
        }));

        return data;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao atualizar material",
        }));
        return null;
      }
    },
    [],
  );

  const deleteMaterial = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("materiais_opme")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Atualizar lista local
      setState((prev) => ({
        ...prev,
        materiais: prev.materiais.filter((m) => m.id !== id),
      }));

      return true;
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Erro ao deletar material",
      }));
      return false;
    }
  }, []);

  const getMateriaisByTipo = useCallback(async (tipo: Material["tipo"]) => {
    try {
      const { data, error } = await supabase
        .from("materiais_opme")
        .select("*")
        .eq("tipo", tipo)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar materiais por tipo:", err);
      return [];
    }
  }, []);

  const getMateriaisAbaixoMinimo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("materiais_opme")
        .select("*")
        .lt("quantidade_estoque", "quantidade_minima");

      if (error) throw error;
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar materiais abaixo do mínimo:", err);
      return [];
    }
  }, []);

  const getMateriaisProximosVencimento = useCallback(
    async (dias: number = 30) => {
      try {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() + dias);

        const { data, error } = await supabase
          .from("materiais_opme")
          .select("*")
          .not("validade", "is", null)
          .lte("validade", dataLimite.toISOString())
          .order("validade", { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao buscar materiais próximos ao vencimento:", err);
        return [];
      }
    },
    [],
  );

  const getResumoEstoque = useCallback(async (): Promise<ResumoEstoque> => {
    try {
      const { data, error } = await supabase
        .from("materiais_opme")
        .select("quantidade_estoque, valor_unitario, status");

      if (error) throw error;

      const materiaisEstoque =
        (data as Array<{
          quantidade_estoque: number;
          valor_unitario: number;
          status: Material["status"];
        }> | null) ?? [];

      const totalItens = materiaisEstoque.length;
      const totalAtivos = materiaisEstoque.filter(
        (m) => m.status === "ativo",
      ).length;
      const valorTotal = materiaisEstoque
        .filter((m) => m.status === "ativo")
        .reduce(
          (sum, m) =>
            sum + (m.quantidade_estoque ?? 0) * (m.valor_unitario ?? 0),
          0,
        );

      // Materiais abaixo do mínimo
      const abaixoMinimo = await getMateriaisAbaixoMinimo();

      // Materiais próximos ao vencimento
      const proximosVencimento = await getMateriaisProximosVencimento();

      return {
        totalItens,
        totalAtivos,
        valorTotal,
        alertasEstoque: abaixoMinimo.length,
        alertasVencimento: proximosVencimento.length,
      } satisfies ResumoEstoque;
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao calcular resumo de estoque:", err);
      return {
        totalItens: 0,
        totalAtivos: 0,
        valorTotal: 0,
        alertasEstoque: 0,
        alertasVencimento: 0,
      } satisfies ResumoEstoque;
    }
  }, [getMateriaisAbaixoMinimo, getMateriaisProximosVencimento]);

  const countByTipo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("materiais_opme")
        .select("tipo");

      if (error) throw error;

      const counts = data.reduce(
        (acc, m) => {
          acc[m.tipo] = (acc[m.tipo] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return counts;
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao contar materiais:", err);
      return {};
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchMateriais();

    const channel = supabase
      .channel("materiais_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "materiais_opme" },
        (payload) => {
          console.log("Material change received!", payload);
          fetchMateriais(); // Re-fetch on any change
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMateriais]);

  return {
    ...state,
    fetchMateriais,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getMateriaisByTipo,
    getMateriaisAbaixoMinimo,
    getMateriaisProximosVencimento,
    getResumoEstoque,
    countByTipo,
  };
}
