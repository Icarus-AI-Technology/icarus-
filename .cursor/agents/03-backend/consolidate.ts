// 🗄️ AGENTE 03: BACKEND & DATABASE - Consolidação
// Combina resultados dos 4 subagentes

import * as fs from 'fs';
import * as path from 'path';

console.log('📊 Consolidando resultados dos subagentes...\n');

// Ler resultados de cada subagente
const results = [];

try {
  const sub31 = JSON.parse(fs.readFileSync('.cursor/agents/03-backend/subagents/3.1-results.json', 'utf8'));
  console.log(`✅ Subagente 3.1: ${sub31.score}/100`);
  results.push({ id: '3.1', weight: 0.35, score: sub31.score, data: sub31 });
} catch {
  console.log('⚠️ Subagente 3.1: Resultados não encontrados');
  results.push({ id: '3.1', weight: 0.35, score: 0, data: null });
}

try {
  const sub32 = JSON.parse(fs.readFileSync('.cursor/agents/03-backend/subagents/3.2-results.json', 'utf8'));
  console.log(`✅ Subagente 3.2: ${sub32.score}/100`);
  results.push({ id: '3.2', weight: 0.30, score: sub32.score, data: sub32 });
} catch {
  console.log('⚠️ Subagente 3.2: Resultados não encontrados');
  results.push({ id: '3.2', weight: 0.30, score: 0, data: null });
}

try {
  const sub33 = JSON.parse(fs.readFileSync('.cursor/agents/03-backend/subagents/3.3-results.json', 'utf8'));
  console.log(`✅ Subagente 3.3: ${sub33.score}/100`);
  results.push({ id: '3.3', weight: 0.20, score: sub33.score, data: sub33 });
} catch {
  console.log('⚠️ Subagente 3.3: Resultados não encontrados');
  results.push({ id: '3.3', weight: 0.20, score: 0, data: null });
}

try {
  const sub34 = JSON.parse(fs.readFileSync('.cursor/agents/03-backend/subagents/3.4-results.json', 'utf8'));
  console.log(`✅ Subagente 3.4: ${sub34.score}/100`);
  results.push({ id: '3.4', weight: 0.15, score: sub34.score, data: sub34 });
} catch {
  console.log('⚠️ Subagente 3.4: Resultados não encontrados');
  results.push({ id: '3.4', weight: 0.15, score: 0, data: null });
}

// Calcular score global
const overallScore = Math.round(
  results.reduce((acc, r) => acc + (r.score * r.weight), 0)
);

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📊 Score Global Agente 03: ${overallScore}/100`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

// Consolidar estatísticas
const consolidated = {
  agent_id: '03',
  agent_name: 'BACKEND & DATABASE',
  emoji: '🗄️',
  overall_score: overallScore,
  timestamp: new Date().toISOString(),
  subagents: results,
  summary: {
    tables_audited: results[0]?.data?.totalTables || 0,
    tables_with_issues: results[0]?.data?.tablesWithIssues || 0,
    missing_critical_tables: results[0]?.data?.missingCritical?.length || 0,
    rpcs_tested: results[1]?.data?.rpcs?.length || 0,
    rpcs_working: results[1]?.data?.rpcs?.filter((r: any) => r.works).length || 0,
    views_audited: results[1]?.data?.views?.length || 0,
    triggers_validated: results[2]?.data?.triggers?.length || 0,
    constraints_validated: results[2]?.data?.constraints?.length || 0,
    rls_policies_documented: results[3]?.data?.documented_tables || 0
  }
};

// Salvar consolidação
const outputPath = path.join(process.cwd(), '.cursor/agents/03-backend/consolidated-results.json');
fs.writeFileSync(outputPath, JSON.stringify(consolidated, null, 2));
console.log(`💾 Consolidação salva em: ${outputPath}`);

// Exportar para uso em outros scripts
export default consolidated;

