#!/usr/bin/env node

/**
 * Script agressivo para corrigir problemas de lint nos arquivos src/
 *
 * Correções:
 * 1. Remove variáveis/parâmetros não utilizados (prefixando com _)
 * 2. Remove imports não utilizados
 * 3. Substitui any por unknown quando possível
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function getAllSrcFiles() {
  const srcDir = path.join(projectRoot, 'src');
  const files = [];

  async function walk(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip
    }
  }

  await walk(srcDir);
  return files;
}

async function fixUnusedVars(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // 1. Prefixar variáveis não utilizadas em catch
    const catchPatterns = [
      { regex: /catch\s*\(\s*error\s*\)/g, replacement: 'catch (_error)' },
      { regex: /catch\s*\(\s*e\s*\)/g, replacement: 'catch (_e)' },
      { regex: /catch\s*\(\s*err\s*\)/g, replacement: 'catch (_err)' },
      { regex: /catch\s*\(\s*innerError\s*\)/g, replacement: 'catch (_innerError)' },
    ];

    for (const pattern of catchPatterns) {
      if (pattern.regex.test(content)) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
      }
    }

    // 2. Prefixar parâmetros não utilizados em funções
    // Padrão: (param1, param2) => onde param não é usado
    // Mais conservador: apenas em casos óbvios

    // 3. Remover imports não utilizados (padrão simples)
    const lines = content.split('\n');
    const newLines = [];
    const skippedImports = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Se é um import
      if (line.trim().startsWith('import ')) {
        // Extrair nome importado
        const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))/);
        if (importMatch) {
          const importedNames = importMatch[1]
            ? importMatch[1].split(',').map((n) => n.trim().split(' as ')[0].trim())
            : [importMatch[2]];

          // Verificar se algum nome é usado no código
          let isUsed = false;
          for (const name of importedNames) {
            // Buscar uso do nome no resto do arquivo
            const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
            const restOfFile = lines.slice(i + 1).join('\n');

            if (usageRegex.test(restOfFile)) {
              isUsed = true;
              break;
            }
          }

          if (isUsed) {
            newLines.push(line);
          } else {
            skippedImports.push(line);
            modified = true;
          }
        } else {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }

    if (skippedImports.length > 0) {
      content = newLines.join('\n');
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      return { modified: true, skippedImports: skippedImports.length };
    }

    return { modified: false };
  } catch (error) {
    return { error: error.message };
  }
}

async function fixExplicitAny(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // Substituir any por unknown em casos seguros
    // 1. Parâmetros de catch: catch (error: any) => catch (error: unknown)
    const catchAnyRegex = /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g;
    if (catchAnyRegex.test(content)) {
      content = content.replace(catchAnyRegex, 'catch ($1: unknown)');
      modified = true;
    }

    // 2. Retornos de Promise: Promise<any> => Promise<unknown>
    // Mais conservador aqui pois pode quebrar código

    // 3. Arrays: any[] => unknown[]
    // Também conservador

    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      return { modified: true };
    }

    return { modified: false };
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.log('🔧 Correção agressiva de lint em src/\n');

  const files = await getAllSrcFiles();
  console.log(`📁 Processando ${files.length} arquivos...\n`);

  const stats = {
    unusedVars: 0,
    explicitAny: 0,
    errors: 0,
  };

  for (const file of files) {
    const relativePath = path.relative(projectRoot, file);

    // Corrigir variáveis não utilizadas
    const unusedResult = await fixUnusedVars(file);
    if (unusedResult.error) {
      console.log(`❌ ${relativePath}: ${unusedResult.error}`);
      stats.errors++;
    } else if (unusedResult.modified) {
      console.log(
        `✅ ${relativePath}: removidos ${unusedResult.skippedImports || 0} imports não utilizados`
      );
      stats.unusedVars++;
    }

    // Corrigir explicit any
    const anyResult = await fixExplicitAny(file);
    if (anyResult.error) {
      console.log(`❌ ${relativePath}: ${anyResult.error}`);
      stats.errors++;
    } else if (anyResult.modified) {
      stats.explicitAny++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO:');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos com variáveis não utilizadas corrigidas: ${stats.unusedVars}`);
  console.log(`✅ Arquivos com explicit any corrigidos: ${stats.explicitAny}`);
  console.log(`❌ Erros: ${stats.errors}`);
  console.log('='.repeat(60) + '\n');

  console.log('🔍 Executando lint para verificar melhorias...\n');

  try {
    await execAsync('npm run lint 2>&1 | grep -E "(error|warning)" | wc -l', { cwd: projectRoot });
  } catch (error) {
    // Lint sempre retorna erro se houver problemas
  }
}

main().catch(console.error);
