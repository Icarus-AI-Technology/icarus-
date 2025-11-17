/**
 * Storybook Stories - Button Component
 * Demonstração visual do componente Button
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/oraclusx-ds/Button";
import { Search, Plus, Trash2, Download } from "lucide-react";

const meta = {
  title: "OraclusX DS/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "success", "warning", "error"],
      description: "Variante visual do botão",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tamanho do botão",
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Botão Primário",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Botão Secundário",
    variant: "default",
  },
};

export const Danger: Story = {
  args: {
    children: "Excluir",
    variant: "error",
  },
};

export const Ghost: Story = {
  args: {
    children: "Cancelar",
    variant: "default",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Search className="w-4 h-4 mr-2" />
        Buscar
      </>
    ),
    variant: "primary",
  },
};

export const IconOnly: Story = {
  args: {
    children: <Plus className="w-5 h-5" />,
    variant: "primary",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    children: "Pequeno",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    children: "Médio",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    children: "Grande",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    children: "Desabilitado",
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <div className="flex gap-3">
        <Button variant="primary">Primário</Button>
        <Button variant="default">Padrão</Button>
        <Button variant="error">Erro</Button>
        <Button variant="success">Sucesso</Button>
      </div>
      <div className="flex gap-3">
        <Button variant="primary" size="sm">
          Pequeno
        </Button>
        <Button variant="primary" size="md">
          Médio
        </Button>
        <Button variant="primary" size="lg">
          Grande
        </Button>
      </div>
      <div className="flex gap-3">
        <Button variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="error">
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
  ),
};
