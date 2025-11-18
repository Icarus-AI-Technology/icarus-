/**
 * OraclusX DS - GlassCard Component
 * Card com efeito glassmorphism avançado
 */

import React, { type ReactNode } from 'react';
import { Card, type CardProps } from './Card';
import { cn } from '@/lib/utils';
import { type BlurLevel } from '@/lib/styleUtils';

export interface GlassCardProps extends Omit<CardProps, 'className'> {
  /** Nível de blur do glass effect */
  blur?: BlurLevel;
  /** Adicionar gradiente de fundo */
  gradient?: boolean;
  /** Cor do gradiente (quando gradient=true) */
  gradientColor?: 'brand' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink';
  /** Classes CSS adicionais */
  className?: string;
}

const blurClasses: Record<BlurLevel, string> = {
  sm: 'orx-glass-sm',
  md: 'orx-glass-md',
  lg: 'orx-glass-lg',
  xl: 'orx-glass-xl',
};

const gradientClasses = {
  brand: 'orx-gradient-brand',
  success: 'orx-gradient-success',
  warning: 'orx-gradient-warning',
  error: 'orx-gradient-error',
  info: 'orx-gradient-info',
  purple: 'orx-gradient-purple',
  pink: 'orx-gradient-pink',
};

/**
 * GlassCard - Card com efeito glassmorphism
 * 
 * @example
 * ```tsx
 * <GlassCard blur="lg" gradient gradientColor="brand">
 *   <CardHeader>
 *     <CardTitle>Dashboard</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Conteúdo com efeito glass
 *   </CardContent>
 * </GlassCard>
 * ```
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  blur = 'md',
  gradient = false,
  gradientColor = 'brand',
  className,
  children,
  ...cardProps
}) => {
  return (
    <Card
      {...cardProps}
      className={cn(
        'orx-glass',
        blurClasses[blur],
        gradient && gradientClasses[gradientColor],
        gradient && 'text-white',
        className
      )}
    >
      {children}
    </Card>
  );
};

GlassCard.displayName = 'OraclusXGlassCard';

export default GlassCard;

