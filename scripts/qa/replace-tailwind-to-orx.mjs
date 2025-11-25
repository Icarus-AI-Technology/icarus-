#!/usr/bin/env node
/**
 * Substituição FINAL - text-* e font-* → orx-*
 * Substitui classes Tailwind por OraclusX DS Utils
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Mapeamento direto Tailwind → OraclusX
const REPLACEMENTS = {
  // Tamanhos de texto
  'text-xs': 'orx-text-xs',
  'text-sm': 'orx-text-sm',
  'text-base': 'orx-text-base',
  'text-lg': 'orx-text-lg',
  'text-xl': 'orx-text-xl',
  'text-2xl': 'orx-text-2xl',
  'text-3xl': 'orx-text-3xl',
  'text-4xl': 'orx-text-4xl',
  'text-5xl': 'orx-text-5xl',

  // Pesos de fonte
  'font-thin': 'orx-font-thin',
  'font-light': 'orx-font-light',
  'font-normal': 'orx-font-normal',
  'font-medium': 'orx-font-medium',
  'font-semibold': 'orx-font-semibold',
  'font-bold': 'orx-font-bold',
  'font-extrabold': 'orx-font-extrabold',
  'font-black': 'orx-font-black',
};

function substituirArquivo(path) {
  let content = readFileSync(path, 'utf8');
  let original = content;
  let mudancas = 0;

  // Substituir cada classe
  Object.entries(REPLACEMENTS).forEach(([tailwind, oraclusx]) => {
    // Regex para capturar a classe dentro de className
    // Suporta: className="... text-sm ..." e className="text-sm"
    const regex = new RegExp(`(className="[^"]*?)\\b${tailwind}\\b([^"]*")`, 'g');

    const antes = (content.match(regex) || []).length;
    if (antes > 0) {
      content = content.replace(regex, `$1${oraclusx}$2`);
      mudancas += antes;
    }
  });

  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    return { modificado: true, mudancas };
  }

  return { modificado: false, mudancas: 0 };
}

async function main() {
  const files = await glob('src/**/*.{tsx,ts}', {
    ignore: ['**/*.bak', '**/node_modules/**', '**/*.css'],
  });

  let count = 0;
  let totalMudancas = 0;

  console.log(`\n🔄 Substituição text-*/font-* → orx-*: ${files.length} arquivos...\n`);

  for (const file of files) {
    try {
      const result = substituirArquivo(file);
      if (result.modificado) {
        console.log(`✅ ${file} (${result.mudancas} classes)`);
        count++;
        totalMudancas += result.mudancas;
      }
    } catch (err) {
      console.error(`❌ ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 ${count} arquivos modificados!`);
  console.log(`📊 Total de ${totalMudancas} classes substituídas\n`);
}

main().catch(console.error);
