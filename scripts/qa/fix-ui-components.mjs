#!/usr/bin/env node
/**
 * Correção FINAL - Componentes UI shadcn/ui
 * Remove text-* e font-* dos componentes UI base
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

function corrigirComponenteUI(path) {
  let content = readFileSync(path, 'utf8');
  let original = content;

  // Remover text-sm, text-xs, text-lg, text-xl, text-2xl, text-3xl
  const sizesToRemove = ['text-xs', 'text-sm', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

  sizesToRemove.forEach((size) => {
    // Remover da string de classes (cva ou className)
    content = content.replace(new RegExp(`\\s${size}\\b`, 'g'), '');
    content = content.replace(new RegExp(`^${size}\\b`, 'g'), '');
  });

  // Remover font-medium, font-semibold, font-bold
  const weightsToRemove = ['font-medium', 'font-semibold', 'font-bold', 'font-light'];

  weightsToRemove.forEach((weight) => {
    content = content.replace(new RegExp(`\\s${weight}\\b`, 'g'), '');
    content = content.replace(new RegExp(`^${weight}\\b`, 'g'), '');
  });

  // Limpar espaços duplos
  content = content.replace(/  +/g, ' ');
  content = content.replace(/" +"/g, '""');
  content = content.replace(/\(" /g, '("');
  content = content.replace(/ "\)/g, '")');

  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    return true;
  }

  return false;
}

async function main() {
  // Processar componentes UI
  const files = await glob('src/components/ui/*.tsx');

  let count = 0;

  console.log(`\n🔧 Corrigindo componentes UI (${files.length} arquivos)...\n`);

  for (const file of files) {
    try {
      if (corrigirComponenteUI(file)) {
        console.log(`✅ ${file}`);
        count++;
      } else {
        console.log(`⏭️  ${file} (OK)`);
      }
    } catch (err) {
      console.error(`❌ ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 ${count} componentes UI corrigidos!\n`);
}

main().catch(console.error);
