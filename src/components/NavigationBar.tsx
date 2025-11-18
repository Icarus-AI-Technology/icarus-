/**
 * OraclusX Design System - NavigationBar Component
 * Barra de navegação por abas neuromórfica
 */

import React, { useState } from"react";
import { cn } from"@/lib/utils";

export interface NavigationTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface NavigationBarProps {
  tabs: NavigationTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?:"default" |"centered";
  className?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  variant ="centered",
  className,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id ||"");
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <div
      className={cn("flex gap-2 p-2 orx-card",
        variant ==="centered" &&"justify-center",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn("relative inline-flex items-center gap-2 px-6 py-2.5 rounded-lg","font-medium text-body-sm transition-all duration-200","focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
              isActive
                ?"bg-primary text-inverse shadow-md"
                :"text-secondary dark:text-muted hover:bg-surface dark:hover:bg-gray-700",
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn("ml-2 px-2 py-0.5 rounded-full text-body-xs font-medium",
                  isActive
                    ?"bg-surface text-primary"
                    :"bg-primary text-inverse",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

NavigationBar.displayName ="OraclusXNavigationBar";

export default NavigationBar;
