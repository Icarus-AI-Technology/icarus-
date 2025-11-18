/**
 * OraclusX Design System - Switch Component
 * Toggle switch neuromórfico
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const SwitchComponent = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <label
            htmlFor={switchId}
            className={cn(
              "w-11 h-6 rounded-full cursor-pointer relative",
              "orx-card",
              "dark:bg-gray-700",
              "peer-checked:bg-primary",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "transition-all duration-200",
            )}
          >
            <div
              className={cn(
                "absolute top-1 left-1 w-4 h-4 rounded-full bg-surface shadow-md",
                "peer-checked:translate-x-5",
                "transition-transform duration-200",
              )}
            />
          </label>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={switchId}
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
          </div>
        )}
      </div>
    );
  },
);

SwitchComponent.displayName = "OraclusXSwitch";

export const Switch = React.memo(SwitchComponent);

export default Switch;
