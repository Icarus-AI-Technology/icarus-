/**
 * OraclusX Design System - FormBanner Component
 * Banner informativo para formulários
 */

import React from"react";
import { Info, AlertTriangle, CheckCircle, XCircle } from"lucide-react";
import { cn } from"@/lib/utils";

export interface FormBannerProps {
  type?:"info" |"success" |"warning" |"error";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const FormBanner: React.FC<FormBannerProps> = ({
  type ="info",
  title,
  message,
  onClose,
  className,
}) => {
  const config = {
    info: {
      bg:"bg-blue-50 dark:bg-blue-900/20",
      border:"border-blue-200 dark:border-blue-800",
      text:"text-blue-800 dark:text-blue-300",
      icon: Info,
    },
    success: {
      bg:"bg-success/5 dark:bg-green-900/20",
      border:"border-green-200 dark:border-green-800",
      text:"text-green-800 dark:text-green-300",
      icon: CheckCircle,
    },
    warning: {
      bg:"bg-warning/5 dark:bg-yellow-900/20",
      border:"border-yellow-200 dark:border-yellow-800",
      text:"text-yellow-800 dark:text-yellow-300",
      icon: AlertTriangle,
    },
    error: {
      bg:"bg-destructive/5 dark:bg-red-900/20",
      border:"border-red-200 dark:border-red-800",
      text:"text-red-800 dark:text-red-300",
      icon: XCircle,
    },
  };

  const { bg, border, text, icon: Icon } = config[type];

  return (
    <div
      className={cn("flex items-start gap-3 p-4 rounded-lg border",
        bg,
        border,
        text,
        className,
      )}
    >
      <Icon className="flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1 min-w-0">
        {title && <h4 className="mb-1 orx-orx-font-medium">{title}</h4>}
        <p className="text-body-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Fechar"
        >
          <XCircle size={20} />
        </button>
      )}
    </div>
  );
};

FormBanner.displayName ="OraclusXFormBanner";

export default FormBanner;
