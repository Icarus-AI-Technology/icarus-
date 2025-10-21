/**
 * TabelasPrecosService - Serviço de Gerenciamento de Tabelas de Preços OPME
 * 
 * Gerencia tabelas de preços para produtos OPME:
 * - Tabelas por fabricante, distribuidor, hospital, convênio
 * - Preços escalonados por quantidade
 * - Histórico de alterações de preços
 * - Cálculo automático de melhor preço
 * 
 * @version 5.0.0
 */

import { supabase } from '@/lib/supabase';

// ========================================
// INTERFACES
// ========================================

export interface TabelaPreco {
  id: string;
  empresa_id: string;
  nome: string;
  codigo?: string;
  descricao?: string;
  tipo: 'fabricante' | 'distribuidor' | 'hospital' | 'convenio' | 'contrato' | 'promocional' | 'licitacao';
  hospital_id?: string;
  convenio_id?: string;
  fornecedor_id?: string;
  contrato_numero?: string;
  data_inicio: string;
  data_fim?: string;
  aplicar_automatico: boolean;
  prioridade: number;
  desconto_percentual: number;
  margem_percentual: number;
  status: 'ativa' | 'inativa' | 'em_revisao' | 'expirada';
  total_itens: number;
  valor_total_estimado: number;
  criado_por?: string;
  aprovado_por?: string;
  data_aprovacao?: string;
  criado_em: string;
  atualizado_em: string;
  excluido_em?: string;
}

export interface TabelaPrecoItem {
  id: string;
  tabela_preco_id: string;
  produto_id: string;
  preco_custo?: number;
  preco_base: number;
  preco_final: number;
  desconto_percentual: number;
  desconto_valor: number;
  margem_percentual?: number;
  margem_valor?: number;
  quantidade_minima: number;
  quantidade_maxima?: number;
  ativo: boolean;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface HistoricoPreco {
  id: string;
  produto_id: string;
  tabela_preco_id?: string;
  preco_anterior?: number;
  preco_novo: number;
  variacao_percentual?: number;
  variacao_valor?: number;
  motivo?: 'reajuste' | 'promocao' | 'negociacao' | 'correcao' | 'alteracao_custo' | 'atualizacao_tabela' | 'outro';
  descricao?: string;
  alterado_por?: string;
  data_alteracao: string;
  criado_em: string;
}

export interface MelhorPrecoResult {
  tabela_id: string;
  tabela_nome: string;
  tabela_tipo: string;
  preco_final: number;
  quantidade_minima: number;
  quantidade_maxima?: number;
}

export interface TabelaPrecoFormData {
  nome: string;
  codigo?: string;
  descricao?: string;
  tipo: TabelaPreco['tipo'];
  hospital_id?: string;
  convenio_id?: string;
  fornecedor_id?: string;
  contrato_numero?: string;
  data_inicio: string;
  data_fim?: string;
  aplicar_automatico?: boolean;
  prioridade?: number;
  desconto_percentual?: number;
  margem_percentual?: number;
  status?: TabelaPreco['status'];
}

export interface TabelaPrecoItemFormData {
  produto_id: string;
  preco_custo?: number;
  preco_base: number;
  desconto_percentual?: number;
  desconto_valor?: number;
  quantidade_minima?: number;
  quantidade_maxima?: number;
  observacoes?: string;
}

// ========================================
// SERVICE CLASS
// ========================================

class TabelasPrecosService {
  /**
   * Listar tabelas de preços com filtros e paginação
   */
  async listarTabelas(filtros?: {
    tipo?: string;
    status?: string;
    hospital_id?: string;
    convenio_id?: string;
    busca?: string;
    limite?: number;
    pagina?: number;
  }) {
    try {
      let query = supabase
        .from('tabelas_precos')
        .select('*', { count: 'exact' })
        .is('excluido_em', null);

      // Aplicar filtros
      if (filtros?.tipo && filtros.tipo !== 'todos') {
        query = query.eq('tipo', filtros.tipo);
      }

      if (filtros?.status && filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }

      if (filtros?.hospital_id) {
        query = query.eq('hospital_id', filtros.hospital_id);
      }

      if (filtros?.convenio_id) {
        query = query.eq('convenio_id', filtros.convenio_id);
      }

      if (filtros?.busca) {
        query = query.or(`nome.ilike.%${filtros.busca}%,codigo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
      }

      // Paginação
      const limite = filtros?.limite || 20;
      const pagina = filtros?.pagina || 1;
      const inicio = (pagina - 1) * limite;

      query = query
        .range(inicio, inicio + limite - 1)
        .order('prioridade', { ascending: false })
        .order('criado_em', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('[TabelasPrecos] Erro ao listar tabelas:', error);
        return { data: [], count: 0, error };
      }

      return { data: data as TabelaPreco[], count: count || 0 };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao listar tabelas:', _error);
      return { data: [], count: 0, error: _error };
    }
  }

  /**
   * Buscar tabela de preços por ID
   */
  async buscarTabela(id: string) {
    try {
      const { data, error } = await supabase
        .from('tabelas_precos')
        .select('*')
        .eq('id', id)
        .is('excluido_em', null)
        .single();

      if (error) {
        console.error('[TabelasPrecos] Erro ao buscar tabela:', error);
        return { data: null, error };
      }

      return { data: data as TabelaPreco };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao buscar tabela:', _error);
      return { data: null, error: _error };
    }
  }

  /**
   * Criar nova tabela de preços
   */
  async criarTabela(dados: TabelaPrecoFormData) {
    try {
      const { data, error } = await supabase
        .from('tabelas_precos')
        .insert({
          ...dados,
          aplicar_automatico: dados.aplicar_automatico ?? false,
          prioridade: dados.prioridade ?? 0,
          desconto_percentual: dados.desconto_percentual ?? 0,
          margem_percentual: dados.margem_percentual ?? 0,
          status: dados.status ?? 'em_revisao',
        })
        .select()
        .single();

      if (error) {
        console.error('[TabelasPrecos] Erro ao criar tabela:', error);
        return { data: null, error };
      }

      return { data: data as TabelaPreco };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao criar tabela:', _error);
      return { data: null, error: _error };
    }
  }

  /**
   * Atualizar tabela de preços
   */
  async atualizarTabela(id: string, dados: Partial<TabelaPrecoFormData>) {
    try {
      const { data, error } = await supabase
        .from('tabelas_precos')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[TabelasPrecos] Erro ao atualizar tabela:', error);
        return { data: null, error };
      }

      return { data: data as TabelaPreco };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao atualizar tabela:', _error);
      return { data: null, error: _error };
    }
  }

  /**
   * Deletar tabela de preços (soft delete)
   */
  async deletarTabela(id: string) {
    try {
      const { error } = await supabase
        .from('tabelas_precos')
        .update({ excluido_em: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('[TabelasPrecos] Erro ao deletar tabela:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao deletar tabela:', _error);
      return { success: false, error: _error };
    }
  }

  /**
   * Listar itens de uma tabela de preços
   */
  async listarItens(tabelaPrecoId: string, filtros?: {
    produto_id?: string;
    ativo?: boolean;
  }) {
    try {
      let query = supabase
        .from('tabelas_precos_itens')
        .select(`
          *,
          produto:produtos(id, codigo_sku, descricao, fabricante, categoria)
        `)
        .eq('tabela_preco_id', tabelaPrecoId);

      if (filtros?.produto_id) {
        query = query.eq('produto_id', filtros.produto_id);
      }

      if (filtros?.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      query = query.order('criado_em', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('[TabelasPrecos] Erro ao listar itens:', error);
        return { data: [], error };
      }

      return { data: data as TabelaPrecoItem[] };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao listar itens:', _error);
      return { data: [], error: _error };
    }
  }

  /**
   * Adicionar item à tabela de preços
   */
  async adicionarItem(tabelaPrecoId: string, dados: TabelaPrecoItemFormData) {
    try {
      const { data, error } = await supabase
        .from('tabelas_precos_itens')
        .insert({
          tabela_preco_id: tabelaPrecoId,
          ...dados,
          quantidade_minima: dados.quantidade_minima ?? 1,
          desconto_percentual: dados.desconto_percentual ?? 0,
          desconto_valor: dados.desconto_valor ?? 0,
          ativo: true,
        })
        .select()
        .single();

      if (error) {
        console.error('[TabelasPrecos] Erro ao adicionar item:', error);
        return { data: null, error };
      }

      return { data: data as TabelaPrecoItem };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao adicionar item:', _error);
      return { data: null, error: _error };
    }
  }

  /**
   * Atualizar item da tabela de preços
   */
  async atualizarItem(itemId: string, dados: Partial<TabelaPrecoItemFormData>) {
    try {
      const { data, error } = await supabase
        .from('tabelas_precos_itens')
        .update(dados)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('[TabelasPrecos] Erro ao atualizar item:', error);
        return { data: null, error };
      }

      return { data: data as TabelaPrecoItem };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao atualizar item:', _error);
      return { data: null, error: _error };
    }
  }

  /**
   * Remover item da tabela de preços
   */
  async removerItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('tabelas_precos_itens')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('[TabelasPrecos] Erro ao remover item:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao remover item:', _error);
      return { success: false, error: _error };
    }
  }

  /**
   * Obter melhor preço para um produto
   */
  async obterMelhorPreco(params: {
    produto_id: string;
    hospital_id?: string;
    convenio_id?: string;
    quantidade?: number;
    data?: string;
  }) {
    try {
      const { data, error } = await supabase.rpc('obter_melhor_preco', {
        p_produto_id: params.produto_id,
        p_empresa_id: (await supabase.auth.getUser()).data.user?.user_metadata?.empresa_id,
        p_hospital_id: params.hospital_id || null,
        p_convenio_id: params.convenio_id || null,
        p_quantidade: params.quantidade || 1,
        p_data: params.data || new Date().toISOString().split('T')[0],
      });

      if (error) {
        console.error('[TabelasPrecos] Erro ao obter melhor preço:', error);
        return { data: null, error };
      }

      return { data: data as MelhorPrecoResult[] };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao obter melhor preço:', _error);
      return { data: null, error: _error };
    }
  }

  /**
   * Buscar histórico de preços de um produto
   */
  async buscarHistorico(produtoId: string, limite: number = 50) {
    try {
      const { data, error } = await supabase
        .from('historico_precos')
        .select('*')
        .eq('produto_id', produtoId)
        .order('data_alteracao', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('[TabelasPrecos] Erro ao buscar histórico:', error);
        return { data: [], error };
      }

      return { data: data as HistoricoPreco[] };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao buscar histórico:', _error);
      return { data: [], error: _error };
    }
  }

  /**
   * Duplicar tabela de preços
   */
  async duplicarTabela(id: string, novoNome: string) {
    try {
      // Buscar tabela original
      const { data: tabelaOriginal, error: errorTabela } = await this.buscarTabela(id);
      if (errorTabela || !tabelaOriginal) {
        return { data: null, error: errorTabela || new Error('Tabela não encontrada') };
      }

      // Buscar itens da tabela original
      const { data: itensOriginais, error: errorItens } = await this.listarItens(id);
      if (errorItens) {
        return { data: null, error: errorItens };
      }

      // Criar nova tabela
      const { data: novaTabela, error: errorNova } = await this.criarTabela({
        nome: novoNome,
        codigo: tabelaOriginal.codigo ? `${tabelaOriginal.codigo}-COPIA` : undefined,
        descricao: `Cópia de: ${tabelaOriginal.descricao || tabelaOriginal.nome}`,
        tipo: tabelaOriginal.tipo,
        hospital_id: tabelaOriginal.hospital_id,
        convenio_id: tabelaOriginal.convenio_id,
        fornecedor_id: tabelaOriginal.fornecedor_id,
        contrato_numero: tabelaOriginal.contrato_numero,
        data_inicio: new Date().toISOString().split('T')[0],
        aplicar_automatico: false,
        prioridade: tabelaOriginal.prioridade,
        desconto_percentual: tabelaOriginal.desconto_percentual,
        margem_percentual: tabelaOriginal.margem_percentual,
        status: 'em_revisao',
      });

      if (errorNova || !novaTabela) {
        return { data: null, error: errorNova || new Error('Erro ao criar nova tabela') };
      }

      // Copiar itens
      for (const item of itensOriginais) {
        await this.adicionarItem(novaTabela.id, {
          produto_id: item.produto_id,
          preco_custo: item.preco_custo,
          preco_base: item.preco_base,
          desconto_percentual: item.desconto_percentual,
          desconto_valor: item.desconto_valor,
          quantidade_minima: item.quantidade_minima,
          quantidade_maxima: item.quantidade_maxima,
          observacoes: item.observacoes,
        });
      }

      return { data: novaTabela };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao duplicar tabela:', _error);
      return { data: null, error: _error };
    }
  }

  /**
   * Aplicar reajuste em massa
   */
  async aplicarReajuste(tabelaPrecoId: string, percentual: number, motivo?: string) {
    try {
      // Buscar todos os itens
      const { data: itens, error: errorItens } = await this.listarItens(tabelaPrecoId, { ativo: true });
      if (errorItens || !itens) {
        return { success: false, error: errorItens };
      }

      // Atualizar cada item
      const atualizacoes = itens.map((item) => {
        const novoPrecoBase = item.preco_base * (1 + percentual / 100);
        return this.atualizarItem(item.id, {
          preco_base: novoPrecoBase,
        });
      });

      await Promise.all(atualizacoes);

      return { success: true, itensAtualizados: itens.length };
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao aplicar reajuste:', _error);
      return { success: false, error: _error };
    }
  }

  /**
   * Exportar tabela para CSV
   */
  async exportarTabela(tabelaPrecoId: string): Promise<string> {
    try {
      const { data: itens } = await this.listarItens(tabelaPrecoId);

      if (!itens || itens.length === 0) {
        return '';
      }

      // Cabeçalho CSV
      const headers = [
        'Código SKU',
        'Descrição',
        'Fabricante',
        'Categoria',
        'Preço Custo',
        'Preço Base',
        'Desconto %',
        'Desconto R$',
        'Preço Final',
        'Margem %',
        'Margem R$',
        'Qtd. Mínima',
        'Qtd. Máxima',
        'Observações'
      ];

      // Linhas CSV
      const linhas = itens.map((item: any) => [
        item.produto?.codigo_sku || '',
        item.produto?.descricao || '',
        item.produto?.fabricante || '',
        item.produto?.categoria || '',
        item.preco_custo?.toFixed(2) || '',
        item.preco_base.toFixed(2),
        item.desconto_percentual.toFixed(2),
        item.desconto_valor.toFixed(2),
        item.preco_final.toFixed(2),
        item.margem_percentual?.toFixed(2) || '',
        item.margem_valor?.toFixed(2) || '',
        item.quantidade_minima,
        item.quantidade_maxima || '',
        item.observacoes || ''
      ]);

      // Gerar CSV
      const csv = [
        headers.join(','),
        ...linhas.map(linha => linha.map(campo => `"${campo}"`).join(','))
      ].join('\n');

      return csv;
    } catch (_error) {
      console.error('[TabelasPrecos] Erro ao exportar tabela:', _error);
      return '';
    }
  }
}

// Exportar instância única (singleton)
export const tabelasPrecosService = new TabelasPrecosService();

export default TabelasPrecosService;

