import type { Meta, StoryObj } from "@storybook/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Button } from "./button";

const meta: Meta<typeof Tooltip> = {
  title: "OraclusX/UI/Tooltip",
  component: Tooltip,
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Informação contextual</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
