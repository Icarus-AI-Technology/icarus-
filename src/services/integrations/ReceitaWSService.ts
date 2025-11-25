// src/services/integrations/ReceitaWSService.ts

import { fetchWithRetry } from './http';
import { toAppError } from '@/utils/error';

interface ReceitaWSResponse {
  abertura: string;
  situacao: string;
  tipo: string;
  nome: string;
  fantasia: string;
  porte: string;
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  complemento: string;
  municipio: string;
  bairro: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  efr: string;
  motivo_situacao: string;
  situacao_especial: string;
  data_situacao_especial: string;
  capital_social: string;
  cnpj: string;
  ultima_atualizacao: string;
  status: string;
  qsa: Array<{
    nome: string;
    qual: string;
    pais_origem: string;
    nome_rep_legal: string;
    qual_rep_legal: string;
  }>;
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
  atividades_secundarias: Array<{
    code: string;
    text: string;
  }>;
  billing: {
    free: boolean;
    database: boolean;
  };
}

export class ReceitaWSService {
  private readonly baseUrl = 'https://www.receitaws.com.br/v1';

  async consultaCNPJ(cnpj: string): Promise<ReceitaWSResponse> {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');

      const response = await fetchWithRetry(
        `${this.baseUrl}/cnpj/${cnpjLimpo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 1, backoffMs: 1000, retryOn: [429, 500, 502, 503, 504] }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            'Rate limit excedido. ReceitaWS permite apenas 3 requisições por minuto.'
          );
        }
        throw new Error(`ReceitaWS error: ${response.status}`);
      }

      const data: ReceitaWSResponse = await response.json();

      if (data.status === 'ERROR') {
        throw new Error('CNPJ não encontrado ou inválido');
      }

      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao consultar CNPJ ReceitaWS:', err);
      throw err;
    }
  }

  async consultaCNPJComRetry(cnpj: string, maxRetries = 3): Promise<ReceitaWSResponse> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.consultaCNPJ(cnpj);
      } catch (error: unknown) {
        const err = toAppError(error);
        lastError = err;

        if (err.message.includes('Rate limit')) {
          console.warn(
            `⚠️ Rate limit atingido. Aguardando 60s antes de tentar novamente (tentativa ${i + 1}/${maxRetries})...`
          );

          if (i < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 60000));
          }
        } else {
          throw err;
        }
      }
    }

    throw lastError ?? new Error('Falha ao consultar CNPJ após múltiplas tentativas');
  }

  validaCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      return false;
    }

    if (/^(\d)\1+$/.test(cnpjLimpo)) {
      return false;
    }

    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado !== parseInt(digitos.charAt(0))) {
      return false;
    }

    tamanho += 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado === parseInt(digitos.charAt(1));
  }

  formataCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      return cnpj;
    }

    return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cnpj/00000000000191`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new ReceitaWSService();

