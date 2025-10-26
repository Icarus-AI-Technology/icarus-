#!/usr/bin/env node
/**
 * Detecta imports não utilizados via ESLint
 */

import { execSync } from 'child_process';

console.log('🔍 Detectando imports não utilizados...\n');

try {
  execSync('npx eslint . --fix --rule "@typescript-eslint/no-unused-vars: error"', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('\n✅ ESLint --fix executado!');
} catch (err) {
  console.log('\n⚠️  ESLint encontrou alguns erros que precisam de correção manual');
}

