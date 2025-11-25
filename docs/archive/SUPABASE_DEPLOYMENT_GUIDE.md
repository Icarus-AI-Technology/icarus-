# 🚀 GUIA DE DEPLOYMENT - NOVO PROJETO SUPABASE

**Projeto:** ICARUS - Sistema OPME Multi-tenant  
**Data:** 2025-01-26  
**Versão:** 1.0.0  
**Tempo Estimado:** 2-3 horas

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar, certifique-se de ter:

- [ ] Conta no Supabase (https://supabase.com)
- [ ] Conta na Vercel (https://vercel.com)
- [ ] Supabase CLI instalado: `npm install -g supabase`
- [ ] Vercel CLI instalado: `npm install -g vercel`
- [ ] PostgreSQL client (psql) instalado
- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] Acesso ao repositório do projeto

---

## 🎯 FASE 1: CRIAR NOVO PROJETO SUPABASE

### 1.1 Criar Projeto no Dashboard

1. Acesse https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `icarus-oficial` (ou nome desejado)
   - **Database Password:** Gere uma senha forte e **ANOTE**
   - **Region:** Escolha a região mais próxima (ex: `sa-east-1` para Brasil)
   - **Pricing Plan:** Escolha o plano adequado (Free/Pro)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos até o projeto estar pronto

### 1.2 Anotar Credenciais Críticas

Vá em **Settings → API** e anote:

```bash
# Project Ref (parte da URL)
PROJECT_REF=sua-referencia-aqui

# Project URL
SUPABASE_URL=https://sua-referencia-aqui.supabase.co

# API Keys
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** Guarde `SUPABASE_SERVICE_ROLE_KEY` em local seguro (1Password, Bitwarden, etc). NUNCA comite no Git!

### 1.3 Anotar Database Connection String

Vá em **Settings → Database** e copie:

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.sua-referencia-aqui.supabase.co:5432/postgres
```

---

## 🗄️ FASE 2: INSTALAR EXTENSÕES POSTGRESQL

### 2.1 Abrir SQL Editor

1. No dashboard do Supabase, vá em **SQL Editor**
2. Crie uma nova query
3. Cole e execute o seguinte SQL:

```sql
-- ============================================
-- EXTENSÕES OBRIGATÓRIAS
-- ============================================
-- Executar NA ORDEM
-- ============================================

-- 1. UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- 2. Encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;

-- 3. Full-text search (trigram)
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA public;

-- 4. pgvector para ML/embeddings
CREATE EXTENSION IF NOT EXISTS "vector" SCHEMA public;

-- 5. Índices GIN otimizados
CREATE EXTENSION IF NOT EXISTS "btree_gin" SCHEMA public;

-- 6. Índices GIST otimizados
CREATE EXTENSION IF NOT EXISTS "btree_gist" SCHEMA public;

-- ============================================
-- VALIDAR INSTALAÇÃO
-- ============================================
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'vector', 'btree_gin', 'btree_gist')
ORDER BY extname;
```

### 2.2 Validar Resultado

Você deve ver 6 extensões instaladas:

```
extname      | extversion
-------------|------------
btree_gin    | 1.3
btree_gist   | 1.7
pg_trgm      | 1.6
pgcrypto     | 1.3
uuid-ossp    | 1.1
vector       | 0.5.1
```

---

## 📦 FASE 3: APLICAR MIGRATIONS

### Opção A: Migration Consolidada (RECOMENDADO - Mais Rápido)

#### 3.1 Conectar via psql

```bash
# Configurar variável de ambiente
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.sua-referencia-aqui.supabase.co:5432/postgres"

# Testar conexão
psql $DATABASE_URL -c "SELECT version();"
```

#### 3.2 Aplicar Migration Master

```bash
# Navegar para o diretório do projeto
cd /caminho/para/icarus-make

# Aplicar migration consolidada
psql $DATABASE_URL -f supabase/migrations/20250126_consolidated_all_tables.sql

# Aguardar conclusão (pode levar 5-10 minutos)
```

#### 3.3 Validar Aplicação

```bash
# Verificar total de tabelas criadas
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Deve retornar ~100+ tabelas
```

---

### Opção B: Migrations Individuais (Ordem Sequencial)

Se preferir aplicar migrations individuais:

```bash
# Script de aplicação sequencial
cd /caminho/para/icarus-make/supabase/migrations

# Aplicar na ordem correta
psql $DATABASE_URL -f 0001_init_schema.sql
psql $DATABASE_URL -f 0002_rls_policies.sql
psql $DATABASE_URL -f 0003_indexes_perf.sql
psql $DATABASE_URL -f 0004_functions_triggers.sql
psql $DATABASE_URL -f 0005_storage_policies.sql
psql $DATABASE_URL -f 0006_seed_minimo.sql
psql $DATABASE_URL -f 0007_dpo_encarregado.sql
psql $DATABASE_URL -f 0008_storage_icarus_new.sql
# ... continuar com todas as migrations na ordem documentada
```

⚠️ **ATENÇÃO:** Para lista completa ordenada, veja `SUPABASE_AUDIT.md` seção 10.2

---

## 🗂️ FASE 4: CONFIGURAR STORAGE BUCKETS

### 4.1 Criar Buckets no Dashboard

Vá em **Storage** no dashboard e crie os seguintes buckets:

| Bucket Name | Public | File Size Limit | Allowed MIME Types |
|-------------|--------|-----------------|---------------------|
| `documentos_cirurgias` | ❌ Private | 10 MB | `application/pdf`, `image/jpeg`, `image/png`, `application/xml` |
| `documentos_fiscais` | ❌ Private | 50 MB | `application/pdf`, `application/xml`, `text/xml` |
| `anexos_produtos` | ❌ Private | 5 MB | `application/pdf`, `image/jpeg`, `image/png` |
| `avatares` | ✅ Public | 1 MB | `image/jpeg`, `image/png`, `image/webp` |
| `icarus_new` | ❌ Private | 50 MB | Imagens, PDF, Office docs, CSV |

### 4.2 Verificar Policies

As policies de Storage já foram aplicadas nas migrations. Para validar:

```sql
-- Executar no SQL Editor
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
```

Você deve ver policies como:
- `icarus_new_select_own_empresa`
- `icarus_new_insert_own_empresa`
- `pol_storage_cirurgias_select`
- etc.

---

## ⚡ FASE 5: DEPLOY DE EDGE FUNCTIONS

### 5.1 Fazer Login no Supabase CLI

```bash
# Login
supabase login

# Linkar projeto
supabase link --project-ref sua-referencia-aqui
```

### 5.2 Deploy de Todas as Edge Functions

```bash
cd /caminho/para/icarus-make

# Deploy individual de cada function
supabase functions deploy create-admin
supabase functions deploy webhook-processor
supabase functions deploy ml-vectors
supabase functions deploy ml-job
supabase functions deploy orchestrator
supabase functions deploy agent-benchmark
supabase functions deploy agent-compliance
supabase functions deploy agent-synthesis
supabase functions deploy agent-erp
supabase functions deploy edr-orchestrator
supabase functions deploy edr-stream
supabase functions deploy consulta_anvisa_produto
supabase functions deploy valida_crm_cfm
supabase functions deploy recalcular_kpis
supabase functions deploy test-credential
supabase functions deploy vector-benchmark
```

### 5.3 Validar Deployment

```bash
# Listar functions deployadas
supabase functions list
```

---

## 🔐 FASE 6: CONFIGURAR SECRETS DAS EDGE FUNCTIONS

### 6.1 Configurar Secrets Obrigatórios

```bash
# Secrets para create-admin
supabase secrets set ADMIN_INITIAL_EMAIL=admin@icarus.com.br
supabase secrets set ADMIN_INITIAL_PASSWORD=SuaSenhaForteAqui123!
supabase secrets set ADMIN_INITIAL_NAME="Administrador Sistema"

# Feature flags para ML
supabase secrets set FF_AI_TUTOR_CIRURGIAS=true
supabase secrets set FF_TUTOR_CIRURGIAS=true
supabase secrets set FF_ML_QUEUE=true
```

### 6.2 Validar Secrets

```bash
# Listar secrets (valores não são exibidos por segurança)
supabase secrets list
```

---

## 👤 FASE 7: CRIAR USUÁRIO ADMIN INICIAL

### 7.1 Invocar Edge Function create-admin

```bash
# Via curl
curl -X POST \
  https://sua-referencia-aqui.supabase.co/functions/v1/create-admin \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Resposta esperada:
# {"ok":true,"user_id":"uuid-do-usuario-admin"}
```

### 7.2 Validar Criação do Admin

```bash
# No SQL Editor, executar:
SELECT id, email, raw_user_meta_data->>'nome' as nome, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@icarus.com.br';
```

---

## 🛡️ FASE 8: VALIDAR RLS POLICIES

### 8.1 Verificar Tabelas com RLS Habilitado

```bash
# Executar no SQL Editor
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;
```

### 8.2 Contar Policies Implementadas

```bash
# Executar no SQL Editor
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Deve retornar ~650+ policies
```

### 8.3 Testar Isolamento Multi-tenant

```sql
-- 1. Criar empresa de teste
INSERT INTO public.empresas (nome, cnpj, razao_social, status)
VALUES ('Empresa Teste', '12.345.678/0001-99', 'Empresa Teste Ltda', 'ativa')
RETURNING id;

-- Anotar o UUID retornado

-- 2. Tentar acessar sem autenticação (deve falhar)
SET ROLE anon;
SELECT * FROM public.empresas;
-- Deve retornar 0 rows (RLS bloqueando)

RESET ROLE;
```

---

## 🌐 FASE 9: CONFIGURAR VERCEL

### 9.1 Fazer Login na Vercel

```bash
vercel login
```

### 9.2 Linkar Projeto Vercel

```bash
cd /caminho/para/icarus-make
vercel link

# Seguir prompts:
# ? Set up "~/icarus-make"? Yes
# ? Which scope should contain your project? [Seu scope]
# ? Found project "icarus-oficial". Link to it? Yes
```

### 9.3 Configurar Variáveis de Ambiente

#### Opção A: Via CLI

```bash
# SUPABASE_URL
echo "https://sua-referencia-aqui.supabase.co" | vercel env add VITE_SUPABASE_URL production

# SUPABASE_ANON_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | vercel env add VITE_SUPABASE_ANON_KEY production

# APP_URL
echo "https://icarus-oficial.vercel.app" | vercel env add VITE_APP_URL production

# NODE_ENV
echo "production" | vercel env add NODE_ENV production
```

#### Opção B: Via Dashboard

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto `icarus-oficial`
3. Vá em **Settings → Environment Variables**
4. Adicione as variáveis:

```
VITE_SUPABASE_URL = https://sua-referencia-aqui.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL = https://icarus-oficial.vercel.app
NODE_ENV = production
```

---

## 🚀 FASE 10: DEPLOY DO FRONTEND

### 10.1 Build Local (Opcional - Validação)

```bash
cd /caminho/para/icarus-make

# Instalar dependências
npm install
# ou
pnpm install

# Build de produção
npm run build

# Verificar erros de build
# Se houver erros, corrija antes de fazer deploy
```

### 10.2 Deploy na Vercel

```bash
# Deploy para produção
vercel --prod

# Aguardar build e deploy (3-5 minutos)
# Vercel retornará a URL do deployment
```

### 10.3 Validar Deployment

Acesse a URL fornecida pela Vercel e verifique:

- [ ] Aplicação carrega sem erros
- [ ] Página de login acessível
- [ ] Console do navegador sem erros críticos

---

## ✅ FASE 11: TESTES FINAIS

### 11.1 Teste de Login

1. Acesse a aplicação deployada
2. Faça login com:
   - **Email:** `admin@icarus.com.br`
   - **Senha:** A senha configurada em `ADMIN_INITIAL_PASSWORD`
3. Verificar se:
   - [ ] Login funciona
   - [ ] Dashboard principal carrega
   - [ ] Menu lateral exibe corretamente

### 11.2 Teste de Multi-tenancy

1. Criar uma empresa de teste:
   - Vá em Cadastros → Empresas → Nova Empresa
   - Preencha os dados
   - Salvar
2. Criar um usuário associado à empresa:
   - Vá em Cadastros → Usuários → Novo Usuário
   - Vincular à empresa criada
3. Fazer logout do admin
4. Fazer login com novo usuário
5. Verificar:
   - [ ] Usuário vê apenas dados da própria empresa
   - [ ] Não consegue acessar dados de outras empresas

### 11.3 Teste de Storage

1. Na aplicação, fazer upload de um arquivo:
   - Ex: Avatar de usuário, ou documento de cirurgia
2. Verificar:
   - [ ] Upload bem-sucedido
   - [ ] Arquivo aparece na listagem
   - [ ] Download funciona

### 11.4 Teste de Edge Functions

```bash
# Testar Edge Function de teste
curl -X POST \
  https://sua-referencia-aqui.supabase.co/functions/v1/test-credential \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Deve retornar 200 OK
```

### 11.5 Teste de Webhooks (Opcional)

1. No SQL Editor, inserir um endpoint de teste:

```sql
INSERT INTO webhook_endpoints (
  organization_id,
  url,
  method,
  events,
  active
) VALUES (
  (SELECT id FROM organizations LIMIT 1),
  'https://webhook.site/seu-uuid-aqui',
  'POST',
  ARRAY['cirurgia.created'],
  true
);
```

2. Criar uma cirurgia pela UI
3. Verificar se webhook foi disparado (checar webhook.site)

---

## 🐛 TROUBLESHOOTING

### Problema: "relation does not exist"

**Causa:** Migration não aplicada completamente

**Solução:**
```bash
# Verificar quais tabelas faltam
psql $DATABASE_URL -c "\dt public.*"

# Re-aplicar migration consolidada
psql $DATABASE_URL -f supabase/migrations/20250126_consolidated_all_tables.sql
```

---

### Problema: "RLS policy violation"

**Causa:** Usuário não tem `empresa_id` ou `organization_id` configurado

**Solução:**
```sql
-- Verificar perfil do usuário
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Se não existir, criar:
INSERT INTO public.profiles (id, full_name, empresa_id)
VALUES (
  auth.uid(),
  'Nome do Usuário',
  (SELECT id FROM public.empresas LIMIT 1)
);
```

---

### Problema: Edge Function retorna 500

**Causa:** Secrets não configurados ou erro no código

**Solução:**
```bash
# Verificar logs da function
supabase functions logs <function-name> --tail

# Verificar secrets
supabase secrets list

# Re-deploy da function
supabase functions deploy <function-name>
```

---

### Problema: Build falha na Vercel

**Causa:** Erro de TypeScript ou variáveis de ambiente

**Solução:**
1. Verificar logs de build no dashboard da Vercel
2. Validar variáveis de ambiente (Settings → Environment Variables)
3. Fazer build local para identificar erro:
   ```bash
   npm run build
   ```

---

### Problema: "vector extension not found"

**Causa:** Extensão pgvector não instalada

**Solução:**
```sql
-- No SQL Editor do Supabase
CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;

-- Verificar
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

---

## 📊 CHECKLIST FINAL

### Supabase

- [ ] Projeto criado
- [ ] Extensões PostgreSQL instaladas (6 extensões)
- [ ] Migrations aplicadas (100+ tabelas criadas)
- [ ] Storage buckets criados (5 buckets)
- [ ] Edge Functions deployadas (17 functions)
- [ ] Secrets configurados
- [ ] Usuário admin criado
- [ ] RLS policies validadas (650+ policies)

### Vercel

- [ ] Projeto linkado
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Deployment ativo
- [ ] Domínio customizado (opcional)

### Testes

- [ ] Login funciona
- [ ] Multi-tenancy validado
- [ ] Storage funcional
- [ ] Edge Functions operacionais
- [ ] Webhooks testados (opcional)

---

## 🎉 CONCLUSÃO

Se todos os checkboxes acima estão marcados, **PARABÉNS!** 🎊

Seu novo projeto Supabase está **100% operacional** e pronto para uso em produção!

### Próximos Passos Recomendados

1. **Backup Imediato:**
   ```bash
   supabase db dump -f backup-inicial.sql
   ```

2. **Configurar Monitoramento:**
   - Habilitar alertas no Supabase Dashboard
   - Configurar Vercel Analytics
   - Configurar Sentry (se disponível)

3. **Documentar Credenciais:**
   - Armazenar todas as credenciais em cofre seguro (1Password, etc)
   - Compartilhar com equipe via canais seguros

4. **Planejar Backup Automático:**
   - Configurar backup diário no Supabase (Settings → Database → Backups)

5. **Configurar CI/CD:**
   - Automatizar deploys via GitHub Actions (se aplicável)

---

## 📞 SUPORTE

Se encontrar problemas não documentados aqui:

1. Consulte `SUPABASE_AUDIT.md` para detalhes técnicos
2. Verifique logs do Supabase: Dashboard → Logs
3. Verifique logs da Vercel: Dashboard → Deployments → Logs
4. Consulte documentação oficial:
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs

---

**Documento:** SUPABASE_DEPLOYMENT_GUIDE.md  
**Versão:** 1.0.0  
**Data:** 2025-01-26  
**Autor:** Engenheiro de Backend Sênior & Arquiteto Supabase

