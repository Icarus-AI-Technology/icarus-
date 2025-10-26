// 3.3-triggers-constraints.mjs
// Subagente 3.3: Triggers & Constraints - Validar triggers e constraints
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('⚙️ Subagente 3.3: Auditando Triggers & Constraints...\n');

// Triggers esperados
const EXPECTED_TRIGGERS = [
  { name: 'update_updated_at', table: 'cirurgias', event: 'UPDATE' },
  { name: 'audit_log_insert', table: 'cirurgias', event: 'INSERT' },
  { name: 'audit_log_update', table: 'cirurgias', event: 'UPDATE' },
  { name: 'audit_log_delete', table: 'cirurgias', event: 'DELETE' },
  { name: 'calcular_total_cirurgia', table: 'cirurgias', event: 'INSERT' },
  { name: 'atualizar_estoque', table: 'consignacao_materiais', event: 'INSERT' },
  { name: 'validar_consignacao', table: 'consignacao_materiais', event: 'INSERT' },
  { name: 'atualizar_fluxo_caixa', table: 'contas_receber', event: 'UPDATE' },
  { name: 'calcular_abbott_score', table: 'compliance_requisitos_abbott', event: 'UPDATE' },
  { name: 'notificar_estoque_baixo', table: 'estoque', event: 'UPDATE' },
  { name: 'rastrear_opme', table: 'produtos_opme', event: 'INSERT' },
  { name: 'validar_rastreabilidade', table: 'rastreabilidade_opme', event: 'INSERT' }
];

/**
 * @typedef {Object} TriggerAudit
 * @property {string} trigger_name
 * @property {string} table_name
 * @property {string} event
 * @property {string} [timing]
 * @property {string} [function_name]
 * @property {boolean} found_in_migrations
 * @property {string[]} issues
 */

/**
 * @typedef {Object} ConstraintAudit
 * @property {string} constraint_name
 * @property {string} table_name
 * @property {string} constraint_type
 * @property {string} [definition]
 * @property {string[]} issues
 */

/**
 * Analisa arquivos de migração SQL para encontrar triggers e constraints
 */
async function analyzeMigrations() {
  const migrationsPath = path.join(__dirname, '../../../../supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .map(f => path.join(migrationsPath, f));

  console.log(`📁 Analisando ${migrationFiles.length} arquivos de migração...\n`);

  const triggersFound = new Map();
  const constraintsFound = [];

  for (const file of migrationFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Encontrar declarações CREATE TRIGGER
    const createTriggerRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+([a-zA-Z0-9_]+)\s+(BEFORE|AFTER)\s+(INSERT|UPDATE|DELETE)(?:\s+OR\s+(INSERT|UPDATE|DELETE))?\s+ON\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
    let match;

    while ((match = createTriggerRegex.exec(content)) !== null) {
      const triggerName = match[1].toLowerCase();
      const timing = match[2];
      const event1 = match[3];
      const event2 = match[4];
      const tableName = match[5].toLowerCase();
      
      const events = [event1];
      if (event2) events.push(event2);

      for (const event of events) {
        const key = `${triggerName}_${tableName}_${event}`;
        if (!triggersFound.has(key)) {
          triggersFound.set(key, {
            trigger_name: triggerName,
            table_name: tableName,
            event: event,
            timing: timing,
            found_in_migrations: true,
            issues: []
          });
        }

        // Procurar função associada
        const triggerDef = content.substring(match.index, content.indexOf(';', match.index) + 1);
        const funcMatch = triggerDef.match(/EXECUTE\s+(?:PROCEDURE|FUNCTION)\s+([a-zA-Z0-9_]+)/i);
        const trigger = triggersFound.get(key);
        if (funcMatch) {
          trigger.function_name = funcMatch[1];
        } else {
          trigger.issues.push('Função do trigger não encontrada');
        }
      }
    }

    // Encontrar ALTER TABLE constraints
    const alterTableRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ADD\s+CONSTRAINT\s+([a-zA-Z0-9_]+)\s+(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\s*\(([^)]+)\)/gi;
    while ((match = alterTableRegex.exec(content)) !== null) {
      const tableName = match[1].toLowerCase();
      const constraintName = match[2].toLowerCase();
      const constraintType = match[3].toUpperCase();
      const definition = match[4];

      constraintsFound.push({
        constraint_name: constraintName,
        table_name: tableName,
        constraint_type: constraintType,
        definition: definition,
        issues: []
      });
    }

    // Encontrar constraints inline em CREATE TABLE
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\((.*?)\);/gis;
    while ((match = createTableRegex.exec(content)) !== null) {
      const tableName = match[1].toLowerCase();
      const tableDef = match[2];

      // PRIMARY KEY
      const pkMatches = tableDef.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/gi);
      if (pkMatches) {
        pkMatches.forEach((pk, i) => {
          constraintsFound.push({
            constraint_name: `${tableName}_pkey`,
            table_name: tableName,
            constraint_type: 'PRIMARY KEY',
            definition: pk,
            issues: []
          });
        });
      }

      // FOREIGN KEY
      const fkMatches = tableDef.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/gi);
      if (fkMatches) {
        fkMatches.forEach((fk, i) => {
          constraintsFound.push({
            constraint_name: `${tableName}_fk_${i}`,
            table_name: tableName,
            constraint_type: 'FOREIGN KEY',
            definition: fk,
            issues: []
          });
        });
      }

      // UNIQUE
      const uniqueMatches = tableDef.match(/UNIQUE\s*\(([^)]+)\)/gi);
      if (uniqueMatches) {
        uniqueMatches.forEach((unique, i) => {
          constraintsFound.push({
            constraint_name: `${tableName}_unique_${i}`,
            table_name: tableName,
            constraint_type: 'UNIQUE',
            definition: unique,
            issues: []
          });
        });
      }

      // CHECK
      const checkMatches = tableDef.match(/CHECK\s*\(([^)]+)\)/gi);
      if (checkMatches) {
        checkMatches.forEach((check, i) => {
          constraintsFound.push({
            constraint_name: `${tableName}_check_${i}`,
            table_name: tableName,
            constraint_type: 'CHECK',
            definition: check,
            issues: []
          });
        });
      }
    }
  }

  return { triggersFound, constraintsFound };
}

/**
 * Executa auditoria completa de Triggers e Constraints
 */
async function auditTriggersAndConstraints() {
  const { triggersFound, constraintsFound } = await analyzeMigrations();
  
  const triggersList = Array.from(triggersFound.values());

  console.log('🔔 Triggers:\n');
  
  // Verificar triggers esperados
  const missingTriggers = [];
  for (const expected of EXPECTED_TRIGGERS) {
    const found = triggersList.find(
      t => t.trigger_name.includes(expected.name) && t.table_name === expected.table
    );
    
    if (found) {
      console.log(`✅ ${expected.name} (${expected.table})`);
      if (found.issues.length > 0) {
        found.issues.forEach(issue => console.log(`   ⚠️ ${issue}`));
      }
    } else {
      console.log(`❌ ${expected.name} (${expected.table}) - AUSENTE`);
      missingTriggers.push(expected);
    }
  }

  // Listar triggers adicionais
  const additionalTriggers = triggersList.filter(
    t => !EXPECTED_TRIGGERS.find(e => t.trigger_name.includes(e.name))
  );

  if (additionalTriggers.length > 0) {
    console.log(`\n➕ Triggers adicionais encontrados: ${additionalTriggers.length}`);
    additionalTriggers.slice(0, 5).forEach(t => {
      console.log(`   - ${t.trigger_name} ON ${t.table_name} (${t.event})`);
    });
    if (additionalTriggers.length > 5) {
      console.log(`   ... e mais ${additionalTriggers.length - 5}`);
    }
  }

  console.log(`\n📊 Resumo Triggers:`);
  console.log(`Total encontrados: ${triggersList.length}`);
  console.log(`Esperados presentes: ${EXPECTED_TRIGGERS.length - missingTriggers.length}/${EXPECTED_TRIGGERS.length}`);
  console.log(`Adicionais: ${additionalTriggers.length}`);

  // Constraints
  console.log(`\n🔗 Constraints:\n`);
  
  const pkCount = constraintsFound.filter(c => c.constraint_type === 'PRIMARY KEY').length;
  const fkCount = constraintsFound.filter(c => c.constraint_type === 'FOREIGN KEY').length;
  const uniqueCount = constraintsFound.filter(c => c.constraint_type === 'UNIQUE').length;
  const checkCount = constraintsFound.filter(c => c.constraint_type === 'CHECK').length;

  console.log(`Total: ${constraintsFound.length}`);
  console.log(`Primary Keys: ${pkCount}`);
  console.log(`Foreign Keys: ${fkCount}`);
  console.log(`Unique: ${uniqueCount}`);
  console.log(`Check: ${checkCount}`);

  // Top tabelas com mais constraints
  const tableConstraints = constraintsFound.reduce((acc, c) => {
    acc[c.table_name] = (acc[c.table_name] || 0) + 1;
    return acc;
  }, {});

  const topTables = Object.entries(tableConstraints)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`\nTop 10 Tabelas com mais Constraints:`);
  topTables.forEach(([table, count], i) => {
    console.log(`  ${i + 1}. ${table}: ${count} constraints`);
  });

  // Calcular score
  const triggersWorking = EXPECTED_TRIGGERS.length - missingTriggers.length;
  const score = Math.round(
    (triggersWorking / EXPECTED_TRIGGERS.length) * 60 +
    (constraintsFound.length >= 100 ? 40 : (constraintsFound.length / 100) * 40)
  );

  console.log(`\n✅ Score: ${score}/100\n`);

  return {
    triggers: triggersList,
    constraints: constraintsFound,
    missingTriggers: missingTriggers.map(t => t.name),
    triggersWorking,
    pkCount,
    fkCount,
    uniqueCount,
    checkCount,
    score
  };
}

// Executar
const results = await auditTriggersAndConstraints();

// Salvar
const outputPath = path.join(__dirname, '3.3-results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`💾 Resultados salvos em: ${outputPath}`);

export default results;

