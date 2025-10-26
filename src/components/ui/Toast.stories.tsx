import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button';
import { Toaster, toast } from 'sonner';

const meta: Meta = {
  title: 'OraclusX/UI/Toast'
};
export default meta;

function ToastDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="space-y-4">
      <Button onClick={() => { setCount((c) => c + 1); toast.success(`Operação #${count + 1} concluída`); }}>
        Disparar Toast
      </Button>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export const Default: StoryObj = {
  render: () => <ToastDemo />
};


