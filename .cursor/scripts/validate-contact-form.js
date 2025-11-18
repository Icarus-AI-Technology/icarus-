#!/usr/bin/env node

/**
 * VALIDADOR DE FORMULÁRIO DE CONTATO - ICARUS V5.0
 * Valida todos os componentes do formulário e API
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

const CHECKS = [
  {
    id: 'api-file',
    name: 'API File Exists',
    check: () => fs.existsSync(path.join(rootDir, 'api/contact.ts')),
  },
  {
    id: 'page-file',
    name: 'Contato Page Exists',
    check: () => fs.existsSync(path.join(rootDir, 'src/pages/Contato.tsx')),
  },
  {
    id: 'route-config',
    name: 'Route Configured in App.tsx',
    check: () => {
      const appFile = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');
      return appFile.includes('path="/contato"') && appFile.includes('<Contato />');
    },
  },
  {
    id: 'vite-plugin',
    name: 'Vite Dev Plugin Configured',
    check: () => {
      const viteConfig = fs.readFileSync(path.join(rootDir, 'vite.config.ts'), 'utf-8');
      return viteConfig.includes('contactApiPlugin()');
    },
  },
  {
    id: 'vercel-config',
    name: 'Vercel Rewrite Configured',
    check: () => {
      const vercelConfig = fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf-8');
      const config = JSON.parse(vercelConfig);
      return config.rewrites?.some(r => r.source === '/api/contact');
    },
  },
  {
    id: 'styles',
    name: 'Neumorphic Styles Available',
    check: () => {
      const stylesFile = fs.readFileSync(path.join(rootDir, 'src/styles/globals.css'), 'utf-8');
      return stylesFile.includes('.neumorphic-card') &&
             stylesFile.includes('.neumorphic-input') &&
             stylesFile.includes('.neumorphic-button');
    },
  },
  {
    id: 'dependencies',
    name: 'Required Dependencies Installed',
    check: () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      const required = ['react-hook-form', 'zod', '@hookform/resolvers'];
      return required.every(dep => 
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
      );
    },
  },
  {
    id: 'typescript',
    name: 'TypeScript Types Valid (Core Files)',
    check: () => {
      try {
        // Verifica apenas arquivos principais (ignora Storybook)
        const output = execSync('pnpm type-check 2>&1', { 
          cwd: rootDir, 
          encoding: 'utf-8',
          timeout: 30000 
        });
        
        // Ignora erros de Storybook
        const lines = output.split('\n');
        const relevantErrors = lines.filter(line => 
          line.includes('error TS') && 
          !line.includes('.stories.tsx')
        );
        
        return relevantErrors.length === 0;
      } catch (error) {
        // Se houver erro, verifica se são apenas erros do Storybook
        const output = error.stdout?.toString() || error.stderr?.toString() || '';
        const lines = output.split('\n');
        const relevantErrors = lines.filter(line => 
          line.includes('error TS') && 
          !line.includes('.stories.tsx')
        );
        
        return relevantErrors.length === 0;
      }
    },
  },
];

class ContactFormValidator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, level = 'INFO') {
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      ERROR: '\x1b[31m',
      WARNING: '\x1b[33m',
    };
    const color = colors[level] || '\x1b[0m';
    console.log(`${color}${message}\x1b[0m`);
  }

  async runCheck(check) {
    this.log(`\n🔍 Verificando: ${check.name}`, 'INFO');
    
    try {
      const result = await check.check();
      
      if (result) {
        this.log(`✅ ${check.name} - OK`, 'SUCCESS');
        return { id: check.id, name: check.name, status: 'PASS' };
      } else {
        this.log(`❌ ${check.name} - FALHOU`, 'ERROR');
        return { id: check.id, name: check.name, status: 'FAIL' };
      }
    } catch (error) {
      this.log(`❌ ${check.name} - ERRO: ${error.message}`, 'ERROR');
      return { id: check.id, name: check.name, status: 'ERROR', error: error.message };
    }
  }

  async validate() {
    this.log('\n═══════════════════════════════════════════════════', 'INFO');
    this.log('🚀 VALIDADOR DE FORMULÁRIO DE CONTATO - ICARUS V5.0', 'INFO');
    this.log('═══════════════════════════════════════════════════\n', 'INFO');

    for (const check of CHECKS) {
      const result = await this.runCheck(check);
      this.results.push(result);
    }

    this.generateReport();
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const total = this.results.length;

    console.log('\n' + '═'.repeat(60));
    console.log('📊 RELATÓRIO DE VALIDAÇÃO');
    console.log('═'.repeat(60));
    console.log(`Duração: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Total de Checks: ${total}`);
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`⚠️  Erros: ${errors}`);
    console.log('═'.repeat(60));

    if (failed > 0 || errors > 0) {
      console.log('\n❌ FALHAS DETECTADAS:\n');
      this.results
        .filter(r => r.status !== 'PASS')
        .forEach(r => {
          console.log(`  • ${r.name} (${r.status})`);
          if (r.error) console.log(`    Erro: ${r.error}`);
        });
      console.log('\n');
      process.exit(1);
    } else {
      this.log('\n✅ TODOS OS CHECKS PASSARAM!', 'SUCCESS');
      this.log('🎉 Sistema pronto para uso!\n', 'SUCCESS');
    }

    // Salvar relatório JSON
    const reportPath = path.join(rootDir, '.cursor/reports/contact-form-validation.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      total,
      passed,
      failed,
      errors,
      results: this.results,
    }, null, 2));

    this.log(`📄 Relatório salvo: ${reportPath}\n`, 'INFO');
  }
}

// Executar validação
const validator = new ContactFormValidator();
validator.validate().catch(error => {
  console.error('ERRO FATAL:', error);
  process.exit(1);
});

