#!/usr/bin/env node
/**
 * QA Script: Check Tables
 * Valida todas as tabelas do sistema
 * ICARUS v5.0
 */

import { glob } from 'globby';
import fs from 'fs/promises';

interface TableIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
}

const issues: TableIssue[] = [];
let tablesChecked = 0;
let tablesWithIssues = 0;

async function checkTables() {
  console.log('📊 Verificando tabelas...\n');

  const files = await glob(['src/**/*.tsx'], {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
  });

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');

    let inTable = false;
    let hasTheadThus = false;
    let hasTbody = false;
    let hasScope = false;
    let hasCaption = false;
    let hasAriaLabel = false;
    let tableLineStart = 0;

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detecta início de tabela
      if (line.match(/<table[\s>]/i)) {
        inTable = true;
        tableLineStart = lineNum;
        tablesChecked++;
        hasTheadThus = false;
        hasTbody = false;
        hasScope = false;
        hasCaption = false;
        hasAriaLabel = false;

        // Verifica aria-label ou caption
        if (line.includes('aria-label')) {
          hasAriaLabel = true;
        }

        // Verifica responsividade
        if (!line.includes('overflow') && !content.includes('responsive-table')) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Table sem wrapper responsivo (overflow-x-auto)',
            severity: 'warning',
          });
        }
      }

      if (inTable) {
        // Verifica <thead>
        if (line.includes('<thead')) {
          hasTheadThus = true;
        }

        // Verifica <th> com scope
        if (line.match(/<th[\s>]/)) {
          if (line.includes('scope=')) {
            hasScope = true;
          } else {
            issues.push({
              file,
              line: lineNum,
              issue: '<th> sem atributo scope (col/row)',
              severity: 'error',
            });
          }
        }

        // Verifica <tbody>
        if (line.includes('<tbody')) {
          hasTbody = true;
        }

        // Verifica <caption>
        if (line.includes('<caption')) {
          hasCaption = true;
        }

        // Verifica sortable columns
        if (line.includes('<th') && !line.includes('onClick') && !line.includes('sortable')) {
          // Possível coluna que deveria ser ordenável
        }

        // Verifica hover em rows
        if (line.includes('<tr') && !line.includes('hover') && !line.includes('onClick')) {
          // Possível falta de hover effect
        }

        // Verifica células vazias
        if (line.match(/<td>\s*<\/td>/) || line.match(/<th>\s*<\/th>/)) {
          issues.push({
            file,
            line: lineNum,
            issue: 'Célula vazia sem conteúdo',
            severity: 'warning',
          });
        }

        // Fim da tabela
        if (line.includes('</table>')) {
          inTable = false;

          // Validações de estrutura
          if (!hasTheadThus) {
            issues.push({
              file,
              line: tableLineStart,
              issue: 'Table sem <thead>',
              severity: 'error',
            });
          }

          if (!hasTbody) {
            issues.push({
              file,
              line: tableLineStart,
              issue: 'Table sem <tbody>',
              severity: 'error',
            });
          }

          if (!hasCaption && !hasAriaLabel) {
            issues.push({
              file,
              line: tableLineStart,
              issue: 'Table sem <caption> ou aria-label',
              severity: 'error',
            });
          }

          if (!hasScope) {
            issues.push({
              file,
              line: tableLineStart,
              issue: 'Table sem scope nos headers <th>',
              severity: 'error',
            });
          }
        }
      }
    });
  }

  tablesWithIssues = new Set(issues.map(i => i.file)).size;
  printReport();
}

function printReport() {
  console.log(`✅ Tabelas verificadas: ${tablesChecked}`);
  console.log(`❌ Arquivos com issues: ${tablesWithIssues}`);
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
  console.log(`  Total Tables: ${tablesChecked}`);
  console.log(`  Files with Issues: ${tablesWithIssues}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  
  if (tablesChecked > 0) {
    console.log(`  Pass Rate: ${((tablesChecked - tablesWithIssues) / tablesChecked * 100).toFixed(2)}%`);
  }

  // Recomendações
  console.log(`\n💡 RECOMMENDATIONS:`);
  console.log(`  • Use <thead>, <tbody>, <tfoot> para estrutura semântica`);
  console.log(`  • Adicione scope="col" ou scope="row" em <th>`);
  console.log(`  • Use <caption> ou aria-label para descrever a tabela`);
  console.log(`  • Implemente overflow-x-auto para responsividade`);
  console.log(`  • Adicione hover effects nas linhas`);
  console.log(`  • Considere ordenação por colunas (sortable)`);

  if (errors.length > 0) {
    console.log(`\n❌ QA Check FAILED\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ QA Check PASSED\n`);
    process.exit(0);
  }
}

checkTables().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
