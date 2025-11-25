#!/usr/bin/env node
/**
 * Correção FINAL - Páginas Específicas
 * Corrige as últimas páginas com violações text-* e font-*
 */

import { readFileSync, writeFileSync } from 'fs';

const PAGES = [
  'src/pages/Dashboard.tsx',
  'src/pages/Signup.tsx',
  'src/pages/GPTResearcherDemo.tsx',
  'src/pages/Login.tsx',
  'src/pages/ComplianceAuditoria.tsx',
  'src/pages/ConsignacaoAvancada.tsx',
  'src/pages/ServerError.tsx',
  'src/pages/NotFound.tsx',
  'src/pages/Unauthorized.tsx',
  'src/pages/Welcome.tsx',
];

function removerClasses(content) {
  // Remove text-sm, text-xs, text-lg, text-xl, text-2xl, text-3xl
  const sizes = [
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'text-4xl',
  ];
  const weights = [
    'font-thin',
    'font-light',
    'font-medium',
    'font-semibold',
    'font-bold',
    'font-extrabold',
  ];

  let result = content;

  [...sizes, ...weights].forEach((cls) => {
    // Remover dentro de className
    result = result.replace(new RegExp(`\\s+${cls}\\b`, 'g'), '');
    result = result.replace(new RegExp(`\\b${cls}\\s+`, 'g'), '');
    result = result.replace(new RegExp(`="${cls}"`, 'g'), '=""');
  });

  // Limpar className vazias
  result = result.replace(/className=""\s*/g, '');
  result = result.replace(/className="  +/g, 'className="');
  result = result.replace(/  +"/g, '"');

  return result;
}

let count = 0;
console.log('\n🔧 Corrigindo páginas específicas...\n');

PAGES.forEach((file) => {
  try {
    const original = readFileSync(file, 'utf8');
    const modified = removerClasses(original);

    if (modified !== original) {
      writeFileSync(file, modified, 'utf8');
      console.log(`✅ ${file}`);
      count++;
    } else {
      console.log(`⏭️  ${file} (OK)`);
    }
  } catch (err) {
    console.log(`❌ ${file}: ${err.message}`);
  }
});

console.log(`\n🎉 ${count} páginas corrigidas!\n`);
