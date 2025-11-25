// LucideIcon removed - use type from @/types/lucide
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCadastrosStore } from '../store/cadastrosStore';
import type { LucideIcon } from '@/types/lucide';

interface RichTabItem {
  id: string;
  icon: LucideIcon;
  label: string;
  count: number;
  newCount?: number;
}

interface RichTabsProps {
  tabs: RichTabItem[];
}

export function RichTabs({ tabs }: RichTabsProps) {
  const { activeTab, setActiveTab } = useCadastrosStore();

  return (
    <div className="mb-6">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex-shrink-0 p-6 rounded-xl transition-all duration-200 min-w-[180px]',
                isActive
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-300 hover:shadow-md'
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={cn('p-3 rounded-lg', isActive ? 'bg-violet-500' : 'bg-slate-100')}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="text-center">
                  <p
                    className={cn(
                      'text-sm font-semibold mb-1',
                      isActive ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {tab.label}
                  </p>
                  <p
                    className={cn('text-2xl font-bold', isActive ? 'text-white' : 'text-slate-900')}
                  >
                    {tab.count.toLocaleString('pt-BR')}
                  </p>
                </div>

                {tab.newCount && tab.newCount > 0 && (
                  <div
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-bold',
                      isActive ? 'bg-emerald-400 text-white' : 'bg-emerald-100 text-emerald-600'
                    )}
                  >
                    +{tab.newCount}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
