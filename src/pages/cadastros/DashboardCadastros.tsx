/**
 * Dashboard de Cadastros - ICARUS v5.0
 *
 * Exibe visão geral de todos os cadastros do sistema:
 * - 8 KPIs principais
 * - Gráficos de evolução
 * - Top médicos e hospitais
 * - Alertas e duplicatas
 * - Sugestões de IA
 *
 * Design System: OraclusX DS
 * Neumorphism Premium 3D + Liquid Glass
 *
 * @version 5.0.0
 */

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  RefreshCcw,
  Sparkles,
  Copy,
  ChevronRight,
  User2,
  Building,
  Briefcase,
  Package,
} from 'lucide-react';
import {
  useCadastrosKPIs,
  useAlertasCadastros,
  useDuplicatasDetectadas,
} from '@/hooks/useCadastrosKPIs';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const DashboardCadastros: React.FC = () => {
  const { kpis, loading, error, refresh } = useCadastrosKPIs();
  const { alertas, dismissAlerta } = useAlertasCadastros();
  const { duplicatas, ignoreDuplicata } = useDuplicatasDetectadas();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('medicos');

  const moduleKpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'medicos',
        icon: User2,
        label: 'Total Médicos',
        value: kpis.medicosAtivos?.toLocaleString?.('pt-BR') ?? '—',
        subtitle: 'Cadastros ativos',
        trend: '+3.2%',
        trendPositive: true,
      },
      {
        id: 'hospitais',
        icon: Building,
        label: 'Hospitais',
        value: kpis.hospitaisAtivos?.toLocaleString?.('pt-BR') ?? '—',
        subtitle: 'Rede credenciada',
        trend: '+1.1%',
        trendPositive: true,
      },
      {
        id: 'fornecedores',
        icon: Briefcase,
        label: 'Fornecedores',
        value: kpis.fornecedoresAtivos?.toLocaleString?.('pt-BR') ?? '—',
        subtitle: 'Ativos no mês',
        trend: '+0.8%',
        trendPositive: true,
      },
      {
        id: 'produtos',
        icon: Package,
        label: 'Produtos OPME',
        value: kpis.produtosOPME?.toLocaleString?.('pt-BR') ?? '—',
        subtitle: 'Itens homologados',
        trend: '+4.5%',
        trendPositive: true,
      },
    ],
    [kpis]
  );

  const moduleTabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'medicos', label: 'Médicos', count: kpis.medicosAtivos },
      { id: 'hospitais', label: 'Hospitais', count: kpis.hospitaisAtivos },
      { id: 'fornecedores', label: 'Fornecedores', count: kpis.fornecedoresAtivos },
      { id: 'produtos', label: 'Produtos OPME', count: kpis.produtosOPME },
    ],
    [kpis]
  );

  const filteredDuplicatas = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return duplicatas;
    return duplicatas.filter((duplicata) => duplicata.nome.toLowerCase().includes(term));
  }, [duplicatas, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCcw className="w-12 h-12 animate-spin mx-auto mb-4 text-[var(--orx-primary)]" />
          <p className="text-[var(--orx-text-primary)]">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-[var(--orx-error)]" />
          <p className="text-[var(--orx-text-primary)]">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-6 py-2 rounded-lg inline-flex items-center gap-2 bg-[var(--orx-primary)] text-white"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ModulePageNeumo
      title="Cadastros Inteligentes"
      subtitle="Visão geral de todos os cadastros do sistema ICARUS"
      kpis={moduleKpis}
      tabs={moduleTabs}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Buscar médicos, hospitais, convênios..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros avançados em desenvolvimento')}
      primaryActionLabel="Atualizar KPIs"
      onPrimaryAction={refresh}
    >
      <div className="space-y-6">
        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('qa') === '1' && (
            <form
              aria-label="Filtros QA Cadastros"
              className="bg-[var(--orx-bg-light)] rounded-2xl p-4 shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] grid [grid-template-columns:1.2fr_0.8fr_0.8fr_0.6fr] gap-3 items-end"
            >
              <div>
                <label
                  htmlFor="qa-busca-cad"
                  className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                >
                  Busca
                </label>
                <input
                  id="qa-busca-cad"
                  name="busca"
                  placeholder="Nome, CRM, hospital"
                  className="w-full px-3 py-2 rounded-xl"
                />
              </div>
              <div>
                <label
                  htmlFor="qa-cad-inicio"
                  className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                >
                  Início
                </label>
                <input
                  id="qa-cad-inicio"
                  name="inicio"
                  type="date"
                  className="w-full px-3 py-2 rounded-xl"
                />
              </div>
              <div>
                <label
                  htmlFor="qa-cad-fim"
                  className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                >
                  Fim
                </label>
                <input
                  id="qa-cad-fim"
                  name="fim"
                  type="date"
                  className="w-full px-3 py-2 rounded-xl"
                />
              </div>
              <div>
                <label
                  htmlFor="qa-cad-status"
                  className="text-[0.75rem] text-[var(--orx-text-secondary)]"
                >
                  Status
                </label>
                <select id="qa-cad-status" name="status" className="w-full px-3 py-2 rounded-xl">
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="[grid-column:1/-1] flex gap-2">
                <Button type="submit" variant="primary" className="px-3 py-2 rounded-xl">
                  Aplicar
                </Button>
                <Button type="button" variant="ghost" className="px-3 py-2 rounded-xl">
                  Limpar
                </Button>
              </div>
            </form>
          )}

        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('qa') === '1' && (
            <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-4 rounded-2xl">
              <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-3">
                Cadastros (QA)
              </h2>
              <div className="overflow-x-auto">
                <table role="table" className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i}>
                        <td className="p-2">CAD-{100 + i}</td>
                        <td className="p-2">Registro {i}</td>
                        <td className="p-2">{i % 2 === 0 ? 'Médico' : 'Hospital'}</td>
                        <td className="p-2">{i % 3 === 0 ? 'Inativo' : 'Ativo'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 mt-3">
                <Button  type="button" variant="ghost">
                  Anterior
                </Button>
                <Button  type="button" variant="ghost">
                  Próximo
                </Button>
              </div>
            </div>
          )}
        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('qa') === '1' && (
            <div role="toolbar" aria-label="QA Actions" className="flex gap-2 flex-nowrap">
              {['Novo', 'Editar', 'Exportar', 'Ajuda', 'Atalhos', 'Preferências'].map((label) => (
                <Button
                  
                  key={label}
                  type="button"
                  variant="ghost"
                  data-qa-button="true"
                  onClick={(e) => e.preventDefault()}
                  aria-label={`QA ${label}`}
                >
                  <span className="px-2 py-1 text-[0.75rem] leading-none whitespace-nowrap">
                    {label}
                  </span>
                </Button>
              ))}
            </div>
          )}

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)]">
                Alertas de Cadastros
              </h2>
            </div>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-inner)] p-4 rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle
                    size={20}
                    className={`${alerta.tipo === 'error' ? 'text-[var(--orx-error)]' : alerta.tipo === 'warning' ? 'text-[var(--orx-warning)]' : 'text-[var(--orx-info)]'} shrink-0`}
                  />
                  <div className="flex-1">
                    <h3 className="orx-orx-font-semibold text-[var(--orx-text-primary)] mb-1">
                      {alerta.titulo}
                    </h3>
                    <p className="text-[var(--orx-text-secondary)] text-[0.813rem]">
                      {alerta.descricao}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlerta(alerta.id)}
                    className="text-[var(--orx-text-muted)] p-1 cursor-pointer rounded hover:bg-[var(--orx-bg-light)]"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicatas Detectadas */}
        {filteredDuplicatas.length > 0 && (
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Copy size={24} className="text-[var(--orx-primary)]" />
              <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)]">
                Possíveis Duplicatas Detectadas
              </h2>
            </div>
            <div className="space-y-3">
              {filteredDuplicatas.map((duplicata) => (
                <div
                  key={duplicata.id}
                  className="bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-inner)] p-4 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="orx-orx-font-semibold text-[var(--orx-text-primary)] mb-1">
                      {duplicata.nome}
                    </h3>
                    <p className="text-[var(--orx-text-secondary)] text-[0.813rem]">
                      {duplicata.motivo} - Score: {duplicata.score}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      
                      onClick={() => ignoreDuplicata(duplicata.id)}
                      variant="ghost"
                    >
                      Ignorar
                    </Button>
                    <Button  variant="primary" aria-label="Revisar duplicata">
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução de Cadastros */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-4">
              Evolução de Cadastros - 12 Meses
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpis.evolucaoCadastros}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--orx-border)" />
                <XAxis dataKey="mes" stroke="var(--orx-text-secondary)" tick={{ fontSize: 13 }} />
                <YAxis stroke="var(--orx-text-secondary)" tick={{ fontSize: 13 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="medicos"
                  stroke="var(--orx-primary)"
                  strokeWidth={2}
                  name="Médicos"
                />
                <Line
                  type="monotone"
                  dataKey="hospitais"
                  stroke="var(--orx-pink-500)"
                  strokeWidth={2}
                  name="Hospitais"
                />
                <Line
                  type="monotone"
                  dataKey="pacientes"
                  stroke="var(--orx-purple-500)"
                  strokeWidth={2}
                  name="Pacientes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Médicos */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-4">
              Top 10 Médicos (Cirurgias)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.topMedicos.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--orx-border)" />
                <XAxis type="number" stroke="var(--orx-text-secondary)" tick={{ fontSize: 13 }} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={150}
                  stroke="var(--orx-text-secondary)"
                  tick={{ fontSize: 13 }}
                />
                <Tooltip />
                <Bar dataKey="cirurgias" fill="var(--orx-primary)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Hospitais */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-4">
              Top 10 Hospitais (Faturamento)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.topHospitais.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--orx-border)" />
                <XAxis
                  type="number"
                  stroke="var(--orx-text-secondary)"
                  tick={{ fontSize: 13 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={150}
                  stroke="var(--orx-text-secondary)"
                  tick={{ fontSize: 13 }}
                />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="faturamento" fill="var(--orx-pink-500)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Produtos por Categoria */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-4">
              Produtos OPME por Categoria
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={kpis.produtosPorCategoria as Array<{ categoria: string; quantidade: number; valor: number }>}
                  dataKey="quantidade"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {kpis.produtosPorCategoria.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sugestões de IA */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={24} className="text-[var(--orx-primary)]" />
            <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)]">
              Sugestões de Atualização (IA)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SugestaoCard
              titulo="Atualizar dados de médicos"
              descricao="12 médicos com dados desatualizados há mais de 6 meses"
              acao="Revisar"
            />
            <SugestaoCard
              titulo="Verificar fornecedores inativos"
              descricao="5 fornecedores sem movimentação nos últimos 90 dias"
              acao="Verificar"
            />
            <SugestaoCard
              titulo="Completar cadastros"
              descricao="8 cadastros com campos obrigatórios pendentes"
              acao="Completar"
            />
          </div>
        </div>
      </div>
    </ModulePageNeumo>
  );
};

// ========================================
// COMPONENTES AUXILIARES
// ========================================

// KPICardProps not used

// KPICard component removed

interface SugestaoCardProps {
  titulo: string;
  descricao: string;
  acao: string;
}

const SugestaoCard: React.FC<SugestaoCardProps> = ({ titulo, descricao, acao }) => {
  return (
    <div className="bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-inner)] p-5 rounded-xl">
      <h3 className="orx-orx-font-semibold text-[var(--orx-text-primary)] mb-2">{titulo}</h3>
      <p className="text-[var(--orx-text-secondary)] text-[0.813rem] mb-4">{descricao}</p>
      <Button
        
        className="w-full flex items-center justify-center gap-2"
        variant="ghost"
      >
        <span>{acao}</span>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

// Cores para o gráfico de pizza
const COLORS = [
  'var(--orx-primary)',
  'var(--orx-pink-500)',
  'var(--orx-purple-500)',
  'var(--orx-teal-500)',
  'var(--orx-warning)',
  'var(--orx-gray-500)',
];

export default DashboardCadastros;
