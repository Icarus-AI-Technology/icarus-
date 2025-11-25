/**
 * OraclusX DS - AnimatedCard Component
 * Card com animações de entrada configuráveis
 */

import { type FC } from 'react';
import { Card, type CardProps } from './oraclusx-ds/Card';
import { cn } from '@/lib/utils';
import { type AnimationType, enterAnimationStyle } from '@/lib/styleUtils';

type LegacyAnimation = AnimationType | 'fadeIn' | 'slideUp' | 'scaleIn' | 'bounceIn';

export interface AnimatedCardProps extends Omit<CardProps, 'className'> {
  /** Tipo de animação de entrada */
  animation?: LegacyAnimation;
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

const animationAliases: Record<LegacyAnimation, AnimationType> = {
  fade: 'fade',
  slide: 'slide',
  scale: 'scale',
  bounce: 'bounce',
  fadeIn: 'fade',
  slideUp: 'slide',
  scaleIn: 'scale',
  bounceIn: 'bounce',
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
  const resolvedAnimation = animationAliases[animation] ?? 'fade';

  return (
    <Card
      {...cardProps}
      className={cn(animationClasses[resolvedAnimation], hoverLift && 'orx-hover-lift', className)}
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
