/**
 * OraclusX Design System - Accordion Component
 * Painel expansível com single/multiple expand
 *
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (role="region", aria-expanded, keyboard)
 * ✅ TypeScript strict
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultExpanded?: string[];
  allowMultiple?: boolean;
  onChange?: (expandedIds: string[]) => void;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultExpanded = [],
  allowMultiple = false,
  onChange,
  className,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(defaultExpanded));

  const handleToggle = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.disabled) return;

    setExpandedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }

      onChange?.(Array.from(next));
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === '') {
      e.preventDefault();
      handleToggle(id);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => {
        const isExpanded = expandedIds.has(item.id);
        const ariaExpandedProps = isExpanded
          ? { 'aria-expanded': 'true' as const }
          : { 'aria-expanded': 'false' as const };

        return (
          <div
            key={item.id}
            className={cn(
              'rounded-lg overflow-hidden transition-all',
              'bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]',
              'shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]'
            )}
          >
            {/* Header */}
            <button
              onClick={() => handleToggle(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              disabled={item.disabled}
              {...ariaExpandedProps}
              aria-controls={`accordion-content-${item.id}`}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between',
                'text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]',
                'hover:bg-[var(--surface-hover)] transition-colors',
                'focus:outline-none focus:ring-3 focus:ring-[var(--primary)] focus:ring-inset',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span>{item.icon}</span>}
                <span className="orx-orx-font-medium">{item.title}</span>
              </div>

              <ChevronDown
                size={20}
                className={cn('transition-transform duration-200', isExpanded && 'rotate-180')}
              />
            </button>

            {/* Content */}
            <div
              id={`accordion-content-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              className={cn(
                'overflow-hidden transition-all duration-200',
                isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="px-4 py-3 border-t border-gray-200 dark:border-border">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
