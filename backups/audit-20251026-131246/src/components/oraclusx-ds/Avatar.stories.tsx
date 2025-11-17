/**
 * Storybook Stories - Avatar Component
 * Demonstração visual do componente Avatar
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "@/components/oraclusx-ds/Avatar";

const meta = {
  title: "OraclusX DS/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "URL da imagem",
    },
    alt: {
      control: "text",
      description: "Texto alternativo",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Tamanho do avatar",
    },
    fallback: {
      control: "text",
      description: "Texto de fallback (iniciais)",
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=1",
    alt: "Avatar do usuário",
  },
};

export const WithFallback: Story = {
  args: {
    fallback: "JD",
    alt: "John Doe",
  },
};

export const Small: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=2",
    alt: "Avatar pequeno",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=3",
    alt: "Avatar médio",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=4",
    alt: "Avatar grande",
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=5",
    alt: "Avatar extra grande",
    size: "xl",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <Avatar src="https://i.pravatar.cc/150?img=1" alt="SM" size="sm" />
      <Avatar src="https://i.pravatar.cc/150?img=2" alt="MD" size="md" />
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="LG" size="lg" />
      <Avatar src="https://i.pravatar.cc/150?img=4" alt="XL" size="xl" />
    </div>
  ),
};

export const WithFallbacks: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <Avatar fallback="AB" alt="Alice Brown" size="lg" />
      <Avatar fallback="CD" alt="Charlie Davis" size="lg" />
      <Avatar fallback="EF" alt="Emma Foster" size="lg" />
      <Avatar fallback="GH" alt="George Harris" size="lg" />
    </div>
  ),
};
