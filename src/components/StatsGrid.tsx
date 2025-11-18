/**
 * OraclusX DS - StatsGrid Component
 * Grid de estatísticas/KPIs reutilizável
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { KPICard, type KPIColorScheme } from './KPICard';
import { KPI_GRID, KPI_COL } from './kpiLayout';
import type { LucideIcon } from 'lucide-react';

export interface StatItem {
  /** Label da estatística */
  label: string;
  /** Valor da estatística */
  value: string | number;
  /** Ícone da estatística */
  icon: LucideIcon;
  /** Trend (opcional) */
  trend?: {
    value: number;
    label: string;
  };
  /** Esquema de cores */
  colorScheme?: KPIColorScheme;
}

export interface StatsGridProps {
  /** Array de estatísticas para exibir */
  stats: StatItem[];
  /** Número de colunas no grid */
  columns?: 2 | 3 | 4 | 6;
  /** Aplicar animação stagger */
  animated?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

const columnClasses = {
  2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  6: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3',
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
export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  animated = true,
  className,
}) => {
  return (
    <div className={cn(columnClasses[columns], className)}>
      {stats.map((stat, index) => (
        <KPICard
          key={index}
          title={stat.label}
          value={stat.value}
          icon={stat.icon}
          colorScheme={stat.colorScheme || 'indigo'}
          trend={stat.trend}
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

