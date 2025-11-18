/**
 * OraclusX Design System - Button Component
 * Botão neuromórfico padronizado
 */

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "text-body-sm px-3 py-2 md:px-3 md:py-2 min-h-[44px] md:min-h-[36px]", // Touch target 44px mobile
      md: "text-body px-4 py-2.5 md:px-4 md:py-2 min-h-[44px]", // Touch target 44px
      lg: "text-body-lg px-6 py-3 md:px-6 md:py-3 min-h-[48px]", // Touch target 48px
    };

    const variantClasses = {
      default:
        "orx-button dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      primary:
        "orx-button-primary dark:bg-[var(--orx-primary)] dark:hover:bg-[var(--orx-primary-hover)]",
      success:
        "bg-[var(--color-success)]/80 hover:bg-[var(--color-success)] text-[var(--inverse)] dark:bg-green-600 dark:hover:bg-green-700",
      warning:
        "bg-[var(--color-warning)]/80 hover:bg-[var(--color-warning)] text-[var(--inverse)] dark:bg-yellow-600 dark:hover:bg-yellow-700",
      error:
        "bg-[var(--color-error)]/80 hover:bg-[var(--color-error)] text-[var(--inverse)] dark:bg-red-600 dark:hover:bg-red-700",
    } as const;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "orx-orx-font-medium rounded-lg",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
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
            {Icon && iconPosition === "left" && <Icon size={18} />}
            {children}
            {Icon && iconPosition === "right" && <Icon size={18} />}
          </>
        )}
      </button>
    );
  },
);

ButtonComponent.displayName = "OraclusXButton";

export const Button = React.memo(ButtonComponent);

export default Button;
