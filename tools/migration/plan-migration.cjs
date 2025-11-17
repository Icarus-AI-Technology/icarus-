import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');

// Whitelist de arquivos e diretórios permitidos para migração
const ALLOW = [
  'src',
  'public',
  'supabase',
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.typecheck.json',
  'playwright.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'components.json',
  'index.html',
  '.env.example'
];

// Blacklist - nunca copiar
const NEVER = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.env',
  '.env.local',
  '.env.production',
  'coverage',
  'playwright-report',
  'storybook-static',
  'logs'
];

console.log('📋 Planejando migração seletiva...\n');

const plan = {
  timestamp: new Date().toISOString(),
  source: projectRoot,
  target: process.env.PROD_PATH || '/users/daxmenghel/icarus-v5.0/',
  copy: [],
  ignore: [],
  warnings: []
};

// Verificar cada item da whitelist
for (const item of ALLOW) {
  const itemPath = path.join(projectRoot, item);
  
  if (fs.existsSync(itemPath)) {
    const stat = fs.statSync(itemPath);
    plan.copy.push({
      path: item,
      type: stat.isDirectory() ? 'directory' : 'file',
      size: stat.isDirectory() ? null : stat.size
    });
    console.log(`✅ ${item.padEnd(30)} [${stat.isDirectory() ? 'DIR' : 'FILE'}]`);
  } else {
    plan.warnings.push(`Item na whitelist não encontrado: ${item}`);
    console.log(`⚠️  ${item.padEnd(30)} [NÃO ENCONTRADO]`);
  }
}

// Listar itens que serão ignorados
const allItems = fs.readdirSync(projectRoot);
for (const item of allItems) {
  if (!ALLOW.includes(item) && !item.startsWith('.')) {
    plan.ignore.push(item);
  }
}

const outputPath = path.join(projectRoot, 'migration-plan.json');
fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));

console.log(`\n📊 Resumo do Plano:`);
console.log(`   Itens para copiar: ${plan.copy.length}`);
console.log(`   Itens ignorados: ${plan.ignore.length}`);
console.log(`   Avisos: ${plan.warnings.length}`);

if (plan.warnings.length > 0) {
  console.log(`\n⚠️  Avisos:`);
  plan.warnings.forEach(w => console.log(`   - ${w}`));
}

console.log(`\n✅ Plano de migração salvo: ${outputPath}`);
console.log(`\n📝 Próximo passo:`);
console.log(`   node tools/migration/selective-copy.js`);

