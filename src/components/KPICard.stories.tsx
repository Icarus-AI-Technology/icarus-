/**
 * Storybook Stories - KPICard
 * 
 * Demonstra todas as variações do componente KPICard:
 * - 10 esquemas de cores
 * - Tendências positivas, negativas e neutras
 * - Estados de loading
 * - Grid responsivo
 * - Interatividade (onClick)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { KPICard } from './KPICard';
import {  } from 'lucide-react';

const meta: Meta<typeof KPICard> = {
  title: 'OraclusX DS/KPICard',
  component: KPICard,
  tags: ['autodocs'],
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['purple', 'emerald', 'blue', 'yellow', 'sky', 'pink', 'red', 'indigo', 'gray', 'teal'],
      description: 'Esquema de cores do ícone'
    },
    title: {
      control: 'text',
      description: 'Título do KPI (uppercase)'
    },
    value: {
      control: 'text',
      description: 'Valor principal do KPI'
    },
    loading: {
      control: 'boolean',
      description: 'Estado de loading'
    }
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Card KPI neumórfico com 10 variações de cores, indicadores de tendência e suporte a loading state.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof KPICard>;

// ===== STORY 1: Default =====
export const Default: Story = {
  args: {
    title: 'Sistema Status',
    value: '98%',
    icon: Activity,
    colorScheme: 'purple',
    trend: { value: 2.3, label: 'vs. mês anterior' }
  }
};

// ===== STORY 2: Todas as 10 Cores =====
export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Purple - Sistema/Performance */}
      <KPICard
        title="Sistema Status"
        value="98%"
        icon={Activity}
        colorScheme="purple"
        trend={{ value: 2.3, label: 'vs. mês anterior' }}
      />

      {/* Emerald - Financeiro/Receita */}
      <KPICard
        title="Receita Mensal"
        value="R$ 458K"
        icon={DollarSign}
        colorScheme="emerald"
        trend={{ value: 12.5, label: 'vs. mês anterior' }}
      />

      {/* Blue - Estoque/Inventário */}
      <KPICard
        title="Estoque Total"
        value="2.450"
        icon={Package}
        colorScheme="blue"
        trend={{ value: 5.2, label: 'vs. semana anterior' }}
      />

      {/* Yellow - Vendas/Conversão */}
      <KPICard
        title="Conversão"
        value="23.5%"
        icon={ShoppingCart}
        colorScheme="yellow"
        trend={{ value: 8.1, label: 'vs. mês anterior' }}
      />

      {/* Sky - Usuários/Pacientes */}
      <KPICard
        title="Pacientes Ativos"
        value="1.234"
        icon={Users}
        colorScheme="sky"
        trend={{ value: 15.3, label: 'vs. mês anterior' }}
      />

      {/* Pink - Cirurgias/Procedimentos */}
      <KPICard
        title="Cirurgias Hoje"
        value="12"
        icon={Stethoscope}
        colorScheme="pink"
        trend={{ value: 3.2, label: 'vs. média' }}
      />

      {/* Red - Alertas/Avisos */}
      <KPICard
        title="Alertas Críticos"
        value="5"
        icon={AlertTriangle}
        colorScheme="red"
        trend={{ value: -2.1, label: 'vs. ontem' }}
      />

      {/* Indigo - Tempo/Agenda */}
      <KPICard
        title="Prazo Médio"
        value="2.5 dias"
        icon={Clock}
        colorScheme="indigo"
        trend={{ value: -0.8, label: 'vs. mês anterior' }}
      />

      {/* Gray - Documentos/Relatórios */}
      <KPICard
        title="Documentos"
        value="345"
        icon={FileText}
        colorScheme="gray"
        trend={{ value: 0, label: 'sem variação' }}
      />

      {/* Teal - Sucesso/Conclusão */}
      <KPICard
        title="Taxa de Sucesso"
        value="96.8%"
        icon={CheckCircle}
        colorScheme="teal"
        trend={{ value: 1.5, label: 'vs. mês anterior' }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstração de todas as 10 cores disponíveis, cada uma adequada para diferentes categorias de KPIs.'
      }
    }
  }
};

// ===== STORY 3: Tendências (Positiva, Negativa, Neutra) =====
export const TrendVariations: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tendência Positiva (Verde) */}
      <KPICard
        title="Receita Mensal"
        value="R$ 458K"
        icon={DollarSign}
        colorScheme="emerald"
        trend={{ value: 12.5, label: 'vs. mês anterior' }}
      />

      {/* Tendência Negativa (Vermelho) */}
      <KPICard
        title="Taxa de Ocupação"
        value="76%"
        icon={Users}
        colorScheme="sky"
        trend={{ value: -3.2, label: 'vs. mês anterior' }}
      />

      {/* Tendência Neutra (Cinza) */}
      <KPICard
        title="Documentos"
        value="345"
        icon={FileText}
        colorScheme="gray"
        trend={{ value: 0, label: 'sem variação' }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstração dos três tipos de indicadores de tendência: positivo (verde), negativo (vermelho) e neutro (cinza).'
      }
    }
  }
};

// ===== STORY 4: Sem Tendência =====
export const WithoutTrend: Story = {
  args: {
    title: 'Sistema Status',
    value: '98%',
    icon: Activity,
    colorScheme: 'purple'
  },
  parameters: {
    docs: {
      description: {
        story: 'KPI card sem indicador de tendência.'
      }
    }
  }
};

// ===== STORY 5: Com Subtítulo =====
export const WithSubtitle: Story = {
  args: {
    title: 'Receita Total',
    value: 'R$ 2.8M',
    subtitle: 'Acumulado no ano',
    icon: DollarSign,
    colorScheme: 'emerald',
    trend: { value: 23.5, label: 'vs. ano anterior' }
  },
  parameters: {
    docs: {
      description: {
        story: 'KPI card com subtítulo adicional para contexto extra.'
      }
    }
  }
};

// ===== STORY 6: Loading State =====
export const Loading: Story = {
  args: {
    title: 'Carregando...',
    value: '---',
    icon: Activity,
    colorScheme: 'purple',
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado de loading com skeleton animado.'
      }
    }
  }
};

// ===== STORY 7: Grid Responsivo =====
export const ResponsiveGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <KPICard
        title="Cirurgias Hoje"
        value="12"
        icon={Stethoscope}
        colorScheme="pink"
        trend={{ value: 8.5, label: 'vs. média' }}
      />
      <KPICard
        title="Cirurgias do Mês"
        value="147"
        icon={Calendar}
        colorScheme="pink"
        trend={{ value: 12.3, label: 'vs. mês anterior' }}
      />
      <KPICard
        title="Faturamento do Mês"
        value="R$ 2.8M"
        icon={DollarSign}
        colorScheme="emerald"
        trend={{ value: 15.7, label: 'vs. mês anterior' }}
      />
      <KPICard
        title="Ticket Médio"
        value="R$ 19.4K"
        icon={TrendingUp}
        colorScheme="emerald"
        trend={{ value: 4.2, label: 'vs. mês anterior' }}
      />
      <KPICard
        title="Estoque Baixo"
        value="23"
        icon={Package}
        colorScheme="blue"
        trend={{ value: -3.1, label: 'vs. semana anterior' }}
      />
      <KPICard
        title="Contas a Receber"
        value="R$ 1.2M"
        icon={DollarSign}
        colorScheme="yellow"
        trend={{ value: 0, label: 'estável' }}
      />
      <KPICard
        title="Taxa Inadimplência"
        value="2.3%"
        icon={AlertTriangle}
        colorScheme="red"
        trend={{ value: -0.5, label: 'vs. mês anterior' }}
      />
      <KPICard
        title="Margem de Lucro"
        value="18.5%"
        icon={TrendingUp}
        colorScheme="emerald"
        trend={{ value: 2.1, label: 'vs. mês anterior' }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid responsivo com 1-2-3-4 colunas dependendo do breakpoint (mobile, tablet, desktop, desktop large).'
      }
    }
  }
};

// ===== STORY 8: Com onClick =====
export const Interactive: Story = {
  args: {
    title: 'Receita Mensal',
    value: 'R$ 458K',
    icon: DollarSign,
    colorScheme: 'emerald',
    trend: { value: 12.5, label: 'vs. mês anterior' },
    onClick: () => alert('KPI Card clicado! Você pode navegar para detalhes aqui.')
  },
  parameters: {
    docs: {
      description: {
        story: 'KPI card interativo com cursor pointer e suporte a clique (incluindo navegação por teclado).'
      }
    }
  }
};

// ===== STORY 9: Loading Grid =====
export const LoadingGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Carregando..."
        value="---"
        icon={Activity}
        colorScheme="purple"
        loading={true}
      />
      <KPICard
        title="Carregando..."
        value="---"
        icon={DollarSign}
        colorScheme="emerald"
        loading={true}
      />
      <KPICard
        title="Carregando..."
        value="---"
        icon={Package}
        colorScheme="blue"
        loading={true}
      />
      <KPICard
        title="Carregando..."
        value="---"
        icon={Users}
        colorScheme="sky"
        loading={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid de KPI cards em estado de loading (skeleton animado).'
      }
    }
  }
};

// ===== STORY 10: Dark Mode Preview =====
export const DarkModePreview: Story = {
  render: () => (
    <div className="dark bg-gray-900 p-8 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Sistema Status"
          value="98%"
          icon={Activity}
          colorScheme="purple"
          trend={{ value: 2.3, label: 'vs. mês anterior' }}
        />
        <KPICard
          title="Receita Mensal"
          value="R$ 458K"
          icon={DollarSign}
          colorScheme="emerald"
          trend={{ value: 12.5, label: 'vs. mês anterior' }}
        />
        <KPICard
          title="Alertas Críticos"
          value="5"
          icon={AlertTriangle}
          colorScheme="red"
          trend={{ value: -2.1, label: 'vs. ontem' }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preview do KPI card em dark mode (compatível com tema escuro).'
      }
    }
  }
};

