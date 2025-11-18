/**
 * Storybook Stories - Modal Component
 * Demonstração visual do componente Modal
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from '@/components/oraclusx-ds/Modal';
import { Button } from '@/components/oraclusx-ds/Button';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título do modal',
    },
    isOpen: {
      control: 'boolean',
      description: 'Estado de abertura',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Padrão">
          <p className="text-[var(--text-secondary)]">Este é o conteúdo do modal padrão.</p>
        </Modal>
      </>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Criar Novo</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Criar Novo Item">
          <div className="space-y-4">
            <div>
              <label className="block orx-text-sm orx-orx-font-medium mb-1">Nome</label>
              <input className="w-full orx-input" placeholder="Digite o nome" />
            </div>
            <div>
              <label className="block orx-text-sm orx-orx-font-medium mb-1">Categoria</label>
              <select className="w-full orx-input">
                <option>Selecione...</option>
                <option>Categoria 1</option>
                <option>Categoria 2</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="default" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Salvar
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const ConfirmDelete: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button variant="error" onClick={() => setIsOpen(true)}>Excluir Item</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirmar Exclusão">
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
        </Modal>
      </>
    );
  },
};

