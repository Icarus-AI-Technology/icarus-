import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'OraclusX/UI/Separator',
  component: Separator
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <div>
      <div>Seção 1</div>
      <Separator className="my-4" />
      <div>Seção 2</div>
    </div>
  )
};


