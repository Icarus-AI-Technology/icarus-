#!/usr/bin/env node

/**
 * ⚙️ AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3 - Apply (stub)
 * 
 * Orienta aplicação de migrations e deployment:
 * - Migrations SQL (via Supabase CLI)
 * - Edge Functions
 * - Storage Buckets
 * - Realtime channels
 * 
 * ⚠️ IMPORTANTE: Este é um GUIA interativo, não executa automaticamente
 * para evitar alterações acidentais em produção.
 * 
 * @version 3.0.0
 * @date 2025-10-20
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '../..');
const MIGRATIONS_DIR = path.join(PROJECT_ROOT, 'supabase/migrations');
const DOCS_INFRA_DIR = path.join(PROJECT_ROOT, 'docs/infra');

// ======================================
// 🔧 CONFIGURAÇÃO
// ======================================

const MODO = process.argv[2] || 'dry-run'; // 'dry-run' | 'apply' | 'review'

// ======================================
// 🧰 UTILITÁRIOS
// ======================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function listMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
}

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// ======================================
// 📋 RELATÓRIO DE APLICAÇÃO
// ======================================

function generateApplyGuide() {
  console.log('\n📋 GERANDO GUIA DE APLICAÇÃO...\n');
  
  const timestamp = new Date().toISOString();
  const migrations = listMigrations();
  const hasSupabaseCLI = checkSupabaseCLI();
  
  let md = `# ⚙️ Guia de Aplicação - ICARUS v5.0\n\n`;
  md += `**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**\n\n`;
  md += `📅 Data: ${timestamp}\n\n`;
  md += `---\n\n`;
  
  // Status
  md += `## 📊 Status Atual\n\n`;
  md += `- **Migrations encontradas:** ${migrations.length}\n`;
  md += `- **Supabase CLI:** ${hasSupabaseCLI ? '✅ Instalado' : '❌ Não instalado'}\n`;
  md += `- **Modo:** ${MODO}\n\n`;
  
  if (!hasSupabaseCLI) {
    md += `⚠️  **ATENÇÃO:** Supabase CLI não está instalado!\n\n`;
    md += `\`\`\`bash\n`;
    md += `npm install -g supabase\n`;
    md += `\`\`\`\n\n`;
  }
  
  md += `---\n\n`;
  
  // Opções de aplicação
  md += `## 🚀 Opções de Aplicação\n\n`;
  
  md += `### Opção 1: Supabase CLI (Local Development)\n\n`;
  md += `**Recomendado para desenvolvimento local com Docker:**\n\n`;
  md += `\`\`\`bash\n`;
  md += `# 1. Iniciar Supabase localmente (se ainda não estiver rodando)\n`;
  md += `supabase start\n\n`;
  md += `# 2. Aplicar todas as migrations\n`;
  md += `supabase db reset\n\n`;
  md += `# OU aplicar apenas migrations pendentes\n`;
  md += `supabase migration up\n\n`;
  md += `# 3. Verificar status\n`;
  md += `supabase migration list\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Opção 2: Supabase CLI (Production/Staging)\n\n`;
  md += `**Para aplicar em ambiente remoto:**\n\n`;
  md += `\`\`\`bash\n`;
  md += `# 1. Conectar ao projeto remoto\n`;
  md += `supabase link --project-ref [PROJECT_REF]\n\n`;
  md += `# 2. Aplicar migrations\n`;
  md += `supabase db push\n\n`;
  md += `# 3. Verificar status remoto\n`;
  md += `supabase migration list --linked\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Opção 3: Dashboard Supabase (Manual)\n\n`;
  md += `**Para aplicação manual via interface:**\n\n`;
  md += `1. Acessar: https://app.supabase.com/project/[PROJECT_ID]/editor\n`;
  md += `2. Abrir aba **SQL Editor**\n`;
  md += `3. Copiar conteúdo de cada migration\n`;
  md += `4. Executar em ordem cronológica\n\n`;
  
  md += `---\n\n`;
  
  // Lista de migrations
  if (migrations.length > 0) {
    md += `## 📦 Migrations Disponíveis\n\n`;
    md += `| # | Nome | Path |\n`;
    md += `|---|------|------|\n`;
    
    migrations.forEach((m, idx) => {
      md += `| ${idx + 1} | \`${m}\` | \`supabase/migrations/${m}\` |\n`;
    });
    md += `\n`;
  } else {
    md += `## ⚠️ Nenhuma Migration Encontrada\n\n`;
    md += `Execute primeiro:\n\n`;
    md += `\`\`\`bash\n`;
    md += `npm run infra:plan\n`;
    md += `\`\`\`\n\n`;
  }
  
  md += `---\n\n`;
  
  // Edge Functions
  md += `## 🌐 Edge Functions\n\n`;
  md += `**Deploy de Edge Functions (Deno):**\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Deploy de uma function específica\n`;
  md += `supabase functions deploy [FUNCTION_NAME]\n\n`;
  md += `# Deploy de todas as functions\n`;
  md += `supabase functions deploy\n\n`;
  md += `# Verificar logs\n`;
  md += `supabase functions logs [FUNCTION_NAME]\n`;
  md += `\`\`\`\n\n`;
  
  // Storage
  md += `## 📦 Storage Buckets\n\n`;
  md += `**Configurar buckets via Dashboard:**\n\n`;
  md += `1. Acessar: https://app.supabase.com/project/[PROJECT_ID]/storage/buckets\n`;
  md += `2. Criar buckets:\n`;
  md += `   - \`cirurgias\` (privado, 10MB, image/pdf)\n`;
  md += `   - \`faturamento\` (privado, 50MB, pdf/xml)\n`;
  md += `   - \`compliance\` (privado, 10MB, pdf/image)\n`;
  md += `   - \`consignacao\` (privado, 10MB, pdf/image)\n`;
  md += `   - \`uploads\` (privado, 10MB, image/pdf/text)\n`;
  md += `3. Configurar políticas RLS por bucket\n\n`;
  
  md += `**Ou via SQL:**\n\n`;
  md += `\`\`\`sql\n`;
  md += `-- Ver supabase/migrations/*_storage_policies.sql\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  
  // Realtime
  md += `## 🔄 Realtime Channels\n\n`;
  md += `**Configurar via Dashboard:**\n\n`;
  md += `1. Acessar: https://app.supabase.com/project/[PROJECT_ID]/database/replication\n`;
  md += `2. Habilitar Realtime para tabelas:\n`;
  md += `   - \`cirurgias\`\n`;
  md += `   - \`cirurgia_materiais\`\n`;
  md += `   - \`vw_dashboard_kpis\` (se suportado)\n`;
  md += `3. Publicações habilitadas automaticamente\n\n`;
  
  md += `---\n\n`;
  
  // Validação
  md += `## ✅ Validação Pós-Aplicação\n\n`;
  md += `Após aplicar migrations, executar:\n\n`;
  md += `\`\`\`bash\n`;
  md += `# 1. Reaudidar infraestrutura\n`;
  md += `npm run infra:audit\n\n`;
  md += `# 2. Healthcheck completo\n`;
  md += `npm run infra:health\n\n`;
  md += `# 3. Gerar types TypeScript\n`;
  md += `npm run db:gen:types\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  
  // Rollback
  md += `## ⏮️ Rollback (se necessário)\n\n`;
  md += `**Desfazer migrations:**\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Ver diff das últimas alterações\n`;
  md += `supabase db diff --linked\n\n`;
  md += `# Restaurar de backup\n`;
  md += `npm run db:restore\n\n`;
  md += `# Ou reverter manualmente via SQL\n`;
  md += `# Ver comentários de rollback no cabeçalho de cada migration\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  
  // Troubleshooting
  md += `## 🔧 Troubleshooting\n\n`;
  md += `### Erro: "Migration already applied"\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Verificar status\n`;
  md += `supabase migration list\n\n`;
  md += `# Forçar reset (⚠️ CUIDADO: apaga dados)\n`;
  md += `supabase db reset\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Erro: "Docker not running"\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Iniciar Docker Desktop\n`;
  md += `# Ou instalar Docker: https://docs.docker.com/get-docker/\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Erro: "Project not linked"\n\n`;
  md += `\`\`\`bash\n`;
  md += `supabase link --project-ref [PROJECT_REF]\n`;
  md += `# Obter PROJECT_REF em: https://app.supabase.com/project/[PROJECT_ID]/settings/general\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  md += `*Guia gerado automaticamente por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3*\n`;
  
  return md;
}

// ======================================
// 🎬 MAIN
// ======================================

function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  ⚙️ AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3              ║');
  console.log('║  Apply (Guia) - ICARUS v5.0                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  if (MODO === 'apply') {
    console.log('\n⚠️  MODO "apply" não implementado para segurança.\n');
    console.log('Este script gera um GUIA de aplicação manual.\n');
    console.log('Para aplicar migrations, use:\n');
    console.log('  - supabase db reset (local)\n');
    console.log('  - supabase db push (remoto)\n');
    console.log('  - Dashboard Supabase (manual)\n\n');
  }
  
  // Gerar guia
  ensureDir(DOCS_INFRA_DIR);
  const markdown = generateApplyGuide();
  const guidePath = path.join(DOCS_INFRA_DIR, 'guia-aplicacao.md');
  fs.writeFileSync(guidePath, markdown, 'utf-8');
  
  console.log(`\n✅ Guia salvo em: ${guidePath}\n`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  📝 Guia de aplicação gerado                              ║');
  console.log('║  ⚠️  Revise antes de aplicar em produção                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

main();

