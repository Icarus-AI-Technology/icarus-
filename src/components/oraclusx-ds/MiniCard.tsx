/**
 * OraclusX Design System - MiniCard Component
 * Mini Card Neumórfico 3D Premium
 * 
 * Card compacto para exibição de métricas e informações resumidas.
 */

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MiniCardProps {
  /** Título do card */
  title: string;
  
  /** Valor principal */
  value: string | number;
  
  /** Texto de hint/subtítulo */
  hint?: string;
  
  /** Ícone (componente Lucide React) */
  icon?: LucideIcon;
  
  /** Cor do ícone */
  iconColor?: string;
  
  /** Variante visual */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  
  /** Tendência (para métricas) */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string | number;
  };
  
  /** Classe CSS adicional */
  className?: string;
  
  /** Modo compacto (menos padding) */
  dense?: boolean;
  
  /** Callback ao clicar */
  onClick?: () => void;
}

const variantStyles = {
  default: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    iconColor: 'text-indigo-500',
  },
  success: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBg: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-500',
  },
  warning: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBg: 'bg-yellow-50 dark:bg-yellow-950/30',
    iconColor: 'text-yellow-500',
  },
  danger: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBg: 'bg-red-50 dark:bg-red-950/30',
    iconColor: 'text-red-500',
  },
  info: {
    container: 'bg-orx-bg-surface hover:bg-orx-bg-surface-elevated',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-500',
  },
};

export const MiniCard: React.FC<MiniCardProps> = ({
  title,
  value,
  hint,
  icon: Icon,
  iconColor,
  variant = 'default',
  trend,
  className,
  dense = false,
  onClick,
}) => {
  const styles = variantStyles[variant];
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
        'rounded-xl border border-orx-border-subtle',
        'transition-all duration-200',
        // Neumórfico
        'shadow-neumo-sm',
        'hover:shadow-neumo',
        // Background
        styles.container,
        // Padding
        dense ? 'p-4' : 'p-5',
        // Interativo
        isClickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Conteúdo Principal */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <p className="orx-text-xs orx-font-medium text-orx-text-secondary mb-1 truncate">
            {title}
          </p>

          {/* Valor */}
          <p className="orx-text-2xl orx-font-bold text-orx-text-primary truncate">
            {value}
          </p>

          {/* Hint ou Trend */}
          {trend ? (
            <div
              className={cn(
                'flex items-center gap-1 mt-1.5 orx-text-xs orx-font-semibold',
                trend.direction === 'up' && 'text-green-500',
                trend.direction === 'down' && 'text-red-500',
                trend.direction === 'neutral' && 'text-orx-text-muted'
              )}
            >
              {trend.direction === 'up' && <TrendingUp size={12} />}
              {trend.direction === 'down' && <TrendingDown size={12} />}
              {trend.direction === 'neutral' && <Minus size={12} />}
              <span>{trend.value}</span>
            </div>
          ) : hint ? (
            <p className="mt-1.5 orx-text-xs text-orx-text-muted truncate">
              {hint}
            </p>
          ) : null}
        </div>

        {/* Ícone */}
        {Icon && (
          <div
            className={cn(
              'flex-shrink-0 p-2.5 rounded-lg',
              'shadow-neumo-sm-inset',
              styles.iconBg
            )}
          >
            <Icon
              size={20}
              className={iconColor || styles.iconColor}
              strokeWidth={2}
            />
          </div>
        )}
      </div>
    </div>
  );
};

MiniCard.displayName = 'MiniCard';

export default MiniCard;

