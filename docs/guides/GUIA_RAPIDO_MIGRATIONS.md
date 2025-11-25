# 🚀 GUIA RÁPIDO - Aplicar Migrations no Novo Supabase

**Projeto:** gvbkviozlhxorjoavmky  
**Tempo estimado:** 15 minutos

---

## 📋 PASSO A PASSO

### 1. Acessar SQL Editor

1. Abra: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky
2. No menu lateral, clique em: **SQL Editor**
3. Clique em: **+ New query**

---

### 2. Executar Migrations (Em Ordem)

#### Migration 1: Schema Inicial

**Arquivo:** `supabase/migrations/0001_init_schema.sql`

1. Abra o arquivo no VSCode
2. Copie TODO o conteúdo (Cmd/Ctrl + A, Cmd/Ctrl + C)
3. Cole no SQL Editor
4. Clique em **RUN** (ou Cmd/Ctrl + Enter)
5. ✅ Aguarde mensagem de sucesso

**O que faz:**
- Cria 15 tabelas (empresas, usuarios, produtos, lotes, cirurgias, etc.)
- Adiciona extensões (uuid-ossp, pgcrypto, pg_trgm)

---

#### Migration 2: RLS Policies

**Arquivo:** `supabase/migrations/0002_rls_policies.sql`

1. Copie TODO o conteúdo
2. Cole em uma **nova query** no SQL Editor
3. **RUN**
4. ✅ Sucesso

**O que faz:**
- Ativa Row Level Security em todas as tabelas
- Cria 45 policies multi-tenant
- Cria funções JWT (current_empresa, current_perfil)

---

#### Migration 3: Índices de Performance

**Arquivo:** `supabase/migrations/0003_indexes_perf.sql`

1. Copie TODO o conteúdo
2. Nova query → Cole → **RUN**
3. ✅ Sucesso

**O que faz:**
- Cria 50 índices otimizados
- Índices compostos (empresa_id + status)
- Índices GIN para busca textual

---

#### Migration 4: Funções & Triggers

**Arquivo:** `supabase/migrations/0004_functions_triggers.sql`

1. Copie → Cole → **RUN**
2. ✅ Sucesso

**O que faz:**
- Trigger `set_atualizado_em()`
- Audit log imutável (hash chain SHA-256)
- Funções LGPD (anonimizar, exportar)

---

#### Migration 5: Storage Policies

**Arquivo:** `supabase/migrations/0005_storage_policies.sql`

1. Copie → Cole → **RUN**
2. ✅ Sucesso

**O que faz:**
- Policies para buckets de storage
- Isolamento por empresa_id

---

#### Migration 6: Dados de Teste (Opcional)

**Arquivo:** `supabase/migrations/0006_seed_minimo.sql`

1. Copie → Cole → **RUN**
2. ✅ Sucesso

**O que faz:**
- Insere dados de exemplo
- Útil para desenvolvimento

**⚠️ Pule em produção!**

---

#### Migration 7: DPO (LGPD)

**Arquivo:** `supabase/migrations/0007_dpo_encarregado.sql`

1. Copie → Cole → **RUN**
2. ✅ Sucesso

**O que faz:**
- Adiciona campos DPO na tabela empresas
- Função de validação DPO
- View para empresas sem DPO

---

#### Migration 8: Storage Bucket

**Arquivo:** `supabase/migrations/0008_storage_icarus_new.sql`

1. Copie → Cole → **RUN**
2. ✅ Sucesso

**O que faz:**
- Cria bucket `icarus_new`
- Adiciona 4 policies RLS

---

### 3. Validar Instalação

Execute no SQL Editor:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Deve retornar 15 tabelas
```

```sql
-- Verificar policies
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- Deve retornar ~45
```

```sql
-- Verificar índices
SELECT COUNT(*) as total_indices
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname NOT LIKE 'pg_%';

-- Deve retornar ~50
```

---

## ✅ VALIDAÇÃO RÁPIDA

Se todos estes retornarem resultados, está tudo certo:

```sql
-- ✅ Tabelas criadas
SELECT * FROM empresas LIMIT 1;

-- ✅ RLS ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- ✅ Funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

---

## 🎯 APÓS MIGRATIONS

### Próximos Passos

1. **Configurar DPO:**
```bash
npm run db:setup-dpo
```

2. **Testar Aplicação:**
```bash
npm run dev
# Acessar: http://localhost:5173
```

3. **Criar Usuário de Teste:**
   - Dashboard → Authentication → Users
   - Add user manually
   - Email: `admin@teste.com`
   - Password: `teste123`

4. **Testar Login:**
   - http://localhost:5173/login
   - Usar credenciais criadas

---

## 🆘 ERROS COMUNS

### "permission denied for schema auth"

**Causa:** Funções foram criadas no schema `auth`

**Solução:** As migrations já foram atualizadas para usar `public` schema. Se persistir, delete as funções:

```sql
DROP FUNCTION IF EXISTS auth.current_empresa();
DROP FUNCTION IF EXISTS auth.current_perfil();
DROP FUNCTION IF EXISTS auth.current_user_id();
```

E reaplique a migration 0002.

---

### "relation already exists"

**Causa:** Migration já foi aplicada

**Solução:** Pule para a próxima migration.

---

### "function does not exist"

**Causa:** Migration anterior não foi aplicada

**Solução:** Volte e aplique as migrations anteriores em ordem.

---

## 📞 SUPORTE

**Problemas?**
- Leia: `MANUAL_COMPLETO.md`
- Veja: `100_PERCENT_COMPLETO.md`
- E-mail: suporte@icarusai.com.br

---

## 🎉 CONCLUSÃO

Após executar todas as 8 migrations, você terá:

✅ **15 tabelas** criadas  
✅ **45 policies** RLS ativas  
✅ **50 índices** de performance  
✅ **Audit log** funcionando  
✅ **Storage** configurado  
✅ **DPO** pronto para configurar

**Próximo:** Testar a aplicação! 🚀

---

**Tempo total:** 15-20 minutos  
**Dificuldade:** ⭐⭐ (Fácil)

© 2025 ICARUS v5.0

