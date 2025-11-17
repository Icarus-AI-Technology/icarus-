#!/usr/bin/env node
/**
 * Benchmark: Ollama LLM Performance
 * Testa velocidade de geração e embedding
 * ICARUS v5.0
 */

import axios from 'axios';

const OLLAMA_URL = process.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} operation
 * @property {number} duration
 * @property {number} [tokensGenerated]
 * @property {number} [tokensPerSecond]
 */

/** @type {BenchmarkResult[]} */
const results = [];

async function runBenchmarks() {
  console.log('🤖 Iniciando benchmarks Ollama...\n');

  try {
    // Verifica se Ollama está rodando
    await axios.get(`${OLLAMA_URL}/api/tags`);

    // Teste 1: Geração de texto curto
    await benchmarkGeneration('Explique IA em uma frase.', 'short');

    // Teste 2: Geração de texto médio
    await benchmarkGeneration('Escreva um parágrafo sobre machine learning.', 'medium');

    // Teste 3: Geração de texto longo
    await benchmarkGeneration('Escreva um artigo completo sobre deep learning.', 'long');

    // Teste 4: Embedding
    await benchmarkEmbedding(10);
    await benchmarkEmbedding(50);
    await benchmarkEmbedding(100);

    // Teste 5: Chat com contexto
    await benchmarkChat();

    printResults();
  } catch (error) {
    console.error('❌ Erro ao executar benchmarks:', error);
    console.log('\n⚠️  Certifique-se de que Ollama está rodando em', OLLAMA_URL);
    process.exit(1);
  }
}

async function benchmarkGeneration(prompt, size) {
  console.log(`📝 Gerando resposta (${size})...`);

  const startTime = performance.now();

  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: 'llama2',
    prompt,
    stream: false,
  });

  const duration = performance.now() - startTime;

  const tokensGenerated = response.data.response?.split(' ').length || 0;
  const tokensPerSecond = tokensGenerated / (duration / 1000);

  results.push({
    operation: `Generation (${size})`,
    duration,
    tokensGenerated,
    tokensPerSecond,
  });

  console.log(`✅ Geração concluída em ${duration.toFixed(2)}ms`);
  console.log(`   ${tokensGenerated} tokens`);
  console.log(`   ${tokensPerSecond.toFixed(2)} tokens/s\n`);
}

async function benchmarkEmbedding(numEmbeddings) {
  console.log(`🔢 Gerando ${numEmbeddings} embeddings...`);

  const texts = Array.from({ length: numEmbeddings }, (_, i) => 
    `Sample text number ${i + 1} for embedding test.`
  );

  const startTime = performance.now();

  for (const text of texts) {
    await axios.post(`${OLLAMA_URL}/api/embeddings`, {
      model: 'llama2',
      prompt: text,
    });
  }

  const duration = performance.now() - startTime;

  results.push({
    operation: `Embeddings (${numEmbeddings}x)`,
    duration,
    tokensPerSecond: numEmbeddings / (duration / 1000),
  });

  console.log(`✅ Embeddings gerados em ${duration.toFixed(2)}ms`);
  console.log(`   ${(numEmbeddings / (duration / 1000)).toFixed(2)} embeddings/s\n`);
}

async function benchmarkChat() {
  console.log(`💬 Testando chat com contexto...`);

  const messages = [
    { role: 'user', content: 'Olá!' },
    { role: 'assistant', content: 'Olá! Como posso ajudar?' },
    { role: 'user', content: 'Me explique machine learning.' },
  ];

  const startTime = performance.now();

  const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
    model: 'llama2',
    messages,
    stream: false,
  });

  const duration = performance.now() - startTime;

  const tokensGenerated = response.data.message?.content?.split(' ').length || 0;

  results.push({
    operation: 'Chat with context',
    duration,
    tokensGenerated,
    tokensPerSecond: tokensGenerated / (duration / 1000),
  });

  console.log(`✅ Chat concluído em ${duration.toFixed(2)}ms`);
  console.log(`   ${tokensGenerated} tokens`);
  console.log(`   ${(tokensGenerated / (duration / 1000)).toFixed(2)} tokens/s\n`);
}

function printResults() {
  console.log('\n📊 RESULTADOS FINAIS:\n');
  console.log('┌────────────────────────────┬─────────────┬────────────┬───────────────┐');
  console.log('│ Operação                   │ Duração (ms)│ Tokens     │ Tokens/s      │');
  console.log('├────────────────────────────┼─────────────┼────────────┼───────────────┤');

  results.forEach(({ operation, duration, tokensGenerated, tokensPerSecond }) => {
    console.log(
      `│ ${operation.padEnd(26)} │ ${duration.toFixed(2).padStart(11)} │ ${String(tokensGenerated || '-').padStart(10)} │ ${(tokensPerSecond || 0).toFixed(2).padStart(13)} │`
    );
  });

  console.log('└────────────────────────────┴─────────────┴────────────┴───────────────┘\n');

  // Análise
  const generationResults = results.filter(r => r.operation.includes('Generation'));
  const avgTokensPerSecond = generationResults.reduce((sum, r) => sum + (r.tokensPerSecond || 0), 0) / generationResults.length;

  console.log('📈 ANÁLISE:');
  console.log(`   Velocidade média de geração: ${avgTokensPerSecond.toFixed(2)} tokens/s`);

  if (avgTokensPerSecond > 50) {
    console.log('\n✅ Performance EXCELENTE!\n');
  } else if (avgTokensPerSecond > 20) {
    console.log('\n🟡 Performance BOA\n');
  } else {
    console.log('\n❌ Performance RUIM - Considere GPU ou modelo menor\n');
  }
}

runBenchmarks();
