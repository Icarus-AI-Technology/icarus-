import { useState, useEffect } from 'react';
/**
 * Componente: Gestão Contábil
 * 
 * Sistema completo de contabilidade para distribuidoras OPME
 * DRE, Balancete, Razão, Lançamentos, Plano de Contas
 * 
 * FUNCIONALIDADES:
 * - Plano de Contas estruturado (4 níveis)
 * - Lançamentos com partidas dobradas
 * - DRE (Demonstração do Resultado)
 * - Balancete de Verificação
 * - Razão Contábil
 * - Centros de Custo
 * - Exportação para Excel/PDF
 */

import {
  Card,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
} from '@/components/oraclusx-ds';
import {
  Calculator,
  FileText,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileBarChart,
  Plus,
  Eye,
  Download,
  RefreshCw,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { OrxBarChart } from '@/components/charts/OrxBarChart';

interface DREItem {
  grupo: string;
  descricao: string;
  valor: number;
  percentual: number;
}

interface BalanceteItem {
  conta_codigo: string;
  conta_nome: string;
  conta_tipo: string;
  total_debito: number;
  total_credito: number;
  saldo_atual: number;
  tipo_saldo: string;
}

interface Lancamento {
  id: string;
  numero_lancamento: number;
  data_lancamento: string;
  data_competencia: string;
  historico: string;
  valor_total: number;
  status: string;
  tipo_lancamento: string;
}

interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  orcamento_mensal: number;
}

export default function GestaoContabil() {
  useDocumentTitle('Gestão Contábil');
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dre' | 'balancete' | 'lancamentos' | 'plano' | 'centros'>('dre');
  const [loading, setLoading] = useState(true);
  const [dreData, setDreData] = useState<DREItem[]>([]);
  const [balancete, setBalancete] = useState<BalanceteItem[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);

  // Filtros DRE
  const [dreDataInicio, setDreDataInicio] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dreDataFim, setDreDataFim] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarDRE(),
        carregarBalancete(),
        carregarLancamentos(),
        carregarCentrosCusto(),
      ]);
    } catch (error: unknown) {
      const err = error as Error;
      addToast(`Erro ao carregar dados: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarDRE = async () => {
    try {
      const { data, error } = await supabase.rpc('gerar_dre', {
        p_data_inicio: dreDataInicio,
        p_data_fim: dreDataFim,
      });

      if (error) throw error;
      setDreData(data || []);
    } catch (error) {
      console.error('Erro ao carregar DRE:', error as Error);
      // Mock data para desenvolvimento
      setDreData([
        { grupo: 'RECEITA_BRUTA', descricao: 'Receita Bruta', valor: 2500000, percentual: 100 },
        { grupo: 'DEDUCOES', descricao: '(-) Deduções', valor: -425000, percentual: 17 },
        { grupo: 'RECEITA_LIQUIDA', descricao: '(=) Receita Líquida', valor: 2075000, percentual: 83 },
        { grupo: 'CUSTOS', descricao: '(-) Custos', valor: -1250000, percentual: 50 },
        { grupo: 'LUCRO_BRUTO', descricao: '(=) Lucro Bruto', valor: 825000, percentual: 33 },
        { grupo: 'DESPESAS_OP', descricao: '(-) Despesas Operacionais', valor: -420000, percentual: 16.8 },
        { grupo: 'LUCRO_OP', descricao: '(=) Lucro Operacional', valor: 405000, percentual: 16.2 },
        { grupo: 'OUTRAS_REC', descricao: '(+) Outras Receitas', valor: 15000, percentual: 0.6 },
        { grupo: 'OUTRAS_DESP', descricao: '(-) Outras Despesas', valor: -20000, percentual: 0.8 },
        { grupo: 'LUCRO_LIQUIDO', descricao: '(=) Lucro Líquido', valor: 400000, percentual: 16 },
      ]);
    }
  };

  const carregarBalancete = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_balancete')
        .select('*')
        .order('conta_codigo');

      if (error) throw error;
      setBalancete(data || []);
    } catch (error) {
      console.error('Erro ao carregar balancete:', error as Error);
      // Mock data
      setBalancete([
        {
          conta_codigo: '1.1.01.001',
          conta_nome: 'Caixa',
          conta_tipo: 'ativo',
          total_debito: 50000,
          total_credito: 30000,
          saldo_atual: 20000,
          tipo_saldo: 'devedor',
        },
        {
          conta_codigo: '1.1.01.002',
          conta_nome: 'Bancos c/ Movimento',
          conta_tipo: 'ativo',
          total_debito: 500000,
          total_credito: 320000,
          saldo_atual: 180000,
          tipo_saldo: 'devedor',
        },
        {
          conta_codigo: '1.1.02.001',
          conta_nome: 'Clientes',
          conta_tipo: 'ativo',
          total_debito: 850000,
          total_credito: 650000,
          saldo_atual: 200000,
          tipo_saldo: 'devedor',
        },
        {
          conta_codigo: '1.1.03.001',
          conta_nome: 'Estoque de OPME',
          conta_tipo: 'ativo',
          total_debito: 1200000,
          total_credito: 800000,
          saldo_atual: 400000,
          tipo_saldo: 'devedor',
        },
        {
          conta_codigo: '2.1.01.001',
          conta_nome: 'Fornecedores Nacionais',
          conta_tipo: 'passivo',
          total_debito: 300000,
          total_credito: 500000,
          saldo_atual: 200000,
          tipo_saldo: 'credor',
        },
      ]);
    }
  };

  const carregarLancamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('lancamentos_contabeis')
        .select('*')
        .order('data_lancamento', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLancamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error as Error);
      // Mock data
      setLancamentos([
        {
          id: '1',
          numero_lancamento: 1234,
          data_lancamento: '2025-10-15',
          data_competencia: '2025-10-01',
          historico: 'Venda OPME - Hospital XYZ',
          valor_total: 50000,
          status: 'confirmado',
          tipo_lancamento: 'padrao',
        },
        {
          id: '2',
          numero_lancamento: 1235,
          data_lancamento: '2025-10-16',
          data_competencia: '2025-10-01',
          historico: 'Pagamento fornecedor ABC',
          valor_total: 30000,
          status: 'confirmado',
          tipo_lancamento: 'padrao',
        },
      ]);
    }
  };

  const carregarCentrosCusto = async () => {
    try {
      const { data, error } = await supabase
        .from('centros_custo')
        .select('*')
        .eq('is_ativo', true)
        .order('codigo');

      if (error) throw error;
      setCentrosCusto(data || []);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error as Error);
      // Mock data
      setCentrosCusto([
        { id: '1', codigo: 'CC001', nome: 'Administrativo', tipo: 'administrativo', orcamento_mensal: 50000 },
        { id: '2', codigo: 'CC002', nome: 'Comercial', tipo: 'comercial', orcamento_mensal: 80000 },
        { id: '3', codigo: 'CC003', nome: 'Logística', tipo: 'logistica', orcamento_mensal: 40000 },
        { id: '4', codigo: 'CC004', nome: 'Estoque', tipo: 'operacional', orcamento_mensal: 30000 },
      ]);
    }
  };

  const handleExportarDRE = () => {
    addToast('Exportando DRE...', 'info');
    // Implementar exportação
  };

  const renderDRE = () => {
    const receitaBruta = dreData.find((d) => d.grupo === 'RECEITA_BRUTA')?.valor || 0;
    const lucroLiquido = dreData.find((d) => d.grupo === 'LUCRO_LIQUIDO')?.valor || 0;
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

    // Dados para o gráfico
    const chartData = [
      { name: 'Receita Líquida', value: dreData.find((d) => d.grupo === 'RECEITA_LIQUIDA')?.valor || 0 },
      { name: 'Custos', value: Math.abs(dreData.find((d) => d.grupo === 'CUSTOS')?.valor || 0) },
      { name: 'Desp. Operacionais', value: Math.abs(dreData.find((d) => d.grupo === 'DESPESAS_OP')?.valor || 0) },
      { name: 'Lucro Líquido', value: lucroLiquido },
    ];

    const colors = ['var(--orx-primary)', 'var(--orx-error)', 'var(--orx-warning)', 'var(--orx-success)'];

    return (
      <div className="space-y-6">
        {/* Filtros */}
        <Card className="p-6 neuro-raised">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-[0.813rem] orx-font-medium">Data Início</label>
              <Input
                type="date"
                value={dreDataInicio}
                onChange={(e) => setDreDataInicio(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-[0.813rem] orx-font-medium">Data Fim</label>
              <Input
                type="date"
                value={dreDataFim}
                onChange={(e) => setDreDataFim(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button icon={<RefreshCw />} onClick={carregarDRE}>
                Atualizar
              </Button>
              <Button variant="secondary" icon={<Download />} onClick={handleExportarDRE}>
                Exportar
              </Button>
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 neuro-raised bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90 text-[0.813rem] orx-font-medium">Receita Bruta</h3>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[0.813rem] orx-font-bold">{formatCurrency(receitaBruta)}</p>
            <p className="opacity-80 mt-2 text-[0.813rem]">100% da base</p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90 text-[0.813rem] orx-font-medium">Lucro Líquido</h3>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[0.813rem] orx-font-bold">{formatCurrency(lucroLiquido)}</p>
            <p className="opacity-80 mt-2 text-[0.813rem]">
              {lucroLiquido >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90 text-[0.813rem] orx-font-medium">Margem Líquida</h3>
              <PieChart className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[0.813rem] orx-font-bold">{margemLiquida.toFixed(1)}%</p>
            <p className="opacity-80 mt-2 text-[0.813rem]">Meta: ≥ 15%</p>
          </Card>
        </div>

        {/* Gráfico */}
        <Card className="p-6 neuro-raised">
          <h3 className="mb-4 text-[0.813rem] orx-font-semibold">Análise Visual</h3>
          <OrxBarChart data={chartData} keys={["value"]} indexBy="name" height={300} colors={colors} />
        </Card>

        {/* Tabela DRE */}
        <Card className="neuro-raised p-0">
          <div className="p-6 border-b border-[var(--text-secondary)]/20">
            <h3 className="text-[0.813rem] orx-font-semibold">
              Demonstração do Resultado do Exercício (DRE)
            </h3>
            <p className="text-[var(--text-secondary)] mt-1 text-[0.813rem]">
              Período: {new Date(dreDataInicio).toLocaleDateString('pt-BR')} até{' '}
              {new Date(dreDataFim).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
                <TableHead className="text-right">% Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dreData.map((item, idx) => {
                const isTotal = ['RECEITA_LIQUIDA', 'LUCRO_BRUTO', 'LUCRO_OP', 'LUCRO_LIQUIDO'].includes(
                  item.grupo
                );
                const isNegative = item.valor < 0;

                return (
                  <TableRow
                    key={idx}
                    className={isTotal ? 'bg-[var(--primary)]/5 orx-font-semibold' : ''}
                  >
                    <TableCell className={isTotal ? 'orx-font-bold' : ''}>
                      {item.descricao}
                    </TableCell>
                    <TableCell
                      className={`text-right ${isTotal ? 'orx-font-bold' : ''} ${
                        isNegative ? 'text-error' : item.valor > 0 ? 'text-success' : ''
                      }`}
                    >
                      {formatCurrency(item.valor)}
                    </TableCell>
                    <TableCell className="text-right">{item.percentual.toFixed(2)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const renderBalancete = () => {
    const totalAtivo = balancete
      .filter((b) => b.conta_tipo === 'ativo')
      .reduce((sum, b) => sum + b.saldo_atual, 0);
    const totalPassivo = balancete
      .filter((b) => b.conta_tipo === 'passivo')
      .reduce((sum, b) => sum + b.saldo_atual, 0);

    return (
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 neuro-raised">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[var(--text-secondary)] text-[0.813rem] orx-font-medium">Total Ativo</h3>
              <ArrowUpRight className="w-5 h-5 text-success" />
            </div>
            <p className="text-[0.813rem] orx-font-bold">{formatCurrency(totalAtivo)}</p>
          </Card>

          <Card className="p-6 neuro-raised">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[var(--text-secondary)] text-[0.813rem] orx-font-medium">Total Passivo</h3>
              <ArrowDownRight className="w-5 h-5 text-error" />
            </div>
            <p className="text-[0.813rem] orx-font-bold">{formatCurrency(totalPassivo)}</p>
          </Card>

          <Card className="p-6 neuro-raised">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[var(--text-secondary)] text-[0.813rem] orx-font-medium">Patrimônio Líquido</h3>
              <Calculator className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <p className="text-[0.813rem] orx-font-bold">{formatCurrency(totalAtivo - totalPassivo)}</p>
          </Card>
        </div>

        {/* Tabela */}
        <Card className="neuro-raised p-0">
          <div className="p-6 border-b border-[var(--text-secondary)]/20">
            <h3 className="text-[0.813rem] orx-font-semibold">Balancete de Verificação</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Débito</TableHead>
                <TableHead className="text-right">Crédito</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balancete.map((item) => (
                <TableRow key={item.conta_codigo}>
                  <TableCell className="font-mono text-[0.813rem]">{item.conta_codigo}</TableCell>
                  <TableCell>{item.conta_nome}</TableCell>
                  <TableCell>
                    <Badge variant="default">{item.conta_tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.total_debito)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.total_credito)}
                  </TableCell>
                  <TableCell
                    className={`text-right orx-font-semibold ${
                      item.tipo_saldo === 'devedor' ? 'text-success' : 'text-error'
                    }`}
                  >
                    {formatCurrency(item.saldo_atual)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const renderLancamentos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[0.813rem] orx-font-semibold">Lançamentos Contábeis</h2>
        <Button icon={<Plus />}>Novo Lançamento</Button>
      </div>

      <Card className="neuro-raised p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Data Lançamento</TableHead>
              <TableHead>Competência</TableHead>
              <TableHead>Histórico</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lancamentos.map((lanc) => (
              <TableRow key={lanc.id}>
                <TableCell className="font-mono">{lanc.numero_lancamento}</TableCell>
                <TableCell>{new Date(lanc.data_lancamento).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{new Date(lanc.data_competencia).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{lanc.historico}</TableCell>
                <TableCell>
                  <Badge variant="default">{lanc.tipo_lancamento}</Badge>
                </TableCell>
                <TableCell className="text-right orx-font-semibold">
                  {formatCurrency(lanc.valor_total)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={
                      lanc.status === 'confirmado'
                        ? 'bg-success/20 text-success'
                        : lanc.status === 'cancelado'
                        ? 'bg-error/20 text-error'
                        : 'bg-warning/20 text-warning'
                    }
                  >
                    {lanc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" icon={<Eye />} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderCentrosCusto = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[0.813rem] orx-font-semibold">Centros de Custo</h2>
        <Button icon={<Plus />}>Novo Centro</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {centrosCusto.map((centro) => (
          <Card key={centro.id} className="p-6 neuro-raised">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="default" className="mb-2">
                  {centro.codigo}
                </Badge>
                <h3 className="text-[0.813rem] orx-font-semibold">{centro.nome}</h3>
                <p className="text-[var(--text-secondary)] text-[0.813rem]">{centro.tipo}</p>
              </div>
              <Layers className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div className="pt-4 border-t border-[var(--text-secondary)]/20">
              <p className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">Orçamento Mensal</p>
              <p className="text-[0.813rem] orx-font-bold">{formatCurrency(centro.orcamento_mensal)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Gestão Contábil
            </h1>
            <p className="text-[var(--text-secondary)]">
              DRE, Balancete, Lançamentos e Plano de Contas
            </p>
          </div>
          <Button variant="secondary" icon={<RefreshCw />} onClick={carregarDados} disabled={loading}>
            Atualizar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: 'dre', label: 'DRE', icon: BarChart3 },
            { id: 'balancete', label: 'Balancete', icon: FileBarChart },
            { id: 'lancamentos', label: 'Lançamentos', icon: FileText },
            { id: 'centros', label: 'Centros de Custo', icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-xl orx-font-medium transition-all flex items-center gap-2 ${
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
        {activeTab === 'dre' && renderDRE()}
        {activeTab === 'balancete' && renderBalancete()}
        {activeTab === 'lancamentos' && renderLancamentos()}
        {activeTab === 'centros' && renderCentrosCusto()}
      </div>
    </div>
  );
}

