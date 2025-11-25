# 🚀 DEPLOY VIA SUPABASE MCP — ICARUS-PRO

## ⚠️ STATUS ATUAL

O Supabase MCP está configurado em **modo read-only**, o que significa que:
- ✅ **Pode consultar:** Tabelas, migrations, logs, advisors
- ❌ **Não pode modificar:** Apply migrations, execute SQL DDL

---

## 📦 SCRIPT CRIADO

✅ **Arquivo:** `scripts/db/deploy-mcp.mjs`

**Funcionalidades:**
- Lista todas as migrations disponíveis
- Exibe informações detalhadas (nome, linhas, path)
- Gera instruções para uso manual

**Como usar:**

```bash
# Listar migrations
node scripts/db/deploy-mcp.mjs --list

# Ver ajuda
node scripts/db/deploy-mcp.mjs --help

# Ver todas as migrations com instruções
node scripts/db/deploy-mcp.mjs
```

---

## 🔧 FERRAMENTAS MCP DISPONÍVEIS

### **Read-Only (funcionam):**

```bash
# Listar tabelas
mcp_supabase_list_tables

# Listar migrations aplicadas
mcp_supabase_list_migrations

# Executar queries SELECT
mcp_supabase_execute_sql

# Ver logs (api, postgres, auth, storage, realtime, edge-function)
mcp_supabase_get_logs

# Ver advisors (security, performance)
mcp_supabase_get_advisors

# Listar extensões
mcp_supabase_list_extensions

# Obter URL do projeto
mcp_supabase_get_project_url

# Obter anon key
mcp_supabase_get_anon_key

# Gerar tipos TypeScript
mcp_supabase_generate_typescript_types

# Edge Functions
mcp_supabase_list_edge_functions
mcp_supabase_get_edge_function
mcp_supabase_deploy_edge_function

# Branches
mcp_supabase_list_branches
mcp_supabase_create_branch
mcp_supabase_delete_branch
mcp_supabase_merge_branch
```

### **Write (bloqueadas em read-only):**

```bash
# Aplicar migration (❌ bloqueado)
mcp_supabase_apply_migration

# Executar SQL DDL (❌ bloqueado)  
mcp_supabase_execute_sql (apenas SELECT funciona)
```

---

## ✅ SOLUÇÃO RECOMENDADA

Como o MCP está em read-only, você tem **3 opções**:

### **OPÇÃO 1: Deploy Manual via Dashboard (MAIS RÁPIDO)**

📚 **Guia completo:** `DEPLOY_ICARUS_PRO.md`

1. Acesse: https://supabase.com/dashboard/project/ttswvavcisdnonytslom
2. Vá em **SQL Editor**
3. Execute as 7 migrations em ordem

**Tempo:** 15-20 minutos  
**Confiabilidade:** ✅ 100%

---

### **OPÇÃO 2: Usar MCP para Consultar Depois**

Após fazer o deploy manual, você pode usar o MCP para:

```javascript
// Verificar tabelas criadas
await mcp_supabase_list_tables({ schemas: ['public'] });

// Ver migrations aplicadas  
await mcp_supabase_list_migrations();

// Verificar advisors de segurança
await mcp_supabase_get_advisors({ type: 'security' });

// Verificar advisors de performance
await mcp_supabase_get_advisors({ type: 'performance' });

// Ver logs
await mcp_supabase_get_logs({ service: 'postgres' });

// Gerar types TypeScript
await mcp_supabase_generate_typescript_types();
```

---

### **OPÇÃO 3: Verificar se há write-mode disponível**

Se o projeto Supabase está configurado com permissões write, você pode:

1. Verificar configuração do MCP no Cursor
2. Ajustar permissões no Supabase project settings
3. Usar `mcp_supabase_apply_migration` diretamente

---

## 📋 MIGRATIONS DISPONÍVEIS (Total: 11)

| # | Arquivo | Linhas | Status |
|---|---------|--------|--------|
| 1 | `0001_init_schema.sql` | 390 | ⏳ Pendente |
| 2 | `0002_rls_policies.sql` | 483 | ⏳ Pendente |
| 3 | `0003_indexes_perf.sql` | 290 | ⏳ Pendente |
| 4 | `0004_functions_triggers.sql` | 526 | ⏳ Pendente |
| 5 | `0005_storage_policies.sql` | 305 | ⏳ Pendente |
| 6 | `0006_seed_minimo.sql` | 189 | ⏳ Pendente (opcional) |
| 7 | `0007_dpo_encarregado.sql` | 177 | ⏳ Pendente |
| 8 | `20251018_entregas.sql` | 143 | ⏳ Pendente |
| 9 | `20251018_faturas.sql` | 103 | ⏳ Pendente |
| 10 | `20251018_initial_schema.sql` | 332 | ⏳ Pendente |
| 11 | `20251018_rls_policies.sql` | 354 | ⏳ Pendente |

**Total:** 3.292 linhas de SQL  
**Principais:** 7 migrations essenciais (0001-0007)

---

## 🎯 AÇÃO RECOMENDADA

### **AGORA (15 min):**

1. **Abra:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom
2. **Vá em:** SQL Editor
3. **Execute:** Migrations 0001 → 0007 (uma por vez)
4. **Guia:** Ver `DEPLOY_ICARUS_PRO.md`

### **DEPOIS (5 min):**

Usar MCP para validar:

```bash
# Verificar tabelas
node -e "console.log('Verificar no Cursor Agent com MCP')"

# Ou pedir ao Cursor Agent:
"Liste todas as tabelas do Supabase usando o MCP"
"Verifique os advisors de segurança usando o MCP"
"Gere os tipos TypeScript usando o MCP"
```

---

## 💡 USO DO MCP APÓS DEPLOY

### **Consultas Úteis:**

```typescript
// 1. Listar todas as tabelas criadas
await mcp_supabase_list_tables({ schemas: ['public'] });

// 2. Verificar migrations aplicadas
await mcp_supabase_list_migrations();

// 3. Consultar dados (SELECT apenas)
await mcp_supabase_execute_sql({ 
  query: 'SELECT COUNT(*) FROM empresas' 
});

// 4. Ver advisors de segurança
await mcp_supabase_get_advisors({ type: 'security' });

// 5. Ver advisors de performance
await mcp_supabase_get_advisors({ type: 'performance' });

// 6. Ver logs do Postgres
await mcp_supabase_get_logs({ service: 'postgres' });

// 7. Ver logs da API
await mcp_supabase_get_logs({ service: 'api' });

// 8. Gerar tipos TypeScript
await mcp_supabase_generate_typescript_types();

// 9. Obter URL do projeto
await mcp_supabase_get_project_url();

// 10. Obter anon key
await mcp_supabase_get_anon_key();
```

---

## 📊 RESUMO

| Item | Status |
|------|--------|
| **Script MCP** | ✅ Criado (`deploy-mcp.mjs`) |
| **MCP Read** | ✅ Funcional |
| **MCP Write** | ❌ Read-only mode |
| **Solução** | ✅ Deploy manual via Dashboard |
| **Validação MCP** | ✅ Disponível após deploy |

---

## 🔗 LINKS ÚTEIS

- **Dashboard:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom
- **SQL Editor:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom/editor
- **Guia Deploy:** `DEPLOY_ICARUS_PRO.md`
- **Migrações:** `supabase/migrations/*.sql`

---

## 📞 PRÓXIMOS PASSOS

1. ✅ **Executar migrations** manualmente (DEPLOY_ICARUS_PRO.md)
2. ✅ **Validar com MCP:** `mcp_supabase_list_tables`
3. ✅ **Configurar DPO:** `npm run db:setup-dpo`
4. ✅ **Primeiro backup:** `npm run db:backup`
5. ✅ **Gerar types:** `mcp_supabase_generate_typescript_types`

---

**Data:** 2025-10-18  
**Projeto:** ICARUS-PRO (`ttswvavcisdnonytslom`)  
**Script:** `scripts/db/deploy-mcp.mjs`

