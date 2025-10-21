#!/usr/bin/env node

/**
 * Script para corrigir todos os style objects com sintaxe incorreta
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function getAllTsxFiles(dir) {
  const files = [];
  
  async function walk(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
          continue;
        }
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip
    }
  }
  
  await walk(dir);
  return files;
}

async function fixStyleSyntax(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    
    // Padrão problemático: style={{ ..., {
    const badPattern = /style=\{\{\s*display:\s*'inline-flex',\s*alignItems:\s*'center',\s*gap:\s*'0\.5rem',\s*\{/g;
    
    if (badPattern.test(content)) {
      content = content.replace(badPattern, 'style={{\n                display: \'inline-flex\',\n                alignItems: \'center\',\n                gap: \'0.5rem\',');
      modified = true;
    }
    
    // Remover fechamentos duplos
    if (/\}\}\s*\}\}/.test(content)) {
      content = content.replace(/\}\}\s*\}\}/g, '}}');
      modified = true;
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      return { fixed: true, file: path.relative(projectRoot, filePath) };
    }
    
    return { fixed: false };
  } catch (error) {
    return { error: error.message, file: path.relative(projectRoot, filePath) };
  }
}

async function main() {
  console.log('🔧 Corrigindo sintaxe de style objects...\n');
  
  const srcDir = path.join(projectRoot, 'src');
  const files = await getAllTsxFiles(srcDir);
  
  console.log(`📁 Processando ${files.length} arquivos...\n`);
  
  let fixed = 0;
  let errors = 0;
  
  for (const file of files) {
    const result = await fixStyleSyntax(file);
    
    if (result.error) {
      console.log(`❌ ${result.file}: ${result.error}`);
      errors++;
    } else if (result.fixed) {
      console.log(`✅ ${result.file}`);
      fixed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Arquivos corrigidos: ${fixed}`);
  console.log(`❌ Erros: ${errors}`);
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);

