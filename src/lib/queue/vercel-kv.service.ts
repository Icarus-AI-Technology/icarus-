/**
 * Vercel KV Adapter (Redis gerenciado)
 * Substitui Upstash com serviço nativo Vercel
 *
 * Free tier: 256MB + 10k commands/dia
 */

import { kv } from '@vercel/kv';

export interface JobData {
  id: string;
  type: string;
  data: unknown;
  priority?: number;
  createdAt: number;
}

export class VercelKVQueueService {
  private queueKey = 'queue:jobs';
  private statsKey = 'queue:stats';

  /**
   * Adicionar job à fila
   */
  async addJob(job: Omit<JobData, 'id' | 'createdAt'>): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const fullJob: JobData = {
      ...job,
      id: jobId,
      createdAt: Date.now(),
    };

    // Adicionar à fila (left push para ordem FIFO)
    await kv.lpush(this.queueKey, JSON.stringify(fullJob));

    // Incrementar contador
    await kv.hincrby(this.statsKey, 'total', 1);
    await kv.hincrby(this.statsKey, 'waiting', 1);

    return jobId;
  }

  /**
   * Pegar próximo job da fila
   */
  async getNextJob(): Promise<JobData | null> {
    const jobStr = await kv.rpop<string>(this.queueKey);

    if (!jobStr) return null;

    const job = JSON.parse(jobStr) as JobData;

    // Atualizar stats
    await kv.hincrby(this.statsKey, 'waiting', -1);
    await kv.hincrby(this.statsKey, 'active', 1);

    return job;
  }

  /**
   * Marcar job como completo
   */
  async completeJob(jobId: string): Promise<void> {
    await kv.hincrby(this.statsKey, 'active', -1);
    await kv.hincrby(this.statsKey, 'completed', 1);

    // Salvar timestamp de conclusão
    await kv.set(`job:${jobId}:completed`, Date.now(), { ex: 86400 }); // 24h TTL
  }

  /**
   * Marcar job como falho
   */
  async failJob(jobId: string, error: string): Promise<void> {
    await kv.hincrby(this.statsKey, 'active', -1);
    await kv.hincrby(this.statsKey, 'failed', 1);

    // Salvar erro
    await kv.set(`job:${jobId}:error`, error, { ex: 86400 }); // 24h TTL
  }

  /**
   * Obter estatísticas da fila
   */
  async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const stats = await kv.hgetall<Record<string, string>>(this.statsKey);

    return {
      waiting: parseInt(stats?.waiting || '0'),
      active: parseInt(stats?.active || '0'),
      completed: parseInt(stats?.completed || '0'),
      failed: parseInt(stats?.failed || '0'),
      total: parseInt(stats?.total || '0'),
    };
  }

  /**
   * Limpar fila
   */
  async clearQueue(): Promise<void> {
    await kv.del(this.queueKey);
    await kv.del(this.statsKey);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await kv.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obter tamanho da fila
   */
  async getQueueLength(): Promise<number> {
    return await kv.llen(this.queueKey);
  }
}

// Export singleton
export const vercelKVQueue = new VercelKVQueueService();

/**
 * Helper functions para casos de uso comuns
 */

// Job: Enviar e-mail
export async function queueSendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<string> {
  return vercelKVQueue.addJob({
    type: 'send_email',
    data: params,
    priority: 5,
  });
}

// Job: Processar NFe
export async function queueProcessNFe(params: { nfeId: string; xml: string }): Promise<string> {
  return vercelKVQueue.addJob({
    type: 'process_nfe',
    data: params,
    priority: 8,
  });
}

// Job: Gerar relatório
export async function queueGenerateReport(params: {
  reportType: string;
  filters: Record<string, unknown>;
  userId: string;
}): Promise<string> {
  return vercelKVQueue.addJob({
    type: 'generate_report',
    data: params,
    priority: 3,
  });
}

// Job: Sync estoque
export async function queueSyncEstoque(): Promise<string> {
  return vercelKVQueue.addJob({
    type: 'sync_estoque',
    data: { timestamp: Date.now() },
    priority: 6,
  });
}
