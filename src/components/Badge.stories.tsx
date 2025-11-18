/**
 * Storybook Stories - Badge Component
 * Demonstração visual do componente Badge
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/oraclusx-ds/Badge';

const meta = {
  title: 'OraclusX DS/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'neutral'],
      description: 'Variante visual da badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge Padrão',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primário',
    variant: 'primary',
  },
};

export const Success: Story = {
  args: {
    children: 'Sucesso',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Aviso',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Erro',
    variant: 'error',
  },
};

export const DefaultBadge: Story = {
  args: {
    children: 'Padrão',
    variant: 'default',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

export const StatusExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <div className="flex items-center gap-2">
        <Badge variant="success">Ativo</Badge>
        <span className="text-sm">Sistema operacional</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="warning">Pendente</Badge>
        <span className="text-sm">Aguardando aprovação</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="error">Inativo</Badge>
        <span className="text-sm">Serviço indisponível</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="primary">Novo</Badge>
        <span className="text-sm">Recurso recém-lançado</span>
      </div>
    </div>
  ),
};

