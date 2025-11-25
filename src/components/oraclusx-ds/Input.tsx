/**
 * OraclusX Design System - Input Component (Consolidated)
 * Version: 5.1.0
 *
 * CONSOLIDATED: Merges Input.tsx, NeumoInput.tsx, and ui/input.tsx
 * Features: Neumorphic inset shadow, icons, labels, error states, accessibility
 *
 * @example
 * <Input label="Email" leftIcon={Mail} error="Invalid email" />
 * <Input variant="neumo" placeholder="Search..." />
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Type for Lucide icons (avoid importing from lucide-react directly for better tree-shaking)
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;

const inputVariants = cva(
  [
    // Base
    'w-full rounded-lg',
    'text-orx-text-primary placeholder:text-orx-text-muted',
    'transition-all duration-200',
    // Focus
    'focus:outline-none focus:ring-3 focus:ring-orx-primary/20',
    // Disabled
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-orx-bg-light',
    // File input
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ],
  {
    variants: {
      variant: {
        // Neumo - Inset neumorphic shadow (DEFAULT)
        neumo: [
          'bg-orx-bg-surface',
          'border border-orx-border-subtle',
          'shadow-neumo-sm-inset',
          'focus:shadow-neumo-inset',
        ],
        // Flat - Simple border
        flat: ['bg-transparent', 'border border-input', 'shadow-sm'],
        // Ghost - No border, subtle background
        ghost: ['bg-orx-bg-surface/50', 'border-0'],
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-13 px-5 text-md',
      },
    },
    defaultVariants: {
      variant: 'neumo',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Label text */
  label?: string;

  /** Error message */
  error?: string;

  /** Helper text / hint */
  hint?: string;

  /** Icon on the left side */
  leftIcon?: LucideIcon;

  /** Icon on the right side */
  rightIcon?: LucideIcon;

  /** Container class name */
  containerClassName?: string;

  /** Label class name */
  labelClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      variant,
      inputSize,
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
              'block text-sm font-medium text-orx-text-primary mb-2',
              disabled && 'opacity-50 cursor-not-allowed',
              labelClassName
            )}
          >
            {label}
            {required && (
              <span className="text-orx-danger ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LeftIcon
                size={18}
                className={cn(
                  'text-orx-text-muted',
                  hasError && 'text-orx-danger',
                  disabled && 'opacity-50'
                )}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              inputVariants({ variant, inputSize }),
              hasError && 'border-orx-danger focus:ring-orx-danger/20',
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <RightIcon
                size={18}
                className={cn(
                  'text-orx-text-muted',
                  hasError && 'text-orx-danger',
                  disabled && 'opacity-50'
                )}
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-orx-danger" role="alert">
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-orx-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { inputVariants };
export default Input;
