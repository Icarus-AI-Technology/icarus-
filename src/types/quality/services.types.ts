/**
 * Tipos centralizados para Services
 */

/**
 * Resultado genérico de operação de serviço
 */
export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Opções de configuração de serviço
 */
export interface ServiceOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
}

/**
 * Status de health check
 */
export interface HealthCheckResult {
  healthy: boolean;
  service: string;
  timestamp: string;
  latency_ms?: number;
  error?: string;
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

/**
 * Transportadoras - Cotação
 */
export interface FreightQuoteRequest {
  cepOrigem: string;
  cepDestino: string;
  peso: number;
  volumes: number;
  valorDeclarado: number;
  tipoFrete?: "normal" | "expresso";
}

export interface FreightQuoteResponse {
  transportadora: string;
  servico: string;
  valor: number;
  prazo_dias: number;
  prazo_data: string;
  observacoes?: string;
}

/**
 * Transportadoras - Rastreamento
 */
export interface TrackingRequest {
  codigoRastreio: string;
  transportadora: string;
}

export interface TrackingResponse {
  codigo: string;
  status:
    | "postado"
    | "em_transito"
    | "saiu_para_entrega"
    | "entregue"
    | "devolvido";
  ultimaAtualizacao: string;
  localizacao?: string;
  historico: TrackingEvent[];
}

export interface TrackingEvent {
  data: string;
  hora: string;
  descricao: string;
  local: string;
}

/**
 * Email Service
 */
export interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, unknown>;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * SMS Service
 */
export interface SmsRequest {
  to: string;
  message: string;
  from?: string;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

/**
 * Webhook
 */
export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature?: string;
}

export interface WebhookResponse {
  received: boolean;
  processed: boolean;
  error?: string;
}

/**
 * Cache
 */
export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Queue/Background Jobs
 */
export interface JobPayload<T = unknown> {
  id: string;
  type: string;
  data: T;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
}

export interface JobResult {
  success: boolean;
  result?: unknown;
  error?: string;
  duration_ms?: number;
}

/**
 * File Upload
 */
export interface FileUploadRequest {
  file: File;
  bucket: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  size?: number;
  error?: string;
}

/**
 * Search/Meilisearch
 */
export interface SearchQuery {
  q: string;
  filters?: Record<string, unknown>;
  sort?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  hits: T[];
  total: number;
  query: string;
  processingTimeMs: number;
  page: number;
  hitsPerPage: number;
}
