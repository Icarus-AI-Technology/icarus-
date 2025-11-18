// src/services/MLService.ts
import { supabase } from '@/lib/supabase';

export interface MLVector {
  id: string;
  external_id: string;
  module: string;
  metadata: Record<string, unknown>;
  embedding: number[];
  dimension: number;
  created_at: string;
  updated_at: string;
}

export interface SimilaritySearchResult {
  vector: MLVector;
  similarity: number;
}

export class MLService {
  /**
   * Salvar embedding no banco
   */
  static async saveEmbedding(
    externalId: string,
    module: string,
    embedding: number[],
    metadata: Record<string, unknown> = {}
  ): Promise<MLVector | null> {
    try {
      const { data, error } = await supabase
        .from('ml_vectors')
        .upsert({
          external_id: externalId,
          module,
          embedding,
          dimension: embedding.length,
          metadata,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'external_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar embedding:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Erro saveEmbedding:', err);
      return null;
    }
  }

  /**
   * Buscar embedding por ID externo
   */
  static async getEmbedding(externalId: string): Promise<MLVector | null> {
    try {
      const { data, error } = await supabase
        .from('ml_vectors')
        .select('*')
        .eq('external_id', externalId)
        .single();

      if (error) {
        console.error('Erro ao buscar embedding:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Erro getEmbedding:', err);
      return null;
    }
  }

  /**
   * Buscar embeddings por módulo
   */
  static async getEmbeddingsByModule(module: string): Promise<MLVector[]> {
    try {
      const { data, error } = await supabase
        .from('ml_vectors')
        .select('*')
        .eq('module', module)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar embeddings por módulo:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Erro getEmbeddingsByModule:', err);
      return [];
    }
  }

  /**
   * Buscar vetores similares (RAG - Retrieval Augmented Generation)
   * 
   * Usa a extensão pgvector para busca por similaridade
   * Requer a função personalizada no Supabase
   */
  static async searchSimilar(
    queryEmbedding: number[],
    module?: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<SimilaritySearchResult[]> {
    try {
      // TODO: Implementar com RPC function customizada no Supabase
      // Por ora, retorna busca simples por módulo
      
      let query = supabase
        .from('ml_vectors')
        .select('*');

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar similares:', error);
        return [];
      }

      if (!data) return [];

      // Calcular similaridade manualmente (cosine similarity)
      const results = data.map(vector => ({
        vector,
        similarity: this.cosineSimilarity(queryEmbedding, vector.embedding)
      }));

      // Filtrar por threshold e ordenar
      return results
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (err) {
      console.error('Erro searchSimilar:', err);
      return [];
    }
  }

  /**
   * Calcular similaridade de cosseno entre dois vetores
   */
  private static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      console.warn('Vetores de tamanhos diferentes');
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Deletar embedding
   */
  static async deleteEmbedding(externalId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ml_vectors')
        .delete()
        .eq('external_id', externalId);

      if (error) {
        console.error('Erro ao deletar embedding:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro deleteEmbedding:', err);
      return false;
    }
  }

  /**
   * Deletar embeddings por módulo
   */
  static async deleteEmbeddingsByModule(module: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ml_vectors')
        .delete()
        .eq('module', module);

      if (error) {
        console.error('Erro ao deletar embeddings por módulo:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro deleteEmbeddingsByModule:', err);
      return false;
    }
  }

  /**
   * Gerar embedding usando OpenAI (placeholder)
   * 
   * TODO: Integrar com OpenAI Embeddings API
   */
  static async generateEmbedding(_text: string): Promise<number[] | null> {
    try {
      // TODO: Integrar com OpenAI API
      // const response = await openai.embeddings.create({
      //   model: "text-embedding-ada-002",
      //   input: text,
      // });
      // return response.data[0].embedding;

      // Por ora, retorna embedding fake de 1536 dimensões
      console.warn('generateEmbedding usando dados fake. Integre com OpenAI API.');
      return Array(1536).fill(0).map(() => Math.random());
    } catch (err) {
      console.error('Erro generateEmbedding:', err);
      return null;
    }
  }

  /**
   * Indexar documento completo (texto → embedding → salvar)
   */
  static async indexDocument(
    documentId: string,
    module: string,
    text: string,
    metadata: Record<string, unknown> = {}
  ): Promise<MLVector | null> {
    try {
      // Gerar embedding
      const embedding = await this.generateEmbedding(text);
      if (!embedding) {
        console.error('Falha ao gerar embedding');
        return null;
      }

      // Salvar no banco
      return await this.saveEmbedding(
        documentId,
        module,
        embedding,
        {
          ...metadata,
          text_length: text.length,
          indexed_at: new Date().toISOString()
        }
      );
    } catch (err) {
      console.error('Erro indexDocument:', err);
      return null;
    }
  }

  /**
   * Buscar documentos relevantes (RAG completo)
   */
  static async searchRelevantDocuments(
    query: string,
    module?: string,
    limit: number = 5
  ): Promise<SimilaritySearchResult[]> {
    try {
      // Gerar embedding da query
      const queryEmbedding = await this.generateEmbedding(query);
      if (!queryEmbedding) {
        console.error('Falha ao gerar embedding da query');
        return [];
      }

      // Buscar similares
      return await this.searchSimilar(queryEmbedding, module, limit);
    } catch (err) {
      console.error('Erro searchRelevantDocuments:', err);
      return [];
    }
  }
}

