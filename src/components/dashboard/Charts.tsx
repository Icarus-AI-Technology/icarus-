/**
 * Dashboard Charts - Sistema de Gráficos com Recharts
 * 100% Neumorphism 3D Premium + Lucide React SVG + OraclusX DS
 */

import React from 'react';
import { OrxLineChart } from '@/components/charts/OrxLineChart';
import { OrxBarChart } from '@/components/charts/OrxBarChart';
import { OrxPieChart } from '@/components/charts/OrxPieChart';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface BaseChartProps {
  data: ChartData[];
  className?: string;
  height?: number;
  title?: string;
  subtitle?: string;
}

// (Removido tooltip custom do Recharts)

// ============================================
// CHART CONTAINER (Wrapper Neumorphic)
// ============================================

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

function ChartContainer({ children, title, subtitle, className }: ChartContainerProps) {
  return (
    <div className={cn('neuro-raised rounded-2xl p-6 bg-[var(--bg-primary)]', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-[var(--text-primary)] mb-1 text-[0.813rem] orx-font-bold">
              {title}
            </h3>
          )}
          {subtitle && <p className="text-[var(--text-secondary)] text-[0.813rem]">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// LINE CHART (Gráfico de Linha)
// ============================================

interface LineChartComponentProps extends BaseChartProps {
  dataKey: string;
  color?: string;
}

export function LineChartComponent({
  data,
  dataKey,
  color = 'var(--orx-primary)',
  height = 300,
  title,
  subtitle,
  className,
}: LineChartComponentProps) {
  const series = [
    {
      id: dataKey,
      data: data.map((d) => {
        const candidate = d[dataKey as keyof ChartData];
        const y = typeof candidate === 'number' ? candidate : Number(d.value);
        return { x: d.name, y };
      }),
    },
  ];
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <OrxLineChart data={series} height={height} colors={[color]} />
    </ChartContainer>
  );
}

// ============================================
// BAR CHART (Gráfico de Barras)
// ============================================

interface BarChartComponentProps extends BaseChartProps {
  dataKey: string;
  color?: string;
}

export function BarChartComponent({
  data,
  dataKey,
  color = 'var(--orx-primary)',
  height = 300,
  title,
  subtitle,
  className,
}: BarChartComponentProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <OrxBarChart
        data={data}
        keys={[dataKey]}
        indexBy="name"
        height={height}
        colors={[color]}
        groupMode="grouped"
      />
    </ChartContainer>
  );
}

// ============================================
// AREA CHART (Gráfico de Área)
// ============================================

interface AreaChartComponentProps extends BaseChartProps {
  dataKey: string;
  color?: string;
}

export function AreaChartComponent({
  data,
  dataKey,
  color = 'var(--orx-primary)',
  height = 300,
  title,
  subtitle,
  className,
}: AreaChartComponentProps) {
  const series = [
    {
      id: dataKey,
      data: data.map((d) => {
        const candidate = d[dataKey as keyof ChartData];
        const y = typeof candidate === 'number' ? candidate : Number(d.value);
        return { x: d.name, y };
      }),
    },
  ];
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <OrxLineChart data={series} height={height} colors={[color]} enablePoints={false} />
    </ChartContainer>
  );
}

// ============================================
// PIE CHART (Gráfico de Pizza)
// ============================================

interface PieChartComponentProps extends BaseChartProps {
  colors?: string[];
}

const DEFAULT_COLORS = [
  'var(--orx-primary)',
  'var(--orx-success)',
  'var(--orx-warning)',
  'var(--orx-error)',
  'var(--orx-info)',
];

export function PieChartComponent({
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  title,
  subtitle,
  className,
}: PieChartComponentProps) {
  const pieData = data.map((d) => ({ id: d.name, value: Number(d.value) }));
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <OrxPieChart data={pieData} height={height} colors={colors} />
    </ChartContainer>
  );
}

// ============================================
// STAT CARD (KPI Card)
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function StatCard({ title, value, trend, icon: Icon, className }: StatCardProps) {
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend && trend > 0 ? 'text-success' : 'text-destructive';

  return (
    <div className={cn('neuro-raised rounded-xl p-6 h-[140px]', className)}>
      <div className="flex items-start justify-between h-full">
        <div>
          <p className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">{title}</p>
          <h3 className="text-[var(--text-primary)] text-[0.813rem] orx-font-bold">{value}</h3>
          {trend !== undefined && (
            <p className={cn('mt-2 flex items-center gap-1 text-[0.813rem]', trendColor)}>
              <TrendIcon className="w-3 h-3" />
              {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl neuro-inset">
          {Icon ? (
            <Icon className="w-6 h-6 text-[var(--primary)]" />
          ) : (
            <Activity className="w-6 h-6 text-[var(--primary)]" />
          )}
        </div>
      </div>
    </div>
  );
}
