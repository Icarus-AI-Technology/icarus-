/**
 * ShadCN UI - Card Component (NEUMORPHIC VERSION)
 * Componente de card com efeito neumórfico 3D Premium
 * HARD GATE: Apenas CSS variables do OraclusX DS
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Variante neuromórfica
     * - flat: plano (padrão)
     * - raised: elevado
     * - inset: rebaixado
     */
    variant?: "flat" | "raised" | "inset";
  }
>(({ className, variant = "raised", ...props }, ref) => {
  const variantClasses = {
    flat: "neuro-flat",
    raised: "neuro-raised",
    inset: "neuro-inset",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-[var(--bg-primary)] p-6 transition-all duration-300",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[var(--text-primary)]",
      "orx-contrast-heading",
      className,
    )}
    style={{
      fontFamily: "var(--font-display)",
      fontSize: "0.813rem",
      fontWeight: 700,
      lineHeight: 1.2,
    }}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[var(--text-secondary)]", className)}
    style={{
      fontFamily: "var(--font-body)",
      fontSize: "0.813rem",
    }}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
