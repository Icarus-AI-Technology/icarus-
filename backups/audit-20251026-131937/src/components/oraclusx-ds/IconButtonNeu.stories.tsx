/**
 * Storybook Stories - IconButtonNeu Component
 * Demonstração visual do componente IconButtonNeu
 */

import type { Meta, StoryObj } from "@storybook/react";
import { IconButtonNeu } from "@/components/oraclusx-ds/IconButtonNeu";
import { Settings, Bell, Search, Plus, Heart, Share2 } from "lucide-react";

const meta = {
  title: "OraclusX DS/IconButtonNeu",
  component: IconButtonNeu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary"],
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
} satisfies Meta<typeof IconButtonNeu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <Settings className="w-5 h-5" />,
    "aria-label": "Configurações",
  },
};

export const Primary: Story = {
  args: {
    icon: <Plus className="w-5 h-5" />,
    variant: "primary",
    "aria-label": "Adicionar",
  },
};

export const Small: Story = {
  args: {
    icon: <Bell className="w-4 h-4" />,
    size: "sm",
    "aria-label": "Notificações",
  },
};

export const Large: Story = {
  args: {
    icon: <Search className="w-6 h-6" />,
    size: "lg",
    "aria-label": "Buscar",
  },
};

export const Disabled: Story = {
  args: {
    icon: <Settings className="w-5 h-5" />,
    disabled: true,
    "aria-label": "Configurações (desabilitado)",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">Tamanhos</p>
        <div className="flex items-end gap-3">
          <IconButtonNeu
            icon={<Heart className="w-4 h-4" />}
            size="sm"
            aria-label="Pequeno"
          />
          <IconButtonNeu
            icon={<Heart className="w-5 h-5" />}
            size="md"
            aria-label="Médio"
          />
          <IconButtonNeu
            icon={<Heart className="w-6 h-6" />}
            size="lg"
            aria-label="Grande"
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">Variantes</p>
        <div className="flex gap-3">
          <IconButtonNeu
            icon={<Settings className="w-5 h-5" />}
            variant="default"
            aria-label="Default"
          />
          <IconButtonNeu
            icon={<Plus className="w-5 h-5" />}
            variant="primary"
            aria-label="Primary"
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Ícones Diversos
        </p>
        <div className="flex gap-3">
          <IconButtonNeu
            icon={<Search className="w-5 h-5" />}
            aria-label="Buscar"
          />
          <IconButtonNeu
            icon={<Bell className="w-5 h-5" />}
            aria-label="Notificações"
          />
          <IconButtonNeu
            icon={<Share2 className="w-5 h-5" />}
            aria-label="Compartilhar"
          />
          <IconButtonNeu
            icon={<Heart className="w-5 h-5" />}
            aria-label="Favoritar"
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Desabilitado
        </p>
        <div className="flex gap-3">
          <IconButtonNeu
            icon={<Settings className="w-5 h-5" />}
            disabled
            aria-label="Desabilitado"
          />
        </div>
      </div>
    </div>
  ),
};
