/**
 * OraclusX Design System - Badge Component
 * Badge/Tag neuromórfico
 */

import React from"react";
import { X } from"lucide-react";
import { cn } from"@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    |"default"
    |"primary"
    |"success"
    |"warning"
    |"error"
    |"info";
  size?:"sm" |"md" |"lg";
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant ="default",
      size ="md",
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm:"text-body-xs px-2 py-0.5",
      md:"text-body-sm px-2.5 py-1",
      lg:"text-body px-3 py-1.5",
    };

    const variantClasses = {
      default:"bg-surface text-primary dark:bg-muted dark:text-muted",
      primary:"bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      success:"bg-success/10 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      warning:"bg-warning/10 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      error:"bg-destructive/10 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      info:"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    };

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-1 rounded-full font-medium",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="hover:opacity-70 transition-opacity"
            aria-label="Remover"
          >
            <X size={size ==="sm" ? 12 : size ==="md" ? 14 : 16} />
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName ="OraclusXBadge";

export default Badge;

