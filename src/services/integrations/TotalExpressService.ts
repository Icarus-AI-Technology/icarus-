// src/services/integrations/TotalExpressService.ts

interface TotalExpressTrackingResponse {
  codigoRastreio: string;
  status: string;
  eventos: Array<{
    dataHora: string;
    cidade: string;
    uf: string;
    descricao: string;
    tipo: string;
  }>;
}

interface TotalExpressQuoteRequest {
  cepOrigem: string;
  cepDestino: string;
  peso: number;
  volumes: number;
  valorDeclarado?: number;
}

interface TotalExpressQuoteResponse {
  valorFrete: number;
  prazoEntrega: number;
  servicoUtilizado: string;
}

export class TotalExpressService {
  private readonly baseUrl = "https://edi.totalexpress.com.br/api";
  private readonly apiKey: string;
  private readonly clientId: string;

  constructor() {
    this.apiKey = process.env.TOTAL_EXPRESS_API_KEY || "";
    this.clientId = process.env.TOTAL_EXPRESS_CLIENT_ID || "";

    if (!this.apiKey || !this.clientId) {
      console.warn("⚠️ Total Express: Credenciais não configuradas");
    }
  }

  /**
   * Headers padrão para requisições
   */
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
      "X-Client-Id": this.clientId,
    };
  }

  /**
   * Rastreia uma encomenda
   */
  async track(trackingCode: string): Promise<TotalExpressTrackingResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/rastreamento/${trackingCode}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Total Express API error: ${response.status}`);
      }

      const data: TotalExpressTrackingResponse = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao rastrear Total Express:", error.message);
      throw error;
    }
  }

  /**
   * Calcula cotação de frete
   */
  async quote(
    request: TotalExpressQuoteRequest,
  ): Promise<TotalExpressQuoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/cotacao`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          cep_origem: request.cepOrigem.replace(/\D/g, ""),
          cep_destino: request.cepDestino.replace(/\D/g, ""),
          peso: request.peso,
          volumes: request.volumes,
          valor_declarado: request.valorDeclarado || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`Total Express API error: ${response.status}`);
      }

      const data: TotalExpressQuoteResponse = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao cotar Total Express:", error.message);
      throw error;
    }
  }

  /**
   * Cria uma solicitação de coleta
   */
  async schedulePickup(
    data: TotalExpressPickupData,
  ): Promise<TotalExpressPickupResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/coleta`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Total Express API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const err = error as Error;
      console.error("❌ Erro ao agendar coleta Total Express:", err.message);
      throw error;
    }
  }

  /**
   * Consulta CEP
   */
  async consultaCEP(cep: string): Promise<any> {
    try {
      const cepLimpo = cep.replace(/\D/g, "");

      const response = await fetch(`${this.baseUrl}/cep/${cepLimpo}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Total Express API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      console.error("❌ Erro ao consultar CEP Total Express:", error.message);
      throw error;
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new TotalExpressService();
