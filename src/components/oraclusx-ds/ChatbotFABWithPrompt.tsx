/**
 * OraclusX Design System - ChatbotFABWithPrompt Component
 * FAB do Chatbot com prompt de entrada rápida
 */

import React, { useState } from"react";
import { MessageCircle, Send, X } from"lucide-react";
import { cn } from"@/lib/utils";

export interface ChatbotFABWithPromptProps {
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  position?:"bottom-right" |"bottom-left";
  suggestions?: string[];
  className?: string;
}

export const ChatbotFABWithPrompt: React.FC<ChatbotFABWithPromptProps> = ({
  onSendMessage,
  onClose,
  position ="bottom-right",
  suggestions = ["Como cadastrar um novo médico?","Ver cirurgias agendadas hoje","Relatório de estoque",
  ],
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");

  const positionClasses = {"bottom-right":"bottom-6 right-6","bottom-left":"bottom-6 left-6",
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message);
      setMessage("");
    }
  };

  const handleSuggestion = (suggestion: string) => {
    onSendMessage?.(suggestion);
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {isExpanded ? (
        <div className="orx-card p-4 w-80 mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-primary dark:text-gray-100 orx-font-medium">
              Em que posso ajudar?
            </h3>
            <button
              onClick={() => {
                setIsExpanded(false);
                onClose?.();
              }}
              className="p-1 hover:bg-surface dark:hover:bg-gray-700 rounded transition-colors"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2 mb-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestion(suggestion)}
                className="w-full text-left text-body-sm px-3 py-2 rounded-lg bg-surface dark:bg-card hover:bg-surface dark:hover:bg-gray-700 transition-colors text-secondary dark:text-muted"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key ==="Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="orx-input flex-1 text-body-sm"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="orx-button-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enviar"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn("orx-button-primary w-14 h-14 rounded-full","flex items-center justify-center","shadow-lg hover:shadow-xl","transition-all duration-200","hover:scale-110 active:scale-95",
        )}
        aria-label="Abrir Assistente IA"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

ChatbotFABWithPrompt.displayName ="OraclusXChatbotFABWithPrompt";

export default ChatbotFABWithPrompt;

