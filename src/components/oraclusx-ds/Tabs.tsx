/**
 * OraclusX Design System - Tabs Component
 * Abas de conteúdo com variantes horizontal/vertical
 * 
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (role="tablist", aria-selected, keyboard)
 * ✅ TypeScript strict
 */

import React, { useState, useRef } from"react";
import { cn } from"@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: number;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?:"horizontal" |"vertical";
  className?: string;
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant ="horizontal",
  className,
  fullWidth = false
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleTabChange = (tabId: string) => {
    if (tabs.find(t => t.id === tabId)?.disabled) return;
    
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentTab: Tab) => {
    const currentIndex = tabs.indexOf(currentTab);
    let nextIndex = currentIndex;

    if (variant ==="horizontal") {
      if (e.key ==="ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key ==="ArrowLeft") {
        nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      }
    } else {
      if (e.key ==="ArrowDown") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key ==="ArrowUp") {
        nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      }
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      if (!nextTab.disabled) {
        handleTabChange(nextTab.id);
        tabRefs.current.get(nextTab.id)?.focus();
      }
    }
  };

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div
      className={cn(
        variant ==="horizontal" ?"flex flex-col" :"flex gap-6",
        className
      )}
    >
      {/* Tab List */}
      <div
        className={cn("relative","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]","rounded-lg",
          variant ==="horizontal" ?"p-1 flex gap-1" :"p-2 flex flex-col gap-1 min-w-[200px]"
        )}
        role="tablist"
        aria-orientation={variant}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={cn("relative px-4 py-2 rounded-md transition-all duration-200","focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
              fullWidth &&"flex-1",
              activeTab === tab.id
                ?"bg-[var(--primary)] text-inverse shadow-md"
                :"text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:bg-[var(--surface-hover)]",
              tab.disabled &&"opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn("px-2 py-0.5 rounded-full",
                    activeTab === tab.id
                      ?"bg-surface/20 text-inverse"
                      :"bg-[var(--primary)] text-inverse"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={cn("flex-1",
          variant ==="horizontal" ?"mt-4" :""
        )}
      >
        {activeContent}
      </div>
    </div>
  );
};

