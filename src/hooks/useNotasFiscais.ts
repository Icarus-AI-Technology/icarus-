/**
 * Hook: useNotasFiscais
 * Gerenciamento de notas fiscais (NF-e)
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface NotaFiscal {
  id: string;
  empresa_id: string;
  tipo: "entrada" | "saida";
  numero: string;
  serie: string;
  chave_acesso: string;
  modelo: "55" | "65"; // 55=NF-e, 65=NFC-e
  emitente_id: string;
  destinatario_id: string;
  data_emissao: string;
  data_entrada_saida?: string;
  valor_total: number;
  valor_produtos: number;
  valor_frete?: number;
  valor_seguro?: number;
  valor_desconto?: number;
  valor_icms?: number;
  valor_ipi?: number;
  natureza_operacao: string;
  cfop: string;
  status: "digitacao" | "autorizada" | "cancelada" | "denegada" | "inutilizada";
  status_sefaz?: string;
  protocolo_autorizacao?: string;
  xml?: string;
  danfe_url?: string;
  items: Array<{
    produto_id: string;
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
  }>;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export function useNotasFiscais() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotas();
  }, []);

  async function fetchNotas() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("notas_fiscais")
        .select("*")
        .order("data_emissao", { ascending: false });

      if (fetchError) throw fetchError;
      setNotas(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar notas fiscais",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createNota(
    notaData: Omit<NotaFiscal, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("notas_fiscais")
        .insert([notaData])
        .select()
        .single();

      if (createError) throw createError;
      await fetchNotas();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar nota fiscal",
      );
    }
  }

  async function updateNota(id: string, updates: Partial<NotaFiscal>) {
    try {
      const { data, error: updateError } = await supabase
        .from("notas_fiscais")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchNotas();
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar nota fiscal",
      );
    }
  }

  async function cancelarNota(id: string, motivo: string) {
    try {
      await updateNota(id, {
        status: "cancelada",
        observacoes: `Cancelada: ${motivo}`,
      });
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao cancelar nota",
      );
    }
  }

  async function buscarPorChave(chaveAcesso: string) {
    try {
      const { data, error: searchError } = await supabase
        .from("notas_fiscais")
        .select("*")
        .eq("chave_acesso", chaveAcesso)
        .single();

      if (searchError) throw searchError;
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Nota não encontrada",
      );
    }
  }

  return {
    notas,
    loading,
    error,
    createNota,
    updateNota,
    cancelarNota,
    buscarPorChave,
    refresh: fetchNotas,
  };
}
