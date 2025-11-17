// src/services/integrations/BraspressService.ts

interface BraspressTrackingResponse {
  numero: string;
  status: string;
  situacao: string;
  eventos: Array<{
    data: string;
    hora: string;
    filial: string;
    cidade: string;
    uf: string;
    ocorrencia: string;
    descricao: string;
  }>;
}

interface BraspressQuoteRequest {
  cepOrigem: string;
  cepDestino: string;
  peso: number;
  volumes: number;
  valorMercadoria: number;
  tipo: "R" | "N"; // R = Rodoviário, N = Normal
}

interface BraspressQuoteResponse {
  valorFrete: number;
  prazo: number;
  dataEntrega: string;
  icms: number;
  pedagio: number;
}

export class BraspressService {
  private readonly baseUrl = "https://api.braspress.com.br";
  private readonly apiKey: string;
  private readonly cnpj: string;

  constructor() {
    this.apiKey = process.env.BRASPRESS_API_KEY || "";
    this.cnpj = process.env.BRASPRESS_CNPJ || "";

    if (!this.apiKey || !this.cnpj) {
      console.warn("⚠️ Braspress: Credenciais não configuradas");
    }
  }

  /**
   * Headers padrão para requisições
   */
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "X-CNPJ": this.cnpj,
    };
  }

  /**
   * Rastreia uma encomenda
   */
  async track(trackingCode: string): Promise<BraspressTrackingResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/tracking/${trackingCode}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Braspress API error: ${response.status}`);
      }

      const data: BraspressTrackingResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao rastrear Braspress:", error.message);
      throw error;
    }
  }

  /**
   * Calcula cotação de frete
   */
  async quote(request: BraspressQuoteRequest): Promise<BraspressQuoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/cotacao/calcular`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          cnpjRemetente: this.cnpj,
          cepOrigem: request.cepOrigem.replace(/\D/g, ""),
          cepDestino: request.cepDestino.replace(/\D/g, ""),
          peso: request.peso,
          volumes: request.volumes,
          valorMercadoria: request.valorMercadoria,
          tipo: request.tipo || "R",
          cubagem: this.calculateCubagem(request.volumes),
        }),
      });

      if (!response.ok) {
        throw new Error(`Braspress API error: ${response.status}`);
      }

      const data: BraspressQuoteResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao cotar Braspress:", error.message);
      throw error;
    }
  }

  /**
   * Calcula cubagem estimada (simplificado)
   */
  private calculateCubagem(volumes: number): number {
    // Cubagem padrão: 0.1m³ por volume
    return volumes * 0.1;
  }

  /**
   * Cria conhecimento de transporte
   */
  async createShipment(data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/conhecimento`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Braspress API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("❌ Erro ao criar envio Braspress:", error.message);
      throw error;
    }
  }

  /**
   * Consulta prazo de entrega
   */
  async consultaPrazo(
    cepOrigem: string,
    cepDestino: string,
  ): Promise<{ prazo: number; dataEntrega: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/prazo`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          cepOrigem: cepOrigem.replace(/\D/g, ""),
          cepDestino: cepDestino.replace(/\D/g, ""),
        }),
      });

      if (!response.ok) {
        throw new Error(`Braspress API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("❌ Erro ao consultar prazo Braspress:", error.message);
      throw error;
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/status`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new BraspressService();
