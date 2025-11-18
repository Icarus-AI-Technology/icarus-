/**
 * Storybook Stories - StatsGrid Component
 * Demonstração visual do componente StatsGrid (grid de KPIs)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { StatsGrid, type StatItem } from '@/components/oraclusx-ds/StatsGrid';
import {  } from 'lucide-react';

const meta = {
  title: 'OraclusX DS/Data Display/StatsGrid',
  component: StatsGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Grid responsivo para exibição de métricas e KPIs. Suporta animações, diferentes layouts de colunas e estados de loading.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [2, 3, 4, 6],
      description: 'Número de colunas no grid',
    },
    animated: {
      control: 'boolean',
      description: 'Ativa animações de entrada',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carregamento',
    },
  },
} satisfies Meta<typeof StatsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleStats: StatItem[] = [
  {
    title: 'Receita Total',
    value: 'R$ 45.280',
    trend: '+12.5%',
    trendUp: true,
    icon: DollarSign,
  },
  {
    title: 'Usuários Ativos',
    value: '1.284',
    trend: '+8.2%',
    trendUp: true,
    icon: Users,
  },
  {
    title: 'Taxa de Conversão',
    value: '24.8%',
    trend: '+3.1%',
    trendUp: true,
    icon: TrendingUp,
  },
  {
    title: 'Vendas',
    value: '324',
    trend: '-2.4%',
    trendUp: false,
    icon: ShoppingCart,
  },
];

export const TwoColumns: Story = {
  args: {
    stats: sampleStats.slice(0, 4),
    columns: 2,
    animated: true,
  },
};

export const ThreeColumns: Story = {
  args: {
    stats: sampleStats.slice(0, 3),
    columns: 3,
    animated: true,
  },
};

export const FourColumns: Story = {
  args: {
    stats: sampleStats,
    columns: 4,
    animated: true,
  },
};

export const SixColumns: Story = {
  args: {
    stats: [
      ...sampleStats,
      {
        title: 'Uptime',
        value: '99.9%',
        trend: 'Estável',
        trendUp: true,
        icon: Activity,
      },
      {
        title: 'Alertas',
        value: '3',
        trend: '-2',
        trendUp: true,
        icon: AlertCircle,
      },
    ],
    columns: 6,
    animated: true,
  },
};

export const WithoutAnimation: Story = {
  args: {
    stats: sampleStats,
    columns: 4,
    animated: false,
  },
};

export const LoadingState: Story = {
  args: {
    stats: sampleStats,
    columns: 4,
    loading: true,
  },
};

export const NegativeTrends: Story = {
  args: {
    stats: [
      {
        title: 'Custos Operacionais',
        value: 'R$ 28.450',
        trend: '+15.2%',
        trendUp: false,
        icon: AlertCircle,
      },
      {
        title: 'Cancelamentos',
        value: '18',
        trend: '+22%',
        trendUp: false,
        icon: AlertCircle,
      },
      {
        title: 'Tempo de Resposta',
        value: '1.8s',
        trend: '+450ms',
        trendUp: false,
        icon: Activity,
      },
      {
        title: 'Taxa de Erro',
        value: '2.4%',
        trend: '+0.8%',
        trendUp: false,
        icon: AlertCircle,
      },
    ],
    columns: 4,
    animated: true,
  },
};

export const MixedTrends: Story = {
  args: {
    stats: [
      {
        title: 'Receita',
        value: 'R$ 125.4K',
        trend: '+18.2%',
        trendUp: true,
        icon: DollarSign,
      },
      {
        title: 'Custos',
        value: 'R$ 82.1K',
        trend: '+8.5%',
        trendUp: false,
        icon: AlertCircle,
      },
      {
        title: 'Lucro',
        value: 'R$ 43.3K',
        trend: '+32.1%',
        trendUp: true,
        icon: TrendingUp,
      },
    ],
    columns: 3,
    animated: true,
  },
};

