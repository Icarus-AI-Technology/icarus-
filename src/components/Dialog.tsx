/**
 * OraclusX Design System - Dialog Component
 * Dialog/Alert neuromórfico com ações
 */

import React, { useEffect } from"react";
import { AlertTriangle, Info, CheckCircle, XCircle } from"lucide-react";
import { cn } from"@/lib/utils";
import { Button } from"./Button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?:"info" |"success" |"warning" |"error";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type ="info",
  confirmText ="Confirmar",
  cancelText ="Cancelar",
  onConfirm,
  onCancel,
  showCancel = true,
  className,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key ==="Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const config = {
    info: {
      icon: Info,
      color:"text-[var(--color-info)]",
      bg:"bg-[var(--color-info-background)]",
    },
    success: {
      icon: CheckCircle,
      color:"text-[var(--color-success)]",
      bg:"bg-[var(--color-success-background)]",
    },
    warning: {
      icon: AlertTriangle,
      color:"text-[var(--color-warning)]",
      bg:"bg-[var(--color-warning-background)]",
    },
    error: {
      icon: XCircle,
      color:"text-[var(--color-error)]",
      bg:"bg-[var(--color-error-background)]",
    },
  } as const;

  const { icon: Icon, color, bg } = config[type];

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn("relative w-full max-w-[90vw] md:max-w-md orx-card p-4 md:p-6","dark:bg-gray-800 dark:border-gray-700","animate-in zoom-in-95 fade-in duration-200",
          className,
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-full", bg)}>
            <Icon className={color} size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">
              {title}
            </h2>
            {description && (
              <p className="text-body-sm text-[var(--text-secondary)]">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          {showCancel && (
            <Button onClick={handleCancel} variant="default">
              {cancelText}
            </Button>
          )}
          <Button onClick={handleConfirm} variant="primary">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

Dialog.displayName ="OraclusXDialog";

export default Dialog;

