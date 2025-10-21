/**
 * Dashboard Charts - Sistema de Gráficos com Recharts
 * 100% Neumorphism 3D Premium + Lucide React SVG + OraclusX DS
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
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

// ============================================
// CUSTOM TOOLTIP (Neumorphic)
// ============================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="neuro-raised rounded-xl p-4 bg-[var(--bg-primary)] border border-[var(--border)]">
      <p
        className="text-[var(--text-primary)] mb-2"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.813rem',
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span
            className="text-[var(--text-secondary)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          >
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

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
            <h3
              className="text-[var(--text-primary)] mb-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.813rem',
                fontWeight: 700,
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className="text-[var(--text-secondary)]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.813rem',
              }}
            >
              {subtitle}
            </p>
          )}
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
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.813rem' }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.813rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
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
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.813rem' }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.813rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
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
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.813rem' }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.813rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================
// PIE CHART (Gráfico de Pizza)
// ============================================

interface PieChartComponentProps extends BaseChartProps {
  colors?: string[];
}

const DEFAULT_COLORS = ['var(--orx-primary)', 'var(--orx-success)', 'var(--orx-warning)', 'var(--orx-error)', 'var(--orx-info)'];

export function PieChartComponent({
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  title,
  subtitle,
  className,
}: PieChartComponentProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
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
          <p
            className="text-[var(--text-secondary)] mb-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          >
            {title}
          </p>
          <h3
            className="text-[var(--text-primary)]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.813rem',
              fontWeight: 700,
            }}
          >
            {value}
          </h3>
          {trend !== undefined && (
            <p
              className={cn('mt-2 flex items-center gap-1', trendColor)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.813rem',
              }}
            >
              <TrendIcon className="w-3 h-3" />
              {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl neuro-inset">
          {Icon ? <Icon className="w-6 h-6 text-[var(--primary)]" /> : <Activity className="w-6 h-6 text-[var(--primary)]" />}
        </div>
      </div>
    </div>
  );
}

