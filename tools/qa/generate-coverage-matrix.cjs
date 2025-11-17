import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📊 Gerando matriz de cobertura de testes...\n');

const projectRoot = path.resolve(__dirname, '../..');
const srcDir = path.join(projectRoot, 'src');
const testsDir = path.join(projectRoot, 'tests');

function* walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    
    if (stat.isDirectory()) {
      yield* walkSync(filepath);
    } else {
      yield filepath;
    }
  }
}

// Encontrar arquivos de código
const sourceFiles = [];
if (fs.existsSync(srcDir)) {
  for (const file of walkSync(srcDir)) {
    if (file.match(/\.(ts|tsx|js|jsx)$/) && !file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
      sourceFiles.push(file);
    }
  }
}

// Encontrar arquivos de teste
const testFiles = [];
for (const dir of [srcDir, testsDir]) {
  if (fs.existsSync(dir)) {
    for (const file of walkSync(dir)) {
      if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
        testFiles.push(file);
      }
    }
  }
}

const matrix = {
  timestamp: new Date().toISOString(),
  summary: {
    totalSourceFiles: sourceFiles.length,
    totalTestFiles: testFiles.length,
    coveragePercentage: sourceFiles.length > 0 
      ? Math.round((testFiles.length / sourceFiles.length) * 100) 
      : 0
  },
  sourceFiles: sourceFiles.map(f => path.relative(projectRoot, f)),
  testFiles: testFiles.map(f => path.relative(projectRoot, f)),
  missingTests: []
};

// Identificar arquivos sem testes (heurística simples)
for (const sourceFile of sourceFiles) {
  const relativePath = path.relative(projectRoot, sourceFile);
  const baseName = path.basename(sourceFile, path.extname(sourceFile));
  const hasTest = testFiles.some(testFile => {
    const testBaseName = path.basename(testFile).replace(/\.(test|spec)/, '');
    return testBaseName.includes(baseName);
  });
  
  if (!hasTest) {
    matrix.missingTests.push(relativePath);
  }
}

const outputPath = path.join(projectRoot, 'coverage-matrix.json');
fs.writeFileSync(outputPath, JSON.stringify(matrix, null, 2));

console.log(`✅ Matriz de cobertura gerada: ${outputPath}\n`);
console.log(`📊 Resumo:`);
console.log(`   Arquivos de código: ${matrix.summary.totalSourceFiles}`);
console.log(`   Arquivos de teste: ${matrix.summary.totalTestFiles}`);
console.log(`   Arquivos sem testes: ${matrix.missingTests.length}`);
console.log(`   Cobertura estimada: ${matrix.summary.coveragePercentage}%`);

if (matrix.missingTests.length > 0) {
  console.log(`\n⚠️  Arquivos sem testes detectados (primeiros 10):`);
  matrix.missingTests.slice(0, 10).forEach(file => {
    console.log(`     - ${file}`);
  });
  if (matrix.missingTests.length > 10) {
    console.log(`     ... e mais ${matrix.missingTests.length - 10} arquivo(s)`);
  }
}

