#!/usr/bin/env node
/**
 * Benchmark: Meilisearch Performance
 * Testa velocidade de indexação e busca
 * ICARUS v5.0
 */

import { MeiliSearch } from 'meilisearch';
import { faker } from '@faker-js/faker';

const MEILISEARCH_URL = process.env.VITE_MEILISEARCH_URL || 'http://localhost:7700';
const MEILISEARCH_KEY = process.env.VITE_MEILISEARCH_API_KEY || 'masterKey';

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} operation
 * @property {number} duration
 * @property {number} itemsProcessed
 * @property {number} itemsPerSecond
 */

/** @type {BenchmarkResult[]} */
const results = [];

async function runBenchmarks() {
  console.log('🚀 Iniciando benchmarks Meilisearch...\n');

  try {
    const client = new MeiliSearch({
      host: MEILISEARCH_URL,
      apiKey: MEILISEARCH_KEY,
    });

    // Teste 1: Indexação de documentos
    await benchmarkIndexing(client, 1000);
    await benchmarkIndexing(client, 5000);
    await benchmarkIndexing(client, 10000);

    // Teste 2: Busca simples
    await benchmarkSimpleSearch(client, 100);
    await benchmarkSimpleSearch(client, 500);

    // Teste 3: Busca com filtros
    await benchmarkFilteredSearch(client, 100);

    // Teste 4: Busca facetada
    await benchmarkFacetedSearch(client, 100);

    // Teste 5: Atualização de documentos
    await benchmarkUpdate(client, 1000);

    printResults();
  } catch (error) {
    console.error('❌ Erro ao executar benchmarks:', error);
    process.exit(1);
  }
}

async function benchmarkIndexing(client, numDocs) {
  console.log(`📝 Indexando ${numDocs} documentos...`);

  const index = client.index('benchmark-test');

  // Gera documentos
  const documents = Array.from({ length: numDocs }, (_, i) => ({
    id: i + 1,
    title: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    price: parseFloat(faker.commerce.price()),
    category: faker.commerce.department(),
    inStock: faker.datatype.boolean(),
    createdAt: faker.date.past().toISOString(),
  }));

  const startTime = performance.now();
  
  await index.addDocuments(documents);
  await index.waitForTask(0); // Aguarda indexação completar

  const duration = performance.now() - startTime;

  results.push({
    operation: `Indexing ${numDocs} docs`,
    duration,
    itemsProcessed: numDocs,
    itemsPerSecond: numDocs / (duration / 1000),
  });

  console.log(`✅ Indexação concluída em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numDocs / (duration / 1000)).toFixed(2)} docs/s\n`);
}

async function benchmarkSimpleSearch(client, numSearches) {
  console.log(`🔍 Executando ${numSearches} buscas simples...`);

  const index = client.index('benchmark-test');
  const queries = Array.from({ length: numSearches }, () => faker.commerce.productName());

  const startTime = performance.now();

  for (const query of queries) {
    await index.search(query);
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `Simple search (${numSearches}x)`,
    duration,
    itemsProcessed: numSearches,
    itemsPerSecond: numSearches / (duration / 1000),
  });

  console.log(`✅ Buscas concluídas em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numSearches / (duration / 1000)).toFixed(2)} searches/s\n`);
}

async function benchmarkFilteredSearch(client, numSearches) {
  console.log(`🔍 Executando ${numSearches} buscas com filtros...`);

  const index = client.index('benchmark-test');

  const startTime = performance.now();

  for (let i = 0; i < numSearches; i++) {
    await index.search('', {
      filter: 'inStock = true AND price > 50',
    });
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `Filtered search (${numSearches}x)`,
    duration,
    itemsProcessed: numSearches,
    itemsPerSecond: numSearches / (duration / 1000),
  });

  console.log(`✅ Buscas filtradas concluídas em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numSearches / (duration / 1000)).toFixed(2)} searches/s\n`);
}

async function benchmarkFacetedSearch(client, numSearches) {
  console.log(`🔍 Executando ${numSearches} buscas facetadas...`);

  const index = client.index('benchmark-test');

  const startTime = performance.now();

  for (let i = 0; i < numSearches; i++) {
    await index.search('', {
      facets: ['category', 'inStock'],
    });
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `Faceted search (${numSearches}x)`,
    duration,
    itemsProcessed: numSearches,
    itemsPerSecond: numSearches / (duration / 1000),
  });

  console.log(`✅ Buscas facetadas concluídas em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numSearches / (duration / 1000)).toFixed(2)} searches/s\n`);
}

async function benchmarkUpdate(client, numUpdates) {
  console.log(`✏️ Atualizando ${numUpdates} documentos...`);

  const index = client.index('benchmark-test');

  const updates = Array.from({ length: numUpdates }, (_, i) => ({
    id: i + 1,
    price: parseFloat(faker.commerce.price()),
  }));

  const startTime = performance.now();

  await index.updateDocuments(updates);
  await index.waitForTask(0);

  const duration = performance.now() - startTime;

  results.push({
    operation: `Update ${numUpdates} docs`,
    duration,
    itemsProcessed: numUpdates,
    itemsPerSecond: numUpdates / (duration / 1000),
  });

  console.log(`✅ Atualizações concluídas em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numUpdates / (duration / 1000)).toFixed(2)} updates/s\n`);
}

function printResults() {
  console.log('\n📊 RESULTADOS FINAIS:\n');
  console.log('┌─────────────────────────────┬─────────────┬────────────┬───────────────┐');
  console.log('│ Operação                    │ Duração (ms)│ Itens      │ Itens/s       │');
  console.log('├─────────────────────────────┼─────────────┼────────────┼───────────────┤');

  results.forEach(({ operation, duration, itemsProcessed, itemsPerSecond }) => {
    console.log(
      `│ ${operation.padEnd(27)} │ ${duration.toFixed(2).padStart(11)} │ ${String(itemsProcessed).padStart(10)} │ ${itemsPerSecond.toFixed(2).padStart(13)} │`
    );
  });

  console.log('└─────────────────────────────┴─────────────┴────────────┴───────────────┘\n');

  // Análise
  const avgIndexingSpeed = results
    .filter(r => r.operation.includes('Indexing'))
    .reduce((sum, r) => sum + r.itemsPerSecond, 0) / 3;

  const avgSearchSpeed = results
    .filter(r => r.operation.includes('search'))
    .reduce((sum, r) => sum + r.itemsPerSecond, 0) / 4;

  console.log('📈 ANÁLISE:');
  console.log(`   Velocidade média de indexação: ${avgIndexingSpeed.toFixed(2)} docs/s`);
  console.log(`   Velocidade média de busca: ${avgSearchSpeed.toFixed(2)} searches/s`);

  if (avgIndexingSpeed > 1000 && avgSearchSpeed > 100) {
    console.log('\n✅ Performance EXCELENTE!\n');
  } else if (avgIndexingSpeed > 500 && avgSearchSpeed > 50) {
    console.log('\n🟡 Performance BOA\n');
  } else {
    console.log('\n❌ Performance RUIM - Otimização necessária\n');
  }
}

runBenchmarks();
