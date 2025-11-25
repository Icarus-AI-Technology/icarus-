import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading,
  disabled,
  ...props
}) => {
  const variants = {
    primary:
      'bg-[#6366F1] text-white hover:bg-[#5558E3] shadow-[0_10px_20px_-5px_rgba(99,102,241,0.4)]',
    success:
      'bg-[#10B981] text-white hover:bg-[#059669] shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)]',
    danger:
      'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_10px_20px_-5px_rgba(239,68,68,0.4)]',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 shadow-none',
  };

  return (
    <button
      className={cn(
        'font-medium rounded-xl px-6 py-3 transition-all duration-200 ease-out',
        'active:scale-95 active:shadow-inner',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
};
