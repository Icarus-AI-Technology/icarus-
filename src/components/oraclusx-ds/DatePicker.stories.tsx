/**
 * Storybook Stories - DatePicker Component
 * Demonstração visual do componente DatePicker
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from '@/components/oraclusx-ds/DatePicker';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label do campo',
    },
    error: {
      control: 'text',
      description: 'Mensagem de erro',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Data de Nascimento',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Data Selecionada',
    value: '2024-10-26',
  },
};

export const WithError: Story = {
  args: {
    label: 'Data Obrigatória',
    error: 'Por favor, selecione uma data',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Data Desabilitada',
    value: '2024-10-26',
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [date, setDate] = useState('');
    return (
      <div className="w-[400px] p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <DatePicker 
          label="Selecione uma Data" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {date && (
          <p className="mt-4 orx-text-sm text-[var(--text-secondary)]">
            Data selecionada: {new Date(date).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[400px]">
      <DatePicker label="Data Padrão" />
      <DatePicker label="Com Valor" value="2024-10-26" />
      <DatePicker label="Com Erro" error="Campo obrigatório" />
      <DatePicker label="Desabilitado" value="2024-10-26" disabled />
    </div>
  ),
};

