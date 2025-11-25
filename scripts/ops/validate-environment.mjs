#!/usr/bin/env node

/**
 * ICARUS v5.0 - Environment Configuration Validator
 * -------------------------------------------------
 * Compares .env (if present) with env.example and validates mandatory keys,
 * localhost bindings for native AI services, and directory separation rules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DEV_ENV_PATH = path.join(ROOT_DIR, '.env');
const EXAMPLE_ENV_PATH = path.join(ROOT_DIR, 'env.example');

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const idx = line.indexOf('=');
      if (idx === -1) {
        return acc;
      }
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

const exampleEnv = parseEnv(EXAMPLE_ENV_PATH);
const devEnv = parseEnv(DEV_ENV_PATH);

const summary = {
  missingInDev: [],
  missingInExample: [],
  localhostViolations: [],
  directoryWarnings: [],
};

const REQUIRED_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_URL',
  'ML_SERVICE_URL',
  'VITE_OLLAMA_URL',
  'VITE_OLLAMA_DEFAULT_MODEL',
];

for (const key of REQUIRED_KEYS) {
  if (!devEnv[key]) {
    summary.missingInDev.push(key);
  }
  if (!exampleEnv[key]) {
    summary.missingInExample.push(key);
  }
}

const LOCALHOST_KEYS = ['ML_SERVICE_URL', 'VITE_OLLAMA_URL', 'VITE_APP_URL'];

for (const key of LOCALHOST_KEYS) {
  const value = devEnv[key] || exampleEnv[key];
  if (!value) {
    continue;
  }
  if (!value.includes('localhost')) {
    summary.localhostViolations.push({ key, value });
  }
}

const DIR_KEYS = {
  DEVELOPMENT: '/Users/daxmeneghel/icarus-make',
  PRODUCTION: '/Users/daxmeneghel/icarus-v5.0',
};

for (const [label, expected] of Object.entries(DIR_KEYS)) {
  const actual = devEnv[`DIR_${label}`];
  if (actual && actual !== expected) {
    summary.directoryWarnings.push({ label, expected, actual });
  }
}

console.log('🔍 ICARUS v5.0 - Environment Validation');
console.log('========================================\n');

if (Object.keys(devEnv).length === 0) {
  console.log('⚠️  .env não encontrado. Copie env.example para .env antes de prosseguir.\n');
}

if (summary.missingInDev.length > 0) {
  console.log('❌ Variáveis obrigatórias ausentes em .env:');
  summary.missingInDev.forEach((key) => console.log(`   - ${key}`));
  console.log('');
} else {
  console.log('✅ Todas as variáveis obrigatórias estão presentes em .env');
}

if (summary.missingInExample.length > 0) {
  console.log('⚠️  Atualize env.example com as chaves ausentes:');
  summary.missingInExample.forEach((key) => console.log(`   - ${key}`));
  console.log('');
}

if (summary.localhostViolations.length > 0) {
  console.log('❌ Configurações de IA não apontam para localhost:');
  summary.localhostViolations.forEach(({ key, value }) => {
    console.log(`   - ${key}: ${value}`);
  });
  console.log('');
} else {
  console.log('✅ Serviços de IA configurados para localhost');
}

if (summary.directoryWarnings.length > 0) {
  console.log('\n⚠️  Diretórios divergentes:');
  summary.directoryWarnings.forEach(({ label, expected, actual }) => {
    console.log(`   - DIR_${label}: esperado ${expected}, encontrado ${actual}`);
  });
}

console.log('\nDone.');
