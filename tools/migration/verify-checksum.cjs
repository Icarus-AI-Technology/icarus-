import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetArg = process.argv.find(a => a.startsWith('--target='));
const root = targetArg 
  ? targetArg.split('=')[1] 
  : '/users/daxmenghel/icarus-v5.0/';

console.log(`🔐 Verificando integridade dos arquivos em: ${root}\n`);

if (!fs.existsSync(root)) {
  console.error(`❌ Diretório não encontrado: ${root}`);
  process.exit(1);
}

function* walk(dir, baseDir = dir) {
  try {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      
      // Pular diretórios blacklisted
      if (['node_modules', 'dist', 'build', '.git', 'coverage', 'logs'].includes(entry)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        yield* walk(fullPath, baseDir);
      } else {
        yield { path: fullPath, relativePath: path.relative(baseDir, fullPath) };
      }
    }
  } catch (error) {
    console.error(`⚠️  Erro ao ler diretório ${dir}: ${error.message}`);
  }
}

const hash = crypto.createHash('sha256');
const files = [];
let totalSize = 0;

for (const file of walk(root)) {
  try {
    const content = fs.readFileSync(file.path);
    hash.update(content);
    files.push({
      path: file.relativePath,
      size: content.length,
      hash: crypto.createHash('sha256').update(content).digest('hex')
    });
    totalSize += content.length;
  } catch (error) {
    console.error(`⚠️  Erro ao processar ${file.relativePath}: ${error.message}`);
  }
}

const checksum = hash.digest('hex');

const report = {
  timestamp: new Date().toISOString(),
  target: root,
  checksum,
  totalFiles: files.length,
  totalSize,
  files: files.slice(0, 50) // Primeiros 50 arquivos para não ficar muito grande
};

const reportPath = path.join(root, 'checksum-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`📊 Relatório de Integridade:`);
console.log(`   Total de arquivos: ${files.length}`);
console.log(`   Tamanho total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Checksum SHA256: ${checksum}`);
console.log(`\n✅ Relatório salvo: ${reportPath}`);

// Salvar também no diretório de desenvolvimento para comparação
const devReportPath = path.resolve(__dirname, '../../checksum-report-prod.json');
fs.writeFileSync(devReportPath, JSON.stringify(report, null, 2));
console.log(`✅ Cópia do relatório salva em: ${devReportPath}`);

