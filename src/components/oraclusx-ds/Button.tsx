/**
 * OraclusX Design System - Button Component
 * Botão neuromórfico padronizado
 */

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "ghost"
    | "success"
    | "warning"
    | "error";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon | ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      icon,
      iconPosition = "left",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "text-body-sm px-2.5 py-1.5 md:px-3 md:py-1.5",
      md: "text-body px-3 py-1.5 md:px-4 md:py-2",
      lg: "text-body-lg px-5 py-2.5 md:px-6 md:py-3",
    };

    const variantClasses: Record<
      NonNullable<ButtonProps["variant"]>,
      string
    > = {
      default:
        "orx-button dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      primary:
        "orx-button-primary dark:bg-[var(--orx-primary)] dark:hover:bg-[var(--orx-primary-hover)]",
      secondary:
        "bg-surface text-[var(--text-primary)] border border-[var(--border)] hover:shadow-md dark:bg-gray-900 dark:text-gray-100",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]",
      success:
        "bg-[var(--color-success)]/80 hover:bg-[var(--color-success)] text-[var(--inverse)] dark:bg-green-600 dark:hover:bg-green-700",
      warning:
        "bg-[var(--color-warning)]/80 hover:bg-[var(--color-warning)] text-[var(--inverse)] dark:bg-yellow-600 dark:hover:bg-yellow-700",
      error:
        "bg-[var(--color-error)]/80 hover:bg-[var(--color-error)] text-[var(--inverse)] dark:bg-red-600 dark:hover:bg-red-700",
    };

    const renderIcon = (position: "left" | "right") => {
      if (!icon || iconPosition !== position) return null;

      const isForwardRefComponent =
        typeof icon === "object" &&
        icon !== null &&
        "render" in icon &&
        typeof (icon as { render?: unknown }).render === "function";

      if (typeof icon === "function" || isForwardRefComponent) {
        const IconComponent = icon as LucideIcon;
        return <IconComponent size={18} />;
      }

      if (React.isValidElement(icon)) {
        return icon;
      }

      return icon as ReactNode;
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-medium rounded-lg",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant] || variantClasses.default,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin">⟳</span>
        ) : (
          <>
            {renderIcon("left")}
            {children}
            {renderIcon("right")}
          </>
        )}
      </button>
    );
  }
);

ButtonComponent.displayName = "OraclusXButton";

export const Button = React.memo(ButtonComponent);

export default Button;
