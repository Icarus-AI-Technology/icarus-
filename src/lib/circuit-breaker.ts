/**
 * Circuit Breaker Pattern for External APIs
 * Implementação para resiliência de integrações externas
 * Previne cascata de falhas bloqueando chamadas a APIs com falhas repetidas
 */

export enum CircuitState {
  CLOSED = "CLOSED", // Normal operation
  OPEN = "OPEN", // Blocking requests
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Time in ms to wait before attempting half-open
  resetTimeout: number; // Time to stay in HALF_OPEN before reverting
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
  totalCalls: number;
  totalFailures: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  resetTimeout: 10000, // 10 seconds
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;
  private totalCalls: number = 0;
  private totalFailures: number = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = DEFAULT_CONFIG,
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    // Check if circuit is OPEN
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        console.log(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`);
      } else {
        throw new Error(
          `Circuit breaker is OPEN for ${this.name}. Next attempt at ${new Date(this.nextAttemptTime!).toISOString()}`,
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) return false;
    return Date.now() >= this.nextAttemptTime;
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;

      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        console.log(`[CircuitBreaker:${this.name}] Circuit CLOSED (recovered)`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Immediately open if failure in HALF_OPEN
      this.state = CircuitState.OPEN;
      this.successes = 0;
      this.nextAttemptTime = Date.now() + this.config.timeout;
      console.log(
        `[CircuitBreaker:${this.name}] Circuit OPEN (failed in HALF_OPEN). Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`,
      );
    } else if (this.failures >= this.config.failureThreshold) {
      // Open circuit if threshold reached
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.timeout;
      console.log(
        `[CircuitBreaker:${this.name}] Circuit OPEN (threshold reached: ${this.failures} failures). Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`,
      );
    }
  }

  /**
   * Get current circuit breaker stats
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
    console.log(`[CircuitBreaker:${this.name}] Circuit manually reset`);
  }

  /**
   * Force circuit to OPEN state
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.timeout;
    console.log(`[CircuitBreaker:${this.name}] Circuit manually OPENED`);
  }
}

/**
 * Circuit Breaker Manager
 * Manages multiple circuit breakers for different services
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(
    serviceName: string,
    config?: CircuitBreakerConfig,
  ): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker(serviceName, config));
    }
    return this.breakers.get(serviceName)!;
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    serviceName: string,
    fn: () => Promise<T>,
    config?: CircuitBreakerConfig,
  ): Promise<T> {
    const breaker = this.getBreaker(serviceName, config);
    return breaker.execute(fn);
  }

  /**
   * Get stats for all circuit breakers
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats();
    });
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker) => breaker.reset());
  }

  /**
   * Reset a specific circuit breaker
   */
  reset(serviceName: string): void {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.reset();
    }
  }
}

// Global circuit breaker manager
export const circuitBreakerManager = new CircuitBreakerManager();

/**
 * Example usage:
 *
 * import { circuitBreakerManager } from '@/lib/circuit-breaker';
 *
 * // Execute with circuit breaker
 * const result = await circuitBreakerManager.execute('correios-api', async () => {
 *   return await CorreiosService.rastrear('BR123456789BR');
 * });
 *
 * // Get stats
 * const stats = circuitBreakerManager.getAllStats();
 * console.log('Circuit breakers:', stats);
 *
 * // Manual reset if needed
 * circuitBreakerManager.reset('correios-api');
 */
