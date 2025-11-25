// LucideIcon removed - use type from @/types/lucide
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all duration-200',
        'hover:scale-105 hover:shadow-lg active:scale-95',
        variant === 'primary'
          ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white'
          : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-300'
      )}
    >
      <Icon className="w-8 h-8" />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

interface QuickActionsProps {
  actions: Array<{
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="modern-card p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <QuickActionButton key={index} {...action} />
        ))}
      </div>
    </div>
  );
}
