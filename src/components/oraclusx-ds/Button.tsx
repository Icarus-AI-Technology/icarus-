/**
 * OraclusX Design System - Button Component
 * Botão neuromórfico padronizado
 */

import React from"react";
import { LucideIcon } from"lucide-react";
import { cn } from"@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:"default" |"primary" |"success" |"warning" |"error";
  size?:"sm" |"md" |"lg";
  icon?: LucideIcon;
  iconPosition?:"left" |"right";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant ="default",
      size ="md",
      icon: Icon,
      iconPosition ="left",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm:"text-body-sm px-3 py-1.5",
      md:"text-body px-4 py-2",
      lg:"text-body-lg px-6 py-3",
    };

    const variantClasses = {
      default:"orx-button",
      primary:"orx-button-primary",
      success:"bg-[var(--color-success)]/80 hover:bg-[var(--color-success)] text-[var(--inverse)]",
      warning:"bg-[var(--color-warning)]/80 hover:bg-[var(--color-warning)] text-[var(--inverse)]",
      error:"bg-[var(--color-error)]/80 hover:bg-[var(--color-error)] text-[var(--inverse)]",
    } as const;

    return (
      <button
        ref={ref}
        className={cn("inline-flex items-center justify-center gap-2","font-medium rounded-lg","transition-all duration-150","disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin">⟳</span>
        ) : (
          <>
            {Icon && iconPosition ==="left" && <Icon size={18} />}
            {children}
            {Icon && iconPosition ==="right" && <Icon size={18} />}
          </>
        )}
      </button>
    );
  },
);

Button.displayName ="OraclusXButton";

export default Button;
