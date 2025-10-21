#!/usr/bin/env node

/**
 * 🔍 MAPEADOR COMPLETO DE SCHEMA - ICARUS v5.0
 * 
 * Gera relatório detalhado do schema atual:
 * - Tabelas (colunas, tipos, constraints)
 * - Enums
 * - Functions
 * - Views
 * - Triggers
 * - Indexes
 * 
 * Uso: DB_PASSWORD=xeO6xuDbpX749uyT node scripts/map-complete-schema.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: 'db.ttswvavcisdnonytslom.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'xeO6xuDbpX749uyT',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
};

async function getTablesList(client) {
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return result.rows.map(r => r.table_name);
}

async function getTableColumns(client, tableName) {
  const result = await client.query(`
    SELECT 
      column_name,
      data_type,
      character_maximum_length,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  return result.rows;
}

async function getEnums(client) {
  const result = await client.query(`
    SELECT 
      t.typname AS enum_name,
      array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname
  `);
  return result.rows;
}

async function getFunctions(client) {
  const result = await client.query(`
    SELECT 
      p.proname AS function_name,
      pg_get_function_result(p.oid) AS return_type,
      pg_get_function_arguments(p.oid) AS arguments
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    ORDER BY p.proname
  `);
  return result.rows;
}

async function getViews(client) {
  const result = await client.query(`
    SELECT table_name AS view_name
    FROM information_schema.views
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  return result.rows;
}

async function getTriggers(client) {
  const result = await client.query(`
    SELECT 
      trigger_name,
      event_object_table AS table_name,
      action_statement,
      action_timing,
      event_manipulation
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name
  `);
  return result.rows;
}

async function getIndexes(client) {
  const result = await client.query(`
    SELECT 
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `);
  return result.rows;
}

async function main() {
  const client = new pg.Client(DB_CONFIG);
  
  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!\n');
    
    // Coleta dados
    const tables = await getTablesList(client);
    const enums = await getEnums(client);
    const functions = await getFunctions(client);
    const views = await getViews(client);
    const triggers = await getTriggers(client);
    const indexes = await getIndexes(client);
    
    // Monta relatório
    let report = `# 📊 Schema Completo - ICARUS v5.0\n\n`;
    report += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
    report += `**Tabelas:** ${tables.length}\n`;
    report += `**ENUMs:** ${enums.length}\n`;
    report += `**Functions:** ${functions.length}\n`;
    report += `**Views:** ${views.length}\n`;
    report += `**Triggers:** ${triggers.length}\n`;
    report += `**Indexes:** ${indexes.length}\n\n`;
    report += `---\n\n`;
    
    // TABELAS
    report += `## 📋 TABELAS (${tables.length})\n\n`;
    for (const tableName of tables) {
      const columns = await getTableColumns(client, tableName);
      report += `### ${tableName}\n\n`;
      report += `| Coluna | Tipo | Nulo | Default |\n`;
      report += `|--------|------|------|--------|\n`;
      for (const col of columns) {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const nullable = col.is_nullable === 'YES' ? 'Sim' : 'Não';
        const defaultVal = col.column_default || '-';
        report += `| ${col.column_name} | ${type} | ${nullable} | ${defaultVal} |\n`;
      }
      report += `\n`;
    }
    
    // ENUMS
    report += `## 🏷️  ENUMS (${enums.length})\n\n`;
    for (const enumType of enums) {
      report += `### ${enumType.enum_name}\n`;
      const values = Array.isArray(enumType.enum_values) ? enumType.enum_values.join(', ') : enumType.enum_values;
      report += `\`\`\`\n${values}\n\`\`\`\n\n`;
    }
    
    // FUNCTIONS
    report += `## ⚙️  FUNCTIONS (${functions.length})\n\n`;
    for (const fn of functions) {
      report += `- **${fn.function_name}**(${fn.arguments || ''}) → ${fn.return_type}\n`;
    }
    report += `\n`;
    
    // VIEWS
    report += `## 👁️  VIEWS (${views.length})\n\n`;
    for (const view of views) {
      report += `- ${view.view_name}\n`;
    }
    report += `\n`;
    
    // TRIGGERS
    report += `## 🔔 TRIGGERS (${triggers.length})\n\n`;
    const triggersByTable = {};
    for (const trigger of triggers) {
      if (!triggersByTable[trigger.table_name]) {
        triggersByTable[trigger.table_name] = [];
      }
      triggersByTable[trigger.table_name].push(trigger);
    }
    for (const [table, trgList] of Object.entries(triggersByTable)) {
      report += `### ${table}\n`;
      for (const trg of trgList) {
        report += `- **${trg.trigger_name}**: ${trg.action_timing} ${trg.event_manipulation}\n`;
      }
      report += `\n`;
    }
    
    // INDEXES
    report += `## 🔍 INDEXES (${indexes.length})\n\n`;
    const indexesByTable = {};
    for (const idx of indexes) {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx);
    }
    for (const [table, idxList] of Object.entries(indexesByTable)) {
      report += `### ${table}\n`;
      for (const idx of idxList) {
        report += `- ${idx.indexname}\n`;
      }
      report += `\n`;
    }
    
    // Salva relatório
    const outputPath = path.join(__dirname, '..', 'docs', 'infra', 'schema-completo.md');
    fs.writeFileSync(outputPath, report);
    
    console.log(`✅ Relatório salvo em: ${outputPath}`);
    console.log(`\n📊 Resumo:`);
    console.log(`   - Tabelas: ${tables.length}`);
    console.log(`   - ENUMs: ${enums.length}`);
    console.log(`   - Functions: ${functions.length}`);
    console.log(`   - Views: ${views.length}`);
    console.log(`   - Triggers: ${triggers.length}`);
    console.log(`   - Indexes: ${indexes.length}`);
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);

