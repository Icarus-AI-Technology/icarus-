/**
 * Meilisearch Service
 * Open-source search engine (alternative to Algolia/Elasticsearch)
 * 
 * Features:
 * - Full-text search ultra-rápido (<50ms)
 * - Typo tolerance
 * - Faceted search
 * - Geo search
 * - Multi-language
 * - Highlights
 * 
 * Custo: $0 (self-hosted) vs $600-2,400/ano (Algolia)
 */

export interface SearchDocument {
  id: string;
  [key: string]: string | number | boolean | null | string[] | number[] | boolean[] | Record<string, unknown> | undefined;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
  attributesToCrop?: string[];
  filter?: string;
  sort?: string[];
  matchingStrategy?: 'all' | 'last';
}

export interface SearchResult<T = Record<string, unknown>> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export class MeilisearchService {
  private baseURL: string;
  private apiKey: string;
  private enabled: boolean;

  constructor(baseURL?: string, apiKey?: string) {
    this.baseURL = baseURL || process.env.VITE_MEILISEARCH_URL || 'http://localhost:7700';
    this.apiKey = apiKey || process.env.VITE_MEILISEARCH_API_KEY || '';
    this.enabled = !!this.baseURL;

    if (!this.enabled) {
      console.warn('[Meilisearch] Not configured. Set VITE_MEILISEARCH_URL');
    }
  }

  /**
   * Busca em um índice
   */
  async search<T = Record<string, unknown>>(
    indexName: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    if (!this.enabled) {
      console.warn('[Meilisearch] Service disabled, returning empty results');
      return {
        hits: [],
        query,
        processingTimeMs: 0,
        limit: options.limit || 20,
        offset: options.offset || 0,
        estimatedTotalHits: 0,
      };
    }

    try {
      const response = await fetch(`${this.baseURL}/indexes/${indexName}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          q: query,
          limit: options.limit || 20,
          offset: options.offset || 0,
          attributesToRetrieve: options.attributesToRetrieve,
          attributesToHighlight: options.attributesToHighlight,
          attributesToCrop: options.attributesToCrop,
          filter: options.filter,
          sort: options.sort,
          matchingStrategy: options.matchingStrategy || 'last',
        }),
      });

      if (!response.ok) {
        throw new Error(`Meilisearch error: ${response.status}`);
      }

      return (await response.json()) as SearchResult<T>;
    } catch (error) {
   const err = error as Error;
      console.error('[Meilisearch] Search error:', err);
      throw error;
    }
  }

  /**
   * Adiciona documentos a um índice
   */
  async addDocuments(indexName: string, documents: SearchDocument[]): Promise<void> {
    if (!this.enabled) return;

    try {
      const response = await fetch(`${this.baseURL}/indexes/${indexName}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(documents),
      });

      if (!response.ok) {
        throw new Error(`Meilisearch error: ${response.status}`);
      }

      console.log(`[Meilisearch] Added ${documents.length} documents to ${indexName}`);
    } catch (error) {
   const err = error as Error;
      console.error('[Meilisearch] Add documents error:', err);
      throw error;
    }
  }

  /**
   * Atualiza documentos
   */
  async updateDocuments(indexName: string, documents: SearchDocument[]): Promise<void> {
    if (!this.enabled) return;

    try {
      const response = await fetch(`${this.baseURL}/indexes/${indexName}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(documents),
      });

      if (!response.ok) {
        throw new Error(`Meilisearch error: ${response.status}`);
      }
    } catch (error) {
   const err = error as Error;
      console.error('[Meilisearch] Update documents error:', err);
      throw error;
    }
  }

  /**
   * Remove documento
   */
  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    if (!this.enabled) return;

    try {
      const response = await fetch(
        `${this.baseURL}/indexes/${indexName}/documents/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Meilisearch error: ${response.status}`);
      }
    } catch (error) {
   const err = error as Error;
      console.error('[Meilisearch] Delete document error:', err);
      throw error;
    }
  }

  /**
   * Cria ou atualiza índice
   */
  async createIndex(indexName: string, primaryKey = 'id'): Promise<void> {
    if (!this.enabled) return;

    try {
      const response = await fetch(`${this.baseURL}/indexes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          uid: indexName,
          primaryKey,
        }),
      });

      if (!response.ok && response.status !== 409) {
        // 409 = index already exists
        throw new Error(`Meilisearch error: ${response.status}`);
      }

      console.log(`[Meilisearch] Index ${indexName} created`);
    } catch (error) {
   const err = error as Error;
      console.error('[Meilisearch] Create index error:', err);
      throw error;
    }
  }

  /**
   * Configura índice (searchable attributes, filters, etc.)
   */
  async configureIndex(
    indexName: string,
    config: {
      searchableAttributes?: string[];
      filterableAttributes?: string[];
      sortableAttributes?: string[];
      displayedAttributes?: string[];
      rankingRules?: string[];
    }
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      // Update settings
      const response = await fetch(`${this.baseURL}/indexes/${indexName}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Meilisearch error: ${response.status}`);
      }

      console.log(`[Meilisearch] Index ${indexName} configured`);
    } catch (error) {
   const err = error as Error;
      console.error('[Meilisearch] Configure index error:', err);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Estatísticas do índice
   */
  async getIndexStats(indexName: string): Promise<{
    numberOfDocuments: number;
    isIndexing: boolean;
    fieldDistribution: Record<string, number>;
  } | null> {
    if (!this.enabled) return null;

    try {
      const response = await fetch(`${this.baseURL}/indexes/${indexName}/stats`, {
        headers: {
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
      });

      if (!response.ok) return null;

      return await response.json();
    } catch {
      return null;
    }
  }
}

// Export singleton
export const meilisearchService = new MeilisearchService();

/**
 * Índices pré-configurados para ICARUS
 */

// Índice: Cirurgias
export async function setupCirurgiasIndex(): Promise<void> {
  await meilisearchService.createIndex('cirurgias');
  await meilisearchService.configureIndex('cirurgias', {
    searchableAttributes: [
      'paciente_nome',
      'medico_nome',
      'procedimento',
      'hospital_nome',
      'status',
    ],
    filterableAttributes: ['status', 'data_cirurgia', 'medico_id', 'hospital_id'],
    sortableAttributes: ['data_cirurgia', 'created_at'],
  });
}

// Índice: Produtos OPME
export async function setupProdutosIndex(): Promise<void> {
  await meilisearchService.createIndex('produtos');
  await meilisearchService.configureIndex('produtos', {
    searchableAttributes: [
      'nome',
      'descricao',
      'codigo_interno',
      'codigo_anvisa',
      'fabricante',
    ],
    filterableAttributes: ['categoria', 'ativo', 'fabricante_id'],
    sortableAttributes: ['nome', 'created_at'],
  });
}

// Índice: Fornecedores
export async function setupFornecedoresIndex(): Promise<void> {
  await meilisearchService.createIndex('fornecedores');
  await meilisearchService.configureIndex('fornecedores', {
    searchableAttributes: ['razao_social', 'nome_fantasia', 'cnpj', 'contato_nome'],
    filterableAttributes: ['ativo', 'tipo'],
    sortableAttributes: ['razao_social', 'created_at'],
  });
}

// Busca global (multi-índice)
export async function searchGlobal(query: string): Promise<{
  cirurgias: SearchResult['hits'];
  produtos: SearchResult['hits'];
  fornecedores: SearchResult['hits'];
}> {
  const [cirurgias, produtos, fornecedores] = await Promise.all([
    meilisearchService.search('cirurgias', query, { limit: 5 }),
    meilisearchService.search('produtos', query, { limit: 5 }),
    meilisearchService.search('fornecedores', query, { limit: 5 }),
  ]);

  return {
    cirurgias: cirurgias.hits,
    produtos: produtos.hits,
    fornecedores: fornecedores.hits,
  };
}

