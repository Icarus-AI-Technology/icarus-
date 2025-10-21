import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityData {
  acao: string;
  modulo: string;
  sub_modulo?: string;
  rota?: string;
  metodo?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'NAVIGATE' | 'SEARCH' | 'EXPORT' | 'IMPORT';
  dados_entrada?: Record<string, any>;
  dados_saida?: Record<string, any>;
  tempo_execucao?: number;
  sucesso?: boolean;
  erro_mensagem?: string;
  erro_stack?: string;
}

export const useActivityTracker = () => {
  const { user } = useAuth();

  // Função para rastrear atividade
  const trackActivity = useCallback(async (activity: ActivityData) => {
    if (!user) return;

    try {
      // Capturar informações do dispositivo
      const userAgent = navigator.userAgent;
      const dispositivo = /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 'desktop';

      const { error } = await supabase.from('user_activities').insert({
        usuario_id: user.id,
        acao: activity.acao,
        modulo: activity.modulo,
        sub_modulo: activity.sub_modulo,
        rota: activity.rota || window.location.pathname,
        metodo: activity.metodo || 'READ',
        dados_entrada: activity.dados_entrada,
        dados_saida: activity.dados_saida,
        tempo_execucao: activity.tempo_execucao,
        sucesso: activity.sucesso !== undefined ? activity.sucesso : true,
        erro_mensagem: activity.erro_mensagem,
        erro_stack: activity.erro_stack,
        user_agent: userAgent,
        dispositivo: dispositivo,
      });

      if (error) {
        console.error('Erro ao rastrear atividade:', error);
      }
    } catch (err) {
      console.error('Falha ao registrar atividade:', err);
    }
  }, [user]);

  // Função para rastrear navegação de página
  const trackPageView = useCallback((modulo: string, sub_modulo?: string) => {
    trackActivity({
      acao: 'visualizar_pagina',
      modulo,
      sub_modulo,
      metodo: 'NAVIGATE',
    });
  }, [trackActivity]);

  // Função para rastrear ação CRUD
  const trackCRUD = useCallback(async (
    metodo: 'CREATE' | 'UPDATE' | 'DELETE',
    modulo: string,
    dados?: Record<string, any>,
    sucesso: boolean = true,
    erro?: string
  ) => {
    const startTime = performance.now();
    
    await trackActivity({
      acao: `${metodo.toLowerCase()}_registro`,
      modulo,
      metodo,
      dados_entrada: dados,
      tempo_execucao: Math.round(performance.now() - startTime),
      sucesso,
      erro_mensagem: erro,
    });
  }, [trackActivity]);

  // Função para rastrear busca
  const trackSearch = useCallback((modulo: string, query: string, resultados: number) => {
    trackActivity({
      acao: 'buscar',
      modulo,
      metodo: 'SEARCH',
      dados_entrada: { query },
      dados_saida: { total_resultados: resultados },
    });
  }, [trackActivity]);

  // Função para rastrear exportação
  const trackExport = useCallback((modulo: string, formato: string, total_registros: number) => {
    trackActivity({
      acao: 'exportar',
      modulo,
      metodo: 'EXPORT',
      dados_entrada: { formato },
      dados_saida: { total_registros },
    });
  }, [trackActivity]);

  // Função para rastrear interação com IA
  const trackAIInteraction = useCallback((
    modulo: string,
    pergunta: string,
    resposta: string,
    feedback?: number
  ) => {
    trackActivity({
      acao: 'interacao_ia',
      modulo,
      dados_entrada: { pergunta },
      dados_saida: { resposta, feedback },
    });
  }, [trackActivity]);

  return {
    trackActivity,
    trackPageView,
    trackCRUD,
    trackSearch,
    trackExport,
    trackAIInteraction,
  };
};
