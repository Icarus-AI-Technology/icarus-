#!/usr/bin/env node
/**
 * Correção inteligente e segura de Hard Gates
 * Substitui APENAS classes proibidas mantendo estrutura
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Mapeamento preciso
const replacements = [
  // Tamanhos de fonte
  { from: /className="([^"]*)\s*text-xs\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'0.75rem\' }}' },
  { from: /className="([^"]*)\s*text-sm\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'0.875rem\' }}' },
  { from: /className="([^"]*)\s*text-lg\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'1.125rem\' }}' },
  { from: /className="([^"]*)\s*text-xl\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'1.25rem\' }}' },
  { from: /className="([^"]*)\s*text-2xl\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'1.5rem\' }}' },
  { from: /className="([^"]*)\s*text-3xl\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'1.875rem\' }}' },
  { from: /className="([^"]*)\s*text-4xl\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'2.25rem\' }}' },
  { from: /className="([^"]*)\s*text-5xl\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontSize: \'3rem\' }}' },
  
  // Pesos de fonte
  { from: /className="([^"]*)\s*font-bold\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontWeight: 700 }}' },
  { from: /className="([^"]*)\s*font-semibold\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontWeight: 600 }}' },
  { from: /className="([^"]*)\s*font-medium\s*([^"]*)"/g, to: 'className="$1 $2" style={{ fontWeight: 500 }}' },
];

async function corrigirArquivo(path) {
  let content = readFileSync(path, 'utf8');
  let original = content;
  
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  // Limpar espaços duplos em className
  content = content.replace(/className="\s+/g, 'className="');
  content = content.replace(/\s+" style=/g, '" style=');
  content = content.replace(/\s+"/g, '"');
  
  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  // Processar apenas arquivos de páginas primeiro
  const files = await glob('src/pages/**/*.tsx');
  let count = 0;
  
  console.log(`\n🔧 Processando ${files.length} arquivos de páginas...\n`);
  
  for (const file of files) {
    try {
      if (await corrigirArquivo(file)) {
        console.log(`✅ ${file}`);
        count++;
      }
    } catch (err) {
      console.error(`❌ ${file}:`, err.message);
    }
  }
  
  console.log(`\n🎉 ${count} arquivos corrigidos!\n`);
}

main().catch(console.error);

