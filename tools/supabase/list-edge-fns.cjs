import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const functionsDir = path.join(projectRoot, 'supabase', 'functions');

console.log('📋 Listando Edge Functions...\n');

if (!fs.existsSync(functionsDir)) {
  console.warn('⚠️  Diretório supabase/functions não encontrado!');
  process.exit(0);
}

const functions = fs.readdirSync(functionsDir)
  .filter(item => {
    const itemPath = path.join(functionsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

const report = {
  timestamp: new Date().toISOString(),
  totalFunctions: functions.length,
  functions: []
};

for (const func of functions) {
  const funcPath = path.join(functionsDir, func);
  const indexTs = path.join(funcPath, 'index.ts');
  const indexJs = path.join(funcPath, 'index.js');
  
  const hasIndex = fs.existsSync(indexTs) || fs.existsSync(indexJs);
  const entrypoint = fs.existsSync(indexTs) ? 'index.ts' : 
                     fs.existsSync(indexJs) ? 'index.js' : null;
  
  const funcInfo = {
    name: func,
    path: func,
    hasEntrypoint: hasIndex,
    entrypoint,
    files: fs.readdirSync(funcPath)
  };
  
  report.functions.push(funcInfo);
  
  const status = hasIndex ? '✅' : '❌';
  console.log(`${status} ${func.padEnd(30)} ${entrypoint || 'SEM ENTRYPOINT'}`);
}

const outputPath = path.join(projectRoot, 'edge-functions-report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Total de Edge Functions: ${report.totalFunctions}`);
console.log(`✅ Relatório salvo: ${outputPath}`);

const invalid = report.functions.filter(f => !f.hasEntrypoint);
if (invalid.length > 0) {
  console.error(`\n❌ ${invalid.length} função(ões) sem entrypoint válido!`);
  process.exit(1);
}

console.log('\n✅ Todas as Edge Functions têm entrypoint válido!');

