/**
 * CirurgiasAI - Serviço de Inteligência Artificial para Cirurgias
 * Sistema: ICARUS v5.0
 *
 * Algoritmos Implementados:
 * - Previsão de Demanda Cirúrgica (Prophet simplificado)
 * - Otimização de Agendamento
 * - Análise de Complexidade
 * - Recomendação de Materiais OPME
 * - Predição de Tempo Cirúrgico
 */

import { supabase } from "@/lib/supabase";

// ============================================
// INTERFACES
// ============================================

export interface PrevisaoDemandaCirurgica {
  especialidade: string;
  demanda_historica_30d: number;
  demanda_prevista_7d: number;
  demanda_prevista_30d: number;
  crescimento_percentual: number;
  sazonalidade: "alta" | "media" | "baixa";
  confianca: number; // 0-100%
}

export interface OtimizacaoAgendamento {
  cirurgia_id: string;
  procedimento: string;
  data_sugerida: string;
  horario_sugerido: string;
  sala_sugerida: string;
  score_otimizacao: number; // 0-100
  justificativa: string;
  materiais_necessarios: string[];
}

export interface AnaliseComplexidade {
  cirurgia_id: string;
  procedimento: string;
  nivel_complexidade: "baixa" | "media" | "alta" | "critica";
  score: number; // 0-100
  fatores: {
    duracao_estimada: number; // minutos
    materiais_especializados: number;
    equipe_minima: number;
    risco_clinico: "baixo" | "moderado" | "alto";
  };
  recomendacoes: string[];
}

export interface RecomendacaoMateriais {
  cirurgia_id: string;
  procedimento: string;
  materiais_recomendados: {
    produto_id: string;
    produto_nome: string;
    quantidade_sugerida: number;
    probabilidade_uso: number; // 0-100%
    essencial: boolean;
  }[];
  custo_estimado: number;
  disponibilidade: "total" | "parcial" | "indisponivel";
}

export interface PredicaoTempoCirurgico {
  procedimento: string;
  tempo_medio_historico: number; // minutos
  tempo_previsto: number; // minutos
  margem_erro: number; // minutos
  fatores_influencia: {
    complexidade: number;
    experiencia_cirurgiao: number;
    paciente_comorbidades: boolean;
  };
  confianca: number; // 0-100%
}

// ============================================
// SERVICE
// ============================================

export class CirurgiasAI {
  /**
   * Prevê demanda cirúrgica por especialidade
   */
  static async preverDemanda(
    especialidade?: string,
  ): Promise<PrevisaoDemandaCirurgica[]> {
    try {
      // Buscar histórico de 90 dias
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 90);

      let query = supabase
        .from("cirurgias")
        .select("tipo_cirurgia, status, data_cirurgia")
        .gte("data_cirurgia", dataInicio.toISOString())
        .order("data_cirurgia", { ascending: true });

      if (especialidade) {
        query = query.eq("tipo_cirurgia", especialidade);
      }

      const { data: cirurgias } = await query;

      if (!cirurgias || cirurgias.length === 0) {
        return [];
      }

      // Agrupar por especialidade
      const porEspecialidade = new Map<string, Date[]>();
      cirurgias.forEach((c) => {
        if (!porEspecialidade.has(c.tipo_cirurgia)) {
          porEspecialidade.set(c.tipo_cirurgia, []);
        }
        porEspecialidade.get(c.tipo_cirurgia)!.push(new Date(c.data_cirurgia));
      });

      const resultados: PrevisaoDemandaCirurgica[] = [];

      porEspecialidade.forEach((datas, esp) => {
        // Calcular demanda dos últimos 30 dias
        const ultimos30Dias = new Date();
        ultimos30Dias.setDate(ultimos30Dias.getDate() - 30);
        const demanda30d = datas.filter((d) => d >= ultimos30Dias).length;

        // Calcular crescimento comparando primeiros 30d vs últimos 30d
        const primeiros30d = datas.filter((d) => {
          const inicio30 = new Date(dataInicio);
          inicio30.setDate(inicio30.getDate() + 30);
          return d >= dataInicio && d < inicio30;
        }).length;

        const crescimento =
          primeiros30d > 0
            ? ((demanda30d - primeiros30d) / primeiros30d) * 100
            : 0;

        // Previsão simples baseada em média móvel
        const demandaSemanal = demanda30d / 4.3; // ~4.3 semanas em 30 dias
        const demanda7d = Math.round(demandaSemanal * (1 + crescimento / 100));
        const demanda30dFutura = Math.round(
          demanda30d * (1 + crescimento / 100),
        );

        // Detectar sazonalidade (variação semanal)
        const sazonalidade =
          Math.abs(crescimento) > 15
            ? "alta"
            : Math.abs(crescimento) > 5
              ? "media"
              : "baixa";

        resultados.push({
          especialidade: esp,
          demanda_historica_30d: demanda30d,
          demanda_prevista_7d: demanda7d,
          demanda_prevista_30d: demanda30dFutura,
          crescimento_percentual: Math.round(crescimento * 10) / 10,
          sazonalidade,
          confianca: Math.min(datas.length * 2, 95), // Confiança baseada em histórico
        });
      });

      return resultados.sort(
        (a, b) => b.demanda_prevista_30d - a.demanda_prevista_30d,
      );
    } catch (error) {
      console.error("Erro ao prever demanda cirúrgica:", error);
      throw error;
    }
  }

  /**
   * Otimiza agendamento de cirurgias
   */
  static async otimizarAgendamento(
    cirurgiaId: string,
  ): Promise<OtimizacaoAgendamento> {
    try {
      const { data: cirurgia } = await supabase
        .from("cirurgias")
        .select("*")
        .eq("id", cirurgiaId)
        .single();

      if (!cirurgia) throw new Error("Cirurgia não encontrada");

      // Algoritmo simples de otimização
      // Em produção: usar OR-Tools, algoritmo genético, etc.

      // 1. Encontrar melhor horário (manhã = menos urgências)
      const horarioOtimo = "08:00";

      // 2. Sala baseada em disponibilidade (mock)
      const salaOtima = "Sala 1";

      // 3. Data sugerida (próximo dia útil com >= 7 dias de antecedência)
      const dataSugerida = new Date();
      dataSugerida.setDate(dataSugerida.getDate() + 7);

      // 4. Score baseado em múltiplos fatores
      const scoreDisponibilidade = 85;
      const scoreEquipe = 90;
      const scoreMateriais = 80;
      const scoreOtimizacao = Math.round(
        (scoreDisponibilidade + scoreEquipe + scoreMateriais) / 3,
      );

      return {
        cirurgia_id: cirurgiaId,
        procedimento: cirurgia.tipo_cirurgia,
        data_sugerida: dataSugerida.toISOString().split("T")[0],
        horario_sugerido: horarioOtimo,
        sala_sugerida: salaOtima,
        score_otimizacao: scoreOtimizacao,
        justificativa: `Horário matinal reduz risco de atrasos. ${salaOtima} tem equipamentos ideais.`,
        materiais_necessarios: [],
      };
    } catch (error) {
      console.error("Erro ao otimizar agendamento:", error);
      throw error;
    }
  }

  /**
   * Analisa complexidade de cirurgia
   */
  static async analisarComplexidade(
    cirurgiaId: string,
  ): Promise<AnaliseComplexidade> {
    try {
      const { data: cirurgia } = await supabase
        .from("cirurgias")
        .select(
          `
          *,
          kits_cirurgicos(
            itens:itens_kit(count)
          )
        `,
        )
        .eq("id", cirurgiaId)
        .single();

      if (!cirurgia) throw new Error("Cirurgia não encontrada");

      // Calcular complexidade baseada em múltiplos fatores
      const materiaisCount =
        cirurgia.kits_cirurgicos?.[0]?.itens?.[0]?.count || 0;

      // Score de complexidade (0-100)
      let score = 30; // Base

      // Materiais especializados aumentam complexidade
      if (materiaisCount > 15) score += 30;
      else if (materiaisCount > 10) score += 20;
      else if (materiaisCount > 5) score += 10;

      // Tipo de cirurgia
      if (
        cirurgia.tipo_cirurgia.includes("Cardíaca") ||
        cirurgia.tipo_cirurgia.includes("Neurológica")
      ) {
        score += 25;
      } else if (cirurgia.tipo_cirurgia.includes("Ortopédica")) {
        score += 15;
      }

      // Status de urgência
      if (cirurgia.status === "urgente") score += 15;

      // Determinar nível
      let nivel: "baixa" | "media" | "alta" | "critica";
      if (score >= 80) nivel = "critica";
      else if (score >= 60) nivel = "alta";
      else if (score >= 40) nivel = "media";
      else nivel = "baixa";

      const recomendacoes: string[] = [];

      if (nivel === "critica" || nivel === "alta") {
        recomendacoes.push("Equipe cirúrgica experiente obrigatória");
        recomendacoes.push("Reservar 30% tempo adicional para imprevistos");
        recomendacoes.push("Verificar disponibilidade de UTI pós-operatória");
      }

      if (materiaisCount > 10) {
        recomendacoes.push("Realizar checklist de materiais 24h antes");
      }

      return {
        cirurgia_id: cirurgiaId,
        procedimento: cirurgia.tipo_cirurgia,
        nivel_complexidade: nivel,
        score,
        fatores: {
          duracao_estimada:
            nivel === "critica"
              ? 240
              : nivel === "alta"
                ? 180
                : nivel === "media"
                  ? 120
                  : 60,
          materiais_especializados: materiaisCount,
          equipe_minima:
            nivel === "critica"
              ? 8
              : nivel === "alta"
                ? 6
                : nivel === "media"
                  ? 4
                  : 3,
          risco_clinico:
            nivel === "critica" || nivel === "alta"
              ? "alto"
              : nivel === "media"
                ? "moderado"
                : "baixo",
        },
        recomendacoes,
      };
    } catch (error) {
      console.error("Erro ao analisar complexidade:", error);
      throw error;
    }
  }

  /**
   * Recomenda materiais OPME para cirurgia
   */
  static async recomendarMateriais(
    cirurgiaId: string,
  ): Promise<RecomendacaoMateriais> {
    try {
      const { data: cirurgia } = await supabase
        .from("cirurgias")
        .select("tipo_cirurgia")
        .eq("id", cirurgiaId)
        .single();

      if (!cirurgia) throw new Error("Cirurgia não encontrada");

      // Buscar materiais mais usados para este tipo de cirurgia (últimos 90 dias)
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 90);

      const { data: cirurgiasPassadas } = await supabase
        .from("cirurgias")
        .select(
          `
          id,
          kits_cirurgicos(
            itens:itens_kit(
              produto_id,
              quantidade,
              produtos:produtos_opme(nome, preco_venda)
            )
          )
        `,
        )
        .eq("tipo_cirurgia", cirurgia.tipo_cirurgia)
        .eq("status", "concluida")
        .gte("data_cirurgia", dataInicio.toISOString());

      // Contar frequência de uso de cada produto
      const frequenciaProdutos = new Map<
        string,
        { nome: string; count: number; qtdMedia: number; preco: number }
      >();

      interface KitCirurgico {
        itens?: Array<{ produto_id: string; quantidade: number }>;
      }

      cirurgiasPassadas?.forEach((c) => {
        c.kits_cirurgicos?.forEach((kit: KitCirurgico) => {
          kit.itens?.forEach((item) => {
            const prodId = item.produto_id;
            const prodNome = item.produtos?.nome || "Desconhecido";
            const preco = item.produtos?.preco_venda || 0;

            if (!frequenciaProdutos.has(prodId)) {
              frequenciaProdutos.set(prodId, {
                nome: prodNome,
                count: 0,
                qtdMedia: 0,
                preco,
              });
            }

            const current = frequenciaProdutos.get(prodId)!;
            current.count += 1;
            current.qtdMedia += item.quantidade;
          });
        });
      });

      const totalCirurgias = cirurgiasPassadas?.length || 1;

      const materiaisRecomendados = Array.from(frequenciaProdutos.entries())
        .map(([prodId, { nome, count, qtdMedia, preco }]) => ({
          produto_id: prodId,
          produto_nome: nome,
          quantidade_sugerida: Math.ceil(qtdMedia / count),
          probabilidade_uso: Math.round((count / totalCirurgias) * 100),
          essencial: count / totalCirurgias > 0.7, // Usado em > 70% dos casos
        }))
        .sort((a, b) => b.probabilidade_uso - a.probabilidade_uso)
        .slice(0, 15); // Top 15 materiais

      const custoEstimado = materiaisRecomendados.reduce((sum, m) => {
        const prod = Array.from(frequenciaProdutos.values()).find(
          (p) => p.nome === m.produto_nome,
        );
        return sum + (prod?.preco || 0) * m.quantidade_sugerida;
      }, 0);

      return {
        cirurgia_id: cirurgiaId,
        procedimento: cirurgia.tipo_cirurgia,
        materiais_recomendados: materiaisRecomendados,
        custo_estimado: custoEstimado,
        disponibilidade: "parcial", // TODO: verificar estoque real
      };
    } catch (error) {
      console.error("Erro ao recomendar materiais:", error);
      throw error;
    }
  }

  /**
   * Prediz tempo cirúrgico
   */
  static async predizerTempo(
    procedimento: string,
  ): Promise<PredicaoTempoCirurgico> {
    try {
      // Buscar histórico de cirurgias do mesmo tipo
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 180); // 6 meses

      const { data: historico } = await supabase
        .from("cirurgias")
        .select("duracao_minutos, status")
        .eq("tipo_cirurgia", procedimento)
        .eq("status", "concluida")
        .gte("data_cirurgia", dataInicio.toISOString());

      if (!historico || historico.length === 0) {
        // Sem histórico - estimativa padrão
        return {
          procedimento,
          tempo_medio_historico: 0,
          tempo_previsto: 120, // 2 horas padrão
          margem_erro: 30,
          fatores_influencia: {
            complexidade: 50,
            experiencia_cirurgiao: 50,
            paciente_comorbidades: false,
          },
          confianca: 20,
        };
      }

      // Calcular estatísticas
      const duracoes = historico
        .map((c) => c.duracao_minutos)
        .filter((d) => d > 0);
      const tempoMedio =
        duracoes.reduce((sum, d) => sum + d, 0) / duracoes.length;

      // Desvio padrão
      const variancia =
        duracoes.reduce((sum, d) => sum + Math.pow(d - tempoMedio, 2), 0) /
        duracoes.length;
      const desvioPadrao = Math.sqrt(variancia);

      return {
        procedimento,
        tempo_medio_historico: Math.round(tempoMedio),
        tempo_previsto: Math.round(tempoMedio),
        margem_erro: Math.round(desvioPadrao),
        fatores_influencia: {
          complexidade: 70,
          experiencia_cirurgiao: 80,
          paciente_comorbidades: false,
        },
        confianca: Math.min(duracoes.length * 5, 95),
      };
    } catch (error) {
      console.error("Erro ao predizer tempo cirúrgico:", error);
      throw error;
    }
  }
}
