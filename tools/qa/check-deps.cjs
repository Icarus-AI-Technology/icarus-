import { execSync } from 'child_process';

console.log('🔍 Verificando dependências do sistema...\n');

const checks = [
  { cmd: 'node -v', name: 'Node.js', minVersion: '18.18.0' },
  { cmd: 'pnpm -v', name: 'pnpm', minVersion: '8.0.0' },
  { cmd: 'deno -V', name: 'Deno', minVersion: '1.40.0', optional: true },
  { cmd: 'playwright --version', name: 'Playwright', minVersion: '1.40.0', optional: true }
];

let hasErrors = false;
const results = [];

for (const check of checks) {
  try {
    const output = execSync(check.cmd, { encoding: 'utf8' }).toString().trim();
    const version = output.match(/(\d+\.\d+\.\d+)/)?.[1] || output;
    
    console.log(`✅ ${check.name.padEnd(15)} ${version}`);
    results.push({ ...check, status: 'OK', version });
  } catch (e) {
    if (check.optional) {
      console.log(`⚠️  ${check.name.padEnd(15)} (opcional) não encontrado`);
      results.push({ ...check, status: 'MISSING_OPTIONAL' });
    } else {
      console.error(`❌ ${check.name.padEnd(15)} não encontrado ou erro ao executar`);
      results.push({ ...check, status: 'ERROR' });
      hasErrors = true;
    }
  }
}

console.log('\n📊 Resumo:');
console.log(`   Obrigatórias: ${results.filter(r => !r.optional && r.status === 'OK').length}/${results.filter(r => !r.optional).length}`);
console.log(`   Opcionais: ${results.filter(r => r.optional && r.status === 'OK').length}/${results.filter(r => r.optional).length}`);

if (hasErrors) {
  console.error('\n❌ Algumas dependências obrigatórias estão faltando!');
  process.exit(1);
}

console.log('\n✅ Todas as dependências obrigatórias estão instaladas!');
process.exit(0);

