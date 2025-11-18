/**
 * Dashboard de Compras e Fornecedores - ICARUS v5.0
 * 
 * Visão geral do módulo de compras
 * Design: OraclusX DS - Neumorphism Premium 3D
 */

import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Cpu, Package, Plus, AlertTriangle } from 'lucide-react';

// ========================================
// COMPONENTE DE KPI CARD
// ========================================

// KPICard component removido (placeholder)

// ========================================
// DASHBOARD DE COMPRAS
// ========================================

export const DashboardCompras: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart size={32} className="text-[var(--orx-info)]" />
          <div>
            <h1 className="text-[0.813rem] orx-orx-font-extrabold text-[var(--orx-text-primary)] mb-1 font-display">
              Compras e Fornecedores
            </h1>
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)] font-sans">
              Gestão completa de compras e relacionamento com fornecedores
            </p>
          </div>
        </div>
      </div>

      {/* QA Filters (only with ?qa=1) */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('qa') === '1' && (
        <form aria-label="Filtros QA Compras" className="rounded-2xl p-4 neuro-raised mb-6 grid [grid-template-columns:1.2fr_0.8fr_0.8fr_0.6fr] gap-3 items-end">
          <div>
            <label htmlFor="qa-busca-compras" className="text-[0.75rem] text-[var(--orx-text-secondary)]">Busca</label>
            <input id="qa-busca-compras" name="busca" placeholder="Fornecedor, pedido, cotação" className="w-full px-3 py-2 rounded-xl" />
          </div>
          <div>
            <label htmlFor="qa-periodo-inicio" className="text-[0.75rem] text-[var(--orx-text-secondary)]">Início</label>
            <input id="qa-periodo-inicio" name="inicio" type="date" className="w-full px-3 py-2 rounded-xl" />
          </div>
          <div>
            <label htmlFor="qa-periodo-fim" className="text-[0.75rem] text-[var(--orx-text-secondary)]">Fim</label>
            <input id="qa-periodo-fim" name="fim" type="date" className="w-full px-3 py-2 rounded-xl" />
          </div>
          <div>
            <label htmlFor="qa-status-compras" className="text-[0.75rem] text-[var(--orx-text-secondary)]">Status</label>
            <select id="qa-status-compras" name="status" className="w-full px-3 py-2 rounded-xl">
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="col-span-full flex gap-2">
            <button type="submit" className="neuro-button px-3 py-2 rounded-xl" aria-label="Aplicar filtros">Aplicar</button>
            <button type="button" className="neuro-button px-3 py-2 rounded-xl" aria-label="Limpar filtros">Limpar</button>
          </div>
        </form>
      )}

      {/* KPIs Grid - 4 colunas */}
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-8">
        {/* KPI slots aguardando implementação */}
      </div>

      {/* QA Table (only with ?qa=1) */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('qa') === '1' && (
        <div className="neuro-raised rounded-2xl p-4 mb-6">
          <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-3">Pedidos (QA)</h2>
          <div className="overflow-x-auto">
            <table role="table" className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Fornecedor</th>
                  <th className="text-left p-2">Valor</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <tr key={i}>
                    <td className="p-2">PO-{1000 + i}</td>
                    <td className="p-2">Fornecedor {i}</td>
                    <td className="p-2">R$ {(i * 1234).toLocaleString('pt-BR')}</td>
                    <td className="p-2">{i % 3 === 0 ? 'Cancelado' : i % 2 === 0 ? 'Aprovado' : 'Pendente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" aria-label="Página Anterior" className="neuro-button">Anterior</button>
            <button type="button" aria-label="Próxima Página" className="neuro-button">Próximo</button>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="neuro-raised rounded-2xl p-6 mb-8">
        <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-4 font-display">Ações Rápidas</h2>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <button
            onClick={() => navigate('/compras/cotacoes?action=nova')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-white bg-blue-600/90 shadow hover:brightness-110 transition"
          >
            <Plus size={18} className="text-white" />
            <span className="text-white">Nova Cotação</span>
          </button>

          <button
            onClick={() => navigate('/compras/pedidos?action=novo')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-white bg-purple-600/90 shadow hover:brightness-110 transition"
          >
            <Plus size={18} className="text-white" />
            <span className="text-white">Novo Pedido</span>
          </button>

          <button
            onClick={() => navigate('/compras/ia')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-white bg-indigo-600/90 shadow hover:brightness-110 transition"
          >
            <Cpu size={18} className="text-white" />
            <span className="text-white">Sugestões IA</span>
          </button>

          <button
            onClick={() => navigate('/cadastros/fornecedores')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-white bg-teal-500/90 shadow hover:brightness-110 transition"
          >
            <Package size={18} className="text-white" />
            <span className="text-white">Gerenciar Fornecedores</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      <div className="neuro-raised rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-[var(--orx-warning)]" />
          <h2 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] font-display">Alertas e Pendências</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/30">
            <p className="text-[0.813rem] text-[var(--orx-text-primary)]">
              <strong>5 cotações</strong> aguardando resposta há mais de 3 dias
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30">
            <p className="text-[0.813rem] text-[var(--orx-text-primary)]">
              <strong>3 pedidos</strong> com atraso na entrega
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30">
            <p className="text-[0.813rem] text-[var(--orx-text-primary)]">
              <strong>IA sugere:</strong> Consolidar compras de 3 fornecedores (economia estimada de R$ 23.500,00)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCompras;

