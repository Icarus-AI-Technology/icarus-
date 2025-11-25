/**
 * OraclusX Design System - Enhanced Chatbot FAB
 * Version: 5.1.0
 *
 * Floating Action Button with AI-focused icon and module context
 * Features: Bot icon, badge notifications, draggable, module colors
 *
 * @example
 * <ChatbotFAB
 *   moduleColor="violet-500"
 *   badge={3}
 *   onClick={() => setOpen(true)}
 * />
 */

import React from 'react';
import { Bot, BrainCircuit, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatbotFABProps {
  /** Click handler to open chatbot */
  onClick?: () => void;

  /** Notification badge count */
  badge?: number;

  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left';

  /** Module-specific color (e.g., 'violet-500', 'blue-500') */
  moduleColor?: string;

  /** Icon variant */
  iconVariant?: 'bot' | 'brain' | 'sparkles';

  /** Dragging state (for drag-and-drop) */
  dragging?: boolean;

  /** Additional class name */
  className?: string;
}

const ICON_COMPONENTS = {
  bot: Bot,
  brain: BrainCircuit,
  sparkles: Sparkles,
};

export const ChatbotFAB: React.FC<ChatbotFABProps> = ({
  onClick,
  badge,
  position = 'bottom-right',
  moduleColor = 'violet-500',
  iconVariant = 'bot',
  dragging = false,
  className,
}) => {
  const IconComponent = ICON_COMPONENTS[iconVariant];

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base
        'fixed z-50',
        'w-[72px] h-[72px] rounded-full',
        'flex items-center justify-center',
        'transition-all duration-300',
        // States
        dragging
          ? 'cursor-move opacity-80 scale-95'
          : 'cursor-pointer hover:scale-110 active:scale-95',
        // Background - Gradient based on module color
        moduleColor === 'violet-500' && 'bg-gradient-to-br from-violet-500 to-violet-600',
        moduleColor === 'blue-500' && 'bg-gradient-to-br from-blue-500 to-blue-600',
        moduleColor === 'green-500' && 'bg-gradient-to-br from-green-500 to-green-600',
        moduleColor === 'orange-500' && 'bg-gradient-to-br from-orange-500 to-orange-600',
        moduleColor === 'pink-500' && 'bg-gradient-to-br from-pink-500 to-pink-600',
        moduleColor === 'cyan-500' && 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        // Default fallback
        !moduleColor?.includes('-') && 'bg-gradient-to-br from-violet-500 to-violet-600',
        // Shadow
        'shadow-[0_8px_24px_rgba(0,0,0,0.15)]',
        'hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]',
        // Border
        'border-2 border-white/20',
        // Position
        positionClasses[position],
        className
      )}
      aria-label="Abrir Assistente ICARUS AI"
      aria-haspopup="dialog"
    >
      {/* AI Icon */}
      <IconComponent
        size={36}
        strokeWidth={2.5}
        className="text-white drop-shadow-lg"
        aria-hidden="true"
      />

      {/* Badge Notification */}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1',
            'w-6 h-6 rounded-full',
            'bg-red-500 text-white',
            'text-xs font-bold',
            'flex items-center justify-center',
            'border-2 border-white',
            'shadow-lg',
            'animate-pulse'
          )}
          aria-label={`${badge} novas mensagens`}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}

      {/* Pulse Ring Animation */}
      <span
        className={cn(
          'absolute inset-0 rounded-full',
          'animate-ping opacity-20',
          moduleColor === 'violet-500' && 'bg-violet-500',
          moduleColor === 'blue-500' && 'bg-blue-500',
          moduleColor === 'green-500' && 'bg-green-500',
          !moduleColor?.includes('-') && 'bg-violet-500'
        )}
        aria-hidden="true"
      />
    </button>
  );
};

ChatbotFAB.displayName = 'ChatbotFAB';

export default ChatbotFAB;
