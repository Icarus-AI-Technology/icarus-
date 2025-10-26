#!/usr/bin/env node
/**
 * Verifica tamanho do bundle após build
 */

import fs from 'fs/promises';
import path from 'path';

const MAX_BUNDLE_KB = 280;
const MAX_GZIP_KB = 90;

async function checkBundleSize() {
  console.log('📦 Verificando tamanho do bundle...\n');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  try {
    await fs.access(distPath);
  } catch {
    console.log('⚠️  Pasta dist/ não encontrada. Execute npm run build primeiro.');
    process.exit(1);
  }

  const files = await fs.readdir(path.join(distPath, 'assets'), { recursive: false });
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  let totalSize = 0;
  let details = [];

  for (const file of jsFiles) {
    const filePath = path.join(distPath, 'assets', file);
    const stats = await fs.stat(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    details.push({ file, sizeKB });
  }

  const totalKB = (totalSize / 1024).toFixed(2);
  const estimatedGzipKB = (totalKB * 0.33).toFixed(2); // Estimativa 33%

  console.log('📊 Detalhes do Bundle:\n');
  details.forEach(({ file, sizeKB }) => {
    console.log(`  ${file}: ${sizeKB} KB`);
  });

  console.log(`\n📦 Total: ${totalKB} KB (estimado gzip: ~${estimatedGzipKB} KB)`);
  
  if (totalKB > MAX_BUNDLE_KB) {
    console.log(`❌ Bundle muito grande! Máximo: ${MAX_BUNDLE_KB} KB`);
    process.exit(1);
  }
  
  if (estimatedGzipKB > MAX_GZIP_KB) {
    console.log(`⚠️  Gzip estimado acima do ideal (${MAX_GZIP_KB} KB)`);
  }

  console.log('\n✅ Bundle dentro do limite!');
}

checkBundleSize().catch(console.error);

