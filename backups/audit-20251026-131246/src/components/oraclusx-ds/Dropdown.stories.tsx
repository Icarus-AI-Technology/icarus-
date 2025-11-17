/**
 * Storybook Stories - Dropdown Component
 * Demonstração visual do componente Dropdown
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "@/components/oraclusx-ds/Dropdown";
import { Button } from "@/components/oraclusx-ds/Button";
import { Settings, User, LogOut, Bell } from "lucide-react";

const meta = {
  title: "OraclusX DS/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems = [
  { label: "Perfil", value: "profile", icon: <User className="w-4 h-4" /> },
  {
    label: "Configurações",
    value: "settings",
    icon: <Settings className="w-4 h-4" />,
  },
  {
    label: "Notificações",
    value: "notifications",
    icon: <Bell className="w-4 h-4" />,
  },
  { label: "Sair", value: "logout", icon: <LogOut className="w-4 h-4" /> },
];

export const Default: Story = {
  args: {
    trigger: <Button>Menu</Button>,
    items: basicItems,
  },
};

export const WithDivider: Story = {
  args: {
    trigger: <Button variant="primary">Opções</Button>,
    items: [
      { label: "Editar", value: "edit" },
      { label: "Duplicar", value: "duplicate" },
      { type: "divider" },
      { label: "Excluir", value: "delete", variant: "danger" },
    ],
  },
};

export const UserMenu: Story = {
  args: {
    trigger: (
      <button className="flex items-center gap-2 orx-button px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-[var(--orx-primary)] text-white flex items-center justify-center text-sm font-semibold">
          JD
        </div>
        <span>John Doe</span>
      </button>
    ),
    items: [
      {
        label: "Meu Perfil",
        value: "profile",
        icon: <User className="w-4 h-4" />,
      },
      {
        label: "Configurações",
        value: "settings",
        icon: <Settings className="w-4 h-4" />,
      },
      { type: "divider" },
      { label: "Sair", value: "logout", icon: <LogOut className="w-4 h-4" /> },
    ],
  },
};

export const IconButton: Story = {
  args: {
    trigger: (
      <button className="w-10 h-10 rounded-full orx-button flex items-center justify-center">
        <Settings className="w-5 h-5" />
      </button>
    ),
    items: basicItems,
  },
};
