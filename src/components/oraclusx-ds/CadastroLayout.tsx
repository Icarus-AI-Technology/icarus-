import React from 'react';
// LucideIcon removed - use type from @/types/lucide
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/lucide';

export interface CadastroPageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export const CadastroPageLayout: React.FC<CadastroPageLayoutProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  ...props
}) => (
  <div className={cn('flex flex-col gap-6', className)} {...props}>
    <header className="ic-card-neumo rounded-[32px] p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="ic-icon-badge-neumo w-12 h-12 rounded-[24px] flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {description && <p className="text-sm text-white/70 mt-1">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </header>

    <section className="space-y-6">{children}</section>
  </div>
);

export interface CadastroSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export const CadastroSection: React.FC<CadastroSectionProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  ...props
}) => (
  <section
    className={cn('ic-card-neumo rounded-[28px] p-6 space-y-5 orx-animate-slide-up', className)}
    {...props}
  >
    {(title || description || Icon || actions) && (
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="ic-icon-badge-neumo w-10 h-10 rounded-3xl flex items-center justify-center mt-1">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <div>
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {description && <p className="text-sm text-white/70">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
      </div>
    )}
    <div className="space-y-4">{children}</div>
  </section>
);

export interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
}

const columnMap: Record<NonNullable<FormGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export const FormGrid: React.FC<FormGridProps> = ({
  columns = 2,
  className,
  children,
  ...props
}) => (
  <div className={cn('grid gap-4', columnMap[columns], className)} {...props}>
    {children}
  </div>
);

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
  reverseOnMobile?: boolean;
}

const alignMap: Record<NonNullable<FormActionsProps['align']>, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export const FormActions: React.FC<FormActionsProps> = ({
  align = 'right',
  reverseOnMobile = false,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col gap-3 sm:flex-row sm:items-center',
      alignMap[align],
      reverseOnMobile ? 'sm:flex-row-reverse' : '',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default {
  CadastroPageLayout,
  CadastroSection,
  FormGrid,
  FormActions,
};
