/**
 * Charts Avançados - Composed, Radar, Scatter
 * Novos tipos de gráficos para dashboards complexos
 * 100% Neumorphism 3D Premium + Lucide React SVG + OraclusX DS
 */

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { OrxLineChart } from '@/components/charts/OrxLineChart';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface ChartData {
  name: string;
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
// CUSTOM TOOLTIP (Neumorphic) - Reusado
// ============================================

type TooltipEntry = {
  color: string;
  value: number | string;
  name: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="neuro-raised rounded-xl p-4 bg-[var(--bg-primary)] border border-[var(--border)]">
      <p className="text-[var(--text-primary)] mb-2 text-[0.813rem] orx-font-semibold">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            ref={(el) => {
              if (el) el.style.backgroundColor = entry.color;
            }}
          />
          <span className="text-[var(--text-secondary)] text-[0.813rem]">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// CHART CONTAINER (Reusado)
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
// COMPOSED CHART (Múltiplos tipos combinados)
// ============================================

interface ComposedChartComponentProps extends BaseChartProps {
  dataKeys: {
    line?: string[];
    bar?: string[];
    area?: string[];
  };
  colors?: {
    line?: string[];
    bar?: string[];
    area?: string[];
  };
}

export function ComposedChartComponent({
  data,
  dataKeys,
  height = 400,
  title,
  subtitle,
  className,
}: ComposedChartComponentProps) {
  const series = (dataKeys.line || []).map((key) => ({
    id: key,
    data: data.map((d) => {
      const value = d[key as keyof ChartData];
      const y = typeof value === 'number' ? value : Number(value);
      return { x: d.name, y };
    }),
  }));
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <OrxLineChart data={series} height={height} />
    </ChartContainer>
  );
}

// ============================================
// RADAR CHART (Gráfico de Radar)
// ============================================

interface RadarChartComponentProps extends BaseChartProps {
  dataKey: string;
  color?: string;
}

export function RadarChartComponent({
  data,
  dataKey,
  color = 'var(--orx-primary)',
  height = 400,
  title,
  subtitle,
  className,
}: RadarChartComponentProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 13 }} />
          <PolarRadiusAxis stroke="var(--text-secondary)" tick={{ fontSize: 13 }} />
          <Radar name={dataKey} dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.6} />
          <RechartsTooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================
// SCATTER CHART (Gráfico de Dispersão)
// ============================================

interface ScatterChartComponentProps extends BaseChartProps {
  xKey: string;
  yKey: string;
  zKey?: string;
  color?: string;
  shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
}

export function ScatterChartComponent({
  data,
  xKey,
  yKey,
  zKey,
  color = 'var(--orx-primary)',
  shape = 'circle',
  height = 400,
  title,
  subtitle,
  className,
}: ScatterChartComponentProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            type="number"
            dataKey={xKey}
            name={xKey}
            stroke="var(--text-secondary)"
            tick={{ fontSize: 13 }}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            name={yKey}
            stroke="var(--text-secondary)"
            tick={{ fontSize: 13 }}
          />
          {zKey && <ZAxis type="number" dataKey={zKey} range={[60, 400]} />}
          <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          />
          <Scatter name={`${xKey} vs ${yKey}`} data={data} fill={color} shape={shape} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================
// MULTI-RADAR CHART (Comparação de múltiplas séries)
// ============================================

interface MultiRadarChartComponentProps extends BaseChartProps {
  dataKeys: string[];
  colors?: string[];
}

export function MultiRadarChartComponent({
  data,
  dataKeys,
  colors = ['var(--orx-primary)', 'var(--orx-success)', 'var(--orx-warning)', 'var(--orx-error)'],
  height = 400,
  title,
  subtitle,
  className,
}: MultiRadarChartComponentProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 13 }} />
          <PolarRadiusAxis stroke="var(--text-secondary)" tick={{ fontSize: 13 }} />
          {dataKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.4}
            />
          ))}
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
