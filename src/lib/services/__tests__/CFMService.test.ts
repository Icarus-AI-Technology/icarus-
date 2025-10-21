/**
 * Testes Unitários - CFM Service
 * Cobertura: validação formato, UFs válidas, formatação
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cfmService } from '@/lib/services/CFMService';

describe('CFMService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validarCRMLocal', () => {
    it('deve validar CRM com formato válido (5 dígitos)', () => {
      const resultado = cfmService.validarCRMLocal('12345', 'SP');
      
      expect(resultado.formatoValido).toBe(true);
      expect(resultado.mensagem).toBe('Formato válido');
    });

    it('deve validar CRM com formato válido (6 dígitos)', () => {
      const resultado = cfmService.validarCRMLocal('123456', 'RJ');
      
      expect(resultado.formatoValido).toBe(true);
      expect(resultado.mensagem).toBe('Formato válido');
    });

    it('deve rejeitar CRM com menos de 5 dígitos', () => {
      const resultado = cfmService.validarCRMLocal('1234', 'SP');
      
      expect(resultado.formatoValido).toBe(false);
      expect(resultado.mensagem).toBe('CRM deve conter 5 ou 6 dígitos');
    });

    it('deve rejeitar CRM com mais de 6 dígitos', () => {
      const resultado = cfmService.validarCRMLocal('1234567', 'SP');
      
      expect(resultado.formatoValido).toBe(false);
      expect(resultado.mensagem).toBe('CRM deve conter 5 ou 6 dígitos');
    });

    it('deve rejeitar CRM com UF inválida', () => {
      const resultado = cfmService.validarCRMLocal('12345', 'XX');
      
      expect(resultado.formatoValido).toBe(false);
      expect(resultado.mensagem).toBe('UF inválida');
    });

    it('deve rejeitar CRM com caracteres não numéricos', () => {
      const resultado = cfmService.validarCRMLocal('12A45', 'SP');
      
      expect(resultado.formatoValido).toBe(false);
      // O CRM"12A45" limpo fica"1245" (4 dígitos), então mensagem é de comprimento
      expect(resultado.mensagem).toBe('CRM deve conter 5 ou 6 dígitos');
    });

    it('deve aceitar CRM com formatação (remover antes)', () => {
      const resultado = cfmService.validarCRMLocal('CRM/SP 12345', 'SP');
      
      // Deve limpar a string antes de validar
      expect(resultado.formatoValido).toBe(true);
    });
  });

  describe('formatarCRM', () => {
    it('deve formatar CRM corretamente', () => {
      expect(cfmService.formatarCRM('12345', 'SP')).toBe('CRM/SP 12345');
    });

    it('deve formatar CRM com 6 dígitos', () => {
      expect(cfmService.formatarCRM('123456', 'RJ')).toBe('CRM/RJ 123456');
    });

    it('deve converter UF para maiúscula', () => {
      expect(cfmService.formatarCRM('12345', 'sp')).toBe('CRM/SP 12345');
    });

    it('deve remover formatação existente antes de reformatar', () => {
      expect(cfmService.formatarCRM('CRM/SP 12345', 'SP')).toBe('CRM/SP 12345');
    });
  });

  describe('getUFsValidas', () => {
    it('deve retornar todas as 27 UFs válidas', () => {
      const ufs = cfmService.getUFsValidas();
      
      expect(ufs).toHaveLength(27);
      expect(ufs).toContain('SP');
      expect(ufs).toContain('RJ');
      expect(ufs).toContain('DF');
    });

    it('deve retornar cópia do array (não referência)', () => {
      const ufs1 = cfmService.getUFsValidas();
      const ufs2 = cfmService.getUFsValidas();
      
      // Modificar ufs1 não deve afetar ufs2
      ufs1.push('XX' as any);
      
      expect(ufs2).toHaveLength(27);
    });
  });

  describe('isUFValida', () => {
    it('deve validar UF existente (maiúscula)', () => {
      expect(cfmService.isUFValida('SP')).toBe(true);
    });

    it('deve validar UF existente (minúscula)', () => {
      expect(cfmService.isUFValida('sp')).toBe(true);
    });

    it('deve rejeitar UF inexistente', () => {
      expect(cfmService.isUFValida('XX')).toBe(false);
    });

    it('deve validar todas as 27 UFs', () => {
      const ufsValidas = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ];
      
      ufsValidas.forEach(uf => {
        expect(cfmService.isUFValida(uf)).toBe(true);
      });
    });
  });

  describe('consultarCRM', () => {
    it('deve retornar validação local quando scraping indisponível', async () => {
      // Nota: Este teste faz consulta real que pode demorar (Puppeteer)
      // Em CI/CD, considere mockar o cfmScraperService
      
      // Act
      const resultado = await cfmService.consultarCRM('12345', 'SP');

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado?.crm).toBe('CRM/SP 12345');
      expect(resultado?.uf).toBe('SP');
      // Pode retornar 'scraping' ou 'local' dependendo da disponibilidade
      expect(['local', 'scraping']).toContain(resultado?.fonte);
      expect(resultado?.valido).toBe(true);
    }, 15000); // 15s timeout para Puppeteer

    it('deve lançar erro se formato for inválido', async () => {
      // Act & Assert
      await expect(
        cfmService.consultarCRM('1234', 'SP') // Menos de 5 dígitos
      ).rejects.toThrow('CRM deve conter 5 ou 6 dígitos');
    });

    it('deve lançar erro se UF for inválida', async () => {
      // Act & Assert
      await expect(
        cfmService.consultarCRM('12345', 'XX')
      ).rejects.toThrow('UF inválida');
    });
  });
});

