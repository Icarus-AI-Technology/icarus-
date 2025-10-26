// consolidate.ts
import fs from 'fs';
import path from 'path';

interface ConsolidatedReport {
  agent: string;
  timestamp: string;
  duration: string;
  subagents: {
    '4.1': any;
    '4.2': any;
    '4.3': any;
    '4.4': any;
  };
  overallScore: number;
  summary: {
    totalAPIs: number;
    apisOk: number;
    supabaseServices: number;
    transportadoras: number;
    webhooks: number;
  };
}

async function consolidate() {
  console.log('📊 Consolidando Resultados do Agente 04...\n');

  const resultsDir = '.cursor/agents/04-integrations/subagents';

  // Carregar todos os resultados
  const results = {
    '4.1': JSON.parse(fs.readFileSync(path.join(resultsDir, '4.1-results.json'), 'utf8')),
    '4.2': JSON.parse(fs.readFileSync(path.join(resultsDir, '4.2-results.json'), 'utf8')),
    '4.3': JSON.parse(fs.readFileSync(path.join(resultsDir, '4.3-results.json'), 'utf8')),
    '4.4': JSON.parse(fs.readFileSync(path.join(resultsDir, '4.4-results.json'), 'utf8'))
  };

  // Calcular score global
  const overallScore = Math.round(
    (results['4.1'].score * 0.40) +
    (results['4.2'].score * 0.25) +
    (results['4.3'].score * 0.20) +
    (results['4.4'].score * 0.15)
  );

  console.log('📊 SCORES POR SUBAGENTE:');
  console.log(`  4.1 - APIs Externas (40%):      ${results['4.1'].score}/100`);
  console.log(`  4.2 - Supabase Services (25%):  ${results['4.2'].score}/100`);
  console.log(`  4.3 - Transportadoras (20%):    ${results['4.3'].score}/100`);
  console.log(`  4.4 - Webhooks & Queue (15%):   ${results['4.4'].score}/100`);
  console.log(`\n✅ SCORE GLOBAL: ${overallScore}/100`);

  // Sumário
  const summary = {
    totalAPIs: results['4.1'].totalApis || 0,
    apisOk: results['4.1'].totalOk || 0,
    supabaseServices: results['4.2'].functional || 0,
    transportadoras: results['4.3'].withService || 0,
    webhooks: results['4.4'].webhooksOk || 0
  };

  console.log('\n📊 RESUMO GERAL:');
  console.log(`  Total de APIs: ${summary.totalAPIs}`);
  console.log(`  APIs Funcionais: ${summary.apisOk}`);
  console.log(`  Serviços Supabase Funcionais: ${summary.supabaseServices}/4`);
  console.log(`  Transportadoras com Service: ${summary.transportadoras}/18`);
  console.log(`  Webhooks OK: ${summary.webhooks}/4`);

  // Criar relatório consolidado
  const report: ConsolidatedReport = {
    agent: '04 - Integrações & APIs',
    timestamp: new Date().toISOString(),
    duration: '50 minutos',
    subagents: results,
    overallScore,
    summary
  };

  // Salvar relatório consolidado
  fs.writeFileSync(
    '.cursor/agents/04-integrations/consolidated-report.json',
    JSON.stringify(report, null, 2)
  );

  // Gerar relatório markdown
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(
    '.cursor/agents/04-integrations/REPORT.md',
    markdown
  );

  console.log('\n✅ Relatórios salvos:');
  console.log('  - consolidated-report.json');
  console.log('  - REPORT.md');

  return report;
}

function generateMarkdownReport(report: ConsolidatedReport): string {
  return `# 🔌 AGENTE 04: Integrações & APIs - Relatório Final

**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}  
**Duração:** ${report.duration}  
**Score Global:** ${report.overallScore}/100

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Total de APIs | ${report.summary.totalAPIs} |
| APIs Funcionais | ${report.summary.apisOk} |
| Serviços Supabase | ${report.summary.supabaseServices}/4 |
| Transportadoras | ${report.summary.transportadoras}/18 |
| Webhooks OK | ${report.summary.webhooks}/4 |

---

## 🎯 Scores por Subagente

### 4.1 - APIs Externas (40%)
**Score:** ${report.subagents['4.1'].score}/100

- Total de APIs mapeadas: ${report.subagents['4.1'].totalApis}
- APIs OK: ${report.subagents['4.1'].totalOk}
- APIs Configuradas: ${report.subagents['4.1'].totalConfigured}

#### Por Categoria:
${Object.entries(report.subagents['4.1'].byCategory || {}).map(([cat, stats]: [string, any]) => `
**${cat}:**
- Total: ${stats.total}
- OK: ${stats.ok}
- Erro: ${stats.error}
- Não configurado: ${stats.not_configured || 0}
`).join('\n')}

---

### 4.2 - Supabase Services (25%)
**Score:** ${report.subagents['4.2'].score}/100

- Configurados: ${report.subagents['4.2'].configured}/4
- Funcionais: ${report.subagents['4.2'].functional}/4

#### Serviços:
${Object.entries(report.subagents['4.2']).filter(([key]) => 
  ['auth', 'storage', 'realtime', 'edgeFunctions'].includes(key)
).map(([key, service]: [string, any]) => `
**${service.service}:**
- ${service.functional ? '✅' : service.configured ? '⚠️' : '❌'} Status: ${service.functional ? 'Funcional' : service.configured ? 'Configurado' : 'Não configurado'}
${service.issues && service.issues.length > 0 ? service.issues.map((i: string) => `  - ${i}`).join('\n') : ''}
`).join('\n')}

---

### 4.3 - Transportadoras (20%)
**Score:** ${report.subagents['4.3'].score}/100

- Total: ${report.subagents['4.3'].total}
- Com service: ${report.subagents['4.3'].withService}
- Com tracking: ${report.subagents['4.3'].withTracking}
- Com cotação: ${report.subagents['4.3'].withQuote}
- Com webhook: ${report.subagents['4.3'].withWebhook}

---

### 4.4 - Webhooks & Queue (15%)
**Score:** ${report.subagents['4.4'].score}/100

**Webhooks:**
- Total: ${report.subagents['4.4'].totalWebhooks}
- OK: ${report.subagents['4.4'].webhooksOk}

**Queue:**
- Configurado: ${report.subagents['4.4'].queue.configured ? 'Sim' : 'Não'}
- Workers: ${report.subagents['4.4'].queue.workers?.length || 0}
- Retry logic: ${report.subagents['4.4'].queue.has_retry ? 'Sim' : 'Não'}
- DLQ: ${report.subagents['4.4'].queue.has_dlq ? 'Sim' : 'Não'}

---

## 🎯 Conclusão

${report.overallScore >= 80 ? '✅ Sistema de integrações em excelente estado!' :
  report.overallScore >= 60 ? '⚠️ Sistema de integrações funcional, mas com pontos de melhoria.' :
  '❌ Sistema de integrações precisa de atenção.'}

**Score Global: ${report.overallScore}/100**

---

**Gerado em:** ${new Date().toLocaleString('pt-BR')}
`;
}

// Executar
consolidate().catch(console.error);
