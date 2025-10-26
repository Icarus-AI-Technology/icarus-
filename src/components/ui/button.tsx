/**
 * OraclusX Design System - Button Component
 * Version: 5.0
 * Neumorphic 3D Button with Loading & States
 * ✅ CSS Variables Only | ✅ Accessibility | ✅ Neumorphic Variants
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orx-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--orx-primary)] text-white shadow-[var(--orx-shadow-light-1),var(--orx-shadow-light-2)] hover:bg-[var(--orx-primary-hover)] active:bg-[var(--orx-primary-active)]",
        destructive:
          "bg-[var(--orx-error)] text-white shadow-sm hover:bg-[var(--orx-error-dark)]",
        outline:
          "border border-[var(--orx-text-secondary)] bg-transparent shadow-sm hover:bg-[var(--orx-bg-light)] hover:text-[var(--orx-text-primary)]",
        secondary:
          "bg-[var(--orx-indigo-100)] text-[var(--orx-text-primary)] shadow-sm hover:bg-[var(--orx-indigo-200)]",
        ghost: "hover:bg-[var(--orx-bg-light)] hover:text-[var(--orx-text-primary)]",
        link: "text-[var(--orx-primary)] underline-offset-4 hover:underline",
        // Neumorphic variants
        neumorphic:
          "neumorphic-button bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] shadow-[var(--orx-shadow-light-1),var(--orx-shadow-light-2)]",
        "neumorphic-raised":
          "bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] shadow-[15px_15px_30px_rgba(120,135,165,0.65),-15px_-15px_30px_rgba(255,255,255,1)] hover:shadow-[18px_18px_40px_rgba(120,135,165,0.7),-18px_-18px_40px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(120,135,165,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]",
        "neumorphic-pressed":
          "bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] shadow-[inset_8px_8px_16px_rgba(120,135,165,0.5),inset_-8px_-8px_16px_rgba(255,255,255,1)]",
        "neumorphic-flat":
          "bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] shadow-none border border-[var(--orx-text-secondary)]/20",
        // Semantic variants
        success:
          "bg-[var(--orx-success)] text-white shadow-sm hover:bg-[var(--orx-success-dark)]",
        warning:
          "bg-[var(--orx-warning)] text-white shadow-sm hover:bg-[var(--orx-warning-dark)]",
        info: "bg-[var(--orx-info)] text-white shadow-sm hover:bg-[var(--orx-info-dark)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "neumorphic-raised",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
