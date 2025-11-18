# 🚀 Aplicar Migrações - Passo a Passo

## ⚡ Comandos Prontos

Execute estes comandos sequencialmente. Cada um copia um bloco para seu clipboard:

### 📦 Bloco 1 - Schema Base
```bash
cat supabase/migrations_blocks/block_01.sql | pbcopy && echo "✅ Bloco 1 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 2 - Cadastros
```bash
cat supabase/migrations_blocks/block_02.sql | pbcopy && echo "✅ Bloco 2 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 3 - Compras
```bash
cat supabase/migrations_blocks/block_03.sql | pbcopy && echo "✅ Bloco 3 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 4 - Vendas + CRM
```bash
cat supabase/migrations_blocks/block_04.sql | pbcopy && echo "✅ Bloco 4 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 5 - Financeiro
```bash
cat supabase/migrations_blocks/block_05.sql | pbcopy && echo "✅ Bloco 5 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 6 - Consignação
```bash
cat supabase/migrations_blocks/block_06.sql | pbcopy && echo "✅ Bloco 6 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 7 - Compliance
```bash
cat supabase/migrations_blocks/block_07.sql | pbcopy && echo "✅ Bloco 7 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 8 - Licitações
```bash
cat supabase/migrations_blocks/block_08.sql | pbcopy && echo "✅ Bloco 8 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 9 - Inteligência
```bash
cat supabase/migrations_blocks/block_09.sql | pbcopy && echo "✅ Bloco 9 copiado! Cole no Dashboard Supabase SQL Editor"
```

### 📦 Bloco 10 - Analytics
```bash
cat supabase/migrations_blocks/block_10.sql | pbcopy && echo "✅ Bloco 10 copiado! Cole no Dashboard Supabase SQL Editor"
```

---

## 🔗 Dashboard Supabase

Após copiar cada bloco, cole aqui:

**https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql**

---

## ⏱️ Tempo Estimado

- Cada bloco: ~1-2 minutos
- Total: ~15-20 minutos
- **Aguarde cada bloco completar antes do próximo!**

---

## ✅ Validação Final

Após aplicar todos os blocos, execute no SQL Editor:

```sql
-- Contar tabelas criadas
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Esperado: ~100

-- Listar todas as tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

---

**Criado em**: 18/11/2025  
**Status**: Pronto para uso
