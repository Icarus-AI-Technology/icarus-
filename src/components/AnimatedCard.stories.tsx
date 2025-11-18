/**
 * Storybook Stories - AnimatedCard Component
 * Demonstração visual do componente AnimatedCard (card com animações)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedCard } from '@/components/oraclusx-ds/AnimatedCard';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Display/AnimatedCard',
  component: AnimatedCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card com animações de entrada e efeitos hover integrados. Suporta diferentes tipos de animação e delays para efeitos staggered.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    animation: {
      control: 'select',
      options: ['fadeIn', 'slideUp', 'scaleIn'],
      description: 'Tipo de animação de entrada',
    },
    hoverEffect: {
      control: 'select',
      options: ['lift', 'scale', 'glow'],
      description: 'Efeito ao passar o mouse',
    },
    delay: {
      control: 'number',
      description: 'Delay da animação em ms',
    },
  },
} satisfies Meta<typeof AnimatedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FadeIn: Story = {
  args: {
    animation: 'fadeIn',
    hoverEffect: 'lift',
    children: (
      <div className="p-6 min-w-[300px]">
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Card com Fade In
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Animação suave de fade in ao aparecer.
        </p>
      </div>
    ),
  },
};

export const SlideUp: Story = {
  args: {
    animation: 'slideUp',
    hoverEffect: 'lift',
    children: (
      <div className="p-6 min-w-[300px]">
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Card com Slide Up
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Desliza suavemente de baixo para cima.
        </p>
      </div>
    ),
  },
};

export const ScaleIn: Story = {
  args: {
    animation: 'scaleIn',
    hoverEffect: 'scale',
    children: (
      <div className="p-6 min-w-[300px]">
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Card com Scale In
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Cresce gradualmente ao aparecer.
        </p>
      </div>
    ),
  },
};

export const WithGlowEffect: Story = {
  args: {
    animation: 'fadeIn',
    hoverEffect: 'glow',
    className: 'orx-glass-md',
    children: (
      <div className="p-6 min-w-[300px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--orx-primary)]/10 to-[var(--orx-primary)]/5">
            <TrendingUp size={24} className="text-[var(--orx-primary)]" />
          </div>
          <div>
            <p className="orx-text-sm text-[var(--orx-text-secondary)]">Receita Mensal</p>
            <p className="orx-text-2xl orx-orx-font-bold text-[var(--orx-text-primary)]">R$ 45.280</p>
          </div>
        </div>
        <p className="orx-text-sm text-[var(--orx-success)]">+12.5% vs mês anterior</p>
      </div>
    ),
  },
};

export const StaggeredCards: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <AnimatedCard animation="slideUp" hoverEffect="lift" delay={0}>
        <div className="p-6">
          <Users size={32} className="text-[var(--orx-primary)] mb-3" />
          <h3 className="orx-orx-font-semibold mb-1">1.284</h3>
          <p className="orx-text-sm text-[var(--orx-text-secondary)]">Usuários Ativos</p>
        </div>
      </AnimatedCard>
      <AnimatedCard animation="slideUp" hoverEffect="lift" delay={100}>
        <div className="p-6">
          <DollarSign size={32} className="text-[var(--orx-success)] mb-3" />
          <h3 className="orx-orx-font-semibold mb-1">R$ 125.4K</h3>
          <p className="orx-text-sm text-[var(--orx-text-secondary)]">Faturamento</p>
        </div>
      </AnimatedCard>
      <AnimatedCard animation="slideUp" hoverEffect="lift" delay={200}>
        <div className="p-6">
          <TrendingUp size={32} className="text-[var(--orx-info)] mb-3" />
          <h3 className="orx-orx-font-semibold mb-1">+18.2%</h3>
          <p className="orx-text-sm text-[var(--orx-text-secondary)]">Crescimento</p>
        </div>
      </AnimatedCard>
    </div>
  ),
};

export const WithGlassmorphism: Story = {
  args: {
    animation: 'fadeIn',
    hoverEffect: 'lift',
    className: 'orx-glass-lg',
    children: (
      <div className="p-6 min-w-[300px] backdrop-blur-xl">
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Card Glassmorphism
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Efeito de vidro fosco com blur e transparência.
        </p>
      </div>
    ),
  },
};

