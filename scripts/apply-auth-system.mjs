#!/usr/bin/env node
import pg from 'pg';
import fs from 'fs';
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n' + '='.repeat(80), 'magenta');
  log('🔐 APLICADOR - Sistema de Autenticação Customizado', 'magenta');
  log('='.repeat(80) + '\n', 'magenta');

  const client = new pg.Client(DB_CONFIG);

  try {
    log('🔌 Conectando...', 'blue');
    await client.connect();
    log('✅ Conectado!\n', 'green');

    const sqlPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '202510201350_sistema_autenticacao_customizado.sql'
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    log('📄 Aplicando migration de autenticação...', 'cyan');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    log('✅ Migration aplicada com sucesso!\n', 'green');

    // Verificar se usuário foi criado
    log('🔍 Verificando usuário criado...', 'blue');
    const userCheck = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.nome_completo,
        u.cargo,
        e.nome as empresa,
        COUNT(DISTINCT p.id) as total_permissoes
      FROM public.usuarios u
      JOIN public.empresas e ON e.id = u.empresa_id
      LEFT JOIN public.user_roles ur ON ur.usuario_id = u.id
      LEFT JOIN public.role_permissions rp ON rp.role_id = ur.role_id
      LEFT JOIN public.permissions p ON p.id = rp.permission_id
      WHERE u.email = 'dax@newortho.com.br'
      GROUP BY u.id, u.email, u.nome_completo, u.cargo, e.nome
    `);

    if (userCheck.rows.length > 0) {
      const user = userCheck.rows[0];
      log('\n' + '='.repeat(80), 'green');
      log('✅ USUÁRIO CEO CRIADO COM SUCESSO!', 'green');
      log('='.repeat(80), 'green');
      log(`\n👤 Nome:        ${user.nome_completo}`, 'cyan');
      log(`📧 Email:       ${user.email}`, 'cyan');
      log(`🏢 Empresa:     ${user.empresa}`, 'cyan');
      log(`💼 Cargo:       ${user.cargo}`, 'cyan');
      log(`🔑 Permissões:  ${user.total_permissoes} (ACESSO TOTAL)`, 'green');
      log(`\n🔐 CREDENCIAIS DE LOGIN:`, 'yellow');
      log(`   Email:  dax@newortho.com.br`, 'yellow');
      log(`   Senha:  admin123`, 'yellow');
    }

    // Verificar empresa
    log('\n🔍 Verificando empresa...', 'blue');
    const empresaCheck = await client.query(`
      SELECT nome, cnpj, email
      FROM public.empresas
      WHERE nome = 'NEW ORTHO'
    `);

    if (empresaCheck.rows.length > 0) {
      const empresa = empresaCheck.rows[0];
      log(`✅ Empresa: ${empresa.nome} (${empresa.cnpj})`, 'green');
    }

    // Verificar role CEO
    log('\n🔍 Verificando role CEO...', 'blue');
    const roleCheck = await client.query(`
      SELECT r.nome, r.descricao, COUNT(rp.id) as permissoes
      FROM public.roles r
      LEFT JOIN public.role_permissions rp ON rp.role_id = r.id
      WHERE r.codigo = 'CEO'
      GROUP BY r.id, r.nome, r.descricao
    `);

    if (roleCheck.rows.length > 0) {
      const role = roleCheck.rows[0];
      log(`✅ Role: ${role.nome} (${role.permissoes} permissões)`, 'green');
    }

    log('\n' + '='.repeat(80), 'magenta');
    log('🎉 SISTEMA DE AUTENTICAÇÃO PRONTO!', 'magenta');
    log('='.repeat(80) + '\n', 'magenta');
  } catch (error) {
    await client.query('ROLLBACK');
    log(`\n❌ ERRO: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
