/**
 * OraclusX DS - Section Component
 * Seções de página com espaçamento consistente e cabeçalho opcional
 */

import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps {
  /** Conteúdo da seção */
  children: ReactNode;
  /** Título da seção */
  title?: string;
  /** Descrição da seção */
  description?: string;
  /** Ações (botões, links) no canto superior direito */
  actions?: ReactNode;
  /** Variante visual */
  variant?: 'default' | 'highlight';
  /** Classes CSS adicionais */
  className?: string;
  /** ID da seção (para links âncora) */
  id?: string;
  /** Espaçamento vertical */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const spacingClasses = {
  sm: 'space-y-3',
  md: 'space-y-6',
  lg: 'space-y-8',
  xl: 'space-y-12',
};

/**
 * Section - Seção de página padronizada
 * 
 * @example
 * ```tsx
 * <Section
 *   title="Dashboard Principal"
 *   description="Visão consolidada dos KPIs"
 *   actions={<Button>Exportar</Button>}
 * >
 *   {conteúdo}
 * </Section>
 * ```
 */
export const Section: React.FC<SectionProps> = ({
  children,
  title,
  description,
  actions,
  variant = 'default',
  className,
  id,
  spacing = 'md',
}) => {
  const variantClasses = {
    default: '',
    highlight: 'orx-glass rounded-xl p-6',
  };

  const hasHeader = title || description || actions;

  return (
    <section
      id={id}
      className={cn(
        spacingClasses[spacing],
        variantClasses[variant],
        className
      )}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="orx-text-2xl orx-orx-font-bold text-[var(--orx-text-primary)] mb-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[var(--orx-text-secondary)]">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

Section.displayName = 'OraclusXSection';

export default Section;

