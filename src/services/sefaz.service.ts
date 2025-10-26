/**
 * API SEFAZ - Consulta de Notas Fiscais e Preços
 * ICARUS v5.0
 * 
 * Integração com SEFAZ de todos os estados brasileiros
 * Consulta preços praticados, invoices e validação de NF-e
 * 
 * APIs disponíveis:
 * - InfoSimples SEFAZ (26 estados + DF)
 * - SEFAZ direto (quando disponível)
 */

export interface NotaFiscalSEFAZ {
  chave: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  valorTotal: number;
  
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
  };
  
  destinatario: {
    cnpjCpf: string;
    nome: string;
  };
  
  produtos: {
    codigo: string;
    descricao: string;
    ncm: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    cfop: string;
  }[];
  
  situacao: string;
  protocolo?: string;
  xml?: string;
}

export interface PrecoProdutoSEFAZ {
  produto: string;
  ncm: string;
  fabricante: string;
  precoMedio: number;
  precoMinimo: number;
  precoMaximo: number;
  quantidadeNotas: number;
  ultimaAtualizacao: string;
  estadosConsultados: string[];
}

const INFOSIMPLES_TOKEN = 'fzxpq47PdYnoOi93sqQhC_BdJJFMaD5_zVZmq3o6';

/**
 * Consulta Nota Fiscal via SEFAZ usando InfoSimples
 */
export async function consultarNotaFiscal(
  chaveNFe: string,
  uf: string
): Promise<NotaFiscalSEFAZ> {
  const chaveLimpa = chaveNFe.replace(/[^\d]/g, '');
  
  if (chaveLimpa.length !== 44) {
    throw new Error('Chave de NF-e inválida. Deve conter 44 dígitos.');
  }
  
  const ufUpper = uf.toUpperCase();
  
  try {
    // InfoSimples - SEFAZ de todos os estados
    const response = await fetch(
      `https://api.infosimples.com/api/v2/consultas/sefaz/${ufUpper.toLowerCase()}/nfe/${chaveLimpa}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${INFOSIMPLES_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erro na consulta SEFAZ: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Nota Fiscal não encontrada ou inválida');
    }
    
    const nfe = result.data;
    
    return {
      chave: chaveLimpa,
      numero: nfe.numero,
      serie: nfe.serie,
      dataEmissao: nfe.data_emissao,
      valorTotal: parseFloat(nfe.valor_total),
      
      emitente: {
        cnpj: nfe.emitente.cnpj,
        razaoSocial: nfe.emitente.razao_social,
        nomeFantasia: nfe.emitente.nome_fantasia || nfe.emitente.razao_social,
      },
      
      destinatario: {
        cnpjCpf: nfe.destinatario.cnpj_cpf,
        nome: nfe.destinatario.nome,
      },
      
      produtos: (nfe.produtos as Array<{ codigo: string; descricao: string; ncm: string; quantidade: string | number; valor_unitario: string | number; valor_total: string | number; cfop: string }>).map((p) => ({
        codigo: p.codigo,
        descricao: p.descricao,
        ncm: p.ncm,
        quantidade: typeof p.quantidade === 'number' ? p.quantidade : parseFloat(p.quantidade),
        valorUnitario: typeof p.valor_unitario === 'number' ? p.valor_unitario : parseFloat(p.valor_unitario),
        valorTotal: typeof p.valor_total === 'number' ? p.valor_total : parseFloat(p.valor_total),
        cfop: p.cfop,
      })),
      
      situacao: nfe.situacao,
      protocolo: nfe.protocolo,
      xml: nfe.xml,
    };
    
  } catch (error) {
   const err = error as Error;
    console.error('Erro ao consultar SEFAZ:', err);
    throw new Error('Não foi possível consultar a Nota Fiscal. Verifique a chave e UF.');
  }
}

/**
 * Consulta preços praticados de produtos via SEFAZ
 * Agrega dados de múltiplos estados
 */
export async function consultarPrecosProduto(
  ncm: string,
  descricao?: string,
  estados: string[] = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS']
): Promise<PrecoProdutoSEFAZ> {
  const ncmLimpo = ncm.replace(/[^\d]/g, '');
  
  if (ncmLimpo.length !== 8) {
    throw new Error('NCM inválido. Deve conter 8 dígitos.');
  }
  
  try {
    // InfoSimples - Agregador de preços SEFAZ
    const response = await fetch(
      `https://api.infosimples.com/api/v2/consultas/sefaz/precos/ncm/${ncmLimpo}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${INFOSIMPLES_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estados: estados,
          descricao: descricao,
          periodo_dias: 90, // Últimos 90 dias
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erro na consulta de preços: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Nenhum preço encontrado para este produto');
    }
    
    const dados = result.data;
    
    return {
      produto: descricao || dados.descricao_ncm,
      ncm: ncmLimpo,
      fabricante: dados.fabricante_principal || 'Diversos',
      precoMedio: parseFloat(dados.preco_medio),
      precoMinimo: parseFloat(dados.preco_minimo),
      precoMaximo: parseFloat(dados.preco_maximo),
      quantidadeNotas: dados.quantidade_notas,
      ultimaAtualizacao: new Date().toISOString(),
      estadosConsultados: dados.estados_encontrados || estados,
    };
    
  } catch (error) {
   const err = error as Error;
    console.error('Erro ao consultar preços SEFAZ:', err);
    throw new Error('Não foi possível consultar preços. Tente novamente.');
  }
}

/**
 * Lista de UFs com SEFAZ disponível via InfoSimples
 */
export const UFS_SEFAZ = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

/**
 * Hook React para consulta SEFAZ
 */
import { useState } from 'react';

export function useSEFAZ() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notaFiscal, setNotaFiscal] = useState<NotaFiscalSEFAZ | null>(null);
  const [precos, setPrecos] = useState<PrecoProdutoSEFAZ | null>(null);
  
  const consultarNota = async (chave: string, uf: string) => {
    setLoading(true);
    setError(null);
    setNotaFiscal(null);
    
    try {
      const resultado = await consultarNotaFiscal(chave, uf);
      setNotaFiscal(resultado);
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
  
  const consultarPrecos = async (
    ncm: string,
    descricao?: string,
    estados?: string[]
  ) => {
    setLoading(true);
    setError(null);
    setPrecos(null);
    
    try {
      const resultado = await consultarPrecosProduto(ncm, descricao, estados);
      setPrecos(resultado);
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
    setNotaFiscal(null);
    setPrecos(null);
    setError(null);
  };
  
  return {
    notaFiscal,
    precos,
    loading,
    error,
    consultarNota,
    consultarPrecos,
    limpar,
  };
}

