/**
 * OraclusX Design System - ChatbotCloseButton Component
 * Botão para fechar o chatbot
 */

import React from"react";
import { X } from"lucide-react";
import { cn } from"@/lib/utils";

export interface ChatbotCloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?:"sm" |"md" |"lg";
}

export const ChatbotCloseButton = React.forwardRef<
  HTMLButtonElement,
  ChatbotCloseButtonProps
>(({ className, size ="md", ...props }, ref) => {
  const sizeClasses = {
    sm:"p-1.5",
    md:"p-2",
    lg:"p-2.5",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      ref={ref}
      className={cn("orx-button rounded-full","hover:bg-surface dark:hover:bg-gray-700","transition-all duration-150",
        sizeClasses[size],
        className,
      )}
      aria-label="Fechar chatbot"
      {...props}
    >
      <X size={iconSizes[size]} />
    </button>
  );
});

ChatbotCloseButton.displayName ="OraclusXChatbotCloseButton";

export default ChatbotCloseButton;

