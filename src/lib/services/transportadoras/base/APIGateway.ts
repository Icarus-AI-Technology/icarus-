/**
 * API Gateway para Transportadoras
 * 
 * FUNCIONALIDADES:
 * - Rate limiting unificado
 * - Cache de respostas
 * - Retry automático
 * - Circuit breaker
 * - Logs e monitoramento
 * - Timeout por transportadora
 */

  CotacaoParams, 
  CotacaoResult, 
  RastreamentoResult,
  AgendarColetaParams,
  AgendarColetaResult,
  TransportadoraService 
} from './types';

interface CircuitBreakerState {
  failures: number;
  lastFailure: Date | null;
  isOpen: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class TransportadorasAPIGateway {
  private cache = new Map<string, CacheEntry<unknown>>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minuto
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutos
  private readonly DEFAULT_TIMEOUT = 15000; // 15 segundos

  /**
   * Cotar frete em múltiplas transportadoras simultaneamente
   */
  async cotarMultiplas(
    params: CotacaoParams,
    transportadoras: TransportadoraService[]
  ): Promise<CotacaoResult[]> {
    // Cache key baseado nos parâmetros
    const cacheKey = this.generateCacheKey('cotacao', params);
    const cached = this.getFromCache<CotacaoResult[]>(cacheKey);
    
    if (cached) {
      console.log('Cache HIT: cotacao');
      return cached;
    }

    // Consultar todas simultaneamente
    const promises = transportadoras.map(async (service) => {
      try {
        return await this.executeWithProtection(
          async () => await service.cotarFrete(params),
          service.constructor.name
        );
      } catch (_error) {
        console.error(`Erro em ${service.constructor.name}:`, _error);
        return [];
      }
    });

    const resultados = await Promise.allSettled(promises);

    // Processar resultados válidos
    const cotacoesValidas = resultados
      .filter((r): r is PromiseFulfilledResult<CotacaoResult[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Salvar em cache
    this.setCache(cacheKey, cotacoesValidas, this.DEFAULT_CACHE_TTL);

    return cotacoesValidas;
  }

  /**
   * Rastrear entrega com circuit breaker e retry
   */
  async rastrear(
    service: TransportadoraService,
    codigoRastreio: string
  ): Promise<RastreamentoResult> {
    const cacheKey = this.generateCacheKey('rastreamento', { codigoRastreio });
    const cached = this.getFromCache<RastreamentoResult>(cacheKey);
    
    if (cached) {
      console.log('Cache HIT: rastreamento');
      return cached;
    }

    const resultado = await this.executeWithProtection(
      async () => await service.rastrear(codigoRastreio),
      service.constructor.name
    );

    // Cache por 5 minutos
    this.setCache(cacheKey, resultado, this.DEFAULT_CACHE_TTL);

    return resultado;
  }

  /**
   * Agendar coleta com proteções
   */
  async agendarColeta(
    service: TransportadoraService,
    params: AgendarColetaParams
  ): Promise<AgendarColetaResult> {
    if (!service.agendarColeta) {
      throw new Error('Transportadora não suporta agendamento de coleta via API');
    }

    return await this.executeWithProtection(
      async () => await service.agendarColeta!(params),
      service.constructor.name
    );
  }

  /**
   * Executar com circuit breaker, retry e timeout
   */
  private async executeWithProtection<T>(
    fn: () => Promise<T>,
    serviceName: string
  ): Promise<T> {
    // Verificar circuit breaker
    const breaker = this.getCircuitBreaker(serviceName);
    
    if (breaker.isOpen) {
      const timeSinceLastFailure = Date.now() - (breaker.lastFailure?.getTime() || 0);
      
      if (timeSinceLastFailure < this.CIRCUIT_BREAKER_TIMEOUT) {
        throw new Error(`Circuit breaker aberto para ${serviceName}`);
      }
      
      // Reset circuit breaker
      breaker.isOpen = false;
      breaker.failures = 0;
    }

    // Executar com retry
    let lastError: Error | undefined;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(fn, this.DEFAULT_TIMEOUT);
        
        // Sucesso - resetar circuit breaker
        breaker.failures = 0;
        breaker.lastFailure = null;
        
        return result;
      } catch (_error) {
        lastError = error as Error;
        
        console.warn(`Tentativa ${attempt}/${maxRetries} falhou para ${serviceName}:`, _error);
        
        // Aguardar antes de retry (exponential backoff)
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // Todas as tentativas falharam
    breaker.failures += 1;
    breaker.lastFailure = new Date();

    if (breaker.failures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      breaker.isOpen = true;
      console.error(`Circuit breaker ABERTO para ${serviceName} após ${breaker.failures} falhas`);
    }

    throw lastError!;
  }

  /**
   * Executar com timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker state
   */
  private getCircuitBreaker(serviceName: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, {
        failures: 0,
        lastFailure: null,
        isOpen: false
      });
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Cache helpers
   */
  private generateCacheKey(prefix: string, data: unknown): string {
    return `${prefix}:${JSON.stringify(data)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Limpar cache antigo periodicamente
    if (this.cache.size > 1000) {
      this.clearExpiredCache();
    }
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Health check de todas as transportadoras
   */
  async healthCheckAll(
    services: TransportadoraService[]
  ): Promise<Record<string, boolean>> {
    const promises = services.map(async (service) => {
      try {
        const isHealthy = await service.healthCheck();
        return { name: service.constructor.name, healthy: isHealthy };
      } catch {
        return { name: service.constructor.name, healthy: false };
      }
    });

    const results = await Promise.allSettled(promises);
    
    const healthStatus: Record<string, boolean> = {};
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        healthStatus[result.value.name] = result.value.healthy;
      }
    });

    return healthStatus;
  }

  /**
   * Limpar cache manualmente
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Cache limpo');
  }

  /**
   * Obter estatísticas
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([name, state]) => ({
        name,
        failures: state.failures,
        isOpen: state.isOpen,
        lastFailure: state.lastFailure
      }))
    };
  }
}

// Singleton instance
export const apiGateway = new TransportadorasAPIGateway();

