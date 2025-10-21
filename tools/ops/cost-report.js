#!/usr/bin/env node

/**
 * 💰 COST REPORT - Monitor de Custos Mensal
 * 
 * Gera relatório detalhado de custos estimados com serviços externos,
 * identificando oportunidades de economia e ROI de substituições.
 * 
 * @version 1.0.0
 * @date 2025-10-20
 * @team AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURAÇÃO DE SERVIÇOS E CUSTOS
// ============================================

const SERVICES_CONFIG = {
  // Banco de Dados
  supabase: {
    category: 'Database',
    currentPlan: 'Free',
    estimatedCost: 0, // US$/mês
    usage: 'Baixo (<500MB, <50k auth users)',
    riskUpgrade: 'Médio (se crescer >500MB)',
    alternatives: [
      { name: 'Supabase Pro', cost: 25, notes: 'Se passar 500MB storage ou 50k MAU' },
      { name: 'Self-hosted PostgreSQL', cost: 0, notes: 'Requer infra + manutenção (~$20-50/mês em VPS)' }
    ]
  },

  // APIs de IA (menciona uso no README)
  openai: {
    category: 'AI Services',
    currentPlan: 'Pay-as-you-go',
    estimatedCost: 0, // NÃO MEDIDO AINDA
    usage: 'Desconhecido (11 serviços IA mencionados)',
    riskUpgrade: 'ALTO (sem monitoramento)',
    alternatives: [
      { name: 'Ollama (local)', cost: 0, notes: 'Modelos OSS locais (Llama 3, Mistral)' },
      { name: 'Groq (API fast)', cost: 0.27, notes: 'US$ 0.27/1M tokens (70% mais barato que GPT-4)' },
      { name: 'Together.ai', cost: 0.20, notes: 'US$ 0.20/1M tokens output' }
    ],
    recommendation: '⚠️ PRIORIDADE ALTA: Implementar rate limiting + caching + Ollama fallback'
  },

  anthropic: {
    category: 'AI Services',
    currentPlan: 'Pay-as-you-go',
    estimatedCost: 0, // NÃO MEDIDO
    usage: 'Claude mencionado no README',
    riskUpgrade: 'MÉDIO',
    alternatives: [
      { name: 'Ollama (local)', cost: 0, notes: 'Para tarefas não-críticas' }
    ]
  },

  // Busca (não encontrada, mas identificada como oportunidade)
  search: {
    category: 'Search',
    currentPlan: 'N/A',
    estimatedCost: 0,
    usage: 'Busca in-app (não identificada)',
    riskUpgrade: 'Baixo',
    alternatives: [
      { name: 'Meilisearch (OSS)', cost: 0, notes: 'Self-hosted, <10ms search' },
      { name: 'Typesense (OSS)', cost: 0, notes: 'Alternativa a Algolia' }
    ],
    recommendation: '✅ Implementar Meilisearch AGORA para buscas futuras'
  },

  // OCR (não encontrado, mas oportunidade para DANFE)
  ocr: {
    category: 'OCR',
    currentPlan: 'N/A',
    estimatedCost: 0,
    usage: 'Potencial uso para DANFE/NF-e',
    riskUpgrade: 'Baixo',
    alternatives: [
      { name: 'Tesseract.js (OSS)', cost: 0, notes: 'OCR local, treinável' },
      { name: 'Google Vision API', cost: 1.50, notes: 'US$ 1.50/1000 imagens (se precisar)' }
    ],
    recommendation: '✅ Preparar Tesseract para quando necessário'
  },

  // E-mail/Notificações
  email: {
    category: 'Email',
    currentPlan: 'Desconhecido',
    estimatedCost: 0, // NÃO IDENTIFICADO
    usage: 'CommunicationService existe',
    riskUpgrade: 'Médio',
    alternatives: [
      { name: 'Resend', cost: 0, notes: 'Free: 3k emails/mês, depois $20/mês (100k)' },
      { name: 'AWS SES', cost: 0.10, notes: 'US$ 0.10/1000 emails' },
      { name: 'Postal (self-hosted)', cost: 0, notes: 'OSS, requer VPS' }
    ],
    recommendation: '📊 Mapear volume atual antes de decidir'
  },

  // Filas/Jobs
  queues: {
    category: 'Background Jobs',
    currentPlan: 'N/A',
    estimatedCost: 0,
    usage: 'Não identificado (oportunidade futura)',
    riskUpgrade: 'Baixo',
    alternatives: [
      { name: 'BullMQ (OSS)', cost: 0, notes: 'Redis-based, robusto' },
      { name: 'Supabase Edge Functions', cost: 0, notes: 'Até 500k invocações/mês (Free tier)' }
    ],
    recommendation: '✅ Usar BullMQ quando necessário'
  },

  // Analytics
  analytics: {
    category: 'Analytics',
    currentPlan: 'Desconhecido',
    estimatedCost: 0,
    usage: 'Google Analytics 4, Hotjar, Mixpanel mencionados',
    riskUpgrade: 'ALTO (pode gerar custos)',
    alternatives: [
      { name: 'PostHog (OSS)', cost: 0, notes: 'Free: 1M events/mês, self-host gratuito' },
      { name: 'Plausible (self-hosted)', cost: 0, notes: 'Privacy-first' },
      { name: 'Umami (OSS)', cost: 0, notes: 'Simples e leve' }
    ],
    recommendation: '⚠️ PRIORIDADE MÉDIA: Migrar para PostHog OSS'
  }
};

// ============================================
// FUNÇÕES DE ANÁLISE
// ============================================

function calculateTotalCost() {
  let total = 0;
  let totalRisk = 0;

  for (const [service, config] of Object.entries(SERVICES_CONFIG)) {
    total += config.estimatedCost;
    
    // Estimar custo de risco (se sem monitoramento)
    if (config.riskUpgrade === 'ALTO') {
      totalRisk += 50; // Estimativa conservadora
    } else if (config.riskUpgrade === 'MÉDIO' || config.riskUpgrade === 'Médio') {
      totalRisk += 20;
    }
  }

  return { current: total, risk: totalRisk };
}

function identifySavingsOpportunities() {
  const opportunities = [];

  for (const [service, config] of Object.entries(SERVICES_CONFIG)) {
    if (config.alternatives && config.alternatives.length > 0) {
      const cheapest = config.alternatives.reduce((min, alt) => 
        alt.cost < min.cost ? alt : min
      );

      if (cheapest.cost < config.estimatedCost) {
        opportunities.push({
          service,
          currentCost: config.estimatedCost,
          proposedAlternative: cheapest.name,
          proposedCost: cheapest.cost,
          savings: config.estimatedCost - cheapest.cost,
          notes: cheapest.notes
        });
      }
    }
  }

  return opportunities.sort((a, b) => b.savings - a.savings);
}

function generateReport() {
  const { current, risk } = calculateTotalCost();
  const opportunities = identifySavingsOpportunities();

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      currentMonthlyCost: current,
      riskExposure: risk,
      totalAtRisk: current + risk,
      potentialAnnualSavings: {
        min: 3000, // Meta conservadora
        max: 9000  // Meta otimista
      }
    },
    services: SERVICES_CONFIG,
    savingsOpportunities: opportunities,
    recommendations: {
      immediate: [
        '⚠️ PRIORIDADE 1: Implementar rate limiting e caching para APIs de IA',
        '⚠️ PRIORIDADE 2: Configurar Ollama local para reduzir chamadas externas',
        '✅ PRIORIDADE 3: Implementar Meilisearch para busca interna'
      ],
      shortTerm: [
        '📊 Mapear volume real de uso de IA (logs/metrics)',
        '📊 Auditar uso de e-mail/notificações',
        '📊 Avaliar necessidade de analytics premium'
      ],
      longTerm: [
        '🔄 Migrar para PostHog (analytics) - Economia estimada: US$ 300-1k/ano',
        '🔄 Implementar BullMQ (jobs) quando necessário',
        '🔄 Considerar self-hosted para serviços críticos (se volume justificar)'
      ]
    },
    nextSteps: [
      '1. Implementar monitoramento de custos de IA (logs de tokens)',
      '2. Criar feature flag para testar Ollama em paralelo',
      '3. Configurar Meilisearch em shadow mode',
      '4. Benchmark: Ollama vs OpenAI (latência, qualidade)',
      '5. Definir política de fallback (local → API externa)'
    ]
  };

  return report;
}

// ============================================
// GERAÇÃO DE RELATÓRIO
// ============================================

function saveReport(report) {
  const outputDir = path.join(__dirname, '../../docs/economia');
  const outputFile = path.join(outputDir, 'cost-report.json');
  const mdFile = path.join(outputDir, 'COST_REPORT.md');

  // Criar diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Salvar JSON
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));

  // Gerar Markdown
  const markdown = generateMarkdown(report);
  fs.writeFileSync(mdFile, markdown);

  return { json: outputFile, markdown: mdFile };
}

function generateMarkdown(report) {
  const { summary, services, savingsOpportunities, recommendations, nextSteps } = report;

  return `# 💰 RELATÓRIO DE CUSTOS - ICARUS v5.0

**Gerado em**: ${new Date(report.generatedAt).toLocaleString('pt-BR')}  
**Equipe**: AGENTE_EQUIPE_ECONOMIA_AI_TUTORES  
**Meta**: Economia anual de US$ 3k-9k

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Custo Mensal Atual** | US$ ${summary.currentMonthlyCost.toFixed(2)} |
| **Exposição de Risco** | US$ ${summary.riskExposure.toFixed(2)}/mês |
| **Total em Risco** | US$ ${summary.totalAtRisk.toFixed(2)}/mês |
| **Economia Anual (Meta)** | US$ ${summary.potentialAnnualSavings.min.toLocaleString()} - ${summary.potentialAnnualSavings.max.toLocaleString()} |

⚠️ **ALERTA**: ${summary.riskExposure > 0 ? `Exposição de US$ ${summary.riskExposure}/mês em serviços SEM MONITORAMENTO` : 'Nenhum risco identificado'}

---

## 🔍 ANÁLISE POR SERVIÇO

${Object.entries(services).map(([name, config]) => `
### ${name.toUpperCase()}

**Categoria**: ${config.category}  
**Plano Atual**: ${config.currentPlan}  
**Custo Estimado**: US$ ${config.estimatedCost}/mês  
**Uso**: ${config.usage}  
**Risco de Upgrade**: ${config.riskUpgrade}

${config.alternatives ? `
**Alternativas**:
${config.alternatives.map(alt => `- **${alt.name}**: US$ ${alt.cost}/mês - ${alt.notes}`).join('\n')}
` : ''}

${config.recommendation ? `📋 **Recomendação**: ${config.recommendation}` : ''}
`).join('\n---\n')}

---

## 💡 OPORTUNIDADES DE ECONOMIA

${savingsOpportunities.length > 0 ? savingsOpportunities.map((opp, i) => `
${i + 1}. **${opp.service.toUpperCase()}**
   - Atual: US$ ${opp.currentCost}/mês
   - Proposto: ${opp.proposedAlternative} (US$ ${opp.proposedCost}/mês)
   - **Economia**: US$ ${opp.savings}/mês (US$ ${(opp.savings * 12).toFixed(2)}/ano)
   - ${opp.notes}
`).join('\n') : '_Nenhuma oportunidade imediata identificada_'}

---

## 🎯 RECOMENDAÇÕES

### Imediatas (Esta Semana)
${recommendations.immediate.map(rec => `- ${rec}`).join('\n')}

### Curto Prazo (Próximos 30 dias)
${recommendations.shortTerm.map(rec => `- ${rec}`).join('\n')}

### Longo Prazo (90+ dias)
${recommendations.longTerm.map(rec => `- ${rec}`).join('\n')}

---

## 📋 PRÓXIMOS PASSOS

${nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

## 📈 METAS DE ECONOMIA

| Fase | Meta Anual | Ações |
|------|------------|-------|
| **S1** (30 dias) | US$ 600-1.2k | Ollama local + rate limiting |
| **S2** (60 dias) | US$ 1.5-3k | Meilisearch + PostHog |
| **S3** (90 dias) | US$ 3-6k | Otimizações completas |
| **S4** (180 dias) | US$ 3-9k | Refinamento contínuo |

---

**© 2025 ICARUS v5.0 - AGENTE_EQUIPE_ECONOMIA_AI_TUTORES**
`;
}

// ============================================
// EXECUÇÃO
// ============================================

function main() {
  console.log('💰 Gerando relatório de custos...\n');

  const report = generateReport();
  const files = saveReport(report);

  console.log('✅ Relatório gerado com sucesso!\n');
  console.log(`📄 JSON: ${files.json}`);
  console.log(`📄 Markdown: ${files.markdown}\n`);

  // Exibir resumo no console
  console.log('📊 RESUMO EXECUTIVO:');
  console.log(`   Custo Atual: US$ ${report.summary.currentMonthlyCost}/mês`);
  console.log(`   Risco: US$ ${report.summary.riskExposure}/mês`);
  console.log(`   Meta Economia Anual: US$ ${report.summary.potentialAnnualSavings.min.toLocaleString()} - ${report.summary.potentialAnnualSavings.max.toLocaleString()}\n`);

  console.log('⚠️ AÇÕES IMEDIATAS:');
  report.recommendations.immediate.forEach(rec => console.log(`   ${rec}`));

  console.log('\n🎯 Próximo passo: npm run cost:report\n');
}

main();

