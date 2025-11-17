/**
 * MaskedInput - Componente de Input com Máscara Automática
 * ICARUS v5.0 - OraclusX Design System
 *
 * Uso:
 * <MaskedInput
 *   mask="CPF"
 *   value={cpf}
 *   onChange={setCpf}
 *   label="CPF"
 *   required
 * />
 */

import React, { forwardRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Mascaras, MaskType } from "@/utils/masks";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: MaskType;
  label?: string;
  error?: string;
  helperText?: string;
  showValidation?: boolean;
  onValueChange?: (value: string, isValid: boolean) => void;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      label,
      error,
      helperText,
      showValidation = true,
      onValueChange,
      className,
      value: controlledValue,
      ...props
    },
    ref,
  ) => {
    const config = Mascaras[mask];
    const [internalValue, setInternalValue] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [isTouched, setIsTouched] = useState(false);

    const value =
      controlledValue !== undefined ? String(controlledValue) : internalValue;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const unformatted = config.unformat(newValue);
        const formatted = config.format(unformatted);

        // Limita ao maxLength
        if (formatted.length > config.maxLength) return;

        setInternalValue(formatted);

        // Valida
        const valid = config.validate ? config.validate(formatted) : true;
        setIsValid(valid);

        // Callback externo
        if (onValueChange) {
          onValueChange(unformatted, valid);
        }
      },
      [config, onValueChange],
    );

    const handleBlur = useCallback(() => {
      setIsTouched(true);
    }, []);

    const showError = error || (isTouched && !isValid && value.length > 0);
    const showSuccess =
      showValidation && isTouched && isValid && value.length > 0;

    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        {label && (
          <label
            className="block text-[var(--text-primary)] mb-1"
            style={{ fontSize: "0.813rem", fontWeight: 500 }}
          >
            {label}
            {props.required && (
              <span className="text-[var(--orx-error)] ml-1">*</span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "bg-[var(--surface)] text-[var(--text-primary)]",
              "border border-[var(--border)]",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "placeholder:text-[var(--text-muted)]",
              // Neumorphic effect
              "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]",
              // Estados
              showError &&
                "border-[var(--orx-error)] focus:ring-[var(--orx-error)]",
              showSuccess &&
                "border-[var(--orx-success)] focus:ring-[var(--orx-success)]",
              className,
            )}
            {...props}
          />

          {/* Validation Icons */}
          {showValidation && isTouched && value.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--orx-success)]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--orx-error)]" />
              )}
            </div>
          )}
        </div>

        {/* Helper/Error Text */}
        {(helperText || showError) && (
          <p
            className={cn(
              "text-[var(--text-secondary)]",
              showError && "text-[var(--orx-error)]",
            )}
            style={{ fontSize: "0.813rem" }}
          >
            {showError ? error || "Valor inválido" : helperText}
          </p>
        )}

        {/* Pattern hint */}
        {!isTouched && !helperText && !error && (
          <p
            className="text-[var(--text-muted)]"
            style={{ fontSize: "0.813rem" }}
          >
            Formato: {config.pattern}
          </p>
        )}
      </div>
    );
  },
);

MaskedInput.displayName = "MaskedInput";
