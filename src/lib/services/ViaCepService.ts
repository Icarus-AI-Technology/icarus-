/**
 * ViaCEP Service - Busca de endereços por CEP
 * API gratuita e ilimitada
 * Documentação: https://viacep.com.br/
 */

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface EnderecoFormatado {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  uf: string;
  ibge: string;
  ddd: string;
}

class ViaCepService {
  private baseUrl = 'https://viacep.com.br/ws';
  
  /**
   * Busca endereço por CEP
   * @param cep - CEP com ou sem formatação (8 dígitos)
   * @returns Dados do endereço ou null se não encontrado
   */
  async buscarPorCep(cep: string): Promise<EnderecoFormatado | null> {
    try {
      // Limpa o CEP (remove pontos, hífens, espaços)
      const cepLimpo = cep.replace(/\D/g, '');
      
      // Valida formato (8 dígitos)
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve conter 8 dígitos');
      }
      
      // Faz a requisição
      const response = await fetch(`${this.baseUrl}/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error(`Erro na API ViaCEP: ${response.status}`);
      }
      
      const data: ViaCepResponse = await response.json();
      
      // Verifica se o CEP foi encontrado
      if (data.erro) {
        return null;
      }
      
      // Formata e retorna os dados
      return {
        cep: this.formatarCep(data.cep),
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.localidade, // Nome completo do estado
        uf: data.uf,
        ibge: data.ibge,
        ddd: data.ddd
      };
      
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar CEP:', err);
      throw err;
    }
  }
  
  /**
   * Busca CEP por endereço (busca inversa)
   * @param uf - Sigla do estado (2 letras)
   * @param cidade - Nome da cidade
   * @param logradouro - Nome da rua/avenida
   * @returns Lista de endereços encontrados
   */
  async buscarPorEndereco(
    uf: string, 
    cidade: string, 
    logradouro: string
  ): Promise<EnderecoFormatado[]> {
    try {
      // Valida UF
      if (uf.length !== 2) {
        throw new Error('UF deve conter 2 letras');
      }
      
      // Valida comprimento mínimo
      if (cidade.length < 3 || logradouro.length < 3) {
        throw new Error('Cidade e logradouro devem ter ao menos 3 caracteres');
      }
      
      // Monta a URL
      const url = `${this.baseUrl}/${uf}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro na API ViaCEP: ${response.status}`);
      }
      
      const data: ViaCepResponse[] = await response.json();
      
      // Verifica se encontrou resultados
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      // Formata e retorna os resultados
      return data.map(item => ({
        cep: this.formatarCep(item.cep),
        logradouro: item.logradouro,
        complemento: item.complemento,
        bairro: item.bairro,
        cidade: item.localidade,
        estado: item.localidade,
        uf: item.uf,
        ibge: item.ibge,
        ddd: item.ddd
      }));
      
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar por endereço:', err);
      throw err;
    }
  }
  
  /**
   * Valida formato de CEP
   * @param cep - CEP a ser validado
   * @returns true se válido, false caso contrário
   */
  validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }
  
  /**
   * Formata CEP no padrão XXXXX-XXX
   * @param cep - CEP sem formatação
   * @returns CEP formatado
   */
  private formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}

// Exporta instância única (singleton)
export const viaCepService = new ViaCepService();

// Exporta classe para testes
export default ViaCepService;

