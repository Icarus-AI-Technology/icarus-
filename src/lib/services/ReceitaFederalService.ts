/**
 * Receita Federal Service - Validação de CPF e CNPJ
 * API gratuita com rate limiting
 * Fonte: Brasil API (agregador open-source)
 */

export interface CNPJReceitaFederal {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_raiz: string;
  situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: string;
  data_inicio_atividade: string;
  natureza_juridica: string;
  capital_social: number;
  porte: string;
  ente_federativo: string;
  
  // Endereço
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  
  // Contato
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  email: string;
  
  // Atividades
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  
  // Status
  status: 'ATIVA' | 'SUSPENSA' | 'INAPTA' | 'BAIXADA' | 'NULA';
}

export interface CNPJFormatado {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  dataAbertura: string;
  capitalSocial: number;
  porte: string;
  
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    cidade: string;
    uf: string;
  };
  
  contato: {
    telefone1: string;
    telefone2: string;
    email: string;
  };
  
  atividadePrincipal: {
    codigo: string;
    descricao: string;
  };
  
  status: 'ativa' | 'suspensa' | 'inapta' | 'baixada' | 'nula';
}

class ReceitaFederalService {
  private brasilApiUrl = 'https://brasilapi.com.br/api/cnpj/v1';
  
  /**
   * Consulta CNPJ na Receita Federal
   * @param cnpj - CNPJ com ou sem formatação (14 dígitos)
   * @returns Dados da empresa ou null se não encontrado
   */
  async consultarCNPJ(cnpj: string): Promise<CNPJFormatado | null> {
    try {
      // Limpa o CNPJ
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      // Valida formato
      if (!this.validarCNPJ(cnpjLimpo)) {
        throw new Error('CNPJ inválido');
      }
      
      // Faz a requisição
      const response = await fetch(`${this.brasilApiUrl}/${cnpjLimpo}`);
      
      if (response.status === 404) {
        return null; // CNPJ não encontrado
      }
      
      if (!response.ok) {
        throw new Error(`Erro na API Brasil API: ${response.status}`);
      }
      
      const data: CNPJReceitaFederal = await response.json();
      
      // Formata e retorna os dados
      return this.formatarDadosCNPJ(data);
      
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao consultar CNPJ:', err);
      throw err;
    }
  }
  
  /**
   * Valida CNPJ (algoritmo oficial)
   * @param cnpj - CNPJ sem formatação (14 dígitos)
   * @returns true se válido, false caso contrário
   */
  validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) {
      return false;
    }
    
    // Valida primeiro dígito verificador
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
    
    // Valida segundo dígito verificador
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
   * Valida CPF (algoritmo oficial)
   * @param cpf - CPF sem formatação (11 dígitos)
   * @returns true se válido, false caso contrário
   */
  validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) {
      return false;
    }
    
    // Valida primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpfLimpo.charAt(9))) {
      return false;
    }
    
    // Valida segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpfLimpo.charAt(10));
  }
  
  /**
   * Formata CNPJ no padrão XX.XXX.XXX/XXXX-XX
   */
  formatarCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return cnpjLimpo.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }
  
  /**
   * Formata CPF no padrão XXX.XXX.XXX-XX
   */
  formatarCPF(cpf: string): string {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  /**
   * Formata dados do CNPJ para padrão do sistema
   */
  private formatarDadosCNPJ(data: CNPJReceitaFederal): CNPJFormatado {
    return {
      cnpj: this.formatarCNPJ(data.cnpj),
      razaoSocial: data.razao_social,
      nomeFantasia: data.nome_fantasia || data.razao_social,
      situacao: data.situacao_cadastral,
      dataAbertura: data.data_inicio_atividade,
      capitalSocial: data.capital_social,
      porte: data.porte,
      
      endereco: {
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cep: data.cep,
        cidade: data.municipio,
        uf: data.uf
      },
      
      contato: {
        telefone1: data.ddd_telefone_1,
        telefone2: data.ddd_telefone_2,
        email: data.email
      },
      
      atividadePrincipal: {
        codigo: data.cnae_fiscal,
        descricao: data.cnae_fiscal_descricao
      },
      
      status: this.mapearStatus(data.status)
    };
  }
  
  /**
   * Mapeia status da RF para padrão do sistema
   */
  private mapearStatus(status: CNPJReceitaFederal['status']): CNPJFormatado['status'] {
    const map: Record<CNPJReceitaFederal['status'], CNPJFormatado['status']> = {
      'ATIVA': 'ativa',
      'SUSPENSA': 'suspensa',
      'INAPTA': 'inapta',
      'BAIXADA': 'baixada',
      'NULA': 'nula'
    };
    return map[status] || 'nula';
  }
}

// Exporta instância única (singleton)
export const receitaFederalService = new ReceitaFederalService();

// Exporta classe para testes
export default ReceitaFederalService;

