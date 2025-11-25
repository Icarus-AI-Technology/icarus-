import { useMemo, useState } from 'react';
import {
  ModulePageNeumo,
  type ModuleKpiItem,
  type ModuleTabItem,
} from '@/components/oraclusx-ds/ModulePageNeumo';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { Button } from '@/components/oraclusx-ds/Button';
import { Input } from '@/components/oraclusx-ds/Input';
import { Select } from '@/components/oraclusx-ds/Form';
import { NeumoForm } from '@/components/oraclusx-ds/forms/NeumoForm';
import { NeumoField } from '@/components/oraclusx-ds/forms/NeumoField';
import { FileText, Package, ArrowDownToLine, ArrowUpToLine, CheckCircle } from 'lucide-react';

type NotaStatus = 'entrada' | 'saida' | 'em_validacao' | 'cancelada';

interface NotaCompra {
  id: string;
  numero: string;
  tipo: NotaStatus;
  fornecedor: string;
  valor: number;
  data: string;
}

const MOCK_NOTAS: NotaCompra[] = [
  {
    id: 'nota-001',
    numero: 'NF-2024-001',
    tipo: 'entrada',
    fornecedor: 'MedSupply Brasil',
    valor: 14500,
    data: '2024-11-15',
  },
  {
    id: 'nota-002',
    numero: 'NF-2024-002',
    tipo: 'saida',
    fornecedor: 'Ortopmed Distribuidora',
    valor: 8700,
    data: '2024-11-12',
  },
  {
    id: 'nota-003',
    numero: 'NF-2024-003',
    tipo: 'em_validacao',
    fornecedor: 'CardioPlus Importados',
    valor: 22600,
    data: '2024-11-17',
  },
];

const statusLabels: Record<NotaStatus, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  em_validacao: 'Em Validação',
  cancelada: 'Cancelada',
};

const statusBadge: Record<NotaStatus, 'success' | 'info' | 'warning' | 'default'> = {
  entrada: 'success',
  saida: 'info',
  em_validacao: 'warning',
  cancelada: 'default',
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function NotasCompra(): JSX.Element {
  const [notas] = useState<NotaCompra[]>(MOCK_NOTAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('todas');
  const [notaForm, setNotaForm] = useState({
    numero: '',
    tipo: 'entrada',
    fornecedor: '',
    valor: '',
    data: '',
  });

  const kpis = useMemo<ModuleKpiItem[]>(() => {
    const total = notas.reduce((sum, nota) => sum + nota.valor, 0);
    const entradas = notas
      .filter((nota) => nota.tipo === 'entrada')
      .reduce((sum, nota) => sum + nota.valor, 0);
    const saidas = notas
      .filter((nota) => nota.tipo === 'saida')
      .reduce((sum, nota) => sum + nota.valor, 0);

    return [
      {
        id: 'notas',
        icon: FileText,
        label: 'Notas registradas',
        value: notas.length,
        subtitle: 'Últimos 30 dias',
        trend: '+4%',
        trendPositive: true,
      },
      {
        id: 'entradas',
        icon: ArrowDownToLine,
        label: 'Entradas',
        value: formatCurrency(entradas),
        subtitle: 'Compras homologadas',
        trend: '+2%',
        trendPositive: true,
      },
      {
        id: 'saidas',
        icon: ArrowUpToLine,
        label: 'Saídas',
        value: formatCurrency(saidas),
        subtitle: 'Devoluções / ajustes',
        trend: '-1%',
        trendPositive: false,
      },
      {
        id: 'valor_total',
        icon: Package,
        label: 'Valor movimentado',
        value: formatCurrency(total),
        subtitle: 'Somatório líquido',
        trend: '+6%',
        trendPositive: true,
      },
    ];
  }, [notas]);

  const tabs = useMemo<ModuleTabItem[]>(() => {
    const counts = notas.reduce<Record<string, number>>((acc, nota) => {
      acc[nota.tipo] = (acc[nota.tipo] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: 'todas', label: 'Todas', count: notas.length },
      { id: 'entrada', label: 'Entradas', count: counts.entrada ?? 0 },
      { id: 'saida', label: 'Saídas', count: counts.saida ?? 0 },
      { id: 'em_validacao', label: 'Em Validação', count: counts.em_validacao ?? 0 },
      { id: 'cancelada', label: 'Canceladas', count: counts.cancelada ?? 0 },
    ];
  }, [notas]);

  const filteredNotas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return notas
      .filter((nota) => (activeTab === 'todas' ? true : nota.tipo === activeTab))
      .filter(
        (nota) =>
          nota.numero.toLowerCase().includes(term) || nota.fornecedor.toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [notas, activeTab, searchTerm]);

  return (
    <ModulePageNeumo
      title="Notas de Compra"
      subtitle="Controle fiscal de entradas, saídas e ajustes de nota"
      kpis={kpis}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Buscar por nota, fornecedor ou tipo..."
      onSearchChange={setSearchTerm}
      onFilterClick={() => alert('Filtros avançados de notas')}
      primaryActionLabel="+ Nova nota"
      onPrimaryAction={() => alert('Abrir formulário de nova nota')}
    >
      <div className="grid gap-6">
        <div className="ic-card-neumo rounded-[32px] p-6 space-y-4">
          {filteredNotas.length === 0 ? (
            <p className="text-center text-white/60">Nenhuma nota encontrada.</p>
          ) : (
            filteredNotas.map((nota) => (
              <div
                key={nota.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-white/10 last:border-none"
              >
                <div>
                  <p className="text-white font-semibold">{nota.numero}</p>
                  <p className="text-white/70 text-sm">{nota.fornecedor}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/70">
                    {new Date(nota.data).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {formatCurrency(nota.valor)}
                  </span>
                  <Badge variant={statusBadge[nota.tipo]}>{statusLabels[nota.tipo]}</Badge>
                </div>
              </div>
            ))
          )}
        </div>

        <NeumoForm
          title="Cadastrar Nota"
          description="Registre novas notas fiscais de entrada ou saída."
          actions={
            <Button variant="primary" icon={<CheckCircle className="w-4 h-4" />}>
              Salvar Nota
            </Button>
          }
        >
          <div className="grid md:grid-cols-2 gap-4">
            <NeumoField label="Número da nota">
              <Input
                placeholder="NF-2024-105"
                value={notaForm.numero}
                onChange={(e) => setNotaForm((prev) => ({ ...prev, numero: e.target.value }))}
              />
            </NeumoField>
            <NeumoField label="Tipo">
              <Select
                value={notaForm.tipo}
                onChange={(e) => setNotaForm((prev) => ({ ...prev, tipo: e.target.value }))}
                options={[
                  { value: 'entrada', label: 'Entrada' },
                  { value: 'saida', label: 'Saída' },
                  { value: 'em_validacao', label: 'Em validação' },
                ]}
              />
            </NeumoField>
            <NeumoField label="Fornecedor">
              <Input
                placeholder="Nome do fornecedor"
                value={notaForm.fornecedor}
                onChange={(e) => setNotaForm((prev) => ({ ...prev, fornecedor: e.target.value }))}
              />
            </NeumoField>
            <NeumoField label="Valor">
              <Input
                type="number"
                placeholder="0,00"
                value={notaForm.valor}
                onChange={(e) => setNotaForm((prev) => ({ ...prev, valor: e.target.value }))}
              />
            </NeumoField>
            <NeumoField label="Data da nota">
              <Input
                type="date"
                value={notaForm.data}
                onChange={(e) => setNotaForm((prev) => ({ ...prev, data: e.target.value }))}
              />
            </NeumoField>
          </div>
        </NeumoForm>
      </div>
    </ModulePageNeumo>
  );
}
