import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from '@/types/lucide';

export interface CardKpiNeumoProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export const CardKpiNeumo: React.FC<CardKpiNeumoProps> = ({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  trendPositive = true,
  iconColor,
  iconBg,
  className,
}) => {
  return (
    <div className={cn('ic-card-neumo p-6 flex flex-col gap-4 min-w-[260px]', className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
            iconBg || 'bg-indigo-100 dark:bg-indigo-500/20',
            iconColor || 'text-indigo-600 dark:text-indigo-400'
          )}
        >
          <Icon size={24} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
          {subtitle && (
            <span className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</span>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between mt-2">
        <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <div
            className={cn(
              'text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-lg',
              trendPositive
                ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
            )}
          >
            {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardKpiNeumo;
