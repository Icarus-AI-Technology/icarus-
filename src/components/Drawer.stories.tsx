/**
 * Storybook Stories - Drawer Component
 * Demonstração visual do componente Drawer
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from '@/components/oraclusx-ds/Drawer';
import { Button } from '@/components/oraclusx-ds/Button';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Posição do drawer',
    },
    isOpen: {
      control: 'boolean',
      description: 'Estado de abertura',
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Abrir Drawer (Direita)</Button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} position="right" title="Menu">
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Este é o conteúdo do drawer lateral direito.
            </p>
            <nav className="space-y-2">
              <a href="#" className="block p-2 rounded orx-button">Perfil</a>
              <a href="#" className="block p-2 rounded orx-button">Configurações</a>
              <a href="#" className="block p-2 rounded orx-button">Ajuda</a>
              <a href="#" className="block p-2 rounded orx-button text-[var(--orx-error)]">Sair</a>
            </nav>
          </div>
        </Drawer>
      </>
    );
  },
};

export const Left: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Abrir Drawer (Esquerda)</Button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} position="left" title="Navegação">
          <div className="space-y-4">
            <nav className="space-y-2">
              <a href="#" className="block p-2 rounded orx-button">Dashboard</a>
              <a href="#" className="block p-2 rounded orx-button">Produtos</a>
              <a href="#" className="block p-2 rounded orx-button">Clientes</a>
              <a href="#" className="block p-2 rounded orx-button">Relatórios</a>
              <a href="#" className="block p-2 rounded orx-button">Configurações</a>
            </nav>
          </div>
        </Drawer>
      </>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Filtros</Button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} position="right" title="Filtros">
          <div className="space-y-4">
            <div>
              <label className="block orx-text-sm orx-orx-font-medium mb-1">Categoria</label>
              <select className="w-full orx-input">
                <option>Todas</option>
                <option>Eletrônicos</option>
                <option>Roupas</option>
              </select>
            </div>
            <div>
              <label className="block orx-text-sm orx-orx-font-medium mb-1">Faixa de Preço</label>
              <div className="flex gap-2">
                <input className="flex-1 orx-input" placeholder="Min" />
                <input className="flex-1 orx-input" placeholder="Max" />
              </div>
            </div>
            <div>
              <label className="block orx-text-sm orx-orx-font-medium mb-1">Status</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="orx-checkbox" />
                  <span className="orx-text-sm">Ativo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="orx-checkbox" />
                  <span className="orx-text-sm">Inativo</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="default" className="flex-1" onClick={() => setIsOpen(false)}>
                Limpar
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setIsOpen(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Conteúdo Longo</Button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} position="right" title="Informações">
          <div className="space-y-4 text-[var(--text-secondary)]">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris...</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse...</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa...</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris...</p>
          </div>
        </Drawer>
      </>
    );
  },
};

