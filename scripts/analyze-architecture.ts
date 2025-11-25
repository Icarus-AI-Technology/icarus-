/**
 * Análise de Arquitetura do Icarus
 * Mapeia dependências, mocks e bibliotecas legadas
 */
import { globby } from 'globby';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface FileInfo {
  path: string;
  extension: string;
  imports: string[];
  exports: string[];
  hasMockData: boolean;
  mockExamples: Array<{ name: string; type: string; sample: string }>;
}

interface ArchitectureMap {
  timestamp: string;
  projectRoot: string;
  totalFiles: number;
  filesByExtension: Record<string, number>;
  components: FileInfo[];
  pages: FileInfo[];
  hooks: FileInfo[];
  services: FileInfo[];
  others: FileInfo[];
  mockData: Array<{ file: string; mocks: Array<{ name: string; sample: string }> }>;
  legacyLibraries: Array<{ name: string; usedIn: string[] }>;
  jsxFilesToConvert: string[];
  inferredInterfaces: Array<{ name: string; fields: string[]; sourceFile: string }>;
}

const LEGACY_LIBS = [
  '@radix-ui',
  'react-simple-maps',
  '@nivo/bar',
  '@nivo/core',
  '@nivo/line',
  '@nivo/pie',
];

function extractImports(content: string): string[] {
  const imports: string[] = [];
  
  // Match ES6 imports
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Match dynamic imports
  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return [...new Set(imports)];
}

function extractExports(content: string): string[] {
  const exports: string[] = [];
  
  // Match named exports
  const namedExportRegex = /export\s+(?:function|const|class|interface|type)\s+(\w+)/g;
  let match;
  
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  // Match default export
  if (/export\s+default/.test(content)) {
    exports.push('default');
  }
  
  return exports;
}

function detectMockData(content: string, filePath: string): { hasMock: boolean; mocks: Array<{ name: string; type: string; sample: string }> } {
  const mocks: Array<{ name: string; type: string; sample: string }> = [];
  
  // Pattern 1: const varName = [...] (array literal)
  const arrayMockRegex = /const\s+(\w*[Mm]ock\w*|\w*[Dd]ata\w*|\w*[Ss]ample\w*)\s*=\s*\[/g;
  let match;
  
  while ((match = arrayMockRegex.exec(content)) !== null) {
    const varName = match[1];
    const startIdx = match.index;
    const snippet = content.substring(startIdx, Math.min(startIdx + 200, content.length));
    
    mocks.push({
      name: varName,
      type: 'array',
      sample: snippet.replace(/\n/g, ' ').substring(0, 150) + '...',
    });
  }
  
  // Pattern 2: const varName = {...} (object literal)
  const objectMockRegex = /const\s+(\w*[Mm]ock\w*|\w*[Dd]ata\w*)\s*=\s*\{/g;
  while ((match = objectMockRegex.exec(content)) !== null) {
    const varName = match[1];
    const startIdx = match.index;
    const snippet = content.substring(startIdx, Math.min(startIdx + 200, content.length));
    
    mocks.push({
      name: varName,
      type: 'object',
      sample: snippet.replace(/\n/g, ' ').substring(0, 150) + '...',
    });
  }
  
  // Pattern 3: Hardcoded data in Dashboard.jsx
  if (filePath.includes('Dashboard.jsx') || filePath.includes('Dashboard.tsx')) {
    const hardcodedArrays = content.match(/const\s+(\w+Data|\w+ChartData)\s*=\s*\[/g);
    if (hardcodedArrays) {
      hardcodedArrays.forEach((found) => {
        const varName = found.match(/const\s+(\w+)/)?.[1];
        if (varName && !mocks.find((m) => m.name === varName)) {
          mocks.push({
            name: varName,
            type: 'hardcoded-chart-data',
            sample: found + '...]',
          });
        }
      });
    }
  }
  
  return {
    hasMock: mocks.length > 0,
    mocks,
  };
}

function inferInterfaces(mockData: Array<{ file: string; mocks: Array<{ name: string; sample: string }> }>): Array<{ name: string; fields: string[]; sourceFile: string }> {
  const interfaces: Array<{ name: string; fields: string[]; sourceFile: string }> = [];
  
  // Common patterns to extract interface names
  const commonEntities = [
    { pattern: /doctor/i, name: 'Doctor', fields: ['id', 'name', 'crm', 'specialty', 'avatar_url', 'status'] },
    { pattern: /patient/i, name: 'Patient', fields: ['id', 'name', 'cpf', 'birth_date', 'phone', 'email'] },
    { pattern: /financial|finance/i, name: 'FinancialMetric', fields: ['id', 'period', 'revenue', 'expenses', 'profit'] },
    { pattern: /surgery|cirurgia/i, name: 'Surgery', fields: ['id', 'patient_id', 'doctor_id', 'date', 'status', 'type'] },
    { pattern: /product|produto/i, name: 'Product', fields: ['id', 'name', 'code', 'manufacturer', 'price', 'stock'] },
    { pattern: /hospital/i, name: 'Hospital', fields: ['id', 'name', 'cnpj', 'address', 'phone'] },
  ];
  
  mockData.forEach((item) => {
    item.mocks.forEach((mock) => {
      commonEntities.forEach((entity) => {
        if (entity.pattern.test(mock.name) && !interfaces.find((i) => i.name === entity.name)) {
          interfaces.push({
            name: entity.name,
            fields: entity.fields,
            sourceFile: item.file,
          });
        }
      });
    });
  });
  
  return interfaces;
}

async function analyzeArchitecture(rootDir: string): Promise<ArchitectureMap> {
  console.log('🔍 Iniciando análise de arquitetura...');
  
  // Find all relevant files
  const files = await globby([
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!src/**/__tests__/**',
  ], {
    cwd: rootDir,
    absolute: true,
  });
  
  console.log(`📁 Encontrados ${files.length} arquivos para análise`);
  
  const filesByExtension: Record<string, number> = {};
  const components: FileInfo[] = [];
  const pages: FileInfo[] = [];
  const hooks: FileInfo[] = [];
  const services: FileInfo[] = [];
  const others: FileInfo[] = [];
  const mockData: Array<{ file: string; mocks: Array<{ name: string; sample: string }> }> = [];
  const legacyLibsUsage = new Map<string, Set<string>>();
  const jsxFilesToConvert: string[] = [];
  
  // Process each file
  for (const filePath of files) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = filePath.replace(rootDir + '/', '');
      const extension = filePath.split('.').pop() || '';
      
      // Count by extension
      filesByExtension[extension] = (filesByExtension[extension] || 0) + 1;
      
      // Track JSX files to convert
      if (extension === 'jsx' || extension === 'js') {
        jsxFilesToConvert.push(relativePath);
      }
      
      const imports = extractImports(content);
      const exports = extractExports(content);
      const mockDetection = detectMockData(content, relativePath);
      
      const fileInfo: FileInfo = {
        path: relativePath,
        extension,
        imports,
        exports,
        hasMockData: mockDetection.hasMock,
        mockExamples: mockDetection.mocks,
      };
      
      // Categorize file
      if (relativePath.includes('/components/')) {
        components.push(fileInfo);
      } else if (relativePath.includes('/pages/')) {
        pages.push(fileInfo);
      } else if (relativePath.includes('/hooks/')) {
        hooks.push(fileInfo);
      } else if (relativePath.includes('/services/') || relativePath.includes('/lib/services/')) {
        services.push(fileInfo);
      } else {
        others.push(fileInfo);
      }
      
      // Collect mock data
      if (mockDetection.hasMock) {
        mockData.push({
          file: relativePath,
          mocks: mockDetection.mocks.map((m) => ({ name: m.name, sample: m.sample })),
        });
      }
      
      // Track legacy library usage
      imports.forEach((imp) => {
        LEGACY_LIBS.forEach((legacyLib) => {
          if (imp.startsWith(legacyLib)) {
            if (!legacyLibsUsage.has(legacyLib)) {
              legacyLibsUsage.set(legacyLib, new Set());
            }
            legacyLibsUsage.get(legacyLib)!.add(relativePath);
          }
        });
      });
      
    } catch (error) {
      console.warn(`⚠️  Erro ao processar ${filePath}:`, error);
    }
  }
  
  // Build legacy libraries report
  const legacyLibraries = Array.from(legacyLibsUsage.entries()).map(([name, usedIn]) => ({
    name,
    usedIn: Array.from(usedIn),
  }));
  
  // Infer interfaces from mock data
  const inferredInterfaces = inferInterfaces(mockData);
  
  const result: ArchitectureMap = {
    timestamp: new Date().toISOString(),
    projectRoot: rootDir,
    totalFiles: files.length,
    filesByExtension,
    components,
    pages,
    hooks,
    services,
    others,
    mockData,
    legacyLibraries,
    jsxFilesToConvert,
    inferredInterfaces,
  };
  
  console.log(`✅ Análise concluída:`);
  console.log(`   - ${components.length} componentes`);
  console.log(`   - ${pages.length} páginas`);
  console.log(`   - ${hooks.length} hooks`);
  console.log(`   - ${services.length} serviços`);
  console.log(`   - ${mockData.length} arquivos com mocks`);
  console.log(`   - ${legacyLibraries.length} bibliotecas legadas em uso`);
  console.log(`   - ${jsxFilesToConvert.length} arquivos .jsx/.js para converter`);
  console.log(`   - ${inferredInterfaces.length} interfaces inferidas`);
  
  return result;
}

// Main execution
const rootDir = process.cwd();
const outputPath = join(rootDir, 'architecture_map.json');

analyzeArchitecture(rootDir)
  .then((map) => {
    writeFileSync(outputPath, JSON.stringify(map, null, 2), 'utf-8');
    console.log(`\n📄 Mapa salvo em: ${outputPath}`);
    
    // Print summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 RESUMO EXECUTIVO');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Total de arquivos analisados: ${map.totalFiles}`);
    console.log(`\nArquivos por tipo:`);
    Object.entries(map.filesByExtension).forEach(([ext, count]) => {
      console.log(`  .${ext}: ${count}`);
    });
    
    console.log(`\n🔍 Dados Mockados (${map.mockData.length} arquivos):`);
    map.mockData.slice(0, 5).forEach((item) => {
      console.log(`  - ${item.file}: ${item.mocks.length} mock(s)`);
    });
    
    console.log(`\n📚 Bibliotecas Legadas (${map.legacyLibraries.length}):`);
    map.legacyLibraries.forEach((lib) => {
      console.log(`  - ${lib.name}: usado em ${lib.usedIn.length} arquivo(s)`);
    });
    
    console.log(`\n🔄 Arquivos para converter (.jsx/.js → .tsx):`);
    map.jsxFilesToConvert.slice(0, 10).forEach((file) => {
      console.log(`  - ${file}`);
    });
    
    console.log(`\n🎯 Interfaces a criar (${map.inferredInterfaces.length}):`);
    map.inferredInterfaces.forEach((iface) => {
      console.log(`  - ${iface.name}: [${iface.fields.join(', ')}]`);
    });
    
    console.log('\n═══════════════════════════════════════════════════');
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

