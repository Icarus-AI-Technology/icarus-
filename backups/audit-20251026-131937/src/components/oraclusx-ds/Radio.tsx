/**
 * OraclusX Design System - Radio Component
 * Radio button neuromórfico
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const RadioComponent = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            className="sr-only peer"
            {...props}
          />
          <label
            htmlFor={radioId}
            className={cn(
              "w-5 h-5 rounded-full cursor-pointer",
              "orx-card flex items-center justify-center",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "transition-all duration-150",
            )}
          >
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full bg-primary",
                "opacity-0 peer-checked:opacity-100 transition-opacity",
              )}
            />
          </label>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={radioId}
                className="text-body-sm text-primary dark:text-gray-100 cursor-pointer font-medium"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-body-xs text-secondary dark:text-muted mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Radio.displayName = "OraclusXRadio";

export const Radio = React.memo(RadioComponent);

export default Radio;
