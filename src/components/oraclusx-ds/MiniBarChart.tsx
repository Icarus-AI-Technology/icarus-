/**
 * MiniBarChart - Mini gráfico de barras para Dashboard
 * Usado em: Estoque Crítico, Logística, Performance IA
 * 
 * Sistema: ICARUS v5.0
 * Design: OraclusX DS
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type BarColorScheme = 'error' | 'success' | 'accent';

export interface MiniBarChartProps {
  data: number[]; // 8 valores (0-100)
  colorScheme: BarColorScheme;
  label?: string;
  className?: string;
}

const COLOR_VARIANTS = {
  error: {
    0: 'bg-[var(--error)]/60',
    1: 'bg-[var(--error)]/70',
    2: 'bg-[var(--error)]/80',
    3: 'bg-[var(--error)]'
  },
  success: {
    0: 'bg-success/60',
    1: 'bg-success/70',
    2: 'bg-success/80',
    3: 'bg-success'
  },
  accent: {
    0: 'bg-[var(--accent)]/60',
    1: 'bg-[var(--accent)]/70',
    2: 'bg-[var(--accent)]/80',
    3: 'bg-[var(--accent)]'
  }
} as const;

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  colorScheme,
  label = 'Últimos 8 dias',
  className = ''
}) => {
  // Garantir 8 valores
  const normalizedData = data.length === 8 ? data : [...data, ...Array(8 - data.length).fill(0)];

  const getColorClass = (value: number): string => {
    const colorIndex = Math.min(Math.floor(value / 25), 3) as 0 | 1 | 2 | 3;
    return COLOR_VARIANTS[colorScheme][colorIndex];
  };

  return (
    <div className={cn('mt-4', className)}>
      {/* Barras */}
      <div 
        className="flex items-end justify-between gap-1 mb-2 mini-bar-chart" 
        style={{ height: '32px' }}
        role="img"
        aria-label={`Gráfico de barras mostrando dados dos ${label}`}
      >
        {normalizedData.map((value, index) => (
          <div
            key={index}
            className={cn(
              'rounded-t transition-all duration-300 bar',
              'hover:opacity-80 hover:scale-y-105 cursor-pointer',
              getColorClass(value)
            )}
            style={{ 
              width: '12px', 
              height: `${Math.max(value, 5)}%`,
              animationDelay: `${index * 0.05}s`
            }}
            title={`Dia ${index + 1}: ${value}%`}
            role="graphics-symbol"
            aria-label={`Dia ${index + 1}: ${value}%`}
          />
        ))}
      </div>
      
      {/* Label */}
      <div className="text-muted-foreground text-center" style={{ fontSize: '0.813rem' }}>
        {label}
      </div>
    </div>
  );
};

