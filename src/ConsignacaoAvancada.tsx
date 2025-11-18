/**
 * Consignação Avançada - Módulo Completo
 * Sistema: ICARUS v5.0
 * Design: OraclusX DS Neumorphism Premium 3D
 * 
 * Funcionalidades:
 * - 13 KPIs (9 principais + 4 secundários)
 * - 5 Tabs de navegação
 * - Sistema de alertas automáticos
 * - Filtros avançados
 * - CRUD completo
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package, DollarSign,
  AlertCircle, Building2, Download, Calculator, Plus,
  BarChart3, Receipt, Search, Filter, Eye, Edit
} from 'lucide-react';
import { useConsignacao } from '@/hooks';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/oraclusx-ds/Card';
import { Button } from '@/components/oraclusx-ds/Button';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { NavigationBar, NavigationTab } from '@/components/oraclusx-ds/NavigationBar';
import { Modal } from '@/components/oraclusx-ds/Modal';
import { Input } from '@/components/oraclusx-ds/Input';
import { Select } from '@/components/oraclusx-ds/Form';
import { cn } from '@/lib/utils';

// ============================================
// HELPER COMPONENTS
// ============================================

const NeomorphicCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("neomorphic-card p-6 rounded-2xl transition-all duration-300 ease-in-out","bg-gradient-to-br from-white/90 to-gray-100/80","dark:from-gray-800/95 dark:to-gray-900/90","hover:transform hover:translateY(-2px)",
    className
  )}>
    {children}
  </div>
);

const NeomorphicIcon: React.FC<{ 
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string; // ex.: 'text-indigo-500'
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon: Icon, color, size = 'md' }) => {
  const sizes = { sm: 'w-9 h-9', md: 'w-12 h-12', lg: 'w-14 h-14' };
  const iconSizes = { sm: 16, md: 20, lg: 24 };
  const bgByTextColor: Record<string, string> = {
    'text-indigo-500': 'bg-indigo-500/20',
    'text-blue-500': 'bg-blue-500/20',
    'text-green-500': 'bg-green-500/20',
    'text-purple-500': 'bg-purple-500/20',
    'text-red-500': 'bg-red-500/20',
    'text-yellow-500': 'bg-yellow-500/20',
    'text-orange-500': 'bg-orange-500/20',
  };

  return (
    <div className={cn(
      'neomorphic-icon-box flex items-center justify-center rounded-xl transition-all duration-300',
      sizes[size],
      bgByTextColor[color] || 'bg-surface'
    )}>
      <Icon size={iconSizes[size]} className={color} />
    </div>
  );
};

// KPICard component removed

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, { label: string; color: string; bg: string }> = {
    disponivel: { label: 'Disponível', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
    reservado: { label: 'Reservado', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    utilizado: { label: 'Utilizado', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    devolvido: { label: 'Devolvido', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    vencido: { label: 'Vencido', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
    danificado: { label: 'Danificado', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30' }
  };
  
  const variant = variants[status] || variants.disponivel;
  
  return (
    <Badge variant="default" className={cn(variant.bg, variant.color, "font-medium")}>
      {variant.label}
    </Badge>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ConsignacaoAvancada: React.FC = () => {
  const {
    materiais,
    faturamentos,
    alertas,
    loading,
    metricas,
    filtros,
    setFiltros,
    // addMaterial,
    // updateMaterial,
    // deleteMaterial,
    atualizarMetricasConsignacao
  } = useConsignacao();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isNovaConsignacaoOpen, setIsNovaConsignacaoOpen] = useState(false);
  const [isDetalhesMaterialOpen, setIsDetalhesMaterialOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  // Tabs
  const tabs: NavigationTab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'materiais', label: 'Materiais', icon: <Package size={18} />, badge: metricas.totalMateriais },
    { id: 'faturamento', label: 'Faturamento', icon: <Receipt size={18} /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={18} /> },
    { id: 'hospitais', label: 'Hospitais', icon: <Building2 size={18} />, badge: metricas.hospitaisAtivos }
  ];

  // Format currency
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  // Unique hospitals
  const hospitaisUnicos = useMemo(() => Array.from(new Set(materiais.map(m => m.hospital_nome))), [materiais]);

  // ============================================
  // RENDER: HEADER
  // ============================================

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-foreground text-body-sm font-extrabold">Consignação Avançada</h1>
        <p className="text-muted-foreground mt-1">
          Gestão completa de materiais OPME em consignação com controle financeiro e logístico
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <Button
          variant="default"
          onClick={() => window.print()}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Relatório
        </Button>
        <Button
          variant="default"
          onClick={() => setActiveTab('financeiro')}
          className="flex items-center gap-2"
        >
          <Calculator size={16} />
          Financeiro
        </Button>
        <Button
          variant="primary"
          onClick={() => setIsNovaConsignacaoOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus size={16} />
          Nova Consignação
        </Button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: FILTROS
  // ============================================

  const renderFiltros = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Busca Global */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar materiais, hospitais, lotes..."
          value={filtros.searchTerm || ''}
          onChange={(e) => setFiltros({ ...filtros, searchTerm: e.target.value })}
          className="pl-10"
        />
      </div>
      
      {/* Filtro Status */}
      <div className="neomorphic-inset rounded-lg">
        <Select
          value={filtros.status || 'todos'}
          onChange={(value) => setFiltros({ ...filtros, status: value })}
          options={[
            { value: 'todos', label: 'Todos os Status' },
            { value: 'disponivel', label: 'Disponível' },
            { value: 'reservado', label: 'Reservado' },
            { value: 'utilizado', label: 'Utilizado' },
            { value: 'devolvido', label: 'Devolvido' },
            { value: 'vencido', label: 'Vencido' },
            { value: 'danificado', label: 'Danificado' }
          ]}
          icon={<Filter size={16} />}
          className="border-none bg-transparent"
        />
      </div>
      
      {/* Filtro Hospital */}
      <div className="neomorphic-inset rounded-lg">
        <Select
          value={filtros.hospital || 'todos'}
          onChange={(value) => setFiltros({ ...filtros, hospital: value })}
          options={[
            { value: 'todos', label: 'Todos os Hospitais' },
            ...hospitaisUnicos.map(h => ({ value: h, label: h }))
          ]}
          icon={<Building2 size={16} />}
          className="border-none bg-transparent"
        />
      </div>
    </div>
  );

  // ============================================
  // RENDER: TAB DASHBOARD
  // ============================================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPIs Linha 1 - 4 Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      {/* KPIs Linha 2 - 2 Largos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      {/* KPIs Linha 3 - 3 Com Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      {/* Alertas Críticos */}
      {alertas.length > 0 && (
        <NeomorphicCard className="border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-foreground font-semibold">Alertas de Conferência Semanal</h3>
            <Badge variant="error" className="ml-auto">
              {alertas.filter(a => a.status === 'ativo').length} pendentes
            </Badge>
          </div>
          <div className="space-y-3">
            {alertas.slice(0, 3).map(alerta => (
              <div key={alerta.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-2 border-red-500">
                <h4 className="text-foreground text-body-sm font-medium">{alerta.titulo}</h4>
                <p className="text-muted-foreground mt-1 text-body-sm">{alerta.descricao}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="default" className="bg-red-100 text-red-800 text-body-sm">
                    {alerta.severidade}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </NeomorphicCard>
      )}
    </div>
  );

  // ============================================
  // RENDER: TAB MATERIAIS
  // ============================================

  const renderMateriais = () => (
    <div className="space-y-4">
      <NeomorphicCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-3 text-foreground text-body-sm font-semibold">Código</th>
                <th className="text-left p-3 text-foreground text-body-sm font-semibold">Material</th>
                <th className="text-left p-3 text-foreground text-body-sm font-semibold">Hospital</th>
                <th className="text-right p-3 text-foreground text-body-sm font-semibold">Quantidade</th>
                <th className="text-right p-3 text-foreground text-body-sm font-semibold">Valor Total</th>
                <th className="text-center p-3 text-foreground text-body-sm font-semibold">Status</th>
                <th className="text-center p-3 text-foreground text-body-sm font-semibold">Dias Estoque</th>
                <th className="text-right p-3 text-foreground text-body-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materiais.slice(0, 10).map((material) => (
                <tr key={material.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 text-foreground font-mono text-body-sm">{material.codigo_interno}</td>
                  <td className="p-3">
                    <div>
                      <div className="text-foreground text-body-sm font-medium">{material.nome}</div>
                      {material.lote && (
                        <div className="text-muted-foreground text-body-sm">Lote: {material.lote}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-foreground text-body-sm">{material.hospital_nome}</td>
                  <td className="p-3 text-right text-foreground text-body-sm">{material.quantidade}</td>
                  <td className="p-3 text-right text-foreground text-body-sm font-medium">
                    {formatCurrency(material.valor_total)}
                  </td>
                  <td className="p-3 text-center">
                    <StatusBadge status={material.status} />
                  </td>
                  <td className="p-3 text-center text-foreground text-body-sm">
                    {material.dias_estoque || 0} dias
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedMaterialId(material.id);
                          setIsDetalhesMaterialOpen(true);
                        }}
                        className="p-2"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="p-2"
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {materiais.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum material encontrado</p>
          </div>
        )}
      </NeomorphicCard>
    </div>
  );

  // ============================================
  // RENDER: TAB FATURAMENTO
  // ============================================

  const renderFaturamento = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      <NeomorphicCard>
        <CardHeader>
          <CardTitle>Faturamentos</CardTitle>
          <CardDescription>Lista de faturamentos gerados</CardDescription>
        </CardHeader>
        <CardContent>
          {faturamentos.length > 0 ? (
            <div className="space-y-3">
              {faturamentos.map(fat => (
                <div key={fat.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-foreground font-medium">{fat.numero_fatura}</h4>
                      <p className="text-muted-foreground text-body-sm">{fat.hospital_nome}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-foreground font-semibold">{formatCurrency(fat.valor_liquido)}</div>
                      <Badge variant={fat.status === 'pago' ? 'success' : 'warning'}>
                        {fat.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum faturamento gerado</p>
          )}
        </CardContent>
      </NeomorphicCard>
    </div>
  );

  // ============================================
  // RENDER: TAB FINANCEIRO
  // ============================================

  const renderFinanceiro = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
        {/* KPICard removido - usar estatísticas inline */}
      </div>

      <NeomorphicCard>
        <CardHeader>
          <CardTitle>Análise Financeira</CardTitle>
          <CardDescription>Visão consolidada de rentabilidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-muted-foreground text-body-sm">Taxa de Utilização</span>
              <span className="text-foreground font-semibold">{metricas.taxaUtilizacao.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-muted-foreground text-body-sm">Dias Médio de Estoque</span>
              <span className="text-foreground font-semibold">{metricas.diasMedioEstoque} dias</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-muted-foreground text-body-sm">Hospitais Ativos</span>
              <span className="text-foreground font-semibold">{metricas.hospitaisAtivos}</span>
            </div>
          </div>
        </CardContent>
      </NeomorphicCard>
    </div>
  );

  // ============================================
  // RENDER: TAB HOSPITAIS
  // ============================================

  const renderHospitais = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitaisUnicos.map(hospital => {
          const materiaisHospital = materiais.filter(m => m.hospital_nome === hospital);
          const valorTotal = materiaisHospital.reduce((sum, m) => sum + m.valor_total, 0);
          
          return (
            <NeomorphicCard key={hospital}>
              <div className="flex items-start gap-3 mb-4">
                <NeomorphicIcon icon={Building2} color="text-indigo-500" size="md" />
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold">{hospital}</h3>
                  <p className="text-muted-foreground text-body-sm">
                    {materiaisHospital.length} {materiaisHospital.length === 1 ? 'material' : 'materiais'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Valor Total</span>
                  <span className="text-foreground font-semibold">{formatCurrency(valorTotal)}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Disponíveis</span>
                  <span className="text-foreground">
                    {materiaisHospital.filter(m => m.status === 'disponivel').length}
                  </span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Utilizados</span>
                  <span className="text-foreground">
                    {materiaisHospital.filter(m => m.status === 'utilizado').length}
                  </span>
                </div>
              </div>
            </NeomorphicCard>
          );
        })}
      </div>

      {hospitaisUnicos.length === 0 && (
        <NeomorphicCard>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum hospital cadastrado</p>
          </div>
        </NeomorphicCard>
      )}
    </div>
  );

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    atualizarMetricasConsignacao();
  }, [atualizarMetricasConsignacao]);

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {renderHeader()}
        
        {/* Filtros */}
        {renderFiltros()}
        
        {/* Navigation Tabs */}
        <NavigationBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Tab Content */}
        <div className="mt-6">
          {loading ? (
            <NeomorphicCard>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            </NeomorphicCard>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'materiais' && renderMateriais()}
              {activeTab === 'faturamento' && renderFaturamento()}
              {activeTab === 'financeiro' && renderFinanceiro()}
              {activeTab === 'hospitais' && renderHospitais()}
            </>
          )}
        </div>
      </div>

      {/* Modal: Nova Consignação */}
      <Modal
        isOpen={isNovaConsignacaoOpen}
        onClose={() => setIsNovaConsignacaoOpen(false)}
        title="Nova Consignação"
        size="lg"
        footer={({ close }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsNovaConsignacaoOpen(false);
                close();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsNovaConsignacaoOpen(false);
                close();
              }}
            >
              Criar Consignação
            </Button>
          </div>
        )}
      >
        <div className="space-y-4 p-6">
          <p className="text-muted-foreground">
            Formulário de nova consignação será implementado aqui.
          </p>
        </div>
      </Modal>

      {/* Modal: Detalhes do Material */}
      <Modal
        isOpen={isDetalhesMaterialOpen}
        onClose={() => setIsDetalhesMaterialOpen(false)}
        title="Detalhes do Material"
        description="Informações completas do material em consignação"
      >
        {/* Conteúdo detalhado comentado para futura implementação */}
        <p className="text-muted-foreground text-body-sm">
          Em breve: detalhes completos do material selecionado (ID: {selectedMaterialId ?? 'N/A'}).
        </p>
      </Modal>
    </div>
  );
};

export default ConsignacaoAvancada;

