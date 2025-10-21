/**
 * Testes de Integração - Cache Supabase
 * Cobertura: get_validacao_cache, set_validacao_cache, cleanup, stats
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/lib/supabase';

describe('Supabase Cache Integration', () => {
  const testChave = `test-${Date.now()}`;
  const testDados = {
    teste: 'dados de teste',
    timestamp: new Date().toISOString()
  };

  afterAll(async () => {
    // Limpar dados de teste
    await supabase
      .from('validacoes_cache')
      .delete()
      .eq('chave', testChave);
  });

  describe('set_validacao_cache', () => {
    it('deve salvar dados no cache com sucesso', async () => {
      // Act
      const { data, error } = await supabase.rpc('set_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave,
        p_dados: testDados,
        p_fonte: 'viacep',
        p_ttl_seconds: 86400,
        p_sucesso: true
      });

      // Assert
      expect(error).toBeNull();
      expect(data).toBeTruthy(); // Deve retornar UUID
    });

    it('deve sobrescrever dados existentes (UPSERT)', async () => {
      // Arrange - Primeiro insert
      await supabase.rpc('set_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave,
        p_dados: { valor: 'antigo' },
        p_fonte: 'viacep',
        p_ttl_seconds: 86400
      });

      // Act - Segundo insert (deve fazer UPDATE)
      const { data, error } = await supabase.rpc('set_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave,
        p_dados: { valor: 'novo' },
        p_fonte: 'viacep',
        p_ttl_seconds: 86400
      });

      // Assert
      expect(error).toBeNull();
      expect(data).toBeTruthy();

      // Verificar se foi atualizado
      const cached = await supabase.rpc('get_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave
      });

      expect(cached.data).toEqual({ valor: 'novo' });
    });
  });

  describe('get_validacao_cache', () => {
    beforeAll(async () => {
      // Inserir dado de teste
      await supabase.rpc('set_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave,
        p_dados: testDados,
        p_fonte: 'viacep',
        p_ttl_seconds: 86400
      });
    });

    it('deve recuperar dados do cache', async () => {
      // Act
      const { data, error } = await supabase.rpc('get_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave
      });

      // Assert
      expect(error).toBeNull();
      expect(data).toEqual(testDados);
    });

    it('deve retornar null para chave inexistente', async () => {
      // Act
      const { data, error } = await supabase.rpc('get_validacao_cache', {
        p_tipo: 'cep',
        p_chave: 'chave-inexistente-123'
      });

      // Assert
      expect(error).toBeNull();
      expect(data).toBeNull();
    });

    it('deve incrementar access_count ao acessar', async () => {
      // Arrange - Buscar 2x
      await supabase.rpc('get_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave
      });

      await supabase.rpc('get_validacao_cache', {
        p_tipo: 'cep',
        p_chave: testChave
      });

      // Act - Verificar access_count
      const { data } = await supabase
        .from('validacoes_cache')
        .select('access_count')
        .eq('tipo', 'cep')
        .eq('chave', testChave)
        .single();

      // Assert
      expect(data?.access_count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('cleanup_validacoes_cache', () => {
    it('deve remover registros expirados', async () => {
      // Arrange - Inserir registro expirado (TTL = 0)
      const chaveExpirada = `expired-${Date.now()}`;

      await supabase.rpc('set_validacao_cache', {
        p_tipo: 'cep',
        p_chave: chaveExpirada,
        p_dados: { teste: 'expirado' },
        p_fonte: 'viacep',
        p_ttl_seconds: 0 // Expira imediatamente
      });

      // Act - Executar cleanup
      const { data, error } = await supabase.rpc('cleanup_validacoes_cache');

      // Assert
      expect(error).toBeNull();
      expect(data).toBeGreaterThanOrEqual(1); // Deve ter removido ao menos 1 registro

      // Verificar se foi removido
      const { data: cached } = await supabase.rpc('get_validacao_cache', {
        p_tipo: 'cep',
        p_chave: chaveExpirada
      });

      expect(cached).toBeNull();
    });
  });

  describe('get_validacoes_cache_stats', () => {
    beforeAll(async () => {
      // Inserir alguns registros de teste
      await supabase.rpc('set_validacao_cache', {
        p_tipo: 'cep',
        p_chave: `stats-test-1-${Date.now()}`,
        p_dados: { teste: 1 },
        p_fonte: 'viacep',
        p_ttl_seconds: 86400
      });

      await supabase.rpc('set_validacao_cache', {
        p_tipo: 'cnpj',
        p_chave: `stats-test-2-${Date.now()}`,
        p_dados: { teste: 2 },
        p_fonte: 'receita_federal',
        p_ttl_seconds: 604800
      });
    });

    it('deve retornar estatísticas gerais', async () => {
      // Act
      const { data, error } = await supabase.rpc('get_validacoes_cache_stats', {
        p_periodo_dias: 7
      });

      // Assert
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Verificar estrutura
      const stat = data[0];
      expect(stat).toHaveProperty('tipo');
      expect(stat).toHaveProperty('fonte');
      expect(stat).toHaveProperty('total_consultas');
      expect(stat).toHaveProperty('hit_rate');
    });

    it('deve retornar estatísticas filtradas por tipo', async () => {
      // Act
      const { data, error } = await supabase.rpc('get_validacoes_cache_stats', {
        p_tipo: 'cep',
        p_periodo_dias: 7
      });

      // Assert
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      // Todos registros devem ser do tipo 'cep'
      data.forEach((stat: any) => {
        expect(stat.tipo).toBe('cep');
      });
    });
  });

  describe('RLS (Row Level Security)', () => {
    it('deve permitir leitura para usuários autenticados', async () => {
      // Act
      const { data, error } = await supabase
        .from('validacoes_cache')
        .select('*')
        .limit(1);

      // Assert
      // Se não estiver autenticado, deve retornar erro de RLS
      // Se estiver autenticado, deve retornar dados
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});

