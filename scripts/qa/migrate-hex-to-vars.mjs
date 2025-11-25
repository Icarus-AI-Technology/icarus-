#!/usr/bin/env node
/**
 * Migração de cores hex para CSS variables
 * Mantém oraclusx-ds.css (fonte de tokens)
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Mapeamento de cores hex comuns para CSS variables
const COLOR_MAP = {
  // Indigo (primary)
  '#6366f1': 'var(--orx-primary)',
  '#6366F1': 'var(--orx-primary)',
  '#4f46e5': 'var(--orx-primary-hover)',
  '#4F46E5': 'var(--orx-primary-hover)',
  '#4338ca': 'var(--orx-primary-active)',
  '#4338CA': 'var(--orx-primary-active)',

  // Success
  '#10b981': 'var(--orx-success)',
  '#10B981': 'var(--orx-success)',
  '#15803d': 'var(--orx-success-dark)',
  '#15803D': 'var(--orx-success-dark)',
  '#d1fae5': 'var(--orx-success-light)',
  '#D1FAE5': 'var(--orx-success-light)',

  // Warning
  '#f59e0b': 'var(--orx-warning)',
  '#F59E0B': 'var(--orx-warning)',
  '#92400e': 'var(--orx-warning-dark)',
  '#92400E': 'var(--orx-warning-dark)',

  // Error
  '#ef4444': 'var(--orx-error)',
  '#EF4444': 'var(--orx-error)',
  '#dc2626': 'var(--orx-error-dark)',
  '#DC2626': 'var(--orx-error-dark)',

  // Gray scales
  '#e0e5ec': 'var(--orx-bg-light)',
  '#E0E5EC': 'var(--orx-bg-light)',
  '#2d3748': 'var(--orx-bg-dark)',
  '#2D3748': 'var(--orx-bg-dark)',
};

function migrarCores(path) {
  let content = readFileSync(path, 'utf8');
  let original = content;

  Object.entries(COLOR_MAP).forEach(([hex, cssVar]) => {
    // Substituir em diversos contextos
    content = content.replace(new RegExp(hex, 'g'), cssVar);
  });

  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  // Processar APENAS componentes e páginas (excluir CSS base)
  const files = await glob('src/**/*.{tsx,ts}', {
    ignore: ['**/oraclusx-ds.css', '**/globals.css', '**/*.bak'],
  });

  let count = 0;

  console.log(`\n🎨 Migrando cores hex para CSS variables em ${files.length} arquivos...\n`);

  for (const file of files) {
    try {
      if (await migrarCores(file)) {
        console.log(`✅ ${file}`);
        count++;
      }
    } catch (err) {
      console.error(`❌ ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 ${count} arquivos migrados!\n`);
}

main().catch(console.error);
