/**
 * OraclusX DS - PageHeader Component
 * Cabeçalho padronizado de página com título, descrição, ícone e ações
 */

import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge, type BadgeProps } from './Badge';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import type { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  /** Título da página */
  title: string;
  /** Descrição da página */
  description?: string;
  /** Ícone da página */
  icon?: LucideIcon;
  /** Ações (botões, links) no canto superior direito */
  actions?: ReactNode;
  /** Breadcrumbs de navegação */
  breadcrumbs?: BreadcrumbItem[];
  /** Badge de status ou categoria */
  badge?: {
    label: string;
    variant?: BadgeProps['variant'];
  };
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * PageHeader - Cabeçalho padronizado de página
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Dashboard Principal"
 *   description="Visão consolidada de todos os KPIs críticos"
 *   icon={Home}
 *   badge={{ label: "Realtime", variant: "success" }}
 *   actions={<Button>Exportar</Button>}
 *   breadcrumbs={[
 *     { label: "Início", href: "/" },
 *     { label: "Dashboard" }
 *   ]}
 * />
 * ```
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  badge,
  className,
}) => {
  return (
    <div className={cn('space-y-4 pb-6 border-b border-[var(--orx-border-muted)]', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}

      {/* Header principal */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Ícone */}
          {Icon && (
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl neuro-raised flex items-center justify-center shadow-[var(--shadow-light-outer)]">
              <Icon
                className="w-7 h-7 text-[var(--orx-primary)]"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Título e descrição */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="orx-text-3xl orx-orx-font-bold text-[var(--orx-text-primary)] leading-tight">
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || 'default'}>
                  {badge.label}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-[var(--orx-text-secondary)] orx-text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Ações */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.displayName = 'OraclusXPageHeader';

export default PageHeader;

