import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Input } from "./input";

const meta: Meta<typeof Label> = {
  title: "OraclusX/UI/Label",
  component: Label,
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="nome">Nome</Label>
      <Input id="nome" placeholder="Digite" />
    </div>
  ),
};
