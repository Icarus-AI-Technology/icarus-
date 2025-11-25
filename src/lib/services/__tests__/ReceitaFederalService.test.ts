/**
 * Testes Unitários - Receita Federal Service
 * Cobertura: validação CNPJ/CPF, consulta CNPJ, formatação
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { receitaFederalService } from '@/lib/services/ReceitaFederalService';

// Mock do fetch global
global.fetch = vi.fn();

describe('ReceitaFederalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validarCNPJ', () => {
    it('deve validar CNPJ válido (com formatação)', () => {
      expect(receitaFederalService.validarCNPJ('00.000.000/0001-91')).toBe(true);
    });

    it('deve validar CNPJ válido (sem formatação)', () => {
      expect(receitaFederalService.validarCNPJ('00000000000191')).toBe(true);
    });

    it('deve rejeitar CNPJ com menos de 14 dígitos', () => {
      expect(receitaFederalService.validarCNPJ('1234567890123')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos dígitos iguais', () => {
      expect(receitaFederalService.validarCNPJ('00000000000000')).toBe(false);
      expect(receitaFederalService.validarCNPJ('11111111111111')).toBe(false);
    });

    it('deve rejeitar CNPJ com dígito verificador inválido', () => {
      expect(receitaFederalService.validarCNPJ('00000000000190')).toBe(false); // Último dígito errado
    });
  });

  describe('validarCPF', () => {
    it('deve validar CPF válido (com formatação)', () => {
      expect(receitaFederalService.validarCPF('000.000.001-91')).toBe(true);
    });

    it('deve validar CPF válido (sem formatação)', () => {
      expect(receitaFederalService.validarCPF('00000000191')).toBe(true);
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      expect(receitaFederalService.validarCPF('1234567890')).toBe(false);
    });

    it('deve rejeitar CPF com todos dígitos iguais', () => {
      expect(receitaFederalService.validarCPF('00000000000')).toBe(false);
      expect(receitaFederalService.validarCPF('11111111111')).toBe(false);
    });

    it('deve rejeitar CPF com dígito verificador inválido', () => {
      expect(receitaFederalService.validarCPF('00000000190')).toBe(false); // Último dígito errado
    });
  });

  describe('consultarCNPJ', () => {
    it('deve consultar CNPJ válido e retornar dados formatados', async () => {
      // Arrange
      const mockResponse = {
        cnpj: '00000000000191',
        razao_social: 'EMPRESA TESTE LTDA',
        nome_fantasia: 'TESTE',
        situacao_cadastral: 'ATIVA',
        data_inicio_atividade: '2020-01-01',
        capital_social: 100000,
        porte: 'PEQUENA',
        logradouro: 'RUA TESTE',
        numero: '123',
        complemento: 'SALA 1',
        bairro: 'CENTRO',
        cep: '01310100',
        municipio: 'SAO PAULO',
        uf: 'SP',
        ddd_telefone_1: '1133334444',
        ddd_telefone_2: '',
        email: 'teste@teste.com',
        cnae_fiscal: '1234567',
        cnae_fiscal_descricao: 'ATIVIDADE TESTE',
        status: 'ATIVA',
      };

      (
        global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }
      ).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      // Act
      const resultado = await receitaFederalService.consultarCNPJ('00000000000191');

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado?.cnpj).toBe('00.000.000/0001-91'); // Formatado
      expect(resultado?.razaoSocial).toBe('EMPRESA TESTE LTDA');
      expect(resultado?.nomeFantasia).toBe('TESTE');
      expect(resultado?.situacao).toBe('ATIVA');
      expect(resultado?.status).toBe('ativa'); // Mapeado para lowercase
    });

    it('deve retornar null se CNPJ não for encontrado', async () => {
      // Arrange
      (
        global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }
      ).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act
      const resultado = await receitaFederalService.consultarCNPJ('00000000000191');

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve lançar erro se CNPJ for inválido', async () => {
      // Act & Assert
      await expect(receitaFederalService.consultarCNPJ('12345')).rejects.toThrow('CNPJ inválido');
    });

    it('deve lançar erro se API retornar erro HTTP', async () => {
      // Arrange
      (
        global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }
      ).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(receitaFederalService.consultarCNPJ('00000000000191')).rejects.toThrow(
        'Erro na API Brasil API: 500'
      );
    });
  });

  describe('formatarCNPJ', () => {
    it('deve formatar CNPJ corretamente', () => {
      expect(receitaFederalService.formatarCNPJ('00000000000191')).toBe('00.000.000/0001-91');
    });

    it('deve formatar CNPJ que já está formatado', () => {
      expect(receitaFederalService.formatarCNPJ('00.000.000/0001-91')).toBe('00.000.000/0001-91');
    });
  });

  describe('formatarCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(receitaFederalService.formatarCPF('00000000191')).toBe('000.000.001-91');
    });

    it('deve formatar CPF que já está formatado', () => {
      expect(receitaFederalService.formatarCPF('000.000.001-91')).toBe('000.000.001-91');
    });
  });
});
