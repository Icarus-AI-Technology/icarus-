/**
 * Veículo Service - Validação de Placas (Mercosul e antiga)
 * API gratuita: Brasil API (placas Mercosul)
 * Validação local para ambos os formatos
 */

export interface PlacaVeiculoResponse {
  placa: string;
  tipo: 'mercosul' | 'antiga';
  valida: boolean;
  uf?: string;
  cidade?: string;
  modelo?: string;
  marca?: string;
  ano?: number;
  cor?: string;
}

export interface PlacaFormatada {
  placa: string;
  tipo: 'mercosul' | 'antiga';
  valida: boolean;
  formatoCorreto: boolean;
}

class VeiculoService {
  private brasilApiUrl = 'https://brasilapi.com.br/api/fipe/placas/v1';

  /**
   * Valida formato de Placa Mercosul
   * Formato: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
   */
  validarPlacaMercosul(placa: string): boolean {
    const limpo = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return /^[A-Z]{3}\d[A-Z]\d{2}$/.test(limpo);
  }

  /**
   * Valida formato de Placa Antiga
   * Formato: ABC1234 (3 letras + 4 números)
   */
  validarPlacaAntiga(placa: string): boolean {
    const limpo = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return /^[A-Z]{3}\d{4}$/.test(limpo);
  }

  /**
   * Valida qualquer formato de placa
   */
  validarPlaca(placa: string): PlacaFormatada {
    const limpo = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    const mercosul = this.validarPlacaMercosul(limpo);
    const antiga = this.validarPlacaAntiga(limpo);

    return {
      placa: this.formatarPlaca(limpo),
      tipo: mercosul ? 'mercosul' : antiga ? 'antiga' : 'mercosul',
      valida: mercosul || antiga,
      formatoCorreto: mercosul || antiga,
    };
  }

  /**
   * Formata placa no padrão ABC-1D23 (Mercosul) ou ABC-1234 (Antiga)
   */
  formatarPlaca(placa: string): string {
    const limpo = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (limpo.length < 7) return limpo;

    // Mercosul: ABC-1D23
    if (this.validarPlacaMercosul(limpo)) {
      return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
    }

    // Antiga: ABC-1234
    if (this.validarPlacaAntiga(limpo)) {
      return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
    }

    return limpo;
  }

  /**
   * Consulta placa na FIPE (via Brasil API)
   * Nota: API gratuita, mas pode ter rate limiting
   *
   * @param placa - Placa do veículo (Mercosul ou antiga)
   * @returns Dados do veículo ou null se não encontrado
   */
  async consultarPlaca(placa: string): Promise<PlacaVeiculoResponse | null> {
    try {
      const limpo = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();

      // Valida formato primeiro
      const validacao = this.validarPlaca(limpo);
      if (!validacao.valida) {
        throw new Error('Formato de placa inválido');
      }

      console.log(`[Veículo Service] Consultando placa ${limpo}...`);

      // Faz requisição
      const response = await fetch(`${this.brasilApiUrl}/${limpo}`);

      if (response.status === 404) {
        console.log(`[Veículo Service] Placa ${limpo} não encontrada`);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erro na API Brasil API: ${response.status}`);
      }

      const data = await response.json();

      console.log(`[Veículo Service] ✅ Placa ${limpo} encontrada`);

      return {
        placa: this.formatarPlaca(limpo),
        tipo: validacao.tipo,
        valida: true,
        uf: data.uf,
        cidade: data.municipio,
        modelo: data.modelo,
        marca: data.marca,
        ano: data.ano_modelo,
        cor: data.cor,
      };
    } catch (error) {
      console.error('[Veículo Service] Erro ao consultar placa:', error);

      // Se erro for de rede/fetch, retornar apenas validação local
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('econnrefused')
      ) {
        console.warn('Tentando fallback para dados mockados (offline mode)');
        const limpo = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const validacao = this.validarPlaca(limpo);
        return {
          placa: this.formatarPlaca(limpo),
          tipo: validacao.tipo,
          valida: validacao.valida,
        };
      }
      throw error;
    }
  }

  /**
   * Converte placa antiga para Mercosul (estimativa)
   * Nota: Conversão real depende do DETRAN de cada estado
   *
   * Regra estimada (não oficial):
   * - Mantém as 3 primeiras letras
   * - Converte 1º número em letra (0=A, 1=B, ..., 9=J)
   * - Mantém demais números
   */
  converterParaMercosul(placaAntiga: string): string | null {
    const limpo = placaAntiga.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (!this.validarPlacaAntiga(limpo)) {
      return null;
    }

    const letras = limpo.slice(0, 3);
    const numeros = limpo.slice(3);

    // Converte 1º número em letra
    const primeiroNumero = parseInt(numeros[0]);
    const letraConvertida = String.fromCharCode(65 + primeiroNumero); // 0=A, 1=B, ...

    const placaMercosul = `${letras}${numeros[1]}${letraConvertida}${numeros.slice(2)}`;

    return this.formatarPlaca(placaMercosul);
  }

  /**
   * Lista de UFs brasileiras (para validação)
   */
  getUFsValidas(): string[] {
    return [
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ];
  }
}

// Exporta instância única (singleton)
export const veiculoService = new VeiculoService();

// Exporta classe para testes
export default VeiculoService;
