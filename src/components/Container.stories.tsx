/**
 * Storybook Stories - Container Component
 * Demonstração visual do componente Container (wrapper de layout)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '@/components/oraclusx-ds/Container';
import { Card } from '@/components/oraclusx-ds/Card';

const meta = {
  title: 'OraclusX DS/Layout/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Componente wrapper para layout consistente com max-width e centralização. Suporta diferentes tamanhos e espaçamentos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['5xl', '6xl', '7xl'],
      description: 'Largura máxima do container',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Espaçamento interno',
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Container Padrão</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Este é um exemplo de Container com max-width 5xl e padding médio.
        </p>
      </Card>
    ),
    maxWidth: '5xl',
    padding: 'md',
  },
};

export const LargeWidth: Story = {
  args: {
    children: (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Container 7xl</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Container extra largo (7xl) ideal para dashboards complexos.
        </p>
      </Card>
    ),
    maxWidth: '7xl',
    padding: 'lg',
  },
};

export const NoPadding: Story = {
  args: {
    children: (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Sem Padding</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Container sem padding interno para layouts full-width.
        </p>
      </Card>
    ),
    maxWidth: '6xl',
    padding: 'none',
  },
};

export const WithAnimation: Story = {
  args: {
    children: (
      <Card className="p-6 orx-animate-fade-in">
        <h2 className="text-2xl font-bold mb-4">Com Animação</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Container com animação de fade-in ao carregar.
        </p>
      </Card>
    ),
    maxWidth: '5xl',
    padding: 'lg',
    className: 'orx-animate-fade-in',
  },
};

export const NestedContainers: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Container Principal</h2>
          <p className="text-[var(--orx-text-secondary)] mb-4">
            Containers podem ser aninhados para criar layouts complexos.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 neuro-inset">
              <h3 className="font-semibold mb-2">Seção 1</h3>
              <p className="text-sm text-[var(--orx-text-secondary)]">Conteúdo aninhado</p>
            </Card>
            <Card className="p-4 neuro-inset">
              <h3 className="font-semibold mb-2">Seção 2</h3>
              <p className="text-sm text-[var(--orx-text-secondary)]">Conteúdo aninhado</p>
            </Card>
          </div>
        </Card>
      </div>
    ),
    maxWidth: '6xl',
    padding: 'md',
  },
};

