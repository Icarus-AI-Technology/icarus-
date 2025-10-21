#!/usr/bin/env node
/**
 * Migração COMPLETA de Hex Colors - Fase Final
 * Remove TODAS as cores hex exceto Design System
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Mapa COMPLETO de cores hex para CSS vars
const COLOR_MAP = {
  // Branco (permitido inline mas pode migrar)
  '#ffffff': '#ffffff',
  '#FFFFFF': '#ffffff',
  '#fff': '#fff',
  '#FFF': '#fff',
  
  // Preto
  '#000000': '#000000',
  '#000': '#000',
  
  // Gray escala completa
  '#1f2937': 'var(--orx-gray-800)',
  '#1F2937': 'var(--orx-gray-800)',
  '#6b7280': 'var(--orx-gray-500)',
  '#6B7280': 'var(--orx-gray-500)',
  '#9ca3af': 'var(--orx-gray-400)',
  '#9CA3AF': 'var(--orx-gray-400)',
  '#f9fafb': 'var(--orx-gray-50)',
  '#F9FAFB': 'var(--orx-gray-50)',
  '#f3f4f6': 'var(--orx-gray-100)',
  '#F3F4F6': 'var(--orx-gray-100)',
  
  // Indigo (Primária)
  '#6366f1': 'var(--orx-primary)',
  '#6366F1': 'var(--orx-primary)',
  '#4f46e5': 'var(--orx-primary-hover)',
  '#4F46E5': 'var(--orx-primary-hover)',
  '#4338ca': 'var(--orx-primary-active)',
  '#4338CA': 'var(--orx-primary-active)',
  '#818cf8': 'var(--orx-primary-light)',
  '#818CF8': 'var(--orx-primary-light)',
  '#a5b4fc': 'var(--orx-primary-lighter)',
  '#A5B4FC': 'var(--orx-primary-lighter)',
  '#eef2ff': 'var(--orx-indigo-50)',
  '#EEF2FF': 'var(--orx-indigo-50)',
  '#e0e7ff': 'var(--orx-indigo-100)',
  '#E0E7FF': 'var(--orx-indigo-100)',
  '#c7d2fe': 'var(--orx-indigo-200)',
  '#C7D2FE': 'var(--orx-indigo-200)',
  '#3730a3': 'var(--orx-indigo-800)',
  '#3730A3': 'var(--orx-indigo-800)',
  '#312e81': 'var(--orx-indigo-900)',
  '#312E81': 'var(--orx-indigo-900)',
  
  // Success (Green)
  '#10b981': 'var(--orx-success)',
  '#10B981': 'var(--orx-success)',
  '#34d399': 'var(--orx-success)',
  '#34D399': 'var(--orx-success)',
  '#15803d': 'var(--orx-success-dark)',
  '#15803D': 'var(--orx-success-dark)',
  '#d1fae5': 'var(--orx-success-light)',
  '#D1FAE5': 'var(--orx-success-light)',
  
  // Warning (Orange/Amber)
  '#f59e0b': 'var(--orx-warning)',
  '#F59E0B': 'var(--orx-warning)',
  '#fb923c': 'var(--orx-warning)',
  '#FB923C': 'var(--orx-warning)',
  '#92400e': 'var(--orx-warning-dark)',
  '#92400E': 'var(--orx-warning-dark)',
  '#fef3c7': 'var(--orx-warning-light)',
  '#FEF3C7': 'var(--orx-warning-light)',
  
  // Error (Red)
  '#ef4444': 'var(--orx-error)',
  '#EF4444': 'var(--orx-error)',
  '#f87171': 'var(--orx-error)',
  '#F87171': 'var(--orx-error)',
  '#dc2626': 'var(--orx-error-dark)',
  '#DC2626': 'var(--orx-error-dark)',
  '#fecaca': 'var(--orx-error-light)',
  '#FECACA': 'var(--orx-error-light)',
  
  // Info (Blue)
  '#3b82f6': 'var(--orx-info)',
  '#3B82F6': 'var(--orx-info)',
  '#1e40af': 'var(--orx-info-dark)',
  '#1E40AF': 'var(--orx-info-dark)',
  '#dbeafe': 'var(--orx-info-light)',
  '#DBEAFE': 'var(--orx-info-light)',
  
  // Teal
  '#f0fdfa': 'var(--orx-teal-50)',
  '#F0FDFA': 'var(--orx-teal-50)',
  '#ccfbf1': 'var(--orx-teal-100)',
  '#CCFBF1': 'var(--orx-teal-100)',
  '#99f6e4': 'var(--orx-teal-200)',
  '#99F6E4': 'var(--orx-teal-200)',
  '#5eead4': 'var(--orx-teal-300)',
  '#5EEAD4': 'var(--orx-teal-300)',
  '#2dd4bf': 'var(--orx-teal-400)',
  '#2DD4BF': 'var(--orx-teal-400)',
  '#14b8a6': 'var(--orx-teal-500)',
  '#14B8A6': 'var(--orx-teal-500)',
  '#0d9488': 'var(--orx-teal-600)',
  '#0D9488': 'var(--orx-teal-600)',
  '#0f766e': 'var(--orx-teal-700)',
  '#0F766E': 'var(--orx-teal-700)',
  '#115e59': 'var(--orx-teal-800)',
  '#115E59': 'var(--orx-teal-800)',
  '#134e4a': 'var(--orx-teal-900)',
  '#134E4A': 'var(--orx-teal-900)',
  
  // Pink
  '#ec4899': 'var(--orx-pink-500)',
  '#EC4899': 'var(--orx-pink-500)',
  
  // Purple
  '#8b5cf6': 'var(--orx-purple-500)',
  '#8B5CF6': 'var(--orx-purple-500)',
  
  // Cyan
  '#06b6d4': 'var(--orx-cyan-500)',
  '#06B6D4': 'var(--orx-cyan-500)',
  
  // Neumorphic backgrounds
  '#e0e5ec': 'var(--orx-bg-light)',
  '#E0E5EC': 'var(--orx-bg-light)',
  '#2d3748': 'var(--orx-bg-dark)',
  '#2D3748': 'var(--orx-bg-dark)',
  '#a3b1c6': 'var(--orx-shadow-light-1)',
  '#A3B1C6': 'var(--orx-shadow-light-1)',
  '#1a202c': 'var(--orx-shadow-dark-1)',
  '#1A202C': 'var(--orx-shadow-dark-1)',
  '#3d4a5c': 'var(--orx-shadow-dark-2)',
  '#3D4A5C': 'var(--orx-shadow-dark-2)',
};

function migrarArquivo(path) {
  // Pular arquivos de Design System
  if (path.includes('oraclusx-ds.css') || path.includes('globals.css')) {
    return { modificado: false, mudancas: 0 };
  }
  
  let content = readFileSync(path, 'utf8');
  let original = content;
  let mudancas = 0;
  
  // Migrar cada cor
  Object.entries(COLOR_MAP).forEach(([hex, cssVar]) => {
    // Contar ocorrências antes
    const antes = (content.match(new RegExp(hex, 'gi')) || []).length;
    
    if (antes > 0) {
      // Substituir todas as ocorrências (case-insensitive)
      content = content.replace(new RegExp(hex, 'gi'), cssVar);
      mudancas += antes;
    }
  });
  
  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    return { modificado: true, mudancas };
  }
  
  return { modificado: false, mudancas: 0 };
}

async function main() {
  // Processar TODOS os arquivos relevantes
  const files = await glob('src/**/*.{tsx,ts}', {
    ignore: ['**/*.bak', '**/node_modules/**']
  });
  
  let count = 0;
  let totalMudancas = 0;
  
  console.log(`\n🎨 Migração COMPLETA de Cores: processando ${files.length} arquivos...\n`);
  
  for (const file of files) {
    try {
      const result = migrarArquivo(file);
      if (result.modificado) {
        console.log(`✅ ${file} (${result.mudancas} cores migradas)`);
        count++;
        totalMudancas += result.mudancas;
      }
    } catch (err) {
      console.error(`❌ ${file}:`, err.message);
    }
  }
  
  console.log(`\n🎉 ${count} arquivos modificados!`);
  console.log(`🎨 Total de ${totalMudancas} cores migradas\n`);
}

main().catch(console.error);

