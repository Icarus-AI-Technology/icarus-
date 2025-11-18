// src/services/integrations/JadlogService.ts

import { fetchWithRetry } from "./http";
import { toAppError } from "@/utils/error";

interface JadlogTrackingResponse {
  codigo: string;
  status: string;
  eventos: Array<{
    data: string;
    hora: string;
    local: string;
    descricao: string;
  }>;
}

interface JadlogQuoteRequest {
  cepOrigem: string;
  cepDestino: string;
  peso: number;
  valorDeclarado?: number;
  modalidade?: "PACKAGE" | "DOC" | "RODOVIARIO";
}

interface JadlogQuoteResponse {
  valor: number;
  prazo: number;
  modalidade: string;
}

export class JadlogService {
  private readonly baseUrl = "https://www.jadlog.com.br/embarcador/api";
  private readonly apiKey: string;
  private readonly cnpj: string;
  private readonly password: string;

  constructor() {
    this.apiKey = process.env.JADLOG_API_KEY || "";
    this.cnpj = process.env.JADLOG_CNPJ || "";
    this.password = process.env.JADLOG_PASSWORD || "";

    if (!this.apiKey || !this.cnpj || !this.password) {
      console.warn("⚠️ Jadlog: Credenciais não configuradas");
    }
  }

  private async authenticate(): Promise<string> {
    try {
      const response = await fetchWithRetry(`${this.baseUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpj: this.cnpj,
          password: this.password,
        }),
      }, { retries: 2, backoffMs: 1000 });

      if (!response.ok) {
        throw new Error("Falha na autenticação Jadlog");
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error("❌ Erro na autenticação Jadlog:", err);
      throw err;
    }
  }

  async track(trackingCode: string): Promise<JadlogTrackingResponse> {
    try {
      const token = await this.authenticate();

      const response = await fetchWithRetry(
        `${this.baseUrl}/tracking/consultar?codigo=${trackingCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        { retries: 2, backoffMs: 1000 },
      );

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      const data: JadlogTrackingResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error("❌ Erro ao rastrear Jadlog:", err);
      throw err;
    }
  }

  async quote(request: JadlogQuoteRequest): Promise<JadlogQuoteResponse> {
    try {
      const token = await this.authenticate();

      const response = await fetchWithRetry(`${this.baseUrl}/frete/valor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cepOrigem: request.cepOrigem.replace(/\D/g, ""),
          cepDestino: request.cepDestino.replace(/\D/g, ""),
          peso: request.peso,
          valorDeclarado: request.valorDeclarado || 0,
          modalidade: request.modalidade || "PACKAGE",
        }),
      }, { retries: 2, backoffMs: 1000 });

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      const data: JadlogQuoteResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error("❌ Erro ao cotar Jadlog:", err);
      throw err;
    }
  }

  async createShipment(data: Record<string, unknown>): Promise<unknown> {
    try {
      const token = await this.authenticate();

      const response = await fetchWithRetry(`${this.baseUrl}/shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }, { retries: 2, backoffMs: 1000 });

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error("❌ Erro ao criar envio Jadlog:", err);
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const token = await this.authenticate();
      return Boolean(token);
    } catch {
      return false;
    }
  }
}

export default new JadlogService();
// src/services/integrations/JadlogService.ts

import { fetchWithRetry } from './http';
import { toAppError } from '@/utils/error';

interface JadlogTrackingResponse {
  codigo: string;
  status: string;
  eventos: Array<{
    data: string;
    hora: string;
    local: string;
    descricao: string;
  }>;
}

interface JadlogQuoteRequest {
  cepOrigem: string;
  cepDestino: string;
  peso: number;
  valorDeclarado?: number;
  modalidade?: 'PACKAGE' | 'DOC' | 'RODOVIARIO';
}

interface JadlogQuoteResponse {
  valor: number;
  prazo: number;
  modalidade: string;
}

export class JadlogService {
  private readonly baseUrl = 'https://www.jadlog.com.br/embarcador/api';
  private readonly apiKey: string;
  private readonly cnpj: string;
  private readonly password: string;

  constructor() {
    this.apiKey = process.env.JADLOG_API_KEY || '';
    this.cnpj = process.env.JADLOG_CNPJ || '';
    this.password = process.env.JADLOG_PASSWORD || '';

    if (!this.apiKey || !this.cnpj) {
      console.warn('⚠️ Jadlog: Credenciais não configuradas');
    }
  }

  /**
   * Autentica e obtém token de acesso
   */
  private async authenticate(): Promise<string> {
    try {
      const response = await fetchWithRetry(`${this.baseUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cnpj: this.cnpj,
          password: this.password,
        }),
      }, { retries: 2, backoffMs: 1000 });

      if (!response.ok) {
        throw new Error('Falha na autenticação Jadlog');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro na autenticação Jadlog:', err);
      throw err;
    }
  }

  /**
   * Rastreia uma encomenda
   */
  async track(trackingCode: string): Promise<JadlogTrackingResponse> {
    try {
      const token = await this.authenticate();

      const response = await fetchWithRetry(
        `${this.baseUrl}/tracking/consultar?codigo=${trackingCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        { retries: 2, backoffMs: 1000 }
      );

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      const data: JadlogTrackingResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao rastrear Jadlog:', err);
      throw err;
    }
  }

  /**
   * Calcula cotação de frete
   */
  async quote(request: JadlogQuoteRequest): Promise<JadlogQuoteResponse> {
    try {
      const token = await this.authenticate();

      const response = await fetchWithRetry(`${this.baseUrl}/frete/valor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cepOrigem: request.cepOrigem.replace(/\D/g, ''),
          cepDestino: request.cepDestino.replace(/\D/g, ''),
          peso: request.peso,
          valorDeclarado: request.valorDeclarado || 0,
          modalidade: request.modalidade || 'PACKAGE',
        }),
      }, { retries: 2, backoffMs: 1000 });

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      const data: JadlogQuoteResponse = await response.json();
      return data;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao cotar Jadlog:', err);
      throw err;
    }
  }

  /**
   * Cria uma nova coleta/postagem
   */
  async createShipment(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      const token = await this.authenticate();

      const response = await fetchWithRetry(`${this.baseUrl}/shipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }, { retries: 2, backoffMs: 1000 });

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      const result: Record<string, unknown> = await response.json();
      return result;
    } catch (error: unknown) {
      const err = toAppError(error);
      console.error('❌ Erro ao criar envio Jadlog:', err);
      throw err;
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      const token = await this.authenticate();
      return !!token;
    } catch {
      return false;
    }
  }
}

export default new JadlogService();

