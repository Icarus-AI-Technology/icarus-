/**
 * Storybook Stories - Radio Component
 * Demonstração visual do componente Radio
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from '@/components/oraclusx-ds/Radio';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label do radio',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Opção padrão',
    name: 'default',
    value: 'option1',
  },
};

export const Checked: Story = {
  args: {
    label: 'Opção selecionada',
    name: 'checked',
    value: 'option1',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Opção desabilitada',
    name: 'disabled',
    value: 'option1',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Desabilitada e selecionada',
    name: 'disabled-checked',
    value: 'option1',
    disabled: true,
    checked: true,
  },
};

export const RadioGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState('option1');
    return (
      <div className="flex flex-col gap-3 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <Radio 
          label="Opção 1" 
          name="group1" 
          value="option1"
          checked={selected === 'option1'}
          onChange={() => setSelected('option1')}
        />
        <Radio 
          label="Opção 2" 
          name="group1" 
          value="option2"
          checked={selected === 'option2'}
          onChange={() => setSelected('option2')}
        />
        <Radio 
          label="Opção 3" 
          name="group1" 
          value="option3"
          checked={selected === 'option3'}
          onChange={() => setSelected('option3')}
        />
        <p className="mt-4 orx-text-sm text-[var(--text-secondary)]">
          Selecionado: {selected}
        </p>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <div className="flex flex-col gap-2">
        <Radio label="Opção padrão" name="variants" value="1" />
        <Radio label="Opção selecionada" name="variants" value="2" checked />
        <Radio label="Opção desabilitada" name="variants" value="3" disabled />
        <Radio label="Desabilitada e selecionada" name="variants" value="4" disabled checked />
      </div>
    </div>
  ),
};

