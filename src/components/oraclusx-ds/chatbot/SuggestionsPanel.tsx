/**
 * OraclusX Design System - Chatbot Suggestions Panel
 * Version: 5.1.0
 *
 * Quick action suggestions panel for chatbot
 * Features: Neumorphic buttons, icons, module-aware
 *
 * @example
 * <SuggestionsPanel
 *   suggestions={[
 *     { text: "Ver alertas ativos", icon: Bell },
 *     { text: "Iniciar treinamento", icon: GraduationCap }
 *   ]}
 *   onSelect={(suggestion) => handleSuggestion(suggestion)}
 * />
 */

import React from 'react';
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;
import { cn } from '@/lib/utils';

export interface ChatSuggestion {
  /** Unique identifier */
  id: string;

  /** Suggestion text */
  text: string;

  /** Optional icon */
  icon?: LucideIcon;

  /** Click handler */
  action?: () => void;
}

export interface SuggestionsPanelProps {
  /** List of suggestions */
  suggestions: ChatSuggestion[];

  /** Selection handler */
  onSelect?: (suggestion: ChatSuggestion) => void;

  /** Title for the panel */
  title?: string;

  /** Additional class name */
  className?: string;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  onSelect,
  title = 'Sugestões:',
  className,
}) => {
  const handleClick = (suggestion: ChatSuggestion) => {
    suggestion.action?.();
    onSelect?.(suggestion);
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Title */}
      {title && (
        <p className="text-xs font-semibold text-orx-text-muted uppercase tracking-wide px-1">
          {title}
        </p>
      )}

      {/* Suggestion Buttons */}
      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const IconComponent = suggestion.icon;

          return (
            <button
              key={suggestion.id}
              onClick={() => handleClick(suggestion)}
              className={cn(
                // Base
                'w-full flex items-center gap-3',
                'px-4 py-3 rounded-xl',
                'text-left text-sm',
                // Neumorphic
                'bg-orx-bg-surface',
                'border border-orx-border-subtle',
                'shadow-neumo-sm',
                // Hover
                'hover:shadow-neumo',
                'hover:-translate-y-0.5',
                // Active
                'active:shadow-neumo-sm-inset',
                'active:translate-y-0',
                // Transition
                'transition-all duration-200',
                // Text
                'text-orx-text-primary font-medium'
              )}
              aria-label={suggestion.text}
            >
              {/* Icon */}
              {IconComponent && (
                <div
                  className={cn(
                    'flex-shrink-0',
                    'w-8 h-8 rounded-lg',
                    'flex items-center justify-center',
                    'bg-gradient-to-br from-violet-500 to-violet-600',
                    'text-white',
                    'shadow-sm'
                  )}
                >
                  <IconComponent size={16} strokeWidth={2.5} aria-hidden="true" />
                </div>
              )}

              {/* Text */}
              <span className="flex-1 leading-tight">{suggestion.text}</span>

              {/* Arrow indicator */}
              <svg
                className="w-4 h-4 text-orx-text-muted flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

SuggestionsPanel.displayName = 'SuggestionsPanel';

export default SuggestionsPanel;
