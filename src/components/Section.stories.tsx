/**
 * Storybook Stories - Section Component
 * Demonstração visual do componente Section (seção de página)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Section } from '@/components/oraclusx-ds/Section';
import { Card } from '@/components/oraclusx-ds/Card';

const meta = {
  title: 'OraclusX DS/Layout/Section',
  component: Section,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Componente wrapper para seções de página com espaçamento consistente. Suporta diferentes tamanhos de padding.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Espaçamento vertical da seção',
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Card className="p-6">
        <h2 className="orx-text-xl orx-orx-font-bold mb-2">Seção Padrão</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Seção com espaçamento médio padrão.
        </p>
      </Card>
    ),
    padding: 'md',
  },
};

export const SmallPadding: Story = {
  args: {
    children: (
      <Card className="p-6">
        <h2 className="orx-text-xl orx-orx-font-bold mb-2">Seção com Padding Pequeno</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Ideal para seções compactas.
        </p>
      </Card>
    ),
    padding: 'sm',
  },
};

export const LargePadding: Story = {
  args: {
    children: (
      <Card className="p-6">
        <h2 className="orx-text-xl orx-orx-font-bold mb-2">Seção com Padding Grande</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Mais espaço para respiração visual.
        </p>
      </Card>
    ),
    padding: 'lg',
  },
};

export const NoPadding: Story = {
  args: {
    children: (
      <Card className="p-6">
        <h2 className="orx-text-xl orx-orx-font-bold mb-2">Seção Sem Padding</h2>
        <p className="text-[var(--orx-text-secondary)]">
          Controle total sobre o espaçamento.
        </p>
      </Card>
    ),
    padding: 'none',
  },
};

export const MultipleSections: Story = {
  render: () => (
    <div>
      <Section padding="md">
        <Card className="p-6">
          <h2 className="orx-text-xl orx-orx-font-bold mb-2">Primeira Seção</h2>
          <p className="text-[var(--orx-text-secondary)]">Conteúdo da primeira seção.</p>
        </Card>
      </Section>
      <Section padding="md">
        <Card className="p-6">
          <h2 className="orx-text-xl orx-orx-font-bold mb-2">Segunda Seção</h2>
          <p className="text-[var(--orx-text-secondary)]">Conteúdo da segunda seção.</p>
        </Card>
      </Section>
      <Section padding="md">
        <Card className="p-6">
          <h2 className="orx-text-xl orx-orx-font-bold mb-2">Terceira Seção</h2>
          <p className="text-[var(--orx-text-secondary)]">Conteúdo da terceira seção.</p>
        </Card>
      </Section>
    </div>
  ),
};

export const WithGrid: Story = {
  args: {
    children: (
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="orx-orx-font-semibold mb-2">Card 1</h3>
          <p className="orx-text-sm text-[var(--orx-text-secondary)]">Conteúdo em grid.</p>
        </Card>
        <Card className="p-6">
          <h3 className="orx-orx-font-semibold mb-2">Card 2</h3>
          <p className="orx-text-sm text-[var(--orx-text-secondary)]">Conteúdo em grid.</p>
        </Card>
      </div>
    ),
    padding: 'lg',
  },
};

