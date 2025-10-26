import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'OraclusX/UI/Button',
  component: Button,
  args: { children: 'Button' }
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'default' }
};

export const Outline: Story = {
  args: { variant: 'outline' }
};

export const Disabled: Story = {
  args: { disabled: true }
};


