# 🚀 Aplicação Manual via Dashboard Supabase

**Project:** ttswvavcisdnonytslom  
**Status:** Pronto para aplicação manual

---

## ⚠️ Situação

A connection string está com problemas de autenticação. A forma mais confiável é aplicar via **Dashboard Supabase**.

---

## 📋 Passo a Passo (Dashboard)

### 1. Acessar SQL Editor

URL: https://app.supabase.com/project/ttswvavcisdnonytslom/sql/new

### 2. Aplicar Migrations na Ordem

#### Migration 1: Tabelas (202510201244_01)

1. Abrir arquivo: `supabase/migrations/202510201244_01_cirurgias_tabelas.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **"Run"** (ou Ctrl/Cmd+Enter)
5. Aguardar confirmação de sucesso

#### Migration 2: RLS (202510201244_02)

1. Abrir arquivo: `supabase/migrations/202510201244_02_cirurgias_rls.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **"Run"**
5. Aguardar confirmação

#### Migration 3: Views (202510201244_03)

1. Abrir arquivo: `supabase/migrations/202510201244_03_dashboard_views.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **"Run"**
5. Aguardar confirmação

#### Migration 4: Functions (202510201244_04)

1. Abrir arquivo: `supabase/migrations/202510201244_04_dashboard_functions.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **"Run"**
5. Aguardar confirmação

#### Migration 5: Índices (202510201245_05)

1. Abrir arquivo: `supabase/migrations/202510201245_05_indices_performance.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **"Run"**
5. Aguardar confirmação

#### Migration 6: Seeds (202510201246_06) - OPCIONAL

⚠️ **APENAS para DEV/STAGING!** Não executar em produção.

1. Abrir arquivo: `supabase/migrations/202510201246_06_seeds_demo.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **"Run"**
5. Aguardar confirmação

#### Migration 7: Storage (202510201247_07)

1. Abrir arquivo: `supabase/migrations/202510201247_07_storage_config.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **"Run"**
5. Aguardar confirmação

---

## ✅ Verificação (Após Aplicar)

### Ver Tabelas Criadas

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('cirurgias', 'cirurgia_materiais', 'cirurgia_eventos')
ORDER BY tablename;
```

Deve retornar **3 linhas**.

### Ver Views Criadas

```sql
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname LIKE 'vw_%'
ORDER BY viewname;
```

Deve mostrar pelo menos **vw_dashboard_kpis**.

### Ver Functions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE 'get_%'
ORDER BY routine_name;
```

Deve mostrar **get_dashboard_kpis**, **get_agenda_cirurgias**, etc.

### Ver Índices

```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE '%cirurgia%'
ORDER BY indexname;
```

Deve mostrar **10+ índices**.

### Ver RLS Policies

```sql
SELECT tablename, COUNT(*) as policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('cirurgias', 'cirurgia_materiais', 'cirurgia_eventos')
GROUP BY tablename;
```

Deve mostrar policies para cada tabela.

### Ver Storage Buckets

```sql
SELECT name, public 
FROM storage.buckets 
WHERE name IN ('cirurgias', 'faturamento', 'compliance', 'consignacao', 'uploads')
ORDER BY name;
```

Deve mostrar **5 buckets**.

---

## 🎯 Atalhos de Teclado (SQL Editor)

- **Run Query:** `Ctrl/Cmd + Enter`
- **New Query:** `Ctrl/Cmd + N`
- **Format SQL:** `Shift + Alt + F`

---

## ⏱️ Tempo Estimado

- **Total:** ~10-15 minutos
- **Por migration:** ~2 minutos cada

---

## 🔧 Troubleshooting

### Erro: "already exists"

✅ **Normal!** Significa que já foi aplicado antes. Continue para próxima migration.

### Erro: "permission denied"

❌ Verifique se está logado com usuário correto no Dashboard.

### Erro: "foreign key constraint"

❌ Verifique se aplicou as migrations **na ordem** (01 → 02 → 03 → ...).

---

## 📊 Checklist

- [ ] Migration 01: Tabelas ✅
- [ ] Migration 02: RLS ✅
- [ ] Migration 03: Views ✅
- [ ] Migration 04: Functions ✅
- [ ] Migration 05: Índices ✅
- [ ] Migration 06: Seeds (opcional) ⚠️
- [ ] Migration 07: Storage ✅
- [ ] Verificação executada ✅
- [ ] Todas as queries retornaram OK ✅

---

## 🚀 Próximos Passos

Após aplicar todas as migrations:

1. **Deploy Edge Functions** (opcional):
   - Dashboard → Edge Functions → Deploy
   - Fazer upload de `supabase/functions/*`

2. **Executar Validação Local:**
   ```bash
   npm run infra:audit
   npm run infra:health
   ```

3. **Gerar Tipos TypeScript:**
   ```bash
   npm run db:gen:types
   ```

---

## 📞 Suporte

Se encontrar erros:
1. Copiar mensagem de erro completa
2. Verificar arquivo da migration correspondente
3. Consultar `docs/infra/APLICACAO_MIGRATIONS_MANUAL.md`

---

**Desenvolvido por:** AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3  
**Data:** 2025-10-20

