// 3.1-schema-tables.mjs
// Subagente 3.1: Schema & Tabelas - Auditar 100+ tabelas
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗄️ Subagente 3.1: Auditando Schema & Tabelas...\n');

// Tabelas críticas que DEVEM existir
const CRITICAL_TABLES = [
  'empresas',
  'profiles',
  'cirurgias',
  'estoque',
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'contas_receber',
  'contas_pagar',
  'fluxo_caixa',
  'transportadoras',
  'compliance_requisitos_abbott'
];

/**
 * @typedef {Object} TableAudit
 * @property {string} table_name
 * @property {string} schema
 * @property {boolean} found_in_migrations
 * @property {boolean} has_pk
 * @property {number} columns
 * @property {number} foreign_keys
 * @property {number} indexes
 * @property {number} constraints
 * @property {string[]} issues
 */

/**
 * Analisa arquivos de migração SQL para extrair informações sobre tabelas
 */
async function analyzeMigrations() {
  const migrationsPath = path.join(__dirname, '../../../../supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .map(f => path.join(migrationsPath, f));

  console.log(`📁 Analisando ${migrationFiles.length} arquivos de migração...\n`);

  const tablesFound = new Map();

  for (const file of migrationFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Encontrar declarações CREATE TABLE
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(/gi;
    let match;

    while ((match = createTableRegex.exec(content)) !== null) {
      const tableName = match[1].toLowerCase();
      
      if (!tablesFound.has(tableName)) {
        tablesFound.set(tableName, {
          table_name: tableName,
          schema: 'public',
          found_in_migrations: true,
          has_pk: false,
          columns: 0,
          foreign_keys: 0,
          indexes: 0,
          constraints: 0,
          issues: []
        });
      }

      // Extrair definição completa da tabela
      const tableDefMatch = content.match(
        new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?${tableName}\\s*\\([^;]*\\);`, 'is')
      );

      if (tableDefMatch) {
        const tableDef = tableDefMatch[0];
        const audit = tablesFound.get(tableName);

        // Contar colunas (linhas que não são comentários nem constraints)
        const lines = tableDef.split('\n');
        let columnCount = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && 
              !trimmed.startsWith('--') && 
              !trimmed.startsWith('CREATE') &&
              !trimmed.startsWith('PRIMARY KEY') &&
              !trimmed.startsWith('FOREIGN KEY') &&
              !trimmed.startsWith('CONSTRAINT') &&
              !trimmed.startsWith('UNIQUE') &&
              !trimmed.startsWith('CHECK') &&
              !trimmed.endsWith(');')) {
            if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s+/)) {
              columnCount++;
            }
          }
        }
        audit.columns = columnCount;

        // Verificar Primary Key
        audit.has_pk = /PRIMARY\s+KEY/i.test(tableDef);

        // Contar Foreign Keys
        const fkMatches = tableDef.match(/FOREIGN\s+KEY|REFERENCES/gi);
        audit.foreign_keys = fkMatches ? fkMatches.length : 0;

        // Contar Constraints
        const constraintMatches = tableDef.match(/CONSTRAINT|CHECK|UNIQUE/gi);
        audit.constraints = constraintMatches ? constraintMatches.length : 0;

        // Validações
        if (!audit.has_pk) {
          audit.issues.push('Tabela sem Primary Key');
        }

        if (audit.columns === 0) {
          audit.issues.push('Não foi possível detectar colunas');
        }

        if (tableName.includes('empresa') && audit.columns < 5) {
          audit.issues.push('Tabela de empresa com poucas colunas');
        }
      }
    }

    // Procurar por CREATE INDEX
    const createIndexRegex = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?[a-zA-Z0-9_]+\s+ON\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
    while ((match = createIndexRegex.exec(content)) !== null) {
      const tableName = match[1].toLowerCase();
      if (tablesFound.has(tableName)) {
        const table = tablesFound.get(tableName);
        table.indexes++;
      }
    }
  }

  return tablesFound;
}

/**
 * Executa auditoria completa de tabelas
 */
async function auditAllTables() {
  const tables = await analyzeMigrations();
  const tablesList = Array.from(tables.values());

  console.log('📊 Resumo das Tabelas Encontradas:\n');

  // Tabelas críticas
  const missingCritical = CRITICAL_TABLES.filter(
    critical => !tables.has(critical)
  );

  if (missingCritical.length > 0) {
    console.log('❌ Tabelas críticas AUSENTES:');
    missingCritical.forEach(table => console.log(`  - ${table}`));
    console.log('');
  } else {
    console.log('✅ Todas as tabelas críticas estão presentes\n');
  }

  // Estatísticas gerais
  const tablesWithPK = tablesList.filter(t => t.has_pk).length;
  const tablesWithFK = tablesList.filter(t => t.foreign_keys > 0).length;
  const tablesWithIssues = tablesList.filter(t => t.issues.length > 0).length;

  console.log('📊 Estatísticas Gerais:');
  console.log(`Total de tabelas: ${tablesList.length}`);
  console.log(`Com Primary Key: ${tablesWithPK}/${tablesList.length}`);
  console.log(`Com Foreign Keys: ${tablesWithFK}/${tablesList.length}`);
  console.log(`Com issues: ${tablesWithIssues}/${tablesList.length}`);
  console.log('');

  // Listar tabelas com issues
  if (tablesWithIssues > 0) {
    console.log('⚠️ Tabelas com Issues:');
    tablesList
      .filter(t => t.issues.length > 0)
      .forEach(table => {
        console.log(`\n  ${table.table_name}:`);
        table.issues.forEach(issue => console.log(`    - ${issue}`));
      });
    console.log('');
  }

  // Top 10 tabelas por complexidade (colunas + FKs + constraints)
  console.log('🏆 Top 10 Tabelas Mais Complexas:');
  const sortedByComplexity = [...tablesList]
    .sort((a, b) => {
      const scoreA = a.columns + a.foreign_keys * 2 + a.constraints + a.indexes;
      const scoreB = b.columns + b.foreign_keys * 2 + b.constraints + b.indexes;
      return scoreB - scoreA;
    })
    .slice(0, 10);

  sortedByComplexity.forEach((table, i) => {
    const score = table.columns + table.foreign_keys * 2 + table.constraints + table.indexes;
    console.log(`  ${i + 1}. ${table.table_name} (score: ${score}) - ${table.columns} cols, ${table.foreign_keys} FKs, ${table.indexes} indexes`);
  });

  // Calcular score
  const score = Math.round(
    (tablesList.length >= 100 ? 30 : (tablesList.length / 100) * 30) +
    (missingCritical.length === 0 ? 40 : Math.max(0, 40 - missingCritical.length * 5)) +
    ((tablesWithPK / tablesList.length) * 30)
  );

  console.log(`\n✅ Score: ${score}/100\n`);

  return {
    tables: tablesList,
    missingCritical,
    totalTables: tablesList.length,
    tablesWithIssues,
    tablesWithPK,
    tablesWithFK,
    score
  };
}

// Executar
const results = await auditAllTables();

// Salvar
const outputPath = path.join(__dirname, '3.1-results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`💾 Resultados salvos em: ${outputPath}`);

// Exportar para usar no consolidador
export default results;

