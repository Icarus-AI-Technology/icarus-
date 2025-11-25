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
import { infoSimplesAPI } from './infosimples.service';

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

/**
 * Consulta Nota Fiscal via SEFAZ usando InfoSimples
 */
export async function consultarNotaFiscal(chaveNFe: string, uf: string): Promise<NotaFiscalSEFAZ> {
  const chaveLimpa = chaveNFe.replace(/[^\d]/g, '');

  if (chaveLimpa.length !== 44) {
    throw new Error('Chave de NF-e inválida. Deve conter 44 dígitos.');
  }

  try {
    // InfoSimples - SEFAZ de todos os estados via Proxy
    const nfe = (await infoSimplesAPI.consultarNFe(chaveLimpa, uf)) as {
      numero: string;
      serie: string;
      data_emissao: string;
      valor_total: string;
      emitente: { cnpj: string; razao_social: string; nome_fantasia: string };
      destinatario: { cnpj_cpf: string; nome: string };
      produtos: Array<{
        codigo: string;
        descricao: string;
        ncm: string;
        quantidade: string | number;
        valor_unitario: string | number;
        valor_total: string | number;
        cfop: string;
      }>;
      situacao: string;
      protocolo?: string;
      xml?: string;
    };

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

      produtos: nfe.produtos.map((p) => ({
        codigo: p.codigo,
        descricao: p.descricao,
        ncm: p.ncm,
        quantidade:
          typeof p.quantidade === 'number' ? p.quantidade : parseFloat(p.quantidade as string),
        valorUnitario:
          typeof p.valor_unitario === 'number'
            ? p.valor_unitario
            : parseFloat(p.valor_unitario as string),
        valorTotal:
          typeof p.valor_total === 'number' ? p.valor_total : parseFloat(p.valor_total as string),
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
    // InfoSimples - Agregador de preços SEFAZ via Proxy
    const dados = (await infoSimplesAPI.consultarPrecosSEFAZ(ncmLimpo, estados)) as {
      descricao_ncm: string;
      fabricante_principal?: string;
      preco_medio: string;
      preco_minimo: string;
      preco_maximo: string;
      quantidade_notas: number;
      estados_encontrados?: string[];
    };

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
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
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

  const consultarPrecos = async (ncm: string, descricao?: string, estados?: string[]) => {
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
