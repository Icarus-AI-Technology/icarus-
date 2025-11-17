/**
 * API InfoSimples - Agregador de Consultas
 * ICARUS v5.0
 *
 * Integração centralizada com todas as APIs da InfoSimples:
 * - CNPJ (Receita Federal)
 * - CPF (Receita Federal)
 * - CNH (DETRAN)
 * - Veículos (DETRAN)
 * - Processos (CNJ)
 * - ANVISA (Produtos para Saúde)
 * - SEFAZ (26 estados + DF)
 * - Cadastro Positivo (SPC/Serasa)
 *
 * Referência: https://api.infosimples.com/
 * Token: fzxpq47PdYnoOi93sqQhC_BdJJFMaD5_zVZmq3o6
 */

const INFOSIMPLES_BASE_URL = "https://api.infosimples.com/api/v2";
const INFOSIMPLES_TOKEN = "fzxpq47PdYnoOi93sqQhC_BdJJFMaD5_zVZmq3o6";

export interface InfoSimplesConfig {
  token?: string;
  timeout?: number;
}

export class InfoSimplesAPI {
  private token: string;
  private timeout: number;

  constructor(config?: InfoSimplesConfig) {
    this.token = config?.token || INFOSIMPLES_TOKEN;
    this.timeout = config?.timeout || 30000; // 30s
  }

  /**
   * Faz requisição para a API InfoSimples
   */
  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: unknown,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${INFOSIMPLES_BASE_URL}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`InfoSimples API Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Erro na consulta");
      }

      return result.data as T;
    } catch (error) {
      const err = error as Error;
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Timeout na consulta. Tente novamente.");
      }

      throw error;
    }
  }

  // ============================================
  // CNPJ - Receita Federal
  // ============================================

  async consultarCNPJ(cnpj: string) {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    return this.request(`/consultas/receita-federal/cnpj/${cnpjLimpo}`);
  }

  // ============================================
  // CPF - Receita Federal
  // ============================================

  async consultarCPF(cpf: string, dataNascimento: string) {
    const cpfLimpo = cpf.replace(/[^\d]/g, "");
    return this.request(`/consultas/receita-federal/cpf`, "POST", {
      cpf: cpfLimpo,
      data_nascimento: dataNascimento,
    });
  }

  // ============================================
  // CNH - DETRAN
  // ============================================

  async consultarCNH(numeroCNH: string, uf: string) {
    return this.request(
      `/consultas/detran/${uf.toLowerCase()}/cnh/${numeroCNH}`,
    );
  }

  // ============================================
  // Veículos - DETRAN
  // ============================================

  async consultarVeiculo(placa: string, renavam?: string) {
    const placaLimpa = placa.replace(/[^\da-zA-Z]/g, "").toUpperCase();
    return this.request(`/consultas/detran/veiculo`, "POST", {
      placa: placaLimpa,
      renavam: renavam,
    });
  }

  // ============================================
  // ANVISA - Produtos para Saúde
  // ============================================

  async consultarProdutoANVISA(registro: string) {
    const registroLimpo = registro.replace(/[^\d]/g, "");
    return this.request(`/consultas/anvisa/produtos-saude/${registroLimpo}`);
  }

  // ============================================
  // SEFAZ - Nota Fiscal Eletrônica
  // ============================================

  async consultarNFe(chave: string, uf: string) {
    const chaveLimpa = chave.replace(/[^\d]/g, "");
    return this.request(
      `/consultas/sefaz/${uf.toLowerCase()}/nfe/${chaveLimpa}`,
    );
  }

  /**
   * Consulta preços agregados de produto via SEFAZ
   */
  async consultarPrecosSEFAZ(
    ncm: string,
    estados: string[] = ["SP", "RJ", "MG"],
    periodoDias: number = 90,
  ) {
    const ncmLimpo = ncm.replace(/[^\d]/g, "");
    return this.request(`/consultas/sefaz/precos/ncm/${ncmLimpo}`, "POST", {
      estados: estados.map((e) => e.toLowerCase()),
      periodo_dias: periodoDias,
    });
  }

  // ============================================
  // Processos - CNJ
  // ============================================

  async consultarProcesso(numeroProcesso: string, tribunal: string) {
    const processoLimpo = numeroProcesso.replace(/[^\d]/g, "");
    return this.request(`/consultas/cnj/${tribunal}/processo/${processoLimpo}`);
  }

  // ============================================
  // Cadastro Positivo - Score de Crédito
  // ============================================

  async consultarCadastroPositivo(cpf: string) {
    const cpfLimpo = cpf.replace(/[^\d]/g, "");
    return this.request(`/consultas/cadastro-positivo/cpf/${cpfLimpo}`);
  }

  // ============================================
  // Validação de Token
  // ============================================

  async validarToken(): Promise<boolean> {
    try {
      await this.request("/auth/validate");
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // Saldo de Créditos
  // ============================================

  async consultarSaldo() {
    return this.request("/auth/balance");
  }
}

/**
 * Instância singleton da API InfoSimples
 */
export const infoSimplesAPI = new InfoSimplesAPI();

/**
 * Hook React para InfoSimples
 */
import { useState } from "react";

export function useInfoSimples(token?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);

  const api = new InfoSimplesAPI({ token });

  const consultar = async (
    type: "cnpj" | "cpf" | "cnh" | "veiculo" | "anvisa" | "nfe" | "precos",
    params: Record<string, unknown>,
  ) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let resultado;

      switch (type) {
        case "cnpj":
          resultado = await api.consultarCNPJ(String(params.cnpj));
          break;
        case "cpf":
          resultado = await api.consultarCPF(
            String(params.cpf),
            String(params.dataNascimento),
          );
          break;
        case "cnh":
          resultado = await api.consultarCNH(
            String(params.numero),
            String(params.uf),
          );
          break;
        case "veiculo":
          resultado = await api.consultarVeiculo(
            String(params.placa),
            params.renavam as string | undefined,
          );
          break;
        case "anvisa":
          resultado = await api.consultarProdutoANVISA(String(params.registro));
          break;
        case "nfe":
          resultado = await api.consultarNFe(
            String(params.chave),
            String(params.uf),
          );
          break;
        case "precos":
          resultado = await api.consultarPrecosSEFAZ(
            String(params.ncm),
            params.estados as string[] | undefined,
            params.periodoDias as number | undefined,
          );
          break;
        default:
          throw new Error("Tipo de consulta não suportado");
      }

      setData(resultado);
      return resultado;
    } catch (error) {
      const err = error as Error;
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setData(null);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    consultar,
    limpar,
    api,
  };
}
