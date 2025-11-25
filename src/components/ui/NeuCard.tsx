import React from 'react';
import { cn } from '@/lib/utils';

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const NeuCard: React.FC<NeuCardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[#ECF0F3] dark:bg-[#0F1217] rounded-2xl p-6',
        'shadow-[var(--orx-neu-outer-light)] dark:shadow-none',
        'border border-white/40 dark:border-white/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
