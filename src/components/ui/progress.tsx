/**
 * ShadCN UI - Progress Component
 * Barra de progresso
 * Integrado com OraclusX DS (Neumorphic 3D Premium)
 */

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
 React.ElementRef<typeof ProgressPrimitive.Root>,
 React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
 /**
 * Cor do indicador
 * - primary: var(--orx-primary) (padrão)
 * - success: verde
 * - warning: amarelo
 * - danger: vermelho
 */
 indicatorColor?: 'primary' | 'success' | 'warning' | 'danger';
 }
>(({ className, value, indicatorColor = 'primary', ...props }, ref) => {
 const colorClasses = {
 primary: 'bg-[var(--primary)]',
 success: 'bg-success',
 warning: 'bg-warning',
 danger: 'bg-destructive',
 };

 return (
 <ProgressPrimitive.Root
 ref={ref}
 className={cn(
 'relative h-4 w-full overflow-hidden rounded-full neuro-inset',
 className
 )}
 {...props}
 >
 <ProgressPrimitive.Indicator
 className={cn(
 'h-full w-full flex-1 transition-all',
 colorClasses[indicatorColor]
 )}
 style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
 />
 </ProgressPrimitive.Root>
 );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

