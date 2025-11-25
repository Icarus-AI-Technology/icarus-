import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from '@/types/lucide';

export interface MiniCardNeumoProps {
  label: string;
  value?: string | number;
  chip?: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MiniCardNeumo: React.FC<MiniCardNeumoProps> = ({
  label,
  value,
  chip,
  icon: Icon,
  trend,
  trendPositive,
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'ic-card-neumo p-4 flex flex-col justify-between gap-2 min-w-[140px]',
        onClick && 'cursor-pointer hover:scale-[1.02] transition-transform',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate pr-2">
          {label}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        {value !== undefined && value !== null && (
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
        )}

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md',
              trendPositive
                ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
            )}
          >
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend}</span>
          </div>
        )}

        {chip && <span className="ic-kpi-pill px-2 py-0.5 text-xs font-medium">{chip}</span>}
      </div>
    </div>
  );
};

export default MiniCardNeumo;
