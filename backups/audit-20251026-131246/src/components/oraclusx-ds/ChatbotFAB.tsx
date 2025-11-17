/**
 * OraclusX Design System - ChatbotFAB Component
 * Floating Action Button para Chatbot
 */

import React from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatbotFABProps {
  onClick?: () => void;
  badge?: number;
  position?: "bottom-right" | "bottom-left";
  className?: string;
  dragging?: boolean;
}

export const ChatbotFAB: React.FC<ChatbotFABProps> = ({
  onClick,
  badge,
  position = "bottom-right",
  className,
  dragging = false,
}) => {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-50",
        "w-[77px] h-[77px] rounded-full",
        "flex items-center justify-center",
        "transition-all duration-200",
        dragging
          ? "cursor-move opacity-80"
          : "cursor-pointer hover:scale-105 active:scale-95",
        "bg-[var(--primary)] text-[var(--primary-foreground)]",
        "shadow-[var(--shadow-raised)] dark:shadow-[var(--shadow-raised-dark)]",
        "border border-[var(--border-subtle)]",
        positionClasses[position],
        className,
      )}
      aria-label="Abrir Chatbot"
    >
      <MessageCircle size={34} strokeWidth={2.2} className="drop-shadow-sm" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-destructive text-inverse text-[10px] rounded-full flex items-center justify-center border border-[var(--background)] font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
};

ChatbotFAB.displayName = "OraclusXChatbotFAB";

export default ChatbotFAB;
