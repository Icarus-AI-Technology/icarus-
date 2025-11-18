/**
 * OraclusX Design System - TopbarIconButton Component
 * Botão de ícone para a topbar (notificações, configurações, etc)
 */

import React from"react";
import { LucideIcon } from"lucide-react";
import { cn } from"@/lib/utils";

export interface TopbarIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  badge?: number | boolean;
  active?: boolean;
  variant?:"default" |"primary";
}

export const TopbarIconButton = React.forwardRef<
  HTMLButtonElement,
  TopbarIconButtonProps
>(
  (
    { className, icon: Icon, badge, active = false, variant ="default", ...props },
    ref,
  ) => {
    const variantClasses = {
      default:"orx-button hover:bg-surface dark:hover:bg-gray-700",
      primary:"orx-button-primary",
    };

    return (
      <button
        ref={ref}
        className={cn("relative p-2.5 rounded-lg transition-all duration-150",
          variantClasses[variant],
          active &&"bg-indigo-50 dark:bg-indigo-900/20",
          className,
        )}
        {...props}
      >
        <Icon size={20} />
        {badge !== undefined && badge !== false && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-destructive/50 text-inverse text-body-xs font-display rounded-full">
            {typeof badge ==="number" ? (badge > 9 ?"9+" : badge) : null}
          </span>
        )}
      </button>
    );
  },
);

TopbarIconButton.displayName ="OraclusXTopbarIconButton";

export default TopbarIconButton;

