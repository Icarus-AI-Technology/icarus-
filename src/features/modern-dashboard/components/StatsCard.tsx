// LucideIcon removed - use type from @/types/lucide
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  change,
  iconColor = 'text-violet-600',
  iconBgColor = 'bg-violet-100',
}: StatsCardProps) {
  return (
    <div className="modern-card p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn('p-3 rounded-xl', iconBgColor)}>
              <Icon className={cn('w-6 h-6', iconColor)} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {change && (
          <div
            className={cn(
              'px-2.5 py-1 rounded-lg text-sm font-semibold',
              change.isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            )}
          >
            {change.isPositive ? '+' : ''}
            {change.value}%
          </div>
        )}
      </div>
    </div>
  );
}
