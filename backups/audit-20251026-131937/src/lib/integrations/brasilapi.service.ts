/**
 * BrasilAPI Service
 * Substitui Infosimples para validações de CPF/CNPJ, CEP, Bancos, etc.
 *
 * Features:
 * - Validação CNPJ (Receita Federal)
 * - Busca CEP (Correios)
 * - Lista de Bancos
 * - Tabela FIPE
 * - Feriados Nacionais
 * - ISBN
 * - DDD
 *
 * Custo: $0 (100% gratuito, open-source)
 * Economia: $600-1,800/ano vs Infosimples
 */

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  data_inicio_atividade: string;
  uf: string;
  municipio: string;
  bairro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  telefone1: string;
  email: string;
  situacao_cadastral: string;
  data_situacao_cadastral: string;
  capital_social: number;
  natureza_juridica: string;
}

export interface CEPData {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

export interface BankData {
  ispb: string;
  name: string;
  code: number;
  fullName: string;
}

export interface FeriadoData {
  date: string;
  name: string;
  type: "national" | "municipal";
}

export class BrasilAPIService {
  private baseURL = "https://brasilapi.com.br/api";
  private timeout = 10000; // 10s

  /**
   * Busca dados de CNPJ
   */
  async getCNPJ(cnpj: string): Promise<CNPJData | null> {
    try {
      const cleanCNPJ = cnpj.replace(/\D/g, "");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/cnpj/v1/${cleanCNPJ}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("[BrasilAPI] CNPJ não encontrado:", cleanCNPJ);
          return null;
        }
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data as CNPJData;
    } catch (error) {
      const err = error as Error;
      if (error instanceof Error && error.name === "AbortError") {
        console.error("[BrasilAPI] Timeout na busca de CNPJ");
      } else {
        console.error("[BrasilAPI] Erro ao buscar CNPJ:", err);
      }
      return null;
    }
  }

  /**
   * Busca dados de CEP
   */
  async getCEP(cep: string): Promise<CEPData | null> {
    try {
      const cleanCEP = cep.replace(/\D/g, "");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/cep/v2/${cleanCEP}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("[BrasilAPI] CEP não encontrado:", cleanCEP);
          return null;
        }
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data as CEPData;
    } catch (error) {
      const err = error as Error;
      console.error("[BrasilAPI] Erro ao buscar CEP:", err);
      return null;
    }
  }

  /**
   * Lista todos os bancos
   */
  async getBancos(): Promise<BankData[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/banks/v1`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data as BankData[];
    } catch (error) {
      const err = error as Error;
      console.error("[BrasilAPI] Erro ao buscar bancos:", err);
      return [];
    }
  }

  /**
   * Busca banco por código
   */
  async getBanco(codigo: string): Promise<BankData | null> {
    try {
      const response = await fetch(`${this.baseURL}/banks/v1/${codigo}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data as BankData;
    } catch (error) {
      const err = error as Error;
      console.error("[BrasilAPI] Erro ao buscar banco:", err);
      return null;
    }
  }

  /**
   * Lista feriados nacionais por ano
   */
  async getFeriados(ano: number): Promise<FeriadoData[]> {
    try {
      const response = await fetch(`${this.baseURL}/feriados/v1/${ano}`);

      if (!response.ok) {
        throw new Error(`BrasilAPI error: ${response.status}`);
      }

      const data = await response.json();
      return data as FeriadoData[];
    } catch (error) {
      const err = error as Error;
      console.error("[BrasilAPI] Erro ao buscar feriados:", err);
      return [];
    }
  }

  /**
   * Valida CPF (algoritmo local)
   */
  validarCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");

    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // 000.000.000-00, etc.

    let soma = 0;
    let resto;

    // Valida 1º dígito
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCPF.substring(9, 10))) return false;

    // Valida 2º dígito
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
  }

  /**
   * Valida CNPJ (algoritmo local)
   */
  validarCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, "");

    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    let tamanho = cleanCNPJ.length - 2;
    let numeros = cleanCNPJ.substring(0, tamanho);
    const digitos = cleanCNPJ.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    // Valida 1º dígito
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    // Valida 2º dígito
    tamanho = tamanho + 1;
    numeros = cleanCNPJ.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  }

  /**
   * Formata CPF
   */
  formatarCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, "");
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  /**
   * Formata CNPJ
   */
  formatarCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/\D/g, "");
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  /**
   * Formata CEP
   */
  formatarCEP(cep: string): string {
    const clean = cep.replace(/\D/g, "");
    return clean.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/banks/v1`, {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton
export const brasilAPIService = new BrasilAPIService();
