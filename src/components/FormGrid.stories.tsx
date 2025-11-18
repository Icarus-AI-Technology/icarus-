/**
 * Storybook Stories - FormGrid Component
 * Demonstração visual do componente FormGrid
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FormGrid } from '@/components/oraclusx-ds/CadastroLayout';
import { TextInput } from '@/components/oraclusx-ds';

const meta = {
  title: 'OraclusX DS/Cadastro/FormGrid',
  component: FormGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Grid responsivo para campos de formulário. Adapta de 1 a 4 colunas conforme breakpoints.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4],
      description: 'Número de colunas no grid',
    },
  },
} satisfies Meta<typeof FormGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneColumn: Story = {
  args: {
    columns: 1,
    children: (
      <>
        <TextInput label="Nome Completo" placeholder="Digite o nome" />
        <TextInput label="Email" type="email" placeholder="email@example.com" />
        <TextInput label="Telefone" placeholder="(00) 00000-0000" />
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <TextInput label="Nome" placeholder="João Silva" />
        <TextInput label="Email" type="email" placeholder="email@example.com" />
        <TextInput label="Telefone" placeholder="(00) 00000-0000" />
        <TextInput label="CPF" placeholder="000.000.000-00" />
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <TextInput label="Nome" placeholder="João Silva" />
        <TextInput label="CPF" placeholder="000.000.000-00" />
        <TextInput label="Data Nascimento" type="date" />
        <TextInput label="Telefone" placeholder="(00) 00000-0000" />
        <TextInput label="Email" type="email" placeholder="email@example.com" />
        <TextInput label="RG" placeholder="00.000.000-0" />
      </>
    ),
  },
};

export const FourColumns: Story = {
  args: {
    columns: 4,
    children: (
      <>
        <TextInput label="Campo 1" placeholder="Valor 1" />
        <TextInput label="Campo 2" placeholder="Valor 2" />
        <TextInput label="Campo 3" placeholder="Valor 3" />
        <TextInput label="Campo 4" placeholder="Valor 4" />
        <TextInput label="Campo 5" placeholder="Valor 5" />
        <TextInput label="Campo 6" placeholder="Valor 6" />
        <TextInput label="Campo 7" placeholder="Valor 7" />
        <TextInput label="Campo 8" placeholder="Valor 8" />
      </>
    ),
  },
};

export const MixedFields: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <TextInput label="Nome Completo" placeholder="Digite o nome completo" />
        <TextInput label="Email" type="email" placeholder="email@example.com" />
        <TextInput label="CEP" placeholder="00000-000" />
        <TextInput label="Cidade" placeholder="São Paulo" />
        <TextInput label="Estado" placeholder="SP" />
        <TextInput label="País" placeholder="Brasil" />
      </>
    ),
  },
};

export const ResponsiveDemo: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <TextInput label="Nome" placeholder="Nome" />
        <TextInput label="Email" type="email" placeholder="email@example.com" />
        <TextInput label="Telefone" placeholder="(00) 00000-0000" />
        <TextInput label="CPF" placeholder="000.000.000-00" />
        <TextInput label="RG" placeholder="00.000.000-0" />
        <TextInput label="Data Nascimento" type="date" />
        <TextInput label="CEP" placeholder="00000-000" />
        <TextInput label="Cidade" placeholder="São Paulo" />
        <TextInput label="Estado" placeholder="SP" />
      </>
    ),
  },
};

