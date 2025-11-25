/**
 * API ANVISA - Consulta de Produtos para Saúde
 * ICARUS v5.0
 *
 * Consulta registro de produtos médicos na ANVISA
 * Preenchimento automático de data de validade do registro
 *
 * APIs disponíveis:
 * - ANVISA Datavisa (oficial)
 * - InfoSimples ANVISA API
 */
import { infoSimplesAPI } from './infosimples.service';
export interface ANVISAProduto {
  registro: string;
  nome: string;
  fabricante: string;
  modelo?: string;
  dataRegistro: string;
  dataValidade: string;
  situacao: string;
  classe: string;
  categoria: string;
  intencaoUso: string;
  cnpjFabricante?: string;
  cnpjDetentor?: string;
}

export interface ANVISAResponse {
  success: boolean;
  data?: ANVISAProduto;
  error?: string;
}

/**
 * Consulta produto na ANVISA via InfoSimples
 * Requer token de autenticação
 */
export async function consultarProdutoANVISA(registro: string): Promise<ANVISAProduto> {
  const registroLimpo = registro.replace(/[^\d]/g, '');

  if (!registroLimpo) {
    throw new Error('Número de registro inválido');
  }

  try {
    // InfoSimples ANVISA API via Proxy
    const data = (await infoSimplesAPI.consultarProdutoANVISA(registroLimpo)) as {
      numero_registro?: string;
      nome_comercial?: string;
      nome_produto?: string;
      fabricante: string;
      modelo?: string;
      data_registro: string;
      data_validade: string;
      situacao?: string;
      classe_risco?: string;
      categoria: string;
      intencao_uso?: string;
      cnpj_fabricante?: string;
      cnpj_detentor?: string;
    };

    return {
      registro: data.numero_registro || registroLimpo,
      nome: data.nome_comercial || data.nome_produto || '',
      fabricante: data.fabricante,
      modelo: data.modelo,
      dataRegistro: data.data_registro,
      dataValidade: data.data_validade,
      situacao: data.situacao || 'ATIVO',
      classe: data.classe_risco || 'N/A',
      categoria: data.categoria,
      intencaoUso: data.intencao_uso || '',
      cnpjFabricante: data.cnpj_fabricante,
      cnpjDetentor: data.cnpj_detentor,
    };
  } catch (error) {
    const err = error as Error;
    console.error('Erro InfoSimples, tentando API oficial ANVISA:', err);

    // Fallback: API oficial ANVISA Datavisa
    try {
      const response = await fetch(
        `https://consultas.anvisa.gov.br/api/consulta/produtos/${registroLimpo}`
      );

      if (!response.ok) {
        throw new Error('Produto não encontrado na ANVISA');
      }

      const data = await response.json();

      return {
        registro: data.numeroRegistro || registroLimpo,
        nome: data.nomeProduto,
        fabricante: data.fabricante,
        modelo: data.modelo,
        dataRegistro: data.dataPublicacao,
        dataValidade: data.dataVencimento,
        situacao: data.situacao,
        classe: data.classeRisco,
        categoria: data.categoria,
        intencaoUso: data.intencaoUso || '',
        cnpjFabricante: data.cnpjFabricante,
        cnpjDetentor: data.cnpjDetentor,
      };
    } catch (fallbackError) {
      console.error('Erro ao consultar ANVISA:', fallbackError);
      throw new Error(
        'Não foi possível consultar o produto na ANVISA. Verifique o número de registro.'
      );
    }
  }
}

/**
 * Hook React para consulta ANVISA
 */
import { useState } from 'react';

export function useANVISA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ANVISAProduto | null>(null);

  const buscar = async (registro: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resultado = await consultarProdutoANVISA(registro);
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
