#!/usr/bin/env node

/**
 * 🔍 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3 - Auditoria de Infraestrutura
 * 
 * Audita lacunas na infraestrutura ICARUS v5.0:
 * - Tabelas essenciais (cirurgias, materiais, dashboard_kpis, etc.)
 * - Views materializadas para performance
 * - Índices críticos
 * - Políticas RLS (multi-tenant por empresa_id)
 * - Storage buckets
 * - Edge Functions
 * - Realtime channels
 * - Healthchecks
 * 
 * @version 3.0.0
 * @date 2025-10-20
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '../..');
const MIGRATIONS_DIR = path.join(PROJECT_ROOT, 'supabase/migrations');
const DOCS_INFRA_DIR = path.join(PROJECT_ROOT, 'docs/infra');

// ======================================
// 🎯 CHECKLIST DE INFRAESTRUTURA
// ======================================

const REQUIRED_INFRASTRUCTURE = {
  // Domínio: Cirurgias (core do sistema)
  tables: {
    cirurgias: {
      schema: 'public',
      columns: ['id', 'empresa_id', 'paciente_id', 'medico_id', 'hospital_id', 'convenio_id', 'data_agendada', 'status_cirurgia'],
      indexes: ['cirurgias_empresa_id_data_idx', 'cirurgias_status_idx'],
      rls: true,
      tenant_column: 'empresa_id'
    },
    cirurgia_materiais: {
      schema: 'public',
      columns: ['id', 'cirurgia_id', 'material_id', 'quantidade', 'lote', 'validade', 'status_item'],
      indexes: ['cirurgia_materiais_cirurgia_id_idx'],
      rls: true,
      tenant_column: null // vinculada via cirurgias
    },
    materiais: {
      schema: 'public',
      columns: ['id', 'codigo_interno', 'descricao', 'registro_anvisa', 'fabricante', 'custo', 'preco'],
      indexes: ['materiais_codigo_interno_idx', 'materiais_registro_anvisa_idx'],
      rls: true,
      tenant_column: 'empresa_id'
    },
    medicos: {
      schema: 'public',
      columns: ['id', 'nome', 'crm', 'especialidade', 'empresa_id'],
      indexes: ['medicos_crm_idx', 'medicos_empresa_id_idx'],
      rls: true,
      tenant_column: 'empresa_id'
    },
    pacientes: {
      schema: 'public',
      columns: ['id', 'nome', 'cpf', 'data_nascimento', 'empresa_id'],
      indexes: ['pacientes_cpf_idx', 'pacientes_empresa_id_idx'],
      rls: true,
      tenant_column: 'empresa_id'
    },
    hospitais: {
      schema: 'public',
      columns: ['id', 'nome', 'cnpj', 'cidade', 'empresa_id'],
      indexes: ['hospitais_cnpj_idx', 'hospitais_empresa_id_idx'],
      rls: true,
      tenant_column: 'empresa_id'
    },
    convenios: {
      schema: 'public',
      columns: ['id', 'nome', 'codigo', 'empresa_id'],
      indexes: ['convenios_codigo_idx'],
      rls: true,
      tenant_column: 'empresa_id'
    },
    cirurgia_eventos: {
      schema: 'public',
      columns: ['id', 'cirurgia_id', 'tipo_evento', 'data_hora', 'usuario_id'],
      indexes: ['cirurgia_eventos_cirurgia_id_idx'],
      rls: true,
      tenant_column: null
    }
  },

  views: {
    vw_dashboard_kpis: {
      materialized: true,
      dependencies: ['cirurgias', 'cirurgia_materiais', 'materiais'],
      refresh_strategy: 'cron' // ou 'trigger'
    },
    vw_cirurgias_proximas: {
      materialized: false,
      dependencies: ['cirurgias', 'medicos', 'hospitais', 'pacientes']
    },
    vw_cirurgia_kit_detalhado: {
      materialized: false,
      dependencies: ['cirurgias', 'cirurgia_materiais', 'materiais']
    }
  },

  functions: {
    get_dashboard_kpis: {
      params: ['empresa_id uuid', 'periodo text'],
      returns: 'json',
      security: 'invoker'
    },
    get_agenda_cirurgias: {
      params: ['empresa_id uuid', 'data_inicio date', 'data_fim date'],
      returns: 'table',
      security: 'invoker'
    },
    refresh_dashboard_kpis: {
      params: [],
      returns: 'void',
      security: 'definer',
      cron: '*/15 * * * *' // a cada 15 min
    }
  },

  storage: {
    buckets: {
      cirurgias: { public: false, file_size_limit: 10485760, allowed_mime_types: ['image/*', 'application/pdf'] },
      faturamento: { public: false, file_size_limit: 52428800, allowed_mime_types: ['application/pdf', 'application/xml'] },
      compliance: { public: false, file_size_limit: 10485760, allowed_mime_types: ['application/pdf', 'image/*'] },
      consignacao: { public: false, file_size_limit: 10485760, allowed_mime_types: ['application/pdf', 'image/*'] },
      uploads: { public: false, file_size_limit: 10485760, allowed_mime_types: ['image/*', 'application/pdf', 'text/*'] }
    }
  },

  realtime: {
    channels: {
      'cirurgias:*': { schema: 'public', table: 'cirurgias', events: ['INSERT', 'UPDATE', 'DELETE'] },
      'dashboard_kpis:*': { schema: 'public', table: 'vw_dashboard_kpis', events: ['UPDATE'] },
      'consignacao_alertas:*': { schema: 'public', table: 'consignacao_alertas', events: ['INSERT'] },
      'estoque_critico:*': { schema: 'public', table: 'materiais', events: ['UPDATE'], filter: 'estoque_atual < estoque_minimo' }
    }
  },

  edge_functions: {
    'valida_crm_cfm': { runtime: 'deno', timeout: 30000 },
    'consulta_anvisa_produto': { runtime: 'deno', timeout: 30000 },
    'ocr_danfe': { runtime: 'deno', timeout: 60000 },
    'notificacao_push': { runtime: 'deno', timeout: 10000 },
    'recalcular_kpis': { runtime: 'deno', timeout: 60000 }
  }
};

// ======================================
// 🧪 FUNÇÕES DE AUDITORIA
// ======================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
}

function searchInMigrations(pattern, migrations) {
  const regex = new RegExp(pattern, 'i');
  return migrations.filter(m => {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, m), 'utf-8');
    return regex.test(content);
  });
}

function auditTables(migrations) {
  console.log('\n🗂️  AUDITANDO TABELAS...\n');
  
  const report = [];
  
  for (const [tableName, spec] of Object.entries(REQUIRED_INFRASTRUCTURE.tables)) {
    const found = searchInMigrations(`CREATE TABLE.*${tableName}`, migrations);
    
    if (found.length === 0) {
      report.push({
        type: 'table',
        name: tableName,
        status: '❌ AUSENTE',
        action: 'Criar migration com tabela completa',
        priority: 'ALTA',
        spec
      });
    } else {
      report.push({
        type: 'table',
        name: tableName,
        status: '✅ PRESENTE',
        file: found[found.length - 1],
        priority: 'OK'
      });
    }
  }
  
  return report;
}

function auditViews(migrations) {
  console.log('\n👁️  AUDITANDO VIEWS...\n');
  
  const report = [];
  
  for (const [viewName, spec] of Object.entries(REQUIRED_INFRASTRUCTURE.views)) {
    const keyword = spec.materialized ? 'MATERIALIZED VIEW' : 'VIEW';
    const found = searchInMigrations(`CREATE.*${keyword}.*${viewName}`, migrations);
    
    if (found.length === 0) {
      report.push({
        type: 'view',
        name: viewName,
        status: '❌ AUSENTE',
        action: `Criar ${spec.materialized ? 'materialized view' : 'view'} com agregações`,
        priority: spec.materialized ? 'ALTA' : 'MÉDIA',
        spec
      });
    } else {
      report.push({
        type: 'view',
        name: viewName,
        status: '✅ PRESENTE',
        file: found[found.length - 1],
        priority: 'OK'
      });
    }
  }
  
  return report;
}

function auditFunctions(migrations) {
  console.log('\n⚡ AUDITANDO FUNCTIONS/RPC...\n');
  
  const report = [];
  
  for (const [fnName, spec] of Object.entries(REQUIRED_INFRASTRUCTURE.functions)) {
    const found = searchInMigrations(`CREATE.*FUNCTION.*${fnName}`, migrations);
    
    if (found.length === 0) {
      report.push({
        type: 'function',
        name: fnName,
        status: '❌ AUSENTE',
        action: 'Criar function com lógica de negócio',
        priority: 'ALTA',
        spec
      });
    } else {
      report.push({
        type: 'function',
        name: fnName,
        status: '✅ PRESENTE',
        file: found[found.length - 1],
        priority: 'OK'
      });
    }
  }
  
  return report;
}

function auditIndexes(migrations) {
  console.log('\n🚀 AUDITANDO ÍNDICES...\n');
  
  const report = [];
  
  for (const [tableName, spec] of Object.entries(REQUIRED_INFRASTRUCTURE.tables)) {
    if (spec.indexes) {
      for (const indexName of spec.indexes) {
        const found = searchInMigrations(`CREATE.*INDEX.*${indexName}`, migrations);
        
        if (found.length === 0) {
          report.push({
            type: 'index',
            name: indexName,
            table: tableName,
            status: '❌ AUSENTE',
            action: 'Criar índice para performance',
            priority: 'MÉDIA'
          });
        } else {
          report.push({
            type: 'index',
            name: indexName,
            table: tableName,
            status: '✅ PRESENTE',
            file: found[found.length - 1],
            priority: 'OK'
          });
        }
      }
    }
  }
  
  return report;
}

function auditRLS(migrations) {
  console.log('\n🔒 AUDITANDO RLS POLICIES...\n');
  
  const report = [];
  
  for (const [tableName, spec] of Object.entries(REQUIRED_INFRASTRUCTURE.tables)) {
    if (spec.rls) {
      // Verificar se RLS está habilitado
      const rlsEnabled = searchInMigrations(`ALTER TABLE.*${tableName}.*ENABLE ROW LEVEL SECURITY`, migrations);
      
      if (rlsEnabled.length === 0) {
        report.push({
          type: 'rls_enable',
          name: tableName,
          status: '❌ RLS NÃO HABILITADO',
          action: 'Habilitar RLS na tabela',
          priority: 'CRÍTICA'
        });
      }
      
      // Verificar policies (SELECT, INSERT, UPDATE, DELETE)
      const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
      for (const op of operations) {
        const policyName = `${tableName}_${op.toLowerCase()}_policy`;
        const found = searchInMigrations(`CREATE POLICY.*${policyName}`, migrations);
        
        if (found.length === 0) {
          report.push({
            type: 'rls_policy',
            name: policyName,
            table: tableName,
            operation: op,
            status: '❌ AUSENTE',
            action: `Criar policy ${op} com filtro ${spec.tenant_column || 'cascade'}`,
            priority: 'CRÍTICA'
          });
        } else {
          report.push({
            type: 'rls_policy',
            name: policyName,
            table: tableName,
            operation: op,
            status: '✅ PRESENTE',
            file: found[found.length - 1],
            priority: 'OK'
          });
        }
      }
    }
  }
  
  return report;
}

function auditStorage() {
  console.log('\n📦 AUDITANDO STORAGE BUCKETS...\n');
  
  const report = [];
  
  for (const [bucketName, spec] of Object.entries(REQUIRED_INFRASTRUCTURE.storage.buckets)) {
    // Nota: precisaríamos da API do Supabase para verificar buckets existentes
    // Por ora, geramos apenas recomendações
    report.push({
      type: 'storage_bucket',
      name: bucketName,
      status: '⚠️  NÃO AUDITÁVEL (requer API)',
      action: 'Verificar manualmente no Dashboard Supabase',
      priority: 'MÉDIA',
      spec
    });
  }
  
  return report;
}

function auditEdgeFunctions() {
  console.log('\n🌐 AUDITANDO EDGE FUNCTIONS...\n');
  
  const report = [];
  const edgeFunctionsDir = path.join(PROJECT_ROOT, 'supabase/functions');
  
  for (const [fnName, spec] of Object.entries(REQUIRED_INFRASTRUCTURE.edge_functions)) {
    const fnPath = path.join(edgeFunctionsDir, fnName, 'index.ts');
    
    if (!fs.existsSync(fnPath)) {
      report.push({
        type: 'edge_function',
        name: fnName,
        status: '❌ AUSENTE',
        action: 'Criar Edge Function (Deno/TypeScript)',
        priority: 'MÉDIA',
        spec
      });
    } else {
      report.push({
        type: 'edge_function',
        name: fnName,
        status: '✅ PRESENTE',
        path: fnPath,
        priority: 'OK'
      });
    }
  }
  
  return report;
}

function generateMarkdownReport(allReports) {
  console.log('\n📝 GERANDO RELATÓRIO MARKDOWN...\n');
  
  const timestamp = new Date().toISOString();
  let md = `# 🔍 Relatório de Auditoria de Infraestrutura - ICARUS v5.0\n\n`;
  md += `**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**\n\n`;
  md += `📅 Data: ${timestamp}\n\n`;
  md += `---\n\n`;
  
  // Sumário Executivo
  md += `## 📊 Sumário Executivo\n\n`;
  
  const stats = {
    total: 0,
    ok: 0,
    ausente: 0,
    critico: 0
  };
  
  allReports.forEach(item => {
    stats.total++;
    if (item.status.includes('✅')) stats.ok++;
    if (item.status.includes('❌')) stats.ausente++;
    if (item.priority === 'CRÍTICA') stats.critico++;
  });
  
  md += `| Métrica | Valor |\n`;
  md += `|---------|-------|\n`;
  md += `| Total de itens auditados | ${stats.total} |\n`;
  md += `| ✅ Conformes | ${stats.ok} (${((stats.ok/stats.total)*100).toFixed(1)}%) |\n`;
  md += `| ❌ Ausentes/Não conformes | ${stats.ausente} (${((stats.ausente/stats.total)*100).toFixed(1)}%) |\n`;
  md += `| 🚨 Prioridade CRÍTICA | ${stats.critico} |\n\n`;
  
  // Detalhamento por categoria
  const categories = {
    'Tabelas': allReports.filter(r => r.type === 'table'),
    'Views': allReports.filter(r => r.type === 'view'),
    'Functions/RPC': allReports.filter(r => r.type === 'function'),
    'Índices': allReports.filter(r => r.type === 'index'),
    'RLS - Habilitação': allReports.filter(r => r.type === 'rls_enable'),
    'RLS - Policies': allReports.filter(r => r.type === 'rls_policy'),
    'Storage Buckets': allReports.filter(r => r.type === 'storage_bucket'),
    'Edge Functions': allReports.filter(r => r.type === 'edge_function')
  };
  
  for (const [category, items] of Object.entries(categories)) {
    if (items.length === 0) continue;
    
    md += `## ${category}\n\n`;
    
    const absent = items.filter(i => i.status.includes('❌'));
    const present = items.filter(i => i.status.includes('✅'));
    const warning = items.filter(i => i.status.includes('⚠️'));
    
    md += `- ✅ Presentes: **${present.length}**\n`;
    md += `- ❌ Ausentes: **${absent.length}**\n`;
    if (warning.length > 0) md += `- ⚠️  Avisos: **${warning.length}**\n`;
    md += `\n`;
    
    if (absent.length > 0) {
      md += `### ❌ Itens Ausentes (${category})\n\n`;
      md += `| Nome | Status | Ação Recomendada | Prioridade |\n`;
      md += `|------|--------|------------------|------------|\n`;
      
      absent.forEach(item => {
        md += `| \`${item.name}\` | ${item.status} | ${item.action} | **${item.priority}** |\n`;
      });
      md += `\n`;
    }
    
    if (present.length > 0) {
      md += `### ✅ Itens Presentes (${category})\n\n`;
      md += `| Nome | Status | Arquivo/Path |\n`;
      md += `|------|--------|-------------|\n`;
      
      present.forEach(item => {
        const location = item.file || item.path || '-';
        md += `| \`${item.name}\` | ${item.status} | \`${location}\` |\n`;
      });
      md += `\n`;
    }
  }
  
  // Próximos Passos
  md += `---\n\n`;
  md += `## 🚀 Próximos Passos Recomendados\n\n`;
  md += `1. **Prioridade CRÍTICA:** Revisar e implementar todas as políticas RLS ausentes\n`;
  md += `2. **Prioridade ALTA:** Criar tabelas e views materializadas faltantes\n`;
  md += `3. **Prioridade MÉDIA:** Implementar índices de performance e Edge Functions\n`;
  md += `4. **Executar:** \`npm run infra:plan\` para gerar plano de migrations\n`;
  md += `5. **Aplicar:** \`npm run infra:apply\` (após revisão manual)\n\n`;
  
  md += `---\n\n`;
  md += `## 📚 Documentação de Referência\n\n`;
  md += `- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)\n`;
  md += `- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)\n`;
  md += `- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)\n`;
  md += `- [ICARUS v5 - Especificação Completa](../../ICARUS_V5_SPEC_COMPLETO.md)\n\n`;
  
  md += `---\n\n`;
  md += `*Relatório gerado automaticamente por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3*\n`;
  
  return md;
}

// ======================================
// 🎬 MAIN
// ======================================

function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3              ║');
  console.log('║  Auditoria de Infraestrutura - ICARUS v5.0                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  ensureDir(DOCS_INFRA_DIR);
  
  const migrations = readMigrations();
  console.log(`\n📂 Encontradas ${migrations.length} migrations em supabase/migrations/\n`);
  
  // Executar auditorias
  const allReports = [
    ...auditTables(migrations),
    ...auditViews(migrations),
    ...auditFunctions(migrations),
    ...auditIndexes(migrations),
    ...auditRLS(migrations),
    ...auditStorage(),
    ...auditEdgeFunctions()
  ];
  
  // Gerar relatório
  const markdown = generateMarkdownReport(allReports);
  const reportPath = path.join(DOCS_INFRA_DIR, 'relatorio-orquestrador.md');
  fs.writeFileSync(reportPath, markdown, 'utf-8');
  
  console.log(`\n✅ Relatório salvo em: ${reportPath}\n`);
  
  // Estatísticas finais
  const issues = allReports.filter(r => r.status.includes('❌'));
  const critical = allReports.filter(r => r.priority === 'CRÍTICA');
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log(`║  📊 RESUMO: ${allReports.length} itens auditados                              ║`);
  console.log(`║  ❌ Lacunas encontradas: ${issues.length.toString().padEnd(31)}║`);
  console.log(`║  🚨 Prioridade CRÍTICA: ${critical.length.toString().padEnd(32)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  if (critical.length > 0) {
    console.log('⚠️  ATENÇÃO: Existem itens de prioridade CRÍTICA!\n');
    console.log('Execute: npm run infra:plan\n');
  }
  
  // Exit code
  process.exit(issues.length > 0 ? 1 : 0);
}

main();

