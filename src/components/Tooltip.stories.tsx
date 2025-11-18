/**
 * Storybook Stories - Tooltip Component
 * Demonstração visual do componente Tooltip
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '@/components/oraclusx-ds/Tooltip';
import { Button } from '@/components/oraclusx-ds/Button';
import { Info, HelpCircle } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Conteúdo do tooltip',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Posição do tooltip',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    content: 'Tooltip no topo',
    position: 'top',
    children: <Button>Hover me (Top)</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip embaixo',
    position: 'bottom',
    children: <Button>Hover me (Bottom)</Button>,
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip à esquerda',
    position: 'left',
    children: <Button>Hover me (Left)</Button>,
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip à direita',
    position: 'right',
    children: <Button>Hover me (Right)</Button>,
  },
};

export const WithIcon: Story = {
  args: {
    content: 'Informação adicional sobre este item',
    position: 'top',
    children: <Info className="w-5 h-5 text-[var(--orx-primary)] cursor-help" />,
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-10 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <div className="flex justify-center gap-4">
        <Tooltip content="Tooltip no topo" position="top">
          <Button size="sm">Top</Button>
        </Tooltip>
      </div>
      <div className="flex justify-center gap-20">
        <Tooltip content="Tooltip à esquerda" position="left">
          <Button size="sm">Left</Button>
        </Tooltip>
        <Tooltip content="Tooltip à direita" position="right">
          <Button size="sm">Right</Button>
        </Tooltip>
      </div>
      <div className="flex justify-center gap-4">
        <Tooltip content="Tooltip embaixo" position="bottom">
          <Button size="sm">Bottom</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-6 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <Tooltip content="Informação importante" position="top">
        <Info className="w-6 h-6 text-blue-500 cursor-help" />
      </Tooltip>
      <Tooltip content="Precisa de ajuda?" position="top">
        <HelpCircle className="w-6 h-6 text-[var(--orx-primary)] cursor-help" />
      </Tooltip>
    </div>
  ),
};

