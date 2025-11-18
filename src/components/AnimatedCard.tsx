/**
 * OraclusX DS - AnimatedCard Component
 * Card com animações de entrada configuráveis
 */

import { type FC } from 'react';
import { Card, type CardProps } from './Card';
import { cn } from '@/lib/utils';
import { type AnimationType, enterAnimationStyle } from '@/lib/styleUtils';

export interface AnimatedCardProps extends Omit<CardProps, 'className'> {
  /** Tipo de animação de entrada */
  animation?: AnimationType;
  /** Delay da animação em ms */
  delay?: number;
  /** Duração da animação em ms */
  duration?: number;
  /** Adicionar efeito hover lift */
  hoverLift?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

const animationClasses: Record<AnimationType, string> = {
  fade: 'orx-animate-fade-in',
  slide: 'orx-animate-slide-up',
  scale: 'orx-animate-scale-in',
  bounce: 'orx-animate-bounce-in',
};

/**
 * AnimatedCard - Card com animações de entrada
 * 
 * @example
 * ```tsx
 * <AnimatedCard animation="slide" delay={100} hoverLift>
 *   <CardHeader>
 *     <CardTitle>Título</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Conteúdo animado
 *   </CardContent>
 * </AnimatedCard>
 * ```
 */
export const AnimatedCard: FC<AnimatedCardProps> = ({
  animation = 'fade',
  delay = 0,
  duration = 300,
  hoverLift = false,
  className,
  children,
  ...cardProps
}) => {
  return (
    <Card
      {...cardProps}
      className={cn(
        animationClasses[animation],
        hoverLift && 'orx-hover-lift',
        className
      )}
      style={{
        ...cardProps.style,
        ...enterAnimationStyle(delay, duration),
      }}
    >
      {children}
    </Card>
  );
};

AnimatedCard.displayName = 'OraclusXAnimatedCard';

export default AnimatedCard;

