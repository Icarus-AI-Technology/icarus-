/**
 * OraclusX Design System - IconButtonNeu Component
 * Botão de ícone neuromórfico
 */

import React from 'react';
// LucideIcon removed - use type from @/types/lucide
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';

export interface IconButtonNeuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary';
}

const IconButtonNeuComponent = React.forwardRef<HTMLButtonElement, IconButtonNeuProps>(
  ({ className, icon: Icon, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-2',
      md: 'p-3',
      lg: 'p-4',
    };

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    const variantClasses = {
      default: 'orx-button dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      primary:
        'orx-button-primary dark:bg-[var(--orx-primary)] dark:hover:bg-[var(--orx-primary-hover)]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-full',
          'transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon size={iconSizes[size]} />
      </button>
    );
  }
);

IconButtonNeuComponent.displayName = 'OraclusXIconButtonNeu';

export const IconButtonNeu = React.memo(IconButtonNeuComponent);

export default IconButtonNeu;
