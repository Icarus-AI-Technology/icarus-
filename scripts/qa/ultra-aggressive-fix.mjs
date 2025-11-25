#!/usr/bin/env node
/**
 * ULTRA AGRESSIVO - Remove text-* e font-* FINALMENTE
 * Abordagem diferente: busca e substitui padrões reais
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

function substituirPorEstilosInline(content) {
  let result = content;
  let mudancas = 0;

  // Mapa de tamanhos
  const sizes = {
    'text-xs': '0.75rem',
    'text-sm': '0.875rem',
    'text-base': '1rem',
    'text-lg': '1.125rem',
    'text-xl': '1.25rem',
    'text-2xl': '1.5rem',
    'text-3xl': '1.875rem',
    'text-4xl': '2.25rem',
    'text-5xl': '3rem',
  };

  const weights = {
    'font-thin': 100,
    'font-light': 300,
    'font-medium': 500,
    'font-semibold': 600,
    'font-bold': 700,
    'font-extrabold': 800,
    'font-black': 900,
  };

  // Substituir tamanhos de texto
  Object.entries(sizes).forEach(([cls, size]) => {
    // Padrão: className="... text-sm ..."
    const regex = new RegExp(`className="([^"]*?\\s)?${cls}(\\s[^"]*?)"`, 'g');
    const before = (result.match(regex) || []).length;

    result = result.replace(regex, (match, before, after) => {
      mudancas++;
      const cleanBefore = (before || '').trim();
      const cleanAfter = (after || '').trim();
      const classes = [cleanBefore, cleanAfter].filter(Boolean).join(' ');
      return classes
        ? `className="${classes}" style={{ fontSize: '${size}' }}`
        : `style={{ fontSize: '${size}' }}`;
    });

    // Padrão: className="text-sm" (sozinho)
    result = result.replace(new RegExp(`className="${cls}"`, 'g'), () => {
      mudancas++;
      return `style={{ fontSize: '${size}' }}`;
    });
  });

  // Substituir pesos de fonte
  Object.entries(weights).forEach(([cls, weight]) => {
    const regex = new RegExp(`className="([^"]*?\\s)?${cls}(\\s[^"]*?)"`, 'g');

    result = result.replace(regex, (match, before, after) => {
      mudancas++;
      const cleanBefore = (before || '').trim();
      const cleanAfter = (after || '').trim();
      const classes = [cleanBefore, cleanAfter].filter(Boolean).join(' ');
      return classes
        ? `className="${classes}" style={{ fontWeight: ${weight} }}`
        : `style={{ fontWeight: ${weight} }}`;
    });

    result = result.replace(new RegExp(`className="${cls}"`, 'g'), () => {
      mudancas++;
      return `style={{ fontWeight: ${weight} }}`;
    });
  });

  return { content: result, mudancas };
}

async function main() {
  const files = await glob('src/**/*.tsx', {
    ignore: ['**/*.bak', '**/node_modules/**'],
  });

  let count = 0;
  let totalMudancas = 0;

  console.log(`\n🔥 ULTRA AGRESSIVO: ${files.length} arquivos...\n`);

  for (const file of files) {
    try {
      const original = readFileSync(file, 'utf8');
      const { content, mudancas } = substituirPorEstilosInline(original);

      if (mudancas > 0) {
        writeFileSync(file, content, 'utf8');
        console.log(`✅ ${file} (${mudancas} mudanças)`);
        count++;
        totalMudancas += mudancas;
      }
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
    }
  }

  console.log(`\n🎉 ${count} arquivos modificados`);
  console.log(`📊 ${totalMudancas} substituições\n`);
}

main().catch(console.error);
