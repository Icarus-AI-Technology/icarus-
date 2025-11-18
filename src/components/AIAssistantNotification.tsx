/**
 * OraclusX Design System - AI Assistant Notification Component
 * Componente integrado de notificação + FAB (Floating Action Button)
 * Design neumórfico 3D compatível com ICARUS v5.0
 */

import React, { useState } from "react";
import { X, MessageCircle, ThumbsUp, ThumbsDown, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AINotification {
  id: string;
  title: string;
  suggestionCount?: number;
  source?: string;
  severity: "info" | "warning" | "critical" | "success";
  message: string;
  confidence?: number;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  onFeedback?: (positive: boolean) => void;
}

export interface AIAssistantNotificationProps {
  notifications: AINotification[];
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  maxVisible?: number;
  enableFAB?: boolean;
  fabLabel?: string;
  onOpenChat?: () => void;
  className?: string;
}

export const AIAssistantNotification: React.FC<AIAssistantNotificationProps> = ({
  notifications,
  position = "bottom-right",
  maxVisible = 3,
  enableFAB = true,
  fabLabel = "Abrir Chatbot",
  onOpenChat,
  className,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const positionClasses = {
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  const severityStyles = {
    info: {
      gradient: "from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950",
      border: "border-indigo-300 dark:border-indigo-700",
      icon: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300",
    },
    warning: {
      gradient: "from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950",
      border: "border-amber-300 dark:border-amber-700",
      icon: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    },
    critical: {
      gradient: "from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950",
      border: "border-red-300 dark:border-red-700",
      icon: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    },
    success: {
      gradient: "from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950",
      border: "border-emerald-300 dark:border-emerald-700",
      icon: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    },
  };

  const visibleNotifications = notifications
    .filter((n) => !dismissedIds.has(n.id))
    .slice(0, maxVisible);

  const handleDismiss = (notification: AINotification) => {
    setDismissedIds((prev) => new Set(prev).add(notification.id));
    notification.onDismiss?.();
  };

  const handleAction = (notification: AINotification) => {
    if (notification.onAction) {
      notification.onAction();
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn("fixed z-50 flex flex-col gap-4", positionClasses[position], className)}>
      {/* Notifications Stack */}
      {visibleNotifications.map((notification, index) => {
        const styles = severityStyles[notification.severity];
        const isExpanded = expandedId === notification.id;

        return (
          <div
            key={notification.id}
            className={cn(
              "transition-all duration-300 orx-card bg-gradient-to-br",
              "border-2 shadow-2xl backdrop-blur-sm",
              "w-80 md:w-96",
              styles.gradient,
              styles.border,
              "animate-in slide-in-from-right-5 fade-in duration-500",
              `[animation-delay:${index * 100}ms]`
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-4 pb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-purple-500 to-purple-600",
                    "shadow-[4px_4px_12px_rgba(139,92,246,0.3),-2px_-2px_8px_rgba(255,255,255,0.2)]"
                  )}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="orx-text-sm orx-orx-font-semibold text-[var(--orx-text-primary)] truncate">
                      {notification.title}
                    </h3>
                    {notification.suggestionCount && (
                      <span
                        className={cn(
                          "flex-shrink-0 px-2 py-0.5 rounded-full orx-text-xs orx-orx-font-medium",
                          styles.badge
                        )}
                      >
                        {notification.suggestionCount}
                      </span>
                    )}
                  </div>
                  {notification.source && (
                    <p className="orx-text-xs text-[var(--orx-text-secondary)]">{notification.source}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button"
                  onClick={() => toggleExpand(notification.id)}
                  className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label={isExpanded ? "Recolher" : "Expandir"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--orx-text-secondary)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--orx-text-secondary)]" />
                  )}
                </button>
                <button type="button"
                  onClick={() => handleDismiss(notification)}
                  className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 text-[var(--orx-text-secondary)]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={cn("px-4", isExpanded ? "pb-4" : "pb-3")}>
              <p
                className={cn(
                  "orx-text-sm text-[var(--orx-text-primary)]",
                  !isExpanded && "line-clamp-2"
                )}
              >
                {notification.message}
              </p>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                  {/* Confidence Badge */}
                  {notification.confidence !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="orx-text-xs text-[var(--orx-text-secondary)]">Confiança:</span>
                      <span className="orx-text-sm orx-orx-font-semibold text-[var(--orx-primary)]">
                        {notification.confidence}%
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  {(notification.actionLabel || notification.onAction || notification.actionUrl) && (
                    <button type="button"
                      onClick={() => handleAction(notification)}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl orx-orx-font-medium orx-text-sm text-white",
                        "bg-gradient-to-r from-purple-500 to-purple-600",
                        "shadow-[4px_4px_12px_rgba(139,92,246,0.3),-2px_-2px_8px_rgba(255,255,255,0.1)]",
                        "hover:shadow-[6px_6px_16px_rgba(139,92,246,0.4),-3px_-3px_10px_rgba(255,255,255,0.15)]",
                        "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-2px_-2px_6px_rgba(255,255,255,0.1)]",
                        "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                      )}
                    >
                      {notification.actionLabel || "Abrir"}
                    </button>
                  )}

                  {/* Feedback */}
                  {notification.onFeedback && (
                    <div className="flex items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                      <span className="orx-text-xs text-[var(--orx-text-secondary)] flex-1">
                        Esta sugestão foi útil?
                      </span>
                      <button type="button"
                        onClick={() => notification.onFeedback?.(true)}
                        className="p-2 rounded-lg transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                        aria-label="Útil"
                      >
                        <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </button>
                      <button type="button"
                        onClick={() => notification.onFeedback?.(false)}
                        className="p-2 rounded-lg transition-all hover:bg-red-100 dark:hover:bg-red-900/30"
                        aria-label="Não útil"
                      >
                        <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Action Button (FAB) */}
      {enableFAB && (
        <button
          onClick={onOpenChat}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-purple-500 to-purple-600",
            "text-white shadow-2xl",
            "transition-all duration-300",
            "hover:scale-110 hover:shadow-[0_20px_40px_rgba(139,92,246,0.5)]",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/50",
            // Neumorphic shadow
            "shadow-[8px_8px_16px_rgba(94,53,177,0.4),-4px_-4px_12px_rgba(255,255,255,0.3)]",
            "dark:shadow-[8px_8px_16px_rgba(94,53,177,0.6),-4px_-4px_12px_rgba(255,255,255,0.1)]",
            "hover:shadow-[12px_12px_24px_rgba(94,53,177,0.5),-6px_-6px_16px_rgba(255,255,255,0.4)]",
            "dark:hover:shadow-[12px_12px_24px_rgba(94,53,177,0.7),-6px_-6px_16px_rgba(255,255,255,0.15)]"
          )}
          aria-label={fabLabel}
          type="button"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Counter Badge on FAB */}
      {enableFAB && visibleNotifications.length > 0 && (
        <div
          className={cn(
            "absolute -top-1 -right-1 w-6 h-6 rounded-full",
            "bg-gradient-to-br from-red-500 to-red-600",
            "flex items-center justify-center",
            "text-white orx-text-xs orx-orx-font-bold",
            "shadow-lg border-2 border-white dark:border-gray-900",
            "animate-in zoom-in-50 duration-300"
          )}
        >
          {visibleNotifications.length}
        </div>
      )}
    </div>
  );
};

export default AIAssistantNotification;

