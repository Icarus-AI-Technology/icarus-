/**
 * API ViaCEP - Consulta CEP dos Correios
 * ICARUS v5.0
 * 
 * Consulta dados de endereço via CEP
 * Preenchimento automático de logradouro, bairro, cidade e estado
 */

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface EnderecoData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  ibge: string;
  ddd: string;
}

/**
 * Consulta CEP via ViaCEP (Correios)
 * API pública sem limite de requisições
 */
export async function consultarCEP(cep: string): Promise<EnderecoData> {
  // Remove formatação
  const cepLimpo = cep.replace(/[^\d]/g, '');
  
  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido');
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.status}`);
    }
    
    const data: ViaCEPResponse = await response.json();
    
    if ('erro' in data) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
      ibge: data.ibge,
      ddd: data.ddd,
    };
    
  } catch (error) {
   const err = error as Error;
    console.error('Erro ao consultar CEP:', err);
    throw new Error('Não foi possível consultar o CEP. Verifique se está correto.');
  }
}

/**
 * Hook React para consulta de CEP
 */
import { useState } from 'react';

export function useCEP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnderecoData | null>(null);
  
  const buscar = async (cep: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const resultado = await consultarCEP(cep);
      setData(resultado);
      return resultado;
    } catch (error) {
   const err = error as Error;
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const limpar = () => {
    setData(null);
    setError(null);
  };
  
  return {
    data,
    loading,
    error,
    buscar,
    limpar,
  };
}

