/**
 * Componente: BI Dashboard Interativo
 * 
 * Dashboard de Business Intelligence com análises multidimensionais
 * para distribuidoras de OPME (Órteses, Próteses e Materiais Especiais)
 */

import {
  Card,
  Button,
  Select,
  Tabs,
} from '@/components/oraclusx-ds';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Download,
  Filter,
  Calendar,
  Target,
  Award,
  ShoppingCart,
  Brain,
  Layers,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

interface KPI {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: any;
  color: string;
}

interface VendaPorProduto {
  codigo: string;
  descricao: string;
  categoria: string;
  quantidade_vendas: number;
  valor_total: number;
  margem_total: number;
  margem_media_percentual: number;
}

interface VendaPorCliente {
  cnpj: string;
  razao_social: string;
  cidade: string;
  estado: string;
  valor_total: number;
  margem_total: number;
}

interface EvolucaoMensal {
  mes_ano_label: string;
  valor_total: number;
  margem_total: number;
  ticket_medio: number;
  clientes_unicos: number;
}

interface PerformanceVendedor {
  nome: string;
  equipe: string;
  valor_total: number;
  atingimento_meta_percentual: number;
  clientes_atendidos: number;
}

const COLORS = ['var(--orx-primary)', 'var(--orx-success)', 'var(--orx-warning)', 'var(--orx-error)', 'var(--orx-purple-500)', 'var(--orx-pink-500)', 'var(--orx-teal-500)', '#f97316'];

export default function BIDashboardInterativo() {
  useDocumentTitle('BI Dashboard Interativo');
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'produtos' | 'clientes' | 'vendedores' | 'previsao'>('overview');
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'30d' | '90d' | '180d' | '365d'>('30d');

  // Dados
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [vendasPorProduto, setVendasPorProduto] = useState<VendaPorProduto[]>([]);
  const [vendasPorCliente, setVendasPorCliente] = useState<VendaPorCliente[]>([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensal[]>([]);
  const [performanceVendedores, setPerformanceVendedores] = useState<PerformanceVendedor[]>([]);

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarKPIs(),
        carregarVendasPorProduto(),
        carregarVendasPorCliente(),
        carregarEvolucaoMensal(),
        carregarPerformanceVendedores(),
      ]);
    } catch (error: unknown) {
      addToast(`Erro ao carregar dados: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarKPIs = async () => {
    try {
      // Mock data para demonstração (integrar com views do banco)
      const mockKPIs: KPI[] = [
        {
          title: 'Faturamento Total',
          value: formatCurrency(2450000),
          change: 12.5,
          changeLabel: '+R$ 272k vs mês anterior',
          icon: DollarSign,
          color: 'blue',
        },
        {
          title: 'Margem Bruta',
          value: formatCurrency(612500),
          change: 8.3,
          changeLabel: 'Margem de 25%',
          icon: TrendingUp,
          color: 'green',
        },
        {
          title: 'Ticket Médio',
          value: formatCurrency(8500),
          change: -2.1,
          changeLabel: '-R$ 182 vs mês anterior',
          icon: ShoppingCart,
          color: 'orange',
        },
        {
          title: 'Clientes Ativos',
          value: '142',
          change: 5.2,
          changeLabel: '+7 novos clientes',
          icon: Users,
          color: 'indigo',
        },
        {
          title: 'Produtos Vendidos',
          value: '288',
          change: 15.7,
          changeLabel: '+39 tipos diferentes',
          icon: Package,
          color: 'purple',
        },
        {
          title: 'Taxa de Conversão',
          value: '68%',
          change: 3.4,
          changeLabel: '+2.3% vs mês anterior',
          icon: Target,
          color: 'teal',
        },
      ];

      setKpis(mockKPIs);
    } catch (_error) {
      console.error('Erro ao carregar KPIs:', error);
    }
  };

  const carregarVendasPorProduto = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_bi_vendas_por_produto')
        .select('*')
        .limit(10);

      if (error) throw error;

      setVendasPorProduto(data || []);
    } catch (_error) {
      console.error('Erro ao carregar vendas por produto:', error);
      // Mock data
      setVendasPorProduto([
        { codigo: 'OPME-001', descricao: 'Stent Coronariano', categoria: 'Cardiovascular', quantidade_vendas: 45, valor_total: 225000, margem_total: 56250, margem_media_percentual: 25 },
        { codigo: 'OPME-002', descricao: 'Prótese de Quadril', categoria: 'Ortopedia', quantidade_vendas: 38, valor_total: 190000, margem_total: 47500, margem_media_percentual: 25 },
        { codigo: 'OPME-003', descricao: 'Válvula Cardíaca', categoria: 'Cardiovascular', quantidade_vendas: 32, valor_total: 160000, margem_total: 40000, margem_media_percentual: 25 },
        { codigo: 'OPME-004', descricao: 'Marca-passo', categoria: 'Cardiovascular', quantidade_vendas: 28, valor_total: 140000, margem_total: 35000, margem_media_percentual: 25 },
        { codigo: 'OPME-005', descricao: 'Placa Ortopédica', categoria: 'Ortopedia', quantidade_vendas: 25, valor_total: 125000, margem_total: 31250, margem_media_percentual: 25 },
      ]);
    }
  };

  const carregarVendasPorCliente = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_bi_vendas_por_cliente')
        .select('*')
        .limit(10);

      if (error) throw error;

      setVendasPorCliente(data || []);
    } catch (_error) {
      console.error('Erro ao carregar vendas por cliente:', error);
      // Mock data
      setVendasPorCliente([
        { cnpj: '12345678000190', razao_social: 'Hospital São Lucas', cidade: 'São Paulo', estado: 'SP', valor_total: 450000, margem_total: 112500 },
        { cnpj: '23456789000181', razao_social: 'Hospital Santa Casa', cidade: 'Rio de Janeiro', estado: 'RJ', valor_total: 380000, margem_total: 95000 },
        { cnpj: '34567890000172', razao_social: 'Hospital Universitário', cidade: 'Belo Horizonte', estado: 'MG', valor_total: 320000, margem_total: 80000 },
        { cnpj: '45678901000163', razao_social: 'Clínica Cardio Plus', cidade: 'Curitiba', estado: 'PR', valor_total: 280000, margem_total: 70000 },
        { cnpj: '56789012000154', razao_social: 'Hospital Regional', cidade: 'Porto Alegre', estado: 'RS', valor_total: 250000, margem_total: 62500 },
      ]);
    }
  };

  const carregarEvolucaoMensal = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_bi_evolucao_mensal')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(12);

      if (error) throw error;

      setEvolucaoMensal((data || []).reverse());
    } catch (_error) {
      console.error('Erro ao carregar evolução mensal:', error);
      // Mock data
      setEvolucaoMensal([
        { mes_ano_label: 'Jan/2025', valor_total: 2100000, margem_total: 525000, ticket_medio: 7500, clientes_unicos: 128 },
        { mes_ano_label: 'Fev/2025', valor_total: 2200000, margem_total: 550000, ticket_medio: 7800, clientes_unicos: 132 },
        { mes_ano_label: 'Mar/2025', valor_total: 2350000, margem_total: 587500, ticket_medio: 8100, clientes_unicos: 138 },
        { mes_ano_label: 'Abr/2025', valor_total: 2280000, margem_total: 570000, ticket_medio: 7900, clientes_unicos: 135 },
        { mes_ano_label: 'Mai/2025', valor_total: 2400000, margem_total: 600000, ticket_medio: 8300, clientes_unicos: 140 },
        { mes_ano_label: 'Jun/2025', valor_total: 2450000, margem_total: 612500, ticket_medio: 8500, clientes_unicos: 142 },
      ]);
    }
  };

  const carregarPerformanceVendedores = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_bi_performance_vendedores')
        .select('*')
        .limit(10);

      if (error) throw error;

      setPerformanceVendedores(data || []);
    } catch (_error) {
      console.error('Erro ao carregar performance vendedores:', error);
      // Mock data
      setPerformanceVendedores([
        { nome: 'João Silva', equipe: 'Equipe Sul', valor_total: 580000, atingimento_meta_percentual: 116, clientes_atendidos: 38 },
        { nome: 'Maria Santos', equipe: 'Equipe Sudeste', valor_total: 520000, atingimento_meta_percentual: 104, clientes_atendidos: 42 },
        { nome: 'Carlos Oliveira', equipe: 'Equipe Nordeste', valor_total: 480000, atingimento_meta_percentual: 96, clientes_atendidos: 35 },
        { nome: 'Ana Costa', equipe: 'Equipe Sul', valor_total: 450000, atingimento_meta_percentual: 90, clientes_atendidos: 32 },
        { nome: 'Pedro Souza', equipe: 'Equipe Centro-Oeste', valor_total: 420000, atingimento_meta_percentual: 84, clientes_atendidos: 28 },
      ]);
    }
  };

  const handleExportar = () => {
    addToast('Exportando relatório...', 'info');
    // Implementar exportação PDF/Excel
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <Card
            key={index}
            className={`p-6 neuro-raised flex flex-col justify-between h-[180px] ${
              kpi.color === 'blue'
                ? 'bg-gradient-to-br from-[var(--orx-primary)] to-[var(--orx-primary-hover)] text-white'
                : kpi.color === 'green'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                : kpi.color === 'orange'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                : kpi.color === 'indigo'
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                : kpi.color === 'purple'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="opacity-90" style={{  fontSize: '0.813rem' , fontWeight: 500 }}>{kpi.title}</h3>
              <kpi.icon className="w-6 h-6 opacity-80" />
            </div>
            <div className="mt-4">
              <p className style={{  fontSize: '0.813rem' , fontWeight: 700 }}>{kpi.value}</p>
              <div className="flex items-center gap-2 mt-3">
                {kpi.change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="opacity-80" style={{ fontSize: '0.813rem' }}>{kpi.changeLabel}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Evolução Mensal */}
      <Card className="p-6 neuro-raised">
        <h3 className="mb-4 flex items-center gap-2" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>
          <LineChartIcon className="w-5 h-5 text-[var(--primary)]" />
          Evolução Mensal de Faturamento
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={evolucaoMensal}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" opacity={0.1} />
            <XAxis dataKey="mes_ano_label" stroke="var(--text-secondary)" />
            <YAxis yAxisId="left" stroke="var(--text-secondary)" />
            <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-light)',
                border: '1px solid var(--text-secondary)',
                borderRadius: '8px',
              }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="valor_total"
              fill="var(--orx-primary)"
              stroke="var(--orx-primary)"
              fillOpacity={0.2}
              name="Faturamento"
            />
            <Bar
              yAxisId="right"
              dataKey="clientes_unicos"
              fill="var(--orx-success)"
              name="Clientes Únicos"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="margem_total"
              stroke="var(--orx-warning)"
              strokeWidth={2}
              name="Margem Bruta"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Top 5 Produtos e Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 neuro-raised">
          <h3 className="mb-4 flex items-center gap-2" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>
            <Package className="w-5 h-5 text-[var(--primary)]" />
            Top 5 Produtos
          </h3>
          <div className="space-y-3">
            {vendasPorProduto.slice(0, 5).map((produto, index) => (
              <div key={index} className="flex items-center justify-between p-3 neuro-flat rounded-lg">
                <div className="flex-1">
                  <p className style={{  fontSize: '0.813rem' , fontWeight: 500 }}>{produto.descricao}</p>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>{produto.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--primary)]" style={{ fontWeight: 600 }}>
                    {formatCurrency(produto.valor_total)}
                  </p>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
                    {produto.quantidade_vendas} vendas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 neuro-raised">
          <h3 className="mb-4 flex items-center gap-2" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>
            <Users className="w-5 h-5 text-[var(--primary)]" />
            Top 5 Clientes
          </h3>
          <div className="space-y-3">
            {vendasPorCliente.slice(0, 5).map((cliente, index) => (
              <div key={index} className="flex items-center justify-between p-3 neuro-flat rounded-lg">
                <div className="flex-1">
                  <p className style={{  fontSize: '0.813rem' , fontWeight: 500 }}>{cliente.razao_social}</p>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
                    {cliente.cidade}/{cliente.estado}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--primary)]" style={{ fontWeight: 600 }}>
                    {formatCurrency(cliente.valor_total)}
                  </p>
                  <p className="text-success" style={{ fontSize: '0.813rem' }}>
                    Margem: {formatCurrency(cliente.margem_total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderProdutos = () => (
    <div className="space-y-6">
      <Card className="p-6 neuro-raised">
        <h3 className="mb-4" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>Análise de Produtos OPME</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={vendasPorProduto}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" opacity={0.1} />
            <XAxis dataKey="codigo" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-light)',
                border: '1px solid var(--text-secondary)',
                borderRadius: '8px',
              }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="valor_total" fill="var(--orx-primary)" name="Faturamento" />
            <Bar dataKey="margem_total" fill="var(--orx-success)" name="Margem" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribuição por Categoria */}
      <Card className="p-6 neuro-raised">
        <h3 className="mb-4" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>Distribuição por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={vendasPorProduto}
              dataKey="valor_total"
              nameKey="categoria"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {vendasPorProduto.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderVendedores = () => (
    <div className="space-y-6">
      <Card className="p-6 neuro-raised">
        <h3 className="mb-4 flex items-center gap-2" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>
          <Award className="w-5 h-5 text-[var(--primary)]" />
          Performance de Vendedores
        </h3>
        <div className="space-y-4">
          {performanceVendedores.map((vendedor, index) => (
            <div key={index} className="p-4 neuro-flat rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className style={{ fontWeight: 600 }}>{vendedor.nome}</p>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>{vendedor.equipe}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--primary)]" style={{ fontWeight: 700 }}>
                    {formatCurrency(vendedor.valor_total)}
                  </p>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
                    {vendedor.clientes_atendidos} clientes
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between" style={{ fontSize: '0.813rem' }}>
                  <span>Atingimento da Meta</span>
                  <span className={`font-semibold ${vendedor.atingimento_meta_percentual >= 100 ? 'text-success' : 'text-warning'}`}>
                    {vendedor.atingimento_meta_percentual}%
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${vendedor.atingimento_meta_percentual >= 100 ? 'bg-success' : 'bg-warning'}`}
                    style={{ width: `${Math.min(vendedor.atingimento_meta_percentual, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPrevisao = () => (
    <div className="space-y-6">
      <Card className="p-6 neuro-raised">
        <h3 className="mb-4 flex items-center gap-2" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>
          <Brain className="w-5 h-5 text-[var(--primary)]" />
          Previsão de Demanda (Machine Learning)
        </h3>
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-[var(--primary)] opacity-50" />
          <p className="text-[var(--text-secondary)] mb-4">
            Análise preditiva em desenvolvimento
          </p>
          <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
            Em breve: Previsão de demanda usando ARIMA, Prophet e Random Forest
          </p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              BI Dashboard Interativo
            </h1>
            <p className="text-[var(--text-secondary)]">
              Análises multidimensionais e insights para distribuidoras OPME
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={periodo}
              onValueChange={(value) => setPeriodo(value as typeof periodo)}
              options={[
                { value: '30d', label: 'Últimos 30 dias' },
                { value: '90d', label: 'Últimos 90 dias' },
                { value: '180d', label: 'Últimos 180 dias' },
                { value: '365d', label: 'Último ano' },
              ]}
              className="w-[180px]"
            />
            <Button icon={<Filter />} variant="secondary">
              Filtros
            </Button>
            <Button icon={<Download />} onClick={handleExportar}>
              Exportar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'produtos', label: 'Produtos', icon: Package },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'vendedores', label: 'Vendedores', icon: Award },
            { id: 'previsao', label: 'Previsão IA', icon: Brain },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'neuro-raised text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'produtos' && renderProdutos()}
        {activeTab === 'clientes' && renderOverview()} {/* Reusa overview por enquanto */}
        {activeTab === 'vendedores' && renderVendedores()}
        {activeTab === 'previsao' && renderPrevisao()}
      </div>
    </div>
  );
}

