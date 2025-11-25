/**
 * Serviço de Validação - ICARUS v5.0
 *
 * Responsável por:
 * - Validação de CPF/CNPJ (Receita Federal)
 * - Validação de CRM (CFM)
 * - Validação de ANVISA (produtos)
 * - Validação de CEP (ViaCEP)
 * - Validação de ANS (convênios)
 * - Validação de CNES (hospitais)
 *
 * @version 5.0.0
 */

// ========================================
// INTERFACES
// ========================================

export interface ResultadoValidacaoCPF {
  valido: boolean;
  nome?: string;
  dataNascimento?: string;
  situacao?: string;
  mensagem?: string;
}

export interface ResultadoValidacaoCNPJ {
  valido: boolean;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  situacao?: string;
  telefone?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
  mensagem?: string;
}

export interface ResultadoValidacaoCRM {
  ativo: boolean;
  nome?: string;
  especialidade?: string;
  uf?: string;
  numero?: string;
  mensagem?: string;
}

export interface ResultadoValidacaoANVISA {
  valido: boolean;
  descricao?: string;
  classeRisco?: string;
  fabricante?: string;
  situacao?: string;
  mensagem?: string;
}

export interface ResultadoValidacaoCEP {
  encontrado: boolean;
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: string;
}

export interface ResultadoValidacaoANS {
  encontrado: boolean;
  razaoSocial?: string;
  cnpj?: string;
  registro?: string;
  situacao?: string;
  mensagem?: string;
}

export interface ResultadoValidacaoCNES {
  encontrado: boolean;
  nome?: string;
  tipo?: string;
  cnpj?: string;
  cnes?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
  mensagem?: string;
}

// ========================================
// SERVIÇO DE VALIDAÇÃO
// ========================================

export class ValidacaoService {
  // ========================================
  // VALIDAÇÃO DE CPF
  // ========================================

  /**
   * Validar dígitos verificadores do CPF
   */
  validarDigitosCPF(cpf: string): boolean {
    // Remover caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Verificar se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;

    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;

    if (parseInt(cpfLimpo.charAt(9)) !== digito1) return false;

    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;

    if (parseInt(cpfLimpo.charAt(10)) !== digito2) return false;

    return true;
  }

  /**
   * Consultar CPF na Receita Federal (via Brasil API)
   */
  async consultarCPFReceitaFederal(cpf: string): Promise<ResultadoValidacaoCPF> {
    try {
      // Validar dígitos primeiro
      if (!this.validarDigitosCPF(cpf)) {
        return {
          valido: false,
          mensagem: 'CPF com dígitos verificadores inválidos',
        };
      }

      const cpfLimpo = cpf.replace(/\D/g, '');

      // Tentar Brasil API primeiro
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cpf/v1/${cpfLimpo}`);

        if (response.ok) {
          const data = await response.json();
          return {
            valido: true,
            nome: data.nome,
            situacao: data.situacao,
          };
        }
      } catch (error) {
        const err = error as Error;
        console.warn('Brasil API indisponível, usando validação local');
      }

      // Fallback: validação apenas dos dígitos
      return {
        valido: true,
        mensagem: 'CPF válido (validação local)',
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao consultar CPF:', err);
      return {
        valido: false,
        mensagem: 'Erro ao consultar CPF na Receita Federal',
      };
    }
  }

  /**
   * Wrapper simples para validação de CPF (retorna boolean)
   */
  async validarCPF(cpf: string): Promise<boolean> {
    const resultado = await this.consultarCPFReceitaFederal(cpf);
    return resultado.valido;
  }

  // ========================================
  // VALIDAÇÃO DE CNPJ
  // ========================================

  /**
   * Validar dígitos verificadores do CNPJ
   */
  validarDigitosCNPJ(cnpj: string): boolean {
    // Remover caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Verificar se tem 14 dígitos
    if (cnpjLimpo.length !== 14) return false;

    // Verificar se todos os dígitos são iguais (CNPJ inválido)
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

    // Validar primeiro dígito verificador
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
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    // Validar segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
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
   * Consultar CNPJ na Receita Federal (via Brasil API)
   */
  async consultarCNPJReceitaFederal(cnpj: string): Promise<ResultadoValidacaoCNPJ> {
    try {
      // Validar dígitos primeiro
      if (!this.validarDigitosCNPJ(cnpj)) {
        return {
          valido: false,
          mensagem: 'CNPJ com dígitos verificadores inválidos',
        };
      }

      const cnpjLimpo = cnpj.replace(/\D/g, '');

      // Consultar Brasil API
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);

        if (response.ok) {
          const data = await response.json();
          return {
            valido: true,
            razaoSocial: data.razao_social,
            nomeFantasia: data.nome_fantasia,
            cnpj: data.cnpj,
            situacao: data.descricao_situacao_cadastral,
            telefone: data.telefone,
            endereco: {
              logradouro: data.logradouro,
              numero: data.numero,
              complemento: data.complemento,
              bairro: data.bairro,
              cidade: data.municipio,
              uf: data.uf,
              cep: data.cep,
            },
          };
        }
      } catch (error) {
        const err = error as Error;
        console.warn('Brasil API indisponível para CNPJ');
      }

      // Fallback: validação apenas dos dígitos
      return {
        valido: true,
        mensagem: 'CNPJ válido (validação local)',
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao consultar CNPJ:', err);
      return {
        valido: false,
        mensagem: 'Erro ao consultar CNPJ na Receita Federal',
      };
    }
  }

  /**
   * Validação simples de CNPJ (apenas dígitos verificadores)
   */
  validarCNPJ(cnpj: string): boolean {
    return this.validarDigitosCNPJ(cnpj);
  }

  /**
   * Consultar CNPJ e retornar dados normalizados
   */
  async consultarCNPJ(
    cnpj: string
  ): Promise<
    | {
        razao_social?: string;
        nome_fantasia?: string;
        telefone?: string;
        endereco?: {
          cep?: string;
          logradouro?: string;
          numero?: string;
          bairro?: string;
          cidade?: string;
          uf?: string;
        };
      }
    | null
  > {
    const resultado = await this.consultarCNPJReceitaFederal(cnpj);
    if (!resultado.valido) {
      return null;
    }

    return {
      razao_social: resultado.razaoSocial,
      nome_fantasia: resultado.nomeFantasia,
      telefone: resultado.telefone,
      endereco: {
        cep: resultado.endereco?.cep,
        logradouro: resultado.endereco?.logradouro,
        numero: resultado.endereco?.numero,
        bairro: resultado.endereco?.bairro,
        cidade: resultado.endereco?.cidade,
        uf: resultado.endereco?.uf,
      },
    };
  }

  // ========================================
  // VALIDAÇÃO DE CRM
  // ========================================

  /**
   * Validar formato de CRM
   */
  validarFormatoCRM(crm: string, uf: string): boolean {
    // Remover caracteres não numéricos
    const crmLimpo = crm.replace(/\D/g, '');

    // Verificar se tem entre 4 e 8 dígitos
    if (crmLimpo.length < 4 || crmLimpo.length > 8) return false;

    // Verificar se UF é válida
    const ufsValidas = [
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
    if (!ufsValidas.includes(uf.toUpperCase())) return false;

    return true;
  }

  /**
   * Consultar CRM no CFM (via scraping ou API quando disponível)
   */
  async consultarCRM(crm: string, uf: string): Promise<ResultadoValidacaoCRM> {
    try {
      // Validar formato primeiro
      if (!this.validarFormatoCRM(crm, uf)) {
        return {
          ativo: false,
          mensagem: 'Formato de CRM inválido',
        };
      }

      // TODO: Implementar consulta real ao CFM quando API estiver disponível
      // Por ora, retornar validação de formato

      console.warn('Consulta ao CFM não implementada. Validando apenas formato.');

      return {
        ativo: true,
        numero: crm,
        uf: uf.toUpperCase(),
        mensagem: 'CRM válido (validação de formato)',
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao consultar CRM:', err);
      return {
        ativo: false,
        mensagem: 'Erro ao consultar CRM no CFM',
      };
    }
  }

  // ========================================
  // VALIDAÇÃO DE CEP
  // ========================================

  /**
   * Consultar CEP (via ViaCEP)
   */
  async consultarCEP(cep: string): Promise<ResultadoValidacaoCEP> {
    try {
      const cepLimpo = cep.replace(/\D/g, '');

      if (cepLimpo.length !== 8) {
        return {
          encontrado: false,
          erro: 'CEP deve ter 8 dígitos',
        };
      }

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (!response.ok) {
        return {
          encontrado: false,
          erro: 'Erro ao consultar ViaCEP',
        };
      }

      const data = await response.json();

      if (data.erro) {
        return {
          encontrado: false,
          erro: 'CEP não encontrado',
        };
      }

      return {
        encontrado: true,
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge,
        gia: data.gia,
        ddd: data.ddd,
        siafi: data.siafi,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao consultar CEP:', err);
      return {
        encontrado: false,
        erro: 'Erro ao consultar CEP',
      };
    }
  }

  /**
   * Wrapper simples para validação de CEP (retorna boolean)
   */
  async validarCEP(cep: string): Promise<boolean> {
    const resultado = await this.consultarCEP(cep);
    return resultado.encontrado;
  }

  // ========================================
  // VALIDAÇÃO DE CÓDIGO ANVISA
  // ========================================

  /**
   * Consultar código ANVISA
   */
  async consultarANVISA(codigo: string): Promise<ResultadoValidacaoANVISA> {
    try {
      // TODO: Implementar consulta real à ANVISA quando API estiver disponível
      // Por ora, retornar validação de formato

      const codigoLimpo = codigo.replace(/\D/g, '');

      if (codigoLimpo.length < 10) {
        return {
          valido: false,
          mensagem: 'Código ANVISA deve ter pelo menos 10 dígitos',
        };
      }

      console.warn('Consulta à ANVISA não implementada. Validando apenas formato.');

      return {
        valido: true,
        mensagem: 'Código ANVISA válido (validação de formato)',
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao consultar ANVISA:', err);
      return {
        valido: false,
        mensagem: 'Erro ao consultar código ANVISA',
      };
    }
  }

  // ========================================
  // VALIDAÇÃO DE CNES
  // ========================================

  private async consultarCNES(cnes: string): Promise<ResultadoValidacaoCNES> {
    try {
      const response = await fetch(
        `https://apidadosms.saude.gov.br/cnes/estabelecimentos/${cnes}`
      );

      if (!response.ok) {
        return {
          encontrado: false,
          mensagem: 'CNES não encontrado',
        };
      }

      const data = await response.json();
      return {
        encontrado: true,
        nome: data?.nome_fantasia ?? data?.razao_social,
        tipo: data?.tipo_unidade,
        cnpj: data?.cnpj,
        cnes: data?.codigo_cnes ?? cnes,
        endereco: {
          logradouro: data?.endereco?.logradouro,
          numero: data?.endereco?.numero,
          bairro: data?.endereco?.bairro,
          cidade: data?.endereco?.municipio,
          uf: data?.endereco?.uf,
          cep: data?.endereco?.cep,
        },
      };
    } catch (error) {
      const err = error as Error;
      console.warn('Falha ao consultar CNES:', err.message ?? err);
      return {
        encontrado: false,
        mensagem: 'Não foi possível validar o CNES',
      };
    }
  }

  async validarCNES(
    cnes: string
  ): Promise<{ valido: boolean; mensagem?: string; dados?: ResultadoValidacaoCNES }> {
    const cnesLimpo = cnes.replace(/\D/g, '');
    if (cnesLimpo.length !== 7) {
      return {
        valido: false,
        mensagem: 'CNES deve conter 7 dígitos',
      };
    }

    const resultado = await this.consultarCNES(cnesLimpo);
    return {
      valido: resultado.encontrado,
      mensagem: resultado.mensagem,
      dados: resultado,
    };
  }

  // ========================================
  // VALIDAÇÃO DE REGISTRO ANS
  // ========================================

  /**
   * Consultar registro ANS
   */
  async consultarANS(registro: string): Promise<ResultadoValidacaoANS> {
    try {
      // TODO: Implementar consulta real à ANS quando API estiver disponível

      const registroLimpo = registro.replace(/\D/g, '');

      if (registroLimpo.length < 6) {
        return {
          encontrado: false,
          mensagem: 'Registro ANS deve ter pelo menos 6 dígitos',
        };
      }

      console.warn('Consulta à ANS não implementada. Validando apenas formato.');

      return {
        encontrado: true,
        registro: registroLimpo,
        mensagem: 'Registro ANS válido (validação de formato)',
      };
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao consultar ANS:', err);
      return {
        encontrado: false,
        mensagem: 'Erro ao consultar registro ANS',
      };
    }
  }

  // ========================================
  // VALIDAÇÃO DE EMAIL
  // ========================================

  /**
   * Validar formato de email
   */
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar email com verificação de existência
   */
  async validarEmailComVerificacao(email: string): Promise<{ valido: boolean; mensagem?: string }> {
    // Validar formato
    if (!this.validarEmail(email)) {
      return {
        valido: false,
        mensagem: 'Formato de email inválido',
      };
    }

    // TODO: Implementar verificação de existência do domínio

    return {
      valido: true,
      mensagem: 'Email válido',
    };
  }

  // ========================================
  // VALIDAÇÃO DE TELEFONE
  // ========================================

  /**
   * Validar formato de telefone brasileiro
   */
  validarTelefone(telefone: string): boolean {
    const telefoneLimpo = telefone.replace(/\D/g, '');

    // Telefone fixo: 10 dígitos (DDD + 8 dígitos)
    // Celular: 11 dígitos (DDD + 9 dígitos)
    return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
  }

  // ========================================
  // HELPER: Formatar valores
  // ========================================

  formatarCPF(cpf: string): string {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  formatarCEP(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  formatarTelefone(telefone: string): string {
    const telefoneLimpo = telefone.replace(/\D/g, '');

    if (telefoneLimpo.length === 10) {
      // Fixo
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (telefoneLimpo.length === 11) {
      // Celular
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return telefone;
  }
}

// Exportar instância singleton
export const validacaoService = new ValidacaoService();
