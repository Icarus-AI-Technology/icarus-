/**
 * OraclusX DS - CategoryTabs Component
 * Tabs de categorias com ícones, contadores e trends
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface CategoryItem {
  /** ID único da categoria */
  id: string;
  /** Label da categoria */
  label: string;
  /** Ícone da categoria */
  icon: LucideIcon;
  /** Contador (opcional) */
  count?: number;
  /** Trend (opcional) */
  trend?: string;
}

export interface CategoryTabsProps {
  /** Array de categorias */
  categories: CategoryItem[];
  /** Categoria ativa */
  activeCategory: string;
  /** Callback de mudança de categoria */
  onChange: (categoryId: string) => void;
  /** Variante visual */
  variant?: 'default' | 'pills' | 'underline';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * CategoryTabs - Tabs de categorias padronizadas
 * 
 * @example
 * ```tsx
 * <CategoryTabs
 *   categories={[
 *     { id: "dashboard", label: "Dashboard IA", icon: Bot, count: 156, trend: "+12" },
 *     { id: "materiais", label: "Materiais OPME", icon: Package, count: 1243, trend: "+8" },
 *     { id: "alertas", label: "Alertas", icon: AlertCircle, count: 23, trend: "-3" }
 *   ]}
 *   activeCategory={activeCategory}
 *   onChange={setActiveCategory}
 * />
 * ```
 */
export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onChange,
  variant = 'default',
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(categoryId);
    }
  };

  const variantClasses = {
    default: 'grid gap-3',
    pills: 'flex flex-wrap gap-2',
    underline: 'flex gap-4 border-b border-[var(--orx-border-muted)]',
  };

  const itemBaseClasses = {
    default: 'flex flex-col items-center justify-center h-24 text-center rounded-xl transition-all duration-200',
    pills: 'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200',
    underline: 'flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200',
  };

  const itemActiveClasses = {
    default: 'neuro-raised scale-105',
    pills: 'neuro-raised scale-105',
    underline: 'border-[var(--orx-primary)] text-[var(--orx-primary)]',
  };

  const itemInactiveClasses = {
    default: 'neuro-flat hover:neuro-raised',
    pills: 'neuro-flat hover:neuro-raised',
    underline: 'border-transparent text-[var(--orx-text-secondary)] hover:text-[var(--orx-text-primary)]',
  };

  // Grid columns baseado no número de categorias
  const gridCols = categories.length <= 3
    ? `grid-cols-${categories.length}`
    : `grid-cols-2 sm:grid-cols-3 lg:grid-cols-${Math.min(categories.length, 6)}`;

  return (
    <div
      className={cn(
        variantClasses[variant],
        variant === 'default' && gridCols,
        className
      )}
      role="tablist"
    >
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${category.id}`}
            id={`tab-${category.id}`}
            onClick={() => onChange(category.id)}
            onKeyDown={(e) => handleKeyDown(e, category.id)}
            className={cn(
              itemBaseClasses[variant],
              isActive ? itemActiveClasses[variant] : itemInactiveClasses[variant]
            )}
          >
            <Icon
              className={cn(
                'flex-shrink-0',
                variant === 'default' ? 'w-5 h-5 mb-1' : 'w-4 h-4',
                'text-[var(--orx-primary)]'
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'orx-orx-font-medium text-[var(--orx-text-primary)]',
                variant === 'default' ? 'orx-text-xs' : 'orx-text-sm'
              )}
            >
              {category.label}
            </span>
            {(category.count !== undefined || category.trend) && (
              <div className="flex items-center gap-1 mt-1">
                {category.count !== undefined && (
                  <span
                    className={cn(
                      'font-display text-[var(--orx-text-primary)]',
                      variant === 'default' ? 'orx-text-lg' : 'orx-text-base'
                    )}
                  >
                    {category.count}
                  </span>
                )}
                {category.trend && (
                  <span
                    className={cn(
                      'orx-text-xs',
                      category.trend.startsWith('+')
                        ? 'text-[var(--orx-success)]'
                        : category.trend.startsWith('-')
                        ? 'text-[var(--orx-error)]'
                        : 'text-[var(--orx-text-secondary)]'
                    )}
                  >
                    {category.trend}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

CategoryTabs.displayName = 'OraclusXCategoryTabs';

export default CategoryTabs;

