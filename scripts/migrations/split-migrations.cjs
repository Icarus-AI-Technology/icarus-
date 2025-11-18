#!/usr/bin/env node

/**
 * ICARUS v5.0 - Divisor de Migrações
 * 
 * Divide o arquivo consolidado em 10 blocos menores para facilitar aplicação
 */

const { readFileSync, writeFileSync, mkdirSync } = require('fs');

const INPUT_FILE = 'supabase/migrations_consolidated.sql';
const OUTPUT_DIR = 'supabase/migrations_blocks';
const BLOCKS = 10;

console.log('🔄 Dividindo migrações em blocos...\n');

// Criar diretório de saída
try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (err) {
  // Já existe
}

// Ler arquivo consolidado
const content = readFileSync(INPUT_FILE, 'utf8');
const lines = content.split('\n');

console.log(`📊 Total de linhas: ${lines.length}`);
console.log(`📦 Dividindo em ${BLOCKS} blocos...\n`);

// Calcular tamanho de cada bloco
const linesPerBlock = Math.ceil(lines.length / BLOCKS);

for (let i = 0; i < BLOCKS; i++) {
  const start = i * linesPerBlock;
  const end = Math.min((i + 1) * linesPerBlock, lines.length);
  const blockLines = lines.slice(start, end);
  
  const blockNumber = String(i + 1).padStart(2, '0');
  const outputFile = `${OUTPUT_DIR}/block_${blockNumber}.sql`;
  
  const header = `-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ICARUS v5.0 - Bloco ${blockNumber} de ${BLOCKS}                                          ║
-- ║  Linhas: ${start + 1} → ${end}                                                      ║
-- ╚════════════════════════════════════════════════════════════════════════╝

${blockLines.join('\n')}
`;
  
  writeFileSync(outputFile, header);
  
  console.log(`✅ Bloco ${blockNumber}: ${outputFile} (${blockLines.length} linhas)`);
}

console.log('\n📋 Instruções de Aplicação:\n');
console.log('1. Acesse Supabase Dashboard → SQL Editor');
console.log('2. Copie e cole cada bloco sequencialmente:');
console.log('');

for (let i = 1; i <= BLOCKS; i++) {
  const blockNumber = String(i).padStart(2, '0');
  console.log(`   ${i}. ${OUTPUT_DIR}/block_${blockNumber}.sql`);
}

console.log('\n3. Aguarde a execução de cada bloco antes do próximo');
console.log('4. Verifique logs para erros (alguns esperados)');
console.log('\n✅ Blocos gerados com sucesso!');

