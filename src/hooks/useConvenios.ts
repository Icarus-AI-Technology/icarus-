/**
 * Hook: useConvenios
 * Gerenciamento de convênios médicos
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Convenio {
  id: string;
  empresa_id: string;
  nome: string;
  razao_social: string;
  cnpj: string;
  registro_ans?: string;
  tipo:
    | "plano_saude"
    | "seguradora"
    | "cooperativa"
    | "autogestao"
    | "particular";
  categoria: "bronze" | "prata" | "ouro" | "platina" | "vip";
  email: string;
  telefone: string;
  website?: string;
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  contato_comercial?: {
    nome: string;
    email: string;
    telefone: string;
  };
  tabela_precos_id?: string;
  percentual_repasse: number;
  prazo_pagamento: number; // dias
  glosa_media?: number;
  status: "ativo" | "inativo" | "suspenso";
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export function useConvenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConvenios();
  }, []);

  async function fetchConvenios() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("convenios")
        .select("*")
        .order("nome");

      if (fetchError) throw fetchError;
      setConvenios(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar convênios",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createConvenio(
    convenioData: Omit<Convenio, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("convenios")
        .insert([convenioData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchConvenios();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar convênio",
      );
    }
  }

  async function updateConvenio(id: string, updates: Partial<Convenio>) {
    try {
      const { data, error: updateError } = await supabase
        .from("convenios")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchConvenios();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar convênio",
      );
    }
  }

  async function deleteConvenio(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("convenios")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchConvenios();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar convênio",
      );
    }
  }

  return {
    convenios,
    loading,
    error,
    createConvenio,
    updateConvenio,
    deleteConvenio,
    refresh: fetchConvenios,
  };
}
