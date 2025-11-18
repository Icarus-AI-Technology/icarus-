/**
 * Drawer Component - OraclusX Design System
 * Painel lateral deslizante para formulários e conteúdo lateral
 */

import React, { useEffect } from"react";
import { X } from"lucide-react";
import { Button } from"./Button";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  position?:"left" |"right";
  size?:"sm" |"md" |"lg" |"xl";
  footer?: React.ReactNode;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position ="right",
  size ="md",
  footer,
  closeOnOverlay = true,
  showCloseButton = true,
}) => {
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

  // Bloquear scroll do body quando drawer aberto
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
    sm:"max-w-sm",
    md:"max-w-md",
    lg:"max-w-2xl",
    xl:"max-w-4xl",
  };

  const positionClasses = {
    left:"left-0",
    right:"right-0",
  };

  const animationClasses = {
    left: isOpen ?"animate-slide-in-left" :"animate-slide-out-left",
    right: isOpen ?"animate-slide-in-right" :"animate-slide-out-right",
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      aria-describedby={description ?"drawer-description" : undefined}
    >
      <div
        className={`
          fixed top-0 bottom-0
          ${positionClasses[position]}
          ${sizeClasses[size]}
          w-full
          bg-surface dark:bg-card
          shadow-2xl
          border-l border-gray-200 dark:border-border
          ${animationClasses[position]}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-border">
          <div className="flex-1">
            <h2
              id="drawer-title"
              className="text-heading font-display text-primary dark:text-inverse mb-1"
            >
              {title}
            </h2>
            {description && (
              <p
                id="drawer-description"
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
              aria-label="Fechar drawer"
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

export default Drawer;

