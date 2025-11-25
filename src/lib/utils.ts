import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const defaultNumberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

/**
 * Formata números grandes com suporte a notação compacta (ex.: 12K, 3,4M).
 */
export function formatNumber(
  value: number | null | undefined,
  options?: { compact?: boolean; maximumFractionDigits?: number }
): string {
  const safeValue = Number.isFinite(value as number) ? (value as number) : 0;

  if (options?.compact) {
    const formatter =
      options?.maximumFractionDigits !== undefined
        ? new Intl.NumberFormat('pt-BR', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: options.maximumFractionDigits,
          })
        : compactNumberFormatter;
    return formatter.format(safeValue);
  }

  if (options?.maximumFractionDigits !== undefined) {
    const formatter = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: options.maximumFractionDigits,
    });
    return formatter.format(safeValue);
  }

  return defaultNumberFormatter.format(safeValue);
}

/**
 * Formata percentuais no padrão brasileiro.
 */
export function formatPercent(value: number | null | undefined, maximumFractionDigits = 1): string {
  const safeValue = Number.isFinite(value as number) ? (value as number) : 0;

  return (
    new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits,
    }).format(safeValue) + '%'
  );
}

/**
 * Formata valores monetários (default BRL).
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'BRL',
  options?: Intl.NumberFormatOptions
): string {
  const safeValue = Number.isFinite(value as number) ? (value as number) : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(safeValue);
}

/**
 * Formata data no padrão brasileiro (dd/mm/yyyy).
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formata data e hora no padrão brasileiro (dd/mm/yyyy HH:mm).
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formata tempo relativo (ex: "há 5 minutos", "em 2 dias").
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  return rtf.format(diffDay, 'day');
}
