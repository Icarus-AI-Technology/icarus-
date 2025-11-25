// src/services/integrations/BrasilAPIService.ts

import { fetchWithRetry } from './http';
import { toAppError } from '@/utils/error';

interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  data_inicio_atividade: string;
  natureza_juridica: string;
  porte: string;
  capital_social: number;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  email: string;
  telefone: string;
  situacao_cadastral: string;
  data_situacao_cadastral: string;
}

interface CEPResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

interface BankResponse {
  ispb: string;
  name: string;
  code: number;
  fullName: string;
}

interface HolidayResponse {
  date: string;
  name: string;
  type: string;
}

interface DDDResponse {
  state: string;
  cities: string[];
}

interface NCMResponse {
  code: string;
  description: string;
  full_description?: string;
  type?: string;
  [key: string]: unknown;
}

export class BrasilAPIService {
  private readonly baseUrl = 'https://brasilapi.com.br/api';

  async consultaCNPJ(cnpj: string): Promise<CNPJResponse> {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');

      const response = await fetchWithRetry(
        `${this.baseUrl}/cnpj/v1/${cnpjLimpo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 2, backoffMs: 750 }
      );

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: CNPJResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao consultar CNPJ BrasilAPI:', err);
      throw err;
    }
  }

  async consultaCEP(cep: string): Promise<CEPResponse> {
    try {
      const cepLimpo = cep.replace(/\D/g, '');

      const response = await fetchWithRetry(
        `${this.baseUrl}/cep/v1/${cepLimpo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 2, backoffMs: 500 }
      );

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: CEPResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao consultar CEP BrasilAPI:', err);
      throw err;
    }
  }

  async listaBancos(): Promise<BankResponse[]> {
    try {
      const response = await fetchWithRetry(
        `${this.baseUrl}/banks/v1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 2, backoffMs: 500 }
      );

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: BankResponse[] = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao listar bancos BrasilAPI:', err);
      throw err;
    }
  }

  async consultaBanco(codigo: number): Promise<BankResponse> {
    try {
      const response = await fetchWithRetry(
        `${this.baseUrl}/banks/v1/${codigo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 2, backoffMs: 500 }
      );

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: BankResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao consultar banco BrasilAPI:', err);
      throw err;
    }
  }

  async listaFeriados(ano: number): Promise<HolidayResponse[]> {
    try {
      const response = await fetchWithRetry(
        `${this.baseUrl}/feriados/v1/${ano}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 2, backoffMs: 500 }
      );

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: HolidayResponse[] = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao listar feriados BrasilAPI:', err);
      throw err;
    }
  }

  async consultaDDD(ddd: number): Promise<DDDResponse> {
    try {
      const response = await fetchWithRetry(
        `${this.baseUrl}/ddd/v1/${ddd}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 2, backoffMs: 500 }
      );

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: DDDResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao consultar DDD BrasilAPI:', err);
      throw err;
    }
  }

  async consultaNCM(codigo: string): Promise<NCMResponse> {
    try {
      const response = await fetchWithRetry(
        `${this.baseUrl}/ncm/v1/${codigo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { retries: 2, backoffMs: 500 }
      );

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: NCMResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao consultar NCM BrasilAPI:', err);
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cep/v1/01310100`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new BrasilAPIService();
