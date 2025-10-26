#!/usr/bin/env node

// 🗄️ AGENTE 03: BACKEND & DATABASE - Executor Principal
// Executa os 4 subagentes sequencialmente

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const AGENT_DIR = '.cursor/agents/03-backend';
const SUBAGENTS_DIR = `${AGENT_DIR}/subagents`;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🗄️  AGENTE 03: BACKEND & DATABASE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Missão: Auditar schema Supabase completo\n');
console.log('⏱️  Tempo Estimado: 55 minutos\n');
console.log('📦 Subagentes: 4\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Verificar se a estrutura existe
if (!fs.existsSync(SUBAGENTS_DIR)) {
  console.error('❌ Estrutura de subagentes não encontrada!');
  console.error(`   Esperado: ${SUBAGENTS_DIR}`);
  process.exit(1);
}

// Função para executar subagente
function runSubagent(id: string, name: string, weight: string, timeMin: string) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔄 Executando Subagente ${id}: ${name}`);
  console.log(`   Peso: ${weight} | Tempo: ${timeMin}`);
  console.log(`${'═'.repeat(60)}\n`);

  const scriptPath = `${SUBAGENTS_DIR}/${id}`;
  
  try {
    // Verificar se o script existe
    const tsScript = `${scriptPath}.ts`;
    if (!fs.existsSync(tsScript)) {
      console.log(`⚠️  Script ${tsScript} não encontrado, pulando...`);
      return false;
    }

    // Executar com tsx
    execSync(`npx tsx ${tsScript}`, {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env }
    });

    console.log(`\n✅ Subagente ${id} concluído com sucesso!`);
    return true;

  } catch (error: any) {
    console.error(`\n❌ Erro no Subagente ${id}:`, error.message);
    return false;
  }
}

// Timestamp de início
const startTime = Date.now();

// Executar subagentes
const results = [
  {
    id: '3.1-schema-tables',
    name: 'Schema & Tabelas',
    weight: '35%',
    time: '19 min',
    success: false
  },
  {
    id: '3.2-rpc-views',
    name: 'RPC & Views',
    weight: '30%',
    time: '17 min',
    success: false
  },
  {
    id: '3.3-triggers-constraints',
    name: 'Triggers & Constraints',
    weight: '20%',
    time: '11 min',
    success: false
  },
  {
    id: '3.4-rls-documentation',
    name: 'RLS Documentation',
    weight: '15%',
    time: '8 min',
    success: false
  }
];

// Executar cada subagente
for (const subagent of results) {
  subagent.success = runSubagent(
    subagent.id,
    subagent.name,
    subagent.weight,
    subagent.time
  );
}

// Consolidar resultados
console.log(`\n${'═'.repeat(60)}`);
console.log('📊 Consolidando resultados...');
console.log(`${'═'.repeat(60)}\n`);

try {
  execSync(`npx tsx ${AGENT_DIR}/consolidate.ts`, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ Erro na consolidação:', error);
}

// Calcular tempo total
const endTime = Date.now();
const elapsedMin = Math.round((endTime - startTime) / 1000 / 60);

// Resumo final
console.log(`\n${'━'.repeat(60)}`);
console.log('📋 RESUMO FINAL - AGENTE 03');
console.log(`${'━'.repeat(60)}\n`);

results.forEach(sub => {
  const status = sub.success ? '✅' : '❌';
  console.log(`${status} ${sub.id}: ${sub.name}`);
});

const successCount = results.filter(r => r.success).length;
console.log(`\n📊 Subagentes concluídos: ${successCount}/${results.length}`);
console.log(`⏱️  Tempo total: ${elapsedMin} minutos`);

console.log(`\n${'━'.repeat(60)}\n`);

if (successCount === results.length) {
  console.log('🎉 Agente 03 concluído com sucesso!\n');
  process.exit(0);
} else {
  console.log('⚠️  Agente 03 concluído com falhas parciais\n');
  process.exit(1);
}

