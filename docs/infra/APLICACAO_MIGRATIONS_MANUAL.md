# 🚀 Aplicação de Migrations - ICARUS v5.0

**Status:** Migrations criadas e prontas para aplicação  
**Modo MCP:** Read-only (aplicação manual necessária)

---

## ⚠️ Situação Atual

O MCP Supabase está configurado em **modo read-only**, portanto as migrations precisam ser aplicadas manualmente via:
1. Supabase CLI (recomendado)
2. Dashboard Supabase (SQL Editor)
3. Ferramentas de conexão direta (psql, DBeaver, etc.)

---

## 📋 Migrations Criadas (7 arquivos)

```
supabase/migrations/
├── 202510201244_01_cirurgias_tabelas.sql       ✅ Pronto
├── 202510201244_02_cirurgias_rls.sql           ✅ Pronto
├── 202510201244_03_dashboard_views.sql         ✅ Pronto
├── 202510201244_04_dashboard_functions.sql     ✅ Pronto
├── 202510201245_05_indices_performance.sql     ✅ Pronto
├── 202510201246_06_seeds_demo.sql              ✅ Pronto
└── 202510201247_07_storage_config.sql          ✅ Pronto
```

---

## 🎯 Opção 1: Supabase CLI (Recomendado)

### Pré-requisitos

```bash
# Instalar Supabase CLI
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### Aplicação Local (Docker)

```bash
cd /Users/daxmeneghel/icarus-make

# 1. Iniciar Supabase localmente
supabase start

# 2. Aplicar TODAS as migrations (incluindo as novas)
supabase db reset

# 3. Verificar
supabase migration list

# 4. Gerar tipos TypeScript
npm run db:gen:types

# 5. Ver Studio
# Acessar: http://localhost:54323
```

### Aplicação Remota (Produção/Staging)

```bash
cd /Users/daxmeneghel/icarus-make

# 1. Conectar ao projeto
supabase link --project-ref [SEU_PROJECT_REF]

# 2. Aplicar migrations
supabase db push

# 3. Verificar
supabase migration list --linked

# 4. Deploy Edge Functions
supabase functions deploy
```

---

## 🎯 Opção 2: Dashboard Supabase (Manual)

### Passo a Passo

1. **Acessar SQL Editor:**
   - URL: https://app.supabase.com/project/[PROJECT_ID]/sql/new
   
2. **Aplicar Migrations na Ordem:**

#### Migration 1: Tabelas

```sql
-- Copiar conteúdo de: supabase/migrations/202510201244_01_cirurgias_tabelas.sql
-- Colar no SQL Editor
-- Executar (Run)
```

#### Migration 2: RLS

```sql
-- Copiar conteúdo de: supabase/migrations/202510201244_02_cirurgias_rls.sql
-- Colar no SQL Editor
-- Executar (Run)
```

#### Migration 3: Views

```sql
-- Copiar conteúdo de: supabase/migrations/202510201244_03_dashboard_views.sql
-- Colar no SQL Editor
-- Executar (Run)
```

#### Migration 4: Functions

```sql
-- Copiar conteúdo de: supabase/migrations/202510201244_04_dashboard_functions.sql
-- Colar no SQL Editor
-- Executar (Run)
```

#### Migration 5: Índices

```sql
-- Copiar conteúdo de: supabase/migrations/202510201245_05_indices_performance.sql
-- Colar no SQL Editor
-- Executar (Run)
```

#### Migration 6: Seeds (Opcional - apenas DEV/STAGING)

```sql
-- ⚠️ NÃO executar em PRODUÇÃO!
-- Copiar conteúdo de: supabase/migrations/202510201246_06_seeds_demo.sql
-- Colar no SQL Editor
-- Executar (Run)
```

#### Migration 7: Storage

```sql
-- Copiar conteúdo de: supabase/migrations/202510201247_07_storage_config.sql
-- Colar no SQL Editor
-- Executar (Run)
```

3. **Verificar Resultado:**
   - Database → Tables → Ver novas tabelas
   - Database → Indexes → Ver índices criados
   - Database → Functions → Ver functions RPC

---

## 🎯 Opção 3: Conexão Direta (psql/DBeaver)

### Obter Connection String

Dashboard → Settings → Database → Connection string

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### Aplicar via psql

```bash
cd /Users/daxmeneghel/icarus-make

# Conectar
psql "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Aplicar migrations
\i supabase/migrations/202510201244_01_cirurgias_tabelas.sql
\i supabase/migrations/202510201244_02_cirurgias_rls.sql
\i supabase/migrations/202510201244_03_dashboard_views.sql
\i supabase/migrations/202510201244_04_dashboard_functions.sql
\i supabase/migrations/202510201245_05_indices_performance.sql
\i supabase/migrations/202510201246_06_seeds_demo.sql
\i supabase/migrations/202510201247_07_storage_config.sql

# Verificar
\dt public.*
\df public.*
\di public.*
```

---

## ✅ Validação Pós-Aplicação

### 1. Verificar Tabelas

```sql
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('cirurgias', 'cirurgia_materiais', 'cirurgia_eventos')
ORDER BY tablename;
```

Deve retornar 3 linhas.

### 2. Verificar Views

```sql
SELECT schemaname, viewname 
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname LIKE 'vw_%'
ORDER BY viewname;
```

Deve mostrar pelo menos `vw_dashboard_kpis`.

### 3. Verificar Functions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE 'get_%'
ORDER BY routine_name;
```

Deve mostrar `get_dashboard_kpis`, `get_agenda_cirurgias`.

### 4. Verificar Índices

```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE '%cirurgia%'
ORDER BY indexname;
```

Deve mostrar 10+ índices.

### 5. Verificar RLS

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('cirurgias', 'cirurgia_materiais', 'cirurgia_eventos')
ORDER BY tablename, policyname;
```

Deve mostrar 12 policies.

### 6. Verificar Storage Buckets

```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE name IN ('cirurgias', 'faturamento', 'compliance', 'consignacao', 'uploads')
ORDER BY name;
```

Deve mostrar 5 buckets.

---

## 🧪 Scripts de Validação

### Via npm (após aplicar migrations)

```bash
# Reaudidar (deve mostrar 90%+ conformidade)
npm run infra:audit

# Healthcheck
npm run infra:health

# Gerar tipos TypeScript
npm run db:gen:types
```

---

## 📝 Checklist de Aplicação

- [ ] **Backup feito** (se aplicando em produção)
- [ ] **Migrations aplicadas na ordem:**
  - [ ] 01_cirurgias_tabelas
  - [ ] 02_cirurgias_rls
  - [ ] 03_dashboard_views
  - [ ] 04_dashboard_functions
  - [ ] 05_indices_performance
  - [ ] 06_seeds_demo (apenas DEV/STAGING)
  - [ ] 07_storage_config
- [ ] **Validações executadas:**
  - [ ] Tabelas criadas
  - [ ] Views materializadas
  - [ ] Functions RPC
  - [ ] Índices criados
  - [ ] RLS policies ativas
  - [ ] Storage buckets configurados
- [ ] **Edge Functions deployed** (se remoto)
- [ ] **Tipos TypeScript gerados**
- [ ] **Auditoria reexecutada** (npm run infra:audit)

---

## 🔧 Troubleshooting

### Erro: "type already exists"

```sql
-- Se enums já existem, deletar e recriar
DROP TYPE IF EXISTS status_cirurgia CASCADE;
DROP TYPE IF EXISTS status_item_cirurgia CASCADE;
-- Depois reaplicar migration
```

### Erro: "table already exists"

```sql
-- Verificar se tabela já existe
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'cirurgias';

-- Se sim, aplicar apenas o restante da migration
```

### Erro: "foreign key constraint fails"

```sql
-- Verificar dependências
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f'
  AND conrelid::regclass::text LIKE '%cirurgia%';

-- Aplicar migrations de dependências primeiro
```

---

## 🚀 Próximos Passos (Após Aplicação)

1. **Configurar Realtime:**
   - Dashboard → Database → Replication
   - Habilitar para: `cirurgias`, `cirurgia_materiais`

2. **Configurar Cron (refresh KPIs):**
   - Webhook: POST /functions/v1/recalcular_kpis
   - Intervalo: */15 * * * * (a cada 15min)

3. **Testar Edge Functions:**
   ```bash
   curl -X POST 'https://[PROJECT_REF].supabase.co/functions/v1/valida_crm_cfm' \
     -H 'Authorization: Bearer [ANON_KEY]' \
     -H 'Content-Type: application/json' \
     -d '{"crm":"123456","uf":"SP"}'
   ```

4. **Integrar com Frontend:**
   - Atualizar `src/types/database.types.ts`
   - Testar queries via Supabase Client

---

## 📚 Referências

- **Documentação Completa:** `docs/infra/INDEX.md`
- **Quick Start:** `docs/infra/QUICK_START_INFRAESTRUTURA.md`
- **Relatório Executivo:** `docs/infra/relatorio-executivo-orquestrador.md`

---

**Última Atualização:** 2025-10-20  
**Desenvolvido por:** AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

