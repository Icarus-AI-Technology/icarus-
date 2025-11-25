# 🚀 GUIA RÁPIDO — Aplicar Migração no Supabase

**Status:** ✅ Pronto para execução  
**Tempo estimado:** 2 minutos  
**Risco:** ✅ Zero (migração usa IF NOT EXISTS)

---

## 📋 PASSO 1: Copiar SQL

Execute no terminal:

```bash
cat supabase/migrations/0009_tutores_economia_corrigido.sql | pbcopy
```

✅ **SQL copiado para clipboard!**

---

## 📋 PASSO 2: Abrir SQL Editor

Clique no link:

👉 **https://supabase.com/dashboard/project/ttswvavcisdnonytslom/sql/new**

Ou manualmente:
1. Abrir: https://supabase.com/dashboard
2. Projeto: **ICARUS-PRO** (ttswvavcisdnonytslom)
3. Menu lateral: **SQL Editor**
4. Botão: **+ New query**

---

## 📋 PASSO 3: Colar e Executar

1. **Colar** o SQL copiado (Cmd+V)
2. **Clicar em "Run"** (botão verde, ou Cmd+Enter)
3. **Aguardar** conclusão (~5-10 segundos)

Você verá:
```
Success. No rows returned
```

✅ **Migração aplicada com sucesso!**

---

## 📋 PASSO 4: Validar Tabelas Criadas

No mesmo SQL Editor, executar:

```sql
SELECT table_name, 
       pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN (
    'feature_flags', 
    'conhecimento_base', 
    'tutor_logs',
    'certificacoes_usuario',
    'legislacao_updates',
    'notificacoes_legislacao'
  )
ORDER BY table_name;
```

**Resultado esperado:**
```
┌───────────────────────────┬────────┐
│ table_name                │ size   │
├───────────────────────────┼────────┤
│ certificacoes_usuario     │ 16 kB  │
│ conhecimento_base         │ 24 kB  │
│ feature_flags             │ 16 kB  │
│ legislacao_updates        │ 16 kB  │
│ notificacoes_legislacao   │ 16 kB  │
│ tutor_logs                │ 16 kB  │
└───────────────────────────┴────────┘
```

---

## 📋 PASSO 5: Verificar Colunas Adicionadas

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documentos_regulatorios'
  AND column_name IN ('analise_ia_jsonb', 'status_conformidade')
ORDER BY column_name;
```

**Resultado esperado:**
```
┌───────────────────┬───────────┐
│ column_name       │ data_type │
├───────────────────┼───────────┤
│ analise_ia_jsonb  │ jsonb     │
│ status_conformidade│ text     │
└───────────────────┴───────────┘
```

---

## ✅ CONCLUSÃO

Após validação:

```
╔═══════════════════════════════════════════════════════════════╗
║  ✅ MIGRAÇÃO APLICADA COM SUCESSO!                          ║
╚═══════════════════════════════════════════════════════════════╝

6 tabelas criadas:
  ✓ feature_flags
  ✓ conhecimento_base
  ✓ tutor_logs
  ✓ certificacoes_usuario
  ✓ legislacao_updates
  ✓ notificacoes_legislacao

2 colunas adicionadas:
  ✓ documentos_regulatorios.analise_ia_jsonb
  ✓ documentos_regulatorios.status_conformidade

Extension habilitada:
  ✓ vector (para embeddings)
```

---

## 🚀 PRÓXIMOS PASSOS

Agora que o schema está pronto:

```bash
# 1. Testar feature flags
npm run dev

# 2. Popular base de conhecimento
npm run ai:tutor:reindex

# 3. Instalar Ollama (IA local)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b

# 4. Configurar Meilisearch
docker run -d -p 7700:7700 \
  -e MEILI_MASTER_KEY="dev_master_key" \
  getmeili/meilisearch:latest
```

---

## 🆘 TROUBLESHOOTING

### ❌ "already exists"
✅ **Normal!** A migração usa `IF NOT EXISTS`, é seguro.

### ❌ "permission denied"
👉 Verifique se está usando o **service_role**, não anon.

### ❌ "syntax error"
👉 Certifique-se de copiar o SQL **completo** (incluindo comentários).

---

**© 2025 ICARUS v5.0** 🚀

