#!/usr/bin/env node

/**
 * 🔄 REFRESH KPIs - Atualização de Views Materializadas
 * 
 * Atualiza views materializadas para KPIs em cache
 * (reduz carga no banco e melhora performance)
 * 
 * @version 1.0.0
 * @date 2025-10-20
 * @team AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
 */

import pg from 'pg';
const { Client } = pg;

// ============================================
// CONFIGURAÇÃO
// ============================================

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ Variável SUPABASE_DB_URL não configurada!');
  process.exit(1);
}

// ============================================
// VIEWS MATERIALIZADAS
// ============================================

const MATERIALIZED_VIEWS = [
  'mv_dashboard_kpis',        // KPIs gerais do dashboard
  'mv_estoque_resumo',        // Resumo de estoque
  'mv_cirurgias_pendentes',   // Cirurgias próximas
  'mv_financeiro_mensal',     // Resumo financeiro
  'mv_vendas_ranking'         // Ranking de vendas
];

// ============================================
// FUNÇÕES
// ============================================

async function refreshView(client, viewName) {
  const startTime = Date.now();
  
  try {
    await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName};`);
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ ${viewName} (${duration}ms)`);
    return { view: viewName, status: 'success', duration };
  } catch (error) {
    console.error(`   ❌ ${viewName}: ${error.message}`);
    return { view: viewName, status: 'error', error: error.message };
  }
}

async function refreshAll() {
  const client = new Client({ connectionString: DB_URL });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();

    console.log('📊 Atualizando views materializadas...\n');

    const results = [];

    for (const viewName of MATERIALIZED_VIEWS) {
      const result = await refreshView(client, viewName);
      results.push(result);
    }

    return results;
  } finally {
    await client.end();
  }
}

// ============================================
// EXECUÇÃO
// ============================================

async function main() {
  console.log('🔄 REFRESH KPIs - Iniciando...\n');

  try {
    const results = await refreshAll();

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    const totalDuration = results
      .filter(r => r.duration)
      .reduce((acc, r) => acc + r.duration, 0);

    console.log(`   Views atualizadas: ${successful}/${results.length}`);
    console.log(`   Falhas: ${failed}`);
    console.log(`   Tempo total: ${totalDuration}ms`);

    if (failed > 0) {
      console.log('\n⚠️ VIEWS COM ERRO:');
      results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`   - ${r.view}: ${r.error}`));
    }

    console.log('\n✅ Atualização concluída!\n');
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

main();

