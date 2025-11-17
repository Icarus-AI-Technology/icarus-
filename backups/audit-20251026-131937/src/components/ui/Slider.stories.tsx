import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "OraclusX/UI/Slider",
  component: Slider,
  args: { defaultValue: [50], max: 100, step: 1 },
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {};
