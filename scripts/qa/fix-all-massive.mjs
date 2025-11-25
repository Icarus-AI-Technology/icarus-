#!/usr/bin/env node
/**
 * Correção MASSIVA FINAL - TODOS os arquivos restantes
 * Remove text-* e font-* de TODOS os arquivos TSX/TS
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

function limparClasses(content) {
  const classesToRemove = [
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'text-4xl',
    'text-5xl',
    'font-thin',
    'font-light',
    'font-medium',
    'font-semibold',
    'font-bold',
    'font-extrabold',
    'font-black',
  ];

  let result = content;

  classesToRemove.forEach((cls) => {
    // Variações: início, meio e fim de className
    result = result.replace(new RegExp(`className="${cls}\\s+([^"]*)"`, 'g'), 'className="$1"');
    result = result.replace(
      new RegExp(`className="([^"]*)\\s+${cls}\\s+([^"]*)"`, 'g'),
      'className="$1 $2"'
    );
    result = result.replace(new RegExp(`className="([^"]*)\\s+${cls}"`, 'g'), 'className="$1"');
    result = result.replace(new RegExp(`className="${cls}"`, 'g'), 'className=""');
  });

  // Limpar espaços extras e className vazias
  result = result.replace(/className="  +/g, 'className="');
  result = result.replace(/  +"/g, '"');
  result = result.replace(/className=""\s*/g, '');

  return result;
}

async function main() {
  const files = await glob('src/**/*.{tsx,ts}', {
    ignore: ['**/*.bak', '**/*.css', '**/node_modules/**'],
  });

  let count = 0;
  let totalChanges = 0;

  console.log(`\n🔥 LIMPEZA MASSIVA FINAL: ${files.length} arquivos...\n`);

  for (const file of files) {
    try {
      const original = readFileSync(file, 'utf8');
      const modified = limparClasses(original);

      if (modified !== original) {
        // Contar quantas classes foram removidas
        const changes = (
          original.match(
            /text-(xs|sm|lg|xl|2xl|3xl|4xl|5xl)|font-(thin|light|medium|semibold|bold|extrabold|black)/g
          ) || []
        ).length;
        writeFileSync(file, modified, 'utf8');

        if (changes > 0) {
          console.log(`✅ ${file} (-${changes})`);
          count++;
          totalChanges += changes;
        }
      }
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
    }
  }

  console.log(`\n🎉 CONCLUÍDO!`);
  console.log(`📊 ${count} arquivos modificados`);
  console.log(`🗑️  ${totalChanges} classes removidas\n`);
}

main().catch(console.error);
