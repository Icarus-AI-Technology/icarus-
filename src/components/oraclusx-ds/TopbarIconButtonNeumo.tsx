import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';
// LucideIcon removed - use type from @/types/lucide

export interface TopbarIconButtonNeumoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  badgeCount?: number;
}

export const TopbarIconButtonNeumo: React.FC<TopbarIconButtonNeumoProps> = ({
  icon: Icon,
  badgeCount,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200',
        'bg-gradient-to-br from-[#020617] to-[#020617] shadow-[8px_8px_20px_rgba(0,0,0,0.7),-6px_-6px_18px_rgba(148,163,255,0.35)]',
        'hover:scale-[1.04] text-slate-100',
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
      {badgeCount && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-semibold flex items-center justify-center text-white shadow-lg">
          {badgeCount}
        </span>
      )}
    </button>
  );
};

export default TopbarIconButtonNeumo;
