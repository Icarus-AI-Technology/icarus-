/**
 * ValidadeService - Serviço de gestão de validade de produtos
 * Sistema: ICARUS v5.0
 *
 * Funcionalidades:
 * - Verificar vencimentos
 * - Bloquear produtos vencidos automaticamente
 * - FEFO (First Expire First Out)
 * - Sugerir ações preventivas
 * - Relatórios de vencimento
 */

import { legacySupabase as supabase } from '@/lib/legacySupabase';

// ============================================
// INTERFACES
// ============================================

export interface ProdutoVencimento {
  id: string;
  produto_id: string;
  produto_nome: string;
  lote: string;
  serie?: string | null;
  data_validade: string;
  dias_restantes: number;
  quantidade: number;
  valor_total: number;
  status?: string | null;
  armazem_nome: string;
  localizacao?: string | null;
}

interface EstoqueLoteRow {
  id: string;
  produto_id: string;
  produto?: {
    nome?: string | null;
    codigo_anvisa?: string | null;
  } | null;
  lote: string;
  serie?: string | null;
  data_validade: string;
  status?: string | null;
  estoque?: Array<{
    quantidade?: number | null;
    custo_total?: number | null;
    armazem?: { nome?: string | null } | null;
    localizacao?: { codigo?: string | null } | null;
  }>;
}

export interface AcaoVencimento {
  tipo: 'bloquear' | 'devolver' | 'promocao' | 'descarte';
  prioridade: 'alta' | 'media' | 'baixa';
  descricao: string;
  prazo_dias: number;
}

export interface RelatorioVencimento {
  total_produtos: number;
  total_valor: number;
  vencidos: ProdutoVencimento[];
  vencendo_7_dias: ProdutoVencimento[];
  vencendo_30_dias: ProdutoVencimento[];
  vencendo_90_dias: ProdutoVencimento[];
}

// ============================================
// SERVICE
// ============================================

export class ValidadeService {
  /**
   * Verifica todos os vencimentos no estoque
   */
  static async verificarVencimentos(): Promise<RelatorioVencimento> {
    try {
      const hoje = new Date();
      const limite7Dias = new Date();
      limite7Dias.setDate(hoje.getDate() + 7);
      const limite30Dias = new Date();
      limite30Dias.setDate(hoje.getDate() + 30);
      const limite90Dias = new Date();
      limite90Dias.setDate(hoje.getDate() + 90);

      // Buscar todos os lotes com validade
      const { data: lotes, error } = await supabase
        .from('estoque_lotes')
        .select(
          `
          *,
          produto:produtos_opme(nome, codigo_anvisa),
          estoque!inner(
            quantidade,
            custo_total,
            armazem:estoque_armazens(nome),
            localizacao:estoque_localizacoes(codigo)
          )
        `
        )
        .not('data_validade', 'is', null)
        .order('data_validade', { ascending: true });

      if (error) throw error;

      // Processar e categorizar
      const vencidos: ProdutoVencimento[] = [];
      const vencendo7: ProdutoVencimento[] = [];
      const vencendo30: ProdutoVencimento[] = [];
      const vencendo90: ProdutoVencimento[] = [];

      let totalValor = 0;

      lotes?.forEach((lote: EstoqueLoteRow) => {
        const dataValidade = new Date(lote.data_validade);
        const diasRestantes = Math.ceil(
          (dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        );

        const produto: ProdutoVencimento = {
          id: lote.id,
          produto_id: lote.produto_id,
          produto_nome: lote.produto?.nome || 'Sem nome',
          lote: lote.lote,
          serie: lote.serie,
          data_validade: lote.data_validade,
          dias_restantes: diasRestantes,
          quantidade: lote.estoque?.[0]?.quantidade || 0,
          valor_total: lote.estoque?.[0]?.custo_total || 0,
          status: lote.status,
          armazem_nome: lote.estoque?.[0]?.armazem?.nome || 'N/A',
          localizacao: lote.estoque?.[0]?.localizacao?.codigo,
        };

        totalValor += produto.valor_total;

        if (diasRestantes < 0) {
          vencidos.push(produto);
        } else if (diasRestantes <= 7) {
          vencendo7.push(produto);
        } else if (diasRestantes <= 30) {
          vencendo30.push(produto);
        } else if (diasRestantes <= 90) {
          vencendo90.push(produto);
        }
      });

      return {
        total_produtos: lotes?.length || 0,
        total_valor: totalValor,
        vencidos,
        vencendo_7_dias: vencendo7,
        vencendo_30_dias: vencendo30,
        vencendo_90_dias: vencendo90,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao verificar vencimentos:', err);
      throw error;
    }
  }

  /**
   * Bloqueia produtos vencidos automaticamente
   */
  static async bloquearVencidos(): Promise<number> {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Atualizar lotes vencidos
      const { data: lotesVencidos, error: errorLotes } = await supabase
        .from('estoque_lotes')
        .update({
          status: 'vencido',
          bloqueado: true,
          motivo_bloqueio: 'Produto vencido automaticamente pelo sistema',
        })
        .lt('data_validade', hoje)
        .eq('status', 'ativo')
        .select();

      if (errorLotes) throw errorLotes;

      // Atualizar estoque relacionado
      if (lotesVencidos && lotesVencidos.length > 0) {
        for (const lote of lotesVencidos) {
          await supabase
            .from('estoque')
            .update({ status: 'vencido' })
            .eq('lote', lote.lote)
            .eq('produto_id', lote.produto_id);

          // Criar alerta
          await supabase.from('estoque_alertas').insert({
            produto_id: lote.produto_id,
            tipo: 'lote_bloqueado',
            severidade: 'critica',
            mensagem: `Lote ${lote.lote} vencido e bloqueado automaticamente`,
          });
        }
      }

      return lotesVencidos?.length || 0;
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao bloquear vencidos:', err);
      throw error;
    }
  }

  /**
   * Sugere ações para produtos próximos do vencimento
   */
  static async sugerirAcoesVencimento(
    produtoId: string,
    diasRestantes: number
  ): Promise<AcaoVencimento[]> {
    const acoes: AcaoVencimento[] = [];

    if (diasRestantes < 0) {
      // Produto vencido
      acoes.push({
        tipo: 'bloquear',
        prioridade: 'alta',
        descricao: 'Bloquear imediatamente e iniciar processo de descarte',
        prazo_dias: 0,
      });
      acoes.push({
        tipo: 'descarte',
        prioridade: 'alta',
        descricao: 'Seguir protocolo de descarte de produtos vencidos',
        prazo_dias: 7,
      });
    } else if (diasRestantes <= 7) {
      // Menos de 7 dias
      acoes.push({
        tipo: 'promocao',
        prioridade: 'alta',
        descricao: 'Oferecer desconto de 30-40% para venda rápida',
        prazo_dias: 7,
      });
      acoes.push({
        tipo: 'devolver',
        prioridade: 'alta',
        descricao: 'Verificar possibilidade de devolução ao fornecedor',
        prazo_dias: 5,
      });
    } else if (diasRestantes <= 30) {
      // Menos de 30 dias
      acoes.push({
        tipo: 'promocao',
        prioridade: 'media',
        descricao: 'Oferecer desconto de 15-20% ou priorizar nas vendas',
        prazo_dias: 30,
      });
      acoes.push({
        tipo: 'devolver',
        prioridade: 'media',
        descricao: 'Negociar devolução com fornecedor',
        prazo_dias: 20,
      });
    } else if (diasRestantes <= 90) {
      // Menos de 90 dias
      acoes.push({
        tipo: 'promocao',
        prioridade: 'baixa',
        descricao: 'Incluir em campanhas promocionais',
        prazo_dias: 90,
      });
    }

    return acoes;
  }

  /**
   * FEFO - First Expire First Out
   * Retorna produtos ordenados por data de validade
   */
  static async obterOrdemFEFO(produtoId: string): Promise<ProdutoVencimento[]> {
    try {
      const { data: lotes, error } = await supabase
        .from('estoque_lotes')
        .select(
          `
          *,
          produto:produtos_opme(nome),
          estoque!inner(
            quantidade,
            custo_total,
            status,
            armazem:estoque_armazens(nome),
            localizacao:estoque_localizacoes(codigo)
          )
        `
        )
        .eq('produto_id', produtoId)
        .eq('status', 'ativo')
        .gt('estoque.quantidade', 0)
        .order('data_validade', { ascending: true });

      if (error) throw error;

      const hoje = new Date();

      return (lotes || []).map((lote: EstoqueLoteRow) => {
        const dataValidade = new Date(lote.data_validade);
        const diasRestantes = Math.ceil(
          (dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: lote.id,
          produto_id: lote.produto_id,
          produto_nome: lote.produto?.nome || 'Sem nome',
          lote: lote.lote,
          serie: lote.serie,
          data_validade: lote.data_validade,
          dias_restantes: diasRestantes,
          quantidade: lote.estoque?.[0]?.quantidade || 0,
          valor_total: lote.estoque?.[0]?.custo_total || 0,
          status: lote.estoque?.[0]?.status || 'disponivel',
          armazem_nome: lote.estoque?.[0]?.armazem?.nome || 'N/A',
          localizacao: lote.estoque?.[0]?.localizacao?.codigo,
        };
      });
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao obter ordem FEFO:', err);
      throw error;
    }
  }

  /**
   * Executa rotina automática de verificação
   * Deve ser executada diariamente
   */
  static async executarRotinaAutomatica(): Promise<{
    bloqueados: number;
    alertas_criados: number;
  }> {
    try {
      console.log('🔄 Iniciando rotina automática de validade...');

      // 1. Bloquear vencidos
      const bloqueados = await this.bloquearVencidos();
      console.log(`✅ ${bloqueados} produtos bloqueados`);

      // 2. Criar alertas para produtos próximos do vencimento
      const relatorio = await this.verificarVencimentos();
      let alertasCriados = 0;

      // Alertas para vencendo em 7 dias
      for (const produto of relatorio.vencendo_7_dias) {
        await supabase.from('estoque_alertas').insert({
          produto_id: produto.produto_id,
          tipo: 'vencimento_proximo',
          severidade: 'critica',
          mensagem: `Lote ${produto.lote} vence em ${produto.dias_restantes} dias`,
          dias_vencimento: produto.dias_restantes,
        });
        alertasCriados++;
      }

      // Alertas para vencendo em 30 dias
      for (const produto of relatorio.vencendo_30_dias) {
        await supabase.from('estoque_alertas').insert({
          produto_id: produto.produto_id,
          tipo: 'vencimento_proximo',
          severidade: 'alta',
          mensagem: `Lote ${produto.lote} vence em ${produto.dias_restantes} dias`,
          dias_vencimento: produto.dias_restantes,
        });
        alertasCriados++;
      }

      console.log(`✅ ${alertasCriados} alertas criados`);
      console.log('✅ Rotina automática finalizada');

      return {
        bloqueados,
        alertas_criados: alertasCriados,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro na rotina automática:', err);
      throw error;
    }
  }
}
