/**
 * Storybook Stories - Card Component
 * Demonstração visual do componente Card
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@/components/oraclusx-ds/Card';

const meta = {
  title: 'OraclusX DS/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'pressed', 'flat'],
      description: 'Variante visual do card',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Espaçamento interno',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2">Card Padrão</h3>
        <p className="text-[var(--text-secondary)]">Este é um card com estilo padrão do OraclusX DS.</p>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2">Card Elevado</h3>
        <p className="text-[var(--text-secondary)]">Card com efeito de elevação pronunciado.</p>
      </div>
    ),
  },
};

export const Pressed: Story = {
  args: {
    variant: 'pressed',
    children: (
      <div>
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2">Card Pressionado</h3>
        <p className="text-[var(--text-secondary)]">Card com efeito de pressão (inset).</p>
      </div>
    ),
  },
};

export const Pressed: Story = {
  args: {
    variant: 'pressed',
    children: (
      <div>
        <h3 className="orx-text-lg orx-orx-font-semibold mb-2">Card Pressionado</h3>
        <p className="text-[var(--text-secondary)]">Card com efeito inset.</p>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <div>
        <h3 className="orx-text-sm orx-orx-font-semibold">Padding Pequeno</h3>
      </div>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <div>
        <h3 className="orx-text-xl orx-orx-font-semibold mb-3">Padding Grande</h3>
        <p className="text-[var(--text-secondary)]">Card com espaçamento interno generoso.</p>
      </div>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-6 bg-[var(--bg-primary)]">
      <Card variant="default">
        <h3 className="orx-orx-font-semibold mb-1">Default</h3>
        <p className="orx-text-sm text-[var(--text-secondary)]">Estilo padrão</p>
      </Card>
      <Card variant="elevated">
        <h3 className="orx-orx-font-semibold mb-1">Elevated</h3>
        <p className="orx-text-sm text-[var(--text-secondary)]">Efeito elevado</p>
      </Card>
      <Card variant="pressed">
        <h3 className="orx-orx-font-semibold mb-1">Pressed</h3>
        <p className="orx-text-sm text-[var(--text-secondary)]">Efeito pressionado</p>
      </Card>
      <Card variant="default">
        <h3 className="orx-orx-font-semibold mb-1">Default</h3>
        <p className="orx-text-sm text-[var(--text-secondary)]">Estilo padrão</p>
      </Card>
    </div>
  ),
};

