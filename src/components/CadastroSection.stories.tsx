/**
 * Storybook Stories - CadastroSection Component
 * Demonstração visual do componente CadastroSection
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadastroSection, FormGrid } from '@/components/oraclusx-ds/CadastroLayout';
import { TextInput } from '@/components/oraclusx-ds';
import {  } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Cadastro/CadastroSection',
  component: CadastroSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Seção de formulário com Card neumórfico. Agrupa campos relacionados com título/descrição opcional.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CadastroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    title: 'Dados Pessoais',
    children: (
      <FormGrid columns={2}>
        <TextInput label="Nome" placeholder="Digite o nome" />
        <TextInput label="Email" type="email" placeholder="email@example.com" />
      </FormGrid>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Informações de Contato',
    description: 'Preencha os dados de contato do paciente.',
    children: (
      <FormGrid columns={2}>
        <TextInput label="Telefone Principal" placeholder="(00) 00000-0000" />
        <TextInput label="Telefone Secundário" placeholder="(00) 00000-0000" />
        <TextInput label="Email" type="email" placeholder="email@example.com" />
      </FormGrid>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Dados do Usuário',
    description: 'Informações básicas de identificação.',
    icon: User,
    children: (
      <FormGrid columns={3}>
        <TextInput label="Nome Completo" placeholder="João Silva" />
        <TextInput label="CPF" placeholder="000.000.000-00" />
        <TextInput label="RG" placeholder="00.000.000-0" />
      </FormGrid>
    ),
  },
};

export const AddressSection: Story = {
  args: {
    title: 'Endereço',
    description: 'Localização completa do cadastro.',
    icon: MapPin,
    children: (
      <FormGrid columns={2}>
        <TextInput label="CEP" placeholder="00000-000" />
        <TextInput label="Logradouro" placeholder="Rua, Avenida..." />
        <TextInput label="Número" placeholder="123" />
        <TextInput label="Complemento" placeholder="Apto 45" />
        <TextInput label="Bairro" placeholder="Centro" />
        <TextInput label="Cidade" placeholder="São Paulo" />
      </FormGrid>
    ),
  },
};

export const ContactSection: Story = {
  args: {
    title: 'Contato',
    icon: Phone,
    children: (
      <FormGrid columns={2}>
        <TextInput label="Telefone" placeholder="(00) 00000-0000" />
        <TextInput label="WhatsApp" placeholder="(00) 00000-0000" />
        <TextInput label="Email Principal" type="email" placeholder="email@example.com" />
        <TextInput label="Email Alternativo" type="email" placeholder="email2@example.com" />
      </FormGrid>
    ),
  },
};

export const MultipleSections: Story = {
  render: () => (
    <div className="space-y-6">
      <CadastroSection title="Dados Pessoais" icon={User}>
        <FormGrid columns={3}>
          <TextInput label="Nome" placeholder="João Silva" />
          <TextInput label="CPF" placeholder="000.000.000-00" />
          <TextInput label="Data Nascimento" type="date" />
        </FormGrid>
      </CadastroSection>

      <CadastroSection title="Endereço" icon={MapPin} description="Localização do paciente">
        <FormGrid columns={2}>
          <TextInput label="CEP" placeholder="00000-000" />
          <TextInput label="Logradouro" placeholder="Rua, Avenida..." />
        </FormGrid>
      </CadastroSection>

      <CadastroSection title="Contato" icon={Phone}>
        <FormGrid columns={2}>
          <TextInput label="Telefone" placeholder="(00) 00000-0000" />
          <TextInput label="Email" type="email" placeholder="email@example.com" />
        </FormGrid>
      </CadastroSection>
    </div>
  ),
};

