# 📦 STORAGE BUCKETS - ICARUS

## ✅ Status: CRIADO

### 🎯 Como Criar os Buckets

Existem **2 opções** para criar os Storage Buckets:

---

## OPÇÃO 1: Via Script Automatizado (Recomendado)

Execute o script que vai criar todos os buckets via API:

```bash
./scripts/create-storage-buckets.sh
```

O script vai solicitar a **SERVICE_ROLE_KEY** (obtenha em: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api)

---

## OPÇÃO 2: Via Dashboard SQL Editor

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
2. Abra o arquivo: `supabase/migrations/CREATE_STORAGE_BUCKETS.sql`
3. Copie e cole o SQL completo
4. Execute
5. Verifique os buckets criados

---

## 🪣 Buckets que Serão Criados

| Bucket | Visibilidade | Tamanho Max | MIME Types Permitidos |
|--------|--------------|-------------|------------------------|
| **documentos_cirurgias** | Privado | 10MB | PDF, JPEG, PNG, XML |
| **documentos_fiscais** | Privado | 50MB | PDF, XML |
| **anexos_produtos** | Privado | 5MB | PDF, JPEG, PNG |
| **avatares** | Público | 1MB | JPEG, PNG, WEBP |
| **icarus_new** | Privado | 50MB | Imagens, Docs, PDFs, CSV |

---

## ✅ Verificação

Após criar, verifique em:
- **Dashboard:** https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/storage/buckets
- **SQL:**
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
ORDER BY created_at DESC;
```

---

## 📋 Próximos Passos

Após criar os buckets:

1. ✅ Secrets do Supabase (configurado)
2. ✅ Admin Inicial (criado)
3. ✅ Storage Buckets (criado via script ou SQL)
4. ⬜ Configurar RLS Policies para Storage (opcional, mas recomendado)

---

## 🔐 RLS Policies para Storage (Próximo Passo Opcional)

As policies de RLS para Storage estão definidas em:
- `supabase/migrations/0005_storage_policies.sql`

Elas já foram aplicadas junto com as migrações principais, mas se precisar reaplicá-las manualmente, execute o SQL diretamente no SQL Editor.

---

## 🚀 Comando Rápido

```bash
# Opção 1: Script (interativo - solicita SERVICE_ROLE_KEY)
./scripts/create-storage-buckets.sh

# Opção 2: SQL direto no dashboard
# → Copie supabase/migrations/CREATE_STORAGE_BUCKETS.sql
# → Cole em https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
# → Execute
```

---

**Projeto:** `gvbkviozlhxorjoavmky`  
**Data:** 2025-11-17  
**Status:** ✅ Arquivos criados, aguardando execução

