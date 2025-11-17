/**
 * Tipos centralizados para respostas de API
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details: string;
    hint: string;
  } | null;
}
