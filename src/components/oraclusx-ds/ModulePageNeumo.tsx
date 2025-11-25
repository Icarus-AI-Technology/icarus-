import React from 'react';
// LucideIcon removed - use type from @/types/lucide
import { cn } from '@/lib/utils';
import { CardKpiNeumo } from './CardKpiNeumo';
import { MiniCardNeumo } from './MiniCardNeumo';
import { SearchBarNeumo } from './SearchBarNeumo';
import type { LucideIcon } from '@/types/lucide';

export interface ModuleKpiItem {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
}

export interface ModuleTabItem {
  id: string;
  label: string;
  count?: number;
}

interface ModulePageNeumoProps {
  title: string;
  subtitle?: string;
  kpis?: ModuleKpiItem[];
  tabs?: ModuleTabItem[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  children: React.ReactNode;
}

export const ModulePageNeumo: React.FC<ModulePageNeumoProps> = ({
  title,
  subtitle,
  kpis,
  tabs,
  activeTabId,
  onTabChange,
  searchPlaceholder,
  onSearchChange,
  onFilterClick,
  primaryActionLabel,
  onPrimaryAction,
  children,
}) => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
        </div>
        {primaryActionLabel && (
          <button
            onClick={onPrimaryAction}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-semibold shadow-[0_0_32px_rgba(139,92,246,0.55)]"
          >
            {primaryActionLabel}
          </button>
        )}
      </header>

      {kpis && kpis.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <CardKpiNeumo key={kpi.id} {...kpi} />
          ))}
        </section>
      )}

      {tabs && tabs.length > 0 && (
        <section className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <MiniCardNeumo
              key={tab.id}
              label={tab.label}
              chip={tab.count ? String(tab.count) : undefined}
              className={cn(activeTabId === tab.id && 'ring-2 ring-violet-500')}
              onClick={() => onTabChange?.(tab.id)}
            />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBarNeumo
          placeholder={searchPlaceholder || 'Buscar...'}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
        <button
          onClick={onFilterClick}
          className="ic-card-neumo px-6 py-3 rounded-full text-sm font-medium"
        >
          Filtros Avançados
        </button>
      </section>

      <section className="ic-card-neumo rounded-[32px] p-6">{children}</section>
    </div>
  );
};

export default ModulePageNeumo;
