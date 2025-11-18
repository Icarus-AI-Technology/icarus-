/**
 * OraclusX Design System - NeumoTextarea Component
 * Textarea Neumórfico 3D Premium
 * 
 * Campo de texto multilinha com visual neumórfico consistente.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface NeumoTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Rótulo do campo */
  label?: string;
  
  /** Mensagem de erro */
  error?: string;
  
  /** Mensagem de ajuda/hint */
  hint?: string;
  
  /** Classe CSS adicional para o container */
  containerClassName?: string;
  
  /** Classe CSS adicional para o label */
  labelClassName?: string;
  
  /** Mostrar contador de caracteres */
  showCharCount?: boolean;
}

export const NeumoTextarea = forwardRef<
  HTMLTextAreaElement,
  NeumoTextareaProps
>(
  (
    {
      label,
      error,
      hint,
      containerClassName,
      labelClassName,
      className,
      disabled,
      required,
      id,
      maxLength,
      showCharCount,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
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

        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            value={value}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${textareaId}-error`
                : hint
                  ? `${textareaId}-hint`
                  : undefined
            }
            className={cn(
              // Base
              'w-full rounded-lg',
              'bg-orx-bg-surface',
              'text-orx-text-primary placeholder:text-orx-text-muted',
              'border border-orx-border-subtle',
              'transition-all duration-200',
              'resize-y',
              'min-h-[100px]',
              'p-4',
              // Neumórfico
              'shadow-neumo-sm-inset',
              'focus:shadow-neumo-inset',
              // Estados
              'focus:outline-none focus:ring-3 focus:ring-orx-primary/20',
              hasError && 'border-orx-danger focus:ring-orx-danger/20',
              disabled &&
                'opacity-50 cursor-not-allowed bg-orx-bg-light',
              className
            )}
            {...props}
          />
        </div>

        {/* Contador de Caracteres */}
        {showCharCount && maxLength && (
          <div className="mt-1.5 orx-text-sm text-orx-text-muted text-right">
            {charCount}/{maxLength}
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1.5 orx-text-sm text-orx-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p
            id={`${textareaId}-hint`}
            className="mt-1.5 orx-text-sm text-orx-text-muted"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

NeumoTextarea.displayName = 'NeumoTextarea';

export default NeumoTextarea;

