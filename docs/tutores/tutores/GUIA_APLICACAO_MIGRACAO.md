# 🚀 GUIA DE APLICAÇÃO DA MIGRAÇÃO — Tutores IA & Economia

**Data:** 2025-10-20  
**Migração:** `0009_tutores_economia_corrigido.sql`  
**Status:** ✅ Pronta para aplicar

---

## 📋 OPÇÕES DE APLICAÇÃO

### **OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)** ⭐

**Passo a passo:**

1. **Acessar SQL Editor**
   ```
   https://supabase.com/dashboard/project/ttswvavcisdnonytslom/sql
   ```

2. **Copiar SQL da migração**
   - Abrir arquivo: `supabase/migrations/0009_tutores_economia_corrigido.sql`
   - Copiar TODO o conteúdo (Ctrl+A, Ctrl+C)

3. **Colar e Executar**
   - Colar no SQL Editor
   - Clicar em **"Run"** (ou Ctrl+Enter)

4. **Aguardar confirmação**
   - ✅ Sucesso: `Success. No rows returned`
   - ❌ Erro: Ver seção "Troubleshooting" abaixo

**Tempo estimado:** 2-3 minutos

---

### **OPÇÃO 2: Via psql (Linha de Comando)**

**Pré-requisitos:**
- PostgreSQL client (`psql`) instalado
- Connection string do banco

**Comandos:**

```bash
# 1. Exportar connection string
export SUPABASE_DB_URL="postgresql://postgres:[SENHA]@db.ttswvavcisdnonytslom.supabase.co:5432/postgres"

# 2. Aplicar migração
psql "$SUPABASE_DB_URL" < supabase/migrations/0009_tutores_economia_corrigido.sql

# 3. Verificar se foi aplicada
psql "$SUPABASE_DB_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('feature_flags', 'conhecimento_base', 'tutor_logs') ORDER BY table_name;"
```

**Obter senha do banco:**
1. Supabase Dashboard → Project Settings → Database
2. Copiar "Database Password"

---

### **OPÇÃO 3: Via Supabase CLI (Se instalado)**

```bash
# 1. Instalar Supabase CLI (se necessário)
brew install supabase/tap/supabase  # macOS
# ou
npm install -g supabase              # npm

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref ttswvavcisdnonytslom

# 4. Aplicar migração
supabase db push
```

---

## ✅ VALIDAÇÃO PÓS-APLICAÇÃO

Após aplicar a migração, executar no SQL Editor:

```sql
-- 1. Verificar tabelas criadas/atualizadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = t.table_name) as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'feature_flags',
    'feature_flags_audit',
    'conhecimento_base',
    'legislacao_updates',
    'notificacoes_legislacao',
    'tutor_logs',
    'certificacoes_usuario'
  )
ORDER BY table_name;

-- Resultado esperado: 7 tabelas

-- 2. Verificar se embedding foi adicionado em conhecimento_base
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'conhecimento_base'
  AND column_name IN ('embedding', 'categoria', 'modulo', 'tags')
ORDER BY column_name;

-- Resultado esperado: 4 colunas (se tabela já existia)

-- 3. Verificar Materialized View
SELECT schemaname, matviewname
FROM pg_matviews
WHERE schemaname = 'public' 
  AND matviewname = 'mv_compliance_dashboard';

-- Resultado esperado: 1 view

-- 4. Verificar índices criados
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tutor_logs', 'conhecimento_base', 'certificacoes_usuario')
ORDER BY tablename, indexname;

-- Resultado esperado: 10+ índices
```

**Status esperado:**
- ✅ 7 tabelas criadas ou atualizadas
- ✅ 1 materialized view criada
- ✅ 10+ índices criados
- ✅ Extension `vector` habilitada

---

## 🔧 TROUBLESHOOTING

### **Erro: "relation already exists"**

**Causa:** Tabela já existe e migration tentou criar novamente

**Solução:**
```sql
-- A migração corrigida usa IF NOT EXISTS e DO $$ blocks
-- Se ainda ocorrer, executar manualmente cada bloco DO $$
```

### **Erro: "type 'vector' does not exist"**

**Causa:** Extension pgvector não instalada

**Solução:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### **Erro: "column already exists"**

**Causa:** Coluna já foi adicionada anteriormente

**Solução:**
```sql
-- Ignorar o erro, usar ADD COLUMN IF NOT EXISTS
-- Já está implementado na migração corrigida
```

### **Erro: "permission denied"**

**Causa:** Usando chave ANON ao invés de SERVICE_ROLE

**Solução:**
- Usar SQL Editor do Supabase Dashboard (tem permissões)
- OU usar connection string com usuário `postgres`

---

## 📊 RESUMO DA MIGRAÇÃO

**O que será criado/atualizado:**

| Tabela | Ação | Colunas Principais |
|--------|------|-------------------|
| `feature_flags` | Atualizar | +description, +user_segments, +rollout_percentage |
| `feature_flags_audit` | Criar | Audit log de mudanças |
| `conhecimento_base` | Atualizar | +embedding (VECTOR), +categoria, +modulo |
| `legislacao_updates` | Criar | Scraping de leis ANVISA/RFB |
| `notificacoes_legislacao` | Criar | Notificações de mudanças |
| `tutor_logs` | Atualizar | +tutor_tipo, +tokens_usados, +satisfacao |
| `certificacoes_usuario` | Criar | Certificações por função |
| `documentos_regulatorios` | Atualizar | +score_conformidade, +problemas |
| `mv_compliance_dashboard` | Criar | View materializada |

**Tempo estimado:** 2-3 minutos  
**Downtime:** 0 (zero)  
**Reversível:** ✅ Sim (apenas adiciona, nunca remove)

---

## 🎯 APÓS APLICAR

1. **Atualizar Feature Flags no código:**
   ```typescript
   // src/lib/feature-flags.ts já está pronto
   import { useFeatureFlag } from '@/lib/feature-flags';
   
   const ollamaEnabled = useFeatureFlag('ollama_enabled');
   ```

2. **Iniciar serviços automatizados:**
   ```bash
   pm2 start ecosystem.economia.config.js
   ```

3. **Popular conhecimento_base:**
   ```bash
   npm run ai:tutor:reindex
   ```

4. **Gerar primeiro relatório de custos:**
   ```bash
   npm run cost:report
   ```

---

## 📞 SUPORTE

**Projeto ID:** `ttswvavcisdnonytslom`  
**Dashboard:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom  
**Migrations:** `supabase/migrations/0009_tutores_economia_corrigido.sql`

---

**© 2025 ICARUS v5.0 — Migração Pronta para Aplicar** ✅

