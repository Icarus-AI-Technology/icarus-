/**
 * OraclusX Design System - NeumoInput Component
 * Input Neumórfico 3D Premium
 * 
 * Input field com visual neumórfico consistente, totalmente acessível
 * e com suporte a ícones, estados de erro e variantes.
 */

import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NeumoInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Rótulo do campo */
  label?: string;
  
  /** Mensagem de erro */
  error?: string;
  
  /** Mensagem de ajuda/hint */
  hint?: string;
  
  /** Ícone à esquerda do input */
  leftIcon?: LucideIcon;
  
  /** Ícone à direita do input */
  rightIcon?: LucideIcon;
  
  /** Tamanho do input */
  size?: 'sm' | 'md' | 'lg';
  
  /** Classe CSS adicional para o container */
  containerClassName?: string;
  
  /** Classe CSS adicional para o label */
  labelClassName?: string;
}

const sizeStyles = {
  sm: 'h-9 px-3 orx-text-sm',
  md: 'h-11 px-4 orx-text-base',
  lg: 'h-13 px-5 text-md',
};

export const NeumoInput = forwardRef<HTMLInputElement, NeumoInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      size = 'md',
      containerClassName,
      labelClassName,
      className,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2',
              disabled && 'opacity-50 cursor-not-allowed',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-orx-danger ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Ícone Esquerdo */}
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LeftIcon
                size={18}
                className={cn(
                  'text-orx-text-muted',
                  hasError && 'text-orx-danger',
                  disabled && 'opacity-50'
                )}
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              // Base
              'w-full rounded-lg',
              'bg-orx-bg-surface',
              'text-orx-text-primary placeholder:text-orx-text-muted',
              'border border-orx-border-subtle',
              'transition-all duration-200',
              // Neumórfico
              'shadow-neumo-sm-inset',
              'focus:shadow-neumo-inset',
              // Estados
              'focus:outline-none focus:ring-3 focus:ring-orx-primary/20',
              hasError && 'border-orx-danger focus:ring-orx-danger/20',
              disabled &&
                'opacity-50 cursor-not-allowed bg-orx-bg-light',
              // Tamanho
              sizeStyles[size],
              // Ícones
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Ícone Direito */}
          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <RightIcon
                size={18}
                className={cn(
                  'text-orx-text-muted',
                  hasError && 'text-orx-danger',
                  disabled && 'opacity-50'
                )}
              />
            </div>
          )}
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 orx-text-sm text-orx-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 orx-text-sm text-orx-text-muted"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

NeumoInput.displayName = 'NeumoInput';

export default NeumoInput;

