/**
 * Toast Context - Sistema de notificações
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextData {
  toasts: Toast[];
  addToast: (
    toast: Omit<Toast, 'id'> | string,
    type?: Toast['type'],
    options?: {
      duration?: number;
    }
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (
      toastOrMessage: Omit<Toast, 'id'> | string,
      type: Toast['type'] = 'info',
      options?: { duration?: number }
    ) => {
      const id = Math.random().toString(36).substring(2, 11);

      const toastData: Omit<Toast, 'id'> =
        typeof toastOrMessage === 'string'
          ? {
              message: toastOrMessage,
              type,
              duration: options?.duration,
            }
          : toastOrMessage;

      const newToast: Toast = { ...toastData, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove após duration (padrão 5s)
      window.setTimeout(() => {
        removeToast(id);
      }, toastData.duration ?? 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: Toast['type']) => {
    const icons = {
      success: <CheckCircle size={20} className="text-success" />,
      error: <XCircle size={20} className="text-error" />,
      warning: <AlertCircle size={20} className="text-warning" />,
      info: <Info size={20} className="text-accent" />,
    };
    return icons[type];
  };

  const getStyles = (type: Toast['type']) => {
    const styles = {
      success: 'bg-success/5 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      error: 'bg-destructive/5 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      warning: 'bg-warning/5 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    };
    return styles[type];
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 space-y-2 max-w-md"
      role="region"
      aria-label="Notificações"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border shadow-lg
            animate-slide-in-right
            ${getStyles(toast.type)}
          `}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>

          <p
            className="flex-1 text-body-sm text-primary dark:text-gray-100"
            style={{ fontWeight: 500 }}
          >
            {toast.message}
          </p>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-muted hover:text-secondary dark:hover:text-gray-300 transition-colors"
            aria-label="Fechar notificação"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
