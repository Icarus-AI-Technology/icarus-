/**
 * Testes Unitários - ViaCEP Service
 * Cobertura: busca por CEP, busca por endereço, validação, formatação
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { viaCepService } from '@/lib/services/ViaCepService';

// Mock do fetch global
global.fetch = vi.fn();

describe('ViaCepService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buscarPorCep', () => {
    it('deve buscar endereço com CEP válido (com formatação)', async () => {
      // Arrange
      const mockResponse = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        ddd: '11'
      };

      (global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      const resultado = await viaCepService.buscarPorCep('01310-100');

      // Assert
      expect(resultado).toEqual({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        ddd: '11'
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01310100/json/'
      );
    });

    it('deve buscar endereço com CEP sem formatação', async () => {
      // Arrange
      const mockResponse = {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        ddd: '11'
      };

      (global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      const resultado = await viaCepService.buscarPorCep('01310100');

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado?.cep).toBe('01310-100'); // Deve formatar automaticamente
    });

    it('deve retornar null se CEP não for encontrado', async () => {
      // Arrange
      (global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ erro: true })
      });

      // Act
      const resultado = await viaCepService.buscarPorCep('99999999');

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve lançar erro se CEP for inválido (menos de 8 dígitos)', async () => {
      // Act & Assert
      await expect(viaCepService.buscarPorCep('1234')).rejects.toThrow(
        'CEP deve conter 8 dígitos'
      );
    });

    it('deve lançar erro se API retornar erro HTTP', async () => {
      // Arrange
      (global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Act & Assert
      await expect(viaCepService.buscarPorCep('01310100')).rejects.toThrow(
        'Erro na API ViaCEP: 500'
      );
    });
  });

  describe('buscarPorEndereco', () => {
    it('deve buscar CEPs por endereço', async () => {
      // Arrange
      const mockResponse = [
        {
          cep: '01310100',
          logradouro: 'Avenida Paulista',
          complemento: '',
          bairro: 'Bela Vista',
          localidade: 'São Paulo',
          uf: 'SP',
          ibge: '3550308',
          ddd: '11'
        },
        {
          cep: '01310200',
          logradouro: 'Avenida Paulista',
          complemento: 'lado par',
          bairro: 'Bela Vista',
          localidade: 'São Paulo',
          uf: 'SP',
          ibge: '3550308',
          ddd: '11'
        }
      ];

      (global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      const resultado = await viaCepService.buscarPorEndereco(
        'SP',
        'São Paulo',
        'Paulista'
      );

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0].logradouro).toBe('Avenida Paulista');
      expect(resultado[1].logradouro).toBe('Avenida Paulista');
    });

    it('deve retornar array vazio se nenhum endereço for encontrado', async () => {
      // Arrange
      (global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      // Act
      const resultado = await viaCepService.buscarPorEndereco(
        'SP',
        'São Paulo',
        'Rua Inexistente'
      );

      // Assert
      expect(resultado).toEqual([]);
    });

    it('deve lançar erro se UF for inválida', async () => {
      // Act & Assert
      await expect(
        viaCepService.buscarPorEndereco('XXX', 'São Paulo', 'Paulista')
      ).rejects.toThrow('UF deve conter 2 letras');
    });

    it('deve lançar erro se cidade for muito curta', async () => {
      // Act & Assert
      await expect(
        viaCepService.buscarPorEndereco('SP', 'AB', 'Paulista')
      ).rejects.toThrow('Cidade e logradouro devem ter ao menos 3 caracteres');
    });
  });

  describe('validarCep', () => {
    it('deve validar CEP válido com formatação', () => {
      expect(viaCepService.validarCep('01310-100')).toBe(true);
    });

    it('deve validar CEP válido sem formatação', () => {
      expect(viaCepService.validarCep('01310100')).toBe(true);
    });

    it('deve rejeitar CEP com menos de 8 dígitos', () => {
      expect(viaCepService.validarCep('1234567')).toBe(false);
    });

    it('deve rejeitar CEP com mais de 8 dígitos', () => {
      expect(viaCepService.validarCep('123456789')).toBe(false);
    });

    it('deve rejeitar CEP com caracteres inválidos', () => {
      expect(viaCepService.validarCep('0131010A')).toBe(false);
    });
  });
});

