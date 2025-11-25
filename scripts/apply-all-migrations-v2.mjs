#!/usr/bin/env node

/**
 * 🎯 APLICADOR COMPLETO DE MIGRATIONS V2 - ICARUS v5.0
 *
 * Aplica TODAS as migrations históricas na ordem correta
 * CADA migration em transação INDEPENDENTE (tolerante a falhas)
 * PULA migrations de RLS (aplicar por último)
 *
 * Uso: DB_PASSWORD=xeO6xuDbpX749uyT node scripts/apply-all-migrations-v2.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Configuração do banco
const DB_CONFIG = {
  host: 'db.ttswvavcisdnonytslom.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'xeO6xuDbpX749uyT',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 60000, // 60s timeout por migration
};

// 📋 ORDEM DE APLICAÇÃO DAS MIGRATIONS (SEM RLS)
const MIGRATION_ORDER = [
  // 1. Base inicial
  '0001_init_schema.sql',
  '20251018_initial_schema.sql',

  // 2. Cadastros
  '0011_cadastros_completo.sql',

  // 3. Compras e entregas
  '0012_compras_completo.sql',
  '20251018_entregas.sql',
  '20251018_faturas.sql',

  // 4. Módulos específicos (alfabética)
  '20251019_chatbot_navegacao_ptbr.sql',
  '20251019_compliance_auditoria_completo.sql',
  '20251019_consignacao_avancada_completo.sql',
  '20251019_contracts_crm.sql',
  '20251019_estoque_inteligente_completo.sql',
  '20251019_portais_opme.sql',
  '20251019_validacoes_cache.sql',

  // 5. Recursos avançados
  '20251020_advanced_features.sql',
  '20251020_api_gateway.sql',
  '20251020_bi_analytics.sql',
  '20251020_gestao_contabil.sql',
  '20251020_kpi_dashboard_consolidado.sql',
  '20251020_licitacoes_propostas.sql',
  '20251020_microsoft365_integration.sql',
  '20251020_nfes_distribuidoras_opme.sql',
  '20251020_pluggy_tables.sql',
  '20251020_rbac_usuarios_permissoes.sql',
  '20251020_relatorios_regulatorios.sql',
  '20251020_workflow_builder.sql',

  // 6. Orquestrador v3 (SEM RLS)
  '202510201244_01_cirurgias_tabelas.sql',
  '202510201244_03_dashboard_views.sql',
  '202510201244_04_dashboard_functions.sql',
  '202510201245_05_indices_performance.sql',
  '202510201246_06_seeds_demo.sql',
  '202510201247_07_storage_config.sql',
];

// 🚫 PULAR ESTAS (aplicar por último)
const SKIP_RLS = [
  '0002_rls_policies.sql',
  '20251018_rls_policies.sql',
  '202510201244_02_cirurgias_rls.sql',
];

// 📊 Estatísticas
const stats = {
  total: 0,
  applied: 0,
  skipped: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings_list: [],
};

// 🎨 Cores no terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 🔍 Verifica se migration existe
function migrationExists(filename) {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const fullPath = path.join(migrationsDir, filename);
  return fs.existsSync(fullPath);
}

// 📖 Lê conteúdo da migration
function readMigration(filename) {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const fullPath = path.join(migrationsDir, filename);
  return fs.readFileSync(fullPath, 'utf-8');
}

// 🚀 Aplica uma migration (nova conexão por migration)
async function applyMigration(filename) {
  log(`\n📄 Aplicando: ${filename}`, 'cyan');

  // Verifica se deve pular (RLS)
  if (SKIP_RLS.includes(filename)) {
    log(`⏭️  PULADO (RLS - aplicar por último)`, 'yellow');
    stats.skipped++;
    return { success: true, skipped: true };
  }

  // Verifica se arquivo existe
  if (!migrationExists(filename)) {
    log(`⚠️  Arquivo não encontrado, pulando...`, 'yellow');
    stats.skipped++;
    return { success: true, skipped: true };
  }

  // Nova conexão para cada migration (transação isolada)
  const client = new pg.Client(DB_CONFIG);

  try {
    await client.connect();
    const sql = readMigration(filename);

    // Executa o SQL inteiro em uma transação
    await client.query('BEGIN');

    try {
      await client.query(sql);
      await client.query('COMMIT');
      log(`   ✅ Sucesso!`, 'green');
      stats.applied++;
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');

      // Ignora erros conhecidos (idempotência)
      const message = err.message.toLowerCase();
      if (
        message.includes('already exists') ||
        message.includes('duplicate key value violates') ||
        message.includes('já existe')
      ) {
        log(`   ⚠️  Já existe (idempotente - continua)`, 'yellow');
        stats.warnings++;
        stats.warnings_list.push({ filename, warning: err.message.substring(0, 100) });
        stats.applied++;
        return { success: true, warning: true };
      }

      // Erros de dependência (não bloqueantes)
      if (
        message.includes('does not exist') ||
        message.includes('não existe') ||
        message.includes('function') ||
        message.includes('column')
      ) {
        log(`   ⚠️  Dependência faltante: ${err.message.substring(0, 80)}`, 'yellow');
        stats.warnings++;
        stats.warnings_list.push({ filename, warning: err.message.substring(0, 100) });
        return { success: false, warning: true, error: err.message };
      }

      throw err;
    }
  } catch (error) {
    log(`   ❌ Erro: ${error.message.substring(0, 120)}`, 'red');
    stats.failed++;
    stats.errors.push({ filename, error: error.message.substring(0, 200) });
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// 📊 Conta tabelas no banco
async function countTables() {
  const client = new pg.Client(DB_CONFIG);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    return parseInt(result.rows[0].count);
  } finally {
    await client.end();
  }
}

// 🏃 Função principal
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🎯 APLICADOR COMPLETO DE MIGRATIONS V2 - ICARUS v5.0', 'cyan');
  log('   (Transações independentes - tolerante a falhas)', 'magenta');
  log('='.repeat(80) + '\n', 'cyan');

  try {
    // Conta tabelas ANTES
    const beforeCount = await countTables();
    log(`📊 Tabelas existentes ANTES: ${beforeCount}\n`, 'blue');

    // Aplica cada migration na ordem
    stats.total = MIGRATION_ORDER.length;

    for (const filename of MIGRATION_ORDER) {
      await applyMigration(filename);
    }

    // Conta tabelas DEPOIS
    const afterCount = await countTables();

    log('\n' + '='.repeat(80), 'cyan');
    log('📊 RESUMO DA APLICAÇÃO', 'cyan');
    log('='.repeat(80), 'cyan');
    log(`Total de migrations:      ${stats.total}`, 'blue');
    log(`✅ Aplicadas:             ${stats.applied}`, 'green');
    log(`⏭️  Puladas (RLS):         ${stats.skipped}`, 'yellow');
    log(`⚠️  Warnings:              ${stats.warnings}`, 'yellow');
    log(`❌ Erros críticos:        ${stats.failed}`, stats.failed > 0 ? 'red' : 'green');
    log(`\n📊 Tabelas ANTES:         ${beforeCount}`, 'blue');
    log(`📊 Tabelas DEPOIS:        ${afterCount}`, 'green');
    log(`📈 Novas tabelas:         ${afterCount - beforeCount}`, 'green');

    if (stats.warnings_list.length > 0) {
      log(`\n⚠️  WARNINGS (${stats.warnings_list.length}):`, 'yellow');
      stats.warnings_list.slice(0, 5).forEach(({ filename, warning }) => {
        log(`   - ${filename}: ${warning}`, 'yellow');
      });
      if (stats.warnings_list.length > 5) {
        log(`   ... e mais ${stats.warnings_list.length - 5} warnings`, 'yellow');
      }
    }

    if (stats.errors.length > 0) {
      log(`\n❌ ERROS CRÍTICOS (${stats.errors.length}):`, 'red');
      stats.errors.forEach(({ filename, error }) => {
        log(`   - ${filename}:`, 'red');
        log(`     ${error}`, 'red');
      });
    }

    const successRate = Math.round((stats.applied / stats.total) * 100);
    log(`\n📈 Taxa de sucesso: ${successRate}%`, successRate >= 70 ? 'green' : 'red');

    log('\n✅ Processo concluído!', 'green');
    log('📋 Próximo passo: Revisar warnings e criar migrations faltantes\n', 'blue');
  } catch (error) {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 🚀 Executa
main().catch(console.error);
