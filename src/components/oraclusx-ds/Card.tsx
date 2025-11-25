/**
 * OraclusX Design System - Card Component (Consolidated)
 * Version: 5.1.0
 *
 * CONSOLIDATED: Merges Card.tsx, NeomorphicCard.tsx, GlassCard.tsx
 * Features: Neumorphic, Glassmorphic, Elevated variants with hover effects
 *
 * @example
 * <Card variant="neumo" padding="lg">Content</Card>
 * <Card variant="glass" hoverable>Glass effect</Card>
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  [
    // Base
    'rounded-2xl transition-all duration-300',
  ],
  {
    variants: {
      variant: {
        // Neumo - Full neumorphic 3D effect (DEFAULT)
        neumo: [
          'bg-gradient-to-br from-white/90 to-slate-50/80',
          'border border-slate-200/50',
          'shadow-[0_2px_8px_rgba(0,0,0,0.04),-2px_-2px_8px_rgba(255,255,255,0.8)]',
          'dark:bg-gradient-to-br dark:from-slate-800/95 dark:to-slate-900/90',
          'dark:border-slate-700/50',
          'dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),-2px_-2px_8px_rgba(51,65,85,0.2)]',
        ],

        // Glass - Glassmorphism effect
        glass: [
          'bg-white/10 backdrop-blur-xl',
          'border border-white/20',
          'shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
          'dark:bg-slate-900/10',
          'dark:border-slate-700/30',
        ],

        // Elevated - Strong shadow, no neumorphic
        elevated: [
          'bg-white',
          'border border-slate-200',
          'shadow-2xl',
          'dark:bg-slate-800',
          'dark:border-slate-700',
        ],

        // Flat - Minimal shadow
        flat: [
          'bg-white',
          'border border-slate-200',
          'shadow-sm',
          'dark:bg-slate-800',
          'dark:border-slate-700',
        ],

        // Pressed - Inset neumorphic (for active states)
        pressed: ['bg-orx-bg-light', 'border border-orx-border-subtle', 'shadow-neumo-inset'],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'neumo',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Enable hover lift effect */
  hoverable?: boolean;

  /** Make card clickable (adds cursor pointer) */
  clickable?: boolean;

  /** Render as different HTML element */
  as?: 'div' | 'article' | 'section';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      hoverable = false,
      clickable = false,
      as: Component = 'div',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          cardVariants({ variant, padding }),
          hoverable &&
            'hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),-3px_-3px_12px_rgba(255,255,255,0.9)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),-3px_-3px_12px_rgba(51,65,85,0.3)]',
          clickable && 'cursor-pointer active:scale-[0.99]',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card Sub-components
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mb-4', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-orx-text-primary', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-orx-text-secondary mt-1', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-orx-border-default', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { cardVariants };
export default Card;
