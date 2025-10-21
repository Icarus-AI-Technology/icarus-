#!/usr/bin/env node

/**
 * 🔄 REINDEX MEILISEARCH - Busca Interna OSS
 * 
 * Reindexação automática de dados do Supabase para Meilisearch
 * (substituto OSS para Algolia/ElasticSearch)
 * 
 * @version 1.0.0
 * @date 2025-10-20
 * @team AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
 */

import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';

// ============================================
// CONFIGURAÇÃO
// ============================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const MEILI_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILISEARCH_MASTER_KEY || 'dev_master_key';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis Supabase não configuradas!');
  process.exit(1);
}

// ============================================
// CLIENTES
// ============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY });

// ============================================
// ÍNDICES E CONFIGURAÇÕES
// ============================================

const INDEXES_CONFIG = {
  produtos: {
    table: 'produtos',
    primaryKey: 'id',
    searchableAttributes: ['nome', 'descricao', 'fabricante', 'registro_anvisa'],
    filterableAttributes: ['categoria', 'ativo', 'registro_anvisa'],
    sortableAttributes: ['nome', 'preco_medio', 'criado_em'],
    displayedAttributes: ['id', 'nome', 'descricao', 'categoria', 'registro_anvisa', 'preco_medio']
  },
  
  medicos: {
    table: 'medicos',
    primaryKey: 'id',
    searchableAttributes: ['nome', 'crm', 'especialidade', 'hospital_principal'],
    filterableAttributes: ['especialidade', 'uf_crm', 'ativo'],
    sortableAttributes: ['nome', 'criado_em'],
    displayedAttributes: ['id', 'nome', 'crm', 'uf_crm', 'especialidade', 'telefone']
  },

  hospitais: {
    table: 'hospitais',
    primaryKey: 'id',
    searchableAttributes: ['nome', 'cnpj', 'cidade', 'bairro'],
    filterableAttributes: ['cidade', 'estado', 'tipo'],
    sortableAttributes: ['nome', 'criado_em'],
    displayedAttributes: ['id', 'nome', 'cnpj', 'cidade', 'estado', 'telefone']
  },

  cirurgias: {
    table: 'cirurgias',
    primaryKey: 'id',
    searchableAttributes: ['procedimento', 'paciente_nome', 'medico_nome', 'hospital_nome'],
    filterableAttributes: ['status', 'data_agendada'],
    sortableAttributes: ['data_agendada', 'criado_em'],
    displayedAttributes: ['id', 'procedimento', 'data_agendada', 'status', 'valor_estimado']
  }
};

// ============================================
// FUNÇÕES DE REINDEXAÇÃO
// ============================================

async function createOrUpdateIndex(indexName, config) {
  try {
    // Tentar obter índice existente
    const index = meili.index(indexName);
    await index.getStats(); // Verifica se existe
    console.log(`   ✅ Índice '${indexName}' já existe`);
  } catch (error) {
    // Se não existe, criar
    console.log(`   🆕 Criando índice '${indexName}'...`);
    await meili.createIndex(indexName, { primaryKey: config.primaryKey });
  }

  // Configurar índice
  const index = meili.index(indexName);

  await index.updateSettings({
    searchableAttributes: config.searchableAttributes,
    filterableAttributes: config.filterableAttributes,
    sortableAttributes: config.sortableAttributes,
    displayedAttributes: config.displayedAttributes
  });

  console.log(`   ⚙️ Configurações aplicadas em '${indexName}'`);
}

async function indexData(indexName, config) {
  console.log(`\n📊 Indexando dados de '${config.table}'...`);

  // Buscar dados do Supabase
  const { data, error } = await supabase
    .from(config.table)
    .select('*')
    .limit(10000); // Limitar a 10k por vez (ajustar conforme necessário)

  if (error) {
    console.error(`   ❌ Erro ao buscar dados: ${error.message}`);
    return { indexed: 0, error: error.message };
  }

  if (!data || data.length === 0) {
    console.log(`   ⚠️ Nenhum dado encontrado em '${config.table}'`);
    return { indexed: 0, error: null };
  }

  // Adicionar documentos ao Meilisearch
  const index = meili.index(indexName);
  const task = await index.addDocuments(data);

  console.log(`   ⏳ Aguardando indexação (Task ID: ${task.taskUid})...`);

  // Aguardar conclusão
  await meili.waitForTask(task.taskUid);

  console.log(`   ✅ ${data.length} documentos indexados em '${indexName}'`);

  return { indexed: data.length, error: null };
}

async function reindexAll() {
  console.log('🔍 MEILISEARCH REINDEX - Iniciando...\n');

  const stats = {
    timestamp: new Date().toISOString(),
    indexes: {},
    totalIndexed: 0,
    errors: []
  };

  for (const [indexName, config] of Object.entries(INDEXES_CONFIG)) {
    try {
      // Criar/atualizar índice
      await createOrUpdateIndex(indexName, config);

      // Indexar dados
      const result = await indexData(indexName, config);

      stats.indexes[indexName] = result;
      stats.totalIndexed += result.indexed;

      if (result.error) {
        stats.errors.push({ index: indexName, error: result.error });
      }
    } catch (error) {
      console.error(`   ❌ Erro ao processar '${indexName}': ${error.message}`);
      stats.errors.push({ index: indexName, error: error.message });
    }
  }

  return stats;
}

// ============================================
// EXECUÇÃO
// ============================================

async function main() {
  try {
    const stats = await reindexAll();

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA INDEXAÇÃO');
    console.log('='.repeat(60));
    console.log(`   Total Documentos: ${stats.totalIndexed}`);
    console.log(`   Índices Atualizados: ${Object.keys(stats.indexes).length}`);
    console.log(`   Erros: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️ ERROS:');
      stats.errors.forEach(err => {
        console.log(`   - ${err.index}: ${err.error}`);
      });
    }

    console.log('\n✅ Reindexação concluída!\n');
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

main();

