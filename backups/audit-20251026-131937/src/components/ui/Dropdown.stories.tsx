import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";

const meta: Meta = {
  title: "OraclusX/UI/Dropdown",
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Ação 1</DropdownMenuItem>
        <DropdownMenuItem>Ação 2</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
