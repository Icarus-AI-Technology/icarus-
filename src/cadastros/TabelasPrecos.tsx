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
import { DollarSign, FileText, Building2, Heart, Download, Edit, Eye, Plus, Search, RefreshCcw, AlertTriangle, CheckCircle, Clock, Copy, Percent, Package, Users, FileBarChart } from 'lucide-react';
import { tabelasPrecosService, TabelaPreco } from '@/lib/services/TabelasPrecosService';

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
  const tabelasFiltradas = tabelas.filter(tabela => {
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
    tabelasAtivas: tabelas.filter(t => t.status === 'ativa').length,
    tabelasHospitais: tabelas.filter(t => t.tipo === 'hospital').length,
    tabelasConvenios: tabelas.filter(t => t.tipo === 'convenio').length,
    valorTotalMedio: tabelas.length > 0 
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
          <h1 className="orx-text-3xl orx-font-bold text-[var(--orx-text-primary)] mb-2">
            Tabelas de Preços OPME
          </h1>
          <p className="text-[var(--orx-text-secondary)] text-[0.938rem]">
            Gerenciamento de preços por fabricante, hospital e convênio
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="neumorphic-button inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[0.813rem]"
            onClick={() => carregarTabelas()}
            title="Atualizar"
          >
            <RefreshCcw size={18} />
            <span>Atualizar</span>
          </button>
          <button
            className="neumorphic-button inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[0.813rem] bg-[var(--orx-primary)] text-white"
            onClick={() => navigate('/cadastros/tabelas-precos/nova')}
          >
            <Plus size={18} />
            <span>Nova Tabela</span>
          </button>
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
      <div 
        className="neumorphic-container p-6 rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="md:[grid-column:1/3]">
            <div className="relative flex items-center">
              <Search 
                size={20} 
                className="absolute left-3 text-[var(--orx-text-secondary)]" 
              />
              <input
                type="text"
                placeholder="Buscar por nome, código ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && carregarTabelas()}
                className="w-full py-3 pl-11 pr-3 rounded-lg border border-[var(--orx-border)] bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem]"
              />
            </div>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full p-3 rounded-lg border border-[var(--orx-border)] bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem]"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="fabricante">Fabricante</option>
              <option value="distribuidor">Distribuidor</option>
              <option value="hospital">Hospital</option>
              <option value="convenio">Convênio</option>
              <option value="contrato">Contrato</option>
              <option value="promocional">Promocional</option>
              <option value="licitacao">Licitação</option>
            </select>
          </div>

          {/* Filtro de Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 rounded-lg border border-[var(--orx-border)] bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem]"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="em_revisao">Em Revisão</option>
              <option value="expirada">Expirada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div 
        className="neumorphic-container rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCcw 
              size={48} 
              className="mx-auto mb-4 text-[var(--orx-primary)] animate-spin" 
            />
            <p className="text-[var(--orx-text-secondary)]">Carregando tabelas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--orx-bg-light)] border-b-2 border-[var(--orx-border)]">
                  <th className="p-4 text-left text-[var(--orx-text-primary)] orx-font-semibold text-[0.813rem]">
                    Nome da Tabela
                  </th>
                  <th className="p-4 text-left text-[var(--orx-text-primary)] orx-font-semibold text-[0.813rem]">
                    Tipo
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] orx-font-semibold text-[0.813rem]">
                    Itens
                  </th>
                  <th className="p-4 text-right text-[var(--orx-text-primary)] orx-font-semibold text-[0.813rem]">
                    Valor Total
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] orx-font-semibold text-[0.813rem]">
                    Vigência
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] orx-font-semibold text-[0.813rem]">
                    Status
                  </th>
                  <th className="p-4 text-center text-[var(--orx-text-primary)] orx-font-semibold text-[0.813rem]">
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
                        <p className="text-[var(--orx-text-primary)] orx-font-medium text-[0.875rem]">
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
                    <td className="p-4 text-center text-[var(--orx-text-primary)] orx-font-medium text-[0.875rem]">
                      {tabela.total_itens || 0}
                    </td>
                    <td className="p-4 text-right text-[var(--orx-text-primary)] orx-font-semibold text-[0.875rem]">
                      R$ {(tabela.valor_total_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                        <button
                          className="neumorphic-button inline-flex items-center gap-2 px-3 py-2 rounded-md text-[0.813rem]"
                          onClick={() => navigate(`/cadastros/tabelas-precos/${tabela.id}`)}
                          title="Visualizar"
                        >
                          <Eye size={16} />
                          <span>Ver</span>
                        </button>
                        <button
                          className="neumorphic-button inline-flex items-center gap-2 px-3 py-2 rounded-md text-[0.813rem]"
                          onClick={() => navigate(`/cadastros/tabelas-precos/${tabela.id}/editar`)}
                          title="Editar"
                        >
                          <Edit size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          className="neumorphic-button inline-flex items-center gap-2 px-3 py-2 rounded-md text-[0.813rem]"
                          onClick={() => handleDuplicar(tabela.id, tabela.nome)}
                          title="Duplicar"
                        >
                          <Copy size={16} />
                          <span>Duplicar</span>
                        </button>
                        <button
                          className="neumorphic-button inline-flex items-center gap-2 px-3 py-2 rounded-md text-[0.813rem]"
                          onClick={() => handleExportar(tabela.id, tabela.nome)}
                          title="Exportar CSV"
                        >
                          <Download size={16} />
                          <span>Exportar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tabelasFiltradas.length === 0 && !loading && (
              <div className="p-12 text-center">
                <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--orx-text-secondary)]" />
                <p className="text-[var(--orx-text-primary)] orx-font-medium">
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
      <div 
        className="neumorphic-container p-6 rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)]"
      >
        <div className="flex gap-3 items-start">
          <AlertTriangle size={20} className="text-[var(--orx-info)] shrink-0 mt-[2px]" />
          <div>
            <h3 className="orx-font-semibold text-[var(--orx-text-primary)] mb-2 text-[0.938rem]">
              Sobre Tabelas de Preços OPME
            </h3>
            <ul className="text-[var(--orx-text-secondary)] text-[0.813rem] leading-6 pl-5 list-disc">
              <li><strong>Fabricante</strong>: Preços de fábrica/custo base fornecidos pelos fabricantes</li>
              <li><strong>Distribuidor</strong>: Tabela padrão com margem de distribuição aplicada</li>
              <li><strong>Hospital</strong>: Preços negociados especificamente com cada hospital</li>
              <li><strong>Convênio</strong>: Tabelas acordadas com planos de saúde e seguradoras</li>
              <li><strong>Contrato</strong>: Baseadas em contratos formais de fornecimento</li>
              <li><strong>Licitação</strong>: Preços para participação em licitações públicas</li>
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
    <div className="neumorphic-container p-6 rounded-2xl flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${bgClass} ${textClass}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[var(--orx-text-secondary)] text-[0.813rem] mb-1">{label}</p>
        <p className="text-[var(--orx-text-primary)] orx-text-2xl orx-font-bold">{value}</p>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: 'ativa' | 'inativa' | 'em_revisao' | 'expirada';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    ativa: { label: 'Ativa', color: 'var(--orx-success)', bg: 'var(--orx-success-light)', icon: <CheckCircle size={14} /> },
    inativa: { label: 'Inativa', color: 'var(--orx-gray-500)', bg: 'var(--orx-gray-100)', icon: <Clock size={14} /> },
    em_revisao: { label: 'Em Revisão', color: 'var(--orx-warning)', bg: 'var(--orx-warning-light)', icon: <Edit size={14} /> },
    expirada: { label: 'Expirada', color: 'var(--orx-danger)', bg: 'var(--orx-danger-light)', icon: <AlertTriangle size={14} /> }
  };

  const { label, color, bg, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.813rem] orx-font-medium bg-[${bg}] text-[${color}]`}>
      {icon}
      {label}
    </span>
  );
};

interface TipoTabelaBadgeProps {
  tipo: 'fabricante' | 'distribuidor' | 'hospital' | 'convenio' | 'contrato' | 'promocional' | 'licitacao';
}

const TipoTabelaBadge: React.FC<TipoTabelaBadgeProps> = ({ tipo }) => {
  const config = {
    fabricante: { label: 'Fabricante', color: 'var(--orx-indigo-700)', bg: 'var(--orx-indigo-50)', icon: <Package size={14} /> },
    distribuidor: { label: 'Distribuidor', color: 'var(--orx-primary)', bg: 'var(--orx-primary-light)', icon: <Users size={14} /> },
    hospital: { label: 'Hospital', color: 'var(--orx-teal-700)', bg: 'var(--orx-teal-50)', icon: <Building2 size={14} /> },
    convenio: { label: 'Convênio', color: 'var(--orx-pink-700)', bg: 'var(--orx-pink-50)', icon: <Heart size={14} /> },
    contrato: { label: 'Contrato', color: 'var(--orx-purple-700)', bg: 'var(--orx-purple-50)', icon: <FileText size={14} /> },
    promocional: { label: 'Promocional', color: 'var(--orx-orange-700)', bg: 'var(--orx-orange-50)', icon: <Percent size={14} /> },
    licitacao: { label: 'Licitação', color: 'var(--orx-blue-700)', bg: 'var(--orx-blue-50)', icon: <FileBarChart size={14} /> }
  };

  const { label, color, bg, icon } = config[tipo];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.813rem] orx-font-medium bg-[${bg}] text-[${color}]`}>
      {icon}
      {label}
    </span>
  );
};

export default TabelasPrecos;
