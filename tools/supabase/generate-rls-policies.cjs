import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const rlsReportPath = path.join(projectRoot, 'rls-report.json');

if (!fs.existsSync(rlsReportPath)) {
  console.error('❌ Relatório RLS não encontrado. Execute: pnpm supabase:rls');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(rlsReportPath, 'utf8'));

console.log('🔒 Gerando políticas RLS para tabelas críticas...\n');

// Tabelas críticas que DEVEM ter RLS
const criticalTables = [
  'usuarios', 'profiles', 'pacientes', 'medicos', 'hospitais',
  'cirurgias', 'materiais_opme', 'estoque', 'transacoes',
  'fornecedores', 'pedidos_compra', 'contratos', 'leads',
  'compliance_requisitos', 'audit_log', 'faturas', 'contas_pagar', 'contas_receber'
];

const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
const migrationName = `${timestamp}_enable_rls_critical_tables.sql`;
const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');

// Criar diretório se não existir
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const migrationPath = path.join(migrationsDir, migrationName);

// Filtrar tabelas sem RLS que são críticas
const criticalWithoutRLS = report.tablesWithoutRLS
  .filter(({ table }) => criticalTables.includes(table))
  .slice(0, 20); // Limitar a 20 para não gerar arquivo muito grande

console.log(`📊 Tabelas críticas sem RLS: ${criticalWithoutRLS.length}\n`);

if (criticalWithoutRLS.length === 0) {
  console.log('✅ Todas as tabelas críticas já têm RLS!');
  process.exit(0);
}

// Gerar SQL
let sql = `-- Migração automática: Habilitar RLS em tabelas críticas
-- Gerado em: ${new Date().toISOString()}
-- Total de tabelas: ${criticalWithoutRLS.length}

`;

for (const { table } of criticalWithoutRLS) {
  console.log(`🔒 ${table}`);
  
  sql += `-- Habilitar RLS para ${table}
ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "${table}_select_policy"
  ON public.${table}
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "${table}_insert_policy"
  ON public.${table}
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "${table}_update_policy"
  ON public.${table}
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "${table}_delete_policy"
  ON public.${table}
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

`;
}

sql += `
-- Índices para melhorar performance das políticas RLS
${criticalWithoutRLS.map(({ table }) => `
CREATE INDEX IF NOT EXISTS idx_${table}_user_id ON public.${table}(user_id);
CREATE INDEX IF NOT EXISTS idx_${table}_created_by ON public.${table}(created_by);
`).join('')}

-- Comentários
COMMENT ON TABLE public.usuarios IS 'Tabela com RLS habilitado para segurança';
`;

// Salvar migração
fs.writeFileSync(migrationPath, sql);

console.log(`\n✅ Migração RLS gerada: ${migrationName}`);
console.log(`📍 Localização: ${migrationPath}`);
console.log(`\n⚠️  IMPORTANTE:`);
console.log(`   1. Revisar o SQL gerado (pode precisar ajustes)`);
console.log(`   2. Ajustar as políticas conforme regras de negócio`);
console.log(`   3. Testar em ambiente de dev antes de produção`);
console.log(`   4. Aplicar: supabase db push`);
console.log(`\n📝 Próximos passos:`);
console.log(`   - Revisar políticas geradas`);
console.log(`   - Ajustar colunas user_id/created_by`);
console.log(`   - Testar acesso com diferentes usuários`);

