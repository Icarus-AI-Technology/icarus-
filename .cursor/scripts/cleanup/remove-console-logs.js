#!/usr/bin/env node
/**
 * Remove console.logs do código de produção
 * Mantém apenas console.error e console.warn
 */

import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

async function removeConsoleLogs() {
  console.log('🧹 Removendo console.logs...\n');
  
  const files = await globby([
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test/**',
  ]);

  let totalRemoved = 0;
  let filesModified = 0;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    
    // Remove console.log, console.debug, console.info
    // Mantém console.error e console.warn
    const newContent = content
      .replace(/console\.(log|debug|info)\([^)]*\);?\n?/g, '')
      .replace(/\/\/ console\.(log|debug|info)/g, '');
    
    const matches = content.match(/console\.(log|debug|info)/g);
    const removed = matches ? matches.length : 0;
    
    if (removed > 0) {
      totalRemoved += removed;
      filesModified++;
      console.log(`  ${file}: ${removed} console.logs removidos`);
      
      if (!DRY_RUN) {
        await fs.writeFile(file, newContent, 'utf-8');
      }
    }
  }

  console.log(`\n✅ Total: ${totalRemoved} console.logs em ${filesModified} arquivos`);
  if (DRY_RUN) {
    console.log('   (dry-run - nenhuma alteração feita)');
  }
}

removeConsoleLogs().catch(console.error);

