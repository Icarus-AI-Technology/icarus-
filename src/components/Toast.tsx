/**
 * OraclusX Design System - Toast Component
 * Notificação toast neuromórfica
 */

import React, { useEffect } from"react";
import { X, CheckCircle, Info, AlertTriangle, XCircle } from"lucide-react";
import { cn } from"@/lib/utils";

export interface ToastProps {
  type?:"info" |"success" |"warning" |"error";
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  position?:"top-right" |"top-left" |"bottom-right" |"bottom-left";
}

export const Toast: React.FC<ToastProps> = ({
  type ="info",
  title,
  message,
  duration = 5000,
  onClose,
  position ="top-right",
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    info: {
      icon: Info,
      bg:"bg-[var(--color-info-background)]",
      border:"border-[var(--color-info-border)]",
      text:"text-[var(--color-info-text)]",
    },
    success: {
      icon: CheckCircle,
      bg:"bg-[var(--color-success-background)]",
      border:"border-[var(--color-success-border)]",
      text:"text-[var(--color-success-text)]",
    },
    warning: {
      icon: AlertTriangle,
      bg:"bg-[var(--color-warning-background)]",
      border:"border-[var(--color-warning-border)]",
      text:"text-[var(--color-warning-text)]",
    },
    error: {
      icon: XCircle,
      bg:"bg-[var(--color-error-background)]",
      border:"border-[var(--color-error-border)]",
      text:"text-[var(--color-error-text)]",
    },
  } as const;

  const positionClasses = {"top-right":"top-4 right-4","top-left":"top-4 left-4","bottom-right":"bottom-4 right-4","bottom-left":"bottom-4 left-4",
  };

  const { icon: Icon, bg, border, text } = config[type];

  return (
    <div
      className={cn("fixed z-50 w-96 max-w-[calc(100vw-2rem)]","orx-card p-4 border","dark:bg-gray-800 dark:border-gray-700","animate-in slide-in-from-top-5 fade-in duration-300",
        bg,
        border,
        text,
        positionClasses[position],
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1 min-w-0">
          {title && <h4 className="mb-1 orx-font-medium">{title}</h4>}
          <p className="text-body-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

Toast.displayName ="OraclusXToast";

export default Toast;

