/**
 * Retry Mechanism with Exponential Backoff
 * Implementação para aumentar confiabilidade de chamadas a APIs externas
 */

export interface RetryConfig {
  maxRetries: number; // Maximum number of retry attempts
  initialDelay: number; // Initial delay in ms
  maxDelay: number; // Maximum delay in ms
  backoffMultiplier: number; // Multiplier for exponential backoff
  retryableErrors?: string[]; // Error codes/messages to retry
  onRetry?: (attempt: number, error: Error) => void; // Callback on retry
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "ENETUNREACH"],
};

export class RetryError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public lastError: Error,
  ) {
    super(message);
    this.name = "RetryError";
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let attempt = 0;
  let lastError: Error;

  while (attempt <= fullConfig.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryable(error as Error, fullConfig)) {
        throw error;
      }

      // If max retries reached, throw
      if (attempt > fullConfig.maxRetries) {
        throw new RetryError(
          `Failed after ${attempt} attempts`,
          attempt,
          lastError,
        );
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        fullConfig.initialDelay *
          Math.pow(fullConfig.backoffMultiplier, attempt - 1),
        fullConfig.maxDelay,
      );

      // Call onRetry callback if provided
      if (fullConfig.onRetry) {
        fullConfig.onRetry(attempt, lastError);
      }

      console.warn(
        `Retry attempt ${attempt}/${fullConfig.maxRetries} after ${delay}ms delay. Error: ${lastError.message}`,
      );

      // Wait before retry
      await sleep(delay);
    }
  }

  throw new RetryError(`Failed after ${attempt} attempts`, attempt, lastError!);
}

/**
 * Check if error is retryable
 */
function isRetryable(error: Error, config: RetryConfig): boolean {
  // Network errors are always retryable
  const networkErrors =
    config.retryableErrors || DEFAULT_RETRY_CONFIG.retryableErrors!;
  if (networkErrors.some((code) => error.message.includes(code))) {
    return true;
  }

  // HTTP errors 5xx and 429 (rate limit) are retryable
  if ("status" in error) {
    const status = (error as any).status;
    return status >= 500 || status === 429 || status === 408;
  }

  return false;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with jitter (randomness to avoid thundering herd)
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  return retry(fn, {
    ...config,
    initialDelay: (config.initialDelay || 1000) * (0.5 + Math.random()), // Add 0-50% jitter
  });
}

/**
 * Example usage with API calls
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  config?: Partial<RetryConfig>,
): Promise<T> {
  return retry(async () => {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error: any = new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  }, config);
}

/**
 * Batch retry for multiple operations
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  config?: Partial<RetryConfig>,
): Promise<Array<T | Error>> {
  return Promise.all(
    operations.map((op) => retry(op, config).catch((err) => err as Error)),
  );
}

/**
 * Example usage:
 *
 * import { retry, fetchWithRetry } from '@/lib/retry-mechanism';
 *
 * // Basic retry
 * const result = await retry(async () => {
 *   return await someUnreliableOperation();
 * }, {
 *   maxRetries: 5,
 *   initialDelay: 2000,
 *   onRetry: (attempt, error) => {
 *     console.log(`Retry ${attempt}: ${error.message}`);
 *   }
 * });
 *
 * // Fetch with automatic retry
 * const data = await fetchWithRetry('https://api.example.com/data', {
 *   method: 'GET',
 *   headers: { 'Authorization': 'Bearer token' }
 * }, {
 *   maxRetries: 3
 * });
 */
