/**
 * Componente: Previsão de Cirurgias IA
 * Análise de complexidade, otimização de agendamento, predição de tempo
 */

import { useState, useEffect } from 'react';
import { Activity, Clock, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { CirurgiasAI, PrevisaoDemandaCirurgica, AnaliseComplexidade } from '@/services/CirurgiasAI';

export function PrevisaoCirurgias() {
  const [loading, setLoading] = useState(true);
  const [demanda, setDemanda] = useState<PrevisaoDemandaCirurgica[]>([]);
  const [complexidade, setComplexidade] = useState<AnaliseComplexidade | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const mockCirurgiaId = '00000000-0000-0000-0000-000000000001';

      const [demandaData, complexidadeData] = await Promise.all([
        CirurgiasAI.preverDemanda().catch(() => []),
        CirurgiasAI.analisarComplexidade(mockCirurgiaId).catch(() => null),
      ]);

      setDemanda(demandaData.slice(0, 6)); // Top 6 especialidades
      setComplexidade(complexidadeData);
    } catch (err) {
      console.error('Erro:', err);
      
      // Fallback com dados de exemplo
      setDemanda([
        {
          especialidade: 'Ortopédica - Prótese de Joelho',
          demanda_historica_30d: 45,
          demanda_prevista_7d: 12,
          demanda_prevista_30d: 52,
          crescimento_percentual: 15.6,
          sazonalidade: 'media',
          confianca: 87,
        },
        {
          especialidade: 'Cardíaca - Stent Coronário',
          demanda_historica_30d: 32,
          demanda_prevista_7d: 9,
          demanda_prevista_30d: 38,
          crescimento_percentual: 18.8,
          sazonalidade: 'baixa',
          confianca: 82,
        },
      ]);

      setComplexidade({
        cirurgia_id: '1',
        procedimento: 'Ortopédica - Prótese de Joelho',
        nivel_complexidade: 'alta',
        score: 78,
        fatores: {
          duracao_estimada: 180,
          materiais_especializados: 15,
          equipe_minima: 6,
          risco_clinico: 'moderado',
        },
        recomendacoes: [
          'Equipe cirúrgica experiente obrigatória',
          'Reservar 30% tempo adicional para imprevistos',
          'Verificar disponibilidade de UTI pós-operatória',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-slate-600 dark:text-slate-400">Analisando dados cirúrgicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="orx-text-2xl orx-font-bold text-slate-900 dark:text-white">Previsão de Cirurgias IA</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Demanda Cirúrgica, Análise de Complexidade, Otimização de Agendamento
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Atualizar Análise
        </button>
      </div>

      {/* Previsão de Demanda */}
      <div className="space-y-4">
        <h3 className="orx-text-xl orx-font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Previsão de Demanda por Especialidade
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {demanda.map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="orx-font-semibold text-slate-900 dark:text-white">{item.especialidade}</h4>
                  <p className="orx-text-sm text-slate-600 dark:text-slate-400">
                    Confiança: {item.confianca}%
                  </p>
                </div>
                <div className={`
                  px-3 py-1 rounded-full orx-text-sm orx-font-medium
                  ${item.crescimento_percentual > 0 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                `}>
                  {item.crescimento_percentual > 0 ? '+' : ''}{item.crescimento_percentual.toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                  <p className="orx-text-xs text-slate-600 dark:text-slate-400">Histórico 30d</p>
                  <p className="orx-text-lg orx-font-bold text-slate-900 dark:text-white">{item.demanda_historica_30d}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                  <p className="orx-text-xs text-slate-600 dark:text-slate-400">Próximos 7d</p>
                  <p className="orx-text-lg orx-font-bold text-slate-900 dark:text-white">{item.demanda_prevista_7d}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                  <p className="orx-text-xs text-slate-600 dark:text-slate-400">Próximos 30d</p>
                  <p className="orx-text-lg orx-font-bold text-slate-900 dark:text-white">{item.demanda_prevista_30d}</p>
                </div>
              </div>

              <div className={`
                orx-text-xs px-2 py-1 rounded inline-block
                ${item.sazonalidade === 'alta' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  item.sazonalidade === 'media' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}
              `}>
                Sazonalidade: {item.sazonalidade}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análise de Complexidade */}
      {complexidade && (
        <div className="space-y-4">
          <h3 className="orx-text-xl orx-font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Análise de Complexidade
          </h3>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="orx-text-lg orx-font-semibold text-slate-900 dark:text-white">{complexidade.procedimento}</h4>
                <p className="orx-text-sm text-slate-600 dark:text-slate-400">Análise preditiva de complexidade</p>
              </div>
              <div className={`
                px-4 py-2 rounded-full orx-font-bold orx-text-lg
                ${complexidade.nivel_complexidade === 'critica' ? 'bg-red-600 text-white' :
                  complexidade.nivel_complexidade === 'alta' ? 'bg-orange-600 text-white' :
                  complexidade.nivel_complexidade === 'media' ? 'bg-yellow-600 text-white' :
                  'bg-green-600 text-white'}
              `}>
                {complexidade.score}/100
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <Clock className="w-5 h-5 text-purple-600 mb-1" />
                <p className="orx-text-xs text-slate-600 dark:text-slate-400">Duração</p>
                <p className="orx-text-xl orx-font-bold text-slate-900 dark:text-white">
                  {complexidade.fatores.duracao_estimada}min
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <Activity className="w-5 h-5 text-blue-600 mb-1" />
                <p className="orx-text-xs text-slate-600 dark:text-slate-400">Materiais</p>
                <p className="orx-text-xl orx-font-bold text-slate-900 dark:text-white">
                  {complexidade.fatores.materiais_especializados}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <Calendar className="w-5 h-5 text-green-600 mb-1" />
                <p className="orx-text-xs text-slate-600 dark:text-slate-400">Equipe Mínima</p>
                <p className="orx-text-xl orx-font-bold text-slate-900 dark:text-white">
                  {complexidade.fatores.equipe_minima}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mb-1" />
                <p className="orx-text-xs text-slate-600 dark:text-slate-400">Risco Clínico</p>
                <p className="orx-text-xl orx-font-bold text-slate-900 dark:text-white capitalize">
                  {complexidade.fatores.risco_clinico}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="orx-font-medium text-slate-900 dark:text-white mb-2">Recomendações IA</p>
              <ul className="space-y-2">
                {complexidade.recomendacoes.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 orx-text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-purple-600 dark:text-purple-400 orx-font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

