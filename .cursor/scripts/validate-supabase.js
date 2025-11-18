#!/usr/bin/env node

/**
 * VALIDAÇÃO RÁPIDA - SUPABASE
 * Valida conexão e estrutura básica do Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SupabaseValidator {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      status: 'INICIANDO',
      checks: {}
    };
  }

  log(message, level = 'INFO') {
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      WARNING: '\x1b[33m',
      ERROR: '\x1b[31m'
    };
    const color = colors[level] || '\x1b[0m';
    console.log(`${color}[${level}] ${message}\x1b[0m`);
  }

  async validate() {
    console.log('\n🔍 VALIDAÇÃO RÁPIDA - SUPABASE\n');
    console.log('='.repeat(60));
    console.log('\n');

    // 1. Check Environment Variables
    await this.checkEnvVars();
    
    // 2. Test Connection
    await this.testConnection();
    
    // 3. Check Tables (se conectado)
    if (this.supabase) {
      await this.checkTables();
      await this.checkStorage();
    }
    
    // 4. Generate Report
    this.generateReport();
  }

  async checkEnvVars() {
    this.log('Verificando variáveis de ambiente...', 'INFO');
    
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    
    this.report.checks.envVars = {
      url: url ? '✅ PRESENTE' : '❌ FALTANDO',
      key: key ? '✅ PRESENTE' : '❌ FALTANDO',
      urlValid: url && url.includes('supabase.co'),
      keyValid: key && key.length > 100
    };

    if (!url || !key) {
      this.log('❌ Variáveis de ambiente não configuradas', 'ERROR');
      this.log('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY', 'ERROR');
      this.report.status = 'FAILED';
      return false;
    }

    if (!url.includes('supabase.co')) {
      this.log('⚠️  URL do Supabase parece inválida', 'WARNING');
      this.log(`URL atual: ${url}`, 'WARNING');
    }

    this.log('✅ Variáveis de ambiente presentes', 'SUCCESS');
    return true;
  }

  async testConnection() {
    this.log('Testando conexão com Supabase...', 'INFO');
    
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      this.report.checks.connection = {
        status: '❌ FAILED',
        reason: 'Environment variables not set'
      };
      return false;
    }

    try {
      this.supabase = createClient(url, key);
      
      // Test simple query
      const { data, error } = await this.supabase
        .from('patients')
        .select('count')
        .limit(1);

      if (error) {
        // Se erro for "relation does not exist", tabela ainda não foi criada
        if (error.message.includes('does not exist')) {
          this.log('⚠️  Tabela "patients" não existe - executar migrations', 'WARNING');
          this.report.checks.connection = {
            status: '✅ CONNECTED',
            warning: 'Tables not created yet'
          };
          return true;
        }

        throw error;
      }

      this.log('✅ Conexão com Supabase estabelecida', 'SUCCESS');
      this.report.checks.connection = {
        status: '✅ SUCCESS',
        timestamp: new Date().toISOString()
      };
      return true;

    } catch (error) {
      this.log(`❌ Erro ao conectar: ${error.message}`, 'ERROR');
      this.report.checks.connection = {
        status: '❌ FAILED',
        error: error.message
      };
      return false;
    }
  }

  async checkTables() {
    this.log('Verificando tabelas...', 'INFO');
    
    const expectedTables = [
      'patients',
      'appointments',
      'transactions',
      'audit_logs',
      'notifications'
    ];

    const tableStatus = {};

    for (const table of expectedTables) {
      try {
        const { error } = await this.supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          if (error.message.includes('does not exist')) {
            tableStatus[table] = '❌ NÃO EXISTE';
            this.log(`⚠️  Tabela "${table}" não existe`, 'WARNING');
          } else if (error.message.includes('permission denied')) {
            tableStatus[table] = '⚠️ SEM PERMISSÃO (RLS?)';
            this.log(`⚠️  Sem permissão para "${table}" - verificar RLS`, 'WARNING');
          } else {
            tableStatus[table] = `❌ ERRO: ${error.message}`;
            this.log(`❌ Erro em "${table}": ${error.message}`, 'ERROR');
          }
        } else {
          tableStatus[table] = '✅ OK';
          this.log(`✅ Tabela "${table}" acessível`, 'SUCCESS');
        }
      } catch (err) {
        tableStatus[table] = `❌ ERRO: ${err.message}`;
        this.log(`❌ Erro ao verificar "${table}": ${err.message}`, 'ERROR');
      }
    }

    this.report.checks.tables = tableStatus;
  }

  async checkStorage() {
    this.log('Verificando storage buckets...', 'INFO');
    
    const expectedBuckets = [
      'patient-documents',
      'profile-images',
      'reports'
    ];

    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();

      if (error) {
        this.log(`⚠️  Erro ao listar buckets: ${error.message}`, 'WARNING');
        this.report.checks.storage = {
          status: '⚠️ ERROR',
          error: error.message
        };
        return;
      }

      const bucketNames = buckets.map(b => b.name);
      const bucketStatus = {};

      for (const bucket of expectedBuckets) {
        if (bucketNames.includes(bucket)) {
          bucketStatus[bucket] = '✅ EXISTS';
          this.log(`✅ Bucket "${bucket}" existe`, 'SUCCESS');
        } else {
          bucketStatus[bucket] = '❌ NOT FOUND';
          this.log(`⚠️  Bucket "${bucket}" não encontrado`, 'WARNING');
        }
      }

      this.report.checks.storage = {
        status: '✅ CHECKED',
        buckets: bucketStatus,
        total: buckets.length
      };

    } catch (err) {
      this.log(`❌ Erro ao verificar storage: ${err.message}`, 'ERROR');
      this.report.checks.storage = {
        status: '❌ FAILED',
        error: err.message
      };
    }
  }

  generateReport() {
    this.log('Gerando relatório...', 'INFO');
    
    // Determinar status geral
    let overallStatus = '✅ OK';
    let criticalIssues = 0;
    let warnings = 0;

    if (this.report.checks.envVars) {
      if (this.report.checks.envVars.url === '❌ FALTANDO' || 
          this.report.checks.envVars.key === '❌ FALTANDO') {
        criticalIssues++;
        overallStatus = '❌ FAILED';
      }
    }

    if (this.report.checks.connection) {
      if (this.report.checks.connection.status === '❌ FAILED') {
        criticalIssues++;
        overallStatus = '❌ FAILED';
      } else if (this.report.checks.connection.warning) {
        warnings++;
        if (overallStatus === '✅ OK') {
          overallStatus = '⚠️ WARNING';
        }
      }
    }

    if (this.report.checks.tables) {
      Object.values(this.report.checks.tables).forEach(status => {
        if (status.startsWith('❌')) {
          warnings++;
        } else if (status.startsWith('⚠️')) {
          warnings++;
        }
      });
      if (warnings > 0 && overallStatus === '✅ OK') {
        overallStatus = '⚠️ WARNING';
      }
    }

    this.report.status = overallStatus;
    this.report.summary = {
      overallStatus,
      criticalIssues,
      warnings,
      recommendations: []
    };

    // Adicionar recomendações
    if (criticalIssues > 0) {
      this.report.summary.recommendations.push(
        'Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
      );
    }

    if (warnings > 0) {
      this.report.summary.recommendations.push(
        'Execute as migrations: pnpm run db:migrate',
        'Verifique RLS policies no Supabase Dashboard',
        'Crie os storage buckets necessários'
      );
    }

    // Salvar relatório
    const reportsDir = path.join(process.cwd(), '.cursor/reports/audit-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `supabase-validation-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));

    // Console output
    console.log('\n');
    console.log('='.repeat(60));
    console.log('📊 RESUMO DA VALIDAÇÃO SUPABASE');
    console.log('='.repeat(60));
    console.log('');
    console.log(`Status Geral:         ${overallStatus}`);
    console.log(`Issues Críticas:      ${criticalIssues}`);
    console.log(`Warnings:             ${warnings}`);
    console.log('');
    
    if (this.report.summary.recommendations.length > 0) {
      console.log('📋 RECOMENDAÇÕES:');
      this.report.summary.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
      console.log('');
    }
    
    console.log('='.repeat(60));
    console.log(`\n📄 Relatório completo salvo: ${reportPath}\n`);
    
    // Status final
    if (overallStatus === '✅ OK') {
      console.log('✅ SUPABASE VALIDADO COM SUCESSO\n');
    } else if (overallStatus === '⚠️ WARNING') {
      console.log('⚠️  SUPABASE CONECTADO - CONFIGURAÇÃO INCOMPLETA\n');
    } else {
      console.log('❌ FALHA NA VALIDAÇÃO SUPABASE\n');
    }
  }
}

// Executar validação
const validator = new SupabaseValidator();
validator.validate().catch(error => {
  console.error('❌ ERRO NA VALIDAÇÃO:', error);
  process.exit(1);
});

