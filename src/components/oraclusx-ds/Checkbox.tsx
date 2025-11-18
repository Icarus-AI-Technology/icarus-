/**
 * OraclusX Design System - Checkbox Component
 * Checkbox neuromórfico com estados
 */

import React from"react";
import { Check } from"lucide-react";
import { cn } from"@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>,"type"> {
  label?: string;
  description?: string;
  error?: string;
}

const CheckboxComponent = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn("w-5 h-5 rounded cursor-pointer","orx-card flex items-center justify-center","dark:bg-gray-700","peer-checked:bg-primary peer-checked:text-inverse","peer-disabled:opacity-50 peer-disabled:cursor-not-allowed","transition-all duration-150",
              error &&"border-2 border-error",
            )}
          >
            <Check
              size={14}
              className="opacity-0 peer-checked:opacity-100 transition-opacity"
            />
          </label>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-body-sm text-[var(--text-primary)] cursor-pointer orx-orx-font-medium"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-body-xs text-[var(--text-secondary)] mt-0.5">
                {description}
              </p>
            )}
            {error && <p className="text-body-xs text-error mt-1">{error}</p>}
          </div>
        )}
      </div>
    );
  },
);

CheckboxComponent.displayName ="OraclusXCheckbox";

export const Checkbox = React.memo(CheckboxComponent);

export default Checkbox;

