#!/usr/bin/env node

/**
 * VALIDAÇÃO COMPLETA - ICARUS NEWORTHO
 * Executa todas as validações necessárias antes do deploy
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: [],
      overallStatus: 'PENDING'
    };
  }

  log(message, level = 'INFO') {
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      WARNING: '\x1b[33m',
      ERROR: '\x1b[31m',
      TITLE: '\x1b[35m'
    };
    const color = colors[level] || '\x1b[0m';
    console.log(`${color}${message}\x1b[0m`);
  }

  async runCommand(command, name) {
    this.log(`\n📋 Executando: ${name}...`, 'INFO');
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const proc = spawn('sh', ['-c', command], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });

      proc.on('close', (code) => {
        const duration = Date.now() - startTime;
        const status = code === 0 ? '✅ PASSOU' : '❌ FALHOU';
        
        this.results.checks.push({
          name,
          command,
          exitCode: code,
          status,
          duration: `${(duration / 1000).toFixed(2)}s`
        });

        if (code === 0) {
          this.log(`✅ ${name} - OK (${(duration / 1000).toFixed(2)}s)`, 'SUCCESS');
        } else {
          this.log(`❌ ${name} - FALHOU (código ${code})`, 'ERROR');
        }

        resolve(code === 0);
      });
    });
  }

  async validate() {
    this.log('\n' + '='.repeat(60), 'TITLE');
    this.log('🚀 VALIDAÇÃO COMPLETA - ICARUS NEWORTHO', 'TITLE');
    this.log('='.repeat(60) + '\n', 'TITLE');

    const checks = [
      // 1. Análise básica
      {
        name: 'Análise Básica',
        command: 'node .cursor/scripts/basic-analysis.js',
        critical: true
      },
      
      // 2. Type Check
      {
        name: 'TypeScript Check',
        command: 'pnpm run type-check',
        critical: true
      },
      
      // 3. Lint
      {
        name: 'ESLint',
        command: 'pnpm run lint',
        critical: false
      },
      
      // 4. Build
      {
        name: 'Build Production',
        command: 'pnpm run build',
        critical: true
      },
      
      // 5. Testes Unitários
      {
        name: 'Testes Unitários',
        command: 'pnpm run test -- --run',
        critical: false
      }
    ];

    let passed = 0;
    let failed = 0;
    let criticalFailed = false;

    for (const check of checks) {
      const success = await this.runCommand(check.command, check.name);
      
      if (success) {
        passed++;
      } else {
        failed++;
        if (check.critical) {
          criticalFailed = true;
        }
      }
    }

    // Resultados finais
    this.log('\n' + '='.repeat(60), 'TITLE');
    this.log('📊 RESUMO DA VALIDAÇÃO', 'TITLE');
    this.log('='.repeat(60), 'TITLE');
    this.log(`\nTestes Executados: ${checks.length}`);
    this.log(`✅ Passou: ${passed}`, 'SUCCESS');
    this.log(`❌ Falhou: ${failed}`, failed > 0 ? 'ERROR' : 'INFO');
    
    if (criticalFailed) {
      this.log('\n❌ VALIDAÇÃO CRÍTICA FALHOU', 'ERROR');
      this.log('Corrija os erros antes de fazer deploy.\n', 'ERROR');
      this.results.overallStatus = 'FAILED';
    } else if (failed > 0) {
      this.log('\n⚠️  VALIDAÇÃO COM WARNINGS', 'WARNING');
      this.log('Alguns testes falharam, mas pode prosseguir com cautela.\n', 'WARNING');
      this.results.overallStatus = 'WARNING';
    } else {
      this.log('\n✅ TODAS AS VALIDAÇÕES PASSARAM', 'SUCCESS');
      this.log('Projeto pronto para deploy!\n', 'SUCCESS');
      this.results.overallStatus = 'SUCCESS';
    }

    // Próximos passos
    if (this.results.overallStatus === 'SUCCESS') {
      this.log('📋 PRÓXIMOS PASSOS:', 'TITLE');
      this.log('  1. Deploy Preview: vercel --prod=false');
      this.log('  2. Testar em preview');
      this.log('  3. Deploy Production: vercel --prod\n');
    }

    // Salvar relatório
    this.saveReport();

    return this.results.overallStatus === 'SUCCESS';
  }

  saveReport() {
    const reportsDir = path.join(process.cwd(), '.cursor/reports/audit-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `complete-validation-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log(`\n📄 Relatório salvo: ${reportPath}\n`, 'INFO');
  }
}

// Executar validação
const validator = new CompleteValidator();
validator.validate().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ ERRO NA VALIDAÇÃO:', error);
  process.exit(1);
});

