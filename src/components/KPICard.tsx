/**
 * KPICard - Componente de Card KPI Neumórfico
 *
 * Design System: OraclusX v5.0
 *
 * @version 1.1.0
 */

import React, { CSSProperties } from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

export type KPIColorScheme =
  | 'purple'
  | 'emerald'
  | 'blue'
  | 'yellow'
  | 'sky'
  | 'pink'
  | 'red'
  | 'indigo'
  | 'gray'
  | 'teal';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: KPIColorScheme;
  trend?: {
    value: number;
    label?: string;
  };
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorSchemes: Record<KPIColorScheme, { accent: string }> = {
  purple: { accent: '242 84% 65%' },
  emerald: { accent: '151 77% 40%' },
  blue: { accent: '210 82% 56%' },
  yellow: { accent: '43 96% 58%' },
  sky: { accent: '199 89% 60%' },
  pink: { accent: '330 81% 60%' },
  red: { accent: '355 72% 52%' },
  indigo: { accent: '247 82% 67%' },
  gray: { accent: '220 16% 60%' },
  teal: { accent: '174 73% 45%' },
};

const buildIconStyle = (accent: string): CSSProperties => ({
  background: `linear-gradient(135deg, hsla(${accent} / 0.15), hsla(${accent} / 0.08))`,
  border: `1px solid hsla(${accent} / 0.2)`,
  color: `hsl(${accent})`,
});

const positiveTrendStyles: CSSProperties = {
  background: 'hsla(var(--success) / 0.18)',
  border: '1px solid hsla(var(--success) / 0.35)',
  color: `hsl(var(--success))`,
};

const negativeTrendStyles: CSSProperties = {
  background: 'hsla(var(--destructive) / 0.18)',
  border: '1px solid hsla(var(--destructive) / 0.35)',
  color: `hsl(var(--destructive))`,
};

const neutralTrendStyles: CSSProperties = {
  background: 'hsla(var(--muted) / 0.25)',
  border: '1px solid hsla(var(--muted) / 0.45)',
  color: `hsl(var(--text-muted))`,
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme,
  trend,
  subtitle,
  loading = false,
  onClick,
  className = '',
}) => {
  const colors = colorSchemes[colorScheme];
  const iconStyle = buildIconStyle(colors.accent);

  const trendConfig = trend
    ? trend.value > 0
      ? positiveTrendStyles
      : trend.value < 0
        ? negativeTrendStyles
        : neutralTrendStyles
    : undefined;

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  if (loading) {
    return (
      <div
        className={`kpi-card animate-pulse p-6 ${className}`.trim()}
        aria-busy="true"
        aria-label={`Carregando KPI ${title}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[hsla(var(--muted)/0.35)]" />
          <div className="h-4 w-24 rounded bg-[hsla(var(--muted)/0.35)]" />
        </div>
        <div className="mb-3 h-10 w-32 rounded bg-[hsla(var(--muted)/0.35)]" />
        <div className="h-5 w-24 rounded bg-[hsla(var(--muted)/0.35)]" />
      </div>
    );
  }

  return (
    <div
      className={`kpi-card ${onClick ? 'cursor-pointer' : ''} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      aria-label={`KPI: ${title} - ${value}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="kpi-card__icon" style={iconStyle} aria-hidden="true">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="kpi-card__title text-[0.75rem] orx-font-medium uppercase">
          {title}
        </h3>
      </div>

      <div className="mb-3">
        <p className="kpi-card__value orx-text-4xl orx-font-bold leading-none tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="kpi-card__subtitle mt-1 orx-text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {trend && TrendIcon && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg px-2.5 py-1 orx-text-sm orx-font-semibold" style={trendConfig}>
            <TrendIcon className="h-4 w-4" aria-hidden="true" />
            <span>
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
          </div>
          {trend.label && (
            <span className="orx-text-xs text-[hsl(var(--text-muted))]">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;
