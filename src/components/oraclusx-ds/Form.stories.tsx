/**
 * Storybook Stories - Form Component
 * Demonstração visual do componente Form
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@/components/oraclusx-ds/Form';
import { Input } from '@/components/oraclusx-ds/Input';
import { Button } from '@/components/oraclusx-ds/Button';
import { Textarea } from '@/components/oraclusx-ds/Textarea';
import { Select } from '@/components/oraclusx-ds/Select';
import { Checkbox } from '@/components/oraclusx-ds/Checkbox';

const meta = {
  title: 'OraclusX DS/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Formulário de Contato',
    onSubmit: (e) => {
      e.preventDefault();
      console.log('Form submitted');
    },
    children: (
      <div className="space-y-4">
        <Input label="Nome" placeholder="Digite seu nome" />
        <Input label="Email" type="email" placeholder="seu@email.com" />
        <Textarea label="Mensagem" placeholder="Digite sua mensagem..." />
        <div className="flex gap-3 justify-end">
          <Button variant="default">Cancelar</Button>
          <Button variant="primary" type="submit">Enviar</Button>
        </div>
      </div>
    ),
  },
};

export const Registration: Story = {
  args: {
    title: 'Criar Conta',
    onSubmit: (e) => {
      e.preventDefault();
      console.log('Registration submitted');
    },
    children: (
      <div className="space-y-4">
        <Input label="Nome Completo" placeholder="Digite seu nome completo" />
        <Input label="Email" type="email" placeholder="seu@email.com" />
        <Input label="Senha" type="password" placeholder="••••••••" />
        <Input label="Confirmar Senha" type="password" placeholder="••••••••" />
        <Checkbox label="Aceito os termos de uso e política de privacidade" />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="default">Cancelar</Button>
          <Button variant="primary" type="submit">Criar Conta</Button>
        </div>
      </div>
    ),
  },
};

export const WithSelects: Story = {
  args: {
    title: 'Informações do Produto',
    onSubmit: (e) => {
      e.preventDefault();
      console.log('Product info submitted');
    },
    children: (
      <div className="space-y-4">
        <Input label="Nome do Produto" placeholder="Digite o nome" />
        <Select 
          label="Categoria" 
          placeholder="Selecione uma categoria"
          options={[
            { value: 'electronics', label: 'Eletrônicos' },
            { value: 'clothing', label: 'Roupas' },
            { value: 'food', label: 'Alimentos' },
          ]}
        />
        <Select 
          label="Status" 
          placeholder="Selecione o status"
          options={[
            { value: 'active', label: 'Ativo' },
            { value: 'inactive', label: 'Inativo' },
            { value: 'pending', label: 'Pendente' },
          ]}
        />
        <Textarea label="Descrição" placeholder="Descrição do produto..." />
        <div className="flex gap-3 justify-end">
          <Button variant="default">Cancelar</Button>
          <Button variant="primary" type="submit">Salvar</Button>
        </div>
      </div>
    ),
  },
};

export const Simple: Story = {
  args: {
    onSubmit: (e) => {
      e.preventDefault();
      console.log('Simple form submitted');
    },
    children: (
      <div className="space-y-4">
        <Input label="Email" type="email" placeholder="seu@email.com" />
        <Button variant="primary" type="submit" className="w-full">
          Enviar
        </Button>
      </div>
    ),
  },
};

