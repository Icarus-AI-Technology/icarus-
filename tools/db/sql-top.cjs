#!/usr/bin/env node

/**
 * 🐘 SQL TOP - Análise de Performance de Queries
 * 
 * Identifica queries lentas, gargalos e oportunidades de otimização
 * usando pg_stat_statements do PostgreSQL.
 * 
 * @version 1.0.0
 * @date 2025-10-20
 * @team AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURAÇÃO
// ============================================

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ Variável SUPABASE_DB_URL não configurada!');
  console.error('   export SUPABASE_DB_URL="postgresql://postgres:senha@host:5432/postgres"');
  process.exit(1);
}

// ============================================
// QUERIES DE ANÁLISE
// ============================================

const ANALYSIS_QUERIES = {
  // Top 20 queries mais lentas (por tempo total)
  slowestQueries: `
    SELECT 
      LEFT(query, 100) as query_preview,
      calls,
      ROUND(total_exec_time::numeric, 2) as total_time_ms,
      ROUND(mean_exec_time::numeric, 2) as mean_time_ms,
      ROUND(max_exec_time::numeric, 2) as max_time_ms,
      ROUND(stddev_exec_time::numeric, 2) as stddev_time_ms,
      ROUND((100.0 * total_exec_time / SUM(total_exec_time) OVER ())::numeric, 2) as pct_total
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat_statements%'
    ORDER BY total_exec_time DESC
    LIMIT 20;
  `,

  // Queries com maior variação (p95/p99)
  highVarianceQueries: `
    SELECT 
      LEFT(query, 100) as query_preview,
      calls,
      ROUND(mean_exec_time::numeric, 2) as mean_ms,
      ROUND(stddev_exec_time::numeric, 2) as stddev_ms,
      ROUND((stddev_exec_time / NULLIF(mean_exec_time, 0))::numeric, 2) as coefficient_variation
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat_statements%'
      AND calls > 10
      AND stddev_exec_time > 0
    ORDER BY coefficient_variation DESC
    LIMIT 20;
  `,

  // Queries mais frequentes
  mostFrequentQueries: `
    SELECT 
      LEFT(query, 100) as query_preview,
      calls,
      ROUND(mean_exec_time::numeric, 2) as mean_time_ms,
      ROUND(total_exec_time::numeric, 2) as total_time_ms
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat_statements%'
    ORDER BY calls DESC
    LIMIT 20;
  `,

  // Índices não utilizados (candidatos para remoção)
  unusedIndexes: `
    SELECT 
      schemaname,
      tablename,
      indexname,
      pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
      idx_scan as index_scans
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
      AND idx_scan = 0
      AND indexrelname NOT LIKE '%_pkey'
    ORDER BY pg_relation_size(indexrelid) DESC;
  `,

  // Tabelas com mais seq scans (precisam de índices)
  seqScanTables: `
    SELECT 
      schemaname,
      tablename,
      seq_scan,
      seq_tup_read,
      idx_scan,
      ROUND((100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0))::numeric, 2) as seq_scan_pct,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
      AND seq_scan > 0
    ORDER BY seq_scan DESC
    LIMIT 20;
  `,

  // Cache hit ratio (deve ser >99%)
  cacheHitRatio: `
    SELECT 
      'Cache Hit Ratio' as metric,
      ROUND((SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100)::numeric, 2) as value_pct
    FROM pg_statio_user_tables;
  `,

  // Tamanho das tabelas
  tablesSizes: `
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
      pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 20;
  `
};

// ============================================
// ANÁLISE
// ============================================

async function runAnalysis() {
  const client = new Client({ connectionString: DB_URL });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();

    console.log('📊 Coletando métricas de performance...\n');

    const results = {};

    for (const [name, query] of Object.entries(ANALYSIS_QUERIES)) {
      try {
        console.log(`   ⏳ ${name}...`);
        const { rows } = await client.query(query);
        results[name] = rows;
        console.log(`   ✅ ${name}: ${rows.length} resultados`);
      } catch (error) {
        console.error(`   ❌ Erro em ${name}:`, error.message);
        results[name] = { error: error.message };
      }
    }

    return results;
  } finally {
    await client.end();
  }
}

function analyzeResults(results) {
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {},
    recommendations: [],
    criticalIssues: []
  };

  // Análise de cache hit ratio
  if (results.cacheHitRatio && results.cacheHitRatio[0]) {
    const cacheHit = parseFloat(results.cacheHitRatio[0].value_pct);
    analysis.summary.cacheHitRatio = cacheHit;

    if (cacheHit < 95) {
      analysis.criticalIssues.push({
        severity: 'HIGH',
        issue: `Cache Hit Ratio muito baixo: ${cacheHit}% (meta: >99%)`,
        impact: 'Queries ~20x mais lentas',
        solution: 'Aumentar shared_buffers ou otimizar queries'
      });
    } else if (cacheHit < 99) {
      analysis.recommendations.push({
        priority: 'MEDIUM',
        recommendation: 'Cache Hit Ratio pode melhorar',
        currentValue: cacheHit,
        targetValue: 99,
        action: 'Revisar índices e tuning de memória'
      });
    }
  }

  // Análise de queries lentas
  if (results.slowestQueries && results.slowestQueries.length > 0) {
    const criticalQueries = results.slowestQueries.filter(q => 
      parseFloat(q.mean_time_ms) > 200 // >200ms é crítico
    );

    analysis.summary.slowQueriesCount = criticalQueries.length;

    if (criticalQueries.length > 0) {
      analysis.criticalIssues.push({
        severity: 'HIGH',
        issue: `${criticalQueries.length} queries com p95 >200ms`,
        impact: 'UX degradada, timeouts possíveis',
        solution: 'Otimizar queries, adicionar índices, usar cache'
      });

      criticalQueries.forEach(q => {
        analysis.recommendations.push({
          priority: 'HIGH',
          recommendation: `Otimizar query: ${q.query_preview.substring(0, 50)}...`,
          currentValue: `${q.mean_time_ms}ms (avg)`,
          targetValue: '<100ms',
          action: 'EXPLAIN ANALYZE + criar índice ou reescrever'
        });
      });
    }
  }

  // Análise de seq scans
  if (results.seqScanTables && results.seqScanTables.length > 0) {
    const heavySeqScans = results.seqScanTables.filter(t => 
      parseFloat(t.seq_scan_pct) > 50 && t.seq_scan > 100
    );

    if (heavySeqScans.length > 0) {
      analysis.recommendations.push({
        priority: 'MEDIUM',
        recommendation: `${heavySeqScans.length} tabelas com >50% seq scans`,
        action: 'Criar índices apropriados',
        tables: heavySeqScans.map(t => t.tablename).slice(0, 5)
      });
    }
  }

  // Análise de índices não usados
  if (results.unusedIndexes && results.unusedIndexes.length > 0) {
    const largeUnusedIndexes = results.unusedIndexes.filter(idx => 
      idx.index_size && !idx.index_size.includes('bytes')
    );

    if (largeUnusedIndexes.length > 0) {
      analysis.recommendations.push({
        priority: 'LOW',
        recommendation: `${largeUnusedIndexes.length} índices não utilizados ocupando espaço`,
        action: 'Considerar remoção (após validação)',
        indexes: largeUnusedIndexes.map(i => `${i.tablename}.${i.indexname} (${i.index_size})`).slice(0, 5)
      });
    }
  }

  return analysis;
}

function saveReport(results, analysis) {
  const outputDir = path.join(__dirname, '../../docs/economia');
  const timestamp = new Date().toISOString().split('T')[0];
  
  const jsonFile = path.join(outputDir, `sql-top-${timestamp}.json`);
  const mdFile = path.join(outputDir, 'SQL_PERFORMANCE_REPORT.md');

  // Salvar JSON completo
  fs.writeFileSync(jsonFile, JSON.stringify({ results, analysis }, null, 2));

  // Gerar Markdown
  const markdown = generateMarkdown(results, analysis);
  fs.writeFileSync(mdFile, markdown);

  return { json: jsonFile, markdown: mdFile };
}

function generateMarkdown(results, analysis) {
  return `# 🐘 RELATÓRIO DE PERFORMANCE SQL

**Gerado em**: ${new Date(analysis.timestamp).toLocaleString('pt-BR')}  
**Equipe**: AGENTE_EQUIPE_ECONOMIA_AI_TUTORES

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Cache Hit Ratio** | ${analysis.summary.cacheHitRatio?.toFixed(2) || 'N/A'}% |
| **Queries Lentas (>200ms)** | ${analysis.summary.slowQueriesCount || 0} |

${analysis.summary.cacheHitRatio < 99 ? '⚠️ **ALERTA**: Cache Hit Ratio abaixo do ideal!' : '✅ Cache Hit Ratio saudável'}

---

## 🚨 PROBLEMAS CRÍTICOS

${analysis.criticalIssues.length > 0 ? analysis.criticalIssues.map(issue => `
### ${issue.issue}

**Severidade**: ${issue.severity}  
**Impacto**: ${issue.impact}  
**Solução**: ${issue.solution}
`).join('\n') : '_Nenhum problema crítico identificado_ ✅'}

---

## 📋 RECOMENDAÇÕES

${analysis.recommendations.map((rec, i) => `
${i + 1}. **[${rec.priority}]** ${rec.recommendation}
   ${rec.currentValue ? `- Atual: ${rec.currentValue}` : ''}
   ${rec.targetValue ? `- Meta: ${rec.targetValue}` : ''}
   - Ação: ${rec.action}
   ${rec.tables ? `- Tabelas: ${rec.tables.join(', ')}` : ''}
   ${rec.indexes ? `- Índices: ${rec.indexes.join(', ')}` : ''}
`).join('\n')}

---

## 🔍 TOP 10 QUERIES MAIS LENTAS

${results.slowestQueries?.slice(0, 10).map((q, i) => `
${i + 1}. **${q.query_preview}**
   - Chamadas: ${q.calls}
   - Tempo Médio: ${q.mean_time_ms}ms
   - Tempo Máximo: ${q.max_time_ms}ms
   - % do Total: ${q.pct_total}%
`).join('\n') || '_Nenhuma query analisada_'}

---

## 📈 PRÓXIMOS PASSOS

1. Revisar queries críticas com EXPLAIN ANALYZE
2. Criar índices para queries com seq scans
3. Considerar cache em application layer (Redis)
4. Configurar alertas para queries >500ms
5. Agendar otimização mensal (VACUUM, ANALYZE)

---

**© 2025 ICARUS v5.0 - AGENTE_EQUIPE_ECONOMIA_AI_TUTORES**
`;
}

// ============================================
// EXECUÇÃO
// ============================================

async function main() {
  console.log('🐘 SQL TOP - Análise de Performance\n');

  try {
    const results = await runAnalysis();
    const analysis = analyzeResults(results);
    const files = saveReport(results, analysis);

    console.log('\n✅ Análise completa!\n');
    console.log(`📄 JSON: ${files.json}`);
    console.log(`📄 Markdown: ${files.markdown}\n`);

    // Exibir resumo
    if (analysis.criticalIssues.length > 0) {
      console.log('🚨 PROBLEMAS CRÍTICOS:');
      analysis.criticalIssues.forEach(issue => {
        console.log(`   [${issue.severity}] ${issue.issue}`);
      });
    } else {
      console.log('✅ Nenhum problema crítico identificado!');
    }

    if (analysis.recommendations.length > 0) {
      console.log('\n📋 RECOMENDAÇÕES:');
      analysis.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   [${rec.priority}] ${rec.recommendation}`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    process.exit(1);
  }
}

main();

