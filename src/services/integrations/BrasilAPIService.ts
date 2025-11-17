// src/services/integrations/BrasilAPIService.ts

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

export class BrasilAPIService {
  private readonly baseUrl = "https://brasilapi.com.br/api";

  constructor() {
    // BrasilAPI é pública, não precisa de credenciais
  }

  /**
   * Consulta CNPJ
   */
  async consultaCNPJ(cnpj: string): Promise<CNPJResponse> {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, "");

      const response = await fetch(`${this.baseUrl}/cnpj/v1/${cnpjLimpo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: CNPJResponse = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao consultar CNPJ BrasilAPI:", error.message);
      throw error;
    }
  }

  /**
   * Consulta CEP
   */
  async consultaCEP(cep: string): Promise<CEPResponse> {
    try {
      const cepLimpo = cep.replace(/\D/g, "");

      const response = await fetch(`${this.baseUrl}/cep/v1/${cepLimpo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: CEPResponse = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao consultar CEP BrasilAPI:", error.message);
      throw error;
    }
  }

  /**
   * Lista todos os bancos
   */
  async listaBancos(): Promise<BankResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/banks/v1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: BankResponse[] = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao listar bancos BrasilAPI:", error.message);
      throw error;
    }
  }

  /**
   * Consulta banco por código
   */
  async consultaBanco(codigo: number): Promise<BankResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/banks/v1/${codigo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: BankResponse = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao consultar banco BrasilAPI:", error.message);
      throw error;
    }
  }

  /**
   * Lista feriados nacionais de um ano
   */
  async listaFeriados(ano: number): Promise<HolidayResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/feriados/v1/${ano}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data: HolidayResponse[] = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao listar feriados BrasilAPI:", error.message);
      throw error;
    }
  }

  /**
   * Consulta DDD
   */
  async consultaDDD(ddd: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/ddd/v1/${ddd}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      console.error("❌ Erro ao consultar DDD BrasilAPI:", error.message);
      throw error;
    }
  }

  /**
   * Consulta NCM (Nomenclatura Comum do Mercosul)
   */
  async consultaNCM(codigo: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/ncm/v1/${codigo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      console.error("❌ Erro ao consultar NCM BrasilAPI:", error.message);
      throw error;
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cep/v1/01310100`, {
        method: "GET",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new BrasilAPIService();
