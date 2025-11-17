/**
 * TrendIndicator - Indicador de tendência com ícone
 * Usado em todos os KPI Cards
 *
 * Sistema: ICARUS v5.0
 * Design: OraclusX DS
 */

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendIndicatorProps {
  value: number; // -100 a +100
  inverted?: boolean; // Para KPIs onde negativo é bom
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { icon: 14, text: "text-xs" },
  md: { icon: 16, text: "text-sm" },
  lg: { icon: 20, text: "text-base" },
};

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  inverted = false,
  size = "md",
  showPercentage = true,
  className = "",
}) => {
  // Ajustar valor se invertido
  const adjustedValue = inverted ? -value : value;

  // Determinar estado (threshold 0.5%)
  const state =
    adjustedValue > 0.5
      ? "positive"
      : adjustedValue < -0.5
        ? "negative"
        : "neutral";

  // Configurações
  const sizing = SIZE_CONFIG[size];

  const Icon =
    state === "positive"
      ? TrendingUp
      : state === "negative"
        ? TrendingDown
        : Minus;

  const colorClass =
    state === "positive"
      ? "text-success"
      : state === "negative"
        ? "text-error"
        : "text-[var(--text-secondary)]";

  // Formatar valor
  const sign = value > 0 ? "+" : "";
  const formatted = `${sign}${value.toFixed(1)}%`;

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-label={`Tendência: ${formatted}`}
    >
      <Icon className={colorClass} size={sizing.icon} aria-hidden="true" />
      {showPercentage && (
        <span className={cn(sizing.text, "font-medium", colorClass)}>
          {formatted}
        </span>
      )}
    </div>
  );
};

// Helper functions standalone
export const getTrendIcon = (trend: number) => {
  if (trend > 0.5) return TrendingUp;
  if (trend < -0.5) return TrendingDown;
  return Minus;
};

export const getTrendColor = (trend: number): string => {
  if (trend > 0.5) return "text-success";
  if (trend < -0.5) return "text-error";
  return "text-[var(--text-secondary)]";
};

export const formatTrend = (trend: number): string => {
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend.toFixed(1)}%`;
};
