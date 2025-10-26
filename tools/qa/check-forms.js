#!/usr/bin/env node
/**
 * QA Script: Check Forms
 * Valida todos os formulários do sistema
 * ICARUS v5.0
 */

import { glob } from 'globby';
import fs from 'fs/promises';
import path from 'path';

interface FormIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
}

const issues: FormIssue[] = [];
let formsChecked = 0;
let formsWithIssues = 0;

async function checkForms() {
  console.log('🔍 Verificando formulários...\n');

  // Busca arquivos com formulários
  const files = await glob(['src/**/*.tsx', 'src/**/*.ts'], {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
  });

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');

    let hasForm = false;
    let hasValidation = false;
    let hasErrorHandling = false;
    let hasLabels = false;
    let hasAccessibility = false;

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detecta form
      if (line.includes('<form') || line.includes('useForm')) {
        hasForm = true;
        formsChecked++;
      }

      // Verifica validação (Zod, Yup, etc)
      if (line.match(/z\./i) || line.match(/yup\./i) || line.includes('validationSchema')) {
        hasValidation = true;
      }

      // Verifica error handling
      if (line.includes('errors') || line.includes('formState.errors')) {
        hasErrorHandling = true;
      }

      // Verifica labels
      if (line.includes('<label') || line.includes('htmlFor')) {
        hasLabels = true;
      }

      // Verifica acessibilidade
      if (line.includes('aria-') || line.includes('role=')) {
        hasAccessibility = true;
      }

      // Detecta inputs sem label
      if (line.match(/<input[^>]*>/)) {
        if (!lines.slice(Math.max(0, index - 2), index + 1).some(l => l.includes('<label') || l.includes('aria-label'))) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Input sem label associado',
            severity: 'error',
          });
        }
      }

      // Detecta button type sem especificação
      if (line.match(/<button[^>]*>/) && !line.includes('type=')) {
        issues.push({
          file,
          line: lineNum,
          issue: 'Button sem atributo type',
          severity: 'warning',
        });
      }

      // Detecta form sem onSubmit
      if (line.includes('<form') && !line.includes('onSubmit')) {
        issues.push({
          file,
          line: lineNum,
          issue: 'Form sem handler onSubmit',
          severity: 'error',
        });
      }

      // Detecta required sem indicação visual
      if (line.includes('required') && !lines.slice(Math.max(0, index - 2), index + 2).some(l => l.includes('*') || l.includes('obrigatório'))) {
        issues.push({
          file,
          line: lineNum,
          issue: 'Campo required sem indicação visual',
          severity: 'warning',
        });
      }
    });

    // Validações de arquivo
    if (hasForm) {
      if (!hasValidation) {
        issues.push({
          file,
          line: 0,
          issue: 'Form sem validação (Zod/Yup)',
          severity: 'error',
        });
      }

      if (!hasErrorHandling) {
        issues.push({
          file,
          line: 0,
          issue: 'Form sem tratamento de erros',
          severity: 'warning',
        });
      }

      if (!hasLabels) {
        issues.push({
          file,
          line: 0,
          issue: 'Form sem labels para inputs',
          severity: 'error',
        });
      }

      if (!hasAccessibility) {
        issues.push({
          file,
          line: 0,
          issue: 'Form sem atributos de acessibilidade (aria-*)',
          severity: 'warning',
        });
      }

      if (issues.some(i => i.file === file)) {
        formsWithIssues++;
      }
    }
  }

  printReport();
}

function printReport() {
  console.log(`✅ Formulários verificados: ${formsChecked}`);
  console.log(`❌ Formulários com issues: ${formsWithIssues}`);
  console.log(`📊 Issues encontradas: ${issues.length}\n`);

  // Agrupa por severidade
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  if (errors.length > 0) {
    console.log(`\n🔴 ERRORS (${errors.length}):`);
    errors.forEach(({ file, line, issue }) => {
      console.log(`  ${file}:${line} - ${issue}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n🟡 WARNINGS (${warnings.length}):`);
    warnings.forEach(({ file, line, issue }) => {
      console.log(`  ${file}:${line} - ${issue}`);
    });
  }

  // Summary
  console.log(`\n📈 SUMMARY:`);
  console.log(`  Total Forms: ${formsChecked}`);
  console.log(`  Forms OK: ${formsChecked - formsWithIssues}`);
  console.log(`  Forms with Issues: ${formsWithIssues}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);

  // Exit code
  if (errors.length > 0) {
    console.log(`\n❌ QA Check FAILED\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ QA Check PASSED\n`);
    process.exit(0);
  }
}

// Run
checkForms().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
