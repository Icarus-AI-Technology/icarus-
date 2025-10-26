/**
 * Componente: Previsão de Estoque IA
 * Visualiza previsões de demanda, análise ABC/XYZ e anomalias
 */

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Package, BarChart3 } from 'lucide-react';
import { EstoqueAI, PrevisaoDemanda, Anomalia } from '@/services/EstoqueAI';

export function PrevisaoEstoque() {
  const [loading, setLoading] = useState(true);
  const [previsoes, setPrevisoes] = useState<PrevisaoDemanda[]>([]);
  const [anomalias, setAnomalias] = useState<Anomalia[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock de produto ID (em produção, buscar da lista)
      const mockProdutoId = '00000000-0000-0000-0000-000000000001';
      
      const [previsaoData, anomaliasData] = await Promise.all([
        EstoqueAI.preverDemanda(mockProdutoId).catch(() => null),
        EstoqueAI.detectarAnomalias().catch(() => []),
      ]);

      if (previsaoData) {
        setPrevisoes([previsaoData]);
      }
      setAnomalias(anomaliasData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar previsões. Gerando dados de exemplo...');
      
      // Fallback com dados de exemplo
      setPrevisoes([{
        produto_id: '1',
        produto_nome: 'Prótese de Joelho Premium',
        demanda_historica: [45, 52, 48, 55, 60, 58, 62, 65, 68, 70, 72, 75],
        demanda_prevista_30_dias: 78,
        demanda_prevista_60_dias: 156,
        demanda_prevista_90_dias: 240,
        tendencia: 'crescente',
        sazonalidade: false,
        confianca: 87,
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600 dark:text-slate-400">Processando previsões de IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Previsão de Estoque IA</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Algoritmos: ARIMA, ABC/XYZ, EOQ, Detecção de Anomalias
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Atualizar Previsões
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
        </div>
      )}

      {/* Previsões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {previsoes.map((previsao) => (
          <div key={previsao.produto_id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {previsao.produto_nome}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Confiança: {previsao.confianca}%
                </p>
              </div>
              <div className={`
                flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                ${previsao.tendencia === 'crescente' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                  previsao.tendencia === 'decrescente' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}
              `}>
                {previsao.tendencia === 'crescente' && <TrendingUp className="w-4 h-4" />}
                {previsao.tendencia === 'decrescente' && <TrendingDown className="w-4 h-4" />}
                {previsao.tendencia === 'estavel' && <Minus className="w-4 h-4" />}
                {previsao.tendencia}
              </div>
            </div>

            {/* Gráfico de Barras Simples */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                Demanda Histórica (12 meses)
              </p>
              <div className="flex items-end gap-1 h-24">
                {previsao.demanda_historica.map((value, idx) => {
                  const maxValue = Math.max(...previsao.demanda_historica);
                  const height = (value / maxValue) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t transition-all hover:opacity-75"
                      style={{ height: `${height}%` }}
                      title={`Mês ${idx + 1}: ${value} unidades`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Previsões Futuras */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">30 dias</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {previsao.demanda_prevista_30_dias}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">unidades</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">60 dias</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {previsao.demanda_prevista_60_dias}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">unidades</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">90 dias</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {previsao.demanda_prevista_90_dias}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">unidades</p>
              </div>
            </div>

            {previsao.sazonalidade && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Produto com sazonalidade detectada
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Anomalias */}
      {anomalias.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Anomalias Detectadas ({anomalias.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {anomalias.map((anomalia, idx) => (
              <div
                key={idx}
                className={`
                  rounded-xl p-4 border-l-4
                  ${anomalia.severidade === 'critica' ? 'bg-red-50 dark:bg-red-900/20 border-red-600' :
                    anomalia.severidade === 'alta' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-600' :
                    anomalia.severidade === 'media' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-600' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-600'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4" />
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {anomalia.produto_nome}
                      </h4>
                      <span className={`
                        px-2 py-0.5 rounded text-xs font-medium uppercase
                        ${anomalia.severidade === 'critica' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          anomalia.severidade === 'alta' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          anomalia.severidade === 'media' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}
                      `}>
                        {anomalia.severidade}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {anomalia.descricao}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                      <span>Esperado: {anomalia.valor_esperado}</span>
                      <span>Atual: {anomalia.valor_real}</span>
                      <span>Desvio: {anomalia.desvio_percentual}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    💡 Recomendação: {anomalia.recomendacao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {anomalias.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <Package className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-lg font-semibold text-green-800 dark:text-green-200">
            Nenhuma anomalia detectada
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Seu estoque está operando dentro dos parâmetros normais
          </p>
        </div>
      )}
    </div>
  );
}

