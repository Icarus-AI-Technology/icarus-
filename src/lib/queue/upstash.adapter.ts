/**
 * Upstash Redis Adapter para BullMQ
 * Usa Upstash REST API em vez de Redis client tradicional
 * Ideal para edge/serverless/cloud deployment
 */

interface UpstashRedisConfig {
  url: string;
  token: string;
}

export class UpstashRedisAdapter {
  private url: string;
  private token: string;

  constructor(config: UpstashRedisConfig) {
    this.url = config.url;
    this.token = config.token;
  }

  /**
   * Execute Redis command via REST API
   */
  private async execute(command: string[]): Promise<any> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Upstash Redis error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  /**
   * Set key-value
   */
  async set(key: string, value: string, expiryMs?: number): Promise<void> {
    const command = ['SET', key, value];
    if (expiryMs) {
      command.push('PX', expiryMs.toString());
    }
    await this.execute(command);
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    return await this.execute(['GET', key]);
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<number> {
    return await this.execute(['DEL', key]);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.execute(['EXISTS', key]);
    return result === 1;
  }

  /**
   * Add to list (queue)
   */
  async lpush(key: string, value: string): Promise<number> {
    return await this.execute(['LPUSH', key, value]);
  }

  /**
   * Pop from list (queue)
   */
  async rpop(key: string): Promise<string | null> {
    return await this.execute(['RPOP', key]);
  }

  /**
   * Get list length
   */
  async llen(key: string): Promise<number> {
    return await this.execute(['LLEN', key]);
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    return await this.execute(['INCR', key]);
  }

  /**
   * Set expiry
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.execute(['EXPIRE', key, seconds.toString()]);
    return result === 1;
  }

  /**
   * Get keys by pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.execute(['KEYS', pattern]);
  }

  /**
   * Ping (health check)
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.execute(['PING']);
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

// Export singleton
export const upstashRedis = new UpstashRedisAdapter({
  url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL || '',
  token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN || '',
});

