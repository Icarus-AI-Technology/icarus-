/**
 * Hook para validações de APIs com cache inteligente
 * Integra serviços (ViaCEP, Receita Federal, CFM) com cache Supabase
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { viaCepService } from '@/lib/services/ViaCepService';
import { receitaFederalService } from '@/lib/services/ReceitaFederalService';
import { cfmService } from '@/lib/services/CFMService';
import { veiculoService } from '@/lib/services/VeiculoService';
import { anvisaService } from '@/lib/services/ANVISAService';

type TipoValidacao = 'cep' | 'cnpj' | 'cpf' | 'crm' | 'veiculo' | 'anvisa';

interface ValidationResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number; // segundos
}

const DEFAULT_TTL: Record<TipoValidacao, number> = {
  cep: 2592000, // 30 dias - CEPs não mudam
  cnpj: 604800, // 7 dias - Dados podem ser atualizados
  cpf: 2592000, // 30 dias - Validação estável
  crm: 2592000, // 30 dias - Registro profissional
  veiculo: 604800, // 7 dias - Pode ter multas/alterações
  anvisa: 2592000, // 30 dias - Registros estáveis
};

/**
 * Hook universal para validações com cache
 */
export function useValidacao<T = unknown>(
  tipo: TipoValidacao,
  cacheConfig: CacheConfig = { enabled: true, ttl: 0 }
) {
  const [result, setResult] = useState<ValidationResult<T>>({
    data: null,
    loading: false,
    error: null,
    cached: false,
  });

  /**
   * Busca no cache do Supabase
   */
  const getFromCache = useCallback(
    async (chave: string): Promise<T | null> => {
      if (!cacheConfig.enabled) return null;

      try {
        const { data, error } = await supabase.rpc('get_validacao_cache', {
          p_tipo: tipo,
          p_chave: chave,
        });

        if (error) {
          console.warn('Erro ao buscar cache:', error);
          return null;
        }

        return data as T;
      } catch (error) {
   const err = error as Error;
        console.warn('Erro ao acessar cache:', error);
        return null;
      }
    },
    [tipo, cacheConfig.enabled]
  );

  /**
   * Salva no cache do Supabase
   */
  const saveToCache = useCallback(
    async (chave: string, dados: T, fonte: string): Promise<void> => {
      if (!cacheConfig.enabled) return;

      try {
        const ttl = cacheConfig.ttl || DEFAULT_TTL[tipo];

        await supabase.rpc('set_validacao_cache', {
          p_tipo: tipo,
          p_chave: chave,
          p_dados: dados as unknown,
          p_fonte: fonte,
          p_ttl_seconds: ttl,
          p_sucesso: true,
        });
      } catch (error) {
   const err = error as Error;
        console.warn('Erro ao salvar cache:', error);
        // Não propaga erro - cache é opcional
      }
    },
    [tipo, cacheConfig]
  );

  /**
   * Valida e retorna dados (com cache)
   */
  const validate = useCallback(
    async (chave: string): Promise<T | null> => {
      setResult({ data: null, loading: true, error: null, cached: false });

      try {
        // 1. Tenta buscar no cache
        const cached = await getFromCache(chave);
        if (cached) {
          setResult({
            data: cached,
            loading: false,
            error: null,
            cached: true,
          });
          return cached;
        }

        // 2. Se não encontrou no cache, consulta API
        let data: T | null = null;
        let fonte = '';

        switch (tipo) {
          case 'cep': {
            data = (await viaCepService.buscarPorCep(chave)) as T;
            fonte = 'viacep';
            break;
          }

          case 'cnpj': {
            data = (await receitaFederalService.consultarCNPJ(chave)) as T;
            fonte = 'receita_federal';
            break;
          }

          case 'cpf': {
            // Apenas validação local para CPF
            const cpfValido = receitaFederalService.validarCPF(chave);
            data = { valido: cpfValido, cpf: chave } as T;
            fonte = 'local';
            break;
          }

          case 'crm': {
            const [crm, uf] = chave.split('/');
            data = (await cfmService.consultarCRM(crm, uf)) as T;
            fonte = 'cfm';
            break;
          }

          case 'veiculo': {
            data = (await veiculoService.consultarPlaca(chave)) as T;
            fonte = 'brasil_api';
            break;
          }

          case 'anvisa': {
            data = (await anvisaService.consultarRegistro(chave)) as T;
            fonte = 'anvisa';
            break;
          }

          default: {
            throw new Error(`Tipo de validação não suportado: ${tipo}`);
          }
        }

        // 3. Salva no cache se encontrou dados
        if (data) {
          await saveToCache(chave, data, fonte);
        }

        // 4. Atualiza estado
        setResult({
          data,
          loading: false,
          error: data ? null : 'Não encontrado',
          cached: false,
        });

        return data;
      } catch (error) {
   const err = error as Error;
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';

        setResult({
          data: null,
          loading: false,
          error: errorMessage,
          cached: false,
        });

        return null;
      }
    },
    [tipo, getFromCache, saveToCache]
  );

  /**
   * Limpa resultado
   */
  const clear = useCallback(() => {
    setResult({ data: null, loading: false, error: null, cached: false });
  }, []);

  return {
    ...result,
    validate,
    clear,
  };
}

/**
 * Hook especializado para CEP
 */
export function useValidacaoCep() {
  return useValidacao<Awaited<ReturnType<typeof viaCepService.buscarPorCep>>>(
    'cep'
  );
}

/**
 * Hook especializado para CNPJ
 */
export function useValidacaoCNPJ() {
  return useValidacao<
    Awaited<ReturnType<typeof receitaFederalService.consultarCNPJ>>
  >('cnpj');
}

/**
 * Hook especializado para CPF
 */
export function useValidacaoCPF() {
  return useValidacao<{ valido: boolean; cpf: string }>('cpf');
}

/**
 * Hook especializado para CRM
 */
export function useValidacaoCRM() {
  return useValidacao<Awaited<ReturnType<typeof cfmService.consultarCRM>>>(
    'crm'
  );
}

/**
 * Hook especializado para Veículo
 */
export function useValidacaoVeiculo() {
  return useValidacao<
    Awaited<ReturnType<typeof veiculoService.consultarPlaca>>
  >('veiculo');
}

/**
 * Hook especializado para ANVISA
 */
export function useValidacaoANVISA() {
  return useValidacao<
    Awaited<ReturnType<typeof anvisaService.consultarRegistro>>
  >('anvisa');
}

/**
 * Hook para estatísticas de cache
 */
type CacheStat = Record<string, unknown>;

export function useCacheStats() {
  const [stats, setStats] = useState<CacheStat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(
    async (tipo?: TipoValidacao, periodoDias: number = 7) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc(
          'get_validacoes_cache_stats',
          {
            p_tipo: tipo || null,
            p_periodo_dias: periodoDias,
          }
        );

        if (error) throw error;

        setStats(data || []);
      } catch (error) {
   const err = error as Error;
        console.error('Erro ao buscar estatísticas:', err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    stats,
    loading,
    fetchStats,
  };
}

