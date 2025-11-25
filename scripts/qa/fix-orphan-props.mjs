#!/usr/bin/env node

/**
 * Script para remover props órfãs de KPICards removidos
 */

import fs from 'fs/promises';
import path from 'path';

const filesToFix = [
  '/Users/daxmeneghel/icarus-make/src/pages/cadastros/TabelasPrecos.tsx',
  '/Users/daxmeneghel/icarus-make/src/pages/compras/DashboardCompras.tsx',
];

async function fixOrphanProps(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');

    // Remover padrões de props órfãs após comentários KPICard removido
    // Padrão: {/* KPICard removido... */}}
    //           color="..."
    //           onClick={() => ...}
    //         />

    const orphanPattern =
      /\{\/\*\s*KPICard removido[^\}]*\*\/\}\s*}\s*color="[^"]*"\s*onClick=\{[^\}]*\}\s*\/>/g;

    if (orphanPattern.test(content)) {
      content = content.replace(orphanPattern, '');
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ ${path.basename(filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Removendo props órfãs de KPICards...\n');

  let fixed = 0;

  for (const file of filesToFix) {
    if (await fixOrphanProps(file)) {
      fixed++;
    }
  }

  console.log(`\n✅ ${fixed} arquivo(s) corrigido(s)`);
}

main().catch(console.error);
