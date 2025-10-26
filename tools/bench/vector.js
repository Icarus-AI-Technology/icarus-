#!/usr/bin/env node
/**
 * Benchmark: Vector Search Performance (pgvector)
 * Testa velocidade de busca por similaridade
 * ICARUS v5.0
 */

import pkg from 'pg';
const { Client } = pkg;
import { faker } from '@faker-js/faker';

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54321/postgres';

interface BenchmarkResult {
  operation: string;
  duration: number;
  itemsProcessed: number;
  itemsPerSecond: number;
}

const results: BenchmarkResult[] = [];

async function runBenchmarks() {
  console.log('🔍 Iniciando benchmarks Vector Search...\n');

  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();

    // Setup: Cria tabela de teste
    await setupTestTable(client);

    // Teste 1: Inserção de vetores
    await benchmarkVectorInsertion(client, 1000);
    await benchmarkVectorInsertion(client, 5000);

    // Teste 2: Busca por similaridade (cosine)
    await benchmarkSimilaritySearch(client, 'cosine', 100);
    await benchmarkSimilaritySearch(client, 'cosine', 500);

    // Teste 3: Busca por similaridade (euclidean)
    await benchmarkSimilaritySearch(client, 'euclidean', 100);

    // Teste 4: Busca com filtro
    await benchmarkFilteredVectorSearch(client, 100);

    // Teste 5: KNN search
    await benchmarkKNNSearch(client, 100);

    printResults();
  } catch (error) {
    console.error('❌ Erro ao executar benchmarks:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function setupTestTable(client: Client) {
  console.log('🔧 Configurando tabela de teste...\n');

  await client.query('CREATE EXTENSION IF NOT EXISTS vector');
  
  await client.query(`
    DROP TABLE IF EXISTS benchmark_vectors
  `);

  await client.query(`
    CREATE TABLE benchmark_vectors (
      id SERIAL PRIMARY KEY,
      embedding vector(384),
      category TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE INDEX ON benchmark_vectors 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
  `);

  console.log('✅ Tabela configurada\n');
}

async function benchmarkVectorInsertion(client: Client, numVectors: number) {
  console.log(`📥 Inserindo ${numVectors} vetores...`);

  const vectors = Array.from({ length: numVectors }, () => ({
    embedding: generateRandomVector(384),
    category: faker.commerce.department(),
    metadata: JSON.stringify({ name: faker.commerce.productName() }),
  }));

  const startTime = performance.now();

  for (const vector of vectors) {
    await client.query(
      'INSERT INTO benchmark_vectors (embedding, category, metadata) VALUES ($1, $2, $3)',
      [`[${vector.embedding.join(',')}]`, vector.category, vector.metadata]
    );
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `Insert ${numVectors} vectors`,
    duration,
    itemsProcessed: numVectors,
    itemsPerSecond: numVectors / (duration / 1000),
  });

  console.log(`✅ Inserção concluída em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numVectors / (duration / 1000)).toFixed(2)} vectors/s\n`);
}

async function benchmarkSimilaritySearch(client: Client, metric: string, numSearches: number) {
  console.log(`🔍 Executando ${numSearches} buscas por similaridade (${metric})...`);

  const queryVector = generateRandomVector(384);

  const startTime = performance.now();

  for (let i = 0; i < numSearches; i++) {
    const operator = metric === 'cosine' ? '<=>' : '<->';
    
    await client.query(
      `SELECT * FROM benchmark_vectors 
       ORDER BY embedding ${operator} $1 
       LIMIT 10`,
      [`[${queryVector.join(',')}]`]
    );
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `Similarity search ${metric} (${numSearches}x)`,
    duration,
    itemsProcessed: numSearches,
    itemsPerSecond: numSearches / (duration / 1000),
  });

  console.log(`✅ Buscas concluídas em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numSearches / (duration / 1000)).toFixed(2)} searches/s\n`);
}

async function benchmarkFilteredVectorSearch(client: Client, numSearches: number) {
  console.log(`🔍 Executando ${numSearches} buscas com filtro...`);

  const queryVector = generateRandomVector(384);
  const category = faker.commerce.department();

  const startTime = performance.now();

  for (let i = 0; i < numSearches; i++) {
    await client.query(
      `SELECT * FROM benchmark_vectors 
       WHERE category = $1
       ORDER BY embedding <=> $2 
       LIMIT 10`,
      [category, `[${queryVector.join(',')}]`]
    );
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `Filtered vector search (${numSearches}x)`,
    duration,
    itemsProcessed: numSearches,
    itemsPerSecond: numSearches / (duration / 1000),
  });

  console.log(`✅ Buscas filtradas concluídas em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numSearches / (duration / 1000)).toFixed(2)} searches/s\n`);
}

async function benchmarkKNNSearch(client: Client, numSearches: number) {
  console.log(`🔍 Executando ${numSearches} buscas KNN...`);

  const queryVector = generateRandomVector(384);

  const startTime = performance.now();

  for (let i = 0; i < numSearches; i++) {
    await client.query(
      `SELECT *, embedding <=> $1 AS distance
       FROM benchmark_vectors
       ORDER BY distance
       LIMIT 10`,
      [`[${queryVector.join(',')}]`]
    );
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `KNN search (${numSearches}x)`,
    duration,
    itemsProcessed: numSearches,
    itemsPerSecond: numSearches / (duration / 1000),
  });

  console.log(`✅ KNN concluído em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numSearches / (duration / 1000)).toFixed(2)} searches/s\n`);
}

function generateRandomVector(dimensions: number): number[] {
  return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
}

function printResults() {
  console.log('\n📊 RESULTADOS FINAIS:\n');
  console.log('┌──────────────────────────────────────┬─────────────┬────────────┬───────────────┐');
  console.log('│ Operação                             │ Duração (ms)│ Itens      │ Itens/s       │');
  console.log('├──────────────────────────────────────┼─────────────┼────────────┼───────────────┤');

  results.forEach(({ operation, duration, itemsProcessed, itemsPerSecond }) => {
    console.log(
      `│ ${operation.padEnd(36)} │ ${duration.toFixed(2).padStart(11)} │ ${String(itemsProcessed).padStart(10)} │ ${itemsPerSecond.toFixed(2).padStart(13)} │`
    );
  });

  console.log('└──────────────────────────────────────┴─────────────┴────────────┴───────────────┘\n');

  // Análise
  const insertionResults = results.filter(r => r.operation.includes('Insert'));
  const searchResults = results.filter(r => r.operation.includes('search') || r.operation.includes('KNN'));

  const avgInsertSpeed = insertionResults.reduce((sum, r) => sum + r.itemsPerSecond, 0) / insertionResults.length;
  const avgSearchSpeed = searchResults.reduce((sum, r) => sum + r.itemsPerSecond, 0) / searchResults.length;

  console.log('📈 ANÁLISE:');
  console.log(`   Velocidade média de inserção: ${avgInsertSpeed.toFixed(2)} vectors/s`);
  console.log(`   Velocidade média de busca: ${avgSearchSpeed.toFixed(2)} searches/s`);

  if (avgInsertSpeed > 100 && avgSearchSpeed > 50) {
    console.log('\n✅ Performance EXCELENTE!\n');
  } else if (avgInsertSpeed > 50 && avgSearchSpeed > 20) {
    console.log('\n🟡 Performance BOA\n');
  } else {
    console.log('\n❌ Performance RUIM - Otimização necessária\n');
  }

  console.log('💡 DICAS:');
  console.log('   • Use índices IVFFlat para grandes datasets');
  console.log('   • Ajuste o parâmetro lists do índice');
  console.log('   • Use probes para balancear velocidade/precisão');
  console.log('   • Considere HNSW para melhor performance\n');
}

runBenchmarks();

