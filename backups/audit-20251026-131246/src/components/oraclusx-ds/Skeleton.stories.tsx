/**
 * Storybook Stories - Skeleton Component
 * Demonstração visual do componente Skeleton
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "@/components/oraclusx-ds/Skeleton";

const meta = {
  title: "OraclusX DS/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "rectangular", "circular"],
      description: "Variante do skeleton",
    },
    width: {
      control: "text",
      description: "Largura do skeleton",
    },
    height: {
      control: "text",
      description: "Altura do skeleton",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    variant: "text",
    width: "200px",
  },
};

export const Rectangular: Story = {
  args: {
    variant: "rectangular",
    width: "300px",
    height: "150px",
  },
};

export const Circular: Story = {
  args: {
    variant: "circular",
    width: "80px",
    height: "80px",
  },
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="w-[350px] orx-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height="120px" />
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  ),
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="w-[400px] space-y-3 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 orx-card p-3">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const ProfileSkeleton: Story = {
  render: () => (
    <div className="w-[300px] orx-card p-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton variant="circular" width="120px" height="120px" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <div className="w-full space-y-2 mt-4">
          <Skeleton variant="rectangular" width="100%" height="40px" />
          <Skeleton variant="rectangular" width="100%" height="40px" />
        </div>
      </div>
    </div>
  ),
};
