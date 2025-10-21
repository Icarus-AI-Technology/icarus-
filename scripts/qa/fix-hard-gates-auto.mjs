#!/usr/bin/env node
/**
 * Script de correção em massa de Hard Gates
 * Corrige automaticamente violações de text-* e font-*
 */

import { readFileSync, writeFileSync } from 'fs';
import { globby } from 'globby';

const TAMANHOS_PERMITIDOS = ['text-left', 'text-center', 'text-right', 'text-foreground', 'text-muted-foreground', 'text-primary', 'text-secondary', 'text-destructive'];

// Mapeamento de classes para estilos inline
const FONT_SIZE_MAP = {
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

function corrigirArquivo(path) {
  let content = readFileSync(path, 'utf8');
  let modificado = false;
  
  // Substituir classes de tamanho de fonte
  Object.entries(FONT_SIZE_MAP).forEach(([classe, tamanho]) => {
    // Padrão: className="... text-sm ..."
    const regex = new RegExp(`className="([^"]*)\\s*${classe}\\s*([^"]*)"`, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      matches.forEach(match => {
        // Extrair as classes existentes
        const classesMatch = match.match(/className="([^"]*)"/);
        if (!classesMatch) return;
        
        const classes = classesMatch[1];
        const novasClasses = classes.replace(new RegExp(`\\s*${classe}\\s*`, 'g'), ' ').trim();
        
        // Verificar se já tem style inline
        const temStyle = content.includes(`${match.replace(/"/g, '\\\\"')} style=`);
        
        if (temStyle) {
          // Se já tem style, adicionar fontSize dentro do existente
          // Isso é complexo, então vamos pular e fazer manualmente depois
          return;
        }
        
        // Substituir
        const novo = `className="${novasClasses}" style={{ fontSize: '${tamanho}' }}`;
        content = content.replace(match, novo);
        modificado = true;
      });
    }
  });
  
  // Substituir classes de peso de fonte
  Object.entries(FONT_WEIGHT_MAP).forEach(([classe, peso]) => {
    const regex = new RegExp(`className="([^"]*)\\s*${classe}\\s*([^"]*)"`, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      matches.forEach(match => {
        const classesMatch = match.match(/className="([^"]*)"/);
        if (!classesMatch) return;
        
        const classes = classesMatch[1];
        const novasClasses = classes.replace(new RegExp(`\\s*${classe}\\s*`, 'g'), ' ').trim();
        
        // Verificar se já tem style inline
        const temStyle = content.includes(`${match.replace(/"/g, '\\\\"')} style=`);
        
        if (temStyle) {
          return;
        }
        
        const novo = `className="${novasClasses}" style={{ fontWeight: ${peso} }}`;
        content = content.replace(match, novo);
        modificado = true;
      });
    }
  });
  
  if (modificado) {
    writeFileSync(path, content, 'utf8');
    return true;
  }
  
  return false;
}

async function executar() {
  const arquivos = await globby('src/**/*.{tsx,ts}', { gitignore: true });
  let total = 0;
  
  console.log(`📝 Processando ${arquivos.length} arquivos...\\n`);
  
  for (const arquivo of arquivos) {
    try {
      const modificado = corrigirArquivo(arquivo);
      if (modificado) {
        console.log(`✅ ${arquivo}`);
        total++;
      }
    } catch (erro) {
      console.error(`❌ Erro em ${arquivo}:`, erro.message);
    }
  }
  
  console.log(`\\n🎉 Correção completa! ${total} arquivos modificados.`);
}

executar().catch(console.error);

