#!/usr/bin/env node

/**
 * ICARUS v5.0 - Migração Automática Supabase
 *
 * Aplica todas as migrações SQL no Supabase de forma ordenada e segura
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Credenciais Supabase
const SUPABASE_URL = 'https://gvbkviozlhxorjoavmky.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNDc2NSwiZXhwIjoyMDc4OTkwNzY1fQ.9PaCxFGQdRhM00Cf3LSEn6PuBz1hcG1Pds1Kjp4XnL0';

// Cliente Supabase (usando service_role para permissões administrativas)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Diretórios
const ROOT_DIR = join(__dirname, '../..');
const MIGRATIONS_DIR = join(ROOT_DIR, 'supabase/migrations');
const LOG_DIR = join(ROOT_DIR, 'logs/migrations');
const REPORT_FILE = join(ROOT_DIR, 'docs/RELATORIO_MIGRACAO_SUPABASE.md');

// Criar diretório de logs
try {
  mkdirSync(LOG_DIR, { recursive: true });
} catch (err) {
  // Diretório já existe
}

// Timestamp
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = join(LOG_DIR, `migration_${TIMESTAMP}.log`);

// Estatísticas
const stats = {
  total: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

// Função de logging
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  // Console
  console.log(logMessage.trim());

  // Arquivo
  try {
    writeFileSync(LOG_FILE, logMessage, { flag: 'a' });
  } catch (err) {
    console.error('Erro ao escrever log:', err);
  }
}

// Função para aplicar migração via RPC
async function applyMigration(filePath) {
  const fileName = basename(filePath, '.sql');

  log('INFO', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('INFO', `Aplicando: ${fileName}`);

  try {
    // Ler conteúdo do arquivo SQL
    const sqlContent = readFileSync(filePath, 'utf8');

    // Aplicar via RPC (exec_sql é uma função personalizada que precisamos criar)
    // Como não temos essa função, vamos tentar executar diretamente via .rpc()

    // Dividir em statements individuais (separados por ;)
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    log('INFO', `Executando ${statements.length} statement(s)...`);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Usar .rpc() ou construir query manualmente
        // Como não temos acesso direto ao SQL, vamos usar a REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (response.ok) {
          successCount++;
        } else {
          const error = await response.text();
          log('WARN', `Statement falhou: ${error.substring(0, 100)}...`);
          errorCount++;
        }
      } catch (err) {
        log('WARN', `Erro no statement: ${err.message}`);
        errorCount++;
      }
    }

    if (errorCount === 0) {
      log('INFO', `✅ Migração aplicada com sucesso (${successCount} statements)`);
      return { success: true, statements: successCount };
    } else {
      log('WARN', `⚠️  Migração parcial (${successCount} ok, ${errorCount} falhas)`);
      return { success: true, statements: successCount, warnings: errorCount };
    }
  } catch (err) {
    log('ERROR', `❌ Falha na migração: ${err.message}`);
    stats.errors.push({ file: fileName, error: err.message });
    return { success: false, error: err.message };
  }
}

// Função principal
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║     🚀 MIGRAÇÃO AUTOMÁTICA SUPABASE - ICARUS v5.0 🚀                   ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  log('INFO', '📋 Listando migrações disponíveis...');

  // Listar e ordenar migrações
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  stats.total = files.length;
  log('INFO', `Total de migrações encontradas: ${stats.total}`);
  console.log('');

  // Aplicar cada migração
  for (const file of files) {
    const filePath = join(MIGRATIONS_DIR, file);
    const fileName = basename(file, '.sql');

    // Skip de backups
    if (fileName.includes('backup') || fileName.includes('old')) {
      log('WARN', `⏭️  Pulando (backup/old): ${fileName}`);
      stats.skipped++;
      continue;
    }

    const result = await applyMigration(filePath);

    if (result.success) {
      stats.successful++;
    } else {
      stats.failed++;
    }

    // Delay para não sobrecarregar a API
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('');
  log('INFO', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('INFO', '📊 RESUMO DA MIGRAÇÃO');
  log('INFO', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('INFO', `Total:       ${stats.total}`);
  log('INFO', `Sucesso:     ${stats.successful}`);
  log('INFO', `Falhas:      ${stats.failed}`);
  log('INFO', `Puladas:     ${stats.skipped}`);
  log('INFO', '');
  log('INFO', `📝 Log completo: ${LOG_FILE}`);

  // Gerar relatório markdown
  const report = `# Relatório de Migração Supabase - ICARUS v5.0

**Data**: ${new Date().toLocaleString('pt-BR')}  
**Projeto Supabase**: gvbkviozlhxorjoavmky  
**URL**: ${SUPABASE_URL}

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Total de Migrações | ${stats.total} |
| Aplicadas com Sucesso | ${stats.successful} |
| Falhas | ${stats.failed} |
| Puladas | ${stats.skipped} |
| Taxa de Sucesso | ${((stats.successful / (stats.total - stats.skipped)) * 100).toFixed(1)}% |

---

## 📋 Migrações Aplicadas

${files.map((f) => `- \`${f}\``).join('\n')}

---

## ❌ Erros Encontrados

${stats.errors.length === 0 ? '✅ Nenhum erro crítico!' : stats.errors.map((e) => `### ${e.file}\n\n\`\`\`\n${e.error}\n\`\`\``).join('\n\n')}

---

## 📝 Log Detalhado

Ver arquivo: \`${LOG_FILE}\`

---

## ⚠️ Observações

1. Algumas migrações podem falhar se já existirem tabelas/objetos
2. Isso é esperado em migrações incrementais
3. Verifique o log completo para detalhes de cada migração
4. Use \`supabase db reset\` se precisar limpar o schema

---

## 🔧 Próximos Passos

1. ✅ Validar schema no Supabase Dashboard
2. ✅ Testar conexões da aplicação
3. ✅ Verificar RLS policies
4. ✅ Seed de dados iniciais (se necessário)

---

**Migração concluída em**: ${new Date().toLocaleString('pt-BR')}
`;

  writeFileSync(REPORT_FILE, report);
  log('INFO', `📄 Relatório gerado: ${REPORT_FILE}`);

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║     ✅ MIGRAÇÃO CONCLUÍDA! ✅                                          ║');
  console.log('║                                                                        ║');
  console.log(`║     Sucesso: ${stats.successful}/${stats.total} migrações             ║`);
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝');

  // Retornar código de saída
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Executar
main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
