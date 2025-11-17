/**
 * useCompliance - Hook para gestão de compliance regulatório
 * Sistema: ICARUS v5.0
 *
 * Funcionalidades:
 * - Gestão de requisitos Abbott (7 requisitos)
 * - Auditorias internas e externas
 * - Não conformidades (CAPA)
 * - Treinamentos e certificações
 * - 5 Agentes de IA autônomos
 * - Rastreabilidade OPME compliance
 * - Score global de conformidade
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ============================================
// INTERFACES
// ============================================

export interface ComplianceRequisito {
  id: string;
  codigo: string; // ABB001, ABB002...
  categoria:
    | "qualidade"
    | "rastreabilidade"
    | "armazenamento"
    | "transporte"
    | "documentacao"
    | "treinamento"
    | "etica";
  fabricante?:
    | "abbott"
    | "medtronic"
    | "jnj"
    | "stryker"
    | "boston_scientific"
    | "anvisa"
    | "iso"
    | "todos"
    | null;
  titulo: string;
  descricao?: string | null;
  status: "conforme" | "nao_conforme" | "parcial" | "nao_aplicavel";
  score_conformidade: number;
  evidencias?: string[] | null;
  documentos_anexados?: string[] | null;
  data_ultima_auditoria?: string | null;
  proxima_auditoria?: string | null;
  responsavel?: string | null;
  responsavel_cargo?: string | null;
  responsavel_email?: string | null;
  acoes_corretivas?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface AuditoriaInterna {
  id: string;
  codigo: string;
  titulo: string;
  tipo: "iso_13485" | "anvisa" | "fabricante" | "bpd" | "interna";
  fabricante_alvo?:
    | "abbott"
    | "medtronic"
    | "jnj"
    | "stryker"
    | "boston_scientific"
    | "todos"
    | null;
  data_planejamento?: string | null;
  data_execucao?: string | null;
  data_conclusao?: string | null;
  status: "planejada" | "em_andamento" | "concluida" | "cancelada";
  auditor_lider?: string | null;
  equipe_auditoria?: string[] | null;
  areas_auditadas?: string[] | null;
  score_global?: number | null;
  nao_conformidades_criticas: number;
  nao_conformidades_maiores: number;
  nao_conformidades_menores: number;
  observacoes_positivas?: string[] | null;
  relatorio_pdf?: string | null;
  plano_acao_gerado: boolean;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NaoConformidade {
  id: string;
  codigo_nc: string;
  titulo: string;
  descricao_completa?: string | null;
  categoria?: string | null;
  severidade: "critica" | "maior" | "menor" | "observacao";
  origem:
    | "auditoria_interna"
    | "auditoria_externa"
    | "cliente"
    | "fornecedor"
    | "autoinspecao";
  auditoria_id?: string | null;
  data_identificacao: string;
  data_prazo_correcao: string;
  data_correcao_efetiva?: string | null;
  status:
    | "aberta"
    | "em_analise"
    | "em_correcao"
    | "aguardando_verificacao"
    | "verificada"
    | "fechada";
  responsavel_analise?: string | null;
  responsavel_correcao?: string | null;
  causa_raiz?: string | null;
  acao_imediata?: string | null;
  acao_corretiva?: string | null;
  acao_preventiva?: string | null;
  custo_estimado?: number | null;
  custo_real?: number | null;
  impacto_negocio?: string | null;
  impacto_cliente?: string | null;
  evidencias_correcao?: string[] | null;
  verificacao_eficacia: boolean;
  reincidencia: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgenteIA {
  id: string;
  codigo: string;
  nome: string;
  tipo: "compliance" | "documentacao" | "auditoria" | "treinamento" | "risco";
  status: "ativo" | "inativo" | "processando" | "erro";
  ultima_execucao?: string | null;
  proxima_execucao?: string | null;
  alertas_gerados: number;
  acoes_sugeridas: number;
  taxa_acerto: number;
  falsos_positivos: number;
  falsos_negativos: number;
  frequencia_analise: "tempo_real" | "horaria" | "diaria" | "semanal";
  nivel_sensibilidade: "baixo" | "medio" | "alto" | "critico";
  auto_correcao_habilitada: boolean;
  notificacoes_habilitadas: boolean;
  integracao_externa: boolean;
  modelo?: string | null;
  versao_modelo?: string | null;
  ultima_atualizacao_modelo?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertaCompliance {
  id: string;
  agente_id?: string | null;
  tipo:
    | "vencimento_certificacao"
    | "treinamento_vencido"
    | "auditoria_programada"
    | "nao_conformidade"
    | "documento_revisao"
    | "calibracao_vencida";
  requisito_id?: string | null;
  auditoria_id?: string | null;
  nc_id?: string | null;
  treinamento_id?: string | null;
  titulo: string;
  descricao: string;
  severidade: "aviso" | "urgente" | "critico";
  analise_ia?: string | null;
  acao_sugerida?: string | null;
  prioridade: number;
  status: "novo" | "visualizado" | "em_acao" | "resolvido" | "ignorado";
  responsavel?: string | null;
  responsavel_cargo?: string | null;
  prazo?: string | null;
  data_geracao: string;
  data_visualizacao?: string | null;
  data_resolucao?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreinamentoCertificacao {
  id: string;
  codigo: string;
  titulo: string;
  tipo: "inicial" | "reciclagem" | "especializacao" | "compliance" | "tecnico";
  fabricante?:
    | "abbott"
    | "medtronic"
    | "jnj"
    | "stryker"
    | "boston_scientific"
    | "geral"
    | null;
  categoria:
    | "opme"
    | "qualidade"
    | "regulatorio"
    | "etica"
    | "seguranca"
    | "operacional";
  duracao_horas: number;
  modalidade: "presencial" | "online" | "hibrido";
  instrutor?: string | null;
  data_realizacao: string;
  conteudo_programatico?: string[] | null;
  avaliacao_final: boolean;
  nota_minima_aprovacao: number;
  certificado_emitido: boolean;
  validade_certificado_meses: number;
  status: "agendado" | "em_andamento" | "concluido" | "cancelado";
  total_participantes: number;
  total_aprovados: number;
  total_reprovados: number;
  created_at: string;
  updated_at: string;
}

export interface MetricasCompliance {
  // Abbott
  scoreGlobalAbbott: number;
  requisitosConformes: number;
  requisitosNaoConformes: number;

  // Auditorias
  totalAuditorias: number;
  scoreMedioAuditorias: number;
  auditoriasConcluidas: number;

  // Não Conformidades
  ncCriticas: number;
  ncMaiores: number;
  ncMenores: number;
  ncAbertas: number;
  ncResolvidas: number;

  // Treinamentos
  totalTreinamentos: number;
  treinamentosConcluidos: number;
  taxaAprovacao: number;
  certificadosVigentes: number;

  // Agentes IA
  agentesAtivos: number;
  taxaAcertoMedia: number;
  alertasGerados: number;
  acoesRealizadas: number;
}

// ============================================
// HOOK
// ============================================

export const useCompliance = () => {
  const [requisitos, setRequisitos] = useState<ComplianceRequisito[]>([]);
  const [auditorias, setAuditorias] = useState<AuditoriaInterna[]>([]);
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>(
    [],
  );
  const [agentesIA, setAgentesIA] = useState<AgenteIA[]>([]);
  const [alertas, setAlertas] = useState<AlertaCompliance[]>([]);
  const [treinamentos, setTreinamentos] = useState<TreinamentoCertificacao[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH REQUISITOS
  // ============================================

  const fetchRequisitos = useCallback(async (fabricante?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("compliance_requisitos")
        .select("*")
        .order("codigo", { ascending: true });

      if (fabricante && fabricante !== "todos") {
        query = query.eq("fabricante", fabricante);
      }

      const { data, error } = await query;
      if (error) throw error;

      setRequisitos(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar requisitos:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar requisitos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // FETCH AUDITORIAS
  // ============================================

  const fetchAuditorias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("auditorias_internas")
        .select("*")
        .order("data_execucao", { ascending: false });

      if (error) throw error;
      setAuditorias(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar auditorias:", err);
    }
  }, []);

  // ============================================
  // FETCH NÃO CONFORMIDADES
  // ============================================

  const fetchNaoConformidades = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("nao_conformidades")
        .select("*")
        .order("data_identificacao", { ascending: false });

      if (error) throw error;
      setNaoConformidades(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar não conformidades:", err);
    }
  }, []);

  // ============================================
  // FETCH AGENTES IA
  // ============================================

  const fetchAgentesIA = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("agentes_ia_compliance")
        .select("*")
        .order("tipo", { ascending: true });

      if (error) throw error;
      setAgentesIA(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar agentes IA:", err);
    }
  }, []);

  // ============================================
  // FETCH ALERTAS
  // ============================================

  const fetchAlertas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("alertas_compliance")
        .select("*")
        .in("status", ["novo", "visualizado", "em_acao"])
        .order("data_geracao", { ascending: false });

      if (error) throw error;
      setAlertas(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar alertas:", err);
    }
  }, []);

  // ============================================
  // FETCH TREINAMENTOS
  // ============================================

  const fetchTreinamentos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("treinamentos_certificacoes")
        .select("*")
        .order("data_realizacao", { ascending: false });

      if (error) throw error;
      setTreinamentos(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao carregar treinamentos:", err);
    }
  }, []);

  // ============================================
  // CALCULAR SCORE ABBOTT
  // ============================================

  const calcularScoreAbbott = useCallback((): {
    score: number;
    breakdown: Record<string, number>;
  } => {
    const requisitosAbbott = requisitos.filter(
      (r) => r.fabricante === "abbott",
    );

    if (requisitosAbbott.length === 0) {
      return { score: 0, breakdown: {} };
    }

    // Pesos por categoria (conforme documentação Abbott)
    const pesos: Record<string, number> = {
      qualidade: 0.2, // ISO 13485
      rastreabilidade: 0.2, // Rastreabilidade
      armazenamento: 0.15, // Temp/Umidade
      transporte: 0.15, // Transporte Qualificado
      documentacao: 0.1, // Documentação
      treinamento: 0.1, // Treinamentos
      etica: 0.1, // Código de Conduta
    };

    let scoreTotal = 0;
    const breakdown: Record<string, number> = {};

    requisitosAbbott.forEach((req) => {
      const peso = pesos[req.categoria] || 0;
      const scoreCategoria = req.score_conformidade * peso;
      scoreTotal += scoreCategoria;
      breakdown[req.categoria] = req.score_conformidade;
    });

    return {
      score: Math.round(scoreTotal * 10) / 10,
      breakdown,
    };
  }, [requisitos]);

  // ============================================
  // CALCULAR MÉTRICAS
  // ============================================

  const calcularMetricas = useCallback((): MetricasCompliance => {
    // Abbott
    const { score: scoreGlobalAbbott } = calcularScoreAbbott();
    const requisitosConformes = requisitos.filter(
      (r) => r.status === "conforme",
    ).length;
    const requisitosNaoConformes = requisitos.filter(
      (r) => r.status === "nao_conforme",
    ).length;

    // Auditorias
    const totalAuditorias = auditorias.length;
    const auditoriasConcluidas = auditorias.filter(
      (a) => a.status === "concluida",
    ).length;
    const scoreMedioAuditorias =
      auditorias.length > 0
        ? auditorias.reduce((sum, a) => sum + (a.score_global || 0), 0) /
          auditorias.length
        : 0;

    // NCs
    const ncCriticas = naoConformidades.filter(
      (nc) => nc.severidade === "critica",
    ).length;
    const ncMaiores = naoConformidades.filter(
      (nc) => nc.severidade === "maior",
    ).length;
    const ncMenores = naoConformidades.filter(
      (nc) => nc.severidade === "menor",
    ).length;
    const ncAbertas = naoConformidades.filter(
      (nc) => nc.status === "aberta",
    ).length;
    const ncResolvidas = naoConformidades.filter(
      (nc) => nc.status === "fechada",
    ).length;

    // Treinamentos
    const totalTreinamentos = treinamentos.length;
    const treinamentosConcluidos = treinamentos.filter(
      (t) => t.status === "concluido",
    ).length;
    const taxaAprovacao =
      treinamentos.length > 0
        ? (treinamentos.reduce((sum, t) => sum + t.total_aprovados, 0) /
            treinamentos.reduce((sum, t) => sum + t.total_participantes, 0)) *
          100
        : 0;
    const certificadosVigentes = treinamentos.filter(
      (t) => t.certificado_emitido,
    ).length;

    // Agentes IA
    const agentesAtivos = agentesIA.filter((a) => a.status === "ativo").length;
    const taxaAcertoMedia =
      agentesIA.length > 0
        ? agentesIA.reduce((sum, a) => sum + a.taxa_acerto, 0) /
          agentesIA.length
        : 0;
    const alertasGerados = agentesIA.reduce(
      (sum, a) => sum + a.alertas_gerados,
      0,
    );
    const acoesRealizadas = agentesIA.reduce(
      (sum, a) => sum + a.acoes_sugeridas,
      0,
    );

    return {
      scoreGlobalAbbott,
      requisitosConformes,
      requisitosNaoConformes,
      totalAuditorias,
      scoreMedioAuditorias: Math.round(scoreMedioAuditorias * 10) / 10,
      auditoriasConcluidas,
      ncCriticas,
      ncMaiores,
      ncMenores,
      ncAbertas,
      ncResolvidas,
      totalTreinamentos,
      treinamentosConcluidos,
      taxaAprovacao: Math.round(taxaAprovacao * 10) / 10,
      certificadosVigentes,
      agentesAtivos,
      taxaAcertoMedia: Math.round(taxaAcertoMedia * 10) / 10,
      alertasGerados,
      acoesRealizadas,
    };
  }, [
    requisitos,
    auditorias,
    naoConformidades,
    treinamentos,
    agentesIA,
    calcularScoreAbbott,
  ]);

  // ============================================
  // CRUD REQUISITOS
  // ============================================

  const updateRequisito = useCallback(
    async (id: string, updates: Partial<ComplianceRequisito>) => {
      try {
        const { data, error } = await supabase
          .from("compliance_requisitos")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        await fetchRequisitos();
        console.log("Requisito atualizado");
        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao atualizar requisito:", err);
        throw err;
      }
    },
    [fetchRequisitos],
  );

  // ============================================
  // CRUD NÃO CONFORMIDADES
  // ============================================

  const criarNaoConformidade = useCallback(
    async (nc: Omit<NaoConformidade, "id" | "created_at" | "updated_at">) => {
      try {
        const { data, error } = await supabase
          .from("nao_conformidades")
          .insert([nc])
          .select()
          .single();

        if (error) throw error;

        await fetchNaoConformidades();
        console.log("Não conformidade criada");
        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao criar NC:", err);
        throw err;
      }
    },
    [fetchNaoConformidades],
  );

  const resolverNaoConformidade = useCallback(
    async (
      id: string,
      resolucao: {
        status: "verificada" | "fechada";
        data_correcao_efetiva: string;
        evidencias_correcao?: string[];
        verificacao_eficacia: boolean;
      },
    ) => {
      try {
        const { data, error } = await supabase
          .from("nao_conformidades")
          .update(resolucao)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        await fetchNaoConformidades();
        console.log("NC resolvida");
        return data;
      } catch (error) {
        const err = error as Error;
        console.error("Erro ao resolver NC:", err);
        throw err;
      }
    },
    [fetchNaoConformidades],
  );

  // ============================================
  // GERAR ALERTAS IA
  // ============================================

  const gerarAlertasIA = useCallback(async () => {
    try {
      const { error } = await supabase.rpc("gerar_alertas_ia");
      if (error) throw error;

      await fetchAlertas();
      console.log("Alertas IA gerados");
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao gerar alertas:", err);
    }
  }, [fetchAlertas]);

  // ============================================
  // ATUALIZAR SCORES
  // ============================================

  const atualizarScores = useCallback(async () => {
    try {
      const { error } = await supabase.rpc("atualizar_scores_compliance");
      if (error) throw error;

      await fetchRequisitos();
      console.log("Scores atualizados");
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao atualizar scores:", err);
    }
  }, [fetchRequisitos]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchRequisitos();
    fetchAuditorias();
    fetchNaoConformidades();
    fetchAgentesIA();
    fetchAlertas();
    fetchTreinamentos();
  }, [
    fetchRequisitos,
    fetchAuditorias,
    fetchNaoConformidades,
    fetchAgentesIA,
    fetchAlertas,
    fetchTreinamentos,
  ]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    requisitos,
    auditorias,
    naoConformidades,
    agentesIA,
    alertas,
    treinamentos,
    loading,
    error,

    // Métricas
    metricas: calcularMetricas(),
    scoreAbbott: calcularScoreAbbott(),

    // CRUD
    updateRequisito,
    criarNaoConformidade,
    resolverNaoConformidade,

    // Utilitários
    gerarAlertasIA,
    atualizarScores,
    refresh: () => {
      fetchRequisitos();
      fetchAuditorias();
      fetchNaoConformidades();
      fetchAgentesIA();
      fetchAlertas();
      fetchTreinamentos();
    },
  };
};
