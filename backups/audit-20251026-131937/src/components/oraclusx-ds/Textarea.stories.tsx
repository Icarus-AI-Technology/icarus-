/**
 * Storybook Stories - Textarea Component
 * Demonstração visual do componente Textarea
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@/components/oraclusx-ds/Textarea";
import { useState } from "react";

const meta = {
  title: "OraclusX DS/Textarea",
  component: Textarea,
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
    maxLength: {
      control: "number",
      description: "Limite de caracteres",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Descrição",
    placeholder: "Digite uma descrição...",
  },
};

export const WithMaxLength: Story = {
  args: {
    label: "Comentário",
    placeholder: "Máximo de 200 caracteres",
    maxLength: 200,
  },
};

export const WithError: Story = {
  args: {
    label: "Mensagem",
    placeholder: "Digite sua mensagem",
    error: "Campo obrigatório",
  },
};

export const Disabled: Story = {
  args: {
    label: "Campo Desabilitado",
    placeholder: "Não editável",
    disabled: true,
    value: "Este campo está desabilitado",
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[500px]">
        <Textarea
          label="Observações"
          placeholder="Digite suas observações..."
          maxLength={300}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[500px]">
      <Textarea label="Descrição" placeholder="Digite uma descrição..." />
      <Textarea
        label="Com limite"
        placeholder="Máximo de 100 caracteres"
        maxLength={100}
      />
      <Textarea
        label="Com erro"
        error="Este campo é obrigatório"
        placeholder="Digite algo"
      />
      <Textarea label="Desabilitado" disabled value="Campo desabilitado" />
    </div>
  ),
};
