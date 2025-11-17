import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');

// Ler argumentos
const args = process.argv.slice(2);
const fromArg = args.find(a => a.startsWith('--from='));
const toArg = args.find(a => a.startsWith('--to='));

const FROM = fromArg ? fromArg.split('=')[1] : '/Users/daxmeneghel/icarus-make/';
const TO = toArg ? toArg.split('=')[1] : '/Users/daxmeneghel/icarus-v5.0/';

const planPath = path.join(projectRoot, 'migration-plan.json');

if (!fs.existsSync(planPath)) {
  console.error('❌ Plano de migração não encontrado!');
  console.error('   Execute primeiro: node tools/migration/plan-migration.js');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

console.log('🚀 Iniciando migração seletiva...\n');
console.log(`   Origem: ${FROM}`);
console.log(`   Destino: ${TO}\n`);

// Criar diretório de destino se não existir
if (!fs.existsSync(TO)) {
  console.log(`📁 Criando diretório de destino: ${TO}`);
  fs.mkdirSync(TO, { recursive: true });
}

// Função para copiar recursivamente
function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dst)) {
      fs.mkdirSync(dst, { recursive: true });
    }
    
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      // Pular node_modules e outros diretórios blacklisted
      if (['node_modules', 'dist', 'build', '.git', 'coverage'].includes(entry)) {
        continue;
      }
      
      const srcPath = path.join(src, entry);
      const dstPath = path.join(dst, entry);
      copyRecursive(srcPath, dstPath);
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

// Copiar cada item do plano
let copiedCount = 0;
let failedCount = 0;

for (const item of plan.copy) {
  const src = path.join(FROM, item.path);
  const dst = path.join(TO, item.path);
  
  try {
    console.log(`📦 Copiando: ${item.path}`);
    copyRecursive(src, dst);
    copiedCount++;
  } catch (error) {
    console.error(`❌ Erro ao copiar ${item.path}: ${error.message}`);
    failedCount++;
  }
}

console.log(`\n📊 Resumo da Migração:`);
console.log(`   ✅ Copiados com sucesso: ${copiedCount}`);
console.log(`   ❌ Falhas: ${failedCount}`);

if (failedCount > 0) {
  console.error(`\n❌ Migração concluída com erros!`);
  process.exit(1);
}

console.log(`\n✅ Migração seletiva concluída com sucesso!`);
console.log(`\n📝 Próximos passos:`);
console.log(`   1. cd ${TO}`);
console.log(`   2. pnpm install --frozen-lockfile`);
console.log(`   3. node tools/env/generate-dotenv.js --mode=production`);
console.log(`   4. pnpm build`);

