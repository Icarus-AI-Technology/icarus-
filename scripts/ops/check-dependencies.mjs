#!/usr/bin/env node

/**
 * ICARUS v5.0 - Dependency Guard
 * ------------------------------
 * Validates presence and version alignment of critical dependencies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

if (!fs.existsSync(PACKAGE_JSON)) {
  console.error('❌ package.json não encontrado');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const deps = pkg.dependencies || {};
const devDeps = pkg.devDependencies || {};

const REQUIRED_DEPS = [
  'react',
  'react-dom',
  '@supabase/supabase-js',
  '@tanstack/react-query',
  '@hookform/resolvers',
  '@radix-ui/react-dialog',
];

const REQUIRED_DEV_DEPS = [
  'typescript',
  'vite',
  'eslint',
  'vitest',
  '@playwright/test',
  '@types/react',
  '@types/react-dom',
  '@types/node',
];

const issues = [];

function extractMajor(version) {
  if (!version) return null;
  const match = version.match(/(\d+)(?:\.(\d+))?/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

for (const dep of REQUIRED_DEPS) {
  if (!deps[dep]) {
    issues.push(`Dependência ausente: ${dep}`);
  }
}

for (const dep of REQUIRED_DEV_DEPS) {
  if (!devDeps[dep]) {
    issues.push(`DevDependency ausente: ${dep}`);
  }
}

// Check for duplicates
for (const dep of Object.keys(deps)) {
  if (devDeps[dep]) {
    issues.push(`Duplicidade: ${dep} listado em dependencies e devDependencies`);
  }
}

// Version alignment
function checkMajorMatch(depA, depB) {
  const versionA = deps[depA] || devDeps[depA];
  const versionB = deps[depB] || devDeps[depB];
  if (!versionA || !versionB) return;

  const majorA = extractMajor(versionA);
  const majorB = extractMajor(versionB);
  if (majorA && majorB && majorA !== majorB) {
    issues.push(`Versões maiores divergentes: ${depA}@${versionA} vs ${depB}@${versionB}`);
  }
}

checkMajorMatch('react', '@types/react');
checkMajorMatch('react-dom', '@types/react-dom');

if (devDeps.typescript) {
  const major = extractMajor(devDeps.typescript);
  if (major && major < 5) {
    issues.push(`Atualize TypeScript para >=5.0.0 (atual: ${devDeps.typescript})`);
  }
}

console.log('🔍 ICARUS v5.0 - Dependency Audit');
console.log('=================================\n');

if (issues.length === 0) {
  console.log('✅ Nenhum problema crítico encontrado\n');
} else {
  for (const issue of issues) {
    console.log(`❌ ${issue}`);
  }
  console.log('');
}

console.log('Resumo:');
console.log(`  dependencies: ${Object.keys(deps).length}`);
console.log(`  devDependencies: ${Object.keys(devDeps).length}`);

process.exit(issues.length === 0 ? 0 : 1);
