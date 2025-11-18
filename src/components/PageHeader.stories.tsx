/**
 * Storybook Stories - PageHeader Component
 * Demonstração visual do componente PageHeader (cabeçalho de página)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from '@/components/oraclusx-ds/PageHeader';
import { Button } from '@/components/oraclusx-ds/Button';
import { Plus, Download, RefreshCw } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Layout/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Cabeçalho padronizado para páginas. Suporta título, descrição, ícone, badge, ações e breadcrumbs.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título da página',
    },
    description: {
      control: 'text',
      description: 'Descrição opcional',
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    title: 'Cadastro de Pacientes',
    description: 'Gerencie informações detalhadas dos pacientes.',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Gerenciamento de Usuários',
    description: 'Administre usuários e permissões do sistema.',
    icon: Users,
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Dashboard AI',
    description: 'Métricas em tempo real do sistema de IA.',
    icon: Settings,
    badge: {
      label: 'Beta',
      variant: 'warning',
    },
  },
};

export const WithActions: Story = {
  args: {
    title: 'Lista de Produtos',
    description: 'Catálogo completo de produtos OPME.',
    icon: Users,
    actions: (
      <div className="flex gap-3">
        <Button variant="ghost" icon={<RefreshCw size={18} />}>
          Atualizar
        </Button>
        <Button variant="ghost" icon={<Download size={18} />}>
          Exportar
        </Button>
        <Button variant="primary" icon={<Plus size={18} />}>
          Novo Produto
        </Button>
      </div>
    ),
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'Editar Paciente',
    description: 'Atualize as informações do paciente João Silva.',
    icon: Users,
    breadcrumbs: [
      { label: 'Cadastros', href: '/cadastros' },
      { label: 'Pacientes', href: '/cadastros/pacientes' },
      { label: 'João Silva' },
    ],
  },
};

export const Complete: Story = {
  args: {
    title: 'Dashboard Financeiro',
    description: 'Visão consolidada de todas as contas bancárias.',
    icon: Users,
    badge: {
      label: 'Pluggy Integration',
      variant: 'success',
    },
    actions: (
      <div className="flex gap-3">
        <Button variant="ghost" icon={<RefreshCw size={18} />}>
          Atualizar
        </Button>
        <Button variant="ghost" icon={<Download size={18} />}>
          Exportar
        </Button>
        <Button variant="primary" icon={<Plus size={18} />}>
          Conectar Banco
        </Button>
      </div>
    ),
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Financeiro', href: '/financeiro' },
      { label: 'Dashboard' },
    ],
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Relatório Consolidado de Cirurgias e Procedimentos com Materiais OPME do Trimestre',
    description: 'Este é um exemplo de título longo que pode ser necessário em alguns casos específicos do sistema.',
    icon: Users,
  },
};

export const MinimalWithoutDescription: Story = {
  args: {
    title: 'Configurações',
    icon: Settings,
  },
};

