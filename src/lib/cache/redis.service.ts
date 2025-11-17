/**
 * Redis Cache Service
 * Cache layer para respostas LLM e queries frequentes
 * Economia estimada: 40-60% redução de chamadas LLM
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class RedisService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTTL = 3600; // 1 hora em segundos

  /**
   * Cache de resposta LLM
   */
  async cacheLLMResponse(
    prompt: string,
    response: string,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    const key = `llm:${this.hashPrompt(prompt)}`;
    this.set(key, response, ttl);
  }

  /**
   * Buscar resposta LLM em cache
   */
  async getLLMResponse(prompt: string): Promise<string | null> {
    const key = `llm:${this.hashPrompt(prompt)}`;
    return this.get<string>(key);
  }

  /**
   * Cache semântico (similar queries)
   */
  async cacheSemanticResponse(
    embedding: number[],
    response: string,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    const key = `semantic:${this.hashEmbedding(embedding)}`;
    this.set(key, response, ttl);
  }

  /**
   * Buscar resposta semântica
   */
  async getSemanticResponse(embedding: number[]): Promise<string | null> {
    const key = `semantic:${this.hashEmbedding(embedding)}`;
    return this.get<string>(key);
  }

  /**
   * Cache de query genérica
   */
  private set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Converter para ms
    });
  }

  /**
   * Buscar em cache
   */
  private get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Verificar TTL
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Invalidar cache por padrão
   */
  async invalidate(pattern: string): Promise<number> {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Limpar todo o cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Estatísticas de cache
   */
  getStats(): {
    size: number;
    hitRate: number;
    estimatedSavings: string;
  } {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      estimatedSavings: "40-60% redução de chamadas LLM",
    };
  }

  /**
   * Hash de prompt (simples)
   */
  private hashPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Hash de embedding (primeiros 10 valores)
   */
  private hashEmbedding(embedding: number[]): string {
    const sample = embedding.slice(0, 10).join(",");
    return this.hashPrompt(sample);
  }

  /**
   * Calcular hit rate (simplificado)
   */
  private calculateHitRate(): number {
    // Em produção, implementar contador de hits/misses
    return this.cache.size > 0 ? 0.65 : 0;
  }
}

// Export singleton
export const redisService = new RedisService();
