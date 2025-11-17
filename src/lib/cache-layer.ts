/**
 * Cache Layer with Redis-compatible interface
 * Implementação de cache para melhorar performance e reduzir custos de APIs
 */

export interface CacheConfig {
  defaultTTL: number; // Default TTL in seconds
  prefix: string; // Key prefix for namespacing
  enabled: boolean; // Enable/disable cache
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 3600, // 1 hour
  prefix: "icarus:",
  enabled: true,
};

/**
 * In-memory cache implementation (fallback when Redis not available)
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
      createdAt: Date.now(),
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Cache Service
 */
export class CacheService {
  private config: CacheConfig;
  private memoryCache: MemoryCache;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memoryCache = new MemoryCache();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) return null;

    const fullKey = this.config.prefix + key;
    return this.memoryCache.get<T>(fullKey);
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.config.enabled) return;

    const fullKey = this.config.prefix + key;
    const cacheTTL = ttl || this.config.defaultTTL;
    await this.memoryCache.set(fullKey, value, cacheTTL);
  }

  /**
   * Delete from cache
   */
  async del(key: string): Promise<void> {
    const fullKey = this.config.prefix + key;
    await this.memoryCache.del(fullKey);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    await this.memoryCache.clear();
  }

  /**
   * Get or set (fetch if not in cache)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Cache API response
   */
  async cacheAPIResponse<T>(
    apiName: string,
    endpoint: string,
    params: Record<string, any>,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cacheKey = this.generateAPIKey(apiName, endpoint, params);
    return this.getOrSet(cacheKey, fetchFn, ttl);
  }

  /**
   * Generate cache key for API calls
   */
  private generateAPIKey(
    apiName: string,
    endpoint: string,
    params: Record<string, any>,
  ): string {
    const paramsStr = JSON.stringify(params, Object.keys(params).sort());
    const hash = this.simpleHash(paramsStr);
    return `api:${apiName}:${endpoint}:${hash}`;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.memoryCache.keys(this.config.prefix + pattern);
    await Promise.all(keys.map((key) => this.memoryCache.del(key)));
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<{
    enabled: boolean;
    prefix: string;
    defaultTTL: number;
  }> {
    return {
      enabled: this.config.enabled,
      prefix: this.config.prefix,
      defaultTTL: this.config.defaultTTL,
    };
  }
}

// Global cache service
export const cacheService = new CacheService({
  prefix: "icarus:",
  defaultTTL: 3600, // 1 hour
  enabled: true,
});

/**
 * Specific cache services
 */

// CEP cache (24 hours - CEPs don't change)
export async function cacheCEP(cep: string, data: any): Promise<void> {
  await cacheService.set(`cep:${cep}`, data, 86400); // 24 hours
}

export async function getCachedCEP(cep: string): Promise<any | null> {
  return cacheService.get(`cep:${cep}`);
}

// CNPJ cache (12 hours - changes infrequently)
export async function cacheCNPJ(cnpj: string, data: any): Promise<void> {
  await cacheService.set(`cnpj:${cnpj}`, data, 43200); // 12 hours
}

export async function getCachedCNPJ(cnpj: string): Promise<any | null> {
  return cacheService.get(`cnpj:${cnpj}`);
}

// Tracking cache (5 minutes - updates frequently)
export async function cacheTracking(codigo: string, data: any): Promise<void> {
  await cacheService.set(`tracking:${codigo}`, data, 300); // 5 minutes
}

export async function getCachedTracking(codigo: string): Promise<any | null> {
  return cacheService.get(`tracking:${codigo}`);
}

/**
 * Example usage:
 *
 * import { cacheService } from '@/lib/cache-layer';
 *
 * // Basic usage
 * const data = await cacheService.getOrSet('my-key', async () => {
 *   return await expensiveOperation();
 * }, 3600);
 *
 * // API response caching
 * const result = await cacheService.cacheAPIResponse(
 *   'correios',
 *   'rastreamento',
 *   { codigo: 'BR123456789BR' },
 *   async () => await CorreiosService.rastrear('BR123456789BR'),
 *   300 // 5 minutes
 * );
 *
 * // Invalidate cache
 * await cacheService.invalidatePattern('api:correios:*');
 */
