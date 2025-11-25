#!/usr/bin/env node

import fs from 'fs/promises';
import glob from 'glob';
import { promisify } from 'util';

const globAsync = promisify(glob);

async function fixFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  const original = content;

  // Dentro de catch (_err), substituir todas as referências a err por _err
  const catchBlocks = content.matchAll(/catch\s*\((_err|_error)\)\s*\{/g);

  for (const match of catchBlocks) {
    const varName = match[1]; // _err ou _error
    const originalName = varName.substring(1); // err ou error

    // Encontrar o bloco completo
    let startIdx = match.index + match[0].length;
    let braceCount = 1;
    let endIdx = startIdx;

    while (braceCount > 0 && endIdx < content.length) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }

    const before = content.substring(0, startIdx);
    const block = content.substring(startIdx, endIdx - 1);
    const after = content.substring(endIdx - 1);

    // Substituir referências ao nome original pelo nome com underscore no bloco
    const regex = new RegExp(`\\b${originalName}\\b`, 'g');
    const fixedBlock = block.replace(regex, varName);

    content = before + fixedBlock + after;
  }

  if (content !== original) {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  }

  return false;
}

async function main() {
  const files = await globAsync('/Users/daxmeneghel/icarus-make/src/**/*.ts', {
    ignore: ['**/node_modules/**', '**/dist/**'],
  });

  let fixed = 0;

  for (const file of files) {
    try {
      if (await fixFile(file)) {
        console.log(`✅ ${file}`);
        fixed++;
      }
    } catch (error) {
      console.error(`❌ ${file}:`, error.message);
    }
  }

  console.log(`\n✅ ${fixed} arquivo(s) corrigido(s)`);
}

main().catch(console.error);
