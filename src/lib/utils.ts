import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const defaultNumberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  compactDisplay: "short",
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
        ? new Intl.NumberFormat("pt-BR", {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: options.maximumFractionDigits,
          })
        : compactNumberFormatter;
    return formatter.format(safeValue);
  }

  if (options?.maximumFractionDigits !== undefined) {
    const formatter = new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: options.maximumFractionDigits,
    });
    return formatter.format(safeValue);
  }

  return defaultNumberFormatter.format(safeValue);
}

/**
 * Formata percentuais no padrão brasileiro.
 */
export function formatPercent(
  value: number | null | undefined,
  maximumFractionDigits = 1
): string {
  const safeValue = Number.isFinite(value as number) ? (value as number) : 0;

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits,
  }).format(safeValue) + "%";
}

/**
 * Formata valores monetários (default BRL).
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = "BRL",
  options?: Intl.NumberFormatOptions
): string {
  const safeValue = Number.isFinite(value as number) ? (value as number) : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(safeValue);
}
