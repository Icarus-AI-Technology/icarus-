#!/usr/bin/env node

/**
 * System Diagnostics
 * Diagnóstico completo do sistema Icarus v5.0
 */

const fs = require('fs');
const path = require('path');

class SystemDiagnostics {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.info = [];
  }

  async runDiagnostics() {
    console.log('🔍 Executando diagnóstico completo do sistema...\n');

    await this.checkEnvironment();
    await this.checkDatabase();
    await this.checkIntegrations();
    await this.checkPerformance();
    await this.checkSecurity();
    
    this.generateReport();
  }

  async checkEnvironment() {
    console.log('🌍 Verificando ambiente...');

    const envFile = path.join(process.cwd(), '.env');
    const envExampleFile = path.join(process.cwd(), '.env.example');

    if (!fs.existsSync(envFile)) {
      this.issues.push({
        category: 'environment',
        severity: 'critico',
        message: 'Arquivo .env não encontrado',
        action: 'Criar arquivo .env baseado em .env.example'
      });
    }

    // Verifica variáveis críticas
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const criticalVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'DATABASE_URL'
      ];

      criticalVars.forEach(varName => {
        if (!envContent.includes(varName)) {
          this.warnings.push({
            category: 'environment',
            severity: 'medio',
            message: `Variável ${varName} não configurada`,
            action: `Adicionar ${varName} ao arquivo .env`
          });
        }
      });
    }

    this.info.push({
      category: 'environment',
      message: 'Node.js version: ' + process.version
    });
  }

  async checkDatabase() {
    console.log('🗄️  Verificando banco de dados...');

    const migrationsDir = path.join(process.cwd(), 'supabase/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      this.issues.push({
        category: 'database',
        severity: 'critico',
        message: 'Diretório de migrations não encontrado',
        action: 'Criar estrutura de migrations do Supabase'
      });
    } else {
      const migrations = fs.readdirSync(migrationsDir);
      this.info.push({
        category: 'database',
        message: `${migrations.length} migrations encontradas`
      });

      // Verifica migrations críticas
      const criticalTables = ['empresas', 'usuarios', 'produtos', 'cirurgias', 'faturamento'];
      const hasCriticalMigrations = criticalTables.every(table => 
        migrations.some(m => m.toLowerCase().includes(table))
      );

      if (!hasCriticalMigrations) {
        this.warnings.push({
          category: 'database',
          severity: 'medio',
          message: 'Algumas tabelas críticas podem estar faltando',
          action: 'Verificar migrations de tabelas core'
        });
      }
    }
  }

  async checkIntegrations() {
    console.log('🔌 Verificando integrações...');

    const integrations = [
      { name: 'SEFAZ/NF-e', path: 'src/lib/integrations/sefaz' },
      { name: 'ANS/TISS', path: 'src/lib/integrations/ans' },
      { name: 'ANVISA', path: 'src/lib/compliance/anvisa' }
    ];

    integrations.forEach(integration => {
      const integrationPath = path.join(process.cwd(), integration.path);
      if (!fs.existsSync(integrationPath)) {
        this.warnings.push({
          category: 'integrations',
          severity: 'medio',
          message: `Integração ${integration.name} não encontrada`,
          action: `Implementar integração ${integration.name} em ${integration.path}`
        });
      } else {
        this.info.push({
          category: 'integrations',
          message: `✅ ${integration.name} implementada`
        });
      }
    });
  }

  async checkPerformance() {
    console.log('⚡ Verificando performance...');

    // Verifica tamanho do bundle (se existir)
    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      const totalSize = this.calculateDirectorySize(distDir);
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      
      this.info.push({
        category: 'performance',
        message: `Tamanho do bundle: ${sizeMB} MB`
      });

      if (totalSize > 5 * 1024 * 1024) { // > 5MB
        this.warnings.push({
          category: 'performance',
          severity: 'baixo',
          message: 'Bundle size grande (> 5MB)',
          action: 'Considerar code splitting e lazy loading'
        });
      }
    }

    // Verifica uso de indexação no Supabase
    this.info.push({
      category: 'performance',
      message: 'Recomendado: revisar índices de tabelas com queries frequentes'
    });
  }

  async checkSecurity() {
    console.log('🔒 Verificando segurança...');

    // Verifica políticas RLS
    const migrationsDir = path.join(process.cwd(), 'supabase/migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir);
      const rlsPolicies = migrations.filter(m => m.includes('rls') || m.includes('policies'));
      
      if (rlsPolicies.length === 0) {
        this.issues.push({
          category: 'security',
          severity: 'critico',
          message: 'Nenhuma política RLS encontrada',
          action: 'Implementar Row Level Security em todas as tabelas sensíveis'
        });
      } else {
        this.info.push({
          category: 'security',
          message: `✅ ${rlsPolicies.length} políticas RLS encontradas`
        });
      }
    }

    // Verifica .env no .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env')) {
        this.issues.push({
          category: 'security',
          severity: 'critico',
          message: '.env não está no .gitignore',
          action: 'Adicionar .env ao .gitignore imediatamente'
        });
      }
    }
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }

  generateReport() {
    console.log('\n\n🏥 Relatório de Diagnóstico - Icarus v5.0');
    console.log('='.repeat(70));

    // Issues críticos
    if (this.issues.length > 0) {
      console.log('\n🔴 PROBLEMAS CRÍTICOS\n');
      console.log('-'.repeat(70));
      this.issues.forEach((issue, i) => {
        console.log(`\n${i + 1}. [${issue.category.toUpperCase()}] ${issue.message}`);
        console.log(`   Ação: ${issue.action}`);
      });
    } else {
      console.log('\n✅ Nenhum problema crítico encontrado!');
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n\n🟡 AVISOS\n');
      console.log('-'.repeat(70));
      this.warnings.forEach((warning, i) => {
        console.log(`${i + 1}. [${warning.category.toUpperCase()}] ${warning.message}`);
      });
    }

    // Info
    if (this.info.length > 0) {
      console.log('\n\nℹ️  INFORMAÇÕES\n');
      console.log('-'.repeat(70));
      this.info.forEach((info, i) => {
        console.log(`${i + 1}. [${info.category.toUpperCase()}] ${info.message}`);
      });
    }

    // Score
    const score = this.calculateScore();
    console.log('\n\n📊 SCORE DE SAÚDE DO SISTEMA');
    console.log('='.repeat(70));
    console.log(`Score: ${score}%`);
    console.log(`Status: ${this.getHealthStatus(score)}`);

    this.saveReport();
  }

  calculateScore() {
    const criticalPenalty = this.issues.length * 20;
    const warningPenalty = this.warnings.length * 5;
    return Math.max(0, 100 - criticalPenalty - warningPenalty);
  }

  getHealthStatus(score) {
    if (score >= 90) return '🟢 Excelente';
    if (score >= 70) return '🟡 Bom';
    if (score >= 50) return '🟠 Atenção';
    return '🔴 Crítico';
  }

  saveReport() {
    const outputDir = path.join(process.cwd(), 'docs', 'tutor');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      score: this.calculateScore(),
      status: this.getHealthStatus(this.calculateScore()),
      issues: this.issues,
      warnings: this.warnings,
      info: this.info
    };

    const outputFile = path.join(outputDir, 'system-diagnostics.json');
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);
  }

  async run() {
    console.log('🩺 Diagnóstico do Sistema - Icarus v5.0\n');
    await this.runDiagnostics();
    
    return {
      score: this.calculateScore(),
      issues: this.issues,
      warnings: this.warnings,
      info: this.info
    };
  }
}

if (require.main === module) {
  const diagnostics = new SystemDiagnostics();
  diagnostics.run().catch(console.error);
}

module.exports = SystemDiagnostics;

