/**
 * Storybook Stories - Switch Component
 * Demonstração visual do componente Switch
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/oraclusx-ds/Switch';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label do switch',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Notificações',
  },
};

export const Checked: Story = {
  args: {
    label: 'Ativo',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Switch desabilitado',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Desabilitado e ativo',
    disabled: true,
    checked: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false);
    return (
      <div className="p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <Switch 
          label="Modo Escuro" 
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Estado: {enabled ? 'Ligado' : 'Desligado'}
        </p>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <Switch label="Notificações" />
      <Switch label="Modo Escuro" checked />
      <Switch label="Auto-atualizar" />
      <Switch label="Opção desabilitada" disabled />
      <Switch label="Desabilitado e ativo" disabled checked />
    </div>
  ),
};

