# 📋 Como Aplicar a Migration das 4 Tabelas Críticas

**Arquivo:** `supabase/migrations/20251025_create_missing_critical_tables.sql`  
**Status:** ✅ Criado e pronto para aplicar  
**Data:** 2025-10-25

---

## 🎯 Situação Atual

A migration foi criada com sucesso mas encontramos uma situação onde:
- ✅ O banco já tem **estrutura parcial** (muitas tabelas já existem)
- ⚠️ Nenhuma migration está marcada como aplicada no sistema de controle
- 🔴 Há conflito entre o estado real do banco e o tracking de migrations

---

## 🛠️ Métodos para Aplicar

### Método 1: Via Supabase Studio (MAIS SEGURO) ⭐

**Recomendado para bancos com dados existentes**

1. Acesse o Supabase Studio: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Copie o conteúdo de `supabase/migrations/20251025_create_missing_critical_tables.sql`
5. Cole no editor
6. Clique em **Run**

**Vantagens:**
- ✅ Controle visual
- ✅ Ver erros imediatamente
- ✅ Não afeta o tracking de migrations
- ✅ Pode executar linha por linha se necessário

---

### Método 2: Via psql Direto

**Requer DATABASE_URL configurado**

```bash
# 1. Configure a DATABASE_URL
export DATABASE_URL='postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres'

# 2. Aplique a migration
psql $DATABASE_URL -f supabase/migrations/20251025_create_missing_critical_tables.sql

# 3. Verifique se as tabelas foram criadas
psql $DATABASE_URL -c "\dt public.consignacao_materiais"
psql $DATABASE_URL -c "\dt public.produtos_opme"
psql $DATABASE_URL -c "\dt public.rastreabilidade_opme"
psql $DATABASE_URL -c "\dt public.compliance_requisitos_abbott"
```

**Vantagens:**
- ✅ Rápido e direto
- ✅ Ideal para automação
- ✅ Bom para ambientes de desenvolvimento

**Desvantagens:**
- ⚠️ Requer credenciais do banco
- ⚠️ Não atualiza o tracking de migrations do Supabase

---

### Método 3: Via Script Interativo

**Usa o script que criamos**

```bash
# 1. Tornar executável
chmod +x apply-critical-tables.sh

# 2. Executar
./apply-critical-tables.sh
```

O script irá:
- Verificar se o arquivo existe
- Mostrar estatísticas
- Tentar aplicar via psql se DATABASE_URL estiver configurado
- Guiar você através do processo

---

### Método 4: Via Supabase Push (Com Cuidado)

**Aplica TODAS as migrations pendentes**

```bash
supabase db push
```

⚠️ **ATENÇÃO:** Este método aplicará **todas as 76 migrations pendentes**, não apenas a nossa!

**Use este método SOMENTE se:**
- Você está em ambiente de desenvolvimento
- O banco está vazio
- Você quer aplicar todo o schema do zero

---

## 🔍 Verificar Se Já Foi Aplicado

Antes de aplicar, verifique se as tabelas já existem:

```sql
-- Via SQL Editor ou psql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
);
```

Se retornar as 4 tabelas, **a migration já foi aplicada**.

---

## ✅ Validação Pós-Aplicação

Após aplicar a migration, execute estas validações:

### 1. Verificar Tabelas Criadas

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = t.table_name) as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
);
```

**Resultado esperado:**
- consignacao_materiais: 32 colunas
- produtos_opme: 48 colunas
- rastreabilidade_opme: 46 colunas
- compliance_requisitos_abbott: 42 colunas

### 2. Verificar Foreign Keys

```sql
SELECT 
  tc.table_name, 
  COUNT(*) as num_fks
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
GROUP BY tc.table_name;
```

**Resultado esperado:**
- consignacao_materiais: 7 FKs
- produtos_opme: 3 FKs
- rastreabilidade_opme: 10 FKs
- compliance_requisitos_abbott: 3 FKs

### 3. Verificar Índices

```sql
SELECT 
  tablename,
  COUNT(*) as num_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
)
GROUP BY tablename;
```

**Resultado esperado:**
- consignacao_materiais: 7 índices (PK + 6 índices adicionais)
- produtos_opme: 7 índices (PK + 6 índices adicionais)
- rastreabilidade_opme: 9 índices (PK + 8 índices adicionais)
- compliance_requisitos_abbott: 8 índices (PK + 7 índices adicionais)

### 4. Testar Inserção

```sql
-- Teste básico (ajustar empresa_id conforme necessário)
BEGIN;

-- Inserir produto OPME de teste
INSERT INTO produtos_opme (
  empresa_id,
  codigo_interno,
  nome,
  categoria,
  ativo
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Ajustar para empresa_id real
  'TESTE001',
  'Produto Teste OPME',
  'ORTESE',
  true
);

-- Se sucesso, rollback (não queremos dados de teste)
ROLLBACK;

-- Deve retornar sucesso (mesmo com rollback)
```

---

## 🚨 Problemas Comuns

### Erro: "relation already exists"

**Causa:** A tabela já foi criada anteriormente  
**Solução:** A migration usa `CREATE TABLE IF NOT EXISTS`, então é seguro. O erro pode ser ignorado.

### Erro: "foreign key constraint ... does not exist"

**Causa:** Tabela referenciada não existe  
**Solução:** Aplicar migrations anteriores primeiro ou criar a tabela referenciada

### Erro: "permission denied"

**Causa:** Usuário sem permissões adequadas  
**Solução:** Usar credenciais de admin/postgres ou ajustar permissões

---

## 📊 Status da Aplicação

Use esta checklist para tracking:

- [ ] Migration criada (✅ FEITO)
- [ ] Migration revisada
- [ ] Backup do banco feito (se produção)
- [ ] Migration aplicada
- [ ] Validações executadas
- [ ] Tabelas confirmadas (4/4)
- [ ] Foreign Keys confirmadas (23/23)
- [ ] Índices confirmados (27/27)
- [ ] Teste de inserção passou
- [ ] Documentação atualizada

---

## 💡 Recomendação Final

Para este caso específico onde o banco já tem estrutura parcial:

**RECOMENDO: Método 1 (Supabase Studio)**

1. Faça backup do banco atual
2. Abra Supabase Studio
3. Cole o SQL no editor
4. Execute e observe os resultados
5. Ignore avisos de "already exists"
6. Valide que as 4 novas tabelas foram criadas
7. Execute as queries de validação

---

**Criado por:** Agente 03 - Próximos Passos  
**Data:** 2025-10-25  
**Arquivo Migration:** `supabase/migrations/20251025_create_missing_critical_tables.sql`

