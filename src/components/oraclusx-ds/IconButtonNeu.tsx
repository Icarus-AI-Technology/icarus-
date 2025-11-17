/**
 * OraclusX Design System - IconButtonNeu Component
 * Botão de ícone neuromórfico
 */

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconButtonNeuProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary";
}

const IconButtonNeuComponent = React.forwardRef<
  HTMLButtonElement,
  IconButtonNeuProps
>(
  (
    { className, icon: Icon, size = "md", variant = "default", ...props },
    ref,
  ) => {
    const sizeClasses = {
      sm: "p-2 min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]", // Touch target 44px mobile
      md: "p-3 min-w-[48px] min-h-[48px] md:min-w-[44px] md:min-h-[44px]", // Touch target 48px mobile
      lg: "p-4 min-w-[52px] min-h-[52px] md:min-w-[48px] md:min-h-[48px]", // Touch target 52px mobile
    };

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    const variantClasses = {
      default:
        "orx-button dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      primary:
        "orx-button-primary dark:bg-[var(--orx-primary)] dark:hover:bg-[var(--orx-primary-hover)]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-full",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <Icon size={iconSizes[size]} />
      </button>
    );
  },
);

IconButtonNeuComponent.displayName = "OraclusXIconButtonNeu";

export const IconButtonNeu = React.memo(IconButtonNeuComponent);

export default IconButtonNeu;
