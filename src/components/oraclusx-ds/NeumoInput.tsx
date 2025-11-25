/**
 * OraclusX Design System - NeumoInput Component
 * Wrapper para o Input do HeroUI com estilo consistente
 */

import { forwardRef } from 'react';
import { Input, InputProps } from "@heroui/react";
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';

export interface NeumoInputProps extends Omit<InputProps, 'startContent' | 'endContent'> {
  /** Ícone à esquerda do input */
  leftIcon?: LucideIcon;
  
  /** Ícone à direita do input */
  rightIcon?: LucideIcon;
  
  /** Classe CSS adicional para o container */
  containerClassName?: string;
  
  /** Hint text (mapped to description) */
  hint?: string;
  
  /** Error message (mapped to errorMessage) */
  error?: string | boolean;
}

export const NeumoInput = forwardRef<HTMLInputElement, NeumoInputProps>(
  (
    {
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      containerClassName,
      className,
      hint,
      error,
      variant = "flat", // Default to flat for glass feel
      radius = "lg",
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const errorMessage = typeof error === 'string' ? error : undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        <Input
          ref={ref}
          variant={variant}
          radius={radius}
          errorMessage={errorMessage}
          isInvalid={hasError}
          description={hint}
          startContent={LeftIcon ? <LeftIcon size={18} className="text-default-400 pointer-events-none flex-shrink-0" /> : undefined}
          endContent={RightIcon ? <RightIcon size={18} className="text-default-400 pointer-events-none flex-shrink-0" /> : undefined}
          classNames={{
            inputWrapper: [
              "bg-white/5 hover:bg-white/10 focus-within:!bg-white/10",
              "border-white/10 hover:border-white/20",
              "backdrop-blur-md",
              hasError ? "border-danger" : "",
            ].join(" "),
            label: "text-slate-400",
            input: "text-white placeholder:text-slate-600",
            description: "text-slate-500",
            errorMessage: "text-danger",
            ...props.classNames,
          }}
          {...props}
        />
      </div>
    );
  }
);

NeumoInput.displayName = 'NeumoInput';

export default NeumoInput;
