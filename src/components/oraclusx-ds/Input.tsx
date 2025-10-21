/**
 * OraclusX Design System - Input Component
 * Input neuromórfico padronizado
 */

import React from"react";
import { LucideIcon } from"lucide-react";
import { cn } from"@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  iconPosition?:"left" |"right";
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      icon: Icon,
      iconPosition ="left",
      error,
      label,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm text-[var(--text-secondary)] mb-1" style={{ fontWeight: 500 }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition ==="left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
              <Icon size={18} />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn("orx-input","w-full",
              Icon && iconPosition ==="left" &&"pl-10",
              Icon && iconPosition ==="right" &&"pr-10",
              error &&"border-2 border-error",
              className,
            )}
            {...props}
          />
          {Icon && iconPosition ==="right" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
              <Icon size={18} />
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-body-sm text-error">{error}</p>}
      </div>
    );
  },
);

Input.displayName ="OraclusXInput";

export default Input;
