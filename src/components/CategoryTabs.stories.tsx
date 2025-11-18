/**
 * Storybook Stories - CategoryTabs Component
 * Demonstração visual do componente CategoryTabs (tabs com ícones)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CategoryTabs, type CategoryItem } from '@/components/oraclusx-ds/CategoryTabs';
import {  } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Navigation/CategoryTabs',
  component: CategoryTabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tabs com ícones e contadores para navegação entre categorias. Ideal para filtros e seções de conteúdo.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicCategories: CategoryItem[] = [
  { id: 'all', label: 'Todos', icon: Activity, count: 45 },
  { id: 'active', label: 'Ativos', icon: Users, count: 32 },
  { id: 'pending', label: 'Pendentes', icon: AlertTriangle, count: 8 },
  { id: 'completed', label: 'Concluídos', icon: Target, count: 5 },
];

export const Default: Story = {
  args: {
    categories: basicCategories,
    activeCategory: 'all',
    onCategoryChange: (id) => console.log('Selected:', id),
  },
};

export const WithoutCounts: Story = {
  args: {
    categories: [
      { id: 'overview', label: 'Overview', icon: Activity },
      { id: 'agents', label: 'Agentes', icon: Brain },
      { id: 'performance', label: 'Performance', icon: Target },
    ],
    activeCategory: 'overview',
    onCategoryChange: (id) => console.log('Selected:', id),
  },
};

export const ManyCategories: Story = {
  args: {
    categories: [
      { id: 'all', label: 'Todos', icon: Activity, count: 1280 },
      { id: 'nubank', label: 'Nubank', icon: ShoppingCart, count: 420 },
      { id: 'itau', label: 'Itaú', icon: Truck, count: 380 },
      { id: 'inter', label: 'Inter', icon: Users, count: 280 },
      { id: 'bradesco', label: 'Bradesco', icon: Target, count: 200 },
    ],
    activeCategory: 'nubank',
    onCategoryChange: (id) => console.log('Selected:', id),
  },
};

export const ActivePending: Story = {
  args: {
    categories: [
      { id: 'feed', label: 'Feed Operacional', icon: Activity, count: 128 },
      { id: 'alertas', label: 'Alertas', icon: AlertTriangle, count: 12 },
      { id: 'recomendacoes', label: 'Recomendações', icon: Brain, count: 8 },
    ],
    activeCategory: 'alertas',
    onCategoryChange: (id) => console.log('Selected:', id),
  },
};

export const LargeNumbers: Story = {
  args: {
    categories: [
      { id: 'all', label: 'Todos', icon: Activity, count: 125483 },
      { id: 'active', label: 'Ativos', icon: Users, count: 98242 },
      { id: 'pending', label: 'Pendentes', icon: AlertTriangle, count: 18956 },
      { id: 'archived', label: 'Arquivados', icon: Target, count: 8285 },
    ],
    activeCategory: 'all',
    onCategoryChange: (id) => console.log('Selected:', id),
  },
};

export const ThreeItems: Story = {
  args: {
    categories: [
      { id: 'clinical', label: 'Clínico', icon: Activity, count: 42 },
      { id: 'operational', label: 'Operacional', icon: Target, count: 38 },
      { id: 'financial', label: 'Financeiro', icon: Brain, count: 15 },
    ],
    activeCategory: 'operational',
    onCategoryChange: (id) => console.log('Selected:', id),
  },
};

