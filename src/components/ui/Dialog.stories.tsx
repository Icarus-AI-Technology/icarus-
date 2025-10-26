import type { Meta, StoryObj } from '@storybook/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './dialog';
import { Button } from './button';

const meta: Meta<typeof Dialog> = {
  title: 'OraclusX/UI/Dialog',
  component: Dialog
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título</DialogTitle>
          <DialogDescription>Descrição do diálogo</DialogDescription>
        </DialogHeader>
        Conteúdo do diálogo
      </DialogContent>
    </Dialog>
  ),
  
};


