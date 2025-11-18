/**
 * OraclusX DS - Container Component
 * Wrapper padronizado para layouts com variantes neumórficas e glass
 */

import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { neuStyle, glassEffect } from '@/lib/styleUtils';

export interface ContainerProps {
  /** Conteúdo do container */
  children: ReactNode;
  /** Variante visual do container */
  variant?: 'default' | 'glass' | 'gradient' | 'neumorphic';
  /** Padding interno */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Classes CSS adicionais */
  className?: string;
  /** Largura máxima do container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /** Centralizar conteúdo */
  centered?: boolean;
  /** ID para testes */
  'data-testid'?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-7xl',
  '4xl': 'max-w-[1920px]',
  '5xl': 'max-w-[2048px]',
  '6xl': 'max-w-[2560px]',
  '7xl': 'max-w-[3840px]',
  full: 'max-w-full',
};

/**
 * Container - Wrapper padronizado para layouts
 * 
 * @example
 * ```tsx
 * <Container variant="neumorphic" padding="lg" maxWidth="7xl">
 *   <h1>Conteúdo da página</h1>
 * </Container>
 * ```
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  maxWidth = '7xl',
  centered = true,
  className,
  'data-testid': testId,
}) => {
  const variantClasses = {
    default: '',
    glass: 'orx-glass rounded-xl',
    gradient: 'orx-gradient-brand text-white rounded-xl',
    neumorphic: `${neuStyle('raised')} rounded-xl`,
  };

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        centered && 'mx-auto',
        paddingClasses[padding],
        variantClasses[variant],
        className
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

Container.displayName = 'OraclusXContainer';

export default Container;

