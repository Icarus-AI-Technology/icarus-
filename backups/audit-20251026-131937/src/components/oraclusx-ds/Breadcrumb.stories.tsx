/**
 * Storybook Stories - Breadcrumb Component
 * Demonstração visual do componente Breadcrumb
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "@/components/oraclusx-ds/Breadcrumb";

const meta = {
  title: "OraclusX DS/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Produtos", href: "/produtos" },
      { label: "Eletrônicos" },
    ],
  },
};

export const SingleLevel: Story = {
  args: {
    items: [{ label: "Home", href: "/" }, { label: "Sobre" }],
  },
};

export const DeepNavigation: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Admin", href: "/admin" },
      { label: "Configurações", href: "/admin/settings" },
      { label: "Usuários", href: "/admin/settings/users" },
      { label: "Perfil" },
    ],
  },
};

export const AllVariants: Story = {
  args: {
    items: [],
  },
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[600px]">
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Navegação Simples
        </p>
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Página Atual" }]}
        />
      </div>
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Navegação Média
        </p>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Produtos", href: "/produtos" },
            { label: "Categoria", href: "/produtos/categoria" },
            { label: "Item" },
          ]}
        />
      </div>
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Navegação Profunda
        </p>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Relatórios", href: "/dashboard/reports" },
            { label: "Vendas", href: "/dashboard/reports/sales" },
            { label: "Mensal", href: "/dashboard/reports/sales/monthly" },
            { label: "Detalhes" },
          ]}
        />
      </div>
    </div>
  ),
};
