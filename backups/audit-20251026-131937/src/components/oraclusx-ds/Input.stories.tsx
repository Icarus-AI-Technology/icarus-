/**
 * Storybook Stories - Input Component
 * Demonstração visual do componente Input
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/oraclusx-ds/Input";
import { Search, Mail, Lock, User } from "lucide-react";

const meta = {
  title: "OraclusX DS/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label do campo",
    },
    placeholder: {
      control: "text",
      description: "Texto placeholder",
    },
    error: {
      control: "text",
      description: "Mensagem de erro",
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado",
    },
    iconPosition: {
      control: "select",
      options: ["left", "right"],
      description: "Posição do ícone",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Nome",
    placeholder: "Digite seu nome",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Email",
    placeholder: "seu@email.com",
    Icon: Mail,
    iconPosition: "left",
  },
};

export const Search: Story = {
  args: {
    placeholder: "Buscar...",
    Icon: Search,
    iconPosition: "left",
  },
};

export const Password: Story = {
  args: {
    label: "Senha",
    type: "password",
    placeholder: "••••••••",
    Icon: Lock,
    iconPosition: "left",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    placeholder: "seu@email.com",
    error: "Email inválido",
    Icon: Mail,
    iconPosition: "left",
  },
};

export const Disabled: Story = {
  args: {
    label: "Campo Desabilitado",
    placeholder: "Não editável",
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[400px]">
      <Input
        label="Nome Completo"
        placeholder="Digite seu nome"
        Icon={User}
        iconPosition="left"
      />
      <Input
        label="Email"
        placeholder="seu@email.com"
        Icon={Mail}
        iconPosition="left"
      />
      <Input
        label="Senha"
        type="password"
        placeholder="••••••••"
        Icon={Lock}
        iconPosition="left"
      />
      <Input
        label="Buscar"
        placeholder="Buscar..."
        Icon={Search}
        iconPosition="left"
      />
      <Input
        label="Com Erro"
        error="Campo obrigatório"
        placeholder="Digite algo"
      />
      <Input label="Desabilitado" disabled placeholder="Campo desabilitado" />
    </div>
  ),
};
