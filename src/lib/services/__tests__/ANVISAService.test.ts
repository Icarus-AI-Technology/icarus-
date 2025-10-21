/**
 * Testes Unitários - ANVISA Service
 * Cobertura: validação formato registro, processo, categorias, classes de risco
 */

import { describe, it, expect } from 'vitest';
import { anvisaService } from '@/lib/services/ANVISAService';

describe('ANVISAService', () => {
  describe('validarFormatoRegistro', () => {
    it('deve validar registro válido (80XXX.XXX.XXX)', () => {
      expect(anvisaService.validarFormatoRegistro('80123456789')).toBe(true);
    });

    it('deve validar registro com formatação', () => {
      expect(anvisaService.validarFormatoRegistro('80123.456.789')).toBe(true);
    });

    it('deve rejeitar registro sem prefixo 80', () => {
      expect(anvisaService.validarFormatoRegistro('81123456789')).toBe(false);
      expect(anvisaService.validarFormatoRegistro('70123456789')).toBe(false);
    });

    it('deve rejeitar registro com menos de 11 dígitos', () => {
      expect(anvisaService.validarFormatoRegistro('8012345678')).toBe(false);
    });

    it('deve rejeitar registro com mais de 11 dígitos', () => {
      expect(anvisaService.validarFormatoRegistro('801234567890')).toBe(false);
    });

    it('deve rejeitar registro com caracteres não numéricos', () => {
      expect(anvisaService.validarFormatoRegistro('80ABC456789')).toBe(false);
    });
  });

  describe('validarFormatoProcesso', () => {
    it('deve validar processo válido', () => {
      expect(
        anvisaService.validarFormatoProcesso('1234567-12.2023-1/12345-12')
      ).toBe(true);
    });

    it('deve rejeitar processo com formato incorreto', () => {
      expect(anvisaService.validarFormatoProcesso('1234567')).toBe(false);
      expect(anvisaService.validarFormatoProcesso('1234567-12')).toBe(false);
    });

    it('deve rejeitar processo com espaços', () => {
      expect(
        anvisaService.validarFormatoProcesso('1234567 12.2023-1/12345-12')
      ).toBe(false);
    });
  });

  describe('validar', () => {
    it('deve validar registro e retornar tipo correto', () => {
      const resultado = anvisaService.validar('80123456789');

      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('registro');
      expect(resultado.formatoCorreto).toBe(true);
    });

    it('deve validar processo e retornar tipo correto', () => {
      const resultado = anvisaService.validar('1234567-12.2023-1/12345-12');

      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('processo');
      expect(resultado.formatoCorreto).toBe(true);
    });

    it('deve rejeitar identificador inválido', () => {
      const resultado = anvisaService.validar('123456');

      expect(resultado.valido).toBe(false);
      expect(resultado.formatoCorreto).toBe(false);
    });
  });

  describe('formatarRegistro', () => {
    it('deve formatar registro (80XXX.XXX.XXX)', () => {
      expect(anvisaService.formatarRegistro('80123456789')).toBe(
        '80123.456.789'
      );
    });

    it('deve manter formatação se já estiver correta', () => {
      expect(anvisaService.formatarRegistro('80123.456.789')).toBe(
        '80123.456.789'
      );
    });

    it('deve retornar original se não começar com 80', () => {
      expect(anvisaService.formatarRegistro('81123456789')).toBe('81123456789');
    });

    it('deve retornar original se for muito curto', () => {
      expect(anvisaService.formatarRegistro('8012345')).toBe('8012345');
    });
  });

  describe('consultarRegistro', () => {
    it('deve retornar dados mock para registro válido', async () => {
      const resultado = await anvisaService.consultarRegistro('80123456789');

      expect(resultado).not.toBeNull();
      expect(resultado?.registro).toBe('80123.456.789');
      expect(resultado?.situacao).toBe('ATIVO');
      expect(resultado?.categoria).toBe('OPME');
    });

    it('deve lançar erro se registro for inválido', async () => {
      await expect(anvisaService.consultarRegistro('123456')).rejects.toThrow(
        'Formato de registro ANVISA inválido'
      );
    });
  });

  describe('verificarAtivo', () => {
    it('deve retornar true para registro ATIVO', async () => {
      const resultado = await anvisaService.verificarAtivo('80123456789');

      expect(resultado).toBe(true);
    });
  });

  describe('getCategorias', () => {
    it('deve retornar todas as categorias', () => {
      const categorias = anvisaService.getCategorias();

      expect(categorias).toHaveLength(4);
      expect(categorias).toContain('OPME');
      expect(categorias).toContain('MEDICAMENTO');
      expect(categorias).toContain('COSMETICO');
      expect(categorias).toContain('DISPOSITIVO');
    });
  });

  describe('getClassesRisco', () => {
    it('deve retornar todas as classes de risco', () => {
      const classes = anvisaService.getClassesRisco();

      expect(classes).toHaveLength(4);
      expect(classes).toContain('I');
      expect(classes).toContain('II');
      expect(classes).toContain('III');
      expect(classes).toContain('IV');
    });
  });

  describe('isOPME', () => {
    it('deve identificar OPME corretamente', () => {
      expect(anvisaService.isOPME('OPME')).toBe(true);
      expect(anvisaService.isOPME('opme')).toBe(true);
    });

    it('deve rejeitar outras categorias', () => {
      expect(anvisaService.isOPME('MEDICAMENTO')).toBe(false);
      expect(anvisaService.isOPME('COSMETICO')).toBe(false);
    });
  });
});

