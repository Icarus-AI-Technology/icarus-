/**
 * Storybook Stories - Dialog Component
 * Demonstração visual do componente Dialog
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from '@/components/oraclusx-ds/Dialog';
import { Button } from '@/components/oraclusx-ds/Button';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título do dialog',
    },
    isOpen: {
      control: 'boolean',
      description: 'Estado de abertura',
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Abrir Dialog</Button>
        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Dialog Padrão">
          <p className="text-[var(--text-secondary)]">Este é o conteúdo do dialog padrão.</p>
        </Dialog>
      </>
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Confirmar Ação</Button>
        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirmar Exclusão">
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="default" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button variant="error" onClick={() => setIsOpen(false)}>
                Excluir
              </Button>
            </div>
          </div>
        </Dialog>
      </>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Novo Item</Button>
        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Adicionar Item">
          <div className="space-y-4">
            <div>
              <label className="block orx-text-sm orx-orx-font-medium mb-1">Nome</label>
              <input 
                className="w-full orx-input" 
                placeholder="Digite o nome"
              />
            </div>
            <div>
              <label className="block orx-text-sm orx-orx-font-medium mb-1">Descrição</label>
              <textarea 
                className="w-full orx-input min-h-[100px]" 
                placeholder="Digite a descrição"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="default" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Salvar
              </Button>
            </div>
          </div>
        </Dialog>
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Termos de Uso</Button>
        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Termos de Uso">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto text-[var(--text-secondary)]">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris...</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse...</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa...</p>
          </div>
        </Dialog>
      </>
    );
  },
};

