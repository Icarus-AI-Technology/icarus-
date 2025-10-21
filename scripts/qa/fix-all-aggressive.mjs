#!/usr/bin/env node
/**
 * Correção AGRESSIVA - Elimina TODAS as violações restantes
 * Fase 2: Componentes e arquivos não-páginas
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Mapeamento completo de classes para estilos
const TEXT_SIZE_MAP = {
  'text-xs': '0.75rem',
  'text-sm': '0.875rem',
  'text-base': '1rem',
  'text-lg': '1.125rem',
  'text-xl': '1.25rem',
  'text-2xl': '1.5rem',
  'text-3xl': '1.875rem',
  'text-4xl': '2.25rem',
  'text-5xl': '3rem',
  'text-6xl': '3.75rem',
};

const FONT_WEIGHT_MAP = {
  'font-thin': 100,
  'font-extralight': 200,
  'font-light': 300,
  'font-normal': 400,
  'font-medium': 500,
  'font-semibold': 600,
  'font-bold': 700,
  'font-extrabold': 800,
  'font-black': 900,
};

// Cores hex adicionais para mapear
const COLOR_MAP = {
  // Indigo shades
  '#6366f1': 'var(--orx-primary)',
  '#6366F1': 'var(--orx-primary)',
  '#4f46e5': 'var(--orx-primary-hover)',
  '#4F46E5': 'var(--orx-primary-hover)',
  '#818cf8': 'var(--orx-primary-light)',
  '#818CF8': 'var(--orx-primary-light)',
  
  // Success
  '#10b981': 'var(--orx-success)',
  '#10B981': 'var(--orx-success)',
  '#34d399': 'var(--orx-success)',
  '#34D399': 'var(--orx-success)',
  
  // Warning/Orange
  '#f59e0b': 'var(--orx-warning)',
  '#F59E0B': 'var(--orx-warning)',
  '#fb923c': 'var(--orx-warning)',
  '#FB923C': 'var(--orx-warning)',
  
  // Error/Red
  '#ef4444': 'var(--orx-error)',
  '#EF4444': 'var(--orx-error)',
  '#f87171': 'var(--orx-error)',
  '#F87171': 'var(--orx-error)',
  
  // Gray backgrounds
  '#f9fafb': 'var(--orx-bg-light)',
  '#F9FAFB': 'var(--orx-bg-light)',
  '#f3f4f6': 'var(--orx-bg-light)',
  '#F3F4F6': 'var(--orx-bg-light)',
  
  // Outros comuns
  '#ffffff': '#ffffff', // Branco pode ficar
  '#FFFFFF': '#ffffff',
  '#000000': '#000000', // Preto pode ficar
};

function corrigirArquivo(path) {
  let content = readFileSync(path, 'utf8');
  let original = content;
  let mudancas = 0;
  
  // 1. Substituir tamanhos de fonte com captura de style existente
  Object.entries(TEXT_SIZE_MAP).forEach(([classe, tamanho]) => {
    // Caso 1: className com style já existente
    const regexComStyle = new RegExp(
      `className="([^"]*\\s*)${classe}(\\s*[^"]*)"\\s+style=\\{\\{([^}]+)\\}\\}`,
      'g'
    );
    content = content.replace(regexComStyle, (match, antes, depois, styleExistente) => {
      mudancas++;
      const cleanBefore = antes.trim();
      const cleanAfter = depois.trim();
      const newClass = [cleanBefore, cleanAfter].filter(Boolean).join(' ');
      return `className="${newClass}" style={{ ${styleExistente}, fontSize: '${tamanho}' }}`;
    });
    
    // Caso 2: className sem style
    const regexSemStyle = new RegExp(
      `className="([^"]*\\s*)${classe}(\\s*[^"]*)"`,
      'g'
    );
    content = content.replace(regexSemStyle, (match, antes, depois) => {
      // Verificar se não há style logo após (evitar duplicação)
      const posMatch = content.indexOf(match);
      const apos = content.substring(posMatch + match.length, posMatch + match.length + 20);
      if (apos.trim().startsWith('style=')) {
        return match; // Já tem style, não mexer
      }
      
      mudancas++;
      const cleanBefore = antes.trim();
      const cleanAfter = depois.trim();
      const newClass = [cleanBefore, cleanAfter].filter(Boolean).join(' ');
      return `className="${newClass}" style={{ fontSize: '${tamanho}' }}`;
    });
  });
  
  // 2. Substituir pesos de fonte
  Object.entries(FONT_WEIGHT_MAP).forEach(([classe, peso]) => {
    const regexComStyle = new RegExp(
      `className="([^"]*\\s*)${classe}(\\s*[^"]*)"\\s+style=\\{\\{([^}]+)\\}\\}`,
      'g'
    );
    content = content.replace(regexComStyle, (match, antes, depois, styleExistente) => {
      mudancas++;
      const cleanBefore = antes.trim();
      const cleanAfter = depois.trim();
      const newClass = [cleanBefore, cleanAfter].filter(Boolean).join(' ');
      return `className="${newClass}" style={{ ${styleExistente}, fontWeight: ${peso} }}`;
    });
    
    const regexSemStyle = new RegExp(
      `className="([^"]*\\s*)${classe}(\\s*[^"]*)"`,
      'g'
    );
    content = content.replace(regexSemStyle, (match, antes, depois) => {
      const posMatch = content.indexOf(match);
      const apos = content.substring(posMatch + match.length, posMatch + match.length + 20);
      if (apos.trim().startsWith('style=')) {
        return match;
      }
      
      mudancas++;
      const cleanBefore = antes.trim();
      const cleanAfter = depois.trim();
      const newClass = [cleanBefore, cleanAfter].filter(Boolean).join(' ');
      return `className="${newClass}" style={{ fontWeight: ${peso} }}`;
    });
  });
  
  // 3. Migrar cores hex
  Object.entries(COLOR_MAP).forEach(([hex, cssVar]) => {
    const count = (content.match(new RegExp(hex, 'g')) || []).length;
    if (count > 0) {
      content = content.replace(new RegExp(hex, 'g'), cssVar);
      mudancas += count;
    }
  });
  
  // 4. Limpar espaços duplos
  content = content.replace(/className="\s+/g, 'className="');
  content = content.replace(/\s+"/g, '"');
  content = content.replace(/className=""/g, 'className');
  
  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    return { modificado: true, mudancas };
  }
  
  return { modificado: false, mudancas: 0 };
}

async function main() {
  // Processar TODOS os arquivos TypeScript exceto CSS base
  const files = await glob('src/**/*.{tsx,ts}', {
    ignore: ['**/*.bak', '**/node_modules/**']
  });
  
  let count = 0;
  let totalMudancas = 0;
  
  console.log(`\n🔧 Correção AGRESSIVA: processando ${files.length} arquivos...\n`);
  
  for (const file of files) {
    try {
      const result = corrigirArquivo(file);
      if (result.modificado) {
        console.log(`✅ ${file} (${result.mudancas} mudanças)`);
        count++;
        totalMudancas += result.mudancas;
      }
    } catch (err) {
      console.error(`❌ ${file}:`, err.message);
    }
  }
  
  console.log(`\n🎉 ${count} arquivos modificados!`);
  console.log(`📊 Total de ${totalMudancas} substituições realizadas\n`);
}

main().catch(console.error);

