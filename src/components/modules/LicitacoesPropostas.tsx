/**
 * Componente: Licitações e Propostas
 * 
 * Sistema completo de gestão de licitações hospitalares
 * Pregões eletrônicos, cotações privadas, propostas comerciais
 * 
 * FUNCIONALIDADES:
 * - Cadastro de licitações (públicas/privadas)
 * - Elaboração de propostas comerciais
 * - Análise de viabilidade (margem)
 * - Aprovação em 3 níveis (comercial/financeiro/diretoria)
 * - Timeline de eventos
 * - Documentos anexos (editais, contratos)
 * - Dashboard de licitações ativas
 * - Taxa de sucesso
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
  Textarea,
  Select,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  Progress,
} from '@/components/oraclusx-ds';
import {
  FileText,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Eye,
  Send,
  Download,
  RefreshCw,
  Building2,
  FileCheck,
  Calendar,
  DollarSign,
  Target,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Upload,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatNumber, formatDate, formatPercent } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface Licitacao {
  id: string;
  numero_edital: string;
  titulo: string;
  tipo: string;
  modalidade: string;
  orgao_comprador_nome: string;
  orgao_comprador_uf: string;
  data_abertura: string;
  valor_estimado: number;
  status: string;
  responsavel_email?: string;
  dias_para_abertura?: number;
  total_propostas?: number;
}

interface Proposta {
  id: string;
  numero_proposta: string;
  valor_total: number;
  margem_bruta_percentual: number;
  margem_liquida_percentual: number;
  status: string;
  aprovada_comercial: boolean;
  aprovada_financeiro: boolean;
  aprovada_diretoria: boolean;
  licitacao_titulo: string;
  orgao_comprador_nome: string;
  dias_para_abertura: number;
}

interface TaxaSucesso {
  total_participadas: number;
  total_vencidas: number;
  total_perdidas: number;
  taxa_sucesso: number;
  valor_total_vencido: number;
  valor_total_perdido: number;
}

const TIPO_LICITACAO = {
  pregao_eletronico: { label: 'Pregão Eletrônico', color: 'text-blue-600' },
  pregao_presencial: { label: 'Pregão Presencial', color: 'text-purple-600' },
  concorrencia: { label: 'Concorrência', color: 'text-orange-600' },
  cotacao_privada: { label: 'Cotação Privada', color: 'text-green-600' },
  dispensa: { label: 'Dispensa', color: 'text-gray-600' },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any }> = {
  publicada: { bg: 'bg-blue-500/20', text: 'text-blue-600', icon: FileText },
  em_elaboracao: { bg: 'bg-yellow-500/20', text: 'text-yellow-600', icon: Clock },
  enviada: { bg: 'bg-purple-500/20', text: 'text-purple-600', icon: Send },
  em_analise: { bg: 'bg-orange-500/20', text: 'text-orange-600', icon: AlertTriangle },
  vencida: { bg: 'bg-success/20', text: 'text-success', icon: Award },
  perdida: { bg: 'bg-error/20', text: 'text-error', icon: XCircle },
  cancelada: { bg: 'bg-gray-500/20', text: 'text-gray-600', icon: XCircle },
};

export default function LicitacoesPropostas() {
  useDocumentTitle('Licitações e Propostas');
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'licitacoes' | 'propostas' | 'dashboard'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [taxaSucesso, setTaxaSucesso] = useState<TaxaSucesso | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarLicitacoes(),
        carregarPropostas(),
        carregarTaxaSucesso(),
      ]);
    } catch (error: unknown) {
      addToast(`Erro ao carregar dados: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarLicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_licitacoes_ativas')
        .select('*')
        .order('data_abertura');

      if (error) throw error;
      setLicitacoes(data || []);
    } catch (_error) {
      console.error('Erro ao carregar licitações:', error);
      // Mock data
      setLicitacoes([
        {
          id: '1',
          numero_edital: 'PE 2025/001',
          titulo: 'Aquisição de OPME Cardiovascular',
          tipo: 'pregao_eletronico',
          modalidade: 'menor_preco',
          orgao_comprador_nome: 'Hospital Municipal São José',
          orgao_comprador_uf: 'SP',
          data_abertura: new Date(Date.now() + 7 * 86400000).toISOString(),
          valor_estimado: 500000,
          status: 'em_elaboracao',
          dias_para_abertura: 7,
          total_propostas: 1,
        },
        {
          id: '2',
          numero_edital: 'COT-2025-045',
          titulo: 'Stents Coronarianos',
          tipo: 'cotacao_privada',
          modalidade: 'menor_preco',
          orgao_comprador_nome: 'Hospital Santa Clara',
          orgao_comprador_uf: 'RJ',
          data_abertura: new Date(Date.now() + 3 * 86400000).toISOString(),
          valor_estimado: 320000,
          status: 'enviada',
          dias_para_abertura: 3,
          total_propostas: 1,
        },
      ]);
    }
  };

  const carregarPropostas = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_propostas_pendentes')
        .select('*')
        .order('dias_para_abertura');

      if (error) throw error;
      setPropostas(data || []);
    } catch (_error) {
      console.error('Erro ao carregar propostas:', error);
      // Mock data
      setPropostas([
        {
          id: '1',
          numero_proposta: 'PROP-2025-001',
          valor_total: 480000,
          margem_bruta_percentual: 25,
          margem_liquida_percentual: 12,
          status: 'em_analise',
          aprovada_comercial: true,
          aprovada_financeiro: true,
          aprovada_diretoria: false,
          licitacao_titulo: 'Aquisição de OPME Cardiovascular',
          orgao_comprador_nome: 'Hospital Municipal São José',
          dias_para_abertura: 7,
        },
      ]);
    }
  };

  const carregarTaxaSucesso = async () => {
    try {
      const { data, error } = await supabase.rpc('calcular_taxa_sucesso_licitacoes', {
        p_data_inicio: new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0],
        p_data_fim: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;
      setTaxaSucesso(data[0] || null);
    } catch (_error) {
      console.error('Erro ao carregar taxa de sucesso:', error);
      // Mock data
      setTaxaSucesso({
        total_participadas: 45,
        total_vencidas: 23,
        total_perdidas: 22,
        taxa_sucesso: 51.11,
        valor_total_vencido: 8500000,
        valor_total_perdido: 6200000,
      });
    }
  };

  const handleAprovar = async (propostaId: string, nivel: 'comercial' | 'financeiro' | 'diretoria') => {
    setLoading(true);
    try {
      const campo = `aprovada_${nivel}`;
      const { error } = await supabase
        .from('propostas_comerciais')
        .update({ [campo]: true })
        .eq('id', propostaId);

      if (error) throw error;
      addToast(`Proposta aprovada pelo ${nivel}!`, 'success');
      await carregarPropostas();
    } catch (error: unknown) {
      addToast(`Erro ao aprovar: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    const licitacoesAbertas = licitacoes.length;
    const propostasPendentes = propostas.filter(
      (p) => !p.aprovada_comercial || !p.aprovada_financeiro || !p.aprovada_diretoria
    ).length;

    // Dados para o gráfico de pizza
    const chartData = [
      { name: 'Vencidas', value: taxaSucesso?.total_vencidas || 0, color: 'var(--orx-success)' },
      { name: 'Perdidas', value: taxaSucesso?.total_perdidas || 0, color: 'var(--orx-error)' },
    ];

    return (
      <div className="space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 neuro-raised bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90" style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Licitações Ativas</h3>
              <FileText className="w-5 h-5 opacity-80" />
            </div>
            <p className style={{  fontSize: '0.813rem' , fontWeight: 700 }}>{licitacoesAbertas}</p>
            <p className="opacity-80 mt-2" style={{ fontSize: '0.813rem' }}>Participando ativamente</p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90" style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Propostas Pendentes</h3>
              <Clock className="w-5 h-5 opacity-80" />
            </div>
            <p className style={{  fontSize: '0.813rem' , fontWeight: 700 }}>{propostasPendentes}</p>
            <p className="opacity-80 mt-2" style={{ fontSize: '0.813rem' }}>Aguardando aprovação</p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90" style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Taxa de Sucesso</h3>
              <Target className="w-5 h-5 opacity-80" />
            </div>
            <p className style={{  fontSize: '0.813rem' , fontWeight: 700 }}>{taxaSucesso?.taxa_sucesso.toFixed(1)}%</p>
            <p className="opacity-80 mt-2" style={{ fontSize: '0.813rem' }}>
              {taxaSucesso?.total_vencidas} de {taxaSucesso?.total_participadas} licitações
            </p>
          </Card>

          <Card className="p-6 neuro-raised bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="opacity-90" style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Valor Vencido (Ano)</h3>
              <Award className="w-5 h-5 opacity-80" />
            </div>
            <p className style={{  fontSize: '0.813rem' , fontWeight: 700 }}>
              {formatCurrency(taxaSucesso?.valor_total_vencido || 0)}
            </p>
            <p className="opacity-80 mt-2" style={{ fontSize: '0.813rem' }}>Contratos ganhos</p>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Sucesso */}
          <Card className="p-6 neuro-raised">
            <h3 className="mb-4" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>Performance (Últimos 12 meses)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--text-secondary)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => `${value} licitações`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className style={{ fontSize: '0.813rem' }}>Vencidas ({taxaSucesso?.total_vencidas})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className style={{ fontSize: '0.813rem' }}>Perdidas ({taxaSucesso?.total_perdidas})</span>
              </div>
            </div>
          </Card>

          {/* Próximas Aberturas */}
          <Card className="p-6 neuro-raised">
            <h3 className="mb-4" style={{  fontSize: '0.813rem' , fontWeight: 600 }}>Próximas Aberturas</h3>
            <div className="space-y-3">
              {licitacoes.slice(0, 5).map((lic) => (
                <div
                  key={lic.id}
                  className="p-4 neuro-flat rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className style={{  fontSize: '0.813rem' , fontWeight: 600 }}>{lic.titulo}</p>
                    <p className="text-[var(--text-secondary)] mt-1" style={{ fontSize: '0.813rem' }}>
                      {lic.orgao_comprador_nome} - {lic.orgao_comprador_uf}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="default"
                      className={
                        (lic.dias_para_abertura || 0) <= 3
                          ? 'bg-error/20 text-error'
                          : 'bg-warning/20 text-warning'
                      }
                    >
                      {lic.dias_para_abertura} dias
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderLicitacoes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className style={{  fontSize: '0.813rem' , fontWeight: 600 }}>Licitações Ativas</h2>
        <Button icon={<Plus />}>Nova Licitação</Button>
      </div>

      <Card className="neuro-raised p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Edital</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Abertura</TableHead>
              <TableHead className="text-right">Valor Estimado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licitacoes.map((lic) => {
              const statusConfig = STATUS_CONFIG[lic.status];
              const StatusIcon = statusConfig.icon;
              const tipoConfig = TIPO_LICITACAO[lic.tipo as keyof typeof TIPO_LICITACAO];

              return (
                <TableRow key={lic.id}>
                  <TableCell className="font-mono" style={{ fontSize: '0.813rem' }}>{lic.numero_edital}</TableCell>
                  <TableCell>
                    <div>
                      <p className style={{ fontWeight: 500 }}>{lic.titulo}</p>
                      {(lic.dias_para_abertura || 0) <= 7 && (
                        <Badge variant="default" className="bg-warning/20 text-warning mt-1" style={{ fontSize: '0.813rem' }}>
                          <Timer className="w-3 h-3 mr-1" />
                          {lic.dias_para_abertura} dias
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className={tipoConfig?.color}>
                      {tipoConfig?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
                      <div>
                        <p className style={{ fontSize: '0.813rem' }}>{lic.orgao_comprador_nome}</p>
                        <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>{lic.orgao_comprador_uf}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(lic.data_abertura).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right" style={{ fontWeight: 600 }}>
                    {formatCurrency(lic.valor_estimado)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className={`${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {lic.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" icon={<Eye />} />
                          </TooltipTrigger>
                          <TooltipContent>Ver Detalhes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" icon={<FileCheck />} />
                          </TooltipTrigger>
                          <TooltipContent>Elaborar Proposta</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderPropostas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className style={{  fontSize: '0.813rem' , fontWeight: 600 }}>Propostas Pendentes de Aprovação</h2>
      </div>

      <div className="space-y-4">
        {propostas.map((prop) => (
          <Card key={prop.id} className="p-6 neuro-raised">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileCheck className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className style={{  fontSize: '0.813rem' , fontWeight: 600 }}>{prop.numero_proposta}</h3>
                  <Badge
                    variant="default"
                    className={
                      prop.dias_para_abertura <= 3
                        ? 'bg-error/20 text-error'
                        : 'bg-warning/20 text-warning'
                    }
                  >
                    Abre em {prop.dias_para_abertura} dias
                  </Badge>
                </div>
                <p className="text-[var(--text-secondary)] mb-1" style={{ fontSize: '0.813rem' }}>
                  {prop.licitacao_titulo}
                </p>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
                  {prop.orgao_comprador_nome}
                </p>
              </div>
              <div className="text-right">
                <p className style={{  fontSize: '0.813rem' , fontWeight: 700 }}>{formatCurrency(prop.valor_total)}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="default" className="bg-success/20 text-success">
                    MB: {prop.margem_bruta_percentual}%
                  </Badge>
                  <Badge variant="default" className="bg-[var(--primary)]/20 text-[var(--primary)]">
                    ML: {prop.margem_liquida_percentual}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Aprovações */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--text-secondary)]/20">
              <div
                className={`p-4 rounded-lg ${
                  prop.aprovada_comercial
                    ? 'bg-success/10 border-2 border-success'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Comercial</p>
                  {prop.aprovada_comercial ? (
                    <ThumbsUp className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
                  )}
                </div>
                {!prop.aprovada_comercial && (
                  <Button
                    size="sm"
                    onClick={() => handleAprovar(prop.id, 'comercial')}
                    className="w-full"
                  >
                    Aprovar
                  </Button>
                )}
              </div>

              <div
                className={`p-4 rounded-lg ${
                  prop.aprovada_financeiro
                    ? 'bg-success/10 border-2 border-success'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Financeiro</p>
                  {prop.aprovada_financeiro ? (
                    <ThumbsUp className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
                  )}
                </div>
                {!prop.aprovada_financeiro && prop.aprovada_comercial && (
                  <Button
                    size="sm"
                    onClick={() => handleAprovar(prop.id, 'financeiro')}
                    className="w-full"
                  >
                    Aprovar
                  </Button>
                )}
              </div>

              <div
                className={`p-4 rounded-lg ${
                  prop.aprovada_diretoria
                    ? 'bg-success/10 border-2 border-success'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Diretoria</p>
                  {prop.aprovada_diretoria ? (
                    <ThumbsUp className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
                  )}
                </div>
                {!prop.aprovada_diretoria && prop.aprovada_comercial && prop.aprovada_financeiro && (
                  <Button
                    size="sm"
                    onClick={() => handleAprovar(prop.id, 'diretoria')}
                    className="w-full"
                  >
                    Aprovar
                  </Button>
                )}
              </div>
            </div>

            {/* Progresso */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className style={{  fontSize: '0.813rem' , fontWeight: 500 }}>Progresso de Aprovação</p>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
                  {[prop.aprovada_comercial, prop.aprovada_financeiro, prop.aprovada_diretoria].filter(
                    Boolean
                  ).length}{' '}
                  / 3
                </p>
              </div>
              <Progress
                value={
                  ([prop.aprovada_comercial, prop.aprovada_financeiro, prop.aprovada_diretoria].filter(
                    Boolean
                  ).length /
                    3) *
                  100
                }
              />
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
              Licitações e Propostas
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gestão completa de licitações hospitalares e propostas comerciais
            </p>
          </div>
          <Button variant="secondary" icon={<RefreshCw />} onClick={carregarDados} disabled={loading}>
            Atualizar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Target },
            { id: 'licitacoes', label: 'Licitações', icon: FileText },
            { id: 'propostas', label: 'Propostas', icon: FileCheck },
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
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'licitacoes' && renderLicitacoes()}
        {activeTab === 'propostas' && renderPropostas()}
      </div>
    </div>
  );
}

