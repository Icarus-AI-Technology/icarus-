#!/usr/bin/env node
/**
 * Verifica se há credenciais hardcoded no código
 */

import { globby } from 'globby';
import fs from 'fs/promises';

const PATTERNS = [
  /password\s*=\s*["'][^"']+["']/gi,
  /api[_-]?key\s*=\s*["'][^"']+["']/gi,
  /secret\s*=\s*["'][^"']+["']/gi,
  /token\s*=\s*["'][^"']+["']/gi,
  /sk_live_[a-zA-Z0-9]+/g,
  /pk_live_[a-zA-Z0-9]+/g,
  /AKIA[0-9A-Z]{16}/g, // AWS keys
];

async function checkCredentials() {
  console.log('🔐 Verificando credenciais hardcoded...\n');
  
  const files = await globby([
    'src/**/*.{ts,tsx,js,jsx}',
    'server/**/*.{ts,js}',
    '!src/**/*.test.{ts,tsx}',
    '!node_modules/**',
  ]);

  let foundIssues = 0;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    
    for (const pattern of PATTERNS) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        foundIssues++;
        console.log(`❌ ${file}`);
        matches.forEach(match => {
          console.log(`   → ${match.substring(0, 50)}...`);
        });
      }
    }
  }

  if (foundIssues === 0) {
    console.log('✅ Nenhuma credencial hardcoded encontrada!');
    process.exit(0);
  } else {
    console.log(`\n❌ Total: ${foundIssues} problemas encontrados`);
    process.exit(1);
  }
}

checkCredentials().catch(console.error);

