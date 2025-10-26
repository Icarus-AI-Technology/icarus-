#!/usr/bin/env node
// agent-03-backend.mjs
// Agente 03: Backend & Database - Executor Principal
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗄️ AGENTE 03: BACKEND & DATABASE\n');
console.log('================================================\n');

const SUBAGENTS = [
  { id: '3.1', name: 'Schema & Tabelas', file: '3.1-schema-tables.mjs', weight: 0.35 },
  { id: '3.2', name: 'RPC & Views', file: '3.2-rpc-views.mjs', weight: 0.30 },
  { id: '3.3', name: 'Triggers & Constraints', file: '3.3-triggers-constraints.mjs', weight: 0.20 },
  { id: '3.4', name: 'RLS Documentation', file: '3.4-rls-documentation.mjs', weight: 0.15 }
];

/**
 * Executa um subagente
 */
function runSubagent(subagent) {
  return new Promise((resolve, reject) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🚀 Executando Subagente ${subagent.id}: ${subagent.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const subagentPath = path.join(__dirname, 'subagents', subagent.file);
    
    const proc = spawn('node', [subagentPath], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Subagente ${subagent.id} concluído com sucesso\n`);
        resolve();
      } else {
        console.error(`\n❌ Subagente ${subagent.id} falhou com código ${code}\n`);
        reject(new Error(`Subagente ${subagent.id} falhou`));
      }
    });

    proc.on('error', (err) => {
      console.error(`\n❌ Erro ao executar Subagente ${subagent.id}:`, err.message);
      reject(err);
    });
  });
}

/**
 * Consolida resultados de todos os subagentes
 */
function consolidateResults() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CONSOLIDANDO RESULTADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = {};
  let overallScore = 0;

  for (const subagent of SUBAGENTS) {
    const resultPath = path.join(__dirname, 'subagents', `${subagent.id}-results.json`);
    
    if (fs.existsSync(resultPath)) {
      const data = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      results[subagent.id] = data;
      
      const score = data.score || 0;
      overallScore += score * subagent.weight;
      
      console.log(`✅ ${subagent.name}: ${score}/100 (peso: ${subagent.weight * 100}%)`);
    } else {
      console.log(`⚠️ ${subagent.name}: Resultados não encontrados`);
    }
  }

  overallScore = Math.round(overallScore);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 SCORE GLOBAL: ${overallScore}/100`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  return { results, overallScore };
}

/**
 * Gera relatório final
 */
function generateReport(consolidatedResults) {
  const { results, overallScore } = consolidatedResults;

  const report = `# 🗄️ RELATÓRIO - AGENTE 03: BACKEND & DATABASE

**Data:** ${new Date().toLocaleString('pt-BR')}  
**Score Global:** ${overallScore}/100  

---

## 📊 Resumo Executivo

### Subagente 3.1: Schema & Tabelas (35%)
- **Score:** ${results['3.1']?.score || 0}/100
- **Tabelas Auditadas:** ${results['3.1']?.totalTables || 0}
- **Tabelas com PK:** ${results['3.1']?.tablesWithPK || 0}
- **Tabelas com FK:** ${results['3.1']?.tablesWithFK || 0}
- **Tabelas Críticas Ausentes:** ${results['3.1']?.missingCritical?.length || 0}

### Subagente 3.2: RPC & Views (30%)
- **Score:** ${results['3.2']?.score || 0}/100
- **RPCs Encontradas:** ${results['3.2']?.rpcs?.length || 0}
- **RPCs Esperadas Funcionando:** ${results['3.2']?.rpcsWorking || 0}/15
- **Views Total:** ${results['3.2']?.views?.length || 0}
- **Views Materializadas:** ${results['3.2']?.materializedViewsCount || 0}

### Subagente 3.3: Triggers & Constraints (20%)
- **Score:** ${results['3.3']?.score || 0}/100
- **Triggers Encontrados:** ${results['3.3']?.triggers?.length || 0}
- **Constraints Total:** ${results['3.3']?.constraints?.length || 0}
- **Primary Keys:** ${results['3.3']?.pkCount || 0}
- **Foreign Keys:** ${results['3.3']?.fkCount || 0}

### Subagente 3.4: RLS Documentation (15%)
- **Score:** ${results['3.4']?.score || 0}/100
- **Tabelas Documentadas:** ${results['3.4']?.documented_tables || 0}
- **Policies Críticas:** ${results['3.4']?.critical_policies || 0}
- **Funções Auxiliares:** ${results['3.4']?.helper_functions || 0}

---

## ✅ Validações

${overallScore >= 90 ? '✅' : overallScore >= 70 ? '⚠️' : '❌'} **Score Global:** ${overallScore}/100
${results['3.1']?.missingCritical?.length === 0 ? '✅' : '❌'} **Tabelas Críticas:** ${results['3.1']?.missingCritical?.length === 0 ? 'Todas presentes' : results['3.1']?.missingCritical?.length + ' ausentes'}
${results['3.1']?.totalTables >= 100 ? '✅' : '⚠️'} **Total de Tabelas:** ${results['3.1']?.totalTables || 0} ${results['3.1']?.totalTables >= 100 ? '(✓ >= 100)' : '(< 100)'}
${results['3.2']?.rpcsWorking >= 12 ? '✅' : '⚠️'} **RPCs Funcionais:** ${results['3.2']?.rpcsWorking || 0}/15 ${results['3.2']?.rpcsWorking >= 12 ? '(✓ >= 80%)' : '(< 80%)'}
${results['3.2']?.views?.length >= 20 ? '✅' : '⚠️'} **Views:** ${results['3.2']?.views?.length || 0} ${results['3.2']?.views?.length >= 20 ? '(✓ >= 20)' : '(< 20)'}
${results['3.3']?.constraints?.length >= 100 ? '✅' : '⚠️'} **Constraints:** ${results['3.3']?.constraints?.length || 0} ${results['3.3']?.constraints?.length >= 100 ? '(✓ >= 100)' : '(< 100)'}
${results['3.4']?.documented_tables >= 13 ? '✅' : '❌'} **RLS Documentadas:** ${results['3.4']?.documented_tables || 0} tabelas

---

## 🎯 Status

${overallScore >= 90 ? '🟢 **EXCELENTE** - Sistema de backend robusto e bem estruturado' : 
  overallScore >= 70 ? '🟡 **BOM** - Sistema funcional com alguns pontos de atenção' :
  '🔴 **NECESSITA ATENÇÃO** - Problemas críticos identificados'}

---

## 📝 Detalhes

### Tabelas Críticas Ausentes
${results['3.1']?.missingCritical?.length > 0 ? 
  results['3.1'].missingCritical.map(t => `- ${t}`).join('\n') : 
  'Nenhuma - Todas as tabelas críticas estão presentes ✅'}

### RPCs Ausentes
${results['3.2']?.missingRPCs?.length > 0 ? 
  results['3.2'].missingRPCs.map(r => `- ${r}`).join('\n') : 
  'Nenhuma - Todas as RPCs esperadas estão presentes ✅'}

### Triggers Ausentes
${results['3.3']?.missingTriggers?.length > 0 ? 
  results['3.3'].missingTriggers.map(t => `- ${t}`).join('\n') : 
  'Nenhum - Todos os triggers esperados estão presentes ✅'}

---

## 📋 Próximos Passos

1. ${results['3.1']?.missingCritical?.length > 0 ? '🔴 Criar tabelas críticas ausentes' : '✅ Tabelas OK'}
2. ${results['3.2']?.missingRPCs?.length > 0 ? '🔴 Implementar RPCs ausentes' : '✅ RPCs OK'}
3. ${results['3.3']?.missingTriggers?.length > 0 ? '🔴 Criar triggers ausentes' : '✅ Triggers OK'}
4. ${results['3.4']?.implementation_status === 'pending_review' ? '⏳ Revisar e implementar RLS policies' : '✅ RLS OK'}

---

## 📁 Arquivos Gerados

- \`3.1-results.json\` - Auditoria de tabelas
- \`3.2-results.json\` - Auditoria de RPCs e Views
- \`3.3-results.json\` - Auditoria de Triggers e Constraints
- \`3.4-results.json\` - Documentação RLS
- \`3.4-rls-documentation.md\` - Documentação completa de RLS policies

---

**Gerado automaticamente pelo Agente 03**  
**Timestamp:** ${new Date().toISOString()}
`;

  const reportPath = path.join(__dirname, 'RELATORIO-AGENTE-03.md');
  fs.writeFileSync(reportPath, report);
  
  console.log('📄 Relatório gerado:', reportPath);
  
  return report;
}

/**
 * Execução principal
 */
async function main() {
  const startTime = Date.now();

  try {
    // Executar todos os subagentes sequencialmente
    for (const subagent of SUBAGENTS) {
      await runSubagent(subagent);
    }

    // Consolidar resultados
    const consolidatedResults = consolidateResults();

    // Gerar relatório
    generateReport(consolidatedResults);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ AGENTE 03 CONCLUÍDO COM SUCESSO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Tempo total: ${duration}s`);
    console.log(`🎯 Score: ${consolidatedResults.overallScore}/100\n`);

  } catch (error) {
    console.error('\n❌ ERRO NA EXECUÇÃO DO AGENTE 03:');
    console.error(error.message);
    process.exit(1);
  }
}

// Executar
main();

