# 🚀 ICARUS-PRO: Guia Completo de Setup Supabase

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup Inicial](#setup-inicial)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Deployment Automatizado](#deployment-automatizado)
5. [Deployment Manual](#deployment-manual)
6. [Storage Buckets](#storage-buckets)
7. [Edge Functions](#edge-functions)
8. [RLS Policies](#rls-policies)
9. [Verificação](#verificação)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### 1. Criar Conta Supabase

- Acesse: https://supabase.com
- Crie uma conta gratuita
- Crie um novo projeto

### 2. Instalar Supabase CLI

```bash
# NPM
npm install -g supabase

# Homebrew (macOS)
brew install supabase/tap/supabase

# Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 3. Instalar Dependências do Projeto

```bash
cd icarus-make
pnpm install
```

---

## 🎯 Setup Inicial

### 1. Clonar Variáveis de Ambiente

```bash
cp .env.example .env
```

### 2. Configurar .env

```env
# Supabase (obter no dashboard do projeto)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional APIs
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
TAVILY_API_KEY=your-tavily-key
```

**Como obter as chaves:**

1. Vá para o dashboard do Supabase
2. Settings → API
3. Copie as chaves

---

## ⚙️ Configuração do Projeto

### 1. Linkar ao Projeto Supabase

```bash
# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref
```

**Obter project-ref:**

- URL do projeto: `https://your-project-ref.supabase.co`
- O `project-ref` é a parte antes de `.supabase.co`

---

## 🚀 Deployment Automatizado

### Opção 1: Script Completo (Recomendado)

```bash
# Executar script de deployment
./scripts/deploy-supabase.sh
```

Este script fará:

- ✅ Link ao projeto
- ✅ Aplicar todas as migrations
- ✅ Deploy de Edge Functions
- ✅ Verificação de tabelas
- ✅ Geração de tipos TypeScript

### Opção 2: npm script

```bash
pnpm db:deploy
```

---

## 🔨 Deployment Manual

Se preferir fazer manualmente:

### 1. Aplicar Migrations

```bash
# Push all migrations
supabase db push

# Ou migration por migration
supabase db push --dry-run  # Preview
supabase db push            # Apply
```

### 2. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy edr-orchestrator
supabase functions deploy edr-stream

# Ou deploy all
for func in supabase/functions/*/; do
    supabase functions deploy $(basename $func)
done
```

### 3. Gerar Tipos TypeScript

```bash
# Local database
supabase gen types typescript --local > src/types/database.types.ts

# Remote database
supabase gen types typescript --linked > src/types/database.types.ts
```

---

## 🗄️ Storage Buckets

### Criar Buckets Manualmente

1. Vá para: Supabase Dashboard → Storage → New bucket

2. Crie os seguintes buckets:

| Bucket           | Public | Descrição               |
| ---------------- | ------ | ----------------------- |
| documentos-dpo   | ❌     | Documentos DPO/LGPD     |
| notas-fiscais    | ❌     | XMLs de NFe/NFSe        |
| imagens-produtos | ✅     | Fotos de produtos OPME  |
| relatorios       | ❌     | PDFs de relatórios      |
| certificados     | ❌     | Certificados ISO/ANVISA |
| avatares         | ✅     | Fotos de usuários       |

### RLS Policies para Storage

```sql
-- Policy para avatares (public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatares');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatares' AND
  auth.uid() IS NOT NULL
);

-- Policy para documentos privados
CREATE POLICY "Users can view org documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documentos-dpo' AND
  auth.uid() IN (
    SELECT user_id FROM user_organizations
  )
);
```

---

## ⚡ Edge Functions

### Configurar Secrets

Edge Functions precisam de variáveis de ambiente:

```bash
# Set secrets
supabase secrets set OPENAI_API_KEY=your-key
supabase secrets set TAVILY_API_KEY=your-key
supabase secrets set ANTHROPIC_API_KEY=your-key
```

### Testar Localmente

```bash
# Start local development
supabase functions serve edr-orchestrator --env-file .env

# Test endpoint
curl -X POST http://localhost:54321/functions/v1/edr-orchestrator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{"action": "start", "query": "test"}'
```

### Logs

```bash
# View function logs
supabase functions logs edr-orchestrator

# Follow logs
supabase functions logs edr-orchestrator --follow
```

---

## 🔒 RLS Policies

### Verificar Policies

```sql
-- List all policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Testar RLS

```sql
-- Test as authenticated user
SET request.jwt.claim.sub = 'user-uuid-here';

-- Test queries
SELECT * FROM organizations;
SELECT * FROM edr_research_sessions;
```

### Disable RLS (Temporariamente)

⚠️ **CUIDADO**: Apenas para debug

```sql
-- Disable RLS on a table
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Verificação

### 1. Verificar Tabelas

```bash
# List all tables
supabase db list

# Or via SQL
supabase db exec "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

### 2. Verificar Functions

```bash
# List functions
supabase functions list
```

### 3. Verificar Migrations

```bash
# Check migration status
supabase migration list
```

### 4. Verificar Storage

```bash
# List buckets (via dashboard)
# Supabase Dashboard → Storage
```

### 5. Test Connection

```bash
# Test database connection
supabase db exec "SELECT NOW();"
```

---

## 🔍 Troubleshooting

### Erro: "Project not linked"

```bash
supabase link --project-ref your-project-ref
```

### Erro: "Migration failed"

```bash
# Check migration syntax
cat supabase/migrations/your-migration.sql

# Try dry-run
supabase db push --dry-run

# Reset local database (⚠️ DATA LOSS)
supabase db reset
```

### Erro: "Edge Function deploy failed"

```bash
# Check function syntax
deno check supabase/functions/your-function/index.ts

# Set required secrets
supabase secrets list
supabase secrets set YOUR_SECRET=value
```

### Erro: "RLS denying access"

```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Temporarily disable for testing
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

### Erro: "Type generation failed"

```bash
# Make sure database is running
supabase status

# Try linked instead of local
supabase gen types typescript --linked > src/types/database.types.ts
```

### Erro: "Connection timeout"

```bash
# Check project status
supabase projects list

# Restart project
supabase projects restart your-project-ref
```

---

## 📊 Estrutura de Migrations

```
supabase/migrations/
├── 20250126000000_edr_integration.sql         # EDR tables
├── 20250126000001_icarus_pro_master.sql       # Core tables
├── 20250126000002_modules_tables.sql          # Module tables (if any)
└── 20250126000003_indexes_optimization.sql    # Performance indexes
```

**Ordem de Execução**: Migrations são executadas por ordem de timestamp.

---

## 🎯 Checklist de Deployment

### Pré-deployment

- [ ] `.env` configurado
- [ ] Supabase CLI instalado
- [ ] Projeto linkado

### Deployment

- [ ] Migrations aplicadas
- [ ] Edge Functions deployed
- [ ] Storage buckets criados
- [ ] RLS policies configuradas
- [ ] Secrets configurados

### Pós-deployment

- [ ] Tipos TypeScript gerados
- [ ] Conexão testada
- [ ] Tabelas verificadas
- [ ] Functions testadas
- [ ] Storage testado

### Desenvolvimento

- [ ] `pnpm dev` funciona
- [ ] Login funciona
- [ ] CRUD operations funcionam
- [ ] Realtime funciona
- [ ] File upload funciona

---

## 🔗 Links Úteis

- **Supabase Dashboard**: https://app.supabase.com
- **Documentação Supabase**: https://supabase.com/docs
- **CLI Reference**: https://supabase.com/docs/reference/cli
- **Edge Functions Guide**: https://supabase.com/docs/guides/functions
- **Storage Guide**: https://supabase.com/docs/guides/storage

---

## 🆘 Suporte

### Logs do Sistema

```bash
# Application logs
pnpm pm2:logs

# Database logs
supabase db logs

# Function logs
supabase functions logs function-name
```

### Reset Completo (⚠️ DATA LOSS)

```bash
# Stop everything
supabase stop

# Remove all containers
supabase db reset --linked

# Re-deploy
./scripts/deploy-supabase.sh
```

---

## 📝 Notas Importantes

1. **Nunca commitar secrets**: `.env` está no `.gitignore`
2. **Backup antes de migrations**: Sempre faça backup antes de rodar migrations em produção
3. **Test RLS policies**: Sempre teste policies antes de deploy
4. **Monitor Edge Functions**: Use logs para monitorar performance
5. **Cost control**: Monitor uso no dashboard para evitar surpresas

---

## 🎉 Sucesso!

Se tudo estiver OK, você deve ver:

- ✅ Todas as tabelas criadas
- ✅ Edge Functions deployadas
- ✅ Storage buckets criados
- ✅ RLS policies ativas
- ✅ Aplicação rodando sem erros

**Próximo passo**: Execute `pnpm dev` e acesse http://localhost:5173

---

© 2025 ICARUS-PRO v5.0 - Supabase Setup Guide
