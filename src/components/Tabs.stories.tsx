/**
 * Storybook Stories - Tabs Component
 * Demonstração visual do componente Tabs
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '@/components/oraclusx-ds/Tabs';

const meta = {
  title: 'OraclusX DS/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientação das tabs',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  { id: 'tab1', label: 'Visão Geral', content: <div className="p-4">Conteúdo da aba Visão Geral</div> },
  { id: 'tab2', label: 'Detalhes', content: <div className="p-4">Conteúdo da aba Detalhes</div> },
  { id: 'tab3', label: 'Configurações', content: <div className="p-4">Conteúdo da aba Configurações</div> },
];

export const Horizontal: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'vertical',
  },
};

export const WithDefaultTab: Story = {
  args: {
    tabs: sampleTabs,
    defaultTab: 'tab2',
    variant: 'horizontal',
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: '1', label: 'Dashboard', content: <div className="p-4">Dashboard</div> },
      { id: '2', label: 'Relatórios', content: <div className="p-4">Relatórios</div> },
      { id: '3', label: 'Análises', content: <div className="p-4">Análises</div> },
      { id: '4', label: 'Configurações', content: <div className="p-4">Configurações</div> },
      { id: '5', label: 'Usuários', content: <div className="p-4">Usuários</div> },
      { id: '6', label: 'Notificações', content: <div className="p-4">Notificações</div> },
    ],
    variant: 'horizontal',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-[var(--bg-primary)]">
      <div>
        <h3 className="orx-text-sm orx-font-semibold mb-3 text-[var(--text-secondary)]">Horizontal</h3>
        <Tabs tabs={sampleTabs} variant="horizontal" />
      </div>
      <div>
        <h3 className="orx-text-sm orx-font-semibold mb-3 text-[var(--text-secondary)]">Vertical</h3>
        <Tabs tabs={sampleTabs} variant="vertical" />
      </div>
    </div>
  ),
};

