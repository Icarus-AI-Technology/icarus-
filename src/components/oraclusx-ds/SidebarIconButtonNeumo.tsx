import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';
// LucideIcon removed - use type from @/types/lucide

export interface SidebarIconButtonNeumoProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  active?: boolean;
}

export const SidebarIconButtonNeumo: React.FC<SidebarIconButtonNeumoProps> = ({
  icon: Icon,
  active,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center w-12 h-12 rounded-3xl transition-all duration-200',
        'bg-gradient-to-br from-[#0f172a] to-[#020617] shadow-[10px_10px_24px_rgba(0,0,0,0.7),-8px_-8px_20px_rgba(120,120,255,0.25)]',
        'hover:scale-[1.03] text-slate-200',
        active && 'ring-2 ring-[#7c3aed]/80 shadow-[0_0_32px_rgba(124,58,237,0.65)]',
        className
      )}
      {...props}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
};

export default SidebarIconButtonNeumo;
