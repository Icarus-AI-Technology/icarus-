/**
 * Storybook Stories - Progress Component
 * Demonstração visual do componente Progress
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "@/components/oraclusx-ds/Progress";

const meta = {
  title: "OraclusX DS/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100 },
      description: "Valor do progresso (0-100)",
    },
    label: {
      control: "text",
      description: "Label do progresso",
    },
    showPercentage: {
      control: "boolean",
      description: "Mostrar porcentagem",
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const WithLabel: Story = {
  args: {
    value: 65,
    label: "Carregando...",
  },
};

export const WithPercentage: Story = {
  args: {
    value: 75,
    label: "Download",
    showPercentage: true,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    label: "Aguardando",
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    label: "Concluído",
    showPercentage: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[400px]">
      <Progress value={0} label="0%" />
      <Progress value={25} label="25%" />
      <Progress value={50} label="50%" />
      <Progress value={75} label="75%" />
      <Progress value={100} label="100%" />
    </div>
  ),
};
