/**
 * OraclusX Design System - NeumoButton Component
 * Botão Neumórfico 3D Premium
 * 
 * Botão com visual neumórfico, múltiplas variantes, tamanhos e estados.
 */

import React, { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NeumoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'ghost'
    | 'neumo';
  
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  
  /** Ícone à esquerda do texto */
  leftIcon?: LucideIcon;
  
  /** Ícone à direita do texto */
  rightIcon?: LucideIcon;
  
  /** Estado de loading */
  loading?: boolean;
  
  /** Botão ocupa toda a largura disponível */
  fullWidth?: boolean;
}

const variantStyles = {
  primary:
    'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800',
  secondary:
    'bg-orx-bg-surface text-orx-text-primary border border-orx-border-default shadow-neumo-sm hover:shadow-neumo active:shadow-neumo-sm-inset',
  success:
    'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800',
  warning:
    'bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-amber-700 active:from-yellow-700 active:to-amber-800',
  danger:
    'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800',
  ghost:
    'bg-transparent text-orx-text-primary hover:bg-orx-bg-surface active:bg-orx-bg-light',
  neumo:
    'bg-orx-bg-surface text-orx-text-primary shadow-neumo hover:shadow-neumo-hover active:shadow-neumo-inset',
};

const sizeStyles = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-base gap-2',
  lg: 'h-13 px-6 text-md gap-2.5',
};

export const NeumoButton = forwardRef<HTMLButtonElement, NeumoButtonProps>(
  (
    {
      variant = 'neumo',
      size = 'md',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading,
      fullWidth,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center',
          'rounded-lg font-medium',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-orx-primary/30 focus:ring-offset-2',
          // Variante
          variantStyles[variant],
          // Tamanho
          sizeStyles[size],
          // Estados
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          !isDisabled && 'hover:scale-[1.02] active:scale-[0.98]',
          // Largura
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin" />
        )}

        {/* Ícone Esquerdo */}
        {!loading && LeftIcon && (
          <LeftIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        )}

        {/* Conteúdo */}
        {children}

        {/* Ícone Direito */}
        {!loading && RightIcon && (
          <RightIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        )}
      </button>
    );
  }
);

NeumoButton.displayName = 'NeumoButton';

export default NeumoButton;

