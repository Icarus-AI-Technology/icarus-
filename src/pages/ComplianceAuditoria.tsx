/**
 * Compliance & Auditoria Avançado - Módulo Completo
 * Sistema: ICARUS v5.0
 * Design: OraclusX DS Neumorphism Premium 3D
 *
 * Funcionalidades:
 * - 12 KPIs estratégicos
 * - 7 Requisitos Abbott (Score 98.2%)
 * - 6 Tabs de navegação
 * - 5 Agentes de IA
 * - Sistema CAPA completo
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  GraduationCap,
  Brain,
  Download,
  Plus,
  BarChart3,
  Award,
  CheckCircle,
  Clock,
  Activity,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useCompliance } from '@/hooks';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/oraclusx-ds/Card';
import { Button } from '@/components/oraclusx-ds/Button';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { NavigationBar, NavigationTab } from '@/components/oraclusx-ds/NavigationBar';
import { Card } from '@/components/oraclusx-ds/Card';
import { Modal } from '@/components/oraclusx-ds/Modal';
import { cn } from '@/lib/utils';
import { ComplianceAutomaticoAI } from '@/services/compliance/ComplianceAutomaticoAI';

// ============================================
// HELPER COMPONENTS
// ============================================

const NeomorphicIcon: React.FC<{
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon: Icon, color, size = 'md' }) => {
  const sizes = { sm: 'w-9 h-9', md: 'w-12 h-12', lg: 'w-14 h-14' };
  const iconSizes = { sm: 16, md: 20, lg: 24 };

  return (
    <div
      className={cn(
        'neomorphic-icon-box flex items-center justify-center rounded-xl transition-all duration-300',
        sizes[size]
      )}
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon size={iconSizes[size]} className={color} />
    </div>
  );
};

// KPICard component removed

const ProgressBar: React.FC<{ value: number; color?: string }> = ({
  value,
  color = 'bg-indigo-500',
}) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
    <div
      className={cn('h-full rounded-full transition-all duration-300', color)}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, { label: string; color: string; bg: string }> = {
    conforme: {
      label: 'Conforme',
      color: 'text-green-700 dark:text-green-300',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    nao_conforme: {
      label: 'Não Conforme',
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
    parcial: {
      label: 'Parcial',
      color: 'text-yellow-700 dark:text-yellow-300',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    nao_aplicavel: {
      label: 'N/A',
      color: 'text-gray-700 dark:text-gray-300',
      bg: 'bg-gray-100 dark:bg-gray-900/30',
    },
  };

  const variant = variants[status] || variants.conforme;

  return (
    <Badge variant="default" className={cn(variant.bg, variant.color, 'orx-orx-font-medium')}>
      {variant.label}
    </Badge>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ComplianceAuditoria: React.FC = () => {
  const {
    requisitos,
    auditorias,
    naoConformidades,
    agentesIA,
    alertas,
    treinamentos,
    loading,
    metricas,
    scoreAbbott,
    gerarAlertasIA,
  } = useCompliance();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isNovaAuditoriaOpen, setIsNovaAuditoriaOpen] = useState(false);

  // Tabs
  const tabs: NavigationTab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'abbott', label: 'Compliance Abbott', icon: <ShieldCheck size={18} /> },
    {
      id: 'auditorias',
      label: 'Auditorias',
      icon: <FileCheck size={18} />,
      badge: metricas.auditoriasConcluidas,
    },
    {
      id: 'ncs',
      label: 'Não Conformidades',
      icon: <AlertTriangle size={18} />,
      badge: metricas.ncAbertas,
    },
    { id: 'treinamentos', label: 'Treinamentos', icon: <GraduationCap size={18} /> },
    { id: 'ia', label: 'Agentes IA', icon: <Brain size={18} />, badge: metricas.agentesAtivos },
  ];

  // Requisitos Abbott
  const requisitosAbbott = requisitos.filter((r) => r.fabricante === 'abbott');

  // ============================================
  // RENDER: HEADER
  // ============================================

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-foreground" style={{ fontWeight: 700, fontSize: '0.813rem' }}>
          Compliance & Auditoria Avançado
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestão regulatória completa com compliance Abbott, ISO 13485 e ANVISA
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <Button
          variant="default"
          onClick={() => window.print()}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Exportar Relatório
        </Button>
        <Button
          variant="primary"
          onClick={() => setIsNovaAuditoriaOpen(true)}
          className="flex items-center gap-2 bg-[var(--orx-primary)] hover:bg-[var(--orx-primary)]/90 text-white"
        >
          <Plus size={16} />
          Nova Auditoria
        </Button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: TAB DASHBOARD
  // ============================================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Score Abbott Destaque */}
      <Card variant="neumo" className="border-l-4 border-indigo-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground mb-2" style={{ fontWeight: 600, fontSize: '0.813rem' }}>
              Score Global Abbott Brasil
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-indigo-600" style={{ fontWeight: 700, fontSize: '0.813rem' }}>
                {scoreAbbott.score.toFixed(1)}%
              </span>
              <Badge variant="success" style={{ fontSize: '0.813rem' }}>
                Distribuidor Platinum
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2" style={{ fontSize: '0.813rem' }}>
              Classificação: Excelente (≥95%) • Última auditoria: Set/2025
            </p>
          </div>
          <NeomorphicIcon icon={Award} color="text-indigo-500" size="lg" />
        </div>
        <div className="mt-4">
          <ProgressBar value={scoreAbbott.score} color="bg-indigo-500" />
        </div>
      </Card>

      {/* KPIs Linha 1 - 4 Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      {/* KPIs Linha 2 - 4 Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      {/* Alertas de IA */}
      {alertas.length > 0 && (
        <Card variant="neumo" className="border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="text-foreground" style={{ fontWeight: 600 }}>
              Alertas Inteligentes (IA)
            </h3>
            <Badge variant="warning" className="ml-auto">
              {alertas.filter((a) => a.status === 'novo' || a.status === 'visualizado').length}{' '}
              pendentes
            </Badge>
          </div>
          <div className="space-y-3">
            {alertas.slice(0, 3).map((alerta) => (
              <div
                key={alerta.id}
                className={cn(
                  'p-3 rounded-lg border-l-2',
                  alerta.severidade === 'critico'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : alerta.severidade === 'urgente'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4
                      className="text-foreground"
                      style={{ fontWeight: 500, fontSize: '0.813rem' }}
                    >
                      {alerta.titulo}
                    </h4>
                    <p className="text-muted-foreground mt-1" style={{ fontSize: '0.813rem' }}>
                      {alerta.descricao}
                    </p>
                    {alerta.acao_sugerida && (
                      <p
                        className="text-foreground mt-2"
                        style={{ fontWeight: 500, fontSize: '0.813rem' }}
                      >
                        💡 {alerta.acao_sugerida}
                      </p>
                    )}
                  </div>
                  <Badge variant="default" className="ml-2" style={{ fontSize: '0.813rem' }}>
                    {alerta.severidade}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="default"
              size="sm"
              onClick={gerarAlertasIA}
              className="flex items-center gap-2"
            >
              <Activity size={14} />
              Atualizar Análise IA
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  // ============================================
  // RENDER: TAB ABBOTT
  // ============================================

  const renderAbbott = () => (
    <div className="space-y-6">
      {/* Score Global */}
      <Card variant="neumo">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-foreground" style={{ fontWeight: 700, fontSize: '0.813rem' }}>
              Score Global: {scoreAbbott.score.toFixed(1)}%
            </h3>
            <p className="text-muted-foreground">
              Distribuidor Platinum • 7 requisitos obrigatórios
            </p>
          </div>
          <Badge variant="success" className="px-4 py-2" style={{ fontSize: '0.813rem' }}>
            ✓ Conforme
          </Badge>
        </div>
        <ProgressBar value={scoreAbbott.score} color="bg-indigo-500" />
      </Card>

      {/* Requisitos Abbott */}
      <div className="space-y-4">
        {requisitosAbbott.length > 0 ? (
          requisitosAbbott.map((req) => (
            <Card variant="neumo" key={req.id} className="border-l-4 border-indigo-500">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant="default"
                        className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                      >
                        {req.codigo}
                      </Badge>
                      <h3
                        className="text-foreground"
                        style={{ fontWeight: 600, fontSize: '0.813rem' }}
                      >
                        {req.titulo}
                      </h3>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                      {req.descricao}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div
                      className="text-foreground"
                      style={{ fontWeight: 700, fontSize: '0.813rem' }}
                    >
                      {req.score_conformidade.toFixed(1)}%
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                {/* Progress */}
                <ProgressBar
                  value={req.score_conformidade}
                  color={
                    req.score_conformidade >= 95
                      ? 'bg-green-500'
                      : req.score_conformidade >= 85
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }
                />

                {/* Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <h4
                      className="text-muted-foreground uppercase mb-2"
                      style={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      Evidências
                    </h4>
                    {req.evidencias && req.evidencias.length > 0 ? (
                      <ul className="space-y-1">
                        {req.evidencias.map((ev, i) => (
                          <li
                            key={i}
                            className="text-foreground flex items-start gap-2"
                            style={{ fontSize: '0.813rem' }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                        Nenhuma evidência registrada
                      </p>
                    )}
                  </div>
                  <div>
                    <h4
                      className="text-muted-foreground uppercase mb-2"
                      style={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      Responsável
                    </h4>
                    <p className="text-foreground" style={{ fontSize: '0.813rem' }}>
                      {req.responsavel || 'Não atribuído'}
                    </p>
                    {req.responsavel_cargo && (
                      <p className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                        {req.responsavel_cargo}
                      </p>
                    )}
                    {req.proxima_auditoria && (
                      <div className="mt-3">
                        <h4
                          className="text-muted-foreground uppercase mb-1"
                          style={{ fontWeight: 600, fontSize: '0.813rem' }}
                        >
                          Próxima Auditoria
                        </h4>
                        <p
                          className="text-foreground flex items-center gap-2"
                          style={{ fontSize: '0.813rem' }}
                        >
                          <Clock size={14} />
                          {new Date(req.proxima_auditoria).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Corretivas */}
                {req.acoes_corretivas && req.acoes_corretivas.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4
                      className="text-muted-foreground uppercase mb-2"
                      style={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      Ações Corretivas
                    </h4>
                    <ul className="space-y-1">
                      {req.acoes_corretivas.map((acao, i) => (
                        <li
                          key={i}
                          className="text-orange-600 dark:text-orange-400 flex items-start gap-2"
                          style={{ fontSize: '0.813rem' }}
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{acao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card variant="neumo">
            <p className="text-center text-muted-foreground py-8">
              Nenhum requisito Abbott cadastrado
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER: TAB AUDITORIAS
  // ============================================

  const renderAuditorias = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      <Card variant="neumo">
        <CardHeader>
          <CardTitle>Histórico de Auditorias</CardTitle>
          <CardDescription>Auditorias internas e externas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {auditorias.length > 0 ? (
            <div className="space-y-3">
              {auditorias.map((aud) => (
                <div
                  key={aud.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-foreground" style={{ fontWeight: 500 }}>
                        {aud.titulo}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="default" style={{ fontSize: '0.813rem' }}>
                          {aud.tipo}
                        </Badge>
                        <span className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                          {aud.auditor_lider}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-foreground" style={{ fontWeight: 600 }}>
                        {aud.score_global?.toFixed(1) || 0}%
                      </div>
                      <Badge variant={aud.status === 'concluida' ? 'success' : 'warning'}>
                        {aud.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma auditoria cadastrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ============================================
  // RENDER: TAB NÃO CONFORMIDADES
  // ============================================

  const renderNaoConformidades = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      <Card variant="neumo">
        <CardHeader>
          <CardTitle>Não Conformidades (NCs)</CardTitle>
          <CardDescription>Sistema CAPA - Ações corretivas e preventivas</CardDescription>
        </CardHeader>
        <CardContent>
          {naoConformidades.length > 0 ? (
            <div className="space-y-3">
              {naoConformidades.slice(0, 10).map((nc) => (
                <div
                  key={nc.id}
                  className={cn(
                    'p-4 border-l-4 rounded-lg',
                    nc.severidade === 'critica'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                      : nc.severidade === 'maior'
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
                        : nc.severidade === 'menor'
                          ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
                          : 'border-gray-500 bg-gray-50/50 dark:bg-gray-900/10'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" style={{ fontSize: '0.813rem' }}>
                          {nc.codigo_nc}
                        </Badge>
                        <h4 className="text-foreground" style={{ fontWeight: 500 }}>
                          {nc.titulo}
                        </h4>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                        {nc.descricao_completa}
                      </p>
                      {nc.causa_raiz && (
                        <p className="text-foreground mt-2" style={{ fontSize: '0.813rem' }}>
                          <strong>Causa Raiz:</strong> {nc.causa_raiz}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <Badge
                        variant={
                          nc.severidade === 'critica'
                            ? 'error'
                            : nc.severidade === 'maior'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {nc.severidade}
                      </Badge>
                      <p className="text-muted-foreground mt-1" style={{ fontSize: '0.813rem' }}>
                        {new Date(nc.data_identificacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma não conformidade registrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ============================================
  // RENDER: TAB TREINAMENTOS
  // ============================================

  const renderTreinamentos = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      <Card variant="neumo">
        <CardHeader>
          <CardTitle>Treinamentos e Certificações</CardTitle>
          <CardDescription>Programa de capacitação e certificação</CardDescription>
        </CardHeader>
        <CardContent>
          {treinamentos.length > 0 ? (
            <div className="space-y-3">
              {treinamentos.map((trein) => (
                <div
                  key={trein.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-foreground" style={{ fontWeight: 500 }}>
                        {trein.titulo}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="default" style={{ fontSize: '0.813rem' }}>
                          {trein.tipo}
                        </Badge>
                        <span className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                          {trein.duracao_horas}h • {trein.modalidade}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-foreground" style={{ fontWeight: 600 }}>
                        {trein.total_aprovados}/{trein.total_participantes}
                      </div>
                      <Badge variant={trein.status === 'concluido' ? 'success' : 'warning'}>
                        {trein.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum treinamento cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ============================================
  // RENDER: TAB AGENTES IA
  // ============================================

  const renderAgentesIA = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentesIA.map((agente) => (
          <Card variant="neumo" key={agente.id} className="border-l-4 border-cyan-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-foreground" style={{ fontWeight: 600 }}>
                  {agente.nome}
                </h3>
                <Badge variant="default" className="mt-1" style={{ fontSize: '0.813rem' }}>
                  {agente.tipo}
                </Badge>
              </div>
              <Badge variant={agente.status === 'ativo' ? 'success' : 'default'}>
                {agente.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between" style={{ fontSize: '0.813rem' }}>
                <span className="text-muted-foreground">Taxa de Acerto</span>
                <span className="text-foreground" style={{ fontWeight: 600 }}>
                  {agente.taxa_acerto.toFixed(1)}%
                </span>
              </div>
              <ProgressBar value={agente.taxa_acerto} color="bg-cyan-500" />

              <div className="grid grid-cols-2 gap-4 pt-3">
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                    Alertas Gerados
                  </p>
                  <p className="text-foreground" style={{ fontWeight: 600, fontSize: '0.813rem' }}>
                    {agente.alertas_gerados}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                    Ações Sugeridas
                  </p>
                  <p className="text-foreground" style={{ fontWeight: 600, fontSize: '0.813rem' }}>
                    {agente.acoes_sugeridas}
                  </p>
                </div>
              </div>

              {agente.ultima_execucao && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-muted-foreground" style={{ fontSize: '0.813rem' }}>
                    Última Execução
                  </p>
                  <p
                    className="text-foreground flex items-center gap-2 mt-1"
                    style={{ fontSize: '0.813rem' }}
                  >
                    <Activity size={14} />
                    {new Date(agente.ultima_execucao).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {agentesIA.length === 0 && (
        <Card variant="neumo">
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum agente de IA ativo</p>
          </div>
        </Card>
      )}
    </div>
  );

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    // Executar análise IA ao montar
    ComplianceAutomaticoAI.executarAnalise();
  }, []);

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {renderHeader()}

        {/* Navigation Tabs */}
        <NavigationBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-6">
          {loading ? (
            <Card variant="neumo">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            </Card>
          ) : null}

          {!loading && activeTab === 'dashboard' && renderDashboard()}
          {!loading && activeTab === 'abbott' && renderAbbott()}
          {!loading && activeTab === 'auditorias' && renderAuditorias()}
          {!loading && activeTab === 'ncs' && renderNaoConformidades()}
          {!loading && activeTab === 'treinamentos' && renderTreinamentos()}
          {!loading && activeTab === 'ia' && renderAgentesIA()}
        </div>
      </div>

      {/* Modal: Nova Auditoria */}
      <Modal
        isOpen={isNovaAuditoriaOpen}
        onClose={() => setIsNovaAuditoriaOpen(false)}
        title="Nova Auditoria"
        size="lg"
      >
        <div className="space-y-4 p-6">
          <p className="text-muted-foreground">
            Formulário de nova auditoria será implementado aqui.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="default" onClick={() => setIsNovaAuditoriaOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary">Agendar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplianceAuditoria;
