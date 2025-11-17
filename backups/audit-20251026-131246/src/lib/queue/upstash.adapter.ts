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
  private async execute<T = unknown>(command: string[]): Promise<T> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Upstash Redis error: ${response.statusText}`);
    }

    const data = (await response.json()) as { result: T };
    return data.result;
  }

  /**
   * Set key-value
   */
  async set(key: string, value: string, expiryMs?: number): Promise<void> {
    const command = ["SET", key, value];
    if (expiryMs) {
      command.push("PX", expiryMs.toString());
    }
    await this.execute(command);
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    return await this.execute<string | null>(["GET", key]);
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<number> {
    return await this.execute<number>(["DEL", key]);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.execute<number>(["EXISTS", key]);
    return result === 1;
  }

  /**
   * Add to list (queue)
   */
  async lpush(key: string, value: string): Promise<number> {
    return await this.execute<number>(["LPUSH", key, value]);
  }

  /**
   * Pop from list (queue)
   */
  async rpop(key: string): Promise<string | null> {
    return await this.execute<string | null>(["RPOP", key]);
  }

  /**
   * Get list length
   */
  async llen(key: string): Promise<number> {
    return await this.execute<number>(["LLEN", key]);
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    return await this.execute<number>(["INCR", key]);
  }

  /**
   * Set expiry
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.execute<number>([
      "EXPIRE",
      key,
      seconds.toString(),
    ]);
    return result === 1;
  }

  /**
   * Get keys by pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.execute<string[]>(["KEYS", pattern]);
  }

  /**
   * Ping (health check)
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.execute<string>(["PING"]);
      return result === "PONG";
    } catch {
      return false;
    }
  }
}

// Export singleton
export const upstashRedis = new UpstashRedisAdapter({
  url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL || "",
  token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN || "",
});
