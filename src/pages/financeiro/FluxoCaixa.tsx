/**
 * Fluxo de Caixa
 * Página para visualizar fluxo de caixa e projeções
 */

import { Card } from '@/components/oraclusx-ds/Card';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useFluxoCaixa } from '@/hooks/useFluxoCaixa';

export default function FluxoCaixa() {
  const { fluxoDiario, loading } = useFluxoCaixa();

  const entradas = fluxoDiario.reduce((acc, dia) => acc + dia.entradas, 0);
  const saidas = fluxoDiario.reduce((acc, dia) => acc + dia.saidas, 0);
  const saldo = fluxoDiario.length > 0 ? fluxoDiario[fluxoDiario.length - 1].saldo_final : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-gray-600 mt-2">Acompanhe entradas, saídas e saldo</p>
        </div>
      </div>

      {/* Saldo Atual */}
      <Card className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="text-center">
          <p className="text-sm opacity-90">Saldo Atual</p>
          <p className="text-5xl font-bold mt-2">
            R$ {loading ? '...' : saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Calendar size={16} />
            <span className="text-sm opacity-90">Atualizado hoje</span>
          </div>
        </div>
      </Card>

      {/* Entradas e Saídas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Entradas</h3>
            <TrendingUp size={24} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            R$ {loading ? '...' : entradas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <Badge variant="success" className="mt-3">
            +12.5% vs mês anterior
          </Badge>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Saídas</h3>
            <TrendingDown size={24} className="text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            R$ {loading ? '...' : saidas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <Badge variant="error" className="mt-3">
            +3.2% vs mês anterior
          </Badge>
        </Card>
      </div>

      {/* Projeção */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={20} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Projeção para os próximos 30 dias</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-gray-700">Entradas previstas</span>
            <span className="font-bold text-green-600">R$ 245.000,00</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-gray-700">Saídas previstas</span>
            <span className="font-bold text-red-600">R$ 187.500,00</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
            <span className="text-sm text-gray-700 font-semibold">Saldo projetado</span>
            <span className="font-bold text-indigo-600">R$ 57.500,00</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
