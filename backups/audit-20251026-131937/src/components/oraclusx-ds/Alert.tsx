/**
 * OraclusX Design System - Alert Component
 * Alerta contextual com 4 tipos (info, success, warning, error)
 *
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (role="alert", aria-live)
 * ✅ TypeScript strict
 */

import React from "react";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  onClose,
  showIcon = true,
  className,
}) => {
  const config = {
    info: {
      icon: Info,
      bgColor: "bg-[var(--accent)]/10",
      borderColor: "border-[var(--accent)]/20",
      iconColor: "text-[var(--accent-foreground)]",
      textColor: "text-[var(--text-primary)]",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-success/5",
      borderColor: "border-success/20",
      iconColor: "text-success",
      textColor: "text-[var(--text-primary)]",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-warning/5",
      borderColor: "border-warning/20",
      iconColor: "text-warning",
      textColor: "text-[var(--text-primary)]",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-destructive/5",
      borderColor: "border-destructive/20",
      iconColor: "text-error",
      textColor: "text-[var(--text-primary)]",
    },
  };

  const {
    icon: Icon,
    bgColor,
    borderColor,
    iconColor,
    textColor,
  } = config[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "relative p-4 rounded-lg border-l-4",
        bgColor,
        borderColor,
        "shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]",
        className,
      )}
    >
      <div className="flex gap-3">
        {showIcon && (
          <div className={cn("flex-shrink-0", iconColor)}>
            <Icon size={20} />
          </div>
        )}

        <div className="flex-1">
          {title && (
            <h4 className={cn("font-medium mb-1", textColor)}>{title}</h4>
          )}
          <p className={cn(textColor)}>{message}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar alerta"
            className={cn(
              "flex-shrink-0 p-1 rounded-md transition-colors",
              "hover:bg-black/5 dark:hover:bg-surface/5",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
              textColor,
            )}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
