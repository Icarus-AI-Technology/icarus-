/**
 * Modal Component - OraclusX Design System
 * Sistema de modal com overlay, animações e acessibilidade
 */

import React, { useEffect, useRef } from"react";
import { X } from"lucide-react";
import { Button } from"./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?:"sm" |"md" |"lg" |"xl" |"full";
  footer?: React.ReactNode;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size ="md",
  footer,
  closeOnOverlay = true,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key ==="Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow ="hidden";
    } else {
      document.body.style.overflow ="unset";
    }

    return () => {
      document.body.style.overflow ="unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm:"max-w-md",
    md:"max-w-2xl",
    lg:"max-w-4xl",
    xl:"max-w-6xl",
    full:"max-w-[95vw]",
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ?"modal-description" : undefined}
    >
      <div
        ref={modalRef}
        className={`
          ${sizeClasses[size]}
          w-full
          bg-surface dark:bg-card
          rounded-xl
          shadow-2xl
          border border-gray-200 dark:border-border
          animate-scale-in
          max-h-[90vh]
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-border">
          <div className="flex-1">
            <h2
              id="modal-title"
              className="text-heading font-display text-primary dark:text-inverse mb-1"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="text-body-sm text-secondary dark:text-muted"
              >
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="ml-4"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-border bg-surface dark:bg-background/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
