/**
 * CFM Service - Versão Atualizada com Scraping
 * Integra validação local + scraping (quando disponível)
 */

import { cfmScraperService, type CFMScraperResponse } from './CFMScraperService';

export interface CRMFormatado {
  crm: string;
  uf: string;
  nome: string;
  situacao: 'ativo' | 'inativo' | 'cancelado' | 'suspenso';
  tipoCRM: 'principal' | 'secundario';
  especialidades: Array<{
    codigo: string;
    nome: string;
    rqe?: string;
  }>;
  valido: boolean;
  fonte: 'local' | 'scraping' | 'mock';
  dataConsulta: string;
}

class CFMService {
  private ufsValidas = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  /**
   * Consulta CRM com estratégia inteligente:
   * 1. Validação local (formato)
   * 2. Scraping CFM (se disponível)
   * 3. Mock (desenvolvimento)
   */
  async consultarCRM(crm: string, uf: string): Promise<CRMFormatado | null> {
    try {
      // 1. Validação local (sempre executar primeiro)
      const validacaoLocal = this.validarCRMLocal(crm, uf);
      if (!validacaoLocal.formatoValido) {
        throw new Error(validacaoLocal.mensagem);
      }
      
      const crmLimpo = crm.replace(/\D/g, '');
      const ufUpper = uf.toUpperCase();
      
      // 2. Tentar scraping (se disponível)
      const scrapingDisponivel = await cfmScraperService.isScrapingAvailable();
      
      if (scrapingDisponivel) {
        try {
          const dadosScraping = await cfmScraperService.consultarCRM(crmLimpo, ufUpper);
          
          if (dadosScraping) {
            return this.formatarDadosCRM(dadosScraping, 'scraping');
          }
        } catch (scraperError) {
          console.warn('Scraping falhou, usando validação local:', scraperError);
        }
      }
      
      // 3. Fallback: Validação local (mock)
      console.warn(
        '⚠️ CFM: Usando validação local (scraping indisponível).\n' +
        'Para consulta real, implementar scraping ou usar Infosimples.'
      );
      
      return {
        crm: this.formatarCRM(crmLimpo, ufUpper),
        uf: ufUpper,
        nome: 'VALIDAÇÃO LOCAL - FORMATO OK',
        situacao: 'ativo',
        tipoCRM: 'principal',
        especialidades: [],
        valido: true,
        fonte: 'local',
        dataConsulta: new Date().toISOString()
      };
      
    } catch (_error) {
      console.error('Erro ao consultar CRM:', _error);
      throw _error;
    }
  }
  
  /**
   * Valida formato do CRM localmente
   */
  validarCRMLocal(crm: string, uf: string): {
    formatoValido: boolean;
    mensagem: string;
  } {
    const crmLimpo = crm.replace(/\D/g, '');
    const ufUpper = uf.toUpperCase();
    
    // Valida comprimento
    if (crmLimpo.length < 5 || crmLimpo.length > 6) {
      return {
        formatoValido: false,
        mensagem: 'CRM deve conter 5 ou 6 dígitos'
      };
    }
    
    // Valida UF
    if (!this.ufsValidas.includes(ufUpper)) {
      return {
        formatoValido: false,
        mensagem: 'UF inválida'
      };
    }
    
    // Valida se é numérico
    if (!/^\d+$/.test(crmLimpo)) {
      return {
        formatoValido: false,
        mensagem: 'CRM deve conter apenas números'
      };
    }
    
    return {
      formatoValido: true,
      mensagem: 'Formato válido'
    };
  }
  
  /**
   * Formata CRM no padrão CRM/UF XXXXXX
   */
  formatarCRM(crm: string, uf: string): string {
    const crmLimpo = crm.replace(/\D/g, '');
    const ufUpper = uf.toUpperCase();
    return `CRM/${ufUpper} ${crmLimpo}`;
  }
  
  /**
   * Lista de UFs válidas
   */
  getUFsValidas(): string[] {
    return [...this.ufsValidas];
  }
  
  /**
   * Verifica se UF é válida
   */
  isUFValida(uf: string): boolean {
    return this.ufsValidas.includes(uf.toUpperCase());
  }
  
  /**
   * Formata dados do scraping para padrão do sistema
   */
  private formatarDadosCRM(
    dados: CFMScraperResponse,
    fonte: 'scraping' | 'local' | 'mock'
  ): CRMFormatado {
    return {
      crm: dados.crm,
      uf: dados.uf,
      nome: dados.nome,
      situacao: this.mapearSituacao(dados.situacao),
      tipoCRM: dados.tipoCRM === 'PRINCIPAL' ? 'principal' : 'secundario',
      especialidades: dados.especialidades,
      valido: dados.situacao === 'ATIVO',
      fonte,
      dataConsulta: new Date().toISOString()
    };
  }
  
  /**
   * Mapeia situação do CFM para padrão do sistema
   */
  private mapearSituacao(
    situacao: CFMScraperResponse['situacao']
  ): CRMFormatado['situacao'] {
    const map: Record<CFMScraperResponse['situacao'], CRMFormatado['situacao']> = {
      'ATIVO': 'ativo',
      'INATIVO': 'inativo',
      'CANCELADO': 'cancelado',
      'SUSPENSO': 'suspenso'
    };
    return map[situacao] || 'inativo';
  }
}

// Exporta instância única (singleton)
export const cfmService = new CFMService();

// Exporta classe para testes
export default CFMService;
