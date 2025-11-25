/**
 * Layout System - Container Component
 * Sistema de container responsivo com máxima largura configurável
 * Integrado com OraclusX DS (Neumorphic 3D Premium)
 */

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Tamanho máximo do container
   * - sm: 640px
   * - md: 768px
   * - lg: 1024px
   * - xl: 1280px (padrão)
   * - 2xl: 1536px
   * - full: 100%
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  /**
   * Padding horizontal
   * - none: 0
   * - sm: 1rem (16px)
   * - md: 1.5rem (24px) - padrão
   * - lg: 2rem (32px)
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Centralizar horizontalmente
   */
  center?: boolean;
}

const maxWidthClasses: Record<NonNullable<ContainerProps['maxWidth']>, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-[1600px]',
  '4xl': 'max-w-[1800px]',
  '5xl': 'max-w-[2048px]',
  full: 'max-w-full',
};

const paddingClasses: Record<NonNullable<ContainerProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Container Component
 * Wrapper responsivo para conteúdo da página
 */
export function Container({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  center = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}
