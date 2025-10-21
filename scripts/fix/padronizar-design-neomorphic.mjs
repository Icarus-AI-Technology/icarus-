#!/usr/bin/env node
/**
 * Script de Padronização Neumórfica — ICARUS v5.0
 * 
 * Este script automatiza a correção de:
 * 1. Elimina KPI Cards (substitui por estatísticas inline)
 * 2. Padroniza font-size de botões para 0.813rem
 * 3. Garante ícone + texto na mesma linha (inline-flex)
 * 
 * Uso: node scripts/fix/padronizar-design-neomorphic.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

// Estatísticas
const stats = {
  filesProcessed: 0,
  kpiCardsRemoved: 0,
  buttonsFixed: 0,
  fontSizeFixed: 0,
};

/**
 * Encontra todos os arquivos .tsx em um diretório
 */
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Remove KPI Cards e substitui por estatísticas inline
 */
function removeKPICards(content) {
  let modified = content;
  let removedCount = 0;

  // Padrão 1: Grid de KPI Cards com 4 colunas
  const kpiCardGridPattern = /<div[^>]*className="grid[^"]*grid-cols-[1-4].*?md:grid-cols-[2-4].*?lg:grid-cols-4[^"]*"[^>]*>[\s\S]*?{kpis\.map[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  
  if (kpiCardGridPattern.test(modified)) {
    modified = modified.replace(kpiCardGridPattern, (match) => {
      removedCount++;
      return `{/* TODO: Substituir por estatísticas inline */}\n      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1rem', background: 'var(--orx-bg-light)', borderRadius: '0.75rem' }}>\n        {kpis.map((kpi, index) => {\n          const Icon = kpi.icon;\n          return (\n            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>\n              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n                <Icon size={20} style={{ color: 'white' }} />\n              </div>\n              <div>\n                <div style={{ fontSize: '1.5rem', fontWeight: 'var(--orx-font-bold)', color: 'var(--orx-text-primary)' }}>{kpi.value}</div>\n                <div style={{ fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>{kpi.label}</div>\n              </div>\n            </div>\n          );\n        })}\n      </div>`;
    });
  }

  // Padrão 2: Componente KPICard isolado
  const kpiCardComponentPattern = /<KPICard[^>]*\/>/g;
  if (kpiCardComponentPattern.test(modified)) {
    modified = modified.replace(kpiCardComponentPattern, () => {
      removedCount++;
      return '{/* KPICard removido - usar estatísticas inline */}';
    });
  }

  // Padrão 3: Definição do componente KPICard (remover completamente)
  const kpiCardDefinitionPattern = /const KPICard[^=]*=[\s\S]*?};/g;
  if (kpiCardDefinitionPattern.test(modified)) {
    modified = modified.replace(kpiCardDefinitionPattern, '// KPICard component removed');
    removedCount++;
  }

  return { content: modified, removedCount };
}

/**
 * Padroniza font-size de botões para 0.813rem
 */
function standardizeButtonFontSize(content) {
  let modified = content;
  let fixedCount = 0;

  // Padrão 1: <button> com <span> sem fontSize definido
  const buttonSpanPattern = /(<button[^>]*>[\s\S]*?<.*?size=\{\d+\}\s*\/>[\s\S]*?)<span(?![^>]*fontSize)([^>]*)>(.*?)<\/span>/g;
  
  modified = modified.replace(buttonSpanPattern, (match, before, spanAttrs, spanContent) => {
    fixedCount++;
    return `${before}<span${spanAttrs} style={{ fontSize: '0.813rem' }}>${spanContent}</span>`;
  });

  // Padrão 2: <button> com fontSize diferente de 0.813rem
  const incorrectFontSizePattern = /fontSize:\s*['"](?!0\.813rem)[^'"]+['"]/g;
  
  if (incorrectFontSizePattern.test(modified)) {
    modified = modified.replace(incorrectFontSizePattern, "fontSize: '0.813rem'");
    fixedCount++;
  }

  // Padrão 3: <button> com var(--orx-text-base) ou var(--orx-text-sm)
  const varFontSizePattern = /fontSize:\s*['"]var\(--orx-text-(?:base|sm)\)['"]/g;
  
  if (varFontSizePattern.test(modified)) {
    modified = modified.replace(varFontSizePattern, "fontSize: '0.813rem'");
    fixedCount++;
  }

  return { content: modified, fixedCount };
}

/**
 * Garante que ícones e texto estejam na mesma linha (inline-flex)
 */
function fixButtonIconTextAlignment(content) {
  let modified = content;
  let fixedCount = 0;

  // Padrão 1: <button> com flex-col (errado)
  const flexColPattern = /<button([^>]*)className="([^"]*)flex-col([^"]*)"/g;
  
  modified = modified.replace(flexColPattern, (match, before, classPrefix, classAffix) => {
    fixedCount++;
    return `<button${before}className="${classPrefix}${classAffix}"`;
  });

  // Padrão 2: <button> sem display: flex ou inline-flex
  const buttonWithoutFlexPattern = /<button(?![^>]*display:\s*['"](?:inline-)?flex['"])([^>]*style=\{(?!\{[^}]*display)[^}]*\})([^>]*)>/g;
  
  modified = modified.replace(buttonWithoutFlexPattern, (match, styleAttr, rest) => {
    // Adicionar display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
    const newStyle = styleAttr.replace(/style=\{/, "style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', ");
    fixedCount++;
    return `<button${newStyle}${rest}>`;
  });

  return { content: modified, fixedCount };
}

/**
 * Processa um arquivo TSX
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. Remover KPI Cards
    const kpiResult = removeKPICards(content);
    if (kpiResult.removedCount > 0) {
      content = kpiResult.content;
      stats.kpiCardsRemoved += kpiResult.removedCount;
      modified = true;
    }

    // 2. Padronizar font-size de botões
    const fontSizeResult = standardizeButtonFontSize(content);
    if (fontSizeResult.fixedCount > 0) {
      content = fontSizeResult.content;
      stats.fontSizeFixed += fontSizeResult.fixedCount;
      modified = true;
    }

    // 3. Corrigir alinhamento de ícones e texto
    const alignmentResult = fixButtonIconTextAlignment(content);
    if (alignmentResult.fixedCount > 0) {
      content = alignmentResult.content;
      stats.buttonsFixed += alignmentResult.fixedCount;
      modified = true;
    }

    // Salvar arquivo se modificado
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      const relPath = path.relative(projectRoot, filePath);
      log.success(`Arquivo modificado: ${relPath}`);
      stats.filesProcessed++;
    }

  } catch (error) {
    log.error(`Erro ao processar ${filePath}: ${error.message}`);
  }
}

/**
 * Função principal
 */
function main() {
  log.title('🎨 PADRONIZAÇÃO NEUMÓRFICA — ICARUS v5.0');

  log.info('Buscando arquivos .tsx em src/pages e src/components...');
  
  const pagesDir = path.join(projectRoot, 'src/pages');
  const componentsDir = path.join(projectRoot, 'src/components');

  const tsxFiles = [
    ...findTsxFiles(pagesDir),
    ...findTsxFiles(componentsDir),
  ];

  log.info(`Encontrados ${tsxFiles.length} arquivos .tsx`);
  log.info('Aplicando correções...\n');

  tsxFiles.forEach((file) => {
    processFile(file);
  });

  // Relatório final
  log.title('📊 RELATÓRIO DE PADRONIZAÇÃO');
  console.log(`  Arquivos processados: ${stats.filesProcessed}`);
  console.log(`  KPI Cards removidos: ${stats.kpiCardsRemoved}`);
  console.log(`  Font-sizes corrigidos: ${stats.fontSizeFixed}`);
  console.log(`  Botões corrigidos: ${stats.buttonsFixed}`);
  console.log('');

  if (stats.filesProcessed > 0) {
    log.success('Padronização concluída com sucesso!');
    log.warning('IMPORTANTE: Revise as mudanças antes de fazer commit.');
    log.info('Execute "npm run type-check" para verificar erros TypeScript.');
  } else {
    log.info('Nenhum arquivo precisou ser modificado.');
  }
}

main();

