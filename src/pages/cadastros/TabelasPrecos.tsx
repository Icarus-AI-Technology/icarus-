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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  Building2,
  Heart,
  TrendingUp,
  Calendar,
  Upload,
  Download,
  Edit,
  Eye,
  Plus,
  Search,
  Filter,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Percent,
  Package,
  Users,
  FileBarChart
} from 'lucide-react';
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
  const [totalCount, setTotalCount] = useState(0);

  // Carregar tabelas
  useEffect(() => {
    carregarTabelas();
  }, [filterTipo, filterStatus]);

  const carregarTabelas = async () => {
    setLoading(true);
    try {
      const { data, count } = await tabelasPrecosService.listarTabelas({
        tipo: filterTipo !== 'todos' ? filterTipo : undefined,
        status: filterStatus !== 'todos' ? filterStatus : undefined,
        busca: searchQuery || undefined,
      });

      setTabelas(data || []);
      setTotalCount(count || 0);
    } catch (_error) {
      console.error('Erro ao carregar tabelas:', _error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (_error) {
      console.error('Erro ao exportar tabela:', _error);
    }
  };

  const handleDuplicar = async (tabelaId: string, tabelaNome: string) => {
    try {
      const novoNome = `${tabelaNome} - Cópia`;
      await tabelasPrecosService.duplicarTabela(tabelaId, novoNome);
      carregarTabelas();
    } catch (_error) {
      console.error('Erro ao duplicar tabela:', _error);
    }
  };

  return (
    <div className="space-y-6" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            style={{ 
              fontSize: '1.875rem',
              fontWeight: 'var(--orx-font-weight-bold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '8px'
            }}
          >
            Tabelas de Preços OPME
          </h1>
          <p style={{ color: 'var(--orx-text-secondary)', fontSize: '0.938rem' }}>
            Gerenciamento de preços por fabricante, hospital e convênio
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="neumorphic-button"
            onClick={() => carregarTabelas()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '12px 20px',
              borderRadius: 'var(--orx-radius-lg)',
              fontSize: '0.813rem'
            }}
            title="Atualizar"
          >
            <RefreshCcw size={18} />
            <span>Atualizar</span>
          </button>
          <button
            className="neumorphic-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '12px 20px',
              borderRadius: 'var(--orx-radius-lg)',
              fontSize: '0.813rem',
              background: 'var(--orx-primary)',
              color: '#fff'
            }}
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
          color="var(--orx-success)"
        />
        <KPICard
          label="Tabelas Hospitais"
          value={kpis.tabelasHospitais}
          icon={<Building2 size={24} />}
          color="var(--orx-primary)"
        />
        <KPICard
          label="Tabelas Convênios"
          value={kpis.tabelasConvenios}
          icon={<Heart size={24} />}
          color="var(--orx-pink-500)"
        />
        <KPICard
          label="Valor Médio"
          value={`R$ ${kpis.valorTotalMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} />}
          color="var(--orx-teal-500)"
        />
      </div>

      {/* Filtros e Busca */}
      <div 
        className="neumorphic-container"
        style={{
          padding: '24px',
          borderRadius: 'var(--orx-radius-xl)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div style={{ gridColumn: '1 / 3' }}>
            <div 
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--orx-text-secondary)'
                }} 
              />
              <input
                type="text"
                placeholder="Buscar por nome, código ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && carregarTabelas()}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  borderRadius: 'var(--orx-radius-lg)',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)',
                  fontSize: '0.813rem'
                }}
              />
            </div>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--orx-radius-lg)',
                border: '1px solid var(--orx-border)',
                background: 'var(--orx-bg-light)',
                color: 'var(--orx-text-primary)',
                fontSize: '0.813rem'
              }}
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
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--orx-radius-lg)',
                border: '1px solid var(--orx-border)',
                background: 'var(--orx-bg-light)',
                color: 'var(--orx-text-primary)',
                fontSize: '0.813rem'
              }}
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
        className="neumorphic-container"
        style={{
          borderRadius: 'var(--orx-radius-xl)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <RefreshCcw 
              size={48} 
              style={{ color: 'var(--orx-primary)', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} 
            />
            <p style={{ color: 'var(--orx-text-secondary)' }}>Carregando tabelas...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--orx-bg-light)', borderBottom: '2px solid var(--orx-border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.813rem' }}>
                    Nome da Tabela
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.813rem' }}>
                    Tipo
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.813rem' }}>
                    Itens
                  </th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.813rem' }}>
                    Valor Total
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.813rem' }}>
                    Vigência
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.813rem' }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.813rem' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabelasFiltradas.map((tabela) => (
                  <tr 
                    key={tabela.id}
                    style={{
                      borderBottom: '1px solid var(--orx-border)',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div>
                        <p style={{ color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-medium)', fontSize: '0.875rem' }}>
                          {tabela.nome}
                        </p>
                        {tabela.codigo && (
                          <p style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem', marginTop: '4px' }}>
                            Código: {tabela.codigo}
                          </p>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <TipoTabelaBadge tipo={tabela.tipo} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-medium)', fontSize: '0.875rem' }}>
                      {tabela.total_itens || 0}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-semibold)', fontSize: '0.875rem' }}>
                      R$ {(tabela.valor_total_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: 'var(--orx-text-secondary)', fontSize: '0.813rem' }}>
                      {new Date(tabela.data_inicio).toLocaleDateString('pt-BR')}
                      {tabela.data_fim && (
                        <>
                          <br />
                          até {new Date(tabela.data_fim).toLocaleDateString('pt-BR')}
                        </>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <StatusBadge status={tabela.status} />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          className="neumorphic-button"
                          onClick={() => navigate(`/cadastros/tabelas-precos/${tabela.id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '8px 12px',
                            borderRadius: 'var(--orx-radius-md)',
                            fontSize: '0.813rem'
                          }}
                          title="Visualizar"
                        >
                          <Eye size={16} />
                          <span>Ver</span>
                        </button>
                        <button
                          className="neumorphic-button"
                          onClick={() => navigate(`/cadastros/tabelas-precos/${tabela.id}/editar`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '8px 12px',
                            borderRadius: 'var(--orx-radius-md)',
                            fontSize: '0.813rem'
                          }}
                          title="Editar"
                        >
                          <Edit size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          className="neumorphic-button"
                          onClick={() => handleDuplicar(tabela.id, tabela.nome)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '8px 12px',
                            borderRadius: 'var(--orx-radius-md)',
                            fontSize: '0.813rem'
                          }}
                          title="Duplicar"
                        >
                          <Copy size={16} />
                          <span>Duplicar</span>
                        </button>
                        <button
                          className="neumorphic-button"
                          onClick={() => handleExportar(tabela.id, tabela.nome)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '8px 12px',
                            borderRadius: 'var(--orx-radius-md)',
                            fontSize: '0.813rem'
                          }}
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
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <AlertTriangle size={48} style={{ color: 'var(--orx-text-secondary)', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--orx-text-primary)', fontWeight: 'var(--orx-font-weight-medium)' }}>
                  Nenhuma tabela encontrada
                </p>
                <p style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem', marginTop: '8px' }}>
                  Tente ajustar os filtros ou crie uma nova tabela de preços
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informações Importantes */}
      <div 
        className="neumorphic-container"
        style={{
          padding: '24px',
          borderRadius: 'var(--orx-radius-xl)',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
          <AlertTriangle size={20} style={{ color: 'var(--orx-info)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 
              style={{ 
                fontWeight: 'var(--orx-font-weight-semibold)',
                color: 'var(--orx-text-primary)',
                marginBottom: '8px',
                fontSize: '0.938rem'
              }}
            >
              Sobre Tabelas de Preços OPME
            </h3>
            <ul style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem', lineHeight: '1.6', paddingLeft: '20px' }}>
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
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, color }) => {
  return (
    <div
      className="neumorphic-container"
      style={{
        padding: '24px',
        borderRadius: 'var(--orx-radius-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--orx-radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}15`,
          color: color,
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem', marginBottom: '4px' }}>
          {label}
        </p>
        <p style={{ color: 'var(--orx-text-primary)', fontSize: '1.5rem', fontWeight: 'var(--orx-font-weight-bold)' }}>
          {value}
        </p>
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
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 'var(--orx-radius-md)',
        fontSize: '0.813rem',
        fontWeight: 'var(--orx-font-weight-medium)',
        background: bg,
        color: color
      }}
    >
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
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 'var(--orx-radius-md)',
        fontSize: '0.813rem',
        fontWeight: 'var(--orx-font-weight-medium)',
        background: bg,
        color: color
      }}
    >
      {icon}
      {label}
    </span>
  );
};

export default TabelasPrecos;
