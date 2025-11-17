/**
 * ANVISA Service - Validação de Dispositivos Médicos e OPME
 * API: Portal ANVISA (scraping ou API se disponível)
 * Validação local de formato de registro
 */

export interface DispositivoANVISA {
  registro: string;
  produto: string;
  fabricante: string;
  situacao: "ATIVO" | "INATIVO" | "CANCELADO" | "VENCIDO";
  categoria: "OPME" | "MEDICAMENTO" | "COSMETICO" | "DISPOSITIVO";
  dataRegistro?: string;
  dataValidade?: string;
  classeRisco?: "I" | "II" | "III" | "IV";
}

export interface DispositivoFormatado {
  registro: string;
  valido: boolean;
  formatoCorreto: boolean;
  tipo: "registro" | "processo";
}

class ANVISAService {
  private anvisaUrl = "https://consultas.anvisa.gov.br";

  /**
   * Valida formato de Registro ANVISA
   * Formato padrão: 80XXX.XXX.XXX
   * Onde: 80 = prefixo fixo, XXX.XXX.XXX = número do registro
   */
  validarFormatoRegistro(registro: string): boolean {
    const limpo = registro.replace(/[^0-9]/g, "");

    // Registro completo: 11 dígitos começando com 80
    return /^80\d{9}$/.test(limpo);
  }

  /**
   * Valida formato de Processo ANVISA
   * Formato: XXXXXXX-XX.XXXX-X/XXXXX-XX
   */
  validarFormatoProcesso(processo: string): boolean {
    const limpo = processo.replace(/\s/g, "");

    return /^\d{7}-\d{2}\.\d{4}-\d{1}\/\d{5}-\d{2}$/.test(limpo);
  }

  /**
   * Valida qualquer formato ANVISA (registro ou processo)
   */
  validar(identificador: string): DispositivoFormatado {
    const registro = this.validarFormatoRegistro(identificador);
    const processo = this.validarFormatoProcesso(identificador);

    return {
      registro: this.formatarRegistro(identificador),
      valido: registro || processo,
      formatoCorreto: registro || processo,
      tipo: registro ? "registro" : "processo",
    };
  }

  /**
   * Formata registro ANVISA no padrão 80XXX.XXX.XXX
   */
  formatarRegistro(registro: string): string {
    const limpo = registro.replace(/[^0-9]/g, "");

    if (limpo.length < 11) return registro;

    // Formato: 80XXX.XXX.XXX
    if (limpo.startsWith("80")) {
      return `${limpo.slice(0, 5)}.${limpo.slice(5, 8)}.${limpo.slice(8, 11)}`;
    }

    return registro;
  }

  /**
   * Consulta registro ANVISA
   *
   * NOTA: Implementação simplificada
   * Em produção, usar:
   * 1. API oficial ANVISA (se disponível)
   * 2. Scraping do portal ANVISA
   * 3. Base de dados local (atualizada periodicamente)
   * 4. API comercial (Infosimples)
   */
  async consultarRegistro(registro: string): Promise<DispositivoANVISA | null> {
    try {
      const validacao = this.validar(registro);

      if (!validacao.valido) {
        throw new Error("Formato de registro ANVISA inválido");
      }

      console.log(
        `[ANVISA Service] Consultando registro ${validacao.registro}...`,
      );

      // ⚠️ IMPLEMENTAÇÃO MOCK
      // TODO: Integrar com API real da ANVISA ou scraping

      console.warn(
        "⚠️ ANVISA Service está usando validação MOCK.\n" +
          "Para produção, implementar:\n" +
          "1. API oficial ANVISA\n" +
          "2. Scraping portal ANVISA\n" +
          "3. Base de dados local\n" +
          "4. API Infosimples (R$ 0,15/req)",
      );

      // Retorna validação básica
      return {
        registro: validacao.registro,
        produto: "VALIDAÇÃO PENDENTE - MOCK",
        fabricante: "FABRICANTE NÃO DISPONÍVEL",
        situacao: "ATIVO",
        categoria: "OPME",
        classeRisco: "III",
      };
    } catch (error) {
      const err = error as Error;
      console.error("[ANVISA Service] Erro ao consultar registro:", err);
      throw err;
    }
  }

  /**
   * Verifica se registro está ativo
   */
  async verificarAtivo(registro: string): Promise<boolean> {
    const dispositivo = await this.consultarRegistro(registro);
    return dispositivo?.situacao === "ATIVO";
  }

  /**
   * Lista categorias de dispositivos
   */
  getCategorias(): string[] {
    return ["OPME", "MEDICAMENTO", "COSMETICO", "DISPOSITIVO"];
  }

  /**
   * Lista classes de risco
   */
  getClassesRisco(): string[] {
    return ["I", "II", "III", "IV"];
  }

  /**
   * Valida se é OPME (Órteses, Próteses e Materiais Especiais)
   */
  isOPME(categoria: string): boolean {
    return categoria.toUpperCase() === "OPME";
  }
}

// Exporta instância única (singleton)
export const anvisaService = new ANVISAService();

// Exporta classe para testes
export default ANVISAService;
