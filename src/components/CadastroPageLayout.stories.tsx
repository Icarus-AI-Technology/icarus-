/**
 * Storybook Stories - CadastroPageLayout Component
 * Demonstração visual do componente CadastroPageLayout
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadastroPageLayout, CadastroSection, FormGrid, FormActions } from '@/components/oraclusx-ds/CadastroLayout';
import { Button, TextInput } from '@/components/oraclusx-ds';
import {  } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Cadastro/CadastroPageLayout',
  component: CadastroPageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Layout padrão para páginas de cadastro. Inclui PageHeader, Container e slots para seções de formulário.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CadastroPageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    title: 'Cadastro de Pacientes',
    description: 'Gerencie informações detalhadas dos pacientes.',
    icon: UserCheck,
    children: (
      <CadastroSection title="Dados Pessoais">
        <FormGrid columns={3}>
          <TextInput label="Nome Completo" placeholder="Digite o nome" />
          <TextInput label="CPF" placeholder="000.000.000-00" />
          <TextInput label="Data de Nascimento" type="date" />
        </FormGrid>
      </CadastroSection>
    ),
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Cadastro de Hospitais',
    description: 'Cadastre e gerencie informações de hospitais.',
    icon: Hospital,
    badge: { label: 'Premium', variant: 'success' },
    children: (
      <CadastroSection title="Dados do Hospital">
        <FormGrid columns={2}>
          <TextInput label="Nome do Hospital" placeholder="Hospital XYZ" />
          <TextInput label="CNPJ" placeholder="00.000.000/0000-00" />
        </FormGrid>
      </CadastroSection>
    ),
  },
};

export const WithActions: Story = {
  args: {
    title: 'Cadastro de Médicos',
    description: 'Registre médicos e suas especialidades.',
    icon: Users,
    actions: (
      <Button variant="ghost">Importar CSV</Button>
    ),
    children: (
      <CadastroSection title="Dados Profissionais">
        <FormGrid columns={2}>
          <TextInput label="Nome" placeholder="Dr. João Silva" />
          <TextInput label="CRM" placeholder="CRM/SP 123456" />
        </FormGrid>
      </CadastroSection>
    ),
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'Editar Paciente',
    description: 'Atualize as informações do paciente.',
    icon: UserCheck,
    breadcrumbs: [
      { label: 'Cadastros', href: '/cadastros' },
      { label: 'Pacientes', href: '/cadastros/pacientes' },
      { label: 'João Silva' },
    ],
    children: (
      <CadastroSection title="Dados Pessoais">
        <FormGrid columns={3}>
          <TextInput label="Nome Completo" defaultValue="João Silva" />
          <TextInput label="CPF" defaultValue="123.456.789-00" />
          <TextInput label="Telefone" defaultValue="(11) 98765-4321" />
        </FormGrid>
      </CadastroSection>
    ),
  },
};

export const Complete: Story = {
  args: {
    title: 'Cadastro de Pacientes',
    description: 'Formulário completo de cadastro.',
    icon: UserCheck,
    badge: { label: 'Obrigatório', variant: 'warning' },
    actions: (
      <div className="flex gap-3">
        <Button variant="ghost">Importar</Button>
        <Button variant="ghost">Exportar</Button>
      </div>
    ),
    breadcrumbs: [
      { label: 'Cadastros', href: '/cadastros' },
      { label: 'Pacientes' },
    ],
    children: (
      <>
        <CadastroSection title="Dados Pessoais" description="Informações básicas do paciente">
          <FormGrid columns={3}>
            <TextInput label="Nome Completo" placeholder="Digite o nome" required />
            <TextInput label="CPF" placeholder="000.000.000-00" required />
            <TextInput label="Data de Nascimento" type="date" required />
            <TextInput label="Telefone" placeholder="(00) 00000-0000" />
            <TextInput label="Email" type="email" placeholder="email@example.com" />
            <TextInput label="RG" placeholder="00.000.000-0" />
          </FormGrid>
        </CadastroSection>

        <CadastroSection title="Endereço" description="Localização do paciente">
          <FormGrid columns={2}>
            <TextInput label="CEP" placeholder="00000-000" />
            <TextInput label="Logradouro" placeholder="Rua, Avenida..." />
            <TextInput label="Número" placeholder="123" />
            <TextInput label="Complemento" placeholder="Apto 45" />
            <TextInput label="Bairro" placeholder="Centro" />
            <TextInput label="Cidade" placeholder="São Paulo" />
          </FormGrid>
        </CadastroSection>

        <FormActions align="right">
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary">Salvar Paciente</Button>
        </FormActions>
      </>
    ),
  },
};

