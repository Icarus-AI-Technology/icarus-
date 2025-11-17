import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const matrixPath = path.join(projectRoot, 'coverage-matrix.json');

if (!fs.existsSync(matrixPath)) {
  console.error('❌ Matriz de cobertura não encontrada. Execute: node tools/qa/generate-coverage-matrix.js');
  process.exit(1);
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

console.log('🔍 Validando cobertura de testes...\n');

const minCoveragePercent = parseInt(process.env.MIN_COVERAGE || '60', 10);

console.log(`📊 Estatísticas:`);
console.log(`   Cobertura atual: ${matrix.summary.coveragePercentage}%`);
console.log(`   Cobertura mínima: ${minCoveragePercent}%`);
console.log(`   Arquivos sem testes: ${matrix.missingTests.length}`);

if (matrix.summary.coveragePercentage < minCoveragePercent) {
  console.error(`\n❌ Cobertura abaixo do mínimo! (${matrix.summary.coveragePercentage}% < ${minCoveragePercent}%)`);
  process.exit(1);
}

console.log('\n✅ Cobertura de testes adequada!');
process.exit(0);

