# ⚠️ MCP SUPABASE INDISPONÍVEL - ALTERNATIVAS

**Status:** Supabase MCP com erro 500 (Cloudflare)  
**Data:** 18 de Novembro de 2025

---

## 🔄 ALTERNATIVA 1: Dashboard Supabase (RECOMENDADO)

### Passo a Passo Rápido

1. **Acesse o SQL Editor:**
   - https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/editor

2. **Execute cada migration:**
   - Copie o conteúdo de `supabase/migrations/0001_init_schema.sql`
   - Cole no SQL Editor
   - Clique em **RUN** (Cmd/Ctrl + Enter)
   - Repita para as 8 migrations

3. **Validar:**
   ```sql
   -- Verificar tabelas
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE';
   -- Deve retornar 15
   ```

**Tempo:** 15-20 minutos  
**Confiabilidade:** ✅ 100%

---

## 🔄 ALTERNATIVA 2: Script Node.js

### Configuração

```bash
# 1. Obter senha do banco
# Dashboard → Settings → Database → Connection String
# Copiar a senha

# 2. Configurar variável
export SUPABASE_DB_URL="postgresql://postgres:SUA_SENHA_AQUI@db.gvbkviozlhxorjoavmky.supabase.co:5432/postgres"

# 3. Executar deploy
node scripts/db/deploy-node.cjs
```

### Se não tiver a senha

1. Dashboard → Settings → Database
2. Clique em **Reset database password**
3. Copie a nova senha
4. Use no comando acima

**Tempo:** 5 minutos (se tiver a senha)  
**Confiabilidade:** ✅ 95%

---

## 🔄 ALTERNATIVA 3: Execute SQL Diretamente

O Supabase MCP `execute_sql` também está indisponível no momento.

**Aguardar:**
- Serviço deve voltar em alguns minutos
- Cloudflare está reportando erro 500

---

## 📋 ORDEM DAS MIGRATIONS

Execute nesta ordem no SQL Editor:

1. ✅ `0001_init_schema.sql` - Tabelas base
2. ✅ `0002_rls_policies.sql` - Segurança RLS
3. ✅ `0003_indexes_perf.sql` - Performance
4. ✅ `0004_functions_triggers.sql` - Audit log
5. ✅ `0005_storage_policies.sql` - Storage
6. ⏸️ `0006_seed_minimo.sql` - Dados teste (opcional)
7. ✅ `0007_dpo_encarregado.sql` - DPO (LGPD)
8. ✅ `0008_storage_icarus_new.sql` - Bucket

---

## 🎯 RECOMENDAÇÃO

**Use a Alternativa 1 (Dashboard)** enquanto o MCP está indisponível.

É o método mais confiável e você consegue ver os resultados em tempo real.

---

## 📞 SUPORTE

**Se tiver dúvidas:**
- Consulte: `GUIA_RAPIDO_MIGRATIONS.md`
- Ou: `MANUAL_COMPLETO.md`

**Problema com o MCP:**
- É temporário (erro Cloudflare)
- Dashboard funciona 100%

---

**Tempo estimado:** 15-20 minutos via Dashboard

© 2025 ICARUS v5.0

