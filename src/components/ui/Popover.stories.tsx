import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';

const meta: Meta<typeof Popover> = {
  title: 'OraclusX/UI/Popover',
  component: Popover
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open</Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">Conteúdo popover</PopoverContent>
    </Popover>
  ),
  
};


