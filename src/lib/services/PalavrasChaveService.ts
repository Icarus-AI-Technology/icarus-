/**
 * PalavrasChaveService - Gerenciamento de Keywords para Portais OPME
 * 
 * Funcionalidades:
 * - Gerenciamento de palavras-chave por produto
 * - Sugestão automática com GPT-4
 * - Sinônimos e variações
 * - Auto-otimização baseada em taxa de sucesso
 * - Análise de efetividade
 * 
 * @module PalavrasChaveService
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase';

// ============================================
// TYPES E INTERFACES
// ============================================

export interface PalavraChave {
  id: string;
  produto_id: string;
  palavra_chave: string;
  tipo: 'principal' | 'sinonimo' | 'variacao' | 'codigo';
  prioridade: number;
  portal?: string;
  total_buscas: number;
  total_resultados: number;
  taxa_sucesso: number;
  sugerida_por_ia: boolean;
  confianca_ia?: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SugestaoIA {
  palavra_chave: string;
  tipo: 'principal' | 'sinonimo' | 'variacao' | 'codigo';
  prioridade: number;
  confianca: number;
  justificativa: string;
}

export interface EstatisticasPalavraChave {
  palavra_chave: string;
  total_buscas: number;
  total_resultados: number;
  taxa_sucesso: number;
  media_ofertas_por_busca: number;
  ultimo_uso: string;
  recomendacao: 'manter' | 'otimizar' | 'desativar';
}

interface ProdutoParaSugestao {
  id: string;
  descricao: string;
  codigo_anvisa?: string;
  fabricante?: string;
  categoria?: string;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

export class PalavrasChaveService {
  private static instance: PalavrasChaveService;

  private constructor() {}

  static getInstance(): PalavrasChaveService {
    if (!PalavrasChaveService.instance) {
      PalavrasChaveService.instance = new PalavrasChaveService();
    }
    return PalavrasChaveService.instance;
  }

  // ============================================
  // CRUD DE PALAVRAS-CHAVE
  // ============================================

  async buscarPalavrasChave(params: {
    produtoId: string;
    apenasAtivas?: boolean;
    portal?: string;
  }): Promise<PalavraChave[]> {
    let query = supabase
      .from('portais_opme_palavras_chave')
      .select('*')
      .eq('produto_id', params.produtoId)
      .order('prioridade', { ascending: true });

    if (params.apenasAtivas) {
      query = query.eq('ativo', true);
    }

    if (params.portal) {
      query = query.eq('portal', params.portal);
    }

    const { data, error } = await query;
    if (error) throw _error;
    return data || [];
  }

  async criarPalavraChave(palavraChave: Omit<PalavraChave, 'id' | 'created_at' | 'updated_at'>): Promise<PalavraChave> {
    const { data, error } = await supabase
      .from('portais_opme_palavras_chave')
      .insert(palavraChave)
      .select()
      .single();

    if (error) throw _error;
    return data;
  }

  async atualizarPalavraChave(id: string, updates: Partial<PalavraChave>): Promise<PalavraChave> {
    const { data, error } = await supabase
      .from('portais_opme_palavras_chave')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw _error;
    return data;
  }

  async deletarPalavraChave(id: string): Promise<void> {
    const { error } = await supabase
      .from('portais_opme_palavras_chave')
      .delete()
      .eq('id', id);

    if (error) throw _error;
  }

  // ============================================
  // SUGESTÃO COM GPT-4
  // ============================================

  async sugerirPalavrasChaveComIA(produto: ProdutoParaSugestao): Promise<SugestaoIA[]> {
    try {
      // Construir prompt para GPT-4
      const prompt = this.construirPromptIA(produto);

      // Chamar GPT-4 (simulado - substituir por chamada real)
      const sugestoes = await this.chamarGPT4(prompt);

      // Salvar sugestões no banco
      for (const sugestao of sugestoes) {
        try {
          await this.criarPalavraChave({
            produto_id: produto.id,
            palavra_chave: sugestao.palavra_chave,
            tipo: sugestao.tipo,
            prioridade: sugestao.prioridade,
            total_buscas: 0,
            total_resultados: 0,
            taxa_sucesso: 0,
            sugerida_por_ia: true,
            confianca_ia: sugestao.confianca,
            ativo: true,
          });
        } catch (_error) {
          console.error('Erro ao salvar sugestão:', _error);
        }
      }

      return sugestoes;
    } catch (_error) {
      console.error('Erro ao sugerir palavras-chave com IA:', _error);
      throw _error;
    }
  }

  private construirPromptIA(produto: ProdutoParaSugestao): string {
    return `
Você é um especialista em materiais OPME (Órteses, Próteses e Materiais Especiais) do mercado brasileiro.

PRODUTO:
- Descrição: ${produto.descricao}
- Código ANVISA: ${produto.codigo_anvisa || 'Não informado'}
- Fabricante: ${produto.fabricante || 'Não informado'}
- Categoria: ${produto.categoria || 'Não informado'}

OBJETIVO:
Gerar palavras-chave EFETIVAS para encontrar este produto em portais de cotação OPME brasileiros (OPMENEXO, Inpart Saúde, EMS Ventura, VSSupply).

REQUISITOS:
1. Incluir nome técnico EXATO do produto
2. Gerar variações e sinônimos COMUNS no mercado
3. Incluir termos POPULARES usados por compradores
4. Adicionar códigos alternativos se aplicável
5. Considerar especificidades BRASILEIRAS

FORMATO DE RESPOSTA (JSON):
{"sugestoes": [
    {"palavra_chave":"string (termo de busca)","tipo":"principal|sinonimo|variacao|codigo","prioridade": 1-10 (1=mais importante),"confianca": 0-100 (% de confiança na efetividade),"justificativa":"por que este termo é relevante"
    }
  ]
}

EXEMPLO:
Para"Prótese Total de Joelho" poderia gerar:
-"Prótese Total Joelho" (principal, prioridade 1, 95% confiança)
-"PTJ" (codigo, prioridade 2, 85% confiança)
-"Artroplastia Joelho" (sinonimo, prioridade 3, 80% confiança)
-"Prótese Joelho Total Cimentada" (variacao, prioridade 4, 75% confiança)

Gere de 5 a 10 palavras-chave relevantes.
`.trim();
  }

  private async chamarGPT4(_prompt: string): Promise<SugestaoIA[]> {
    // IMPLEMENTAÇÃO SIMULADA
    // Em produção, substituir por chamada real à OpenAI API
    console.log('[GPT-4] Gerando sugestões de palavras-chave...');

    // Mock de resposta
    return [
      {
        palavra_chave: 'Prótese Total Joelho',
        tipo: 'principal',
        prioridade: 1,
        confianca: 95,
        justificativa: 'Termo técnico mais utilizado no mercado brasileiro',
      },
      {
        palavra_chave: 'PTJ',
        tipo: 'codigo',
        prioridade: 2,
        confianca: 85,
        justificativa: 'Sigla comum entre profissionais da área',
      },
      {
        palavra_chave: 'Artroplastia Joelho',
        tipo: 'sinonimo',
        prioridade: 3,
        confianca: 80,
        justificativa: 'Nome do procedimento cirúrgico',
      },
      {
        palavra_chave: 'Prótese Joelho Cimentada',
        tipo: 'variacao',
        prioridade: 4,
        confianca: 75,
        justificativa: 'Variação específica do produto',
      },
      {
        palavra_chave: 'Joelho Artificial',
        tipo: 'sinonimo',
        prioridade: 5,
        confianca: 70,
        justificativa: 'Termo popular leigo',
      },
    ];
  }

  // ============================================
  // AUTO-OTIMIZAÇÃO
  // ============================================

  async otimizarPalavrasChaveAutomaticamente(): Promise<{
    desativadas: number;
    mantidas: number;
    otimizadas: number;
  }> {
    const resultado = {
      desativadas: 0,
      mantidas: 0,
      otimizadas: 0,
    };

    try {
      // Buscar todas as palavras-chave com pelo menos 10 buscas
      const { data: palavrasChave, error } = await supabase
        .from('portais_opme_palavras_chave')
        .select('*')
        .gte('total_buscas', 10)
        .eq('ativo', true);

      if (error) throw _error;

      for (const pc of palavrasChave || []) {
        const taxaSucesso = pc.taxa_sucesso;

        if (taxaSucesso < 10) {
          // Desativar palavras-chave ineficazes (< 10% sucesso)
          await this.atualizarPalavraChave(pc.id, { ativo: false });
          resultado.desativadas++;
        } else if (taxaSucesso < 30) {
          // Marcar para otimização (10-30% sucesso)
          resultado.otimizadas++;
          // Aqui poderia gerar novas variações com IA
        } else {
          // Manter palavras-chave eficazes (> 30% sucesso)
          resultado.mantidas++;
        }
      }

      return resultado;
    } catch (_error) {
      console.error('Erro ao otimizar palavras-chave:', _error);
      throw _error;
    }
  }

  async analisarEfetividade(produtoId: string): Promise<EstatisticasPalavraChave[]> {
    const palavrasChave = await this.buscarPalavrasChave({ produtoId });

    const estatisticas: EstatisticasPalavraChave[] = palavrasChave.map((pc) => {
      const mediaOfertas = pc.total_buscas > 0 ? pc.total_resultados / pc.total_buscas : 0;

      let recomendacao: 'manter' | 'otimizar' | 'desativar' = 'manter';
      if (pc.taxa_sucesso < 10) {
        recomendacao = 'desativar';
      } else if (pc.taxa_sucesso < 30) {
        recomendacao = 'otimizar';
      }

      return {
        palavra_chave: pc.palavra_chave,
        total_buscas: pc.total_buscas,
        total_resultados: pc.total_resultados,
        taxa_sucesso: pc.taxa_sucesso,
        media_ofertas_por_busca: mediaOfertas,
        ultimo_uso: pc.updated_at || pc.created_at || '',
        recomendacao,
      };
    });

    // Ordenar por taxa de sucesso
    estatisticas.sort((a, b) => b.taxa_sucesso - a.taxa_sucesso);

    return estatisticas;
  }

  // ============================================
  // SINCRONIZAÇÃO COM PORTAIS
  // ============================================

  async sincronizarComPortais(produtoId: string): Promise<{
    novosTermos: string[];
    termosAtualizados: number;
  }> {
    // Buscar histórico de cotações deste produto
    const { data: cotacoes, error } = await supabase
      .from('portais_opme_cotacoes')
      .select('palavra_chave, total_ofertas_encontradas')
      .eq('produto_id', produtoId)
      .order('data_cotacao', { ascending: false })
      .limit(100);

    if (error) throw _error;

    const novosTermos: string[] = [];
    const termosExistentes = new Set(
      (await this.buscarPalavrasChave({ produtoId })).map((pc) => pc.palavra_chave.toLowerCase())
    );

    // Identificar novos termos que geraram resultados
    for (const cotacao of cotacoes || []) {
      const termo = cotacao.palavra_chave.toLowerCase();
      if (!termosExistentes.has(termo) && cotacao.total_ofertas_encontradas > 0) {
        novosTermos.push(cotacao.palavra_chave);
        termosExistentes.add(termo);

        // Criar nova palavra-chave
        await this.criarPalavraChave({
          produto_id: produtoId,
          palavra_chave: cotacao.palavra_chave,
          tipo: 'variacao',
          prioridade: 5,
          total_buscas: 1,
          total_resultados: cotacao.total_ofertas_encontradas,
          taxa_sucesso: 100,
          sugerida_por_ia: false,
          ativo: true,
        });
      }
    }

    return {
      novosTermos,
      termosAtualizados: 0,
    };
  }

  // ============================================
  // RELATÓRIOS
  // ============================================

  async gerarRelatorioGeral(): Promise<{
    total_palavras_chave: number;
    ativas: number;
    inativas: number;
    sugeridas_por_ia: number;
    taxa_sucesso_media: number;
    top_10_melhores: PalavraChave[];
    top_10_piores: PalavraChave[];
  }> {
    const { data: todasPalavrasChave, error } = await supabase
      .from('portais_opme_palavras_chave')
      .select('*')
      .gte('total_buscas', 5); // Apenas com histórico significativo

    if (error) throw _error;

    const palavrasChave = todasPalavrasChave || [];
    const ativas = palavrasChave.filter((pc) => pc.ativo);
    const inativas = palavrasChave.filter((pc) => !pc.ativo);
    const sugeridasPorIA = palavrasChave.filter((pc) => pc.sugerida_por_ia);

    const taxaSucessoMedia =
      palavrasChave.reduce((sum, pc) => sum + pc.taxa_sucesso, 0) / palavrasChave.length || 0;

    // Top 10 melhores
    const top10Melhores = [...palavrasChave]
      .filter((pc) => pc.ativo)
      .sort((a, b) => b.taxa_sucesso - a.taxa_sucesso)
      .slice(0, 10);

    // Top 10 piores
    const top10Piores = [...palavrasChave]
      .filter((pc) => pc.ativo)
      .sort((a, b) => a.taxa_sucesso - b.taxa_sucesso)
      .slice(0, 10);

    return {
      total_palavras_chave: palavrasChave.length,
      ativas: ativas.length,
      inativas: inativas.length,
      sugeridas_por_ia: sugeridasPorIA.length,
      taxa_sucesso_media: taxaSucessoMedia,
      top_10_melhores: top10Melhores,
      top_10_piores: top10Piores,
    };
  }
}

// Exportar instância singleton
export const palavrasChaveService = PalavrasChaveService.getInstance();

