/**
 * OraclusX Design System - CardKPI Component
 * Card KPI Neumórfico 3D Premium
 * 
 * ESPECIFICAÇÃO:
 * - Superfície neuromórfica com profundidade de nível 2
 * - Suporte para ícone, título, valor principal e tendência
 * - Variantes de tonalidade (primary, success, warning, danger, info)
 * - Estados interativos: hover com elevação aumentada
 * - Responsivo e acessível
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardKpiProps {
  /** Rótulo/título do KPI */
  label: string;
  
  /** Valor principal a ser exibido */
  value: string | number;
  
  /** Ícone do KPI (componente Lucide React) */
  icon: LucideIcon;
  
  /** Cor do ícone (ex: 'text-indigo-500', 'text-green-500') */
  iconColor?: string;
  
  /** Tendência do KPI */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  
  /** Tonalidade do card (afeta o fundo e cores de destaque) */
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  
  /** Callback ao clicar no card */
  onClick?: () => void;
  
  /** Classe CSS adicional */
  className?: string;
}

const toneStyles: Record<NonNullable<CardKpiProps['tone']>, {
  container: string;
  iconBox: string;
  trendColor: { up: string; down: string; neutral: string };
}> = {
  primary: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBox: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    trendColor: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-orx-text-muted',
    },
  },
  success: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBox: 'bg-gradient-to-br from-green-500 to-green-600',
    trendColor: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-orx-text-muted',
    },
  },
  warning: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBox: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    trendColor: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-orx-text-muted',
    },
  },
  danger: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBox: 'bg-gradient-to-br from-red-500 to-red-600',
    trendColor: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-orx-text-muted',
    },
  },
  info: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBox: 'bg-gradient-to-br from-blue-500 to-blue-600',
    trendColor: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-orx-text-muted',
    },
  },
  neutral: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBox: 'bg-gradient-to-br from-gray-500 to-gray-600',
    trendColor: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-orx-text-muted',
    },
  },
};

export const CardKpi: React.FC<CardKpiProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-white',
  trend,
  tone = 'primary',
  onClick,
  className,
}) => {
  const styles = toneStyles[tone];
  const isClickable = !!onClick;

  return (
    <div
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        // Base
        'relative rounded-xl p-6',
        'transition-all duration-300 ease-out',
        'border border-orx-border-subtle',
        // Neumórfico
        'shadow-neumo',
        'hover:shadow-neumo-hover',
        // Background
        styles.container,
        // Interativo
        isClickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        // Highlight overlay
        'overflow-hidden',
        className
      )}
      aria-label={`${label}: ${value}`}
    >
      {/* Highlight sutil no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: 'var(--highlight-top)',
          borderRadius: 'inherit',
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Ícone */}
        <div
          className={cn(
            'flex-shrink-0 w-14 h-14 rounded-xl',
            'flex items-center justify-center',
            'shadow-lg',
            styles.iconBox
          )}
        >
          <Icon size={28} className={iconColor} strokeWidth={2.5} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className="orx-text-sm orx-orx-font-medium text-orx-text-secondary mb-1 truncate">
            {label}
          </p>

          {/* Valor */}
          <p className="orx-text-3xl orx-orx-font-bold text-orx-text-primary truncate">
            {value}
          </p>

          {/* Tendência */}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 orx-text-sm orx-orx-font-semibold',
                styles.trendColor[trend.direction]
              )}
            >
              {trend.direction === 'up' && <TrendingUp size={16} />}
              {trend.direction === 'down' && <TrendingDown size={16} />}
              {trend.direction === 'neutral' && <Minus size={16} />}
              <span>
                {trend.direction === 'up' && '+'}
                {trend.direction === 'down' && '-'}
                {Math.abs(trend.percentage)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CardKpi.displayName = 'CardKpi';

export default CardKpi;

