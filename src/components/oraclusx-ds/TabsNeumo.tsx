import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';
// LucideIcon removed - use type from @/types/lucide

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  newCount?: number;
}

interface TabsNeumoProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const TabsNeumo: React.FC<TabsNeumoProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex flex-col items-start justify-between p-5 min-w-[180px] h-[140px] rounded-2xl transition-all duration-300 ease-out group',
              isActive
                ? 'bg-violet-600 text-white shadow-[0_10px_20px_rgba(124,58,237,0.4)] translate-y-[-4px]'
                : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-slate-400 shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.8)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.05)] hover:translate-y-[-2px] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.08),-8px_-8px_16px_rgba(255,255,255,0.9)]'
            )}
          >
            <div className="flex justify-between w-full">
              <div
                className={cn(
                  'p-2.5 rounded-xl transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600'
                )}
              >
                <Icon size={24} />
              </div>
              {tab.newCount && (
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-bold rounded-full',
                    isActive
                      ? 'bg-white text-violet-600'
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  )}
                >
                  +{tab.newCount}
                </span>
              )}
            </div>

            <div className="flex flex-col items-start gap-1 mt-auto">
              <span
                className={cn(
                  'text-3xl font-bold tracking-tight',
                  isActive ? 'text-white' : 'text-slate-800 dark:text-white'
                )}
              >
                {tab.count}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-violet-100' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
