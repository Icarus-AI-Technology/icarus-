import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'OraclusX/UI/Textarea',
  component: Textarea,
  args: { placeholder: 'Digite uma observação...' }
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};


