/**
 * OraclusX Design System - Dialog Primitives
 * Componentes compostos para Dialogs customizados
 */

import React, { useEffect, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Context para controle do Dialog
interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a DialogRoot');
  }
  return context;
};

// Root do Dialog (provider)
export interface DialogRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const DialogRoot: React.FC<DialogRootProps> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

// Overlay/Backdrop
export const DialogOverlay: React.FC<{ className?: string }> = ({ className }) => {
  const { open, onOpenChange } = useDialogContext();

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        'animate-in fade-in-0',
        className
      )}
      onClick={() => onOpenChange(false)}
      aria-hidden="true"
    />
  );
};

// Content container
export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
  showClose = true,
}) => {
  const { open, onOpenChange } = useDialogContext();

  if (!open) return null;

  return (
    <>
      <DialogOverlay />
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-lg max-h-[90vh] overflow-auto',
          'rounded-2xl p-6',
          'bg-[var(--surface)] border border-[var(--border)]',
          'shadow-xl',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              'absolute right-4 top-4 p-1 rounded-lg',
              'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              'hover:bg-[var(--surface-hover)] transition-colors'
            )}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </>
  );
};

// Header
export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => (
  <div className={cn('mb-4 pr-8', className)}>{children}</div>
);

// Title
export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
  <h2 className={cn('text-lg font-semibold text-[var(--text-primary)]', className)}>
    {children}
  </h2>
);

// Description
export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-sm text-[var(--text-secondary)] mt-1', className)}>{children}</p>
);

// Footer
export interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => (
  <div className={cn('mt-6 flex justify-end gap-3', className)}>{children}</div>
);

// Trigger (opcional, para abrir o dialog)
export interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  const { onOpenChange } = useDialogContext();

  return (
    <span onClick={() => onOpenChange(true)} role="button" tabIndex={0}>
      {children}
    </span>
  );
};

// Export all
export {
  DialogRoot as Dialog,
};

