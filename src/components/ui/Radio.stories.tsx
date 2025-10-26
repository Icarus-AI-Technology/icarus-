import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'OraclusX/UI/Radio',
  component: RadioGroup
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="flex gap-4">
      <div className="flex items-center gap-2"><RadioGroupItem value="a" id="ra" /> <label htmlFor="ra">A</label></div>
      <div className="flex items-center gap-2"><RadioGroupItem value="b" id="rb" /> <label htmlFor="rb">B</label></div>
    </RadioGroup>
  )
};


