/**
 * Storybook Stories - FormActions Component
 * Demonstração visual do componente FormActions
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FormActions } from '@/components/oraclusx-ds/CadastroLayout';
import { Button } from '@/components/oraclusx-ds';
import { Save, X, Trash2, Download } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Cadastro/FormActions',
  component: FormActions,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Container para botões de ação do formulário. Alinhamento responsivo (stacked mobile, inline desktop).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'right', 'center', 'between'],
      description: 'Alinhamento dos botões',
    },
  },
} satisfies Meta<typeof FormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  args: {
    align: 'right',
    children: (
      <>
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary">Salvar</Button>
      </>
    ),
  },
};

export const Left: Story = {
  args: {
    align: 'left',
    children: (
      <>
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary">Salvar</Button>
      </>
    ),
  },
};

export const Center: Story = {
  args: {
    align: 'center',
    children: (
      <>
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary">Salvar</Button>
      </>
    ),
  },
};

export const Between: Story = {
  args: {
    align: 'between',
    children: (
      <>
        <Button variant="error" icon={<Trash2 size={18} />}>
          Excluir
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary">Salvar</Button>
        </div>
      </>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    align: 'right',
    children: (
      <>
        <Button variant="ghost" icon={<X size={18} />}>
          Cancelar
        </Button>
        <Button variant="primary" icon={<Save size={18} />}>
          Salvar Cadastro
        </Button>
      </>
    ),
  },
};

export const MultipleActions: Story = {
  args: {
    align: 'between',
    children: (
      <>
        <div className="flex gap-3">
          <Button variant="error" icon={<Trash2 size={18} />}>
            Excluir
          </Button>
          <Button variant="ghost" icon={<Download size={18} />}>
            Exportar
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost">Cancelar</Button>
          <Button variant="secondary">Salvar Rascunho</Button>
          <Button variant="primary">Salvar e Publicar</Button>
        </div>
      </>
    ),
  },
};

export const SingleAction: Story = {
  args: {
    align: 'right',
    children: <Button variant="primary">Confirmar</Button>,
  },
};

export const ThreeButtons: Story = {
  args: {
    align: 'right',
    children: (
      <>
        <Button variant="ghost">Voltar</Button>
        <Button variant="secondary">Salvar Rascunho</Button>
        <Button variant="primary">Publicar</Button>
      </>
    ),
  },
};

export const WithLoadingState: Story = {
  args: {
    align: 'right',
    children: (
      <>
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary" disabled>
          Salvando...
        </Button>
      </>
    ),
  },
};

