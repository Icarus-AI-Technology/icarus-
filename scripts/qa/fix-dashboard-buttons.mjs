#!/usr/bin/env node

/**
 * Script para corrigir os botões no DashboardPrincipal
 * Remove a chave extra e formata corretamente o style object
 */

import fs from 'fs/promises';

const filePath = '/Users/daxmeneghel/icarus-make/src/pages/DashboardPrincipal.tsx';

async function fixDashboardButtons() {
  try {
    let content = await fs.readFile(filePath, 'utf-8');

    // Padrão: style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', {
    // Deve ser: style={{
    //            display: 'inline-flex',
    //            alignItems: 'center',
    //            gap: '0.5rem',
    //            background...

    // Regex para encontrar o padrão problemático
    const badPattern =
      /style=\{\{\s*display:\s*'inline-flex',\s*alignItems:\s*'center',\s*gap:\s*'0\.5rem',\s*\{/g;

    if (badPattern.test(content)) {
      // Substituir pattern
      content = content.replace(
        badPattern,
        "style={{\n                display: 'inline-flex',\n                alignItems: 'center',\n                gap: '0.5rem',"
      );
      console.log('✅ Corrigido padrão de style object incorreto');
    }

    // Procurar por }} }} (fechamento duplo)
    content = content.replace(/\}\}\s*\}\}/g, '}}');

    await fs.writeFile(filePath, content, 'utf-8');
    console.log('✅ Arquivo salvo com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

fixDashboardButtons();
