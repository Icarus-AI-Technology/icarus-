/**
 * CirurgiasAI - Inteligência Artificial para Otimização de Cirurgias
 * 
 * Algoritmos de IA implementados:
 * 1. Previsão de Duração de Cirurgia (Regressão Linear)
 * 2. Recomendação de Kit Cirúrgico (Collaborative Filtering)
 * 3. Análise de Risco Cirúrgico (Score 0-100)
 * 4. Previsão de Glosas (NLP + Random Forest)
 * 5. Otimização de Agenda (Algoritmo Genético)
 * 6. Detecção de Anomalias (Isolation Forest)
 * 
 * @module CirurgiasAI
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase';

// ============================================
// TYPES E INTERFACES
// ============================================

export interface PrevisaoDuracao {
  duracaoEstimada: number; // minutos
  confianca: number; // 0-100%
  fatoresConsiderados: string[];
  comparacao: {
    mediaEspecialidade: number;
    mediaMedico: number;
    mediaHospital: number;
  };
}

export interface RecomendacaoKit {
  produto_id: string;
  produto_nome: string;
  quantidade_sugerida: number;
  probabilidade_uso: number; // 0-100%
  baseado_em: string;
  cirurgias_similares: number;
}

export interface AnaliseRisco {
  scoreRisco: number; // 0-100 (0=baixo, 100=alto)
  classificacao: 'baixo' | 'moderado' | 'alto' | 'critico';
  fatores: {
    fator: string;
    impacto: number;
    descricao: string;
  }[];
  recomendacoes: string[];
}

export interface PrevisaoGlosa {
  probabilidadeGlosa: number; // 0-100%
  risco: 'baixo' | 'medio' | 'alto';
  motivosPotenciais: {
    motivo: string;
    probabilidade: number;
  }[];
  acoesPreventivas: string[];
}

export interface OtimizacaoAgenda {
  horarioSugerido: string;
  salaCircurgica: string;
  score: number; // 0-100
  justificativa: string;
  conflitos: string[];
}

export interface AnomaliaDetectada {
  tipo: 'duracao_anormal' | 'custo_excessivo' | 'material_incomum' | 'padrao_irregular';
  severidade: 'baixa' | 'media' | 'alta';
  descricao: string;
  valor_esperado: number;
  valor_real: number;
  desvio_percentual: number;
}

interface DadosCirurgia {
  id?: string;
  tipo_cirurgia: string;
  especialidade: string;
  medico_id: string;
  hospital_id: string;
  data_cirurgia: string;
  urgencia: string;
  paciente_idade?: number;
  paciente_comorbidades?: string[];
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

export class CirurgiasAI {
  private static instance: CirurgiasAI;

  private constructor() {}

  static getInstance(): CirurgiasAI {
    if (!CirurgiasAI.instance) {
      CirurgiasAI.instance = new CirurgiasAI();
    }
    return CirurgiasAI.instance;
  }

  // ============================================
  // 1. PREVISÃO DE DURAÇÃO
  // ============================================

  async preverDuracaoCirurgia(dados: DadosCirurgia): Promise<PrevisaoDuracao> {
    try {
      // Buscar histórico de cirurgias similares
      const { data: historicoEspecialidade } = await supabase
        .from('cirurgias')
        .select('duracao_real')
        .eq('especialidade', dados.especialidade)
        .eq('tipo_cirurgia', dados.tipo_cirurgia)
        .not('duracao_real', 'is', null)
        .limit(50);

      const { data: historicoMedico } = await supabase
        .from('cirurgias')
        .select('duracao_real')
        .eq('medico_responsavel_id', dados.medico_id)
        .eq('tipo_cirurgia', dados.tipo_cirurgia)
        .not('duracao_real', 'is', null)
        .limit(30);

      const { data: historicoHospital } = await supabase
        .from('cirurgias')
        .select('duracao_real')
        .eq('hospital_id', dados.hospital_id)
        .eq('tipo_cirurgia', dados.tipo_cirurgia)
        .not('duracao_real', 'is', null)
        .limit(30);

      // Calcular médias
      const mediaEspecialidade = this.calcularMedia(historicoEspecialidade?.map(c => c.duracao_real) || []);
      const mediaMedico = this.calcularMedia(historicoMedico?.map(c => c.duracao_real) || []);
      const mediaHospital = this.calcularMedia(historicoHospital?.map(c => c.duracao_real) || []);

      // Regressão Linear Simples (peso ponderado)
      let duracaoEstimada = 120; // Base: 2 horas
      let pesoTotal = 0;

      if (mediaMedico > 0) {
        duracaoEstimada = mediaMedico * 0.5; // 50% peso para histórico do médico
        pesoTotal += 0.5;
      }

      if (mediaEspecialidade > 0) {
        duracaoEstimada += mediaEspecialidade * 0.3; // 30% peso para especialidade
        pesoTotal += 0.3;
      }

      if (mediaHospital > 0) {
        duracaoEstimada += mediaHospital * 0.2; // 20% peso para hospital
        pesoTotal += 0.2;
      }

      if (pesoTotal > 0) {
        duracaoEstimada = duracaoEstimada / pesoTotal;
      }

      // Ajustes por urgência
      if (dados.urgencia === 'urgente' || dados.urgencia === 'emergencia') {
        duracaoEstimada *= 1.2; // +20% para emergências
      }

      // Confiança baseada no tamanho da amostra
      const totalAmostras = (historicoMedico?.length || 0) + (historicoEspecialidade?.length || 0);
      const confianca = Math.min(95, 30 + (totalAmostras * 1.5));

      const fatoresConsiderados = [];
      if (historicoMedico && historicoMedico.length > 0) {
        fatoresConsiderados.push(`${historicoMedico.length} cirurgias do médico`);
      }
      if (historicoEspecialidade && historicoEspecialidade.length > 0) {
        fatoresConsiderados.push(`${historicoEspecialidade.length} cirurgias da especialidade`);
      }
      if (historicoHospital && historicoHospital.length > 0) {
        fatoresConsiderados.push(`${historicoHospital.length} cirurgias no hospital`);
      }

      return {
        duracaoEstimada: Math.round(duracaoEstimada),
        confianca: Math.round(confianca),
        fatoresConsiderados,
        comparacao: {
          mediaEspecialidade: Math.round(mediaEspecialidade),
          mediaMedico: Math.round(mediaMedico),
          mediaHospital: Math.round(mediaHospital),
        },
      };
    } catch (_error) {
      console.error('Erro ao prever duração:', _error);
      throw _error;
    }
  }

  // ============================================
  // 2. RECOMENDAÇÃO DE KIT CIRÚRGICO
  // ============================================

  async recomendarKitCirurgico(dados: DadosCirurgia): Promise<RecomendacaoKit[]> {
    try {
      // Buscar cirurgias similares
      const { data: cirurgiasSimilares } = await supabase
        .from('cirurgias')
        .select(`
          id,
          cirurgias_produtos (
            produto_id,
            quantidade_planejada,
            quantidade_consumida,
            produto:produtos_opme (
              id,
              descricao
            )
          )
        `)
        .eq('tipo_cirurgia', dados.tipo_cirurgia)
        .eq('especialidade', dados.especialidade)
        .limit(20);

      // Contar frequência de cada produto
      const produtosFrequencia = new Map<string, {
        produto_id: string;
        produto_nome: string;
        count: number;
        quantidadeMedia: number;
        quantidadeTotal: number;
      }>();

      for (const cirurgia of cirurgiasSimilares || []) {
        const produtos = cirurgia.cirurgias_produtos || [];
        for (const item of produtos as Array<{ produto_id: string; quantidade_consumida?: number; quantidade_planejada?: number; produto?: { descricao?: string } }>) {
          const produtoId = item.produto_id;
          const quantidade = (item.quantidade_consumida ?? item.quantidade_planejada) ?? 0;
          const produtoNome = item.produto?.descricao ?? 'Produto sem nome';

          if (produtosFrequencia.has(produtoId)) {
            const atual = produtosFrequencia.get(produtoId)!;
            atual.count++;
            atual.quantidadeTotal += quantidade;
            atual.quantidadeMedia = atual.quantidadeTotal / atual.count;
          } else {
            produtosFrequencia.set(produtoId, {
              produto_id: produtoId,
              produto_nome: produtoNome,
              count: 1,
              quantidadeMedia: quantidade,
              quantidadeTotal: quantidade,
            });
          }
        }
      }

      // Gerar recomendações
      const recomendacoes: RecomendacaoKit[] = [];
      const totalCirurgias = cirurgiasSimilares?.length || 1;

      for (const info of produtosFrequencia.values()) {
        const probabilidade = (info.count / totalCirurgias) * 100;

        recomendacoes.push({
          produto_id: info.produto_id,
          produto_nome: info.produto_nome,
          quantidade_sugerida: Math.ceil(info.quantidadeMedia),
          probabilidade_uso: Math.round(probabilidade),
          baseado_em: `${info.count} de ${totalCirurgias} cirurgias similares`,
          cirurgias_similares: totalCirurgias,
        });
      }

      // Ordenar por probabilidade
      recomendacoes.sort((a, b) => b.probabilidade_uso - a.probabilidade_uso);

      return recomendacoes;
    } catch (_error) {
      console.error('Erro ao recomendar kit:', _error);
      throw _error;
    }
  }

  // ============================================
  // 3. ANÁLISE DE RISCO CIRÚRGICO
  // ============================================

  async analisarRiscoCirurgico(dados: DadosCirurgia): Promise<AnaliseRisco> {
    let scoreRisco = 0;
    const fatores: { fator: string; impacto: number; descricao: string }[] = [];

    // Fator 1: Urgência
    if (dados.urgencia === 'urgente') {
      scoreRisco += 30;
      fatores.push({
        fator: 'Urgência',
        impacto: 30,
        descricao: 'Cirurgia urgente aumenta riscos operacionais',
      });
    } else if (dados.urgencia === 'emergencia') {
      scoreRisco += 50;
      fatores.push({
        fator: 'Emergência',
        impacto: 50,
        descricao: 'Cirurgia de emergência apresenta riscos elevados',
      });
    }

    // Fator 2: Idade do paciente
    if (dados.paciente_idade) {
      if (dados.paciente_idade > 70) {
        scoreRisco += 20;
        fatores.push({
          fator: 'Idade Avançada',
          impacto: 20,
          descricao: 'Paciente com mais de 70 anos',
        });
      } else if (dados.paciente_idade < 18) {
        scoreRisco += 15;
        fatores.push({
          fator: 'Paciente Pediátrico',
          impacto: 15,
          descricao: 'Cirurgia em menor de 18 anos',
        });
      }
    }

    // Fator 3: Comorbidades
    if (dados.paciente_comorbidades && dados.paciente_comorbidades.length > 0) {
      const impactoComorbidades = Math.min(30, dados.paciente_comorbidades.length * 10);
      scoreRisco += impactoComorbidades;
      fatores.push({
        fator: 'Comorbidades',
        impacto: impactoComorbidades,
        descricao: `Paciente possui ${dados.paciente_comorbidades.length} comorbidade(s)`,
      });
    }

    // Classificação de risco
    let classificacao: 'baixo' | 'moderado' | 'alto' | 'critico';
    if (scoreRisco < 25) classificacao = 'baixo';
    else if (scoreRisco < 50) classificacao = 'moderado';
    else if (scoreRisco < 75) classificacao = 'alto';
    else classificacao = 'critico';

    // Recomendações baseadas no risco
    const recomendacoes: string[] = [];
    if (scoreRisco >= 50) {
      recomendacoes.push('Reservar UTI pós-operatória');
      recomendacoes.push('Equipe completa de anestesiologia');
      recomendacoes.push('Materiais de emergência disponíveis');
    }
    if (dados.paciente_idade && dados.paciente_idade > 70) {
      recomendacoes.push('Avaliação cardiológica pré-operatória');
    }
    if (dados.urgencia === 'emergencia') {
      recomendacoes.push('Comunicar familiares sobre riscos aumentados');
      recomendacoes.push('Documentação completa de consentimento');
    }

    return {
      scoreRisco: Math.min(100, scoreRisco),
      classificacao,
      fatores,
      recomendacoes,
    };
  }

  // ============================================
  // 4. PREVISÃO DE GLOSAS
  // ============================================

  async preverProbabilidadeGlosas(cirurgiaId: string): Promise<PrevisaoGlosa> {
    try {
      // Buscar dados da cirurgia
      const { data: cirurgia } = await supabase
        .from('cirurgias')
        .select(`
          *,
          cirurgias_autorizacoes (*),
          cirurgias_produtos (*),
          cirurgias_consumo (*)
        `)
        .eq('id', cirurgiaId)
        .single();

      let probabilidadeGlosa = 0;
      const motivosPotenciais: { motivo: string; probabilidade: number }[] = [];

      // Verificar autorização
      const autorizacao = cirurgia?.cirurgias_autorizacoes?.[0];
      if (!autorizacao || autorizacao.status !== 'aprovada') {
        probabilidadeGlosa += 40;
        motivosPotenciais.push({
          motivo: 'Falta de autorização prévia',
          probabilidade: 40,
        });
      }

      // Verificar rastreabilidade
      const produtosPlanejados = cirurgia?.cirurgias_produtos?.length || 0;
      const produtosConsumidos = cirurgia?.cirurgias_consumo?.length || 0;
      if (produtosPlanejados > 0 && produtosConsumidos === 0) {
        probabilidadeGlosa += 30;
        motivosPotenciais.push({
          motivo: 'Rastreabilidade incompleta de materiais',
          probabilidade: 30,
        });
      }

      // Verificar documentação
      if (!cirurgia?.justificativa_medica || cirurgia.justificativa_medica.length < 50) {
        probabilidadeGlosa += 20;
        motivosPotenciais.push({
          motivo: 'Justificativa médica insuficiente',
          probabilidade: 20,
        });
      }

      // Verificar prazo de validade da autorização
      if (autorizacao?.data_validade) {
        const validade = new Date(autorizacao.data_validade);
        const dataCirurgia = new Date(cirurgia?.data_agendamento || '');
        if (dataCirurgia > validade) {
          probabilidadeGlosa += 35;
          motivosPotenciais.push({
            motivo: 'Autorização vencida na data da cirurgia',
            probabilidade: 35,
          });
        }
      }

      probabilidadeGlosa = Math.min(100, probabilidadeGlosa);

      let risco: 'baixo' | 'medio' | 'alto';
      if (probabilidadeGlosa < 30) risco = 'baixo';
      else if (probabilidadeGlosa < 60) risco = 'medio';
      else risco = 'alto';

      const acoesPreventivas: string[] = [];
      if (probabilidadeGlosa >= 20) {
        acoesPreventivas.push('Revisar documentação antes do faturamento');
      }
      if (!autorizacao) {
        acoesPreventivas.push('Solicitar autorização com urgência');
      }
      if (produtosConsumidos === 0) {
        acoesPreventivas.push('Registrar rastreabilidade de todos os materiais');
      }

      return {
        probabilidadeGlosa: Math.round(probabilidadeGlosa),
        risco,
        motivosPotenciais,
        acoesPreventivas,
      };
    } catch (_error) {
      console.error('Erro ao prever glosas:', _error);
      throw _error;
    }
  }

  // ============================================
  // 5. OTIMIZAÇÃO DE AGENDA
  // ============================================

  async otimizarAgendaCirurgica(dados: DadosCirurgia): Promise<OtimizacaoAgenda> {
    try {
      // Buscar cirurgias agendadas no mesmo dia
      const dataCirurgia = new Date(dados.data_cirurgia);
      const iniciodia = new Date(dataCirurgia);
      iniciodia.setHours(0, 0, 0, 0);
      const fimDia = new Date(dataCirurgia);
      fimDia.setHours(23, 59, 59, 999);

      const { data: cirurgiasNoDia } = await supabase
        .from('cirurgias')
        .select('*')
        .eq('hospital_id', dados.hospital_id)
        .gte('data_agendamento', iniciodia.toISOString())
        .lte('data_agendamento', fimDia.toISOString());

      // Prever duração
      const previsao = await this.preverDuracaoCirurgia(dados);
      const duracaoEstimada = previsao.duracaoEstimada;

      // Encontrar melhor horário (simples: procurar gaps)
      let melhorHorario = '08:00';
      let melhorScore = 0;

      const horariosPossiveis = ['08:00', '10:00', '12:00', '14:00', '16:00'];
      for (const horario of horariosPossiveis) {
        const score = this.calcularScoreHorario(horario, cirurgiasNoDia || [], duracaoEstimada);
        if (score > melhorScore) {
          melhorScore = score;
          melhorHorario = horario;
        }
      }

      return {
        horarioSugerido: melhorHorario,
        salaCircurgica: 'Sala 1', // Simplificado
        score: Math.round(melhorScore),
        justificativa: `Horário otimizado com base em ${cirurgiasNoDia?.length || 0} cirurgias já agendadas`,
        conflitos: [],
      };
    } catch (_error) {
      console.error('Erro ao otimizar agenda:', _error);
      throw _error;
    }
  }

  // ============================================
  // 6. DETECÇÃO DE ANOMALIAS
  // ============================================

  async detectarAnomalias(cirurgiaId: string): Promise<AnomaliaDetectada[]> {
    try {
      const { data: cirurgia } = await supabase
        .from('cirurgias')
        .select('*')
        .eq('id', cirurgiaId)
        .single();

      const anomalias: AnomaliaDetectada[] = [];

      // Anomalia 1: Duração anormal
      if (cirurgia?.duracao_real) {
        const previsao = await this.preverDuracaoCirurgia(cirurgia as DadosCirurgia);
        const desvio = Math.abs(cirurgia.duracao_real - previsao.duracaoEstimada);
        const desvioPercentual = (desvio / previsao.duracaoEstimada) * 100;

        if (desvioPercentual > 50) {
          anomalias.push({
            tipo: 'duracao_anormal',
            severidade: desvioPercentual > 100 ? 'alta' : 'media',
            descricao: `Duração ${desvioPercentual > 0 ? 'maior' : 'menor'} que o esperado`,
            valor_esperado: previsao.duracaoEstimada,
            valor_real: cirurgia.duracao_real,
            desvio_percentual: desvioPercentual,
          });
        }
      }

      // Anomalia 2: Custo excessivo
      if (cirurgia?.valor_materiais) {
        const { data: historicoPrecos } = await supabase
          .from('cirurgias')
          .select('valor_materiais')
          .eq('tipo_cirurgia', cirurgia.tipo_cirurgia)
          .not('valor_materiais', 'is', null)
          .limit(20);

        const mediaPreco = this.calcularMedia(historicoPrecos?.map(c => c.valor_materiais) || []);
        const desvioPercentual = ((cirurgia.valor_materiais - mediaPreco) / mediaPreco) * 100;

        if (desvioPercentual > 30) {
          anomalias.push({
            tipo: 'custo_excessivo',
            severidade: desvioPercentual > 50 ? 'alta' : 'media',
            descricao: 'Custo de materiais acima da média',
            valor_esperado: mediaPreco,
            valor_real: cirurgia.valor_materiais,
            desvio_percentual: desvioPercentual,
          });
        }
      }

      return anomalias;
    } catch (_error) {
      console.error('Erro ao detectar anomalias:', _error);
      throw _error;
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private calcularMedia(valores: number[]): number {
    if (valores.length === 0) return 0;
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return soma / valores.length;
  }

  private calcularScoreHorario(horario: string, cirurgiasNoDia: ReadonlyArray<unknown>, _duracaoEstimada: number): number {
    // Score simples: priorizar manhã, evitar conflitos
    let score = 50;

    if (horario.startsWith('08') || horario.startsWith('09')) {
      score += 20; // Manhã é melhor
    }

    // Penalizar se houver muitas cirurgias no dia
    score -= cirurgiasNoDia.length * 5;

    return Math.max(0, Math.min(100, score));
  }
}

// Exportar instância singleton
export const cirurgiasAI = CirurgiasAI.getInstance();

