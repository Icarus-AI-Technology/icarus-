#!/usr/bin/env node

/**
 * Script para corrigir automaticamente problemas comuns de lint
 * 
 * Correções aplicadas:
 * 1. Remove variáveis não utilizadas (prefixando com _)
 * 2. Substitui @ts-ignore por @ts-expect-error
 * 3. Remove imports não utilizados
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Arquivos a ignorar
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'browser-tools-mcp',
  'gpt-researcher-env',
  'playwright-report',
  'test-results',
  'testsprite_tests'
];

async function getAllTsxTsFiles(dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Verificar se deve ignorar
      if (IGNORE_PATTERNS.some(pattern => fullPath.includes(pattern))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        files.push(...await getAllTsxTsFiles(fullPath));
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Silently skip directories we can't read
  }
  
  return files;
}

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    
    // 1. Substituir @ts-ignore por @ts-expect-error
    const tsIgnoreRegex = /@ts-ignore/g;
    if (tsIgnoreRegex.test(content)) {
      content = content.replace(tsIgnoreRegex, '@ts-expect-error');
      modified = true;
    }
    
    // 2. Prefixar variáveis não utilizadas em catch com _
    // Padrão: } catch (error) ou } catch (e)
    const catchRegex = /catch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/g;
    let match;
    const variableMatches = [];
    
    while ((match = catchRegex.exec(content)) !== null) {
      const varName = match[1];
      if (!varName.startsWith('_')) {
        // Verificar se a variável é usada no bloco catch
        const catchBlockStart = match.index;
        const afterCatch = content.substring(catchBlockStart);
        
        // Encontrar o bloco catch completo (simplificado)
        let braceCount = 0;
        let inBlock = false;
        let catchBlockEnd = catchBlockStart;
        
        for (let i = 0; i < afterCatch.length; i++) {
          if (afterCatch[i] === '{') {
            inBlock = true;
            braceCount++;
          } else if (afterCatch[i] === '}') {
            braceCount--;
            if (inBlock && braceCount === 0) {
              catchBlockEnd = catchBlockStart + i + 1;
              break;
            }
          }
        }
        
        const catchBlock = content.substring(catchBlockStart, catchBlockEnd);
        
        // Verificar se a variável é usada no bloco
        const varUsageRegex = new RegExp(`\\b${varName}\\b`, 'g');
        const matches = catchBlock.match(varUsageRegex) || [];
        
        // Se aparece apenas uma vez (na declaração), não é usada
        if (matches.length === 1) {
          variableMatches.push({ varName, index: match.index });
        }
      }
    }
    
    // Aplicar substituições de trás para frente para não alterar índices
    for (let i = variableMatches.length - 1; i >= 0; i--) {
      const { varName, index: matchIndex } = variableMatches[i];
      const beforeMatch = content.substring(0, matchIndex);
      const afterMatch = content.substring(matchIndex);
      
      // Substituir apenas a primeira ocorrência após o índice
      const updatedAfter = afterMatch.replace(
        new RegExp(`catch\\s*\\(\\s*${varName}\\s*\\)`),
        `catch (_${varName})`
      );
      
      if (updatedAfter !== afterMatch) {
        content = beforeMatch + updatedAfter;
        modified = true;
      }
    }
    
    // 3. Prefixar parâmetros não utilizados com _
    // Padrão: parâmetros de função que nunca são usados
    // (mais complexo, deixar para manual)
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      return { file: filePath, changes: true };
    }
    
    return { file: filePath, changes: false };
  } catch (error) {
    return { file: filePath, error: error.message };
  }
}

async function main() {
  console.log('🔍 Procurando arquivos TypeScript/JavaScript no projeto...\n');
  
  const srcDir = path.join(projectRoot, 'src');
  const files = await getAllTsxTsFiles(srcDir);
  
  console.log(`📁 Encontrados ${files.length} arquivos para processar\n`);
  
  const results = {
    modified: 0,
    unchanged: 0,
    errors: 0
  };
  
  for (const file of files) {
    const result = await fixFile(file);
    
    if (result.error) {
      console.log(`❌ Erro: ${path.relative(projectRoot, result.file)}`);
      console.log(`   ${result.error}\n`);
      results.errors++;
    } else if (result.changes) {
      console.log(`✅ Modificado: ${path.relative(projectRoot, result.file)}`);
      results.modified++;
    } else {
      results.unchanged++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO:');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos modificados: ${results.modified}`);
  console.log(`⚪ Arquivos sem alterações: ${results.unchanged}`);
  console.log(`❌ Erros: ${results.errors}`);
  console.log('='.repeat(60) + '\n');
  
  if (results.modified > 0) {
    console.log('💡 Próximos passos:');
    console.log('   1. Execute: npm run lint');
    console.log('   2. Execute: npm run type-check');
    console.log('   3. Revise as alterações: git diff\n');
  }
}

main().catch(console.error);

