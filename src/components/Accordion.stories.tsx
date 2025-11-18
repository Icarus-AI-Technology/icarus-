/**
 * Storybook Stories - Accordion Component
 * Demonstração visual do componente Accordion
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from '@/components/oraclusx-ds/Accordion';

const meta = {
  title: 'OraclusX DS/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  {
    id: '1',
    title: 'O que é o OraclusX?',
    content: 'OraclusX é um design system moderno com componentes neumórficos.',
  },
  {
    id: '2',
    title: 'Como usar os componentes?',
    content: 'Importe os componentes do pacote @/components/oraclusx-ds e utilize-os em seus projetos.',
  },
  {
    id: '3',
    title: 'É responsivo?',
    content: 'Sim! Todos os componentes são mobile-first e responsivos.',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const SingleItem: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Informação única',
        content: 'Este accordion contém apenas um item.',
      },
    ],
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      { id: '1', title: 'Seção 1', content: 'Conteúdo da seção 1' },
      { id: '2', title: 'Seção 2', content: 'Conteúdo da seção 2' },
      { id: '3', title: 'Seção 3', content: 'Conteúdo da seção 3' },
      { id: '4', title: 'Seção 4', content: 'Conteúdo da seção 4' },
      { id: '5', title: 'Seção 5', content: 'Conteúdo da seção 5' },
    ],
  },
};

export const FAQ: Story = {
  args: {
    items: [
      {
        id: 'q1',
        title: 'Como posso resetar minha senha?',
        content: 'Você pode resetar sua senha clicando em "Esqueci minha senha" na tela de login e seguindo as instruções enviadas por email.',
      },
      {
        id: 'q2',
        title: 'Quais formas de pagamento são aceitas?',
        content: 'Aceitamos cartões de crédito, débito, PIX e boleto bancário.',
      },
      {
        id: 'q3',
        title: 'Qual o prazo de entrega?',
        content: 'O prazo de entrega varia de acordo com sua região, mas geralmente é de 5 a 10 dias úteis.',
      },
      {
        id: 'q4',
        title: 'Posso cancelar meu pedido?',
        content: 'Sim, você pode cancelar seu pedido em até 24 horas após a compra através da área de pedidos.',
      },
    ],
  },
};

