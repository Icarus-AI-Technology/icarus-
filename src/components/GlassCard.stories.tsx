/**
 * Storybook Stories - GlassCard Component
 * Demonstração visual do componente GlassCard (card com glassmorphism)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from '@/components/oraclusx-ds/GlassCard';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Display/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card com efeito glassmorphism (vidro fosco). Suporta diferentes intensidades de blur e transparência.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    intensity: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Intensidade do efeito glass',
    },
  },
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    intensity: 'sm',
    children: (
      <div className="p-6 min-w-[300px]">
        <h3 className="orx-text-lg orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Glass Effect Small
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Efeito sutil de vidro fosco com blur leve.
        </p>
      </div>
    ),
  },
};

export const Medium: Story = {
  args: {
    intensity: 'md',
    children: (
      <div className="p-6 min-w-[300px]">
        <h3 className="orx-text-lg orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Glass Effect Medium
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Efeito médio de vidro fosco, ideal para cards.
        </p>
      </div>
    ),
  },
};

export const Large: Story = {
  args: {
    intensity: 'lg',
    children: (
      <div className="p-6 min-w-[300px]">
        <h3 className="orx-text-lg orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Glass Effect Large
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Efeito pronunciado com blur intenso.
        </p>
      </div>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    intensity: 'xl',
    children: (
      <div className="p-6 min-w-[300px]">
        <h3 className="orx-text-lg orx-font-semibold mb-2 text-[var(--orx-text-primary)]">
          Glass Effect XL
        </h3>
        <p className="text-[var(--orx-text-secondary)]">
          Máximo efeito de blur para destaque visual.
        </p>
      </div>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    intensity: 'lg',
    children: (
      <div className="p-6 min-w-[300px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--orx-primary)]/10 to-[var(--orx-primary)]/5">
            <Sparkles size={24} className="text-[var(--orx-primary)]" />
          </div>
          <div>
            <h3 className="orx-text-lg orx-font-semibold text-[var(--orx-text-primary)]">
              AI Insights
            </h3>
            <p className="orx-text-sm text-[var(--orx-text-secondary)]">
              Powered by Machine Learning
            </p>
          </div>
        </div>
        <p className="text-[var(--orx-text-secondary)]">
          Card glassmorphism com ícone e conteúdo rico.
        </p>
      </div>
    ),
  },
};

export const WithStats: Story = {
  args: {
    intensity: 'md',
    children: (
      <div className="p-6 min-w-[300px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="orx-text-sm text-[var(--orx-text-secondary)] mb-1">Usuários Ativos</p>
            <p className="orx-text-3xl orx-font-bold text-[var(--orx-text-primary)]">1.284</p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--orx-success)]/10">
            <Users size={24} className="text-[var(--orx-success)]" />
          </div>
        </div>
        <div className="flex items-center gap-2 orx-text-sm">
          <TrendingUp size={16} className="text-[var(--orx-success)]" />
          <span className="text-[var(--orx-success)] orx-font-medium">+12.5%</span>
          <span className="text-[var(--orx-text-secondary)]">vs último mês</span>
        </div>
      </div>
    ),
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <GlassCard intensity="md">
        <div className="p-6">
          <h3 className="orx-font-semibold mb-2">Card 1</h3>
          <p className="orx-text-sm text-[var(--orx-text-secondary)]">Efeito glass médio</p>
        </div>
      </GlassCard>
      <GlassCard intensity="lg">
        <div className="p-6">
          <h3 className="orx-font-semibold mb-2">Card 2</h3>
          <p className="orx-text-sm text-[var(--orx-text-secondary)]">Efeito glass intenso</p>
        </div>
      </GlassCard>
    </div>
  ),
};

