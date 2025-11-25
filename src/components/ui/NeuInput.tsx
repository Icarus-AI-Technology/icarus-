import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';
// LucideIcon removed - use type from @/types/lucide

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-4 text-slate-400">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#ECF0F3] dark:bg-[#151A21] rounded-xl px-4 py-3',
              'shadow-[var(--orx-neu-inner-light)] dark:shadow-inner',
              'border-none focus:ring-2 focus:ring-[#6366F1] outline-none',
              'text-slate-700 dark:text-slate-200 placeholder:text-slate-400',
              'transition-all duration-200',
              Icon && 'pl-12',
              error && 'ring-2 ring-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 mt-1 ml-1">{error}</span>}
      </div>
    );
  }
);

NeuInput.displayName = 'NeuInput';
