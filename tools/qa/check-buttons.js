#!/usr/bin/env node
/**
 * QA Script: Check Buttons
 * Valida todos os botões do sistema
 * ICARUS v5.0
 */

import { glob } from 'globby';
import fs from 'fs/promises';

interface ButtonIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
}

const issues: ButtonIssue[] = [];
let buttonsChecked = 0;
let buttonsWithIssues = 0;

async function checkButtons() {
  console.log('🔘 Verificando botões...\n');

  const files = await glob(['src/**/*.tsx'], {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
  });

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detecta botões
      if (line.match(/<button|<Button/i)) {
        buttonsChecked++;

        // Verifica type attribute
        if (!line.match(/type\s*=\s*["'](button|submit|reset)["']/)) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Button sem atributo type definido',
            severity: 'warning',
          });
        }

        // Verifica texto vazio
        if (line.match(/<button[^>]*>\s*<\/button>/)) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Button sem texto (acessibilidade)',
            severity: 'error',
          });
        }

        // Verifica apenas ícone sem aria-label
        if (line.match(/<button[^>]*><svg|<Button[^>]*><svg/) && !line.includes('aria-label')) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Button com apenas ícone sem aria-label',
            severity: 'error',
          });
        }

        // Verifica onClick sem definição
        if (line.includes('onClick={}') || line.includes('onClick={undefined}')) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Button com onClick vazio',
            severity: 'warning',
          });
        }

        // Verifica disabled sem indicação visual
        if (line.includes('disabled') && !line.match(/disabled\s*=\s*\{/)) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Button disabled hardcoded (deve ser dinâmico)',
            severity: 'warning',
          });
        }

        // Verifica loading state
        if (line.includes('onClick') && !content.includes('isLoading') && !content.includes('loading')) {
          // Possível falta de loading state em ações assíncronas
          if (content.includes('async') || content.includes('await')) {
            issues.push({
              file,
              line: lineNum,
              issue: 'Button com ação assíncrona sem loading state',
              severity: 'warning',
            });
          }
        }

        // Verifica classe neuromórfica
        if (!line.includes('neuro-') && !line.includes('className')) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Button sem estilo neuromórfico (OraclusX DS)',
            severity: 'warning',
          });
        }

        // Verifica variantes de botão
        const hasVariant = line.match(/variant\s*=\s*["'](primary|secondary|outline|ghost|destructive)["']/);
        if (!hasVariant && line.includes('<Button')) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Button sem variante definida',
            severity: 'warning',
          });
        }
      }
    });
  }

  buttonsWithIssues = new Set(issues.map(i => i.file)).size;
  printReport();
}

function printReport() {
  console.log(`✅ Botões verificados: ${buttonsChecked}`);
  console.log(`❌ Arquivos com issues: ${buttonsWithIssues}`);
  console.log(`📊 Issues encontradas: ${issues.length}\n`);

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  if (errors.length > 0) {
    console.log(`\n🔴 ERRORS (${errors.length}):`);
    errors.slice(0, 20).forEach(({ file, line, issue }) => {
      console.log(`  ${file}:${line} - ${issue}`);
    });
    if (errors.length > 20) {
      console.log(`  ... e mais ${errors.length - 20} erros`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n🟡 WARNINGS (${warnings.length}):`);
    warnings.slice(0, 20).forEach(({ file, line, issue }) => {
      console.log(`  ${file}:${line} - ${issue}`);
    });
    if (warnings.length > 20) {
      console.log(`  ... e mais ${warnings.length - 20} warnings`);
    }
  }

  console.log(`\n📈 SUMMARY:`);
  console.log(`  Total Buttons: ${buttonsChecked}`);
  console.log(`  Files with Issues: ${buttonsWithIssues}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Pass Rate: ${((buttonsChecked - errors.length) / buttonsChecked * 100).toFixed(2)}%`);

  if (errors.length > 0) {
    console.log(`\n❌ QA Check FAILED\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ QA Check PASSED\n`);
    process.exit(0);
  }
}

checkButtons().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
