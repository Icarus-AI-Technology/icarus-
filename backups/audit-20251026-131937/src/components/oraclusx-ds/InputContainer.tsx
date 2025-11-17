/**
 * OraclusX Design System - InputContainer Component
 * Container para grupos de inputs
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface InputContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export const InputContainer = React.forwardRef<
  HTMLDivElement,
  InputContainerProps
>(({ className, label, required, error, hint, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("mb-4", className)} {...props}>
      {label && (
        <label className="block text-body-sm text-secondary dark:text-muted mb-2 font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1 text-body-xs text-muted dark:text-muted">{hint}</p>
      )}
      {error && <p className="mt-1 text-body-sm text-error">{error}</p>}
    </div>
  );
});

InputContainer.displayName = "OraclusXInputContainer";

export default InputContainer;
