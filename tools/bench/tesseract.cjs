#!/usr/bin/env node
/**
 * Benchmark: Tesseract OCR Performance
 * Testa velocidade de extração de texto
 * ICARUS v5.0
 */

import Tesseract from 'tesseract.js';

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} operation
 * @property {number} duration
 * @property {number} confidence
 * @property {number} charactersExtracted
 */

/** @type {BenchmarkResult[]} */
const results = [];

async function runBenchmarks() {
  console.log('📄 Iniciando benchmarks Tesseract OCR...\n');

  try {
    // Teste 1: Imagem simples (texto limpo)
    await benchmarkOCR('simple-text', 'por', 'Simple text recognition');

    // Teste 2: Imagem complexa (nota fiscal)
    await benchmarkOCR('invoice', 'por', 'Invoice recognition');

    // Teste 3: Imagem com baixa qualidade
    await benchmarkOCR('low-quality', 'por', 'Low quality image');

    // Teste 4: Múltiplas imagens em lote
    await benchmarkBatchOCR(5);

    // Teste 5: Detecção de idioma
    await benchmarkLanguageDetection();

    printResults();
  } catch (error) {
    console.error('❌ Erro ao executar benchmarks:', error);
    process.exit(1);
  }
}

async function benchmarkOCR(imageType, lang, label) {
  console.log(`🖼️  Processando ${label}...`);

  // Cria imagem de teste (simulação)
  const mockImage = await createMockImage(imageType);

  const startTime = performance.now();

  const { data } = await Tesseract.recognize(mockImage, lang, {
    logger: () => {}, // Silencia logs
  });

  const duration = performance.now() - startTime;

  results.push({
    operation: label,
    duration,
    confidence: data.confidence,
    charactersExtracted: data.text.length,
  });

  console.log(`✅ OCR concluído em ${duration.toFixed(2)}ms`);
  console.log(`   Confiança: ${data.confidence.toFixed(2)}%`);
  console.log(`   Caracteres extraídos: ${data.text.length}\n`);
}

async function benchmarkBatchOCR(numImages) {
  console.log(`📚 Processando ${numImages} imagens em lote...`);

  const images = await Promise.all(
    Array.from({ length: numImages }, (_, i) => createMockImage(`batch-${i}`))
  );

  const startTime = performance.now();

  const batchResults = await Promise.all(
    images.map(img => Tesseract.recognize(img, 'por', { logger: () => {} }))
  );

  const duration = performance.now() - startTime;

  const totalChars = batchResults.reduce((sum, r) => sum + r.data.text.length, 0);
  const avgConfidence = batchResults.reduce((sum, r) => sum + r.data.confidence, 0) / numImages;

  results.push({
    operation: `Batch OCR (${numImages} images)`,
    duration,
    confidence: avgConfidence,
    charactersExtracted: totalChars,
  });

  console.log(`✅ Batch OCR concluído em ${duration.toFixed(2)}ms`);
  console.log(`   Confiança média: ${avgConfidence.toFixed(2)}%`);
  console.log(`   Total de caracteres: ${totalChars}`);
  console.log(`   ${(numImages / (duration / 1000)).toFixed(2)} images/s\n`);
}

async function benchmarkLanguageDetection() {
  console.log(`🌍 Testando detecção de idioma...`);

  const mockImage = await createMockImage('multilang');

  const startTime = performance.now();

  const { data } = await Tesseract.detect(mockImage);

  const duration = performance.now() - startTime;

  console.log(`✅ Detecção concluída em ${duration.toFixed(2)}ms`);
  console.log(`   Idioma detectado: ${data.script}\n`);
}

async function createMockImage() {
  // Cria canvas com texto simulado
  // Na prática, você usaria imagens reais aqui
  // Por enquanto, retorna um data URL mock
  
  const canvas = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
  
  return canvas;
}

function printResults() {
  console.log('\n📊 RESULTADOS FINAIS:\n');
  console.log('┌─────────────────────────────┬─────────────┬─────────────┬──────────────┐');
  console.log('│ Operação                    │ Duração (ms)│ Confiança % │ Caracteres   │');
  console.log('├─────────────────────────────┼─────────────┼─────────────┼──────────────┤');

  results.forEach(({ operation, duration, confidence, charactersExtracted }) => {
    console.log(
      `│ ${operation.padEnd(27)} │ ${duration.toFixed(2).padStart(11)} │ ${confidence.toFixed(2).padStart(11)} │ ${String(charactersExtracted).padStart(12)} │`
    );
  });

  console.log('└─────────────────────────────┴─────────────┴─────────────┴──────────────┘\n');

  // Análise
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

  console.log('📈 ANÁLISE:');
  console.log(`   Tempo médio de processamento: ${avgDuration.toFixed(2)}ms`);
  console.log(`   Confiança média: ${avgConfidence.toFixed(2)}%`);

  if (avgConfidence > 90 && avgDuration < 2000) {
    console.log('\n✅ Performance EXCELENTE!\n');
  } else if (avgConfidence > 75 && avgDuration < 5000) {
    console.log('\n🟡 Performance BOA\n');
  } else {
    console.log('\n❌ Performance RUIM - Otimização necessária\n');
  }

  console.log('💡 DICAS:');
  console.log('   • Use imagens de alta qualidade (300 DPI)');
  console.log('   • Pré-processe imagens (contraste, binarização)');
  console.log('   • Limite OCR a regiões de interesse (ROI)');
  console.log('   • Use cache para imagens já processadas\n');
}

runBenchmarks();
