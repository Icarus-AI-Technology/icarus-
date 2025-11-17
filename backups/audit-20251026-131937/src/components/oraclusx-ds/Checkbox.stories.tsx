/**
 * Storybook Stories - Checkbox Component
 * Demonstração visual do componente Checkbox
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/oraclusx-ds/Checkbox";
import { useState } from "react";

const meta = {
  title: "OraclusX DS/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label do checkbox",
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
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Aceito os termos",
  },
};

export const Checked: Story = {
  args: {
    label: "Checkbox marcado",
    checked: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Campo obrigatório",
    error: "Você deve aceitar os termos",
  },
};

export const Disabled: Story = {
  args: {
    label: "Checkbox desabilitado",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Desabilitado e marcado",
    disabled: true,
    checked: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <Checkbox
          label="Checkbox interativo"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Estado: {checked ? "Marcado" : "Desmarcado"}
        </p>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <Checkbox label="Opção 1" />
      <Checkbox label="Opção 2" checked />
      <Checkbox label="Opção 3 com erro" error="Campo obrigatório" />
      <Checkbox label="Opção desabilitada" disabled />
      <Checkbox label="Desabilitado e marcado" disabled checked />
    </div>
  ),
};
