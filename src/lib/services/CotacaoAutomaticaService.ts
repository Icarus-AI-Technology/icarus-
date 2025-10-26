/**
 * CotacaoAutomaticaService - Cotação Automática por Cirurgia
 * 
 * Funcionalidades:
 * - Cotação automática de todos os produtos do kit cirúrgico
 * - Cálculo de economia total
 * - Ranking de fornecedores
 * - Relatório consolidado
 * - Integração com PortaisOPMEService
 * 
 * @module CotacaoAutomaticaService
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase';
import { portaisOPMEService, type OfertaOPME } from './PortaisOPMEService';
import { palavrasChaveService } from './PalavrasChaveService';

// ============================================
// TYPES E INTERFACES
// ============================================

export interface CotacaoProduto {
  produto_id: string;
  produto_nome: string;
  produto_codigo?: string;
  quantidade: number;
  preco_atual: number;
  melhor_preco: number;
  economia: number;
  percentual_economia: number;
  portal_recomendado: string;
  fornecedor_recomendado: string;
  top3_ofertas: OfertaOPME[];
  total_ofertas: number;
}

export interface RelatorioCotacaoCirurgia {
  cirurgia_id: string;
  cirurgia_numero?: string;
  paciente_nome?: string;
  tipo_cirurgia?: string;
  data_cirurgia?: string;
  
  total_produtos: number;
  total_cotacoes: number;
  tempo_execucao: number; // ms
  
  valor_total_atual: number;
  valor_total_cotado: number;
  economia_total: number;
  percentual_economia: number;
  
  cotacoes: CotacaoProduto[];
  
  recomendacoes: {
    portal: string;
    total_produtos: number;
    economia_estimada: number;
  }[];
  
  observacoes?: string[];
}

export interface RankingFornecedores {
  portal: string;
  fornecedor: string;
  total_produtos: number;
  economia_total: number;
  score_medio: number;
  ofertas: OfertaOPME[];
}

export interface EstatisticasCotacoes {
  periodo: 'mes' | 'trimestre' | 'ano';
  total_cirurgias_cotadas: number;
  total_produtos_cotados: number;
  economia_total: number;
  economia_media_por_cirurgia: number;
  percentual_economia_medio: number;
  portal_mais_economico: string;
  produto_maior_economia: string;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

export class CotacaoAutomaticaService {
  private static instance: CotacaoAutomaticaService;

  private constructor() {}

  static getInstance(): CotacaoAutomaticaService {
    if (!CotacaoAutomaticaService.instance) {
      CotacaoAutomaticaService.instance = new CotacaoAutomaticaService();
    }
    return CotacaoAutomaticaService.instance;
  }

  // ============================================
  // COTAÇÃO AUTOMÁTICA POR CIRURGIA
  // ============================================

  async cotarPorCirurgia(cirurgiaId: string): Promise<RelatorioCotacaoCirurgia> {
    const inicio = Date.now();

    try {
      // Buscar dados da cirurgia
      const { data: cirurgia, error: cirurgiaError } = await supabase
        .from('cirurgias')
        .select(`
          *,
          cirurgias_produtos (
            id,
            produto_id,
            quantidade_planejada,
            valor_unitario,
            produto:produtos_opme (
              id,
              descricao,
              codigo_anvisa,
              preco_custo
            )
          )
        `)
        .eq('id', cirurgiaId)
        .single();

      if (cirurgiaError) throw cirurgiaError;
      if (!cirurgia) throw new Error('Cirurgia não encontrada');

      const produtos = cirurgia.cirurgias_produtos || [];
      if (produtos.length === 0) {
        throw new Error('Cirurgia sem produtos no kit');
      }

      // Cotar cada produto
      const cotacoes: CotacaoProduto[] = [];
      let valorTotalAtual = 0;
      let valorTotalCotado = 0;

      for (const item of produtos) {
        const produto = item.produto;
        if (!produto) continue;

        // Buscar palavras-chave do produto
        const palavrasChave = await palavrasChaveService.buscarPalavrasChave({
          produtoId: produto.id,
          apenasAtivas: true,
        });

        // Se não tiver palavras-chave, usar descrição do produto
        const palavraChaveUsada = palavrasChave.length > 0
          ? palavrasChave[0].palavra_chave
          : produto.descricao;

        // Realizar cotação
        const resultadoCotacao = await portaisOPMEService.cotarMultiplosPortais({
          produtoId: produto.id,
          palavraChave: palavraChaveUsada,
          quantidade: item.quantidade_planejada,
          precoCustoAtual: produto.preco_custo,
        });

        const precoAtual = produto.preco_custo || item.valor_unitario || 0;
        const melhorPreco = resultadoCotacao.melhorOferta?.preco_unitario || precoAtual;
        const economia = Math.max(0, (precoAtual - melhorPreco) * item.quantidade_planejada);
        const percentualEconomia = precoAtual > 0 ? (economia / (precoAtual * item.quantidade_planejada)) * 100 : 0;

        valorTotalAtual += precoAtual * item.quantidade_planejada;
        valorTotalCotado += melhorPreco * item.quantidade_planejada;

        cotacoes.push({
          produto_id: produto.id,
          produto_nome: produto.descricao,
          produto_codigo: produto.codigo_anvisa,
          quantidade: item.quantidade_planejada,
          preco_atual: precoAtual,
          melhor_preco: melhorPreco,
          economia,
          percentual_economia: percentualEconomia,
          portal_recomendado: resultadoCotacao.melhorOferta?.portal || '',
          fornecedor_recomendado: resultadoCotacao.melhorOferta?.fornecedor || '',
          top3_ofertas: resultadoCotacao.top3Ofertas,
          total_ofertas: resultadoCotacao.totalOfertas,
        });
      }

      const economiaTotal = Math.max(0, valorTotalAtual - valorTotalCotado);
      const percentualEconomia = valorTotalAtual > 0 ? (economiaTotal / valorTotalAtual) * 100 : 0;

      // Gerar ranking de portais
      const recomendacoes = this.gerarRankingPortais(cotacoes);

      // Gerar observações
      const observacoes: string[] = [];
      if (economiaTotal > 0) {
        observacoes.push(`Economia identificada: ${this.formatarMoeda(economiaTotal)} (${percentualEconomia.toFixed(1)}%)`);
      }
      if (recomendacoes.length > 0) {
        observacoes.push(`Portal mais econômico: ${recomendacoes[0].portal}`);
      }

      const tempoExecucao = Date.now() - inicio;

      return {
        cirurgia_id: cirurgiaId,
        cirurgia_numero: cirurgia.numero_cirurgia,
        paciente_nome: cirurgia.paciente_nome,
        tipo_cirurgia: cirurgia.tipo_cirurgia,
        data_cirurgia: cirurgia.data_agendamento,
        
        total_produtos: produtos.length,
        total_cotacoes: cotacoes.length,
        tempo_execucao: tempoExecucao,
        
        valor_total_atual: valorTotalAtual,
        valor_total_cotado: valorTotalCotado,
        economia_total: economiaTotal,
        percentual_economia: percentualEconomia,
        
        cotacoes,
        recomendacoes,
        observacoes,
      };
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao cotar cirurgia:', err);
      throw err;
    }
  }

  // ============================================
  // COTAÇÃO AUTOMÁTICA DE MÚLTIPLAS CIRURGIAS
  // ============================================

  async cotarMultiplasCirurgias(cirurgiasIds: string[]): Promise<{
    relatorios: RelatorioCotacaoCirurgia[];
    resumo: {
      total_cirurgias: number;
      economia_total: number;
      economia_media: number;
      tempo_total: number;
    };
  }> {
    const relatorios: RelatorioCotacaoCirurgia[] = [];
    let economiaTotal = 0;
    let tempoTotal = 0;

    for (const id of cirurgiasIds) {
      try {
        const relatorio = await this.cotarPorCirurgia(id);
        relatorios.push(relatorio);
        economiaTotal += relatorio.economia_total;
        tempoTotal += relatorio.tempo_execucao;
      } catch (error) {
   const err = error as Error;
        console.error(`Erro ao cotar cirurgia ${id}:`, err);
      }
    }

    const economiamedia = cirurgiasIds.length > 0 ? economiaTotal / cirurgiasIds.length : 0;

    return {
      relatorios,
      resumo: {
        total_cirurgias: cirurgiasIds.length,
        economia_total: economiaTotal,
        economia_media: economiamedia,
        tempo_total: tempoTotal,
      },
    };
  }

  // ============================================
  // RANKING DE FORNECEDORES
  // ============================================

  async gerarRankingFornecedores(cirurgiaId: string): Promise<RankingFornecedores[]> {
    const relatorio = await this.cotarPorCirurgia(cirurgiaId);
    const fornecedoresMap = new Map<string, RankingFornecedores>();

    for (const cotacao of relatorio.cotacoes) {
      for (const oferta of cotacao.top3_ofertas) {
        const chave = `${oferta.portal}:${oferta.fornecedor}`;
        
        if (fornecedoresMap.has(chave)) {
          const ranking = fornecedoresMap.get(chave)!;
          ranking.total_produtos++;
          ranking.economia_total += cotacao.economia;
          ranking.score_medio = (ranking.score_medio + oferta.score_qualidade) / 2;
          ranking.ofertas.push(oferta);
        } else {
          fornecedoresMap.set(chave, {
            portal: oferta.portal,
            fornecedor: oferta.fornecedor,
            total_produtos: 1,
            economia_total: cotacao.economia,
            score_medio: oferta.score_qualidade,
            ofertas: [oferta],
          });
        }
      }
    }

    const ranking = Array.from(fornecedoresMap.values());
    ranking.sort((a, b) => b.economia_total - a.economia_total);
    
    return ranking;
  }

  // ============================================
  // ESTATÍSTICAS DE COTAÇÕES
  // ============================================

  async gerarEstatisticas(periodo: 'mes' | 'trimestre' | 'ano'): Promise<EstatisticasCotacoes> {
    const hoje = new Date();
    const dataInicio = new Date();

    switch (periodo) {
      case 'mes':
        dataInicio.setMonth(hoje.getMonth() - 1);
        break;
      case 'trimestre':
        dataInicio.setMonth(hoje.getMonth() - 3);
        break;
      case 'ano':
        dataInicio.setFullYear(hoje.getFullYear() - 1);
        break;
    }

    // Buscar cotações do período
    const { data: cotacoes, error } = await supabase
      .from('portais_opme_cotacoes')
      .select('*')
      .gte('data_cotacao', dataInicio.toISOString())
      .eq('status', 'concluida');

    if (error) throw error;

    const totalCirurgias = new Set(cotacoes?.map(c => c.cirurgia_id).filter(Boolean)).size;
    const totalProdutos = cotacoes?.length || 0;
    const economiaTotal = cotacoes?.reduce((sum, c) => sum + (c.economia_estimada || 0), 0) || 0;
    const economiaMedia = totalCirurgias > 0 ? economiaTotal / totalCirurgias : 0;

    // Calcular percentual médio
    const cotacoesComEconomia = cotacoes?.filter(c => c.percentual_economia > 0) || [];
    const percentualMedio = cotacoesComEconomia.length > 0
      ? cotacoesComEconomia.reduce((sum, c) => sum + (c.percentual_economia || 0), 0) / cotacoesComEconomia.length
      : 0;

    // Portal mais econômico
    const portaisEconomia = new Map<string, number>();
    for (const cotacao of cotacoes || []) {
      if (cotacao.portal_melhor_preco && cotacao.economia_estimada) {
        const atual = portaisEconomia.get(cotacao.portal_melhor_preco) || 0;
        portaisEconomia.set(cotacao.portal_melhor_preco, atual + cotacao.economia_estimada);
      }
    }

    let portalMaisEconomico = '';
    let maiorEconomia = 0;
    for (const [portal, economia] of portaisEconomia) {
      if (economia > maiorEconomia) {
        maiorEconomia = economia;
        portalMaisEconomico = portal;
      }
    }

    return {
      periodo,
      total_cirurgias_cotadas: totalCirurgias,
      total_produtos_cotados: totalProdutos,
      economia_total: economiaTotal,
      economia_media_por_cirurgia: economiaMedia,
      percentual_economia_medio: percentualMedio,
      portal_mais_economico: portalMaisEconomico,
      produto_maior_economia: 'N/A', // Simplificado
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private gerarRankingPortais(cotacoes: CotacaoProduto[]): {
    portal: string;
    total_produtos: number;
    economia_estimada: number;
  }[] {
    const portaisMap = new Map<string, { total: number; economia: number }>();

    for (const cotacao of cotacoes) {
      if (cotacao.portal_recomendado) {
        const atual = portaisMap.get(cotacao.portal_recomendado) || { total: 0, economia: 0 };
        atual.total++;
        atual.economia += cotacao.economia;
        portaisMap.set(cotacao.portal_recomendado, atual);
      }
    }

    const ranking = Array.from(portaisMap.entries()).map(([portal, data]) => ({
      portal,
      total_produtos: data.total,
      economia_estimada: data.economia,
    }));

    ranking.sort((a, b) => b.economia_estimada - a.economia_estimada);
    
    return ranking;
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  // ============================================
  // EXPORTAÇÃO DE RELATÓRIOS
  // ============================================

  async exportarRelatorioCSV(relatorio: RelatorioCotacaoCirurgia): Promise<string> {
    const linhas: string[] = [];
    
    // Cabeçalho
    linhas.push('Produto,Código,Quantidade,Preço Atual,Melhor Preço,Economia,% Economia,Portal,Fornecedor');
    
    // Dados
    for (const cotacao of relatorio.cotacoes) {
      linhas.push([
        cotacao.produto_nome,
        cotacao.produto_codigo || '',
        cotacao.quantidade,
        cotacao.preco_atual.toFixed(2),
        cotacao.melhor_preco.toFixed(2),
        cotacao.economia.toFixed(2),
        cotacao.percentual_economia.toFixed(1) + '%',
        cotacao.portal_recomendado,
        cotacao.fornecedor_recomendado,
      ].join(','));
    }
    
    // Totais
    linhas.push('');
    linhas.push(`TOTAL,,${relatorio.total_produtos},${relatorio.valor_total_atual.toFixed(2)},${relatorio.valor_total_cotado.toFixed(2)},${relatorio.economia_total.toFixed(2)},${relatorio.percentual_economia.toFixed(1)}%,,`);
    
    return linhas.join('\n');
  }

  async exportarRelatorioJSON(relatorio: RelatorioCotacaoCirurgia): Promise<string> {
    return JSON.stringify(relatorio, null, 2);
  }
}

// Exportar instância singleton
export const cotacaoAutomaticaService = CotacaoAutomaticaService.getInstance();

