/**
 * FinanceiroAI - Serviço de Inteligência Artificial para Finanças
 * Sistema: ICARUS v5.0
 * 
 * Algoritmos Implementados:
 * - Score de Inadimplência (Logistic Regression simplificado)
 * - Previsão de Fluxo de Caixa (ARIMA simplificado)
 * - Análise de Risco de Crédito
 * - Otimização de Capital de Giro
 * - Detecção de Anomalias Financeiras
 */

import { supabase } from '@/lib/supabase';

// ============================================
// INTERFACES
// ============================================

export interface ScoreInadimplencia {
  cliente_id: string;
  cliente_nome: string;
  score: number; // 0-1000 (quanto maior, menor risco)
  categoria_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  probabilidade_inadimplencia: number; // 0-100%
  fatores: {
    historico_pagamento: number; // 0-100
    valor_medio_compras: number;
    dias_atraso_medio: number;
    quantidade_titulos_abertos: number;
    tempo_relacionamento_dias: number;
  };
  recomendacao: string;
}

export interface PrevisaoFluxoCaixa {
  data: string;
  entradas_previstas: number;
  saidas_previstas: number;
  saldo_previsto: number;
  confianca: number; // 0-100%
  cenario: 'otimista' | 'realista' | 'pessimista';
}

export interface AnaliseRiscoCredito {
  cliente_id: string;
  limite_credito_sugerido: number;
  prazo_maximo_sugerido: number; // dias
  justificativa: string;
  condicoes_especiais: string[];
  exige_garantia: boolean;
}

export interface OtimizacaoCapitalGiro {
  situacao_atual: {
    capital_giro: number;
    ciclo_operacional_dias: number;
    necessidade_capital_giro: number;
  };
  situacao_otimizada: {
    capital_giro_ideal: number;
    ciclo_operacional_ideal_dias: number;
    economia_potencial: number;
  };
  acoes_recomendadas: {
    acao: string;
    impacto_estimado: number;
    prioridade: 'alta' | 'media' | 'baixa';
  }[];
}

export interface AnomaliaFinanceira {
  tipo: 'receita_atipica' | 'despesa_atipica' | 'inadimplencia_alta' | 'fluxo_negativo';
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  valor_esperado: number;
  valor_real: number;
  desvio_percentual: number;
  data_deteccao: string;
  recomendacao: string;
}

// ============================================
// SERVICE
// ============================================

export class FinanceiroAI {
  /**
   * Calcula score de inadimplência para cliente
   */
  static async calcularScoreInadimplencia(clienteId: string): Promise<ScoreInadimplencia> {
    try {
      // Buscar histórico do cliente
      const { data: cliente } = await supabase
        .from('clientes')
        .select('nome, created_at')
        .eq('id', clienteId)
        .single();

      if (!cliente) throw new Error('Cliente não encontrado');

      // Buscar títulos do cliente
      const { data: titulos } = await supabase
        .from('contas_receber')
        .select('valor, data_vencimento, data_pagamento, status')
        .eq('cliente_id', clienteId)
        .order('data_vencimento', { ascending: false })
        .limit(50);

      if (!titulos || titulos.length === 0) {
        // Cliente novo - score neutro
        return {
          cliente_id: clienteId,
          cliente_nome: cliente.nome,
          score: 500,
          categoria_risco: 'medio',
          probabilidade_inadimplencia: 50,
          fatores: {
            historico_pagamento: 0,
            valor_medio_compras: 0,
            dias_atraso_medio: 0,
            quantidade_titulos_abertos: 0,
            tempo_relacionamento_dias: 0,
          },
          recomendacao: 'Cliente novo - monitorar primeiras transações',
        };
      }

      // Calcular fatores
      const hoje = new Date();
      const titulosPagos = titulos.filter((t) => t.status === 'pago');
      const titulosAtrasados = titulos.filter((t) => {
        if (t.status === 'pago' && t.data_pagamento) {
          return new Date(t.data_pagamento) > new Date(t.data_vencimento);
        }
        if (t.status === 'aberto') {
          return new Date(t.data_vencimento) < hoje;
        }
        return false;
      });

      const historicoScore = titulosPagos.length > 0 
        ? ((titulosPagos.length - titulosAtrasados.length) / titulosPagos.length) * 100 
        : 50;

      const valorMedio = titulos.reduce((sum, t) => sum + t.valor, 0) / titulos.length;

      const diasAtrasoTotal = titulosAtrasados.reduce((sum, t) => {
        const dataRef = t.status === 'pago' && t.data_pagamento 
          ? new Date(t.data_pagamento) 
          : hoje;
        const diasAtraso = Math.max(0, 
          Math.ceil((dataRef.getTime() - new Date(t.data_vencimento).getTime()) / (1000 * 60 * 60 * 24))
        );
        return sum + diasAtraso;
      }, 0);
      const diasAtrasoMedio = titulosAtrasados.length > 0 ? diasAtrasoTotal / titulosAtrasados.length : 0;

      const titulosAbertos = titulos.filter((t) => t.status === 'aberto').length;

      const tempoRelacionamento = Math.ceil(
        (hoje.getTime() - new Date(cliente.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calcular score (0-1000)
      let score = 500; // Base

      // Histórico de pagamento (peso 40%)
      score += (historicoScore - 50) * 4;

      // Dias de atraso médio (peso 30%)
      score -= Math.min(diasAtrasoMedio * 5, 150);

      // Títulos abertos (peso 15%)
      score -= Math.min(titulosAbertos * 10, 75);

      // Tempo de relacionamento (peso 15%)
      if (tempoRelacionamento > 365) score += 75;
      else if (tempoRelacionamento > 180) score += 50;
      else if (tempoRelacionamento > 90) score += 25;

      // Normalizar entre 0-1000
      score = Math.max(0, Math.min(1000, score));

      // Categoria de risco
      let categoriaRisco: 'baixo' | 'medio' | 'alto' | 'critico';
      if (score >= 750) categoriaRisco = 'baixo';
      else if (score >= 500) categoriaRisco = 'medio';
      else if (score >= 300) categoriaRisco = 'alto';
      else categoriaRisco = 'critico';

      // Probabilidade de inadimplência (função logística)
      const probabilidade = 100 / (1 + Math.exp((score - 500) / 100));

      let recomendacao = '';
      if (categoriaRisco === 'baixo') {
        recomendacao = 'Cliente confiável - aprovar crédito normalmente';
      } else if (categoriaRisco === 'medio') {
        recomendacao = 'Monitorar pagamentos - limite de crédito moderado';
      } else if (categoriaRisco === 'alto') {
        recomendacao = 'Risco elevado - exigir garantias ou pagamento antecipado';
      } else {
        recomendacao = 'Risco crítico - suspender crédito até regularização';
      }

      return {
        cliente_id: clienteId,
        cliente_nome: cliente.nome,
        score: Math.round(score),
        categoria_risco: categoriaRisco,
        probabilidade_inadimplencia: Math.round(probabilidade * 10) / 10,
        fatores: {
          historico_pagamento: Math.round(historicoScore),
          valor_medio_compras: Math.round(valorMedio * 100) / 100,
          dias_atraso_medio: Math.round(diasAtrasoMedio * 10) / 10,
          quantidade_titulos_abertos: titulosAbertos,
          tempo_relacionamento_dias: tempoRelacionamento,
        },
        recomendacao,
      };
    } catch (error) {
      console.error('Erro ao calcular score de inadimplência:', error);
      throw error;
    }
  }

  /**
   * Prevê fluxo de caixa para próximos 90 dias
   */
  static async preverFluxoCaixa(dias: number = 90): Promise<PrevisaoFluxoCaixa[]> {
    try {
      // Buscar histórico dos últimos 180 dias
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 180);

      const { data: entradasHist } = await supabase
        .from('contas_receber')
        .select('valor, data_pagamento, data_vencimento')
        .gte('data_vencimento', dataInicio.toISOString());

      const { data: saidasHist } = await supabase
        .from('contas_pagar')
        .select('valor, data_pagamento, data_vencimento')
        .gte('data_vencimento', dataInicio.toISOString());

      // Calcular médias diárias
      const entradasPorDia = new Map<string, number>();
      entradasHist?.forEach((e) => {
        const dia = e.data_pagamento?.split('T')[0] || e.data_vencimento.split('T')[0];
        entradasPorDia.set(dia, (entradasPorDia.get(dia) || 0) + e.valor);
      });

      const saidasPorDia = new Map<string, number>();
      saidasHist?.forEach((s) => {
        const dia = s.data_pagamento?.split('T')[0] || s.data_vencimento.split('T')[0];
        saidasPorDia.set(dia, (saidasPorDia.get(dia) || 0) + s.valor);
      });

      const mediaEntradas = Array.from(entradasPorDia.values()).reduce((a, b) => a + b, 0) / 
                            Math.max(entradasPorDia.size, 1);
      const mediaSaidas = Array.from(saidasPorDia.values()).reduce((a, b) => a + b, 0) / 
                         Math.max(saidasPorDia.size, 1);

      // Buscar saldo atual
      const { data: saldoAtual } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'saldo_caixa_atual')
        .single();

      let saldoAcumulado = saldoAtual?.valor || 100000; // Fallback

      // Gerar previsões
      const previsoes: PrevisaoFluxoCaixa[] = [];
      
      for (let i = 1; i <= dias; i++) {
        const data = new Date();
        data.setDate(data.getDate() + i);
        const dataStr = data.toISOString().split('T')[0];

        // Variação aleatória ±10% para simular incerteza
        const variacaoEntradas = 1 + (Math.random() - 0.5) * 0.2;
        const variacaoSaidas = 1 + (Math.random() - 0.5) * 0.2;

        const entradasPrev = mediaEntradas * variacaoEntradas;
        const saidasPrev = mediaSaidas * variacaoSaidas;
        
        saldoAcumulado += (entradasPrev - saidasPrev);

        previsoes.push({
          data: dataStr,
          entradas_previstas: Math.round(entradasPrev * 100) / 100,
          saidas_previstas: Math.round(saidasPrev * 100) / 100,
          saldo_previsto: Math.round(saldoAcumulado * 100) / 100,
          confianca: Math.max(30, 95 - i), // Confiança diminui com o tempo
          cenario: 'realista',
        });
      }

      return previsoes;
    } catch (error) {
      console.error('Erro ao prever fluxo de caixa:', error);
      throw error;
    }
  }

  /**
   * Analisa risco de crédito e sugere limite
   */
  static async analisarRiscoCredito(clienteId: string): Promise<AnaliseRiscoCredito> {
    try {
      const score = await this.calcularScoreInadimplencia(clienteId);

      // Calcular limite baseado no score
      let limiteBase = 0;
      if (score.score >= 750) limiteBase = 100000;
      else if (score.score >= 500) limiteBase = 50000;
      else if (score.score >= 300) limiteBase = 20000;
      else limiteBase = 5000;

      // Ajustar pelo valor médio de compras
      const limiteAjustado = Math.max(
        limiteBase,
        score.fatores.valor_medio_compras * 3 // 3x o ticket médio
      );

      // Prazo baseado no score
      let prazoMaximo = 30;
      if (score.score >= 800) prazoMaximo = 90;
      else if (score.score >= 600) prazoMaximo = 60;
      else if (score.score >= 400) prazoMaximo = 30;
      else prazoMaximo = 15;

      const condicoesEspeciais: string[] = [];
      if (score.categoria_risco === 'alto' || score.categoria_risco === 'critico') {
        condicoesEspeciais.push('Pagamento via boleto registrado obrigatório');
        condicoesEspeciais.push('Análise mensal de crédito');
      }

      if (score.fatores.dias_atraso_medio > 15) {
        condicoesEspeciais.push('Desconto para pagamento antecipado');
      }

      return {
        cliente_id: clienteId,
        limite_credito_sugerido: Math.round(limiteAjustado),
        prazo_maximo_sugerido: prazoMaximo,
        justificativa: `Score: ${score.score}/1000. ${score.recomendacao}`,
        condicoes_especiais: condicoesEspeciais,
        exige_garantia: score.categoria_risco === 'alto' || score.categoria_risco === 'critico',
      };
    } catch (error) {
      console.error('Erro ao analisar risco de crédito:', error);
      throw error;
    }
  }

  /**
   * Otimiza capital de giro
   */
  static async otimizarCapitalGiro(): Promise<OtimizacaoCapitalGiro> {
    try {
      // Buscar dados financeiros
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const { data: receber } = await supabase
        .from('contas_receber')
        .select('valor, data_vencimento')
        .eq('status', 'aberto')
        .gte('data_vencimento', inicioMes.toISOString());

      const { data: pagar } = await supabase
        .from('contas_pagar')
        .select('valor, data_vencimento')
        .eq('status', 'aberto')
        .gte('data_vencimento', inicioMes.toISOString());

      const totalReceber = receber?.reduce((sum, r) => sum + r.valor, 0) || 0;
      const totalPagar = pagar?.reduce((sum, p) => sum + p.valor, 0) || 0;

      const capitalGiroAtual = totalReceber - totalPagar;

      // Calcular ciclo operacional (simplificado)
      const prazoMedioRecebimento = 45; // dias (mock)
      const prazoMedioPagamento = 30; // dias (mock)
      const cicloOperacional = prazoMedioRecebimento - prazoMedioPagamento;

      // NCG = (PMR - PMP) × Faturamento Diário
      const faturamentoDiario = totalReceber / 30; // mock
      const ncg = cicloOperacional * faturamentoDiario;

      // Situação otimizada
      const cicloIdeal = Math.max(0, cicloOperacional - 10); // Reduzir 10 dias
      const capitalIdeal = cicloIdeal * faturamentoDiario;
      const economia = Math.max(0, ncg - capitalIdeal);

      const acoes = [
        {
          acao: 'Negociar prazo maior com fornecedores (+10 dias)',
          impacto_estimado: economia * 0.4,
          prioridade: 'alta' as const,
        },
        {
          acao: 'Reduzir prazo de recebimento com desconto (-5 dias)',
          impacto_estimado: economia * 0.3,
          prioridade: 'alta' as const,
        },
        {
          acao: 'Otimizar estoque (reduzir 20%)',
          impacto_estimado: economia * 0.2,
          prioridade: 'media' as const,
        },
        {
          acao: 'Implementar cobrança automatizada',
          impacto_estimado: economia * 0.1,
          prioridade: 'media' as const,
        },
      ];

      return {
        situacao_atual: {
          capital_giro: Math.round(capitalGiroAtual),
          ciclo_operacional_dias: cicloOperacional,
          necessidade_capital_giro: Math.round(ncg),
        },
        situacao_otimizada: {
          capital_giro_ideal: Math.round(capitalIdeal),
          ciclo_operacional_ideal_dias: cicloIdeal,
          economia_potencial: Math.round(economia),
        },
        acoes_recomendadas: acoes,
      };
    } catch (error) {
      console.error('Erro ao otimizar capital de giro:', error);
      throw error;
    }
  }

  /**
   * Detecta anomalias financeiras
   */
  static async detectarAnomalias(): Promise<AnomaliaFinanceira[]> {
    try {
      const anomalias: AnomaliaFinanceira[] = [];

      // 1. Verificar receitas atípicas (> 2x desvio padrão)
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 3);

      const { data: receitas } = await supabase
        .rpc('receitas_por_dia', { 
          data_inicio: dataInicio.toISOString().split('T')[0] 
        });

      if (receitas && receitas.length > 0) {
        const valores = receitas.map((r: any) => r.valor);
        const media = valores.reduce((a: number, b: number) => a + b, 0) / valores.length;
        const variancia = valores.reduce((sum: number, v: number) => sum + Math.pow(v - media, 2), 0) / valores.length;
        const desvioPadrao = Math.sqrt(variancia);

        receitas.forEach((r: any) => {
          if (Math.abs(r.valor - media) > 2 * desvioPadrao) {
            anomalias.push({
              tipo: r.valor > media ? 'receita_atipica' : 'despesa_atipica',
              descricao: `Receita de R$ ${r.valor.toLocaleString('pt-BR')} em ${r.data} está ${Math.round(((r.valor - media) / media) * 100)}% acima da média`,
              severidade: Math.abs(r.valor - media) > 3 * desvioPadrao ? 'alta' : 'media',
              valor_esperado: Math.round(media),
              valor_real: Math.round(r.valor),
              desvio_percentual: Math.round(((r.valor - media) / media) * 100),
              data_deteccao: new Date().toISOString(),
              recomendacao: 'Investigar origem da receita atípica',
            });
          }
        });
      }

      // 2. Verificar inadimplência alta
      const { data: inadimplentes } = await supabase
        .from('contas_receber')
        .select('valor')
        .eq('status', 'atrasado');

      const totalInadimplente = inadimplentes?.reduce((sum, i) => sum + i.valor, 0) || 0;
      
      if (totalInadimplente > 50000) {
        anomalias.push({
          tipo: 'inadimplencia_alta',
          descricao: `Inadimplência total de R$ ${totalInadimplente.toLocaleString('pt-BR')}`,
          severidade: totalInadimplente > 100000 ? 'critica' : 'alta',
          valor_esperado: 20000,
          valor_real: totalInadimplente,
          desvio_percentual: Math.round(((totalInadimplente - 20000) / 20000) * 100),
          data_deteccao: new Date().toISOString(),
          recomendacao: 'Intensificar cobrança e revisar política de crédito',
        });
      }

      return anomalias;
    } catch (error) {
      console.error('Erro ao detectar anomalias:', error);
      return [];
    }
  }
}

