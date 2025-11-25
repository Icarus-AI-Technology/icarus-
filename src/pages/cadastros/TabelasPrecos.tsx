/**
 * Tabelas de Preços OPME - ICARUS v5.0
 *
 * Gerenciamento completo de tabelas de preços para distribuidoras OPME:
 * - Tabelas por fabricante/distribuidor/hospital/convênio
 * - Preços escalonados por quantidade
 * - Histórico de alterações
 * - Duplicação e reajustes em massa
 * - Exportação para CSV
 *
 * Design System: OraclusX DS
 * Neumorphism Premium 3D + Liquid Glass
 *
 * @version 5.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  Building2,
  Heart,
  Download,
  Edit,
  Eye,
  Plus,
  Search,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Percent,
  Package,
  Users,
  FileBarChart,
} from 'lucide-react';
import { tabelasPrecosService, TabelaPreco } from '@/lib/services/TabelasPrecosService';
import { Button } from '@/components/oraclusx-ds/Button';
import { Input } from '@/components/oraclusx-ds/Input';
import { Select } from '@/components/oraclusx-ds/Select';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const TabelasPrecos: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [loading, setLoading] = useState(true);
  const [tabelas, setTabelas] = useState<TabelaPreco[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [_totalCount, setTotalCount] = useState(0);

  // Carregar tabelas
  const carregarTabelas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await tabelasPrecosService.listarTabelas({
        tipo: filterTipo !== 'todos' ? filterTipo : undefined,
        status: filterStatus !== 'todos' ? filterStatus : undefined,
        busca: searchQuery || undefined,
      });

      setTabelas(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error as Error);
    } finally {
      setLoading(false);
    }
  }, [filterTipo, filterStatus, searchQuery]);

  useEffect(() => {
    carregarTabelas();
  }, [carregarTabelas]);

  // Filtrar tabelas localmente
  const tabelasFiltradas = tabelas.filter((tabela) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      tabela.nome.toLowerCase().includes(search) ||
      tabela.codigo?.toLowerCase().includes(search) ||
      tabela.descricao?.toLowerCase().includes(search)
    );
  });

  // KPIs
  const kpis = {
    tabelasAtivas: tabelas.filter((t) => t.status === 'ativa').length,
    tabelasHospitais: tabelas.filter((t) => t.tipo === 'hospital').length,
    tabelasConvenios: tabelas.filter((t) => t.tipo === 'convenio').length,
    valorTotalMedio:
      tabelas.length > 0
        ? tabelas.reduce((sum, t) => sum + (t.valor_total_estimado || 0), 0) / tabelas.length
        : 0,
  };

  // Handlers
  const handleExportar = async (tabelaId: string, tabelaNome: string) => {
    try {
      const csv = await tabelasPrecosService.exportarTabela(tabelaId);
      if (csv) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${tabelaNome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao exportar tabela:', err);
    }
  };

  const handleDuplicar = async (tabelaId: string, tabelaNome: string) => {
    try {
      const novoNome = `${tabelaNome} - Cópia`;
      await tabelasPrecosService.duplicarTabela(tabelaId, novoNome);
      carregarTabelas();
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao duplicar tabela:', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.5rem] font-bold text-[var(--orx-text-primary)] mb-2">
            Tabelas de Preços OPME
          </h1>
          <p className="text-[var(--orx-text-secondary)] text-[0.938rem]">
            Gerenciamento de preços por fabricante, hospital e convênio
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => carregarTabelas()}
            title="Atualizar"
            className="flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            <span>Atualizar</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/cadastros/tabelas-precos/nova')}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Nova Tabela</span>
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Tabelas Ativas"
          value={kpis.tabelasAtivas}
          icon={<CheckCircle size={24} />}
          bgClass="bg-[var(--orx-success)]/15"
          textClass="text-[var(--orx-success)]"
        />
        <KPICard
          label="Tabelas Hospitais"
          value={kpis.tabelasHospitais}
          icon={<Building2 size={24} />}
          bgClass="bg-[var(--orx-primary)]/15"
          textClass="text-[var(--orx-primary)]"
        />
        <KPICard
          label="Tabelas Convênios"
          value={kpis.tabelasConvenios}
          icon={<Heart size={24} />}
          bgClass="bg-[var(--orx-pink-500)]/15"
          textClass="text-[var(--orx-pink-500)]"
        />
        <KPICard
          label="Valor Médio"
          value={`R$ ${kpis.valorTotalMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} />}
          bgClass="bg-[var(--orx-teal-500)]/15"
          textClass="text-[var(--orx-teal-500)]"
        />
      </div>

      {/* Filtros e Busca */}
      <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--orx-text-secondary)]"
              />
              <Input
                variant="neumo"
                className="pl-10"
                placeholder="Buscar por nome, código ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && carregarTabelas()}
              />
            </div>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <Select
              value={filterTipo}
              onValueChange={(value) => setFilterTipo(value ?? filterTipo)}
              options={[
                { value: 'todos', label: 'Todos os Tipos' },
                { value: 'fabricante', label: 'Fabricante' },
                { value: 'distribuidor', label: 'Distribuidor' },
                { value: 'hospital', label: 'Hospital' },
                { value: 'convenio', label: 'Convênio' },
                { value: 'contrato', label: 'Contrato' },
                { value: 'promocional', label: 'Promocional' },
                { value: 'licitacao', label: 'Licitação' },
              ]}
            />
          </div>

          {/* Filtro de Status */}
          <div>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value ?? filterStatus)}
              options={[
                { value: 'todos', label: 'Todos os Status' },
                { value: 'ativa', label: 'Ativa' },
                { value: 'inativa', label: 'Inativa' },
                { value: 'em_revisao', label: 'Em Revisão' },
                { value: 'expirada', label: 'Expirada' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCcw size={48} className="mx-auto mb-4 text-[var(--orx-primary)] animate-spin" />
            <p className="text-[var(--orx-text-secondary)]">Carregando tabelas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--orx-bg-light)] border-b border-[var(--orx-border)]">
                  <th className="p-4 text-left text-[var(--orx-text-primary)] font-semibold text-[0.813rem]">
                    Nome da Tabela
                  </th>
                  <th className="p-4 text-left text-[var(--orx-text-primary)] font-semibold text-[0.813rem]">
                    Tipo
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] font-semibold text-[0.813rem]">
                    Itens
                  </th>
                  <th className="p-4 text-right text-[var(--orx-text-primary)] font-semibold text-[0.813rem]">
                    Valor Total
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] font-semibold text-[0.813rem]">
                    Vigência
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] font-semibold text-[0.813rem]">
                    Status
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] font-semibold text-[0.813rem]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabelasFiltradas.map((tabela) => (
                  <tr
                    key={tabela.id}
                    className="border-b border-[var(--orx-border)] transition-colors hover:bg-[rgba(99,102,241,0.05)] cursor-pointer"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-[var(--orx-text-primary)] font-medium text-[0.875rem]">
                          {tabela.nome}
                        </p>
                        {tabela.codigo && (
                          <p className="text-[var(--orx-text-secondary)] text-[0.813rem] mt-1">
                            Código: {tabela.codigo}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <TipoTabelaBadge tipo={tabela.tipo} />
                    </td>
                    <td className="p-4 text-center text-[var(--orx-text-primary)] font-medium text-[0.875rem]">
                      {tabela.total_itens || 0}
                    </td>
                    <td className="p-4 text-right text-[var(--orx-text-primary)] font-semibold text-[0.875rem]">
                      R${' '}
                      {(tabela.valor_total_estimado || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-4 text-center text-[var(--orx-text-secondary)] text-[0.813rem]">
                      {new Date(tabela.data_inicio).toLocaleDateString('pt-BR')}
                      {tabela.data_fim && (
                        <>
                          <br />
                          até {new Date(tabela.data_fim).toLocaleDateString('pt-BR')}
                        </>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={tabela.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/cadastros/tabelas-precos/${tabela.id}`)}
                          title="Visualizar"
                          className="p-2"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/cadastros/tabelas-precos/${tabela.id}/editar`)}
                          title="Editar"
                          className="p-2"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicar(tabela.id, tabela.nome)}
                          title="Duplicar"
                          className="p-2"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportar(tabela.id, tabela.nome)}
                          title="Exportar CSV"
                          className="p-2"
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tabelasFiltradas.length === 0 && !loading && (
              <div className="p-12 text-center">
                <AlertTriangle
                  size={48}
                  className="mx-auto mb-4 text-[var(--orx-text-secondary)]"
                />
                <p className="text-[var(--orx-text-primary)] font-medium">
                  Nenhuma tabela encontrada
                </p>
                <p className="text-[var(--orx-text-secondary)] text-[0.813rem] mt-2">
                  Tente ajustar os filtros ou crie uma nova tabela de preços
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informações Importantes */}
      <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)]">
        <div className="flex gap-3 items-start">
          <AlertTriangle size={20} className="text-[var(--orx-info)] shrink-0 mt-[2px]" />
          <div>
            <h3 className="font-semibold text-[var(--orx-text-primary)] mb-2 text-[0.938rem]">
              Sobre Tabelas de Preços OPME
            </h3>
            <ul className="text-[var(--orx-text-secondary)] text-[0.813rem] leading-6 pl-5 list-disc">
              <li>
                <strong>Fabricante</strong>: Preços de fábrica/custo base fornecidos pelos
                fabricantes
              </li>
              <li>
                <strong>Distribuidor</strong>: Tabela padrão com margem de distribuição aplicada
              </li>
              <li>
                <strong>Hospital</strong>: Preços negociados especificamente com cada hospital
              </li>
              <li>
                <strong>Convênio</strong>: Tabelas acordadas com planos de saúde e seguradoras
              </li>
              <li>
                <strong>Contrato</strong>: Baseadas em contratos formais de fornecimento
              </li>
              <li>
                <strong>Licitação</strong>: Preços para participação em licitações públicas
              </li>
              <li>• Preços podem ter escalonamento por quantidade (descontos progressivos)</li>
              <li>• Todo histórico de alterações é registrado para auditoria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPONENTES AUXILIARES
// ========================================

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, bgClass, textClass }) => {
  return (
    <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${bgClass} ${textClass}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[var(--orx-text-secondary)] text-[0.813rem] mb-1">{label}</p>
        <p className="text-[var(--orx-text-primary)] text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: 'ativa' | 'inativa' | 'em_revisao' | 'expirada';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    ativa: { label: 'Ativa', icon: <CheckCircle size={14} /> },
    inativa: { label: 'Inativa', icon: <Clock size={14} /> },
    em_revisao: { label: 'Em Revisão', icon: <Edit size={14} /> },
    expirada: { label: 'Expirada', icon: <AlertTriangle size={14} /> },
  };

  const { label, icon } = config[status];

  const statusClasses = {
    ativa: 'bg-green-50 text-green-700 border-green-200',
    inativa: 'bg-gray-50 text-gray-600 border-gray-200',
    em_revisao: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    expirada: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.813rem] font-medium border ${statusClasses[status]}`}
    >
      {icon}
      {label}
    </span>
  );
};

interface TipoTabelaBadgeProps {
  tipo:
    | 'fabricante'
    | 'distribuidor'
    | 'hospital'
    | 'convenio'
    | 'contrato'
    | 'promocional'
    | 'licitacao';
}

const TipoTabelaBadge: React.FC<TipoTabelaBadgeProps> = ({ tipo }) => {
  const config = {
    fabricante: { label: 'Fabricante', icon: <Package size={14} /> },
    distribuidor: { label: 'Distribuidor', icon: <Users size={14} /> },
    hospital: { label: 'Hospital', icon: <Building2 size={14} /> },
    convenio: { label: 'Convênio', icon: <Heart size={14} /> },
    contrato: { label: 'Contrato', icon: <FileText size={14} /> },
    promocional: { label: 'Promocional', icon: <Percent size={14} /> },
    licitacao: { label: 'Licitação', icon: <FileBarChart size={14} /> },
  };

  const { label, icon } = config[tipo];

  const tipoClasses = {
    fabricante: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    distribuidor: 'bg-blue-50 text-blue-700 border-blue-200',
    hospital: 'bg-teal-50 text-teal-700 border-teal-200',
    convenio: 'bg-pink-50 text-pink-700 border-pink-200',
    contrato: 'bg-purple-50 text-purple-700 border-purple-200',
    promocional: 'bg-orange-50 text-orange-700 border-orange-200',
    licitacao: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.813rem] font-medium border ${tipoClasses[tipo]}`}
    >
      {icon}
      {label}
    </span>
  );
};

export default TabelasPrecos;
