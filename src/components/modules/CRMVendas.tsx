/**
 * Módulo 11: CRM & Vendas
 * Pipeline de vendas e relacionamento com clientes
 *
 * CONFORME DOCUMENTAÇÃO OFICIAL
 *
 * FUNCIONALIDADES:
 * - Pipeline de vendas (Kanban)
 * - Gestão de leads
 * - Oportunidades
 * - Taxa de conversão
 * - Funil de vendas
 * - Relatórios
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/oraclusx-ds';
import {
  Users,
  TrendingUp,
  Target,
  Phone,
  Mail,
  Plus,
  Star,
  Loader2,
  Search,
  DollarSign,
  Edit2,
  Eye,
  Trash2,
  CheckCircle,
  Download,
  FileText,
} from 'lucide-react';
import { useDocumentTitle, useLeads } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import type { Lead } from '@/hooks/useLeads';

interface KPI {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  trend?: string;
}

export function CRMVendas() {
  useDocumentTitle('CRM & Vendas');

  // Navegação
  const [activeCategory, setActiveCategory] = useState('pipeline');
  const [activeTab, setActiveTab] = useState('todos');

  // Backend Integration (Realtime)
  const { leads, loading, error, getTaxaConversao, updateLead, deleteLead } = useLeads();
  const { addToast } = useToast();

  const [taxaConversao, setTaxaConversao] = useState<{
    total: number;
    ganhos: number;
    perdidos: number;
    emAndamento: number;
    taxaConversao: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Categorias (7 navegação)
  const stageByCategory = useMemo<Record<string, Lead['estagio']>>(
    () => ({
      pipeline: 'novo',
      leads: 'novo',
      oportunidades: 'qualificado',
      propostas: 'proposta',
      negociacao: 'negociacao',
      ganhos: 'ganho',
      relatorios: 'qualificado',
    }),
    []
  );

  const categories: Category[] = useMemo(
    () => [
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: TrendingUp,
        count: leads.length,
        trend: '+12',
      },
      {
        id: 'leads',
        label: 'Leads',
        icon: Users,
        count: leads.filter((l) => l.estagio === stageByCategory.leads).length,
        trend: '+8',
      },
      {
        id: 'oportunidades',
        label: 'Oportunidades',
        icon: Target,
        count: leads.filter((l) => l.estagio === stageByCategory.oportunidades).length,
        trend: '+5',
      },
      {
        id: 'propostas',
        label: 'Propostas',
        icon: Mail,
        count: leads.filter((l) => l.estagio === stageByCategory.propostas).length,
        trend: '+3',
      },
      {
        id: 'negociacao',
        label: 'Negociação',
        icon: DollarSign,
        count: leads.filter((l) => l.estagio === stageByCategory.negociacao).length,
        trend: '0',
      },
      {
        id: 'ganhos',
        label: 'Ganhos',
        icon: CheckCircle,
        count: leads.filter((l) => l.estagio === stageByCategory.ganhos).length,
        trend: '+7',
      },
      {
        id: 'relatorios',
        label: 'Relatórios',
        icon: FileText,
        count: 0,
        trend: '0',
      },
    ],
    [leads, stageByCategory]
  );

  // KPIs (4 cards - altura 140px)
  const kpis: KPI[] = useMemo(
    () => [
      {
        title: 'Leads Ativos',
        value: leads.length,
        trend: '+12 esta semana',
        icon: Users,
        color: 'blue',
      },
      {
        title: 'Taxa de Conversão',
        value: taxaConversao?.taxaConversao?.toFixed(1) + '%' || '0%',
        trend: '+2.3%',
        icon: TrendingUp,
        color: 'green',
      },
      {
        title: 'Valor em Pipeline',
        value: 'R$ 2.4M',
        trend: '+18.5%',
        icon: DollarSign,
        color: 'indigo',
      },
      {
        title: 'Negócios Fechados',
        value: leads.filter((l) => l.estagio === 'ganho').length,
        trend: '+7 este mês',
        icon: CheckCircle,
        color: 'green',
      },
    ],
    [leads, taxaConversao]
  );

  // Efeitos
  useEffect(() => {
    const fetchFunilData = async () => {
      const taxa = await getTaxaConversao();
      setTaxaConversao(taxa);
    };
    if (!loading) {
      fetchFunilData();
    }
  }, [leads, loading, getTaxaConversao]);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  // Handlers
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Tem certeza que deseja excluir este lead?')) return;
      try {
        await deleteLead(id);
        addToast('Lead excluído com sucesso!', 'success');
      } catch {
        addToast('Erro ao excluir lead', 'error');
      }
    },
    [deleteLead, addToast]
  );

  const getStageColor = useCallback((estagio: Lead['estagio']): string => {
    const colors: Partial<Record<Lead['estagio'], string>> = {
      novo: 'text-[var(--text-secondary)] bg-surface',
      contato: 'text-[var(--accent)] bg-[var(--accent)]/10',
      qualificado: 'text-[var(--primary)] bg-[var(--primary)]/10',
      proposta: 'text-[var(--accent)] bg-[var(--accent)]/10',
      negociacao: 'text-warning bg-[var(--warning)]/10',
      ganho: 'text-success bg-success/10',
      perdido: 'text-error bg-[var(--error)]/10',
      desqualificado: 'text-[var(--text-secondary)] bg-surface',
    };
    return colors[estagio] ?? 'text-[var(--text-secondary)] bg-surface';
  }, []);

  const getStageLabel = useCallback((estagio: Lead['estagio']): string => {
    const labels: Partial<Record<Lead['estagio'], string>> = {
      novo: 'Novo',
      contato: 'Contato',
      qualificado: 'Qualificado',
      proposta: 'Proposta',
      negociacao: 'Negociação',
      ganho: 'Ganho',
      perdido: 'Perdido',
      desqualificado: 'Desqualificado',
    };
    return labels[estagio] ?? estagio;
  }, []);

  const formatCurrency = useCallback((value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }, []);

  const handleStageChange = useCallback(
    async (id: string, newStage: Lead['estagio']) => {
      try {
        await updateLead(id, { estagio: newStage });
        addToast(`Estágio atualizado para: ${getStageLabel(newStage)}`, 'success');
      } catch {
        addToast('Erro ao atualizar estágio', 'error');
      }
    },
    [updateLead, addToast, getStageLabel]
  );

  // Filtrar leads
  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const matchSearch =
          lead.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.empresa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          false;

        const matchTab =
          activeTab === 'todos'
            ? true
            : activeTab === 'ativos'
              ? !['ganho', 'perdido', 'desqualificado'].includes(lead.estagio)
              : activeTab === 'ganhos'
                ? lead.estagio === 'ganho'
                : activeTab === 'perdidos'
                  ? lead.estagio === 'perdido'
                  : false;

        return matchSearch && matchTab;
      }),
    [leads, searchQuery, activeTab]
  );

  // Render Functions
  const renderPipeline = () => {
    const estagios: Lead['estagio'][] = [
      'novo',
      'contato',
      'qualificado',
      'proposta',
      'negociacao',
      'ganho',
      'perdido',
      'desqualificado',
    ];

    return (
      <div className="space-y-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {estagios.map((estagio) => {
            const leadsEstagio = leads.filter((l) => l.estagio === estagio);

            return (
              <div key={estagio} className="flex-1 min-w-[280px]">
                <Card className="neuro-raised p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[var(--text-primary)] orx-orx-font-medium">
                      {getStageLabel(estagio)}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-surface text-body-sm orx-orx-font-medium">
                      {leadsEstagio.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {leadsEstagio.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-4 rounded-lg neuro-inset hover:neuro-raised transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-[var(--text-primary)] text-body-sm orx-orx-font-medium">
                            {lead.nome}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-body-xs ${getStageColor(lead.estagio)}`}
                          >
                            {getStageLabel(lead.estagio)}
                          </span>
                        </div>

                        <p className="text-body-sm text-[var(--text-secondary)] mb-3">
                          {lead.empresa || 'Sem empresa'}
                        </p>

                        <div className="flex items-center justify-between text-body-xs text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(lead.valor_estimado)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {lead.probabilidade}%
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          {estagios.map((nextStage) => {
                            if (nextStage === estagio) return null;
                            return (
                              <button
                                key={nextStage}
                                onClick={() => handleStageChange(lead.id, nextStage)}
                                className="text-body-xs px-2 py-1 rounded neuro-button-secondary hover:neuro-pressed transition-all"
                                title={`Mover para ${getStageLabel(nextStage)}`}
                              >
                                →
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {leadsEstagio.length === 0 && (
                      <div className="text-center py-8 text-[var(--text-secondary)] text-body-sm">
                        Nenhum lead
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLista = () => (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <button className="neuro-button px-6 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Lead
          </button>
          <button
            className="neuro-button-secondary px-4 py-2 rounded-xl"
            aria-label="Exportar lista de leads"
            title="Exportar lista de leads"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar lead ou empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl neuro-inset text-body-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'ativos', label: 'Ativos' },
          { id: 'ganhos', label: 'Ganhos' },
          { id: 'perdidos', label: 'Perdidos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl orx-orx-font-medium transition-all ${
              activeTab === tab.id
                ? 'neuro-raised text-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Tabela */}
      {!loading && (
        <Card className="neuro-raised overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Nome
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Empresa
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Contato
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Valor Est.
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Prob.
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Estágio
                  </th>
                  <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full neuro-inset flex items-center justify-center text-[var(--primary)] font-display">
                          {lead.nome[0]}
                        </div>
                        <span className="text-[var(--text-primary)] orx-orx-font-medium">
                          {lead.nome}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">{lead.empresa || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-body-xs text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.telefone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {formatCurrency(lead.valor_estimado)}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">{lead.probabilidade}%</td>
                    <td className="p-4" aria-label="Estágio do lead">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-xs orx-orx-font-medium ${getStageColor(lead.estagio)}`}
                      >
                        {getStageLabel(lead.estagio)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all"
                          aria-label="Visualizar lead"
                          title="Visualizar lead"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all"
                          aria-label="Editar lead"
                          title="Editar lead"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 rounded-lg neuro-button-secondary hover:neuro-pressed transition-all text-error"
                          aria-label="Excluir lead"
                          title="Excluir lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">Nenhum lead encontrado</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              CRM & Vendas
            </h1>
            <p className="text-[var(--text-secondary)]">
              Pipeline de vendas e gestão de relacionamento com clientes em tempo real
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success/50 animate-pulse" />
            <span className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
              {leads.length} leads ativos
            </span>
          </div>
        </div>

        {/* Navigation Bar (7 categorias) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex flex-col items-center justify-center h-24 text-center rounded-xl transition-all duration-200 ${
                activeCategory === category.id
                  ? 'neuro-raised scale-105'
                  : 'neuro-flat hover:neuro-raised'
              }`}
            >
              <category.icon className="w-5 h-5 mb-1 text-[var(--primary)]" />
              <span className="text-body-xs text-[var(--text-primary)] orx-orx-font-medium">
                {category.label}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-body-lg font-display text-[var(--text-primary)]">
                  {category.count}
                </span>
                {category.trend && category.trend !== '0' && (
                  <TrendingUp className="w-3 h-3 text-success" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* KPIs (4 cards - altura 140px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="neuro-raised p-6 h-[140px]">
              <div className="flex items-start justify-between h-full">
                <div>
                  <p className="text-body-sm text-[var(--text-secondary)] mb-1">{kpi.title}</p>
                  <h3 className="text-heading font-display text-[var(--text-primary)]">
                    {kpi.value}
                  </h3>
                  {kpi.trend && (
                    <p className="text-body-xs text-success mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {kpi.trend}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-xl neuro-inset">
                  <kpi.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Content */}
        {activeCategory === 'pipeline' && renderPipeline()}
        {!['pipeline', 'relatorios'].includes(activeCategory) && renderLista()}

        {activeCategory === 'relatorios' && (
          <Card className="neuro-raised p-12 text-center">
            <FileText className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-heading-sm text-[var(--text-primary)] mb-2 orx-orx-font-medium">
              Relatórios de Vendas
            </h3>
            <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CRMVendas;
