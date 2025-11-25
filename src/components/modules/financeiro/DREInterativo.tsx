import React, { useState } from 'react';
import { Card } from '@/components/oraclusx-ds';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Filter,
} from 'lucide-react';

// Tipos para o DRE
export interface DREItem {
  id: string;
  codigo: string;
  descricao: string;
  valorAtual: number;
  valorAnterior: number;
  tipo: 'receita' | 'despesa' | 'resultado';
  nivel: number;
  filhos?: DREItem[];
  visivel?: boolean;
}

const DRE_MOCK_DATA: DREItem[] = [
  {
    id: '1',
    codigo: '1',
    descricao: 'RECEITA BRUTA OPERACIONAL',
    valorAtual: 150000,
    valorAnterior: 140000,
    tipo: 'receita',
    nivel: 1,
    filhos: [
      {
        id: '1.1',
        codigo: '1.1',
        descricao: 'Venda de Produtos',
        valorAtual: 100000,
        valorAnterior: 90000,
        tipo: 'receita',
        nivel: 2,
      },
      {
        id: '1.2',
        codigo: '1.2',
        descricao: 'Prestação de Serviços',
        valorAtual: 50000,
        valorAnterior: 50000,
        tipo: 'receita',
        nivel: 2,
      },
    ],
  },
  {
    id: '2',
    codigo: '2',
    descricao: '(-) DEDUÇÕES DA RECEITA BRUTA',
    valorAtual: -15000,
    valorAnterior: -14000,
    tipo: 'despesa',
    nivel: 1,
    filhos: [
      {
        id: '2.1',
        codigo: '2.1',
        descricao: 'Impostos sobre Vendas',
        valorAtual: -10000,
        valorAnterior: -9000,
        tipo: 'despesa',
        nivel: 2,
      },
      {
        id: '2.2',
        codigo: '2.2',
        descricao: 'Devoluções e Abatimentos',
        valorAtual: -5000,
        valorAnterior: -5000,
        tipo: 'despesa',
        nivel: 2,
      },
    ],
  },
  {
    id: '3',
    codigo: '3',
    descricao: '(=) RECEITA LÍQUIDA OPERACIONAL',
    valorAtual: 135000,
    valorAnterior: 126000,
    tipo: 'resultado',
    nivel: 1,
  },
  {
    id: '4',
    codigo: '4',
    descricao: '(-) CUSTOS DAS VENDAS',
    valorAtual: -60000,
    valorAnterior: -55000,
    tipo: 'despesa',
    nivel: 1,
    filhos: [
      {
        id: '4.1',
        codigo: '4.1',
        descricao: 'Custo dos Produtos Vendidos (CPV)',
        valorAtual: -40000,
        valorAnterior: -35000,
        tipo: 'despesa',
        nivel: 2,
      },
      {
        id: '4.2',
        codigo: '4.2',
        descricao: 'Custo dos Serviços Prestados (CSP)',
        valorAtual: -20000,
        valorAnterior: -20000,
        tipo: 'despesa',
        nivel: 2,
      },
    ],
  },
  {
    id: '5',
    codigo: '5',
    descricao: '(=) LUCRO BRUTO',
    valorAtual: 75000,
    valorAnterior: 71000,
    tipo: 'resultado',
    nivel: 1,
  },
  {
    id: '6',
    codigo: '6',
    descricao: '(-) DESPESAS OPERACIONAIS',
    valorAtual: -30000,
    valorAnterior: -28000,
    tipo: 'despesa',
    nivel: 1,
    filhos: [
      {
        id: '6.1',
        codigo: '6.1',
        descricao: 'Despesas Administrativas',
        valorAtual: -15000,
        valorAnterior: -14000,
        tipo: 'despesa',
        nivel: 2,
      },
      {
        id: '6.2',
        codigo: '6.2',
        descricao: 'Despesas com Pessoal',
        valorAtual: -10000,
        valorAnterior: -10000,
        tipo: 'despesa',
        nivel: 2,
      },
      {
        id: '6.3',
        codigo: '6.3',
        descricao: 'Despesas Comerciais',
        valorAtual: -5000,
        valorAnterior: -4000,
        tipo: 'despesa',
        nivel: 2,
      },
    ],
  },
  {
    id: '7',
    codigo: '7',
    descricao: '(=) RESULTADO OPERACIONAL (EBITDA)',
    valorAtual: 45000,
    valorAnterior: 43000,
    tipo: 'resultado',
    nivel: 1,
  },
];

export default function DREInterativo() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1', '2', '4', '6']));
  const [periodo, setPeriodo] = useState('mes_atual');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateVariation = (atual: number, anterior: number) => {
    if (anterior === 0) return 0;
    return ((atual - anterior) / Math.abs(anterior)) * 100;
  };

  const renderRow = (item: DREItem) => {
    const hasChildren = item.filhos && item.filhos.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const variation = calculateVariation(item.valorAtual, item.valorAnterior);
    const isPositive = variation > 0;
    const isNegative = variation < 0;

    return (
      <React.Fragment key={item.id}>
        <tr
          className={`
            border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors
            ${item.nivel === 1 ? 'bg-[var(--surface-raised)] font-medium' : ''}
            ${item.tipo === 'resultado' ? 'bg-[var(--surface-sunken)] font-bold text-[var(--primary)]' : ''}
          `}
        >
          <td className="p-4">
            <div
              className="flex items-center gap-2 cursor-pointer"
              style={{ paddingLeft: `${(item.nivel - 1) * 20}px` }}
              onClick={() => hasChildren && toggleExpand(item.id)}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                )
              ) : (
                <span className="w-4 h-4" />
              )}
              <span className="text-body-sm text-[var(--text-secondary)] font-mono">
                {item.codigo}
              </span>
              <span className="text-body-sm text-[var(--text-primary)]">{item.descricao}</span>
            </div>
          </td>
          <td className="p-4 text-right text-body-sm text-[var(--text-primary)]">
            {formatCurrency(item.valorAtual)}
          </td>
          <td className="p-4 text-right text-body-sm text-[var(--text-secondary)]">
            {formatCurrency(item.valorAnterior)}
          </td>
          <td className="p-4 text-right">
            <div
              className={`flex items-center justify-end gap-1 text-body-xs font-medium ${isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-[var(--text-secondary)]'}`}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {Math.abs(variation).toFixed(1)}%
            </div>
          </td>
          <td className="p-4 text-right text-body-sm text-[var(--text-secondary)]">
            {((item.valorAtual / DRE_MOCK_DATA[0].valorAtual) * 100).toFixed(1)}%
          </td>
        </tr>
        {hasChildren && isExpanded && item.filhos?.map((child) => renderRow(child))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-heading-md font-display text-[var(--text-primary)]">DRE Gerencial</h2>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl neuro-inset">
            <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="bg-transparent border-none text-body-sm text-[var(--text-primary)] focus:outline-none"
            >
              <option value="mes_atual">Mês Atual</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Ano Atual</option>
            </select>
          </div>

          <button
            className="neuro-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
            title="Exportar PDF/Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Tabela DRE */}
      <Card className="neuro-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-raised)]">
              <tr>
                <th className="text-left p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium w-[40%]">
                  Descrição
                </th>
                <th className="text-right p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium w-[15%]">
                  Realizado
                </th>
                <th className="text-right p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium w-[15%]">
                  Anterior
                </th>
                <th className="text-right p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium w-[15%]">
                  Var. %
                </th>
                <th className="text-right p-4 text-body-sm text-[var(--text-secondary)] orx-orx-font-medium w-[15%]">
                  AV %
                </th>
              </tr>
            </thead>
            <tbody>{DRE_MOCK_DATA.map((item) => renderRow(item))}</tbody>
          </table>
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex gap-6 text-body-xs text-[var(--text-secondary)] px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--surface-raised)] border border-[var(--border)]"></div>
          <span>Contas Sintéticas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--surface-sunken)] border border-[var(--primary)]"></div>
          <span>Resultados</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-success font-bold">AV %</span>
          <span>Análise Vertical (sobre Receita Bruta)</span>
        </div>
      </div>
    </div>
  );
}
