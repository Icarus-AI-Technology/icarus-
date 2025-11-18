/**
 * OraclusX Design System - Card Component
 * Card neuromórfico padronizado
 */

import React from"react";
import { cn } from"@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:"default" |"pressed" |"elevated";
  padding?:"none" |"sm" |"md" |"lg";
}

const CardComponent = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant ="default", padding ="md", children, ...props },
    ref,
  ) => {
    const variantClasses = {
      default:"orx-card",
      pressed:"orx-card-pressed",
      elevated:"orx-card shadow-2xl",
    };

    const paddingClasses = {
      none:"p-0",
      sm:"p-2 md:p-3",
      md:"p-4 md:p-6",
      lg:"p-6 md:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-colors duration-300",
          variantClasses[variant],
          paddingClasses[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardComponent.displayName ="OraclusXCard";

export const Card = React.memo(CardComponent);

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4", className)} {...props} />
  ),
);

CardHeader.displayName ="OraclusXCardHeader";

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-heading-sm orx-orx-font-medium text-primary dark:text-gray-100",
        className,
      )}
      {...props}
    />
  ),
);

CardTitle.displayName ="OraclusXCardTitle";

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-sm text-secondary dark:text-muted mt-1", className)}
    {...props}
  />
));

CardDescription.displayName ="OraclusXCardDescription";

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);

CardContent.displayName ="OraclusXCardContent";

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-4 pt-4 border-t border-gray-200 dark:border-border",
        className,
      )}
      {...props}
    />
  ),
);

CardFooter.displayName ="OraclusXCardFooter";

export default Card;
