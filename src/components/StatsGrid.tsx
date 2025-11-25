/**
 * OraclusX DS - StatsGrid Component
 * Grid de estatísticas/KPIs reutilizável
 */

import { type FC } from 'react';
import { cn } from '@/lib/utils';
import { KPICard, type KPIColorScheme } from './KPICard';
import { KPI_COL } from './kpiLayout';
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;

export interface StatTrendObject {
  value: number | string;
  label?: string;
}

export interface StatItem {
  /** Label/título da estatística */
  label?: string;
  title?: string;
  /** Valor da estatística */
  value: string | number;
  /** Ícone da estatística */
  icon: LucideIcon;
  /** Trend (string ou objeto) */
  trend?: string | StatTrendObject;
  /** Força direção da trend */
  trendUp?: boolean;
  /** Esquema de cores */
  colorScheme?: KPIColorScheme;
  /** Loading individual */
  loading?: boolean;
}

export interface StatsGridProps {
  /** Array de estatísticas para exibir */
  stats: StatItem[];
  /** Número de colunas no grid */
  columns?: 2 | 3 | 4 | 6;
  /** Aplicar animação stagger */
  animated?: boolean;
  /** Exibir skeleton em vez dos cards */
  loading?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

const columnClasses: Record<NonNullable<StatsGridProps['columns']>, string> = {
  2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  6: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3',
};

const trendFromStat = (stat: StatItem) => {
  if (!stat.trend && stat.trendUp === undefined) return undefined;

  if (typeof stat.trend === 'string') {
    const numeric = parseFloat(stat.trend.replace('%', '').replace('+', ''));
    const hasNumber = !Number.isNaN(numeric);
    const isNegative = stat.trend.startsWith('-') || stat.trendUp === false;
    return {
      value: hasNumber ? (isNegative ? -Math.abs(numeric) : Math.abs(numeric)) : 0,
      label: hasNumber ? stat.trend : undefined,
    };
  }

  if (typeof stat.trend === 'object' && stat.trend !== null) {
    const numeric =
      typeof stat.trend.value === 'string'
        ? parseFloat(stat.trend.value)
        : Number(stat.trend.value);
    const value = Number.isNaN(numeric) ? 0 : numeric;
    return {
      value:
        stat.trendUp === false ? -Math.abs(value) : stat.trendUp === true ? Math.abs(value) : value,
      label: stat.trend.label,
    };
  }

  if (stat.trendUp !== undefined) {
    return {
      value: stat.trendUp ? 1 : -1,
    };
  }

  return undefined;
};

/**
 * StatsGrid - Grid de estatísticas padronizado
 *
 * @example
 * ```tsx
 * <StatsGrid
 *   columns={4}
 *   animated
 *   stats={[
 *     {
 *       label: "Cirurgias (Mês)",
 *       value: 147,
 *       icon: Activity,
 *       colorScheme: "pink",
 *       trend: { value: 12.3, label: "vs. anterior" }
 *     },
 *     {
 *       label: "Faturamento",
 *       value: "R$ 2.8M",
 *       icon: DollarSign,
 *       colorScheme: "emerald",
 *       trend: { value: 15.7, label: "vs. anterior" }
 *     }
 *   ]}
 * />
 * ```
 */
export const StatsGrid: FC<StatsGridProps> = ({
  stats,
  columns = 4,
  animated = true,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn(columnClasses[columns], className)}>
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={`stats-skeleton-${index}`}
            className="orx-animate-pulse rounded-3xl border border-white/10 p-6"
          >
            <div className="h-4 w-1/2 rounded bg-white/10 mb-4" />
            <div className="h-8 w-3/4 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(columnClasses[columns], className)}>
      {stats.map((stat, index) => (
        <KPICard
          key={stat.label ?? stat.title ?? index}
          title={stat.label ?? stat.title ?? '—'}
          value={stat.value}
          icon={stat.icon}
          colorScheme={stat.colorScheme ?? 'indigo'}
          trend={trendFromStat(stat)}
          loading={stat.loading}
          className={cn(
            KPI_COL,
            animated && 'orx-animate-fade-in',
            animated && index > 0 && `orx-delay-${Math.min(index * 50, 300)}`
          )}
        />
      ))}
    </div>
  );
};

StatsGrid.displayName = 'OraclusXStatsGrid';

export default StatsGrid;
