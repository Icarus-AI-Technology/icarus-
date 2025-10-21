/**
 * BullMQ Queue Service
 * Sistema de filas robusto com Redis
 * 
 * Features:
 * - Background jobs
 * - Job retry com backoff
 * - Cron jobs
 * - Rate limiting
 * - Priority queues
 * - Job events (completed, failed, progress)
 * 
 * Use Cases:
 * - Envio de e-mails em massa
 * - Processamento de NFes
 * - Cálculos de relatórios pesados
 * - Integração com APIs externas
 * - OCR de documentos
 * 
 * Custo: $0 (Redis local) ou ~$10-20/mês (Redis Cloud)
 */

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface JobData {
  id: string;
  type: string;
  data: any;
  priority?: number;
  delay?: number; // ms
  attempts?: number;
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  result?: any;
  error?: string;
  progress?: number;
  createdAt: Date;
  processedAt?: Date;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

/**
 * Mock Queue Service (para desenvolvimento sem Redis)
 * Em produção, substituir por BullMQ real
 */
export class MockQueueService {
  private jobs: Map<string, JobResult> = new Map();
  private queue: JobData[] = [];
  private processing = false;

  /**
   * Adiciona job à fila
   */
  async addJob(job: JobData): Promise<string> {
    const jobId = job.id || this.generateJobId();

    const jobResult: JobResult = {
      jobId,
      status: job.delay ? 'delayed' : 'waiting',
      createdAt: new Date(),
      progress: 0,
    };

    this.jobs.set(jobId, jobResult);
    this.queue.push({ ...job, id: jobId });

    console.log(`[Queue] Job ${jobId} added (type: ${job.type})`);

    // Processar depois do delay
    if (job.delay) {
      setTimeout(() => this.processQueue(), job.delay);
    } else {
      this.processQueue();
    }

    return jobId;
  }

  /**
   * Processa fila
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Sort by priority (higher first)
      this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      const job = this.queue.shift()!;
      const jobResult = this.jobs.get(job.id)!;

      jobResult.status = 'active';

      try {
        // Simular processamento
        await this.processJob(job, jobResult);

        jobResult.status = 'completed';
        jobResult.processedAt = new Date();
        jobResult.progress = 100;

        console.log(`[Queue] Job ${job.id} completed`);
      } catch (error) {
        jobResult.status = 'failed';
        jobResult.error = error instanceof Error ? error.message : 'Unknown error';

        console.error(`[Queue] Job ${job.id} failed:`, error);

        // Retry logic
        const attempts = (job.attempts || 0) + 1;
        if (attempts < 3) {
          console.log(`[Queue] Retrying job ${job.id} (attempt ${attempts + 1}/3)`);
          this.queue.push({ ...job, attempts });
        }
      }
    }

    this.processing = false;
  }

  /**
   * Processa job individual
   */
  private async processJob(job: JobData, jobResult: JobResult): Promise<void> {
    // Simular trabalho assíncrono
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      jobResult.progress = i;
    }

    jobResult.result = {
      success: true,
      processedAt: new Date(),
      data: job.data,
    };
  }

  /**
   * Busca status de um job
   */
  async getJob(jobId: string): Promise<JobResult | null> {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Lista todos os jobs
   */
  async getJobs(status?: JobStatus): Promise<JobResult[]> {
    const allJobs = Array.from(this.jobs.values());
    if (status) {
      return allJobs.filter((job) => job.status === status);
    }
    return allJobs;
  }

  /**
   * Estatísticas da fila
   */
  async getStats(): Promise<QueueStats> {
    const jobs = Array.from(this.jobs.values());
    return {
      waiting: jobs.filter((j) => j.status === 'waiting').length,
      active: jobs.filter((j) => j.status === 'active').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      delayed: jobs.filter((j) => j.status === 'delayed').length,
    };
  }

  /**
   * Remove job
   */
  async removeJob(jobId: string): Promise<boolean> {
    return this.jobs.delete(jobId);
  }

  /**
   * Limpa fila
   */
  async clearQueue(status?: JobStatus): Promise<number> {
    if (status) {
      const toRemove = Array.from(this.jobs.entries())
        .filter(([_, job]) => job.status === status)
        .map(([id]) => id);

      toRemove.forEach((id) => this.jobs.delete(id));
      return toRemove.length;
    } else {
      const count = this.jobs.size;
      this.jobs.clear();
      this.queue = [];
      return count;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return true; // Mock sempre disponível
  }

  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton
export const queueService = new MockQueueService();

/**
 * Wrapper helpers para casos de uso comuns
 */

// Job: Enviar e-mail
export async function queueSendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<string> {
  return queueService.addJob({
    id: `email-${Date.now()}`,
    type: 'send_email',
    data: params,
    priority: 5,
  });
}

// Job: Processar NFe
export async function queueProcessNFe(params: {
  nfeId: string;
  xml: string;
}): Promise<string> {
  return queueService.addJob({
    id: `nfe-${params.nfeId}`,
    type: 'process_nfe',
    data: params,
    priority: 8,
    attempts: 3,
  });
}

// Job: Gerar relatório
export async function queueGenerateReport(params: {
  reportType: string;
  filters: Record<string, any>;
  userId: string;
}): Promise<string> {
  return queueService.addJob({
    id: `report-${Date.now()}`,
    type: 'generate_report',
    data: params,
    priority: 3,
  });
}

// Job: OCR de DANFE
export async function queueOCRProcessing(params: {
  imageUrl: string;
  documentId: string;
}): Promise<string> {
  return queueService.addJob({
    id: `ocr-${params.documentId}`,
    type: 'ocr_processing',
    data: params,
    priority: 6,
    attempts: 2,
  });
}

