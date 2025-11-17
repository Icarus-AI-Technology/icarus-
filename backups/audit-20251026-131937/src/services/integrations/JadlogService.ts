// src/services/integrations/JadlogService.ts

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

    if (!this.apiKey || !this.cnpj) {
      console.warn("⚠️ Jadlog: Credenciais não configuradas");
    }
  }

  /**
   * Autentica e obtém token de acesso
   */
  private async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpj: this.cnpj,
          password: this.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha na autenticação Jadlog");
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: any) {
      console.error("❌ Erro na autenticação Jadlog:", error.message);
      throw error;
    }
  }

  /**
   * Rastreia uma encomenda
   */
  async track(trackingCode: string): Promise<JadlogTrackingResponse> {
    try {
      const token = await this.authenticate();

      const response = await fetch(
        `${this.baseUrl}/tracking/consultar?codigo=${trackingCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      const data: JadlogTrackingResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao rastrear Jadlog:", error.message);
      throw error;
    }
  }

  /**
   * Calcula cotação de frete
   */
  async quote(request: JadlogQuoteRequest): Promise<JadlogQuoteResponse> {
    try {
      const token = await this.authenticate();

      const response = await fetch(`${this.baseUrl}/frete/valor`, {
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
      });

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      const data: JadlogQuoteResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao cotar Jadlog:", error.message);
      throw error;
    }
  }

  /**
   * Cria uma nova coleta/postagem
   */
  async createShipment(data: any): Promise<any> {
    try {
      const token = await this.authenticate();

      const response = await fetch(`${this.baseUrl}/shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Jadlog API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("❌ Erro ao criar envio Jadlog:", error.message);
      throw error;
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
