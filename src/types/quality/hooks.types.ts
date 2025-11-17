/**
 * Tipos para hooks customizados
 */

export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseMutationResult<T, V = unknown> {
  mutate: (variables: V) => Promise<T>;
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (field: keyof T, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}
