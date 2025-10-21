#!/usr/bin/env node
/**
 * Correção FINAL - Rodada 3
 * Foco em arquivos específicos restantes
 */

import { readFileSync, writeFileSync } from 'fs';

const arquivosPriorit

arios = [
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
  'src/contexts/ToastContext.tsx',
  'src/components/a11y/AccessibilityComponents.tsx',
];

function corrigirManual(path) {
  let content = readFileSync(path, 'utf8');
  let original = content;
  
  // Remover text-* e font-* agressivamente
  const classesRemover = [
    'text-xs', 'text-sm', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
    'font-bold', 'font-semibold', 'font-medium'
  ];
  
  classesRemover.forEach(classe => {
    // Remover da className (simples)
    content = content.replace(new RegExp(`\\s*${classe}\\s*`, 'g'), ' ');
    content = content.replace(new RegExp(`className="\\s*${classe}\\s*"`, 'g'), 'className=""');
    content = content.replace(new RegExp(`className="${classe}\\s*([^"]*)"`, 'g'), 'className="$1"');
    content = content.replace(new RegExp(`className="([^"]*)\\s*${classe}"`, 'g'), 'className="$1"');
  });
  
  // Limpar className vazias ou com espaços
  content = content.replace(/className=""\s*/g, '');
  content = content.replace(/className="\s+"/g, 'className=""');
  content = content.replace(/className="  +/g, 'className="');
  content = content.replace(/  +"/g, '"');
  
  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    return true;
  }
  return false;
}

let count = 0;
console.log('\n🔧 Correção FINAL - Rodada 3\n');

arquivosPrioritarios.forEach(file => {
  try {
    if (corrigirManual(file)) {
      console.log(`✅ ${file}`);
      count++;
    } else {
      console.log(`⏭️  ${file} (já OK)`);
    }
  } catch (err) {
    console.log(`❌ ${file}: ${err.message}`);
  }
});

console.log(`\n🎉 ${count} arquivos corrigidos!\n`);

