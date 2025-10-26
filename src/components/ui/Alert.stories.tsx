import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription } from './alert';
import { AlertCircle } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'OraclusX/UI/Alert',
  component: Alert
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Erro ao salvar registro</AlertDescription>
    </Alert>
  )
};


