# 📊 TABELAS DE PREÇOS OPME — Documentação Completa

**Sistema**: ICARUS v5.0  
**Módulo**: Gestão de Tabelas de Preços OPME  
**Versão**: 1.0.0  
**Data**: ${new Date().toLocaleDateString('pt-BR')}

---

## 🎯 CONTEXTO DO MERCADO OPME BRASILEIRO

### O que são Tabelas de Preços OPME?

No mercado brasileiro de distribuição de materiais OPME (Órteses, Próteses e Materiais Especiais), as **Tabelas de Preços** são documentos estratégicos que definem os valores praticados pela distribuidora para diferentes perfis de clientes:

1. **Hospitais Públicos** — Preços de licitação (geralmente mais baixos)
2. **Hospitais Privados** — Preços negociados por volume
3. **Convênios/Planos de Saúde** — Preços tabelados conforme contrato
4. **Particular** — Preços de varejo
5. **Médicos Parceiros** — Preços especiais para médicos que indicam produtos

---

## 📋 ESTRUTURA DE UMA TABELA DE PREÇOS

### Elementos Essenciais:

```yaml
Tabela de Preços:
  - Nome: "Tabela Hospital XYZ 2025"
  - Tipo: "Hospital Privado"
  - Vigência: De 01/01/2025 até 31/12/2025
  - Status: Ativa/Inativa/Vencida
  - Desconto Geral: 15% (aplicado sobre tabela base)
  - Condição de Pagamento: 30/60 dias
  - Aprovador: Diretor Comercial
  - Data Aprovação: 15/12/2024
  
  Produtos:
    - Produto: Prótese de Quadril Titanium
      Código ANVISA: 80123456789
      Preço Base (Tabela Fabricante): R$ 12.000,00
      Desconto Produto: 20%
      Preço Final: R$ 9.600,00
      Margem: 15%
      
    - Produto: Stent Coronariano
      Código ANVISA: 80234567890
      Preço Base: R$ 3.500,00
      Desconto Produto: 10%
      Preço Final: R$ 3.150,00
      Margem: 12%
```

---

## 🏗️ ARQUITETURA DO MÓDULO

### 1. Banco de Dados (Supabase)

```sql
-- Tabela Principal: tabelas_precos
CREATE TABLE tabelas_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  
  -- Identificação
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  tipo TEXT CHECK (tipo IN (
    'hospital_publico',
    'hospital_privado',
    'convenio',
    'particular',
    'medico_parceiro',
    'licitacao',
    'exportacao'
  )) NOT NULL,
  
  -- Cliente Vinculado (opcional - tabela específica para um cliente)
  cliente_id UUID REFERENCES clientes(id),
  cliente_nome TEXT,
  
  -- Vigência
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT CHECK (status IN ('rascunho', 'ativa', 'inativa', 'vencida')) DEFAULT 'rascunho',
  
  -- Condições Comerciais
  desconto_geral DECIMAL(5, 2) DEFAULT 0, -- % de desconto sobre toda a tabela
  condicao_pagamento TEXT, -- Ex: "30/60 dias", "À vista"
  prazo_entrega_dias INTEGER DEFAULT 7,
  frete TEXT CHECK (frete IN ('cif', 'fob', 'incluso')) DEFAULT 'cif',
  pedido_minimo DECIMAL(12, 2),
  
  -- Aprovação
  aprovado_por UUID REFERENCES usuarios(id),
  aprovado_em TIMESTAMPTZ,
  observacoes TEXT,
  
  -- Auditoria
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- Tabela de Itens: tabelas_precos_itens
CREATE TABLE tabelas_precos_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_id UUID NOT NULL REFERENCES tabelas_precos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  
  -- Preços
  preco_base DECIMAL(12, 2) NOT NULL, -- Preço de referência (fabricante/custo)
  desconto_produto DECIMAL(5, 2) DEFAULT 0, -- % de desconto específico do produto
  preco_final DECIMAL(12, 2) NOT NULL, -- Preço calculado após desconto
  margem_lucro DECIMAL(5, 2), -- % de margem sobre custo
  
  -- Condições Específicas
  quantidade_minima INTEGER DEFAULT 1,
  prazo_entrega_dias INTEGER, -- Sobrescreve prazo geral se definido
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tabela_id, produto_id)
);

-- Índices
CREATE INDEX idx_tabelas_precos_tipo ON tabelas_precos(tipo);
CREATE INDEX idx_tabelas_precos_status ON tabelas_precos(status);
CREATE INDEX idx_tabelas_precos_vigencia ON tabelas_precos(data_inicio, data_fim);
CREATE INDEX idx_tabelas_precos_cliente ON tabelas_precos(cliente_id);
CREATE INDEX idx_tabelas_precos_itens_produto ON tabelas_precos_itens(produto_id);
```

---

## 🎨 INTERFACE DO MÓDULO (Neumorphic Design)

### 2.1. Tela Principal — Lista de Tabelas

```tsx
/**
 * Tela Principal: Gestão de Tabelas de Preços
 * 
 * FUNCIONALIDADES:
 * - Listar todas as tabelas de preços
 * - Filtros: Tipo, Status, Vigência, Cliente
 * - Busca por nome/código
 * - Ações: Criar, Editar, Visualizar, Duplicar, Inativar
 * - Exportar para Excel/PDF
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Download, Edit, Copy, Eye, Trash2, 
  Check, X, Calendar, DollarSign, TrendingUp, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/oraclusx-ds/Button';
import { cn } from '@/lib/utils';

interface TabelaPreco {
  id: string;
  nome: string;
  codigo: string;
  tipo: string;
  cliente_nome?: string;
  data_inicio: string;
  data_fim: string;
  status: 'rascunho' | 'ativa' | 'inativa' | 'vencida';
  desconto_geral: number;
  total_produtos: number;
  valor_total: number;
}

export default function TabelasPrecos() {
  const [tabelas, setTabelas] = useState<TabelaPreco[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('ativa');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarTabelas();
  }, [filtroTipo, filtroStatus]);

  const carregarTabelas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tabelas_precos')
        .select(`
          *,
          tabelas_precos_itens(count)
        `)
        .is('excluido_em', null)
        .order('criado_em', { ascending: false });

      if (filtroTipo !== 'todos') {
        query = query.eq('tipo', filtroTipo);
      }

      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTabelas(data || []);
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const tiposTabela = [
    { value: 'todos', label: 'Todos os Tipos' },
    { value: 'hospital_publico', label: 'Hospital Público' },
    { value: 'hospital_privado', label: 'Hospital Privado' },
    { value: 'convenio', label: 'Convênio' },
    { value: 'particular', label: 'Particular' },
    { value: 'medico_parceiro', label: 'Médico Parceiro' },
    { value: 'licitacao', label: 'Licitação' },
    { value: 'exportacao', label: 'Exportação' },
  ];

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status', icon: null },
    { value: 'ativa', label: 'Ativas', icon: Check, color: 'text-green-600' },
    { value: 'rascunho', label: 'Rascunhos', icon: Edit, color: 'text-yellow-600' },
    { value: 'inativa', label: 'Inativas', icon: X, color: 'text-gray-600' },
    { value: 'vencida', label: 'Vencidas', icon: AlertCircle, color: 'text-red-600' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativa: { label: 'Ativa', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      rascunho: { label: 'Rascunho', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      inativa: { label: 'Inativa', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
      vencida: { label: 'Vencida', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return (
      <span 
        className={cn('px-2 py-1 rounded-md', config.className)}
        style={{ fontSize: '0.75rem', fontWeight: 500 }}
      >
        {config.label}
      </span>
    );
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      hospital_publico: 'Hospital Público',
      hospital_privado: 'Hospital Privado',
      convenio: 'Convênio',
      particular: 'Particular',
      medico_parceiro: 'Médico Parceiro',
      licitacao: 'Licitação',
      exportacao: 'Exportação',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--orx-bg-light)]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-[var(--orx-text-primary)] mb-2" 
              style={{ fontSize: '1.875rem', fontWeight: 700 }}
            >
              Tabelas de Preços OPME
            </h1>
            <p 
              className="text-[var(--orx-text-secondary)]" 
              style={{ fontSize: '1rem' }}
            >
              Gestão de preços por tipo de cliente e condições comerciais
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={Download}>
              Exportar
            </Button>
            <Button variant="primary" icon={Plus}>
              Nova Tabela
            </Button>
          </div>
        </div>

        {/* Estatísticas Inline (sem Cards KPI) */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 rounded-xl bg-[var(--orx-surface)] shadow-sm">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-[var(--orx-primary)]" />
            <p style={{ fontSize: '0.75rem' }} className="text-[var(--orx-text-secondary)] mb-1">
              Tabelas Ativas
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-[var(--orx-text-primary)]">
              {tabelas.filter(t => t.status === 'ativa').length}
            </p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-[var(--orx-surface)] shadow-sm">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p style={{ fontSize: '0.75rem' }} className="text-[var(--orx-text-secondary)] mb-1">
              Vencem em 30 dias
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-[var(--orx-text-primary)]">
              {tabelas.filter(t => {
                const diasFaltando = Math.ceil(
                  (new Date(t.data_fim).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                );
                return diasFaltando > 0 && diasFaltando <= 30;
              }).length}
            </p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-[var(--orx-surface)] shadow-sm">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p style={{ fontSize: '0.75rem' }} className="text-[var(--orx-text-secondary)] mb-1">
              Produtos Tabelados
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-[var(--orx-text-primary)]">
              {tabelas.reduce((sum, t) => sum + (t.total_produtos || 0), 0)}
            </p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-[var(--orx-surface)] shadow-sm">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <p style={{ fontSize: '0.75rem' }} className="text-[var(--orx-text-secondary)] mb-1">
              Vencidas
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-[var(--orx-text-primary)]">
              {tabelas.filter(t => t.status === 'vencida').length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--orx-surface)] shadow-sm">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--orx-text-secondary)]" 
              size={18} 
            />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] border border-[var(--orx-border)] focus:ring-2 focus:ring-[var(--orx-primary)] focus:outline-none"
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Filtro Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] border border-[var(--orx-border)] focus:ring-2 focus:ring-[var(--orx-primary)] focus:outline-none"
            style={{ fontSize: '0.813rem' }}
          >
            {tiposTabela.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] border border-[var(--orx-border)] focus:ring-2 focus:ring-[var(--orx-primary)] focus:outline-none"
            style={{ fontSize: '0.813rem' }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela de Resultados */}
        <div className="overflow-hidden rounded-xl bg-[var(--orx-surface)] shadow-sm">
          <table className="w-full">
            <thead className="bg-[var(--orx-bg-light)] border-b border-[var(--orx-border)]">
              <tr>
                <th 
                  className="text-left p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Tabela
                </th>
                <th 
                  className="text-left p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Tipo
                </th>
                <th 
                  className="text-left p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Cliente
                </th>
                <th 
                  className="text-left p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Vigência
                </th>
                <th 
                  className="text-center p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Produtos
                </th>
                <th 
                  className="text-center p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Desconto
                </th>
                <th 
                  className="text-center p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Status
                </th>
                <th 
                  className="text-right p-4 text-[var(--orx-text-primary)]"
                  style={{ fontSize: '0.813rem', fontWeight: 600 }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--orx-text-secondary)]">
                    Carregando...
                  </td>
                </tr>
              ) : tabelas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--orx-text-secondary)]">
                    Nenhuma tabela encontrada
                  </td>
                </tr>
              ) : (
                tabelas
                  .filter((t) =>
                    busca
                      ? t.nome.toLowerCase().includes(busca.toLowerCase()) ||
                        t.codigo.toLowerCase().includes(busca.toLowerCase())
                      : true
                  )
                  .map((tabela) => (
                    <tr 
                      key={tabela.id} 
                      className="border-b border-[var(--orx-border)] hover:bg-[var(--orx-bg-light)] transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p 
                            className="text-[var(--orx-text-primary)]"
                            style={{ fontSize: '0.875rem', fontWeight: 500 }}
                          >
                            {tabela.nome}
                          </p>
                          <p 
                            className="text-[var(--orx-text-secondary)] font-mono"
                            style={{ fontSize: '0.75rem' }}
                          >
                            {tabela.codigo}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span 
                          className="text-[var(--orx-text-primary)]"
                          style={{ fontSize: '0.813rem' }}
                        >
                          {getTipoLabel(tabela.tipo)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          className="text-[var(--orx-text-primary)]"
                          style={{ fontSize: '0.813rem' }}
                        >
                          {tabela.cliente_nome || '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p 
                            className="text-[var(--orx-text-primary)]"
                            style={{ fontSize: '0.813rem' }}
                          >
                            {new Date(tabela.data_inicio).toLocaleDateString('pt-BR')}
                          </p>
                          <p 
                            className="text-[var(--orx-text-secondary)]"
                            style={{ fontSize: '0.75rem' }}
                          >
                            até {new Date(tabela.data_fim).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span 
                          className="text-[var(--orx-text-primary)]"
                          style={{ fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          {tabela.total_produtos || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span 
                          className="text-[var(--orx-primary)]"
                          style={{ fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          {tabela.desconto_geral}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(tabela.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2 rounded-lg hover:bg-[var(--orx-bg-light)] transition-colors"
                            title="Visualizar"
                          >
                            <Eye size={16} className="text-[var(--orx-text-secondary)]" />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-[var(--orx-bg-light)] transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} className="text-[var(--orx-primary)]" />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-[var(--orx-bg-light)] transition-colors"
                            title="Duplicar"
                          >
                            <Copy size={16} className="text-blue-600" />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-[var(--orx-bg-light)] transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ PRÓXIMOS ARQUIVOS A CRIAR

1. **Formulário de Criação/Edição de Tabela** (`FormularioTabelaPrecos.tsx`)
2. **Seletor de Produtos para Tabela** (`SeletorProdutosTabela.tsx`)
3. **Visualizador de Tabela** (`VisualizadorTabelaPrecos.tsx`)
4. **Comparador de Tabelas** (`ComparadorTabelas.tsx`)
5. **Gerador de Proposta Comercial** (`GeradorPropostaComercial.tsx`)

**Status**: ✅ Módulo base implementado — Próximo passo criar formulário completo

