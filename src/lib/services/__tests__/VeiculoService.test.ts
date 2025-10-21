/**
 * Testes Unitários - Veículo Service
 * Cobertura: validação placas Mercosul e antiga, formatação, conversão
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { veiculoService } from '@/lib/services/VeiculoService';

// Mock do fetch global
global.fetch = vi.fn();

describe('VeiculoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validarPlacaMercosul', () => {
    it('deve validar placa Mercosul válida (ABC1D23)', () => {
      expect(veiculoService.validarPlacaMercosul('ABC1D23')).toBe(true);
    });

    it('deve validar placa Mercosul com letras minúsculas', () => {
      expect(veiculoService.validarPlacaMercosul('abc1d23')).toBe(true);
    });

    it('deve validar placa Mercosul com formatação', () => {
      expect(veiculoService.validarPlacaMercosul('ABC-1D23')).toBe(true);
    });

    it('deve rejeitar placa antiga (ABC1234)', () => {
      expect(veiculoService.validarPlacaMercosul('ABC1234')).toBe(false);
    });

    it('deve rejeitar placa com formato incorreto', () => {
      expect(veiculoService.validarPlacaMercosul('ABC12D3')).toBe(false);
      expect(veiculoService.validarPlacaMercosul('AB1D234')).toBe(false);
      expect(veiculoService.validarPlacaMercosul('1ABC234')).toBe(false);
    });

    it('deve rejeitar placa muito curta', () => {
      expect(veiculoService.validarPlacaMercosul('ABC123')).toBe(false);
    });

    it('deve rejeitar placa muito longa', () => {
      expect(veiculoService.validarPlacaMercosul('ABC1D234')).toBe(false);
    });
  });

  describe('validarPlacaAntiga', () => {
    it('deve validar placa antiga válida (ABC1234)', () => {
      expect(veiculoService.validarPlacaAntiga('ABC1234')).toBe(true);
    });

    it('deve validar placa antiga com letras minúsculas', () => {
      expect(veiculoService.validarPlacaAntiga('abc1234')).toBe(true);
    });

    it('deve validar placa antiga com formatação', () => {
      expect(veiculoService.validarPlacaAntiga('ABC-1234')).toBe(true);
    });

    it('deve rejeitar placa Mercosul (ABC1D23)', () => {
      expect(veiculoService.validarPlacaAntiga('ABC1D23')).toBe(false);
    });

    it('deve rejeitar placa com menos de 4 números', () => {
      expect(veiculoService.validarPlacaAntiga('ABC123')).toBe(false);
    });

    it('deve rejeitar placa com mais de 4 números', () => {
      expect(veiculoService.validarPlacaAntiga('ABC12345')).toBe(false);
    });
  });

  describe('validarPlaca', () => {
    it('deve validar placa Mercosul e retornar tipo correto', () => {
      const resultado = veiculoService.validarPlaca('ABC1D23');

      expect(resultado.valida).toBe(true);
      expect(resultado.tipo).toBe('mercosul');
      expect(resultado.formatoCorreto).toBe(true);
    });

    it('deve validar placa antiga e retornar tipo correto', () => {
      const resultado = veiculoService.validarPlaca('ABC1234');

      expect(resultado.valida).toBe(true);
      expect(resultado.tipo).toBe('antiga');
      expect(resultado.formatoCorreto).toBe(true);
    });

    it('deve rejeitar placa inválida', () => {
      const resultado = veiculoService.validarPlaca('ABC12');

      expect(resultado.valida).toBe(false);
      expect(resultado.formatoCorreto).toBe(false);
    });
  });

  describe('formatarPlaca', () => {
    it('deve formatar placa Mercosul (ABC1D23 → ABC-1D23)', () => {
      expect(veiculoService.formatarPlaca('ABC1D23')).toBe('ABC-1D23');
    });

    it('deve formatar placa antiga (ABC1234 → ABC-1234)', () => {
      expect(veiculoService.formatarPlaca('ABC1234')).toBe('ABC-1234');
    });

    it('deve manter formatação se já estiver correta', () => {
      expect(veiculoService.formatarPlaca('ABC-1D23')).toBe('ABC-1D23');
    });

    it('deve converter para maiúscula', () => {
      expect(veiculoService.formatarPlaca('abc1d23')).toBe('ABC-1D23');
    });

    it('deve retornar placa curta sem formatação', () => {
      expect(veiculoService.formatarPlaca('ABC12')).toBe('ABC12');
    });
  });

  describe('consultarPlaca', () => {
    it('deve consultar placa Mercosul e retornar dados', async () => {
      // Arrange
      const mockResponse = {
        uf: 'SP',
        municipio: 'São Paulo',
        modelo: 'Civic',
        marca: 'Honda',
        ano_modelo: 2023,
        cor: 'Prata',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      // Act
      const resultado = await veiculoService.consultarPlaca('ABC1D23');

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado?.placa).toBe('ABC-1D23');
      expect(resultado?.tipo).toBe('mercosul');
      expect(resultado?.valida).toBe(true);
      expect(resultado?.uf).toBe('SP');
      expect(resultado?.modelo).toBe('Civic');
    });

    it('deve retornar null se placa não for encontrada', async () => {
      // Arrange
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act
      const resultado = await veiculoService.consultarPlaca('ABC1D23');

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve lançar erro se placa for inválida', async () => {
      // Act & Assert
      await expect(veiculoService.consultarPlaca('ABC12')).rejects.toThrow(
        'Formato de placa inválido'
      );
    });

    it('deve retornar validação local se API falhar', async () => {
      // Arrange
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      // Act
      const resultado = await veiculoService.consultarPlaca('ABC1D23');

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado?.valida).toBe(true);
      expect(resultado?.tipo).toBe('mercosul');
      // Não deve ter dados da API
      expect(resultado?.modelo).toBeUndefined();
    });
  });

  describe('converterParaMercosul', () => {
    it('deve converter placa antiga para Mercosul estimado', () => {
      const resultado = veiculoService.converterParaMercosul('ABC1234');

      expect(resultado).not.toBeNull();
      // ABC1234 → ABC2B34 (1 vira B)
      expect(resultado).toBe('ABC-2B34');
    });

    it('deve converter números corretamente (0=A, 1=B, 9=J)', () => {
      expect(veiculoService.converterParaMercosul('ABC0234')).toBe('ABC-2A34');
      expect(veiculoService.converterParaMercosul('ABC9234')).toBe('ABC-2J34');
    });

    it('deve retornar null se placa antiga for inválida', () => {
      expect(veiculoService.converterParaMercosul('ABC12')).toBeNull();
      expect(veiculoService.converterParaMercosul('ABC1D23')).toBeNull();
    });

    it('deve formatar resultado com hífen', () => {
      const resultado = veiculoService.converterParaMercosul('ABC1234');
      expect(resultado).toContain('-');
    });
  });

  describe('getUFsValidas', () => {
    it('deve retornar todas as 27 UFs', () => {
      const ufs = veiculoService.getUFsValidas();

      expect(ufs).toHaveLength(27);
      expect(ufs).toContain('SP');
      expect(ufs).toContain('RJ');
      expect(ufs).toContain('DF');
    });

    it('deve retornar cópia do array (não referência)', () => {
      const ufs1 = veiculoService.getUFsValidas();
      const ufs2 = veiculoService.getUFsValidas();

      ufs1.push('XX' as any);

      expect(ufs2).toHaveLength(27);
    });
  });
});

