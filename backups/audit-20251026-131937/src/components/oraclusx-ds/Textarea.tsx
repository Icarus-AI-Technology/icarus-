/**
 * OraclusX Design System - Textarea Component
 * Campo de texto multilinha neuromórfico
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}

const TextareaComponent = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      maxLength,
      showCount = false,
      id,
      value,
      ...props
    },
    ref,
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const currentLength = value ? String(value).length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-body-sm text-[var(--text-secondary)] mb-1 font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            "orx-input w-full min-h-[100px] resize-y",
            "transition-colors duration-300",
            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
            error && "border-2 border-error",
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between mt-1">
          <div>
            {hint && !error && (
              <p className="text-body-xs text-[var(--text-secondary)]">
                {hint}
              </p>
            )}
            {error && <p className="text-body-sm text-error">{error}</p>}
          </div>
          {showCount && maxLength && (
            <p
              className={cn(
                "text-body-xs",
                currentLength >= maxLength
                  ? "text-error"
                  : "text-[var(--text-secondary)]",
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

TextareaComponent.displayName = "OraclusXTextarea";

export const Textarea = React.memo(TextareaComponent);

export default Textarea;
