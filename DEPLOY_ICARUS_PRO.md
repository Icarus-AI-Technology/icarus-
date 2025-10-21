# 🚀 DEPLOY MANUAL — ICARUS-PRO

## 📋 INFORMAÇÕES DO PROJETO

- **Project ID:** ttswvavcisdnonytslom
- **Dashboard:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom
- **Status:** ✅ Projeto criado e ativo

---

## ⚡ DEPLOY RÁPIDO (15-20 minutos)

### **Passo 1: Acessar SQL Editor**

1. Abra: https://supabase.com/dashboard/project/ttswvavcisdnonytslom
2. Menu lateral esquerdo → **SQL Editor**
3. Clique em **"New query"** (botão verde)

### **Passo 2: Executar Migrations em Ordem**

⚠️ **IMPORTANTE:** Execute UM POR VEZ, na ordem exata abaixo.

---

#### **Migration 1/7: Schema Inicial**

📁 **Arquivo:** `supabase/migrations/0001_init_schema.sql`

1. Abra o arquivo no seu editor
2. Copie TODO o conteúdo (Cmd+A, Cmd+C)
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (▶️)
5. Aguarde: "Success. No rows returned"

**O que cria:**
- ✅ 15 tabelas (empresas, usuarios, produtos, lotes, cirurgias, etc.)
- ✅ Estrutura multi-tenant (empresa_id em todas)
- ✅ Timestamps automáticos
- ✅ Soft delete (excluido_em)

---

#### **Migration 2/7: RLS Policies**

📁 **Arquivo:** `supabase/migrations/0002_rls_policies.sql`

1. **Limpe** o SQL Editor (Cmd+A, Delete)
2. Copie TODO o conteúdo de `0002_rls_policies.sql`
3. Cole e clique em **"Run"**

**O que cria:**
- ✅ 30+ policies RLS
- ✅ Funções JWT (auth.current_empresa, auth.current_perfil)
- ✅ Isolamento por empresa
- ✅ Controle por perfil (admin, comercial, operador)

---

#### **Migration 3/7: Índices de Performance**

📁 **Arquivo:** `supabase/migrations/0003_indexes_perf.sql`

1. Limpe o SQL Editor
2. Copie e cole `0003_indexes_perf.sql`
3. Run

**O que cria:**
- ✅ 35+ índices otimizados
- ✅ GIN indexes para full-text search
- ✅ Partial indexes para queries filtradas
- ✅ Materialized views para KPIs

---

#### **Migration 4/7: Funções e Triggers**

📁 **Arquivo:** `supabase/migrations/0004_functions_triggers.sql`

1. Limpe o SQL Editor
2. Copie e cole `0004_functions_triggers.sql`
3. Run

**O que cria:**
- ✅ Audit log imutável (blockchain-like)
- ✅ Hash chain (SHA-256)
- ✅ Triggers automáticos (updated_at)
- ✅ Funções LGPD (anonimizar, exportar dados)

---

#### **Migration 5/7: Storage Policies**

📁 **Arquivo:** `supabase/migrations/0005_storage_policies.sql`

1. Limpe o SQL Editor
2. Copie e cole `0005_storage_policies.sql`
3. Run

**O que cria:**
- ✅ 4 buckets de storage
- ✅ Policies RLS para uploads/downloads
- ✅ Isolamento por empresa

---

#### **Migration 6/7: Dados de Teste (OPCIONAL)**

📁 **Arquivo:** `supabase/migrations/0006_seed_minimo.sql`

⚠️ **Apenas para desenvolvimento! NÃO executar em produção.**

1. Limpe o SQL Editor
2. Copie e cole `0006_seed_minimo.sql`
3. Run

**O que cria:**
- ✅ Empresa de teste
- ✅ Usuários de exemplo
- ✅ Produtos, lotes, cirurgias de teste

**Para produção:** Pule esta migration!

---

#### **Migration 7/7: DPO e Conformidade**

📁 **Arquivo:** `supabase/migrations/0007_dpo_encarregado.sql`

1. Limpe o SQL Editor
2. Copie e cole `0007_dpo_encarregado.sql`
3. Run

**O que cria:**
- ✅ Campos DPO na tabela empresas
- ✅ Função de validação DPO
- ✅ View de empresas sem DPO
- ✅ Trigger de alerta

---

### **Passo 3: Validar Deploy**

Após executar todas as migrations, rode esta query no SQL Editor:

```sql
-- VALIDAÇÃO COMPLETA DO DEPLOY

-- 1. Contar tabelas
SELECT 'Tabelas' AS tipo, COUNT(*)::int AS total
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name != 'schema_migrations'

UNION ALL

-- 2. Contar policies RLS
SELECT 'Policies RLS' AS tipo, COUNT(*)::int AS total
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

-- 3. Contar índices
SELECT 'Índices' AS tipo, COUNT(*)::int AS total
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname NOT LIKE 'pg_%'

UNION ALL

-- 4. Contar funções
SELECT 'Funções' AS tipo, COUNT(*)::int AS total
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'

UNION ALL

-- 5. Verificar storage buckets
SELECT 'Storage Buckets' AS tipo, COUNT(*)::int AS total
FROM storage.buckets;
```

**Resultado esperado:**

| tipo | total |
|------|-------|
| Tabelas | 15+ |
| Policies RLS | 30+ |
| Índices | 35+ |
| Funções | 12+ |
| Storage Buckets | 4 |

---

### **Passo 4: Verificar Visualmente**

1. **Table Editor** (menu lateral) → Ver todas as tabelas criadas
2. **Authentication → Policies** → Ver RLS ativas
3. **Storage** → Ver 4 buckets criados

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Migration 1: Schema inicial (15 tabelas)
- [ ] Migration 2: RLS policies (30+ policies)
- [ ] Migration 3: Índices (35+ índices)
- [ ] Migration 4: Funções e triggers (audit log)
- [ ] Migration 5: Storage policies (4 buckets)
- [ ] Migration 6: Seed data (OPCIONAL - apenas dev)
- [ ] Migration 7: DPO (campos + validação)
- [ ] Validação SQL executada
- [ ] Resultado: 15+ tabelas, 30+ policies, 35+ índices

---

## 🎉 DEPLOY CONCLUÍDO!

### **Próximos Passos:**

#### **1. Atualizar .env local**

Crie arquivo `.env.local` na raiz do projeto:

```env
# ICARUS-PRO
VITE_SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzE1MzksImV4cCI6MjA3NjQwNzUzOX0.pZhNjYp2M9S9wF_drLA6-ZK-tk_GaaJn5kYBTxQE1xg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzMTUzOSwiZXhwIjoyMDc2NDA3NTM5fQ.5-hOqi1jCpHfqRhlixWxKUc0nkyvchkbwEGmdKuGWzc
```

#### **2. Testar conexão no frontend**

```bash
npm run dev
# Abrir http://localhost:5173
# Tentar fazer login/cadastro
```

#### **3. Configurar DPO**

```bash
# Configurar dados do DPO (LGPD)
npm run db:setup-dpo
```

#### **4. Configurar backup diário**

```bash
# Configurar cron para backup automático
npm run db:backup:setup
```

---

## 🔧 TROUBLESHOOTING

### **Erro: "relation already exists"**

✅ Normal se executar migrations 2x. Pode ignorar.

### **Erro: "permission denied"**

1. Verificar se está usando a aba SQL Editor correto
2. Service role key está ativa no projeto

### **Tabelas não aparecem no Table Editor**

1. Refresh da página (F5)
2. Verificar schema = 'public' (não 'auth' ou 'storage')

---

## 📞 SUPORTE

**E-mail:** suporte@icarusai.com.br  
**DPO:** dpo@icarusai.com.br

**Arquivos:** `supabase/migrations/*.sql`  
**Dashboard:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom

---

🎯 **Boa implementação! Após concluir, retorne aqui para próximos passos.**

