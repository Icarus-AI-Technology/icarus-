/**
 * Storybook Stories - Select Component
 * Demonstração visual do componente Select
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "@/components/oraclusx-ds/Select";

const meta = {
  title: "OraclusX DS/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label do select",
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
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { value: "1", label: "Opção 1" },
  { value: "2", label: "Opção 2" },
  { value: "3", label: "Opção 3" },
];

const categoryOptions = [
  { value: "electronics", label: "Eletrônicos" },
  { value: "clothing", label: "Roupas" },
  { value: "food", label: "Alimentos" },
  { value: "books", label: "Livros" },
];

export const Default: Story = {
  args: {
    label: "Selecione uma opção",
    placeholder: "Escolha...",
    options: sampleOptions,
  },
};

export const WithValue: Story = {
  args: {
    label: "Categoria",
    options: categoryOptions,
    value: "electronics",
  },
};

export const WithError: Story = {
  args: {
    label: "Departamento",
    placeholder: "Selecione um departamento",
    options: sampleOptions,
    error: "Campo obrigatório",
  },
};

export const Disabled: Story = {
  args: {
    label: "Select Desabilitado",
    placeholder: "Não editável",
    options: sampleOptions,
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[400px]">
      <Select
        label="Categoria"
        placeholder="Escolha uma categoria"
        options={categoryOptions}
      />
      <Select label="Com valor" options={categoryOptions} value="food" />
      <Select
        label="Com erro"
        error="Selecione uma opção"
        options={sampleOptions}
      />
      <Select label="Desabilitado" disabled options={sampleOptions} />
    </div>
  ),
};
