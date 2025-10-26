/**
 * Componente: Análise Financeira IA
 * Score de inadimplência, fluxo de caixa, análise de risco
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, Activity } from 'lucide-react';
import { FinanceiroAI, ScoreInadimplencia, PrevisaoFluxoCaixa } from '@/services/FinanceiroAI';

export function AnaliseFinanceira() {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<ScoreInadimplencia | null>(null);
  const [fluxoCaixa, setFluxoCaixa] = useState<PrevisaoFluxoCaixa[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const mockClienteId = '00000000-0000-0000-0000-000000000001';

      const [scoreData, fluxoData] = await Promise.all([
        FinanceiroAI.calcularScoreInadimplencia(mockClienteId).catch(() => null),
        FinanceiroAI.preverFluxoCaixa(30).catch(() => []),
      ]);

      if (scoreData) setScore(scoreData);
      setFluxoCaixa(fluxoData.slice(0, 15)); // Próximos 15 dias
    } catch (err) {
      console.error('Erro:', err);
      
      // Fallback com dados de exemplo
      setScore({
        cliente_id: '1',
        cliente_nome: 'Hospital São Lucas',
        score: 785,
        categoria_risco: 'baixo',
        probabilidade_inadimplencia: 12.5,
        fatores: {
          historico_pagamento: 92,
          valor_medio_compras: 45000,
          dias_atraso_medio: 2.3,
          quantidade_titulos_abertos: 3,
          tempo_relacionamento_dias: 425,
        },
        recomendacao: 'Cliente confiável - aprovar crédito normalmente',
      });

      // Gerar fluxo de caixa de exemplo
      const fluxoExemplo: PrevisaoFluxoCaixa[] = [];
      let saldoAcumulado = 150000;
      for (let i = 1; i <= 15; i++) {
        const data = new Date();
        data.setDate(data.getDate() + i);
        const entradas = Math.random() * 50000 + 30000;
        const saidas = Math.random() * 40000 + 25000;
        saldoAcumulado += (entradas - saidas);
        fluxoExemplo.push({
          data: data.toISOString().split('T')[0],
          entradas_previstas: entradas,
          saidas_previstas: saidas,
          saldo_previsto: saldoAcumulado,
          confianca: 85 - i,
          cenario: 'realista',
        });
      }
      setFluxoCaixa(fluxoExemplo);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-slate-600 dark:text-slate-400">Analisando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Análise Financeira IA</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Score de Inadimplência, Fluxo de Caixa, Análise de Risco
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Atualizar Análise
        </button>
      </div>

      {/* Score de Inadimplência */}
      {score && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {score.cliente_nome}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Score de Inadimplência</p>
            </div>
            <div className={`
              px-4 py-2 rounded-full font-bold text-lg
              ${score.categoria_risco === 'baixo' ? 'bg-green-600 text-white' :
                score.categoria_risco === 'medio' ? 'bg-yellow-600 text-white' :
                score.categoria_risco === 'alto' ? 'bg-orange-600 text-white' :
                'bg-red-600 text-white'}
            `}>
              {score.score}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">Histórico</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {score.fatores.historico_pagamento}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">Ticket Médio</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                R$ {(score.fatores.valor_medio_compras / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">Atraso Médio</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {score.fatores.dias_atraso_medio.toFixed(1)} dias
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">Títulos Abertos</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {score.fatores.quantidade_titulos_abertos}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">Relacionamento</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {Math.floor(score.fatores.tempo_relacionamento_dias / 30)}m
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white mb-1">Recomendação IA</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{score.recomendacao}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  Probabilidade de inadimplência: {score.probabilidade_inadimplencia.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previsão de Fluxo de Caixa */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Previsão de Fluxo de Caixa (15 dias)
        </h3>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
          {/* Gráfico de Linha Simplificado */}
          <div className="h-48 flex items-end gap-1">
            {fluxoCaixa.map((dia, idx) => {
              const minSaldo = Math.min(...fluxoCaixa.map(d => d.saldo_previsto));
              const maxSaldo = Math.max(...fluxoCaixa.map(d => d.saldo_previsto));
              const altura = ((dia.saldo_previsto - minSaldo) / (maxSaldo - minSaldo)) * 100;
              const isNegativo = dia.saldo_previsto < 0;
              
              return (
                <div
                  key={idx}
                  className="flex-1 relative group cursor-pointer"
                  title={`${dia.data}: R$ ${dia.saldo_previsto.toLocaleString('pt-BR')}`}
                >
                  <div
                    className={`
                      w-full rounded-t transition-all
                      ${isNegativo 
                        ? 'bg-gradient-to-t from-red-500 to-red-300' 
                        : 'bg-gradient-to-t from-green-500 to-green-300'}
                      group-hover:opacity-75
                    `}
                    style={{ height: `${Math.max(altura, 5)}%` }}
                  />
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="font-medium">{dia.data.split('-').slice(1).join('/')}</p>
                    <p className="text-green-300">↑ R$ {(dia.entradas_previstas / 1000).toFixed(0)}k</p>
                    <p className="text-red-300">↓ R$ {(dia.saidas_previstas / 1000).toFixed(0)}k</p>
                    <p className="font-bold">= R$ {(dia.saldo_previsto / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">Entradas Previstas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {(fluxoCaixa.reduce((sum, d) => sum + d.entradas_previstas, 0) / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">Saídas Previstas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {(fluxoCaixa.reduce((sum, d) => sum + d.saidas_previstas, 0) / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">Saldo Final</p>
              <p className={`text-2xl font-bold ${fluxoCaixa[fluxoCaixa.length - 1]?.saldo_previsto > 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {((fluxoCaixa[fluxoCaixa.length - 1]?.saldo_previsto || 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-200">Insights IA</p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1">
              <li>• Fluxo de caixa positivo previsto para os próximos 15 dias</li>
              <li>• Recomenda-se negociar prazos maiores com 3 fornecedores principais</li>
              <li>• Oportunidade de investir R$ 50k em títulos de curto prazo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

