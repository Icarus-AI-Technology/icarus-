// src/services/integrations/ReceitaWSService.ts

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
  private readonly baseUrl = "https://www.receitaws.com.br/v1";

  constructor() {
    // ReceitaWS é pública, não precisa de credenciais
  }

  /**
   * Consulta CNPJ completo
   */
  async consultaCNPJ(cnpj: string): Promise<ReceitaWSResponse> {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, "");

      const response = await fetch(`${this.baseUrl}/cnpj/${cnpjLimpo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Rate limit excedido. ReceitaWS permite apenas 3 requisições por minuto.",
          );
        }
        throw new Error(`ReceitaWS error: ${response.status}`);
      }

      const data: ReceitaWSResponse = await response.json();

      // Verificar se retornou erro
      if (data.status === "ERROR") {
        throw new Error("CNPJ não encontrado ou inválido");
      }

      return data;
    } catch (error: unknown) {
      console.error("❌ Erro ao consultar CNPJ ReceitaWS:", error.message);
      throw error;
    }
  }

  /**
   * Consulta CNPJ com retry automático em caso de rate limit
   */
  async consultaCNPJComRetry(
    cnpj: string,
    maxRetries = 3,
  ): Promise<ReceitaWSResponse> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.consultaCNPJ(cnpj);
      } catch (error: unknown) {
        lastError = error;

        if (error.message.includes("Rate limit")) {
          // Aguardar 60 segundos antes de tentar novamente
          console.warn(
            `⚠️ Rate limit atingido. Aguardando 60s antes de tentar novamente (tentativa ${i + 1}/${maxRetries})...`,
          );

          if (i < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 60000));
          }
        } else {
          // Se for outro erro, não tentar novamente
          throw error;
        }
      }
    }

    throw (
      lastError ||
      new Error("Falha ao consultar CNPJ após múltiplas tentativas")
    );
  }

  /**
   * Valida formato do CNPJ
   */
  validaCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      return false;
    }

    // Eliminar CNPJs inválidos conhecidos
    if (/^(\d)\1+$/.test(cnpjLimpo)) {
      return false;
    }

    // Validar dígitos verificadores
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

    tamanho = tamanho + 1;
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

  /**
   * Formata CNPJ
   */
  formataCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      return cnpj;
    }

    return cnpjLimpo.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Usar CNPJ da Receita Federal como teste
      const response = await fetch(`${this.baseUrl}/cnpj/00000000000191`, {
        method: "GET",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new ReceitaWSService();
