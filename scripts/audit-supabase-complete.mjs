#!/usr/bin/env node
/**
 * Auditoria Completa do Supabase
 * Verifica se todas as migrations foram aplicadas corretamente
 */

import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: 'db.ttswvavcisdnonytslom.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'xeO6xuDbpX749uyT',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 60000,
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  const client = new pg.Client(DB_CONFIG);

  try {
    log('\n' + '='.repeat(80), 'magenta');
    log('🔍 AUDITORIA COMPLETA DO SUPABASE', 'magenta');
    log('='.repeat(80) + '\n', 'magenta');

    await client.connect();
    log('✅ Conectado ao PostgreSQL\n', 'green');

    // 1. TABELAS
    log('━'.repeat(80), 'cyan');
    log('📊 1. AUDITORIA DE TABELAS', 'cyan');
    log('━'.repeat(80), 'cyan');

    const tables = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = t.table_name) as colunas
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    log(`\n✅ Total de Tabelas: ${tables.rows.length}\n`, 'green');

    // Agrupar por categoria
    const categorias = {
      core: [
        'empresas',
        'usuarios',
        'profiles',
        'notificacoes',
        'produtos',
        'materiais',
        'medicos',
        'pacientes',
      ],
      operacional: [
        'hospitais',
        'convenios',
        'cirurgias',
        'cirurgia_materiais',
        'cirurgia_eventos',
        'estoque',
        'estoque_movimentacoes',
        'estoque_reservas',
        'fornecedores',
      ],
      consignacao: [
        'contratos_consignacao',
        'remessas_consignacao',
        'itens_remessa_consignacao',
        'devolucoes_consignacao',
      ],
      compras: [
        'solicitacoes_compra',
        'itens_solicitacao_compra',
        'cotacoes',
        'itens_cotacao',
        'fornecedores_produtos',
      ],
      vendas: ['oportunidades', 'propostas', 'itens_proposta', 'negociacoes', 'atividades_crm'],
      financeiro: [
        'contas_pagar',
        'contas_receber',
        'fluxo_caixa',
        'bancos',
        'centros_custo',
        'lancamentos_contabeis',
        'notas_fiscais',
      ],
      compliance: [
        'compliance_requisitos',
        'compliance_evidencias',
        'auditorias',
        'auditorias_itens',
        'nao_conformidades',
        'acoes_corretivas',
      ],
      portais: [
        'portais_opme_config',
        'portais_opme_solicitacoes',
        'portais_opme_respostas',
        'portais_opme_logs',
      ],
      licitacoes: ['licitacoes', 'licitacoes_itens', 'propostas_licitacao', 'documentos_licitacao'],
      entregas: ['entregas'],
      chatbot: [
        'chatbot_sessoes',
        'chatbot_conversas',
        'chatbot_mensagens',
        'chatbot_pesquisas_gpt',
      ],
      workflows: ['workflows', 'workflow_etapas', 'workflow_execucoes', 'workflow_logs'],
      api: ['api_endpoints', 'api_keys', 'api_logs', 'api_rate_limits'],
      bi: [
        'bi_dimensoes',
        'bi_fatos',
        'bi_dashboards',
        'bi_widgets',
        'bi_relatorios',
        'bi_fontes_dados',
      ],
      kpis: ['kpi_metas', 'kpi_realizacoes'],
      rbac: ['roles', 'permissions', 'role_permissions', 'user_roles', 'permission_groups'],
      health: ['system_health_metrics', 'system_alerts', 'system_logs'],
      relatorios: ['relatorios_regulatorios', 'relatorios_templates', 'relatorios_agendamentos'],
      pluggy: ['pluggy_connections', 'pluggy_accounts', 'pluggy_transactions'],
      auxiliares: ['comentarios', 'tags', 'favoritos'],
    };

    const tabelasExistentes = tables.rows.map((r) => r.table_name);

    for (const [categoria, tabelasEsperadas] of Object.entries(categorias)) {
      const encontradas = tabelasEsperadas.filter((t) => tabelasExistentes.includes(t));
      const faltantes = tabelasEsperadas.filter((t) => !tabelasExistentes.includes(t));

      if (encontradas.length === tabelasEsperadas.length) {
        log(
          `✅ ${categoria.toUpperCase()}: ${encontradas.length}/${tabelasEsperadas.length}`,
          'green'
        );
      } else {
        log(
          `⚠️  ${categoria.toUpperCase()}: ${encontradas.length}/${tabelasEsperadas.length}`,
          'yellow'
        );
        if (faltantes.length > 0) {
          log(`   Faltantes: ${faltantes.join(', ')}`, 'red');
        }
      }
    }

    // 2. ENUMS
    log('\n' + '━'.repeat(80), 'cyan');
    log('🔤 2. AUDITORIA DE ENUMs', 'cyan');
    log('━'.repeat(80), 'cyan');

    const enums = await client.query(`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    log(`\n✅ Total de ENUMs: ${enums.rows.length}\n`, 'green');
    enums.rows.forEach((e) => {
      const values = Array.isArray(e.values) ? e.values.join(', ') : String(e.values);
      log(`   📌 ${e.enum_name}: ${values}`, 'gray');
    });

    // 3. FUNCTIONS RPC
    log('\n' + '━'.repeat(80), 'cyan');
    log('⚙️  3. AUDITORIA DE FUNCTIONS RPC', 'cyan');
    log('━'.repeat(80), 'cyan');

    const functions = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_catalog.pg_get_function_arguments(p.oid) as arguments,
        pg_catalog.pg_get_function_result(p.oid) as return_type
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.prokind = 'f'
      ORDER BY p.proname
    `);

    log(`\n✅ Total de Functions: ${functions.rows.length}\n`, 'green');

    // Categorizar functions
    const functionsEsperadas = {
      auth: ['validar_login', 'obter_permissoes_usuario', 'usuario_tem_permissao'],
      util: ['update_updated_at_column'],
    };

    for (const [cat, funcs] of Object.entries(functionsEsperadas)) {
      const found = funcs.filter((f) => functions.rows.some((r) => r.function_name === f));
      const missing = funcs.filter((f) => !functions.rows.some((r) => r.function_name === f));

      if (found.length === funcs.length) {
        log(
          `✅ ${cat.toUpperCase()}: ${found.length}/${funcs.length} (${found.join(', ')})`,
          'green'
        );
      } else {
        log(`⚠️  ${cat.toUpperCase()}: ${found.length}/${funcs.length}`, 'yellow');
        if (missing.length > 0) {
          log(`   Faltantes: ${missing.join(', ')}`, 'red');
        }
      }
    }

    // 4. TRIGGERS
    log('\n' + '━'.repeat(80), 'cyan');
    log('🔔 4. AUDITORIA DE TRIGGERS', 'cyan');
    log('━'.repeat(80), 'cyan');

    const triggers = await client.query(`
      SELECT 
        trigger_name,
        event_object_table as table_name,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);

    log(`\n✅ Total de Triggers: ${triggers.rows.length}\n`, 'green');

    // Verificar triggers updated_at
    const tabelasComUpdatedAt = tables.rows.filter((t) => {
      return triggers.rows.some(
        (tr) => tr.table_name === t.table_name && tr.trigger_name.includes('updated')
      );
    });

    log(`   📌 Triggers updated_at: ${tabelasComUpdatedAt.length} tabelas`, 'gray');

    // 5. ÍNDICES
    log('\n' + '━'.repeat(80), 'cyan');
    log('🔍 5. AUDITORIA DE ÍNDICES', 'cyan');
    log('━'.repeat(80), 'cyan');

    const indexes = await client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    log(`\n✅ Total de Índices: ${indexes.rows.length}\n`, 'green');

    // Contar índices por tabela
    const indexesPorTabela = {};
    indexes.rows.forEach((idx) => {
      if (!indexesPorTabela[idx.tablename]) {
        indexesPorTabela[idx.tablename] = 0;
      }
      indexesPorTabela[idx.tablename]++;
    });

    const tabelasComMaisIndices = Object.entries(indexesPorTabela)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    log('   📊 Top 5 tabelas com mais índices:', 'gray');
    tabelasComMaisIndices.forEach(([tabela, count]) => {
      log(`      • ${tabela}: ${count} índices`, 'gray');
    });

    // 6. VIEWS
    log('\n' + '━'.repeat(80), 'cyan');
    log('👁️  6. AUDITORIA DE VIEWS', 'cyan');
    log('━'.repeat(80), 'cyan');

    const views = await client.query(`
      SELECT 
        table_name as view_name,
        view_definition
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    log(`\n✅ Total de Views: ${views.rows.length}\n`, 'green');
    views.rows.forEach((v) => {
      log(`   📌 ${v.view_name}`, 'gray');
    });

    // 7. FOREIGN KEYS
    log('\n' + '━'.repeat(80), 'cyan');
    log('🔗 7. AUDITORIA DE FOREIGN KEYS', 'cyan');
    log('━'.repeat(80), 'cyan');

    const fks = await client.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);

    log(`\n✅ Total de Foreign Keys: ${fks.rows.length}\n`, 'green');

    // 8. STORAGE BUCKETS
    log('\n' + '━'.repeat(80), 'cyan');
    log('📦 8. AUDITORIA DE STORAGE BUCKETS', 'cyan');
    log('━'.repeat(80), 'cyan');

    const buckets = await client.query(`
      SELECT 
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
      FROM storage.buckets
      ORDER BY name
    `);

    log(`\n✅ Total de Buckets: ${buckets.rows.length}\n`, 'green');

    const bucketsEsperados = ['cirurgias', 'faturamento', 'compliance', 'consignacao', 'uploads'];
    const bucketsEncontrados = buckets.rows.map((b) => b.name);
    const bucketsFaltantes = bucketsEsperados.filter((b) => !bucketsEncontrados.includes(b));

    bucketsEncontrados.forEach((b) => {
      const esperado = bucketsEsperados.includes(b);
      log(`   ${esperado ? '✅' : '📌'} ${b}`, esperado ? 'green' : 'gray');
    });

    if (bucketsFaltantes.length > 0) {
      log(`\n   ⚠️  Buckets faltantes: ${bucketsFaltantes.join(', ')}`, 'yellow');
    }

    // 9. VERIFICAR DADOS DO CEO
    log('\n' + '━'.repeat(80), 'cyan');
    log('👤 9. AUDITORIA DE DADOS DO CEO', 'cyan');
    log('━'.repeat(80), 'cyan');

    const ceoCheck = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.nome_completo,
        u.cargo,
        u.ativo,
        e.nome as empresa,
        COUNT(DISTINCT ur.role_id) as roles_count,
        COUNT(DISTINCT p.id) as permissions_count
      FROM usuarios u
      JOIN empresas e ON e.id = u.empresa_id
      LEFT JOIN user_roles ur ON ur.usuario_id = u.id AND ur.ativo = true
      LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.email = 'dax@newortho.com.br'
      GROUP BY u.id, u.email, u.nome_completo, u.cargo, u.ativo, e.nome
    `);

    if (ceoCheck.rows.length > 0) {
      const ceo = ceoCheck.rows[0];
      log(`\n✅ Usuário CEO encontrado:`, 'green');
      log(`   📧 Email: ${ceo.email}`, 'gray');
      log(`   👤 Nome: ${ceo.nome_completo}`, 'gray');
      log(`   💼 Cargo: ${ceo.cargo}`, 'gray');
      log(`   🏢 Empresa: ${ceo.empresa}`, 'gray');
      log(`   ✅ Ativo: ${ceo.ativo}`, 'gray');
      log(`   🎭 Roles: ${ceo.roles_count}`, 'gray');
      log(`   🔑 Permissões: ${ceo.permissions_count}`, 'gray');
    } else {
      log(`\n❌ Usuário CEO NÃO encontrado!`, 'red');
    }

    // RESUMO FINAL
    log('\n' + '='.repeat(80), 'magenta');
    log('📋 RESUMO DA AUDITORIA', 'magenta');
    log('='.repeat(80), 'magenta');

    const resumo = {
      Tabelas: tables.rows.length,
      ENUMs: enums.rows.length,
      'Functions RPC': functions.rows.length,
      Triggers: triggers.rows.length,
      Índices: indexes.rows.length,
      Views: views.rows.length,
      'Foreign Keys': fks.rows.length,
      'Storage Buckets': buckets.rows.length,
      'Usuário CEO': ceoCheck.rows.length > 0 ? '✅ Criado' : '❌ Não encontrado',
    };

    console.log('');
    for (const [item, valor] of Object.entries(resumo)) {
      log(`   ${item.padEnd(20)}: ${valor}`, 'cyan');
    }

    log('\n' + '='.repeat(80), 'green');
    log('✅ AUDITORIA COMPLETA!', 'green');
    log('='.repeat(80) + '\n', 'green');
  } catch (error) {
    log(`\n❌ ERRO: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
