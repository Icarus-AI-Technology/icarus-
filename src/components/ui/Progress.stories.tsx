import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'OraclusX/UI/Progress',
  component: Progress,
  args: { value: 66 }
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {};


