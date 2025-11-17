import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const matrixPath = path.join(projectRoot, 'coverage-matrix.json');

if (!fs.existsSync(matrixPath)) {
  console.error('❌ Matriz de cobertura não encontrada. Execute: pnpm coverage:generate');
  process.exit(1);
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

console.log('🎯 Gerando testes automaticamente para arquivos críticos...\n');

// Categorias de arquivos críticos (prioridade alta)
const criticalPatterns = [
  /\/hooks\//,
  /\/lib\//,
  /\/utils\//,
  /\/services\//,
  /\/contexts\//,
  /\/pages\/Dashboard/,
  /\/components\/modules\//
];

// Filtrar arquivos críticos sem testes
const criticalFiles = matrix.missingTests.filter(file => 
  criticalPatterns.some(pattern => pattern.test(file)) &&
  !file.includes('.stories.') &&
  !file.includes('.backup.') &&
  !file.includes('-test.')
);

console.log(`📊 Arquivos críticos sem testes: ${criticalFiles.length}\n`);

// Template básico de teste
const generateTestTemplate = (filePath, fileName, isHook, isComponent) => {
  const testName = fileName.replace(/\.(tsx?|jsx?)$/, '');
  const importPath = filePath.replace(/^src\//, '@/').replace(/\.(tsx?|jsx?)$/, '');
  
  let template = `import { describe, it, expect, vi } from 'vitest';\n`;
  
  if (isComponent) {
    template += `import { render, screen } from '@testing-library/react';\n`;
  }
  
  if (isHook) {
    template += `import { renderHook, waitFor } from '@testing-library/react';\n`;
  }
  
  template += `import ${isComponent || isHook ? `{ ${testName} }` : `* as ${testName}Module`} from '${importPath}';\n\n`;
  
  template += `describe('${testName}', () => {\n`;
  template += `  it('deve estar definido', () => {\n`;
  
  if (isHook) {
    template += `    const { result } = renderHook(() => ${testName}());\n`;
    template += `    expect(result.current).toBeDefined();\n`;
  } else if (isComponent) {
    template += `    render(<${testName} />);\n`;
    template += `    expect(screen.getByRole('document')).toBeInTheDocument();\n`;
  } else {
    template += `    expect(${testName}Module).toBeDefined();\n`;
  }
  
  template += `  });\n\n`;
  template += `  // TODO: Adicionar mais testes específicos\n`;
  template += `});\n`;
  
  return template;
};

// Gerar testes para os 20 arquivos críticos
const LIMIT = 20;
let created = 0;

for (const file of criticalFiles.slice(0, LIMIT)) {
  const fullPath = path.join(projectRoot, file);
  const fileName = path.basename(file);
  const dir = path.dirname(fullPath);
  
  const isHook = file.includes('/hooks/');
  const isComponent = fileName.endsWith('.tsx') || fileName.endsWith('.jsx');
  
  const testFileName = fileName.replace(/\.(tsx?|jsx?)$/, '.test.$1');
  const testPath = path.join(dir, testFileName);
  
  // Pular se o teste já existe
  if (fs.existsSync(testPath)) {
    console.log(`⏭️  ${file} (teste já existe)`);
    continue;
  }
  
  const template = generateTestTemplate(file, fileName, isHook, isComponent);
  
  try {
    fs.writeFileSync(testPath, template);
    console.log(`✅ ${testFileName}`);
    created++;
  } catch (error) {
    console.error(`❌ Erro ao criar ${testFileName}: ${error.message}`);
  }
}

console.log(`\n📊 Resumo:`);
console.log(`   Testes gerados: ${created}`);
console.log(`   Arquivos críticos restantes: ${criticalFiles.length - created}`);
console.log(`\n✅ Testes criados com sucesso!`);
console.log(`\n📝 Próximo passo:`);
console.log(`   1. Revisar e melhorar os testes gerados`);
console.log(`   2. pnpm test`);
console.log(`   3. pnpm coverage:generate`);

