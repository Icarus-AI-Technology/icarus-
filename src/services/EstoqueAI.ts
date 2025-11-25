/**
 * EstoqueAI - Serviço de Inteligência Artificial para Estoque
 * Sistema: ICARUS v5.0
 *
 * Algoritmos Implementados:
 * - Previsão de Demanda (ARIMA simplificado)
 * - Análise ABC/XYZ
 * - Economic Order Quantity (EOQ)
 * - Detecção de Anomalias
 * - Otimização de Estoque
 */

import { legacySupabase as supabase } from '@/lib/legacySupabase';

// ============================================
// INTERFACES
// ============================================

export interface PrevisaoDemanda {
  produto_id: string;
  produto_nome: string;
  demanda_historica: number[];
  demanda_prevista_30_dias: number;
  demanda_prevista_60_dias: number;
  demanda_prevista_90_dias: number;
  tendencia: 'crescente' | 'estavel' | 'decrescente';
  sazonalidade: boolean;
  confianca: number; // 0-100%
}

export interface ClassificacaoABCXYZ {
  produto_id: string;
  produto_nome: string;
  valor_total_anual: number;
  percentual_valor: number;
  frequencia_movimentacao: number;
  classe_abc: 'A' | 'B' | 'C';
  classe_xyz: 'X' | 'Y' | 'Z';
  classificacao_final: string; // AX, AY, AZ, BX, BY, BZ, CX, CY, CZ
  estrategia_recomendada: string;
}

export interface CalculoEOQ {
  produto_id: string;
  produto_nome: string;
  demanda_anual: number;
  custo_pedido: number;
  custo_armazenagem: number;
  eoq: number; // Quantidade Econômica de Pedido
  numero_pedidos_ano: number;
  custo_total_anual: number;
  ponto_pedido: number;
}

export interface Anomalia {
  tipo: 'consumo_excessivo' | 'sem_movimento' | 'ruptura_frequente' | 'excesso_estoque';
  produto_id: string;
  produto_nome: string;
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  valor_esperado: number;
  valor_atual: number;
  desvio_percentual: number;
  recomendacao: string;
}

export interface OtimizacaoEstoque {
  produto_id: string;
  produto_nome: string;
  situacao_atual: {
    quantidade: number;
    valor_estoque: number;
    giro_estoque: number;
  };
  situacao_otimizada: {
    quantidade_ideal: number;
    valor_estoque_ideal: number;
    giro_esperado: number;
  };
  economia_potencial: number;
  acao_recomendada: 'reduzir' | 'aumentar' | 'manter';
  prioridade: number; // 1-5
}

interface ProdutoSemMovimentoRow {
  produto_id: string;
  produto_nome: string;
  dias_sem_movimento: number;
}

interface ProdutoEstoqueRow {
  id: string;
  nome: string;
  ponto_reposicao?: number | null;
  estoque?: Array<{
    quantidade?: number | null;
    custo_total?: number | null;
  }>;
}

// ============================================
// SERVICE
// ============================================

export class EstoqueAI {
  /**
   * Prevê demanda futura usando média móvel ponderada
   * (Simplificação de ARIMA para performance)
   */
  static async preverDemanda(produtoId: string): Promise<PrevisaoDemanda> {
    try {
      // Buscar histórico de 12 meses
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 12);

      const { data: movimentacoes } = await supabase
        .from('estoque_movimentacoes')
        .select('quantidade, data_movimentacao')
        .eq('produto_id', produtoId)
        .eq('tipo', 'saida')
        .gte('data_movimentacao', dataInicio.toISOString())
        .order('data_movimentacao', { ascending: true });

      const { data: produto } = await supabase
        .from('produtos_opme')
        .select('nome')
        .eq('id', produtoId)
        .single();

      if (!movimentacoes || movimentacoes.length === 0) {
        return {
          produto_id: produtoId,
          produto_nome: produto?.nome || 'Desconhecido',
          demanda_historica: [],
          demanda_prevista_30_dias: 0,
          demanda_prevista_60_dias: 0,
          demanda_prevista_90_dias: 0,
          tendencia: 'estavel',
          sazonalidade: false,
          confianca: 0,
        };
      }

      // Agrupar por mês
      const demandaMensal: number[] = [];
      const movPorMes: Record<string, number> = {};

      movimentacoes.forEach((mov) => {
        const mes = mov.data_movimentacao.substring(0, 7); // YYYY-MM
        movPorMes[mes] = (movPorMes[mes] || 0) + mov.quantidade;
      });

      Object.values(movPorMes).forEach((val) => demandaMensal.push(val));

      // Média móvel ponderada (últimos 3 meses com pesos 3, 2, 1)
      const ultimos3 = demandaMensal.slice(-3);
      const mediaMovelPonderada =
        ultimos3.length >= 3
          ? (ultimos3[2] * 3 + ultimos3[1] * 2 + ultimos3[0] * 1) / 6
          : demandaMensal[demandaMensal.length - 1] || 0;

      // Detectar tendência
      let tendencia: 'crescente' | 'estavel' | 'decrescente' = 'estavel';
      if (demandaMensal.length >= 3) {
        const primeiros = demandaMensal.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const ultimos = demandaMensal.slice(-3).reduce((a, b) => a + b, 0) / 3;
        if (ultimos > primeiros * 1.1) tendencia = 'crescente';
        else if (ultimos < primeiros * 0.9) tendencia = 'decrescente';
      }

      // Ajustar previsões baseado na tendência
      let fatorCrescimento = 1.0;
      if (tendencia === 'crescente')
        fatorCrescimento = 1.05; // 5% ao mês
      else if (tendencia === 'decrescente') fatorCrescimento = 0.95; // -5% ao mês

      return {
        produto_id: produtoId,
        produto_nome: produto?.nome || 'Desconhecido',
        demanda_historica: demandaMensal,
        demanda_prevista_30_dias: Math.round(mediaMovelPonderada * fatorCrescimento),
        demanda_prevista_60_dias: Math.round(
          mediaMovelPonderada * Math.pow(fatorCrescimento, 2) * 2
        ),
        demanda_prevista_90_dias: Math.round(
          mediaMovelPonderada * Math.pow(fatorCrescimento, 3) * 3
        ),
        tendencia,
        sazonalidade: this.detectarSazonalidade(demandaMensal),
        confianca: Math.min(demandaMensal.length * 8, 95), // Confiança baseada em histórico
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao prever demanda:', err);
      throw error;
    }
  }

  /**
   * Análise ABC/XYZ - Classificação de produtos
   * ABC: Por valor (A=80%, B=15%, C=5%)
   * XYZ: Por previsibilidade (X=estável, Y=variável, Z=irregular)
   */
  static async analisarABCXYZ(): Promise<ClassificacaoABCXYZ[]> {
    try {
      // Buscar SQL function que já calcula ABC/XYZ
      const { data: produtos, error } = await supabase.rpc('calcular_abc_xyz');

      if (error) throw error;

      const resultado: ClassificacaoABCXYZ[] = [];

      for (const prod of produtos || []) {
        // Estratégia baseada na classificação
        let estrategia = '';
        const classe = `${prod.classe_abc}${prod.classe_xyz}`;

        switch (classe) {
          case 'AX':
            estrategia = 'Controle rigoroso, estoque mínimo, reposição frequente';
            break;
          case 'AY':
            estrategia = 'Monitoramento constante, estoque de segurança médio';
            break;
          case 'AZ':
            estrategia = 'Análise detalhada, estoque de segurança alto';
            break;
          case 'BX':
            estrategia = 'Revisão periódica, reposição programada';
            break;
          case 'BY':
            estrategia = 'Estoque moderado, revisão mensal';
            break;
          case 'BZ':
            estrategia = 'Estoque de segurança, análise trimestral';
            break;
          case 'CX':
            estrategia = 'Reposição sob demanda, estoque mínimo';
            break;
          case 'CY':
            estrategia = 'Revisão semestral, just-in-time quando possível';
            break;
          case 'CZ':
            estrategia = 'Mínimo controle, reposição eventual';
            break;
        }

        resultado.push({
          produto_id: prod.produto_id,
          produto_nome: prod.produto_nome,
          valor_total_anual: prod.valor_total,
          percentual_valor: prod.percentual_valor_acumulado,
          frequencia_movimentacao: prod.frequencia,
          classe_abc: prod.classe_abc,
          classe_xyz: prod.classe_xyz,
          classificacao_final: classe,
          estrategia_recomendada: estrategia,
        });
      }

      return resultado;
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao analisar ABC/XYZ:', err);
      throw error;
    }
  }

  /**
   * Calcula Economic Order Quantity (EOQ)
   * Fórmula: EOQ = √(2 × D × S / H)
   * D = Demanda anual
   * S = Custo por pedido
   * H = Custo de armazenagem por unidade/ano
   */
  static async calcularEOQ(produtoId: string): Promise<CalculoEOQ> {
    try {
      // Buscar produto
      const { data: produto } = await supabase
        .from('produtos_opme')
        .select('nome, custo_medio, custo_pedido, custo_armazenagem_percentual')
        .eq('id', produtoId)
        .single();

      if (!produto) throw new Error('Produto não encontrado');

      // Calcular demanda anual
      const dataInicio = new Date();
      dataInicio.setFullYear(dataInicio.getFullYear() - 1);

      const { data: movimentacoes } = await supabase
        .from('estoque_movimentacoes')
        .select('quantidade')
        .eq('produto_id', produtoId)
        .eq('tipo', 'saida')
        .gte('data_movimentacao', dataInicio.toISOString());

      const demandaAnual = movimentacoes?.reduce((sum, mov) => sum + mov.quantidade, 0) || 0;

      // Parâmetros EOQ
      const custoPedido = produto.custo_pedido || 100; // Custo fixo por pedido
      const custoArmazenagemPerc = produto.custo_armazenagem_percentual || 0.25; // 25% ao ano
      const custoArmazenagem = (produto.custo_medio || 0) * custoArmazenagemPerc;

      // Fórmula EOQ
      const eoq = Math.sqrt((2 * demandaAnual * custoPedido) / custoArmazenagem);
      const numeroPedidosAno = demandaAnual / eoq;
      const custoTotalAnual = numeroPedidosAno * custoPedido + (eoq / 2) * custoArmazenagem;

      // Ponto de pedido (assumindo lead time de 7 dias)
      const demandaDiaria = demandaAnual / 365;
      const pontoPedido = Math.ceil(demandaDiaria * 7);

      return {
        produto_id: produtoId,
        produto_nome: produto.nome,
        demanda_anual: demandaAnual,
        custo_pedido: custoPedido,
        custo_armazenagem: custoArmazenagem,
        eoq: Math.round(eoq),
        numero_pedidos_ano: Math.round(numeroPedidosAno * 10) / 10,
        custo_total_anual: Math.round(custoTotalAnual * 100) / 100,
        ponto_pedido: pontoPedido,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao calcular EOQ:', err);
      throw error;
    }
  }

  /**
   * Detecta anomalias no estoque
   */
  static async detectarAnomalias(): Promise<Anomalia[]> {
    try {
      const anomalias: Anomalia[] = [];

      // 1. Produtos sem movimento (> 90 dias)
      const { data: semMovimento } = await supabase.rpc('produtos_sem_movimento', { dias: 90 });

      semMovimento?.forEach((prod: ProdutoSemMovimentoRow) => {
        anomalias.push({
          tipo: 'sem_movimento',
          produto_id: prod.produto_id,
          produto_nome: prod.produto_nome,
          descricao: `Sem movimento há ${prod.dias_sem_movimento} dias`,
          severidade: prod.dias_sem_movimento > 180 ? 'alta' : 'media',
          valor_esperado: 1,
          valor_atual: 0,
          desvio_percentual: 100,
          recomendacao: 'Considerar promoção, devolução ou descontinuação',
        });
      });

      // 2. Rupturas frequentes (> 3 vezes no mês)
      // TODO: Implementar query específica

      // 3. Excesso de estoque (> 3x ponto de reposição)
      const { data: produtos } = await supabase.from('produtos_opme').select(`
          id,
          nome,
          ponto_reposicao,
          estoque(quantidade)
        `);

      produtos?.forEach((prod: ProdutoEstoqueRow) => {
        const qtdAtual = prod.estoque?.[0]?.quantidade || 0;
        const pontoReposicao = prod.ponto_reposicao || 0;

        if (pontoReposicao > 0 && qtdAtual > pontoReposicao * 3) {
          anomalias.push({
            tipo: 'excesso_estoque',
            produto_id: prod.id,
            produto_nome: prod.nome,
            descricao: `Estoque 3x acima do ponto de reposição`,
            severidade: qtdAtual > pontoReposicao * 5 ? 'alta' : 'media',
            valor_esperado: pontoReposicao,
            valor_atual: qtdAtual,
            desvio_percentual: Math.round(((qtdAtual - pontoReposicao) / pontoReposicao) * 100),
            recomendacao: 'Reduzir pedidos, promover vendas',
          });
        }
      });

      return anomalias.sort((a, b) => {
        const severidadeOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
        return severidadeOrder[a.severidade] - severidadeOrder[b.severidade];
      });
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao detectar anomalias:', err);
      throw error;
    }
  }

  /**
   * Otimiza níveis de estoque
   */
  static async otimizarEstoque(): Promise<OtimizacaoEstoque[]> {
    try {
      const otimizacoes: OtimizacaoEstoque[] = [];

      // Buscar produtos com estoque
      const { data: produtos } = await supabase
        .from('produtos_opme')
        .select(
          `
          id,
          nome,
          custo_medio,
          ponto_reposicao,
          estoque(quantidade, custo_total)
        `
        )
        .eq('ativo', true);

      for (const prod of produtos || []) {
        const qtdAtual = prod.estoque?.[0]?.quantidade || 0;
        const valorAtual = prod.estoque?.[0]?.custo_total || 0;

        // Calcular demanda média mensal
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 3);

        const { data: movimentacoes } = await supabase
          .from('estoque_movimentacoes')
          .select('quantidade')
          .eq('produto_id', prod.id)
          .eq('tipo', 'saida')
          .gte('data_movimentacao', dataInicio.toISOString());

        const demandaMensal = (movimentacoes?.reduce((s, m) => s + m.quantidade, 0) || 0) / 3;
        const giroAtual = demandaMensal > 0 ? qtdAtual / demandaMensal : 0;

        // Quantidade ideal: 1.5 meses de demanda
        const qtdIdeal = Math.ceil(demandaMensal * 1.5);
        const valorIdeal = qtdIdeal * (prod.custo_medio || 0);
        const economia = valorAtual - valorIdeal;

        let acao: 'reduzir' | 'aumentar' | 'manter';
        let prioridade = 1;

        if (qtdAtual > qtdIdeal * 1.5) {
          acao = 'reduzir';
          prioridade = 4;
        } else if (qtdAtual < qtdIdeal * 0.5) {
          acao = 'aumentar';
          prioridade = 5;
        } else {
          acao = 'manter';
          prioridade = 2;
        }

        if (Math.abs(economia) > 1000) {
          otimizacoes.push({
            produto_id: prod.id,
            produto_nome: prod.nome,
            situacao_atual: {
              quantidade: qtdAtual,
              valor_estoque: valorAtual,
              giro_estoque: Math.round(giroAtual * 10) / 10,
            },
            situacao_otimizada: {
              quantidade_ideal: qtdIdeal,
              valor_estoque_ideal: valorIdeal,
              giro_esperado: 1.5,
            },
            economia_potencial: economia,
            acao_recomendada: acao,
            prioridade,
          });
        }
      }

      return otimizacoes.sort((a, b) => b.prioridade - a.prioridade);
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao otimizar estoque:', err);
      throw error;
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Detecta sazonalidade simples
   */
  private static detectarSazonalidade(demandaMensal: number[]): boolean {
    if (demandaMensal.length < 12) return false;

    // Calcular coeficiente de variação
    const media = demandaMensal.reduce((a, b) => a + b, 0) / demandaMensal.length;
    const variancia =
      demandaMensal.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / demandaMensal.length;
    const desvioPadrao = Math.sqrt(variancia);
    const coeficienteVariacao = (desvioPadrao / media) * 100;

    // Se CV > 30%, há sazonalidade
    return coeficienteVariacao > 30;
  }
}
