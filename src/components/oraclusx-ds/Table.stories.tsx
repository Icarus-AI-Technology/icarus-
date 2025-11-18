/**
 * Storybook Stories - Table Component
 * Demonstração visual do componente Table
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '@/components/oraclusx-ds/Table';
import { Badge } from '@/components/oraclusx-ds/Badge';

const meta = {
  title: 'OraclusX DS/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
];

const basicData = [
  { id: 1, name: 'João Silva', email: 'joao@email.com' },
  { id: 2, name: 'Maria Santos', email: 'maria@email.com' },
  { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com' },
];

export const Default: Story = {
  args: {
    columns: basicColumns,
    data: basicData,
  },
};

export const WithStatus: Story = {
  args: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nome' },
      { key: 'status', label: 'Status' },
      { key: 'email', label: 'Email' },
    ],
    data: [
      { 
        id: 1, 
        name: 'João Silva', 
        status: <Badge variant="success">Ativo</Badge>,
        email: 'joao@email.com' 
      },
      { 
        id: 2, 
        name: 'Maria Santos', 
        status: <Badge variant="warning">Pendente</Badge>,
        email: 'maria@email.com' 
      },
      { 
        id: 3, 
        name: 'Pedro Oliveira', 
        status: <Badge variant="error">Inativo</Badge>,
        email: 'pedro@email.com' 
      },
    ],
  },
};

export const Sortable: Story = {
  args: {
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Nome', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
    ],
    data: basicData,
  },
};

export const WithActions: Story = {
  args: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'actions', label: 'Ações' },
    ],
    data: [
      { 
        id: 1, 
        name: 'João Silva', 
        email: 'joao@email.com',
        actions: (
          <div className="flex gap-2">
            <button className="orx-text-sm text-[var(--orx-primary)] hover:underline">Editar</button>
            <button className="orx-text-sm text-[var(--orx-error)] hover:underline">Excluir</button>
          </div>
        ),
      },
      { 
        id: 2, 
        name: 'Maria Santos', 
        email: 'maria@email.com',
        actions: (
          <div className="flex gap-2">
            <button className="orx-text-sm text-[var(--orx-primary)] hover:underline">Editar</button>
            <button className="orx-text-sm text-[var(--orx-error)] hover:underline">Excluir</button>
          </div>
        ),
      },
    ],
  },
};

export const EmptyState: Story = {
  args: {
    columns: basicColumns,
    data: [],
  },
};

export const Loading: Story = {
  args: {
    columns: basicColumns,
    data: basicData,
    loading: true,
  },
};

