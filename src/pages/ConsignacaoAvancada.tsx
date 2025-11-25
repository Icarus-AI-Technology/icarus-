/**
 * Consignação Avançada - Layout padronizado com ModulePageNeumo
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  AlertCircle,
  Building2,
  BarChart3,
  Search,
  Eye,
  Edit,
} from 'lucide-react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Button } from '@/components/oraclusx-ds/Button';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { Input } from '@/components/oraclusx-ds/Input';
import { Select } from '@/components/oraclusx-ds/Form';
import { NeumoForm } from '@/components/oraclusx-ds/forms/NeumoForm';
import { NeumoField } from '@/components/oraclusx-ds/forms/NeumoField';
import { Textarea } from '@/components/oraclusx-ds/Textarea';
import { Modal } from '@/components/oraclusx-ds/Modal';
import { cn } from '@/lib/utils';
import { useConsignacao } from '@/hooks';

interface MaterialRowProps {
  id: string;
  codigo_interno: string;
  nome: string;
  hospital_nome: string;
  quantidade: number;
  valor_total: number;
  status: string;
  dias_estoque?: number;
  lote?: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, { label: string; color: string; bg: string }> = {
    disponivel: { label: 'Disponível', color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    reservado: { label: 'Reservado', color: 'text-amber-300', bg: 'bg-amber-500/10' },
    utilizado: { label: 'Utilizado', color: 'text-sky-300', bg: 'bg-sky-500/10' },
    devolvido: { label: 'Devolvido', color: 'text-purple-300', bg: 'bg-purple-500/10' },
    vencido: { label: 'Vencido', color: 'text-rose-300', bg: 'bg-rose-500/10' },
    danificado: { label: 'Danificado', color: 'text-orange-300', bg: 'bg-orange-500/10' },
  };
  const variant = variants[status] || variants.disponivel;
  return (
    <Badge
      variant="default"
      className={cn('px-3 py-1 text-xs font-semibold', variant.bg, variant.color)}
    >
      {variant.label}
    </Badge>
  );
};

const ConsignacaoAvancada: React.FC = () => {
  const {
    materiais,
    faturamentos,
    alertas,
    loading,
    metricas,
    filtros,
    setFiltros,
    atualizarMetricasConsignacao,
  } = useConsignacao();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'materiais' | 'faturamento' | 'financeiro' | 'hospitais'
  >('dashboard');
  const [search, setSearch] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isNovaConsignacaoOpen, setNovaConsignacaoOpen] = useState(false);
  const [isDetalhesOpen, setDetalhesOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  useEffect(() => {
    atualizarMetricasConsignacao();
  }, [atualizarMetricasConsignacao]);

  const formatCurrency = useCallback((value: number | undefined) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value ?? 0);
  }, []);

  const moduleKpis = useMemo<ModuleKpiItem[]>(
    () => [
      {
        id: 'valorEstoque',
        icon: DollarSign,
        label: 'Valor em Estoque',
        value: formatCurrency(metricas?.valorTotalEstoque),
        subtitle: 'Materiais consignados',
        trend: '+2.4% este mês',
        trendPositive: true,
      },
      {
        id: 'materiais',
        icon: Package,
        label: 'Materiais Disponíveis',
        value: metricas?.materiaisDisponiveis ?? 0,
        subtitle: 'Itens liberados',
        trend: '+8 novos',
        trendPositive: true,
      },
      {
        id: 'taxaUtilizacao',
        icon: BarChart3,
        label: 'Taxa de Utilização',
        value: `${metricas?.taxaUtilizacao?.toFixed(1) ?? '0'}%`,
        subtitle: 'Últimos 30 dias',
        trend: '+1.3%',
        trendPositive: true,
      },
      {
        id: 'hospitais',
        icon: Building2,
        label: 'Hospitais Ativos',
        value: metricas?.hospitaisAtivos ?? 0,
        subtitle: 'Com consignação vigente',
        trend: '+1 nesta semana',
        trendPositive: true,
      },
    ],
    [metricas, formatCurrency]
  );

  const moduleTabs = useMemo<ModuleTabItem[]>(
    () => [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'materiais', label: 'Materiais', count: metricas?.totalMateriais },
      { id: 'faturamento', label: 'Faturamento', count: faturamentos.length },
      { id: 'financeiro', label: 'Financeiro' },
      { id: 'hospitais', label: 'Hospitais', count: metricas?.hospitaisAtivos },
    ],
    [metricas, faturamentos.length]
  );

  const materiaisFiltrados = useMemo(() => {
    const term = search.toLowerCase();
    return materiais
      .filter((m) =>
        filtros.status && filtros.status !== 'todos' ? m.status === filtros.status : true
      )
      .filter((m) =>
        filtros.hospital && filtros.hospital !== 'todos'
          ? m.hospital_nome === filtros.hospital
          : true
      )
      .filter(
        (m) =>
          m.nome.toLowerCase().includes(term) ||
          (m.hospital_nome ?? '').toLowerCase().includes(term) ||
          (m.codigo_interno ?? '').toLowerCase().includes(term)
      );
  }, [materiais, filtros, search]);

  const hospitaisUnicos = useMemo(
    () => Array.from(new Set(materiais.map((m) => m.hospital_nome))).sort(),
    [materiais]
  );

  const renderFiltros = () => (
    <div className="ic-card-neumo rounded-[28px] p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
          <Input
            placeholder="Buscar materiais, hospitais, lotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
        <NeumoField label="Status">
          <Select
            value={filtros.status || 'todos'}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            options={[
              { value: 'todos', label: 'Todos os Status' },
              { value: 'disponivel', label: 'Disponível' },
              { value: 'reservado', label: 'Reservado' },
              { value: 'utilizado', label: 'Utilizado' },
              { value: 'devolvido', label: 'Devolvido' },
              { value: 'vencido', label: 'Vencido' },
              { value: 'danificado', label: 'Danificado' },
            ]}
          />
        </NeumoField>
        <NeumoField label="Hospital">
          <Select
            value={filtros.hospital || 'todos'}
            onChange={(e) => setFiltros({ ...filtros, hospital: e.target.value })}
            options={[
              { value: 'todos', label: 'Todos os Hospitais' },
              ...hospitaisUnicos.map((h) => ({ value: h, label: h })),
            ]}
          />
        </NeumoField>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {alertas.length > 0 && (
        <div className="ic-card-neumo rounded-[28px] p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <h3 className="text-white font-semibold flex-1">Alertas de Conferência</h3>
            <Badge variant="error">
              {alertas.filter((a) => a.status === 'ativo').length} pendente(s)
            </Badge>
          </div>
          <div className="space-y-3">
            {alertas.slice(0, 3).map((alerta) => (
              <div
                key={alerta.id}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-white font-medium">{alerta.titulo}</p>
                <p className="text-white/70 text-sm">{alerta.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMateriais = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto ic-card-neumo rounded-[32px]">
        <table className="w-full">
          <thead>
            <tr className="text-white/60 text-xs uppercase">
              <th className="text-left p-4">Código</th>
              <th className="text-left p-4">Material</th>
              <th className="text-left p-4">Hospital</th>
              <th className="text-right p-4">Quantidade</th>
              <th className="text-right p-4">Valor Total</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Dias Estoque</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {materiaisFiltrados.slice(0, 12).map((material: MaterialRowProps) => (
              <tr key={material.id} className="border-t border-white/10">
                <td className="p-4 font-mono text-sm text-white/80">{material.codigo_interno}</td>
                <td className="p-4 text-white">
                  <div className="font-semibold">{material.nome}</div>
                  {material.lote && (
                    <div className="text-white/60 text-sm">Lote: {material.lote}</div>
                  )}
                </td>
                <td className="p-4 text-white/80">{material.hospital_nome}</td>
                <td className="p-4 text-right text-white/80">{material.quantidade}</td>
                <td className="p-4 text-right text-emerald-300 font-semibold">
                  {formatCurrency(material.valor_total)}
                </td>
                <td className="p-4 text-center">
                  <StatusBadge status={material.status} />
                </td>
                <td className="p-4 text-center text-white/80">{material.dias_estoque ?? 0} dias</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedMaterialId(material.id);
                        setDetalhesOpen(true);
                      }}
                    >
                      Ver
                    </Button>
                    <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>
                      Editar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {materiaisFiltrados.length === 0 && (
          <div className="text-center py-12 text-white/60">Nenhum material encontrado</div>
        )}
      </div>
    </div>
  );

  const renderFaturamento = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {faturamentos.slice(0, 3).map((fat) => (
          <div key={fat.id} className="ic-card-neumo rounded-[28px] p-4">
            <p className="text-white font-semibold">{fat.numero_fatura}</p>
            <p className="text-white/70 text-sm">{fat.hospital_nome}</p>
            <p className="text-emerald-300 font-semibold mt-2">
              {formatCurrency(fat.valor_liquido)}
            </p>
            <Badge variant={fat.status === 'pago' ? 'success' : 'warning'} className="mt-3">
              {fat.status}
            </Badge>
          </div>
        ))}
      </div>
      {faturamentos.length === 0 && (
        <div className="ic-card-neumo rounded-[28px] p-8 text-center text-white/70">
          Nenhum faturamento gerado
        </div>
      )}
    </div>
  );

  const renderFinanceiro = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="ic-card-neumo rounded-[28px] p-4">
          <p className="text-white/70 text-sm">Taxa de Utilização</p>
          <p className="text-white text-2xl font-semibold">
            {metricas?.taxaUtilizacao?.toFixed(1) ?? 0}%
          </p>
        </div>
        <div className="ic-card-neumo rounded-[28px] p-4">
          <p className="text-white/70 text-sm">Dias Médio de Estoque</p>
          <p className="text-white text-2xl font-semibold">
            {metricas?.diasMedioEstoque ?? 0} dias
          </p>
        </div>
        <div className="ic-card-neumo rounded-[28px] p-4">
          <p className="text-white/70 text-sm">Hospitais Ativos</p>
          <p className="text-white text-2xl font-semibold">{metricas?.hospitaisAtivos ?? 0}</p>
        </div>
      </div>
    </div>
  );

  const renderHospitais = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hospitaisUnicos.map((hospital) => {
        const materiaisHospital = materiais.filter((m) => m.hospital_nome === hospital);
        const valorTotal = materiaisHospital.reduce((sum, m) => sum + (m.valor_total ?? 0), 0);
        return (
          <div key={hospital} className="ic-card-neumo rounded-[28px] p-6 space-y-2">
            <div className="text-white font-semibold">{hospital}</div>
            <div className="text-white/70 text-sm">
              {materiaisHospital.length} materiais consignados
            </div>
            <div className="flex justify-between text-white">
              <span className="text-white/60 text-sm">Valor Total</span>
              <span className="text-emerald-300 font-semibold">{formatCurrency(valorTotal)}</span>
            </div>
          </div>
        );
      })}
      {hospitaisUnicos.length === 0 && (
        <div className="ic-card-neumo rounded-[28px] p-10 text-center text-white/70">
          <Building2 className="w-12 h-12 mx-auto mb-3" />
          Nenhum hospital cadastrado
        </div>
      )}
    </div>
  );

  return (
    <ModulePageNeumo
      title="Consignação Avançada"
      subtitle="Gestão completa de materiais consignados com controle financeiro e logístico"
      kpis={moduleKpis}
      tabs={moduleTabs}
      activeTabId={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
      searchPlaceholder="Buscar materiais, hospitais, lotes..."
      onSearchChange={setSearch}
      onFilterClick={() => alert('Filtros avançados em desenvolvimento')}
      primaryActionLabel="Nova Consignação"
      onPrimaryAction={() => setNovaConsignacaoOpen(true)}
    >
      <div className="space-y-8">
        {renderFiltros()}
        {loading ? (
          <div className="ic-card-neumo rounded-[28px] p-10 text-center text-white/70">
            Carregando...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'materiais' && renderMateriais()}
            {activeTab === 'faturamento' && renderFaturamento()}
            {activeTab === 'financeiro' && renderFinanceiro()}
            {activeTab === 'hospitais' && renderHospitais()}
          </>
        )}
        <NeumoForm
          title="Notas internas"
          actions={<Button onClick={() => alert('Notas salvas')}>Salvar notas</Button>}
        >
          <NeumoField label="Observações">
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={4}
              placeholder="Compartilhe aprendizados com a equipe..."
            />
          </NeumoField>
        </NeumoForm>
      </div>

      <Modal
        isOpen={isNovaConsignacaoOpen}
        onClose={() => setNovaConsignacaoOpen(false)}
        title="Nova Consignação"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setNovaConsignacaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setNovaConsignacaoOpen(false)}>Criar consignação</Button>
          </div>
        }
      >
        <NeumoForm>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeumoField label="Hospital">
              <Input placeholder="Hospital referência" />
            </NeumoField>
            <NeumoField label="Número da consignação">
              <Input placeholder="CNSA-0001" />
            </NeumoField>
          </div>
        </NeumoForm>
      </Modal>

      <Modal
        isOpen={isDetalhesOpen}
        onClose={() => setDetalhesOpen(false)}
        title="Detalhes do Material"
        description={`Material selecionado: ${selectedMaterialId ?? 'N/A'}`}
      >
        <p className="text-white/70">Em breve exibiremos todo o histórico do material.</p>
      </Modal>
    </ModulePageNeumo>
  );
};

export default ConsignacaoAvancada;
