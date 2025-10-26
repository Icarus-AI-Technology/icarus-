#!/usr/bin/env node
/**
 * Checklist pré-deploy completo
 */

import { execSync } from 'child_process';
import fs from 'fs';

const checks = [
  {
    name: 'TypeScript',
    command: 'npm run type-check',
    critical: true
  },
  {
    name: 'ESLint',
    command: 'npm run lint',
    critical: false
  },
  {
    name: 'Build',
    command: 'npm run build',
    critical: true
  },
  {
    name: 'Tests',
    command: 'npm run test:unit',
    critical: false
  },
];

async function runChecklist() {
  console.log('🚀 Executando checklist pré-deploy...\n');
  
  const results = [];

  for (const check of checks) {
    console.log(`▶️  ${check.name}...`);
    
    try {
      execSync(check.command, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      console.log(`✅ ${check.name}: PASSOU\n`);
      results.push({ name: check.name, status: 'pass', critical: check.critical });
    } catch (error) {
      const status = check.critical ? 'FALHOU' : 'WARNING';
      console.log(`${check.critical ? '❌' : '⚠️ '} ${check.name}: ${status}\n`);
      results.push({ name: check.name, status: 'fail', critical: check.critical });
    }
  }

  // Verificar .env.example
  const hasEnvExample = fs.existsSync('.env.example');
  results.push({ 
    name: '.env.example', 
    status: hasEnvExample ? 'pass' : 'fail',
    critical: false
  });
  console.log(`${hasEnvExample ? '✅' : '⚠️ '} .env.example: ${hasEnvExample ? 'OK' : 'MISSING'}`);

  // Verificar vercel.json
  const hasVercelJson = fs.existsSync('vercel.json');
  results.push({ 
    name: 'vercel.json', 
    status: hasVercelJson ? 'pass' : 'fail',
    critical: true
  });
  console.log(`${hasVercelJson ? '✅' : '❌'} vercel.json: ${hasVercelJson ? 'OK' : 'MISSING'}`);

  // Score final
  const passed = results.filter(r => r.status === 'pass').length;
  const total = results.length;
  const score = Math.round((passed / total) * 100);

  console.log(`\n📊 Score: ${score}/100`);
  console.log(`   ${passed}/${total} checks passaram`);

  const criticalFails = results.filter(r => r.critical && r.status === 'fail');
  
  if (criticalFails.length > 0) {
    console.log('\n❌ DEPLOY BLOQUEADO - Falhas críticas:');
    criticalFails.forEach(f => console.log(`   - ${f.name}`));
    process.exit(1);
  } else if (score >= 85) {
    console.log('\n✅ DEPLOY READY!');
    process.exit(0);
  } else {
    console.log('\n⚠️  DEPLOY COM WARNINGS');
    process.exit(0);
  }
}

runChecklist().catch(console.error);

