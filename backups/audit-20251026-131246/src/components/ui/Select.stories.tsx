import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta: Meta<typeof Select> = {
  title: "OraclusX/UI/Select",
  component: Select,
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Escolha" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Opção 1</SelectItem>
        <SelectItem value="2">Opção 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};
