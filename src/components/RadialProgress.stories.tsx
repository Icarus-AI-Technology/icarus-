/**
 * Storybook Stories - RadialProgress Component
 * Demonstração visual do componente RadialProgress
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RadialProgress } from '@/components/oraclusx-ds/RadialProgress';

const meta = {
  title: 'OraclusX DS/RadialProgress',
  component: RadialProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Valor do progresso (0-100)',
    },
    size: {
      control: 'number',
      description: 'Tamanho do círculo',
    },
    strokeWidth: {
      control: 'number',
      description: 'Espessura da linha',
    },
    showPercentage: {
      control: 'boolean',
      description: 'Mostrar porcentagem no centro',
    },
  },
} satisfies Meta<typeof RadialProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    showPercentage: true,
  },
};

export const Small: Story = {
  args: {
    value: 65,
    size: 80,
    strokeWidth: 6,
    showPercentage: true,
  },
};

export const Large: Story = {
  args: {
    value: 75,
    size: 200,
    strokeWidth: 12,
    showPercentage: true,
  },
};

export const WithoutPercentage: Story = {
  args: {
    value: 85,
    showPercentage: false,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    showPercentage: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <div className="flex flex-col items-center gap-2">
        <RadialProgress value={25} size={100} showPercentage />
        <span className="orx-text-sm text-[var(--text-secondary)]">25%</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <RadialProgress value={50} size={100} showPercentage />
        <span className="orx-text-sm text-[var(--text-secondary)]">50%</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <RadialProgress value={75} size={100} showPercentage />
        <span className="orx-text-sm text-[var(--text-secondary)]">75%</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <RadialProgress value={100} size={100} showPercentage />
        <span className="orx-text-sm text-[var(--text-secondary)]">100%</span>
      </div>
    </div>
  ),
};

