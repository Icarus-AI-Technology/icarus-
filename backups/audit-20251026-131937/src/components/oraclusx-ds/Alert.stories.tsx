/**
 * Storybook Stories - Alert Component
 * Demonstração visual do componente Alert
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "@/components/oraclusx-ds/Alert";

const meta = {
  title: "OraclusX DS/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["info", "success", "warning", "error"],
      description: "Tipo do alert",
    },
    title: {
      control: "text",
      description: "Título do alert",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    type: "info",
    title: "Informação",
    message: "Esta é uma mensagem informativa importante.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    title: "Sucesso",
    message: "Sua operação foi realizada com sucesso!",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    title: "Atenção",
    message: "Por favor, verifique os dados antes de continuar.",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    title: "Erro",
    message: "Ocorreu um erro ao processar sua solicitação.",
  },
};

export const WithoutTitle: Story = {
  args: {
    type: "info",
    message: "Alert sem título, apenas com mensagem.",
  },
};

export const AllVariants: Story = {
  args: {
    type: "info",
    title: "",
    message: "",
  },
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[500px]">
      <Alert
        type="info"
        title="Informação"
        message="Esta é uma mensagem informativa."
      />
      <Alert
        type="success"
        title="Sucesso"
        message="Operação realizada com sucesso!"
      />
      <Alert
        type="warning"
        title="Atenção"
        message="Verifique os dados informados."
      />
      <Alert type="error" title="Erro" message="Ocorreu um erro na operação." />
    </div>
  ),
};
