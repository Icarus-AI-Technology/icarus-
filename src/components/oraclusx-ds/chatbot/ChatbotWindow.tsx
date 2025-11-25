/**
 * OraclusX Design System - Enhanced Chatbot Window
 * Version: 5.1.0
 *
 * Main chatbot interface with suggestions, voice input, file upload
 * Features: Module context, AI greeting, neumorphic design
 *
 * @example
 * <ChatbotWindow
 *   isOpen={true}
 *   onClose={() => setOpen(false)}
 *   moduleContext={{ name: "Dashboard", color: "violet-500" }}
 * />
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Paperclip, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import SuggestionsPanel, { type ChatSuggestion } from './SuggestionsPanel';
import Button from '../Button';
import Input from '../Input';

export interface ModuleContext {
  /** Module name */
  name: string;

  /** Module color */
  color: string;

  /** Module icon (optional) */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatbotWindowProps {
  /** Window open state */
  isOpen: boolean;

  /** Close handler */
  onClose: () => void;

  /** Module context */
  moduleContext?: ModuleContext;

  /** Suggestions for quick actions */
  suggestions?: ChatSuggestion[];

  /** Enable voice input */
  enableVoice?: boolean;

  /** Enable file upload */
  enableFileUpload?: boolean;

  /** Message send handler */
  onSendMessage?: (message: string) => void;

  /** Initial messages */
  initialMessages?: Message[];
}

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  isOpen,
  onClose,
  moduleContext = { name: 'ICARUS AI Assistant', color: 'violet-500' },
  suggestions = [],
  enableVoice = true,
  enableFileUpload = true,
  onSendMessage,
  initialMessages = [],
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: `👋 Olá!\n\nEu sou o **Assistente ICARUS AI**, seu copiloto inteligente para gestão de materiais OPME.\n\n**O que posso fazer por você?**`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    onSendMessage?.(inputValue);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: ChatSuggestion) => {
    setInputValue(suggestion.text);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        // Position
        'fixed bottom-6 right-6 z-50',
        // Size
        'w-[420px] h-[680px]',
        // Neumorphic card
        'rounded-2xl',
        'bg-gradient-to-br from-white/95 to-slate-50/90',
        'dark:from-slate-800/95 dark:to-slate-900/90',
        'border border-slate-200/50 dark:border-slate-700/50',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12),-4px_-4px_16px_rgba(255,255,255,0.8)]',
        'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),-4px_-4px_16px_rgba(51,65,85,0.2)]',
        // Backdrop blur
        'backdrop-blur-xl',
        // Animation
        'animate-scale-in'
      )}
      role="dialog"
      aria-label="Chatbot ICARUS AI"
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between',
          'px-6 py-4',
          'border-b border-orx-border-subtle',
          'bg-gradient-to-r',
          moduleContext.color === 'violet-500' && 'from-violet-500/10 to-violet-600/5',
          moduleContext.color === 'blue-500' && 'from-blue-500/10 to-blue-600/5',
          moduleContext.color === 'green-500' && 'from-green-500/10 to-green-600/5'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Bot Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-xl',
              'flex items-center justify-center',
              'bg-gradient-to-br',
              moduleContext.color === 'violet-500' && 'from-violet-500 to-violet-600',
              moduleContext.color === 'blue-500' && 'from-blue-500 to-blue-600',
              moduleContext.color === 'green-500' && 'from-green-500 to-green-600',
              'shadow-lg'
            )}
          >
            <Bot size={20} className="text-white" strokeWidth={2.5} />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-sm font-bold text-orx-text-primary">{moduleContext.name}</h2>
            <p className="text-xs text-orx-text-muted">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" />
              Online
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            'w-8 h-8 rounded-lg',
            'flex items-center justify-center',
            'text-orx-text-muted hover:text-orx-text-primary',
            'hover:bg-orx-bg-surface',
            'transition-colors'
          )}
          aria-label="Fechar chatbot"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 h-[calc(100%-180px)]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex', message.type === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] px-4 py-3 rounded-2xl',
                message.type === 'user'
                  ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg'
                  : 'bg-orx-bg-surface text-orx-text-primary shadow-neumo-sm border border-orx-border-subtle'
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Panel */}
      {suggestions.length > 0 && messages.length <= 1 && (
        <div className="px-6 pb-4">
          <SuggestionsPanel suggestions={suggestions} onSelect={handleSuggestionSelect} />
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-orx-border-subtle">
        <div className="flex items-end gap-2">
          {/* File Upload */}
          {enableFileUpload && (
            <button
              className={cn(
                'w-10 h-10 rounded-lg flex-shrink-0',
                'flex items-center justify-center',
                'text-orx-text-muted hover:text-orx-text-primary',
                'bg-orx-bg-surface hover:bg-orx-bg-light',
                'shadow-neumo-sm hover:shadow-neumo',
                'transition-all'
              )}
              aria-label="Anexar arquivo"
            >
              <Paperclip size={18} />
            </button>
          )}

          {/* Text Input */}
          <Input
            ref={inputRef}
            variant="neumo"
            inputSize="md"
            placeholder="Digite sua pergunta..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />

          {/* Voice Input */}
          {enableVoice && (
            <button
              onClick={() => setIsListening(!isListening)}
              className={cn(
                'w-10 h-10 rounded-lg flex-shrink-0',
                'flex items-center justify-center',
                'transition-all',
                isListening
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg animate-pulse'
                  : 'text-orx-text-muted hover:text-orx-text-primary bg-orx-bg-surface hover:bg-orx-bg-light shadow-neumo-sm hover:shadow-neumo'
              )}
              aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          {/* Send Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            aria-label="Enviar mensagem"
            icon={Send}
          />
          
        </div>
      </div>
    </div>
  );
};

ChatbotWindow.displayName = 'ChatbotWindow';

export default ChatbotWindow;
