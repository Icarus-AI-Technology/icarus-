# 🔧 GUIA DE DEPLOY - Alternativas

## ⚠️ PROBLEMA DETECTADO

A senha do PostgreSQL contém caracteres especiais que dificultam a conexão direta via URL.

**Senha original:** `[%Ortho#New&25']`

---

## ✅ SOLUÇÃO 1: Deploy Manual via Supabase Dashboard (RECOMENDADO)

### **Passo 1: Acessar SQL Editor**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `svvhzfceezllustnmhfz`
3. Clique em **SQL Editor** (menu lateral esquerdo)

### **Passo 2: Executar Migrations em Ordem**

Execute cada arquivo em ordem, copiando e colando o conteúdo:

#### **Migration 1:** `0001_init_schema.sql`

```sql
-- Copiar todo o conteúdo de: supabase/migrations/0001_init_schema.sql
-- Colar no SQL Editor
-- Clicar em "Run" (▶️)
```

#### **Migration 2:** `0002_rls_policies.sql`

```sql
-- Copiar todo o conteúdo de: supabase/migrations/0002_rls_policies.sql
-- Colar no SQL Editor
-- Clicar em "Run"
```

#### **Migration 3:** `0003_indexes_perf.sql`

```sql
-- Copiar todo o conteúdo de: supabase/migrations/0003_indexes_perf.sql
-- Colar no SQL Editor
-- Clicar em "Run"
```

#### **Migration 4:** `0004_functions_triggers.sql`

```sql
-- Copiar todo o conteúdo de: supabase/migrations/0004_functions_triggers.sql
-- Colar no SQL Editor
-- Clicar em "Run"
```

#### **Migration 5:** `0005_storage_policies.sql`

```sql
-- Copiar todo o conteúdo de: supabase/migrations/0005_storage_policies.sql
-- Colar no SQL Editor
-- Clicar em "Run"
```

#### **Migration 6:** `0006_seed_minimo.sql` *(Opcional - dados de teste)*

```sql
-- Copiar todo o conteúdo de: supabase/migrations/0006_seed_minimo.sql
-- Colar no SQL Editor
-- Clicar em "Run"
```

#### **Migration 7:** `0007_dpo_encarregado.sql`

```sql
-- Copiar todo o conteúdo de: supabase/migrations/0007_dpo_encarregado.sql
-- Colar no SQL Editor
-- Clicar em "Run"
```

### **Passo 3: Validar**

Após todas as migrations, execute no SQL Editor:

```sql
-- Verificar tabelas
SELECT COUNT(*) as total_tabelas 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar policies RLS
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar índices
SELECT COUNT(*) as total_indices 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Verificar funções
SELECT COUNT(*) as total_funcoes
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';
```

**Resultado esperado:**
- 15+ tabelas
- 30+ policies
- 35+ índices
- 12+ funções

---

## ✅ SOLUÇÃO 2: Usar Service Role Key (API do Supabase)

Se preferir automatizar:

### **Passo 1: Obter Service Role Key**

1. Supabase Dashboard → Project Settings → API
2. Copiar **`service_role`** key (⚠️ secret!)

### **Passo 2: Configurar variáveis**

```bash
export VITE_SUPABASE_URL='https://svvhzfceezllustnmhfz.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### **Passo 3: Executar deploy alternativo**

```bash
node scripts/db/deploy-supabase.mjs
```

**Limitação:** Pode não executar DDL complexo via REST API.

---

## ✅ SOLUÇÃO 3: Resetar Senha do PostgreSQL

Se quiser corrigir a senha e usar conexão direta:

### **Passo 1: Resetar senha**

1. Supabase Dashboard → Project Settings → Database
2. Seção "Connection string"
3. Click "Reset database password"
4. Gerar nova senha **SEM caracteres especiais** (ex: `Ortho2025`)

### **Passo 2: Copiar nova Connection String**

```bash
export SUPABASE_DB_URL='postgresql://postgres:NOVA_SENHA@db.svvhzfceezllustnmhfz.supabase.co:5432/postgres'
```

### **Passo 3: Executar deploy**

```bash
npm run db:deploy
```

---

## ✅ SOLUÇÃO 4: Usar Supabase CLI (mais robusto)

### **Passo 1: Instalar Supabase CLI**

```bash
brew install supabase/tap/supabase
# ou
npm install -g supabase
```

### **Passo 2: Fazer login**

```bash
supabase login
```

### **Passo 3: Linkar ao projeto**

```bash
supabase link --project-ref svvhzfceezllustnmhfz
```

### **Passo 4: Aplicar migrations**

```bash
supabase db push
```

---

## 📊 COMPARAÇÃO

| Método | Facilidade | Automação | Recomendado? |
|--------|------------|-----------|--------------|
| **Manual (Dashboard)** | ⭐⭐⭐ | ❌ | ✅ **SIM** (mais confiável) |
| **Service Role Key** | ⭐⭐ | ⭐⭐ | ⚠️ Limitações no DDL |
| **Reset Senha** | ⭐⭐⭐ | ⭐⭐⭐ | ✅ SIM (melhor longo prazo) |
| **Supabase CLI** | ⭐⭐ | ⭐⭐⭐ | ✅ **SIM** (profissional) |

---

## 🎯 RECOMENDAÇÃO IMEDIATA

**Para agora (10 min):**
Use **SOLUÇÃO 1** (Manual via Dashboard) - mais rápido e confiável.

**Para longo prazo:**
1. Instale **Supabase CLI** (SOLUÇÃO 4)
2. Configure linking do projeto
3. Use `supabase db push` para futuras migrations

---

## 📞 PRECISA DE AJUDA?

**Suporte:** suporte@icarusai.com.br

**Arquivos de migration:**
- `supabase/migrations/0001_init_schema.sql`
- `supabase/migrations/0002_rls_policies.sql`
- `supabase/migrations/0003_indexes_perf.sql`
- `supabase/migrations/0004_functions_triggers.sql`
- `supabase/migrations/0005_storage_policies.sql`
- `supabase/migrations/0006_seed_minimo.sql`
- `supabase/migrations/0007_dpo_encarregado.sql`

---

🎉 **Após completar o deploy, execute:**

```bash
# Configurar DPO
npm run db:setup-dpo

# Primeiro backup
npm run db:backup
```

