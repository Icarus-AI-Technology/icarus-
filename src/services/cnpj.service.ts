/**
 * API Receita Federal - Consulta CNPJ
 * ICARUS v5.0
 *
 * Consulta dados de CNPJ via API pública da Receita Federal
 * Preenchimento automático de todos os campos do cadastro
 */

export interface ReceitaFederalResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  data_abertura: string;
  porte: string;
  natureza_juridica: string;
  capital_social: number;

  // Endereço
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;

  // Contato
  email: string;
  telefone: string;

  // CNAE
  atividade_principal: {
    code: string;
    text: string;
  }[];
  atividades_secundarias: {
    code: string;
    text: string;
  }[];

  // Situação
  situacao: string;
  situacao_data: string;
  situacao_motivo: string;

  // Sócios
  qsa: {
    nome: string;
    qual: string;
    pais_origem: string;
    nome_rep_legal: string;
    qual_rep_legal: string;
  }[];
}

export interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  dataAbertura: string;
  porte: string;
  naturezaJuridica: string;
  capitalSocial: number;

  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };

  contato: {
    email: string;
    telefone: string;
  };

  atividadePrincipal: string;
  atividadesSecundarias: string[];

  situacao: {
    status: string;
    data: string;
    motivo: string;
  };

  socios: {
    nome: string;
    qualificacao: string;
  }[];
}

/**
 * Consulta CNPJ na Receita Federal
 * APIs públicas disponíveis:
 * - https://receitaws.com.br/api (500 req/dia gratuito)
 * - https://brasilapi.com.br/api/cnpj/v1/{cnpj} (sem limite)
 * - https://publica.cnpj.ws/cnpj/{cnpj} (2000 req/mês gratuito)
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData> {
  // Remove formatação
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ inválido');
  }

  try {
    // Tenta BrasilAPI primeiro (sem limite)
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);

    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.status}`);
    }

    const data: ReceitaFederalResponse = await response.json();

    return {
      cnpj: data.cnpj,
      razaoSocial: data.razao_social,
      nomeFantasia: data.nome_fantasia || data.razao_social,
      dataAbertura: data.data_abertura,
      porte: data.porte,
      naturezaJuridica: data.natureza_juridica,
      capitalSocial: data.capital_social,

      endereco: {
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.municipio,
        estado: data.uf,
        cep: data.cep,
      },

      contato: {
        email: data.email,
        telefone: data.telefone,
      },

      atividadePrincipal: data.atividade_principal?.[0]?.text || '',
      atividadesSecundarias: data.atividades_secundarias?.map((a) => a.text) || [],

      situacao: {
        status: data.situacao,
        data: data.situacao_data,
        motivo: data.situacao_motivo,
      },

      socios:
        data.qsa?.map((socio) => ({
          nome: socio.nome,
          qualificacao: socio.qual,
        })) || [],
    };
  } catch (error) {
    const err = error as Error;
    // Fallback para ReceitaWS
    try {
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`);

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const data: ReceitaFederalResponse = await response.json();

      return {
        cnpj: data.cnpj,
        razaoSocial: data.razao_social,
        nomeFantasia: data.nome_fantasia || data.razao_social,
        dataAbertura: data.data_abertura,
        porte: data.porte,
        naturezaJuridica: data.natureza_juridica,
        capitalSocial: data.capital_social,

        endereco: {
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.municipio,
          estado: data.uf,
          cep: data.cep,
        },

        contato: {
          email: data.email,
          telefone: data.telefone,
        },

        atividadePrincipal: data.atividade_principal?.[0]?.text || '',
        atividadesSecundarias: data.atividades_secundarias?.map((a) => a.text) || [],

        situacao: {
          status: data.situacao,
          data: data.situacao_data,
          motivo: data.situacao_motivo,
        },

        socios:
          data.qsa?.map((socio) => ({
            nome: socio.nome,
            qualificacao: socio.qual,
          })) || [],
      };
    } catch (fallbackError) {
      console.error('Erro ao consultar CNPJ:', fallbackError);
      throw new Error('Não foi possível consultar o CNPJ. Tente novamente.');
    }
  }
}

/**
 * Hook React para consulta de CNPJ
 */
import { useState } from 'react';

export function useCNPJ() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CNPJData | null>(null);

  const buscar = async (cnpj: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resultado = await consultarCNPJ(cnpj);
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
