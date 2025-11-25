# 📦 GUIA: Storage Bucket `icarus_new`

## 🎯 OBJETIVO

Configurar bucket de storage para armazenar:
- 📸 Imagens de produtos
- 📄 Documentos de cirurgias
- 👤 Avatares de usuários
- 📋 NF-e (XML e PDF)
- 📝 Contratos e documentos gerais

---

## 🚀 CONFIGURAÇÃO (5 minutos)

### **Passo 1: Criar Bucket**

1. Acesse: https://supabase.com/dashboard/project/ttswvavcisdnonytslom/storage/buckets

2. Clique em **"New bucket"**

3. Preencha:
   - **Name:** `icarus_new`
   - **Public:** ❌ Desmarcar (bucket privado)
   - **File size limit:** `50 MB`
   - **Allowed MIME types:** (opcional - deixar vazio para aceitar todos)

4. Clique em **"Create bucket"**

---

### **Passo 2: Configurar Policies RLS**

1. Clique no bucket **`icarus_new`**

2. Vá na aba **"Policies"**

3. Clique em **"New policy"** → **"Create a policy from scratch"**

---

#### **Policy 1: SELECT (visualizar arquivos)**

```
Nome: icarus_new_select_own_empresa
Operação: SELECT ✅
Target roles: authenticated

Policy definition:
```

```sql
(storage.foldername(name))[1]::uuid = (
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid
)
```

Clique em **"Create policy"**

---

#### **Policy 2: INSERT (fazer upload)**

```
Nome: icarus_new_insert_own_empresa
Operação: INSERT ✅
Target roles: authenticated

Policy definition:
```

```sql
(storage.foldername(name))[1]::uuid = (
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid
)
```

Clique em **"Create policy"**

---

#### **Policy 3: UPDATE (atualizar metadados)**

```
Nome: icarus_new_update_own_empresa
Operação: UPDATE ✅
Target roles: authenticated

Using expression:
```

```sql
(storage.foldername(name))[1]::uuid = (
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid
)
```

```
With check expression:
```

```sql
(storage.foldername(name))[1]::uuid = (
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid
)
```

Clique em **"Create policy"**

---

#### **Policy 4: DELETE (excluir - apenas admin)**

```
Nome: icarus_new_delete_admin_only
Operação: DELETE ✅
Target roles: authenticated

Policy definition:
```

```sql
(storage.foldername(name))[1]::uuid = (
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid
) AND (
  COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'perfil',
    'operador'
  ) IN ('admin', 'comercial')
)
```

Clique em **"Create policy"**

---

## 📁 ESTRUTURA DE PASTAS

Use este padrão para organizar arquivos:

```
icarus_new/
├── {empresa_id}/
│   ├── cirurgias/
│   │   └── {cirurgia_id}/
│   │       ├── romaneio.pdf
│   │       ├── termo_consentimento.pdf
│   │       └── foto_01.jpg
│   ├── produtos/
│   │   └── {produto_id}/
│   │       ├── imagem_principal.jpg
│   │       ├── imagem_02.jpg
│   │       └── manual.pdf
│   ├── usuarios/
│   │   └── {usuario_id}/
│   │       └── avatar.png
│   ├── nfe/
│   │   ├── {numero_nfe}.xml
│   │   └── {numero_nfe}.pdf
│   └── documentos/
│       ├── contrato_fornecedor.pdf
│       └── licenca_anvisa.pdf
```

**Exemplo de path completo:**
```
abc123-empresa-uuid/cirurgias/def456-cirurgia-uuid/romaneio.pdf
```

---

## 💻 USO NO FRONTEND

### **Upload de arquivo**

```typescript
import { supabase } from '@/lib/supabase';

async function uploadFile(file: File, empresaId: string, categoria: string) {
  const fileName = `${empresaId}/${categoria}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('icarus_new')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Erro no upload:', error);
    return null;
  }
  
  return data.path;
}

// Uso
const empresaId = 'abc123-uuid';
const path = await uploadFile(selectedFile, empresaId, 'produtos/def456-produto-uuid');
```

---

### **Download de arquivo**

```typescript
async function getFileUrl(path: string) {
  const { data } = supabase.storage
    .from('icarus_new')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Ou download direto
async function downloadFile(path: string) {
  const { data, error } = await supabase.storage
    .from('icarus_new')
    .download(path);
  
  if (error) {
    console.error('Erro no download:', error);
    return null;
  }
  
  return data; // Blob
}
```

---

### **Listar arquivos**

```typescript
async function listFiles(empresaId: string, categoria: string) {
  const { data, error } = await supabase.storage
    .from('icarus_new')
    .list(`${empresaId}/${categoria}`, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });
  
  if (error) {
    console.error('Erro ao listar:', error);
    return [];
  }
  
  return data;
}
```

---

### **Excluir arquivo**

```typescript
async function deleteFile(path: string) {
  const { data, error } = await supabase.storage
    .from('icarus_new')
    .remove([path]);
  
  if (error) {
    console.error('Erro ao excluir:', error);
    return false;
  }
  
  return true;
}
```

---

## 🔒 SEGURANÇA

### **✅ O que as policies fazem:**

1. **Multi-tenancy:** Cada empresa só acessa seus próprios arquivos
2. **Isolamento:** Path deve começar com `{empresa_id}/`
3. **RLS:** Valida JWT do usuário autenticado
4. **Perfil:** DELETE restrito a admin e comercial

### **❌ O que NÃO fazer:**

- ❌ Não usar paths sem `empresa_id` no início
- ❌ Não tentar acessar arquivos de outra empresa
- ❌ Não fazer upload de arquivos > 50MB
- ❌ Não deixar bucket público

---

## 🧪 TESTAR

### **Via Frontend:**

```bash
npm run dev
# Testar upload de imagem em Produtos ou Avatar
```

### **Via SQL Editor:**

```sql
-- Verificar bucket criado
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'icarus_new';

-- Verificar policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'icarus_new_%';

-- Listar arquivos (se houver)
SELECT name, created_at, metadata 
FROM storage.objects 
WHERE bucket_id = 'icarus_new' 
LIMIT 10;
```

---

## 📊 MONITORAMENTO

### **Ver estatísticas:**

Dashboard → Storage → icarus_new → **"Usage"**

- Total de arquivos
- Espaço usado
- Uploads recentes

---

## 🔧 TROUBLESHOOTING

### **Erro: "new row violates row-level security policy"**

✅ **Causa:** Path não começa com `empresa_id` do usuário logado

✅ **Solução:** Sempre usar `{empresa_id}/categoria/arquivo`

---

### **Erro: "File size exceeds the maximum allowed"**

✅ **Causa:** Arquivo > 50MB

✅ **Solução:** 
- Reduzir tamanho do arquivo
- Ou aumentar limite no bucket settings

---

### **Erro: "The resource already exists"**

✅ **Causa:** Arquivo com mesmo nome já existe

✅ **Solução:** Usar `upsert: true` ou adicionar timestamp no nome

---

## ✅ CHECKLIST

Após configurar, verificar:

- [ ] Bucket `icarus_new` criado
- [ ] Bucket está **privado** (não público)
- [ ] 4 policies RLS criadas
- [ ] Policy SELECT funcionando
- [ ] Policy INSERT funcionando
- [ ] Policy DELETE restrito a admin
- [ ] Upload de teste bem-sucedido
- [ ] Download de teste bem-sucedido

---

## 🎯 RESUMO

| Item | Config |
|------|--------|
| **Nome** | icarus_new |
| **Tipo** | Privado |
| **Limite** | 50MB/arquivo |
| **Policies** | 4 (SELECT, INSERT, UPDATE, DELETE) |
| **Multi-tenant** | ✅ Sim (por empresa_id) |
| **RLS** | ✅ Ativo |

---

## 📞 SUPORTE

**Dashboard Storage:** https://supabase.com/dashboard/project/ttswvavcisdnonytslom/storage/buckets

**E-mail:** suporte@icarusai.com.br

---

**Data:** 2025-10-18  
**Versão:** 1.0  
**Migration:** `0008_storage_icarus_new.sql`

