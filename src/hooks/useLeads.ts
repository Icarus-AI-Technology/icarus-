/**
 * Hook: useLeads
 * Gerenciamento de leads de vendas com Realtime
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Lead {
  id: string;
  empresa_id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  origem: "website" | "indicacao" | "evento" | "cold_call" | "outro";
  status:
    | "novo"
    | "contato"
    | "qualificado"
    | "proposta"
    | "negociacao"
    | "ganho"
    | "perdido";
  valor_estimado?: number;
  probabilidade?: number;
  observacoes?: string;
  tags?: string[];
  criado_em: string;
  atualizado_em: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();

    // Setup Realtime subscription
    const channel: RealtimeChannel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("[useLeads] Realtime event:", payload);
          handleRealtimeEvent(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLeads() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("leads")
        .select("*")
        .order("criado_em", { ascending: false });

      if (fetchError) throw fetchError;
      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  }

  function handleRealtimeEvent(payload: unknown) {
    const event = payload as { eventType: string; new: Lead; old: Lead };

    switch (event.eventType) {
      case "INSERT":
        setLeads((prev) => [event.new, ...prev]);
        break;
      case "UPDATE":
        setLeads((prev) =>
          prev.map((lead) => (lead.id === event.new.id ? event.new : lead)),
        );
        break;
      case "DELETE":
        setLeads((prev) => prev.filter((lead) => lead.id !== event.old.id));
        break;
    }
  }

  async function createLead(
    leadData: Omit<Lead, "id" | "criado_em" | "atualizado_em">,
  ) {
    try {
      const { data, error: createError } = await supabase
        .from("leads")
        .insert([leadData])
        .select()
        .single();

      if (createError) throw createError;
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao criar lead",
      );
    }
  }

  async function updateLead(id: string, updates: Partial<Lead>) {
    try {
      const { data, error: updateError } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao atualizar lead",
      );
    }
  }

  async function deleteLead(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao deletar lead",
      );
    }
  }

  return {
    leads,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    refresh: fetchLeads,
  };
}
