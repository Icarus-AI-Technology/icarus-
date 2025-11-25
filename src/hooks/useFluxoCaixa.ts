/**
 * Hook: useFluxoCaixa
 * Gestão de Fluxo de Caixa com Projeção de IA (ARIMA)
 *
 * FUNCIONALIDADES:
 * - Resumo de fluxo de caixa (realizado)
 * - Projeção de fluxo (IA ARIMA)
 * - Análise de tendências
 * - Cenários (otimista, realista, pessimista)
 * - KPIs financeiros
 * - Realtime updates
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// interface TendenciaFluxo { data: string; valor: number } // não utilizado

// interface CarteiraRecebiveis { total_atrasado: number; total_vencer: number; total_recebido: number } // não utilizado

type ContaReceberPagamentoRow = {
  data_pagamento: string | null;
  valor_pago: number | null;
};

type ContaPagarPagamentoRow = {
  data_pagamento: string | null;
  valor_pago: number | null;
};

type ContaReceberResumoRow = {
  valor_original: number | null;
  valor_pago: number | null;
  status: string | null;
};

type ContaPagarResumoRow = {
  valor_original: number | null;
  valor_pago: number | null;
  status: string | null;
};

interface FluxoCaixaResumo {
  periodo_inicio: string;
  periodo_fim: string;
  total_entradas: number;
  entradas_previstas: number;
  entradas_realizadas: number;
  total_saidas: number;
  saidas_previstas: number;
  saidas_realizadas: number;
  saldo_inicial: number;
  saldo_final: number;
  saldo_medio: number;
  variacao: number;
  variacao_percentual: number;
  tendencia: 'crescente' | 'decrescente' | 'estável';
}

interface FluxoCaixaDia {
  data: string;
  saldo_inicial: number;
  entradas: number;
  saidas: number;
  saldo_final: number;
}

interface ProjecaoFluxo {
  data: string;
  valor_projetado: number;
}

interface CenarioFluxo {
  tipo: 'otimista' | 'realista' | 'pessimista';
  projecao: ProjecaoFluxo[];
  saldo_final_projetado: number;
  premissas: string[];
}

export function useFluxoCaixa() {
  const [fluxoDiario, setFluxoDiario] = useState<FluxoCaixaDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch fluxo por período
  const fetchFluxoPeriodo = useCallback(async (dataInicio: string, dataFim: string) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar entradas (contas a receber pagas)
      const { data: entradas, error: entradasError } = await supabase
        .from('contas_receber')
        .select('data_pagamento, valor_pago')
        .eq('status', 'pago')
        .gte('data_pagamento', dataInicio)
        .lte('data_pagamento', dataFim);

      if (entradasError) throw entradasError;

      // Buscar saídas (contas a pagar pagas)
      const { data: saidas, error: saidasError } = await supabase
        .from('contas_pagar')
        .select('data_pagamento, valor_pago')
        .eq('status', 'pago')
        .gte('data_pagamento', dataInicio)
        .lte('data_pagamento', dataFim);

      if (saidasError) throw saidasError;

      // Agrupar por dia
      const fluxoPorDia = new Map<string, FluxoCaixaDia>();

      // Processar entradas
      ((entradas ?? []) as ContaReceberPagamentoRow[]).forEach((entrada) => {
        const data = entrada.data_pagamento;
        if (!data) return;
        if (!fluxoPorDia.has(data)) {
          fluxoPorDia.set(data, {
            data,
            saldo_inicial: 0,
            entradas: 0,
            saidas: 0,
            saldo_final: 0,
          });
        }
        const dia = fluxoPorDia.get(data)!;
        dia.entradas += entrada.valor_pago ?? 0;
      });

      // Processar saídas
      ((saidas ?? []) as ContaPagarPagamentoRow[]).forEach((saida) => {
        const data = saida.data_pagamento;
        if (!data) return;
        if (!fluxoPorDia.has(data)) {
          fluxoPorDia.set(data, {
            data,
            saldo_inicial: 0,
            entradas: 0,
            saidas: 0,
            saldo_final: 0,
          });
        }
        const dia = fluxoPorDia.get(data)!;
        dia.saidas += saida.valor_pago ?? 0;
      });

      // Calcular saldos acumulados
      const fluxoOrdenado = Array.from(fluxoPorDia.values()).sort((a, b) =>
        a.data.localeCompare(b.data)
      );

      let saldoAcumulado = 0;
      fluxoOrdenado.forEach((dia) => {
        dia.saldo_inicial = saldoAcumulado;
        dia.saldo_final = saldoAcumulado + dia.entradas - dia.saidas;
        saldoAcumulado = dia.saldo_final;
      });

      setFluxoDiario(fluxoOrdenado);
    } catch (error) {
      const err = error as Error;
      const message = err instanceof Error ? err.message : 'Erro ao carregar fluxo de caixa';
      setError(message);
      console.error('Erro useFluxoCaixa:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get resumo
  const getResumo = useCallback(
    async (dataInicio: string, dataFim: string): Promise<FluxoCaixaResumo> => {
      try {
        // Buscar entradas
        const { data: entradas } = await supabase
          .from('contas_receber')
          .select('valor_original, valor_pago, status')
          .gte('data_emissao', dataInicio)
          .lte('data_emissao', dataFim);

        // Buscar saídas
        const { data: saidas } = await supabase
          .from('contas_pagar')
          .select('valor_original, valor_pago, status')
          .gte('data_emissao', dataInicio)
          .lte('data_emissao', dataFim);

        const entradasData = (entradas as ContaReceberResumoRow[] | null) ?? [];
        const saidasData = (saidas as ContaPagarResumoRow[] | null) ?? [];

        const totalEntradas = entradasData.reduce((sum, e) => sum + (e.valor_original ?? 0), 0);
        const entradasRealizadas = entradasData
          .filter((e) => e.status === 'pago')
          .reduce((sum, e) => sum + (e.valor_pago ?? 0), 0);
        const entradasPrevistas = totalEntradas - entradasRealizadas;

        const totalSaidas = saidasData.reduce((sum, s) => sum + (s.valor_original ?? 0), 0);
        const saidasRealizadas = saidasData
          .filter((s) => s.status === 'pago')
          .reduce((sum, s) => sum + (s.valor_pago ?? 0), 0);
        const saidasPrevistas = totalSaidas - saidasRealizadas;

        const saldoInicial = 0; // TODO: Buscar saldo inicial real
        const saldoFinal = saldoInicial + entradasRealizadas - saidasRealizadas;
        const saldoMedio = (saldoInicial + saldoFinal) / 2;

        const variacao = entradasRealizadas - saidasRealizadas;
        const variacaoPercentual = saldoInicial > 0 ? (variacao / saldoInicial) * 100 : 0;

        // Calcular tendência (simplificado)
        const tendencia: FluxoCaixaResumo['tendencia'] =
          variacao > 0 ? 'crescente' : variacao < 0 ? 'decrescente' : 'estável';

        return {
          periodo_inicio: dataInicio,
          periodo_fim: dataFim,
          total_entradas: totalEntradas,
          entradas_previstas: entradasPrevistas,
          entradas_realizadas: entradasRealizadas,
          total_saidas: totalSaidas,
          saidas_previstas: saidasPrevistas,
          saidas_realizadas: saidasRealizadas,
          saldo_inicial: saldoInicial,
          saldo_final: saldoFinal,
          saldo_medio: saldoMedio,
          variacao,
          variacao_percentual: variacaoPercentual,
          tendencia,
        };
      } catch (error) {
        const err = error as Error;
        console.error('Erro getResumo:', err);
        return {
          periodo_inicio: dataInicio,
          periodo_fim: dataFim,
          total_entradas: 0,
          entradas_previstas: 0,
          entradas_realizadas: 0,
          total_saidas: 0,
          saidas_previstas: 0,
          saidas_realizadas: 0,
          saldo_inicial: 0,
          saldo_final: 0,
          saldo_medio: 0,
          variacao: 0,
          variacao_percentual: 0,
          tendencia: 'estável',
        };
      }
    },
    []
  );

  // Get projeção (com IA)
  const getProjecao = useCallback(async (diasFuturos: number): Promise<ProjecaoFluxo[]> => {
    try {
      // Importar FluxoCaixaAI dinamicamente
      const { fluxoCaixaAI } = await import('@/lib/services/FluxoCaixaAI');
      return await fluxoCaixaAI.projetarFluxo(diasFuturos);
    } catch (error) {
      const err = error as Error;
      console.error('Erro getProjecao:', err);
      return [];
    }
  }, []);

  // Get cenários
  const getCenarios = useCallback(async (diasFuturos: number): Promise<CenarioFluxo[]> => {
    try {
      const { fluxoCaixaAI } = await import('@/lib/services/FluxoCaixaAI');
      return await fluxoCaixaAI.simularCenarios(diasFuturos);
    } catch (error) {
      const err = error as Error;
      console.error('Erro getCenarios:', err);
      return [];
    }
  }, []);

  // Get tendência
  const getTendencia = useCallback(async (): Promise<'crescente' | 'estável' | 'decrescente'> => {
    try {
      const { fluxoCaixaAI } = await import('@/lib/services/FluxoCaixaAI');
      return await fluxoCaixaAI.analisarTendencia();
    } catch (error) {
      const err = error as Error;
      console.error('Erro getTendencia:', err);
      return 'estável';
    }
  }, []);

  // Setup Realtime
  useEffect(() => {
    // Buscar fluxo do mês atual
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const dataInicio = primeiroDia.toISOString().split('T')[0];
    const dataFim = ultimoDia.toISOString().split('T')[0];

    fetchFluxoPeriodo(dataInicio, dataFim);

    // Realtime para contas a receber e pagar
    const channel = supabase
      .channel('fluxo_caixa_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contas_receber',
        },
        () => fetchFluxoPeriodo(dataInicio, dataFim)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contas_pagar',
        },
        () => fetchFluxoPeriodo(dataInicio, dataFim)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFluxoPeriodo]);

  return {
    fluxoDiario,
    loading,
    error,
    fetchFluxoPeriodo,
    getResumo,
    getProjecao,
    getCenarios,
    getTendencia,
  };
}
