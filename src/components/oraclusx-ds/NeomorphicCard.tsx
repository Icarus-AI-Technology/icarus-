/**
 * NeomorphicCard - Card neuromórfico base
 * 100% conforme OraclusX Design System
 *
 * Sistema: ICARUS v5.0
 * Design: Neuromorphic
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface NeomorphicCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
}

const PADDING_VARIANTS = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const NeomorphicCard: React.FC<NeomorphicCardProps> = ({
  children,
  className = '',
  padding = 'md',
  onClick,
  role,
  'aria-label': ariaLabel,
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-2xl border transition-all duration-300',

        // Light mode
        'bg-gradient-to-br from-white/90 to-slate-50/80',
        'border-slate-200/50',
        'shadow-[0_2px_8px_rgba(0,0,0,0.04),-2px_-2px_8px_rgba(255,255,255,0.8)]',

        // Dark mode
        'dark:bg-gradient-to-br dark:from-slate-800/95 dark:to-slate-900/90',
        'dark:border-slate-700/50',
        'dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),-2px_-2px_8px_rgba(51,65,85,0.2)]',

        // Hover
        'hover:-translate-y-1',
        'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),-3px_-3px_12px_rgba(255,255,255,0.9)]',
        'dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),-3px_-3px_12px_rgba(51,65,85,0.3)]',

        // Padding
        PADDING_VARIANTS[padding],

        // Clickable
        onClick && 'cursor-pointer active:scale-[0.99]',

        className
      )}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};
