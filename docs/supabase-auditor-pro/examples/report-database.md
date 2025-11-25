# 🔍 Auditoria Supabase - E-commerce Demo

**Data:** 23/11/2025 às 14:30:00
**Projeto ID:** `xyzabc123def456`

## 📊 Resumo Executivo

- **Total de problemas:** 47
- 🔴 **Críticos:** 5
- 🟠 **Altos:** 14
- 🟡 **Médios:** 18
- 🔵 **Baixos:** 8
- ⚪ **Informativos:** 2

### Distribuição de Severidade

```
🔴 Crítico  ██████████ 5
🟠 Alto     ████████████████████████████ 14
🟡 Médio    ████████████████████████████████████ 18
🔵 Baixo    ████████ 8
```

---

## 📋 Schema & Tabelas

**Total de problemas:** 12

### 🔴 CRÍTICO (2)

#### 1. Tabela sem PRIMARY KEY: orders

**Descrição:** A tabela public.orders não possui chave primária

**Impacto:** Performance degradada, impossível usar replicação, problemas com RLS

**Tabela:** `public.orders`

**Solução:**

Adicione uma PRIMARY KEY apropriada

**SQL:**

```sql
-- Opção 1: Adicionar coluna ID
ALTER TABLE public.orders ADD COLUMN id BIGSERIAL PRIMARY KEY;

-- Opção 2: Usar coluna existente
-- ALTER TABLE public.orders ADD PRIMARY KEY (coluna_existente);
```

**Detalhes:**
```json
{
  "total_rows": 125430,
  "table_size": "89 MB"
}
```

#### 2. Tabela sem PRIMARY KEY: cart_items

**Descrição:** A tabela public.cart_items não possui chave primária

**Impacto:** Performance degradada, impossível usar replicação, problemas com RLS

**Tabela:** `public.cart_items`

**Solução:**

Adicione uma PRIMARY KEY apropriada

**SQL:**

```sql
-- Opção 1: Adicionar coluna ID
ALTER TABLE public.cart_items ADD COLUMN id BIGSERIAL PRIMARY KEY;

-- Opção 2: Usar coluna existente
-- ALTER TABLE public.cart_items ADD PRIMARY KEY (coluna_existente);
```

**Detalhes:**
```json
{
  "total_rows": 45892,
  "table_size": "23 MB"
}
```

### 🟠 ALTO (4)

#### 1. Bloat detectado: products

**Descrição:** A tabela public.products tem 5.8x de bloat (127 MB desperdiçados)

**Impacto:** Desperdício de 127 MB de armazenamento e performance degradada

**Tabela:** `public.products`

**Solução:**

VACUUM FULL recomendado

**SQL:**

```sql
VACUUM FULL public.products; -- ATENÇÃO: Bloqueia a tabela
```

**Detalhes:**
```json
{
  "bloat_ratio": 5.8,
  "bloat_size": "127 MB",
  "total_size": "219 MB"
}
```

#### 2. Bloat detectado: user_sessions

**Descrição:** A tabela public.user_sessions tem 4.2x de bloat (89 MB desperdiçados)

**Impacto:** Desperdício de 89 MB de armazenamento e performance degradada

**Tabela:** `public.user_sessions`

**Solução:**

VACUUM FULL recomendado

**SQL:**

```sql
VACUUM FULL public.user_sessions; -- ATENÇÃO: Bloqueia a tabela
```

#### 3. Tabela órfã: temp_migrations

**Descrição:** A tabela public.temp_migrations não teve acesso há 245 dias

**Impacto:** Ocupando 2.3 MB de espaço sem utilidade

**Tabela:** `public.temp_migrations`

**Solução:**

Verifique se a tabela ainda é necessária. Se não, considere arquivar ou remover.

**SQL:**

```sql
-- Arquivar antes de remover:
-- CREATE TABLE archived.temp_migrations AS SELECT * FROM public.temp_migrations;
-- DROP TABLE public.temp_migrations;
```

#### 4. Tabela órfã: legacy_orders_2023

**Descrição:** A tabela public.legacy_orders_2023 não teve acesso há 198 dias

**Impacto:** Ocupando 456 MB de espaço sem utilidade

**Tabela:** `public.legacy_orders_2023`

**Solução:**

Verifique se a tabela ainda é necessária. Se não, considere arquivar ou remover.

### 🟡 MÉDIO (6)

#### 1. Possível uso inadequado de JSONB: products.metadata

**Descrição:** A coluna metadata usa JSONB em uma tabela com 48230 registros

**Impacto:** Performance de queries pode ser melhorada com normalização

**Tabela:** `public.products`

**Solução:**

Considere normalizar se as chaves são sempre as mesmas

#### 2. Bloat detectado: audit_logs

**Descrição:** A tabela public.audit_logs tem 2.1x de bloat (34 MB desperdiçados)

**Impacto:** Desperdício de 34 MB de armazenamento e performance degradada

**Tabela:** `public.audit_logs`

**Solução:**

VACUUM recomendado

**SQL:**

```sql
VACUUM ANALYZE public.audit_logs;
```

---

## 🔍 Índices

**Total de problemas:** 8

### 🔴 CRÍTICO (1)

#### 1. Índice inválido: idx_products_category_invalid

**Descrição:** O índice idx_products_category_invalid está marcado como INVALID

**Impacto:** Índice não está sendo utilizado, queries podem estar lentas

**Tabela:** `public.products`

**Solução:**

Reconstrua o índice

**SQL:**

```sql
REINDEX INDEX CONCURRENTLY public.idx_products_category_invalid;
```

### 🟡 MÉDIO (7)

#### 1. Índice não usado: idx_old_user_login

**Descrição:** O índice idx_old_user_login na tabela users nunca foi utilizado

**Impacto:** Desperdiçando 12 MB e tornando escritas mais lentas

**Tabela:** `public.users`

**Solução:**

Remova o índice se confirmar que não é necessário

**SQL:**

```sql
DROP INDEX public.idx_old_user_login;
```

#### 2. Índices duplicados: idx_products_name e idx_products_name_lower

**Descrição:** Os índices idx_products_name e idx_products_name_lower na tabela products são redundantes

**Impacto:** Desperdício de espaço e performance de escrita degradada

**Tabela:** `public.products`

**Solução:**

Considere remover um dos índices redundantes

---

## 🔒 RLS & Segurança

**Total de problemas:** 15

### 🔴 CRÍTICO (2)

#### 1. Tabela sem RLS: users

**Descrição:** A tabela public.users não possui Row Level Security habilitado

**Impacto:** Dados potencialmente expostos publicamente

**Tabela:** `public.users`

**Solução:**

Habilite RLS e crie policies apropriadas

**SQL:**

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**Detalhes:**
```json
{
  "total_rows": 12450,
  "has_user_id": true
}
```

#### 2. Policy permissiva: allow_all_access

**Descrição:** A policy allow_all_access na tabela orders é muito permissiva

**Impacto:** Policy permite acesso irrestrito a todos os dados

**Tabela:** `public.orders`

**Solução:**

Restrinja a policy para verificar permissões apropriadas

**Detalhes:**
```json
{
  "policy_type": "SELECT",
  "policy_definition": "true"
}
```

### 🟠 ALTO (8)

#### 1. Tabela sem RLS: products

**Descrição:** A tabela public.products não possui Row Level Security habilitado

**Impacto:** Dados potencialmente expostos publicamente

**Tabela:** `public.products`

**Solução:**

Habilite RLS e crie policies apropriadas

**SQL:**

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

#### 2. Grant excessivo para PUBLIC

**Descrição:** PUBLIC tem privilégio SELECT na tabela orders

**Impacto:** Role PUBLIC possui privilégios - qualquer um pode acessar

**Tabela:** `public.orders`

**Solução:**

Revogue privilégios desnecessários

**SQL:**

```sql
REVOKE SELECT ON public.orders FROM PUBLIC;
```

#### 3. Grant excessivo para PUBLIC

**Descrição:** PUBLIC tem privilégio INSERT na tabela reviews

**Impacto:** Role PUBLIC possui privilégios - qualquer um pode acessar

**Tabela:** `public.reviews`

**Solução:**

Revogue privilégios desnecessários

**SQL:**

```sql
REVOKE INSERT ON public.reviews FROM PUBLIC;
```

---

## 💾 Storage & Buckets

**Total de problemas:** 4

### 🟡 MÉDIO (3)

#### 1. Bucket público: product-images

**Descrição:** O bucket product-images é público e contém 8234 arquivos

**Impacto:** 2.4 GB de dados potencialmente expostos

**Solução:**

Revise se o bucket realmente precisa ser público

**Detalhes:**
```json
{
  "bucket_name": "product-images",
  "total_objects": 8234,
  "total_size": "2.4 GB"
}
```

#### 2. Bucket público: user-avatars

**Descrição:** O bucket user-avatars é público e contém 12450 arquivos

**Impacto:** 890 MB de dados potencialmente expostos

**Solução:**

Revise se o bucket realmente precisa ser público

### 🔵 BAIXO (1)

#### 1. Arquivos duplicados no bucket product-images

**Descrição:** 156 arquivos duplicados encontrados

**Impacto:** Desperdiçando 234 MB

**Solução:**

Manter apenas 1 arquivo e atualizar referências

---

## ⚡ Performance & Saúde

**Total de problemas:** 6

### 🔴 CRÍTICO (1)

#### 1. Query lenta detectada

**Descrição:** Query com tempo médio de 8234ms

**Impacto:** 12340 chamadas totalizando 101649160ms

**Solução:**

Otimizar query urgentemente - considere índices ou reescrita

**Detalhes:**
```json
{
  "query": "SELECT * FROM products p JOIN reviews r ON p.id = r.product_id WHERE p.category = $1 ORDER BY r.created_at DESC",
  "mean_time": 8234,
  "calls": 12340
}
```

### 🟠 ALTO (3)

#### 1. Dead tuples em audit_logs

**Descrição:** 234560 dead tuples (45.2% da tabela)

**Impacto:** Performance degradada, necessário VACUUM

**Tabela:** `public.audit_logs`

**Solução:**

VACUUM ANALYZE public.audit_logs;

**SQL:**

```sql
VACUUM ANALYZE public.audit_logs;
```

**Detalhes:**
```json
{
  "dead_tuples": 234560,
  "dead_ratio": 45.2,
  "last_vacuum": "2025-10-15T03:00:00Z"
}
```

#### 2. Dead tuples em user_sessions

**Descrição:** 89234 dead tuples (32.8% da tabela)

**Impacto:** Performance degradada, necessário VACUUM

**Tabela:** `public.user_sessions`

**Solução:**

VACUUM ANALYZE public.user_sessions;

---

## ⚙️ Funções & Triggers

**Total de problemas:** 7

### 🟠 ALTO (2)

#### 1. Função SECURITY DEFINER: admin_delete_user

**Descrição:** Função executa com privilégios do criador - risco de escalação de privilégio

**Impacto:** Risco de escalação de privilégio

**Solução:**

Revisar código cuidadosamente. Considere usar SECURITY INVOKER se possível.

**Detalhes:**
```json
{
  "function_owner": "postgres",
  "language": "plpgsql"
}
```

#### 2. Trigger em tabela de alto volume: update_product_timestamp

**Descrição:** Trigger update_product_timestamp na tabela products com 45890 escritas

**Impacto:** Pode estar degradando performance de escrita

**Tabela:** `public.products`

**Solução:**

Trigger em tabela de alto volume - verifique se é realmente necessário ou considere async

### 🟡 MÉDIO (3)

#### 1. Função com risco de SQL injection: dynamic_search

**Descrição:** SQL dinâmico sem sanitização - risco de SQL injection

**Impacto:** Risco de SQL injection

**Solução:**

Revisar sanitização

### 🔵 BAIXO (2)

#### 1. Função não usada: legacy_calculate_shipping

**Descrição:** A função public.legacy_calculate_shipping nunca foi chamada

**Impacto:** Código morto no banco

**Solução:**

DROP FUNCTION public.legacy_calculate_shipping();

---

## 📝 Notas Finais

- Este relatório foi gerado automaticamente pelo **Supabase Auditor Pro**
- Revise cuidadosamente cada problema antes de executar correções
- Faça backup antes de executar alterações no modo `fix`
- Para dúvidas, consulte a documentação ou a comunidade Supabase

*Gerado em 23/11/2025 às 14:30:00*

