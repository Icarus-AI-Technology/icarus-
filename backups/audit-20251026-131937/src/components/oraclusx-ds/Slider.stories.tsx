/**
 * Storybook Stories - Slider Component
 * Demonstração visual do componente Slider
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "@/components/oraclusx-ds/Slider";
import { useState } from "react";

const meta = {
  title: "OraclusX DS/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label do slider",
    },
    min: {
      control: "number",
      description: "Valor mínimo",
    },
    max: {
      control: "number",
      description: "Valor máximo",
    },
    step: {
      control: "number",
      description: "Incremento do valor",
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado",
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Volume",
    min: 0,
    max: 100,
    value: 50,
  },
};

export const MinMax: Story = {
  args: {
    label: "Temperatura (°C)",
    min: 16,
    max: 30,
    value: 22,
  },
};

export const WithStep: Story = {
  args: {
    label: "Quantidade",
    min: 0,
    max: 10,
    step: 2,
    value: 6,
  },
};

export const Disabled: Story = {
  args: {
    label: "Slider Desabilitado",
    min: 0,
    max: 100,
    value: 30,
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [volume, setVolume] = useState(50);
    return (
      <div className="w-[400px] p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <Slider
          label={`Volume: ${volume}%`}
          min={0}
          max={100}
          value={volume}
          onChange={setVolume}
        />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[400px]">
      <Slider label="Volume: 50%" min={0} max={100} value={50} />
      <Slider label="Brilho: 75%" min={0} max={100} value={75} />
      <Slider label="Temperatura: 22°C" min={16} max={30} value={22} />
      <Slider label="Desabilitado: 30%" min={0} max={100} value={30} disabled />
    </div>
  ),
};
