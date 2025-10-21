/**
 * Custom Hook: useBrasilAPI
 * Facilita integração com BrasilAPI em formulários
 */

import { useState, useCallback } from 'react';
import { brasilAPIService, CEPData, CNPJData } from '@/lib/integrations/brasilapi.service';

interface UseCEPReturn {
  data: CEPData | null;
  loading: boolean;
  error: string | null;
  fetchCEP: (cep: string) => Promise<CEPData | null>;
}

interface UseCNPJReturn {
  data: CNPJData | null;
  loading: boolean;
  error: string | null;
  fetchCNPJ: (cnpj: string) => Promise<CNPJData | null>;
}

/**
 * Hook para buscar CEP e auto-preencher endereço
 * 
 * @example
 * const { data, loading, error, fetchCEP } = useCEP();
 * 
 * const handleCEPChange = async (cep: string) => {
 *   if (cep.length === 8 || cep.length === 9) {
 *     const result = await fetchCEP(cep);
 *     if (result) {
 *       setFormData({
 *         ...formData,
 *         cidade: result.city,
 *         estado: result.state,
 *         bairro: result.neighborhood,
 *         logradouro: result.street
 *       });
 *     }
 *   }
 * };
 */
export function useCEP(): UseCEPReturn {
  const [data, setData] = useState<CEPData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCEP = useCallback(async (cep: string): Promise<CEPData | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await brasilAPIService.getCEP(cep);

      if (result) {
        setData(result);
        return result;
      } else {
        setError('CEP não encontrado');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CEP';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchCEP };
}

/**
 * Hook para buscar CNPJ e auto-preencher dados da empresa
 * 
 * @example
 * const { data, loading, error, fetchCNPJ } = useCNPJ();
 * 
 * const handleCNPJBlur = async (cnpj: string) => {
 *   const result = await fetchCNPJ(cnpj);
 *   if (result) {
 *     setFormData({
 *       ...formData,
 *       razao_social: result.razao_social,
 *       nome_fantasia: result.nome_fantasia,
 *       endereco: result.logradouro,
 *       numero: result.numero,
 *       bairro: result.bairro,
 *       cidade: result.municipio,
 *       uf: result.uf,
 *       cep: result.cep,
 *       telefone: result.telefone1,
 *       email: result.email
 *     });
 *   }
 * };
 */
export function useCNPJ(): UseCNPJReturn {
  const [data, setData] = useState<CNPJData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCNPJ = useCallback(async (cnpj: string): Promise<CNPJData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validar CNPJ primeiro
      if (!brasilAPIService.validarCNPJ(cnpj)) {
        setError('CNPJ inválido');
        setLoading(false);
        return null;
      }

      const result = await brasilAPIService.getCNPJ(cnpj);

      if (result) {
        setData(result);
        return result;
      } else {
        setError('CNPJ não encontrado na Receita Federal');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CNPJ';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchCNPJ };
}

/**
 * Hook para validação de CPF em tempo real
 */
export function useValidateCPF() {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = useCallback((cpf: string): boolean => {
    const valid = brasilAPIService.validarCPF(cpf);
    setIsValid(valid);
    return valid;
  }, []);

  const format = useCallback((cpf: string): string => {
    return brasilAPIService.formatarCPF(cpf);
  }, []);

  return { isValid, validate, format };
}

/**
 * Hook para validação de CNPJ em tempo real
 */
export function useValidateCNPJ() {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = useCallback((cnpj: string): boolean => {
    const valid = brasilAPIService.validarCNPJ(cnpj);
    setIsValid(valid);
    return valid;
  }, []);

  const format = useCallback((cnpj: string): string => {
    return brasilAPIService.formatarCNPJ(cnpj);
  }, []);

  return { isValid, validate, format };
}

