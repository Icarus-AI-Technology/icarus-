/**
 * PontoReposicaoService - Serviço de gestão de ponto de reposição
 * Sistema: ICARUS v5.0
 * 
 * Fórmula: Ponto Reposição = (Demanda Média × Lead Time) + Estoque Segurança
 * 
 * Funcionalidades:
 * - Calcular ponto de reposição automático
 * - Verificar produtos abaixo do ponto
 * - Sugerir compra automática
 * - Histórico de consumo
 * - Previsão de ruptura
 */

import { supabase } from '@/lib/supabase';

// ============================================
// INTERFACES
// ============================================

export interface PontoReposicaoCalculo {
  produto_id: string;
  produto_nome: string;
  demanda_media_diaria: number;
  lead_time_dias: number;
  estoque_seguranca: number;
  ponto_reposicao_calculado: number;
  ponto_reposicao_atual: number;
  sugestao_ajuste: boolean;
}

export interface ProdutoAbaixoPonto {
  produto_id: string;
  produto_nome: string;
  codigo_anvisa?: string;
  quantidade_atual: number;
  ponto_reposicao: number;
  diferenca: number;
  percentual_falta: number;
  dias_ate_ruptura: number;
  fornecedor_principal?: string;
  lead_time_fornecedor?: number;
  prioridade: 'critica' | 'alta' | 'media';
}

export interface SugestaoCompra {
  produto_id: string;
  produto_nome: string;
  quantidade_sugerida: number;
  quantidade_minima: number;
  valor_estimado: number;
  fornecedor_sugerido?: string;
  urgencia: 'imediata' | 'alta' | 'normal';
  justificativa: string;
}

export interface HistoricoConsumo {
  produto_id: string;
  periodo_dias: number;
  consumo_total: number;
  media_diaria: number;
  desvio_padrao: number;
  maior_consumo_dia: number;
  menor_consumo_dia: number;
}

// ============================================
// SERVICE
// ============================================

export class PontoReposicaoService {
  /**
   * Calcula o ponto de reposição baseado em histórico
   */
  static async calcularPontoReposicao(
    produtoId: string,
    periodoDias = 90
  ): Promise<PontoReposicaoCalculo> {
    try {
      // 1. Buscar produto
      const { data: produto, error: prodError } = await supabase
        .from('produtos_opme')
        .select('nome, ponto_reposicao, lead_time_dias, estoque_seguranca')
        .eq('id', produtoId)
        .single();

      if (prodError) throw prodError;

      // 2. Calcular consumo médio dos últimos X dias
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - periodoDias);

      const { data: movimentacoes } = await supabase
        .from('estoque_movimentacoes')
        .select('quantidade, data_movimentacao')
        .eq('produto_id', produtoId)
        .eq('tipo', 'saida')
        .gte('data_movimentacao', dataInicio.toISOString());

      // Calcular demanda média diária
      const consumoTotal = movimentacoes?.reduce((sum, mov) => sum + mov.quantidade, 0) || 0;
      const demandaMediaDiaria = consumoTotal / periodoDias;

      // 3. Lead time (tempo de reposição)
      const leadTimeDias = produto.lead_time_dias || 7; // Padrão 7 dias

      // 4. Estoque de segurança (buffer)
      // Fórmula: Estoque Segurança = Demanda Média × Lead Time × Fator Segurança
      // Fator Segurança padrão: 50% (0.5)
      const estoqueSeguranca = produto.estoque_seguranca || 
        Math.ceil(demandaMediaDiaria * leadTimeDias * 0.5);

      // 5. FÓRMULA FINAL: Ponto Reposição = (Demanda × Lead Time) + Estoque Segurança
      const pontoReposicaoCalculado = Math.ceil(
        (demandaMediaDiaria * leadTimeDias) + estoqueSeguranca
      );

      return {
        produto_id: produtoId,
        produto_nome: produto.nome,
        demanda_media_diaria: demandaMediaDiaria,
        lead_time_dias: leadTimeDias,
        estoque_seguranca: estoqueSeguranca,
        ponto_reposicao_calculado: pontoReposicaoCalculado,
        ponto_reposicao_atual: produto.ponto_reposicao || 0,
        sugestao_ajuste: Math.abs(pontoReposicaoCalculado - (produto.ponto_reposicao || 0)) > 5
      };
    } catch (_error) {
      console.error('Erro ao calcular ponto de reposição:', error);
      throw error;
    }
  }

  /**
   * Verifica produtos abaixo do ponto de reposição
   */
  static async verificarPontosReposicao(): Promise<ProdutoAbaixoPonto[]> {
    try {
      // Usar função SQL que já existe no banco
      const { data: produtos, error } = await supabase
        .rpc('produtos_abaixo_ponto_reposicao');

      if (error) throw error;

      const resultado: ProdutoAbaixoPonto[] = [];

      for (const prod of produtos || []) {
        const diferenca = prod.ponto_reposicao - prod.quantidade_total;
        const percentualFalta = (diferenca / prod.ponto_reposicao) * 100;

        // Calcular dias até ruptura
        const consumoMedio = await this.calcularConsumoMedio(prod.produto_id, 30);
        const diasAteRuptura = consumoMedio > 0 
          ? Math.floor(prod.quantidade_total / consumoMedio)
          : 999;

        // Determinar prioridade
        let prioridade: 'critica' | 'alta' | 'media';
        if (diasAteRuptura <= 3 || percentualFalta >= 80) {
          prioridade = 'critica';
        } else if (diasAteRuptura <= 7 || percentualFalta >= 50) {
          prioridade = 'alta';
        } else {
          prioridade = 'media';
        }

        resultado.push({
          produto_id: prod.produto_id,
          produto_nome: prod.produto_nome,
          codigo_anvisa: prod.codigo_anvisa,
          quantidade_atual: prod.quantidade_total,
          ponto_reposicao: prod.ponto_reposicao,
          diferenca,
          percentual_falta: Math.round(percentualFalta),
          dias_ate_ruptura: diasAteRuptura,
          prioridade
        });
      }

      // Ordenar por prioridade e dias até ruptura
      return resultado.sort((a, b) => {
        const prioridadeOrder = { critica: 0, alta: 1, media: 2 };
        if (prioridadeOrder[a.prioridade] !== prioridadeOrder[b.prioridade]) {
          return prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
        }
        return a.dias_ate_ruptura - b.dias_ate_ruptura;
      });
    } catch (_error) {
      console.error('Erro ao verificar pontos de reposição:', error);
      throw error;
    }
  }

  /**
   * Sugere compra automática para produtos críticos
   */
  static async sugerirCompraAutomatica(
    produtoId?: string
  ): Promise<SugestaoCompra[]> {
    try {
      const produtosAbaixo = await this.verificarPontosReposicao();
      const sugestoes: SugestaoCompra[] = [];

      // Filtrar por produto se especificado
      const produtosFiltrados = produtoId
        ? produtosAbaixo.filter(p => p.produto_id === produtoId)
        : produtosAbaixo;

      for (const produto of produtosFiltrados) {
        // Buscar informações do produto
        const { data: produtoInfo } = await supabase
          .from('produtos_opme')
          .select('custo_medio, quantidade_minima_compra, fornecedor_principal_id')
          .eq('id', produto.produto_id)
          .single();

        // Calcular quantidade sugerida
        // Fórmula: Ponto Reposição + (Consumo Médio × 30 dias) - Quantidade Atual
        const consumoMedio = await this.calcularConsumoMedio(produto.produto_id, 30);
        const quantidadeSugerida = Math.ceil(
          produto.ponto_reposicao + (consumoMedio * 30) - produto.quantidade_atual
        );

        // Ajustar para quantidade mínima de compra
        const qtdMinima = produtoInfo?.quantidade_minima_compra || 1;
        const qtdFinal = Math.max(quantidadeSugerida, qtdMinima);

        // Calcular valor estimado
        const custoMedio = produtoInfo?.custo_medio || 0;
        const valorEstimado = qtdFinal * custoMedio;

        // Determinar urgência
        let urgencia: 'imediata' | 'alta' | 'normal';
        if (produto.prioridade === 'critica') {
          urgencia = 'imediata';
        } else if (produto.prioridade === 'alta') {
          urgencia = 'alta';
        } else {
          urgencia = 'normal';
        }

        // Justificativa
        let justificativa = '';
        if (produto.dias_ate_ruptura <= 3) {
          justificativa = `URGENTE: Ruptura prevista em ${produto.dias_ate_ruptura} dias`;
        } else if (produto.percentual_falta >= 80) {
          justificativa = `Crítico: ${produto.percentual_falta}% abaixo do ponto de reposição`;
        } else {
          justificativa = `Reposição preventiva: ${produto.percentual_falta}% abaixo do ponto`;
        }

        sugestoes.push({
          produto_id: produto.produto_id,
          produto_nome: produto.produto_nome,
          quantidade_sugerida: qtdFinal,
          quantidade_minima: qtdMinima,
          valor_estimado: valorEstimado,
          urgencia,
          justificativa
        });
      }

      return sugestoes;
    } catch (_error) {
      console.error('Erro ao sugerir compra automática:', error);
      throw error;
    }
  }

  /**
   * Calcula consumo médio diário
   */
  private static async calcularConsumoMedio(
    produtoId: string,
    periodoDias: number
  ): Promise<number> {
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - periodoDias);

      const { data: movimentacoes } = await supabase
        .from('estoque_movimentacoes')
        .select('quantidade')
        .eq('produto_id', produtoId)
        .eq('tipo', 'saida')
        .gte('data_movimentacao', dataInicio.toISOString());

      const consumoTotal = movimentacoes?.reduce((sum, mov) => sum + mov.quantidade, 0) || 0;
      return consumoTotal / periodoDias;
    } catch (_error) {
      console.error('Erro ao calcular consumo médio:', error);
      return 0;
    }
  }

  /**
   * Gera histórico de consumo detalhado
   */
  static async gerarHistoricoConsumo(
    produtoId: string,
    periodoDias = 90
  ): Promise<HistoricoConsumo> {
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - periodoDias);

      const { data: movimentacoes } = await supabase
        .from('estoque_movimentacoes')
        .select('quantidade, data_movimentacao')
        .eq('produto_id', produtoId)
        .eq('tipo', 'saida')
        .gte('data_movimentacao', dataInicio.toISOString())
        .order('data_movimentacao', { ascending: true });

      if (!movimentacoes || movimentacoes.length === 0) {
        return {
          produto_id: produtoId,
          periodo_dias: periodoDias,
          consumo_total: 0,
          media_diaria: 0,
          desvio_padrao: 0,
          maior_consumo_dia: 0,
          menor_consumo_dia: 0
        };
      }

      // Agrupar por dia
      const consumoPorDia: Record<string, number> = {};
      movimentacoes.forEach(mov => {
        const data = mov.data_movimentacao.split('T')[0];
        consumoPorDia[data] = (consumoPorDia[data] || 0) + mov.quantidade;
      });

      const valores = Object.values(consumoPorDia);
      const consumoTotal = valores.reduce((sum, val) => sum + val, 0);
      const mediaDiaria = consumoTotal / periodoDias;

      // Calcular desvio padrão
      const variancia = valores.reduce((sum, val) => 
        sum + Math.pow(val - mediaDiaria, 2), 0
      ) / valores.length;
      const desvioPadrao = Math.sqrt(variancia);

      return {
        produto_id: produtoId,
        periodo_dias: periodoDias,
        consumo_total: consumoTotal,
        media_diaria: mediaDiaria,
        desvio_padrao: desvioPadrao,
        maior_consumo_dia: Math.max(...valores, 0),
        menor_consumo_dia: Math.min(...valores, 0)
      };
    } catch (_error) {
      console.error('Erro ao gerar histórico de consumo:', error);
      throw error;
    }
  }

  /**
   * Atualiza ponto de reposição de um produto
   */
  static async atualizarPontoReposicao(
    produtoId: string,
    novoPonto: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('produtos_opme')
        .update({ ponto_reposicao: novoPonto })
        .eq('id', produtoId);

      if (error) throw error;

      console.log(`✅ Ponto de reposição atualizado: ${novoPonto}`);
    } catch (_error) {
      console.error('Erro ao atualizar ponto de reposição:', error);
      throw error;
    }
  }

  /**
   * Recalcula pontos de reposição para todos os produtos
   * Deve ser executado semanalmente
   */
  static async recalcularTodosPontos(): Promise<{
    total_produtos: number;
    atualizados: number;
  }> {
    try {
      console.log('🔄 Iniciando recálculo de pontos de reposição...');

      const { data: produtos } = await supabase
        .from('produtos_opme')
        .select('id')
        .eq('ativo', true);

      if (!produtos) return { total_produtos: 0, atualizados: 0 };

      let atualizados = 0;

      for (const produto of produtos) {
        const calculo = await this.calcularPontoReposicao(produto.id);
        
        if (calculo.sugestao_ajuste) {
          await this.atualizarPontoReposicao(
            produto.id,
            calculo.ponto_reposicao_calculado
          );
          atualizados++;
        }
      }

      console.log(`✅ Recálculo finalizado: ${atualizados}/${produtos.length} atualizados`);

      return {
        total_produtos: produtos.length,
        atualizados
      };
    } catch (_error) {
      console.error('Erro ao recalcular pontos:', error);
      throw error;
    }
  }
}

