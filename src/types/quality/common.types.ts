/**
 * Tipos comuns e utilitários reutilizáveis
 */

/**
 * Status genérico para entidades
 */
export type Status =
  | "ativo"
  | "inativo"
  | "pendente"
  | "cancelado"
  | "arquivado";

/**
 * Prioridade genérica
 */
export type Priority = "baixa" | "media" | "alta" | "urgente";

/**
 * Tipo genérico com ID
 */
export interface WithId {
  id: string;
}

/**
 * Tipo genérico com timestamps
 */
export interface WithTimestamps {
  created_at: string;
  updated_at: string;
}

/**
 * Tipo genérico com soft delete
 */
export interface WithSoftDelete {
  deleted_at: string | null;
}

/**
 * Tipo genérico com auditoria
 */
export interface WithAudit {
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Entidade base completa
 */
export interface BaseEntity extends WithId, WithTimestamps {
  status: Status;
}

/**
 * Resultado de operação CRUD
 */
export interface CrudResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
}

/**
 * Filtros genéricos
 */
export interface BaseFilters {
  search?: string;
  status?: Status;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Opções de paginação
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * Dados paginados
 */
export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Resultado de operação assíncrona
 */
export type AsyncResult<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper
 */
export type Optional<T> = T | undefined;

/**
 * Partial deep helper
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Omit multiple keys
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;

/**
 * Pick multiple keys
 */
export type PickMultiple<T, K extends keyof T> = Pick<T, K>;

/**
 * Make specific fields required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific fields optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Endereço padrão
 */
export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais?: string;
}

/**
 * Contato padrão
 */
export interface Contato {
  email: string;
  telefone: string;
  celular?: string;
  whatsapp?: string;
}

/**
 * Moeda/Valor
 */
export interface Moeda {
  valor: number;
  moeda: "BRL" | "USD" | "EUR";
  simbolo?: string;
}

/**
 * Período de datas
 */
export interface DateRange {
  inicio: string;
  fim: string;
}

/**
 * Coordenadas geográficas
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Arquivo/Documento
 */
export interface FileMetadata {
  nome: string;
  tipo: string;
  tamanho: number;
  url?: string;
  hash?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

/**
 * Notificação
 */
export interface Notification {
  id: string;
  tipo: "info" | "success" | "warning" | "error";
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
  acao?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  url: string;
}

/**
 * Permissão
 */
export interface Permission {
  codigo: string;
  nome: string;
  descricao?: string;
  recurso: string;
  acao: "read" | "create" | "update" | "delete" | "manage" | "all";
}

/**
 * Auditoria
 */
export interface AuditLog {
  id: string;
  usuario_id: string;
  acao: string;
  entidade: string;
  entidade_id: string;
  dados_antes?: Record<string, unknown>;
  dados_depois?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

/**
 * KPI/Métrica
 */
export interface KPI {
  nome: string;
  valor: number;
  unidade?: string;
  variacao?: number;
  periodo?: string;
  meta?: number;
}

/**
 * Chart Data Point
 */
export interface DataPoint {
  x: string | number;
  y: number;
  label?: string;
}

/**
 * Time Series Data
 */
export interface TimeSeriesData {
  data: Date;
  valor: number;
  categoria?: string;
}
