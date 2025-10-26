// 3.2-rpc-views.mjs
// Subagente 3.2: RPC & Views - Analisar funções e views
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Subagente 3.2: Auditando RPCs & Views...\n');

// RPC Functions esperadas
const EXPECTED_RPCS = [
  { name: 'get_dashboard_kpis', params: ['empresa_id'] },
  { name: 'get_cirurgias_mes', params: ['empresa_id', 'mes', 'ano'] },
  { name: 'calcular_comissao', params: ['cirurgia_id'] },
  { name: 'get_estoque_baixo', params: ['empresa_id'] },
  { name: 'atualizar_status_cirurgia', params: ['cirurgia_id', 'novo_status'] },
  { name: 'get_fluxo_caixa_projecao', params: ['empresa_id', 'dias'] },
  { name: 'get_top_produtos', params: ['empresa_id', 'limit'] },
  { name: 'validar_consignacao', params: ['consignacao_id'] },
  { name: 'calcular_abbott_score', params: ['empresa_id'] },
  { name: 'get_compliance_status', params: ['empresa_id'] },
  { name: 'search_cirurgias', params: ['empresa_id', 'query'] },
  { name: 'get_rastreabilidade', params: ['produto_id'] },
  { name: 'get_metricas_financeiras', params: ['empresa_id', 'periodo'] },
  { name: 'otimizar_rota', params: ['origem', 'destino'] },
  { name: 'get_alertas_criticos', params: ['empresa_id'] }
];

/**
 * @typedef {Object} RPCAudit
 * @property {string} function_name
 * @property {string[]} expected_parameters
 * @property {boolean} found_in_migrations
 * @property {string} [return_type]
 * @property {string} [language]
 * @property {string[]} issues
 */

/**
 * @typedef {Object} ViewAudit
 * @property {string} view_name
 * @property {boolean} is_materialized
 * @property {boolean} found_in_migrations
 * @property {number} columns
 * @property {string[]} issues
 */

/**
 * Analisa arquivos de migração SQL para encontrar funções e views
 */
async function analyzeMigrations() {
  const migrationsPath = path.join(__dirname, '../../../../supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .map(f => path.join(migrationsPath, f));

  console.log(`📁 Analisando ${migrationFiles.length} arquivos de migração...\n`);

  const rpcsFound = new Map();
  const viewsFound = new Map();

  for (const file of migrationFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Encontrar declarações CREATE FUNCTION
    const createFunctionRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)/gi;
    let match;

    while ((match = createFunctionRegex.exec(content)) !== null) {
      const funcName = match[1].toLowerCase();
      const params = match[2];
      
      if (!rpcsFound.has(funcName)) {
        rpcsFound.set(funcName, {
          function_name: funcName,
          expected_parameters: [],
          found_in_migrations: true,
          issues: []
        });
      }

      const funcDef = content.substring(match.index, content.indexOf(';', match.index) + 1);
      const audit = rpcsFound.get(funcName);

      // Extrair parâmetros
      const paramsList = params.split(',').filter(p => p.trim());
      audit.expected_parameters = paramsList.map(p => {
        const parts = p.trim().split(/\s+/);
        return parts[0]; // Nome do parâmetro
      });

      // Extrair tipo de retorno
      const returnMatch = funcDef.match(/RETURNS\s+([a-zA-Z0-9_\[\]]+)/i);
      if (returnMatch) {
        audit.return_type = returnMatch[1];
      }

      // Extrair linguagem
      const langMatch = funcDef.match(/LANGUAGE\s+([a-zA-Z0-9_]+)/i);
      if (langMatch) {
        audit.language = langMatch[1];
      }

      // Validações
      if (!audit.return_type) {
        audit.issues.push('Função sem tipo de retorno especificado');
      }

      if (!audit.language) {
        audit.issues.push('Função sem linguagem especificada');
      }
    }

    // Encontrar views
    const createViewRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?(MATERIALIZED\s+)?VIEW\s+(?:public\.)?([a-zA-Z0-9_]+)\s+AS/gi;
    while ((match = createViewRegex.exec(content)) !== null) {
      const isMaterialized = !!match[1];
      const viewName = match[2].toLowerCase();

      if (!viewsFound.has(viewName)) {
        viewsFound.set(viewName, {
          view_name: viewName,
          is_materialized: isMaterialized,
          found_in_migrations: true,
          columns: 0,
          issues: []
        });
      }

      // Tentar extrair definição da view
      const viewDef = content.substring(match.index, content.indexOf(';', match.index) + 1);
      const audit = viewsFound.get(viewName);

      // Contar colunas aproximadamente (procurar SELECT)
      const selectMatch = viewDef.match(/SELECT\s+(.*?)\s+FROM/is);
      if (selectMatch) {
        const selectClause = selectMatch[1];
        // Contar vírgulas + 1 (aproximação)
        const commas = (selectClause.match(/,/g) || []).length;
        audit.columns = commas + 1;
      }

      // Validações
      if (audit.columns === 0) {
        audit.issues.push('Não foi possível detectar colunas');
      }
    }
  }

  return { rpcsFound, viewsFound };
}

/**
 * Executa auditoria completa de RPCs e Views
 */
async function auditRPCsAndViews() {
  const { rpcsFound, viewsFound } = await analyzeMigrations();
  
  const rpcsList = Array.from(rpcsFound.values());
  const viewsList = Array.from(viewsFound.values());

  console.log('📡 RPC Functions:\n');
  
  // Verificar RPCs esperadas
  const missingRPCs = [];
  for (const expected of EXPECTED_RPCS) {
    const found = rpcsFound.get(expected.name);
    if (found) {
      console.log(`✅ ${expected.name}`);
      if (found.issues.length > 0) {
        found.issues.forEach(issue => console.log(`   ⚠️ ${issue}`));
      }
    } else {
      console.log(`❌ ${expected.name} (AUSENTE)`);
      missingRPCs.push(expected.name);
    }
  }

  // Listar RPCs adicionais encontradas
  const additionalRPCs = rpcsList.filter(
    rpc => !EXPECTED_RPCS.find(e => e.name === rpc.function_name)
  );

  if (additionalRPCs.length > 0) {
    console.log(`\n➕ Funções adicionais encontradas: ${additionalRPCs.length}`);
    additionalRPCs.slice(0, 10).forEach(rpc => {
      console.log(`   - ${rpc.function_name} (${rpc.return_type || 'unknown'})`);
    });
    if (additionalRPCs.length > 10) {
      console.log(`   ... e mais ${additionalRPCs.length - 10}`);
    }
  }

  console.log(`\n📊 Resumo RPCs:`);
  console.log(`Total encontradas: ${rpcsList.length}`);
  console.log(`Esperadas presentes: ${EXPECTED_RPCS.length - missingRPCs.length}/${EXPECTED_RPCS.length}`);
  console.log(`Adicionais: ${additionalRPCs.length}`);

  // Views
  console.log(`\n👁️ Views:\n`);
  
  const materializedViews = viewsList.filter(v => v.is_materialized);
  const regularViews = viewsList.filter(v => !v.is_materialized);

  console.log(`Total: ${viewsList.length}`);
  console.log(`Materializadas: ${materializedViews.length}`);
  console.log(`Regulares: ${regularViews.length}`);

  if (viewsList.length > 0) {
    console.log(`\nTop Views:`);
    viewsList.slice(0, 10).forEach((view, i) => {
      const type = view.is_materialized ? 'MAT' : 'REG';
      console.log(`  ${i + 1}. [${type}] ${view.view_name} (${view.columns} cols)`);
    });
    if (viewsList.length > 10) {
      console.log(`  ... e mais ${viewsList.length - 10}`);
    }
  }

  // Calcular score
  const rpcsWorking = EXPECTED_RPCS.length - missingRPCs.length;
  const score = Math.round(
    (rpcsWorking / EXPECTED_RPCS.length) * 60 +
    (viewsList.length >= 20 ? 20 : (viewsList.length / 20) * 20) +
    (materializedViews.length >= 15 ? 20 : (materializedViews.length / 15) * 20)
  );

  console.log(`\n✅ Score: ${score}/100\n`);

  return {
    rpcs: rpcsList,
    views: viewsList,
    missingRPCs,
    rpcsWorking,
    materializedViewsCount: materializedViews.length,
    score
  };
}

// Executar
const results = await auditRPCsAndViews();

// Salvar
const outputPath = path.join(__dirname, '3.2-results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`💾 Resultados salvos em: ${outputPath}`);

export default results;

