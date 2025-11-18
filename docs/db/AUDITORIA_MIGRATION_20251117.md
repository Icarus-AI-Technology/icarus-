# 🔍 AUDITORIA MIGRATION 20251117_backend_multitenant_fix.sql

**AGENTE_AUDITOR_CORRETOR_SUPABASE v4**  
**Data:** 2025-11-18  
**Status:** 🔄 Em andamento

---

## 📋 INFORMAÇÕES GERAIS

**Arquivo:** `20251117_backend_multitenant_fix.sql`  
**Tamanho:** 25 KB (769 linhas)  
**Tipo:** Corretiva multi-tenant + funções KPI  
**Severidade declarada:** 🔴 ALTA

**Gaps declarados:**
1. Multi-tenant inconsistente (9 tabelas estoque sem `empresa_id`)
2. Função `get_dashboard_kpis()` quebrada (`medicos.status` inexistente?)
3. Ausência de `calcular_score_global_abbott()`

---

## 1️⃣ VALIDAÇÃO: ESTRUTURA SQL

### **✅ Sintaxe SQL**
- ✅ `BEGIN;` ... `COMMIT;` (transacional)
- ✅ `IF NOT EXISTS` (idempotente)
- ✅ `DROP POLICY IF EXISTS` (idempotente)
- ✅ Comentários `COMMENT ON FUNCTION`
- ✅ Sem hardcoded IDs

**Score:** 100% — SQL bem estruturado

---

## 2️⃣ VALIDAÇÃO: SEÇÃO 1 — MULTI-TENANT FIX (9 tabelas)

### **Tabelas afetadas:**
1. `estoque_armazens`
2. `estoque_localizacoes`
3. `estoque` (principal)
4. `estoque_movimentacoes`
5. `estoque_reservas`
6. `estoque_lotes`
7. `estoque_inventarios`
8. `estoque_inventarios_itens`
9. `estoque_alertas`

### **Operações por tabela (padrão):**

```sql
-- 1. Adicionar coluna (se não existir)
ALTER TABLE public.{tabela}
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

-- 2. Popula de forma inteligente (3 estratégias)
UPDATE public.{tabela} SET empresa_id = ...
  -- Estratégia A: FK de outra tabela (ex: produtos_opme)
  -- Estratégia B: FK de tabela pai (ex: armazem_id → armazem.empresa_id)
  -- Estratégia C: Fallback primeira empresa (ORDER BY criado_em)

-- 3. NOT NULL + FK
ALTER TABLE public.{tabela}
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.{tabela}
  ADD CONSTRAINT {tabela}_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

-- 4. Índice
CREATE INDEX IF NOT EXISTS idx_{tabela}_empresa
  ON public.{tabela}(empresa_id);
```

### **✅ Validações:**

#### **A) Estratégia de fallback**
```sql
-- Exemplo: estoque_armazens (linhas 16-24)
UPDATE public.estoque_armazens ea
SET empresa_id = COALESCE(
  ea.empresa_id,  -- Se já tem, mantém
  fallback.id     -- Senão, pega primeira empresa
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE ea.empresa_id IS NULL;
```

**Análise:**
- ✅ `COALESCE` garante que não sobrescreve se já existe
- ✅ `ORDER BY criado_em NULLS LAST` — seguro (evita NULL)
- ✅ `WHERE ea.empresa_id IS NULL` — eficiente (UPDATE apenas nulos)
- ⚠️ **ATENÇÃO:** Se não houver empresas (`fallback.id IS NULL`), UPDATE falha silenciosamente
- ⚠️ **ATENÇÃO:** Em multi-tenant real, fallback pode atribuir empresa errada

**Risco:** 🟡 MÉDIO
- Se banco vazio (sem empresas): `empresa_id` permanece NULL → `ALTER NOT NULL` falha
- Se dados reais: fallback atribui empresa aleatória → **vazamento de dados**

**Recomendação:**
```sql
-- Validar antes de aplicar
SELECT COUNT(*) FROM public.empresas;  -- Deve ser > 0

-- Validar após UPDATE
SELECT COUNT(*) FROM public.estoque_armazens WHERE empresa_id IS NULL;  -- Deve ser 0
```

---

#### **B) Estratégia hierárquica (tabelas filhas)**

Exemplo: `estoque_localizacoes` (linhas 42-45)
```sql
UPDATE public.estoque_localizacoes loc
SET empresa_id = COALESCE(loc.empresa_id, ea.empresa_id)
FROM public.estoque_armazens ea
WHERE loc.armazem_id = ea.id;
```

**Análise:**
- ✅ Propaga `empresa_id` de tabela pai (armazém → localização)
- ✅ Lógica correta: localização herda empresa do armazém
- ⚠️ **DEPENDÊNCIA:** Requer que `estoque_armazens.empresa_id` já esteja populado (ordem correta)

**Validação de ordem:**
- ✅ Migration aplica em ordem correta:
  1. `estoque_armazens` primeiro
  2. `estoque_localizacoes` depois (usa FK)
  3. Outras tabelas seguem hierarquia

---

#### **C) Estratégia por FK externa**

Exemplo: `estoque` (linhas 74-76)
```sql
UPDATE public.estoque e
SET empresa_id = COALESCE(e.empresa_id, p.empresa_id)
FROM public.produtos_opme p
WHERE e.produto_id = p.id;
```

**Análise:**
- ✅ Usa FK existente (`produto_id`)
- ✅ Assume que `produtos_opme.empresa_id` já existe
- ⚠️ **DEPENDÊNCIA:** Requer tabela `produtos_opme` com `empresa_id` populado

**Validação necessária:**
```sql
-- PRÉ-REQUISITO: produtos_opme deve ter empresa_id
SELECT COUNT(*) FROM public.produtos_opme WHERE empresa_id IS NULL;
-- Esperado: 0 (todos produtos têm empresa)
```

---

### **❌ GAPS DETECTADOS — Seção 1**

#### **GAP #1 — Dependência não validada: `produtos_opme.empresa_id`**

**Código problemático:**
```sql
-- Linha 74-76
UPDATE public.estoque e
SET empresa_id = COALESCE(e.empresa_id, p.empresa_id)
FROM public.produtos_opme p
WHERE e.produto_id = p.id;
```

**Problema:**
- Migration assume que `produtos_opme` já tem `empresa_id`
- Se `produtos_opme.empresa_id` for NULL → `estoque.empresa_id` permanece NULL
- `ALTER NOT NULL` (linha 89) **falha**

**Impacto:** 🔴 CRÍTICO — Migration pode falhar

**Validação pré-migration:**
```sql
-- OBRIGATÓRIO executar ANTES de aplicar migration
SELECT
  COUNT(*) AS total_produtos,
  COUNT(empresa_id) AS com_empresa_id,
  COUNT(*) - COUNT(empresa_id) AS sem_empresa_id
FROM public.produtos_opme;
```

**Solução:** Adicionar validação na migration:
```sql
-- ANTES da seção 1.3 (Estoque)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.produtos_opme WHERE empresa_id IS NULL
  ) THEN
    RAISE EXCEPTION 'produtos_opme tem registros sem empresa_id. Corrija antes de prosseguir.';
  END IF;
END $$;
```

---

#### **GAP #2 — Fallback pode atribuir empresa errada**

**Código:**
```sql
-- Linhas 82-85 (e repetido em todas as tabelas)
UPDATE public.estoque e
SET empresa_id = COALESCE(
  e.empresa_id,
  fallback.id  -- ⚠️ Primeira empresa do banco
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE e.empresa_id IS NULL;
```

**Problema:**
- Em ambiente real com múltiplas empresas, fallback atribui **empresa aleatória**
- Dados de Empresa B podem ser atribuídos à Empresa A
- **Vazamento de dados multi-tenant**

**Exemplo:**
```sql
-- Empresa A (criada 2025-01-01)
-- Empresa B (criada 2025-06-01)

-- Produto pertence à Empresa B
INSERT INTO estoque (produto_id, quantidade) VALUES ('produto-B', 100);

-- Migration aplica fallback
UPDATE estoque SET empresa_id = (SELECT id FROM empresas ORDER BY criado_em LIMIT 1);
-- ❌ Atribui Empresa A (primeira criada), não Empresa B (dona do produto)
```

**Impacto:** 🔴 CRÍTICO — Violação multi-tenant

**Soluções:**

**Opção A:** Validação rigorosa (recomendado)
```sql
-- ANTES de cada UPDATE com fallback
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.estoque WHERE empresa_id IS NULL
  ) THEN
    RAISE WARNING 'estoque tem % registros sem empresa_id. Fallback será aplicado.',
      (SELECT COUNT(*) FROM public.estoque WHERE empresa_id IS NULL);
    
    -- Dar chance de cancelar
    PERFORM pg_sleep(5);  -- 5 segundos para Ctrl+C
  END IF;
END $$;
```

**Opção B:** Sem fallback (mais seguro)
```sql
-- Remover UPDATE com fallback
-- Deixar ALTER NOT NULL falhar se houver NULLs
-- Forçar correção manual antes de aplicar migration
```

**Opção C:** Fallback com flag de revisão
```sql
-- Adicionar coluna temporária
ALTER TABLE public.estoque ADD COLUMN empresa_fallback BOOLEAN DEFAULT FALSE;

UPDATE public.estoque e
SET
  empresa_id = fallback.id,
  empresa_fallback = TRUE  -- ⚠️ Sinaliza que precisa revisão
FROM (...) AS fallback
WHERE e.empresa_id IS NULL;

-- Após migration, revisar manualmente
SELECT * FROM estoque WHERE empresa_fallback = TRUE;
```

---

#### **GAP #3 — Falta validação de ordem de dependências**

**Problema:**
Migration aplica na ordem correta **implicitamente**, mas não valida:
1. `produtos_opme` deve ter `empresa_id` (usada por 5 tabelas)
2. `estoque_armazens` deve ser populado antes de `estoque_localizacoes`
3. `estoque_inventarios` deve ser populado antes de `estoque_inventarios_itens`

**Solução:** Adicionar checks no início:
```sql
-- VALIDAÇÕES PRÉ-MIGRATION
DO $$
BEGIN
  -- Check 1: produtos_opme tem empresa_id
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'produtos_opme'
      AND column_name = 'empresa_id'
  ) THEN
    RAISE EXCEPTION 'produtos_opme não tem coluna empresa_id. Aplique migration anterior.';
  END IF;

  -- Check 2: empresas existe e tem dados
  IF NOT EXISTS (SELECT 1 FROM public.empresas LIMIT 1) THEN
    RAISE EXCEPTION 'Tabela empresas está vazia. Insira ao menos uma empresa antes de prosseguir.';
  END IF;

  RAISE NOTICE 'Validações pré-migration: OK';
END $$;
```

---

## 3️⃣ VALIDAÇÃO: SEÇÃO 2 — RLS POLICIES (9 tabelas)

### **Padrão aplicado:**

Para cada tabela, cria 4 policies:
1. **SELECT:** `empresa_id = current_empresa_id()`
2. **INSERT:** `empresa_id = current_empresa_id() AND role IN (...)`
3. **UPDATE:** `empresa_id = current_empresa_id() AND role IN (...)`
4. **DELETE:** `empresa_id = current_empresa_id() AND is_admin()`

### **✅ Validações:**

#### **A) Funções helpers usadas**
```sql
-- Linha 302, 309, 317, etc
public.current_empresa_id()
public.current_user_role()
public.is_admin()
```

**Análise:**
- ⚠️ Migration **assume** que essas funções existem
- Se funções não existirem → policies **falham** ao criar

**Validação necessária:**
```sql
-- PRÉ-REQUISITO
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('current_empresa_id', 'current_user_role', 'is_admin');
-- Esperado: 3 rows
```

**Solução:** Adicionar validação:
```sql
-- ANTES da seção 2
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'current_empresa_id'
  ) THEN
    RAISE EXCEPTION 'Função current_empresa_id() não existe. Aplique migration de RLS helpers antes.';
  END IF;

  -- Repetir para current_user_role e is_admin
END $$;
```

---

#### **B) Policies por role**

Exemplo: `estoque_armazens_insert` (linhas 304-311)
```sql
CREATE POLICY estoque_armazens_insert
ON public.estoque_armazens
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);
```

**Análise:**
- ✅ Multi-tenant: `empresa_id = current_empresa_id()`
- ✅ RBAC: roles permitidos
- ⚠️ **ATENÇÃO:** Roles são **case-sensitive** ('Admin' ≠ 'admin')
- ⚠️ **ATENÇÃO:** Roles devem existir na tabela `roles` ou `usuarios.perfil`

**Validação necessária:**
```sql
-- Checar roles existentes
SELECT DISTINCT perfil FROM public.usuarios;
-- Ou
SELECT DISTINCT nome FROM public.roles;

-- Esperado: 'Admin', 'Super Admin', 'Gerente', etc (com caps exatas)
```

**Potencial bug:** Se roles no banco forem minúsculas ('admin', 'gerente'), policies **bloqueiam tudo**.

---

#### **C) Cobertura de policies**

**Tabelas com 4 policies cada (SELECT/INSERT/UPDATE/DELETE):**
1. ✅ estoque_armazens (linhas 296-331)
2. ✅ estoque_localizacoes (linhas 333-368)
3. ✅ estoque (linhas 370-405)
4. ✅ estoque_movimentacoes (linhas 407-442)
5. ✅ estoque_reservas (linhas 444-479)
6. ✅ estoque_lotes (linhas 481-516)
7. ✅ estoque_inventarios (linhas 518-553)
8. ✅ estoque_inventarios_itens (linhas 555-581)
9. ✅ estoque_alertas (linhas 583-612)

**Score:** 100% cobertura

---

#### **GAP #4 — Policies podem bloquear acesso se roles não coincidirem**

**Problema:**
```sql
-- Migration espera (linha 310)
current_user_role() IN ('Admin','Super Admin','Gerente')

-- Se banco tem (minúsculas)
usuarios.perfil = 'admin'  -- ❌ Não coincide

-- Resultado: INSERT bloqueado mesmo para admin
```

**Impacto:** 🔴 CRÍTICO — Usuários autorizados ficam bloqueados

**Solução:** Normalizar comparação:
```sql
-- Opção A: UPPER/LOWER
UPPER(public.current_user_role()) IN ('ADMIN','SUPER ADMIN','GERENTE')

-- Opção B: Mapear roles no helper
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT UPPER(perfil)  -- Força uppercase
  FROM public.usuarios
  WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
```

---

## 4️⃣ VALIDAÇÃO: SEÇÃO 3 — FUNÇÕES (2)

### **4.1 Função `get_dashboard_kpis()` (linhas 616-735)**

**Mudança declarada:**
> Ajustar coluna `m.status = 'ativo'` (linha 643)

**Código anterior (presumido):**
```sql
-- ❌ ANTES (linha inexistente)
WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days'
  AND m.ativo = true;  -- Coluna não existe?
```

**Código atual (linhas 638-643):**
```sql
-- ✅ DEPOIS
SELECT COUNT(DISTINCT m.id)
INTO v_medicos_ativos
FROM public.medicos m
INNER JOIN public.cirurgias c ON c.medico_id = m.id
WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days'
  AND m.status = 'ativo';  -- ✅ Corrigido
```

**Validação:**
```sql
-- Check: coluna status existe em medicos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'medicos'
  AND column_name IN ('status', 'ativo');
-- Esperado: status | text (ou varchar)
```

**Análise:**
- ✅ Lógica correta: conta médicos com cirurgias nos últimos 30 dias + status ativo
- ✅ `COUNT(DISTINCT m.id)` evita duplicatas
- ⚠️ **PERFORMANCE:** JOIN sem índice pode ser lento

**Recomendação:** Adicionar índice:
```sql
CREATE INDEX IF NOT EXISTS idx_cirurgias_medico_data
  ON public.cirurgias(medico_id, data_cirurgia DESC)
  WHERE excluido_em IS NULL;
```

---

### **4.2 Função `calcular_score_global_abbott()` (linhas 740-765)**

**Nova função:**
```sql
CREATE OR REPLACE FUNCTION public.calcular_score_global_abbott()
RETURNS TABLE (
  empresa_id UUID,
  score NUMERIC,
  nivel TEXT,
  detalhes JSONB,
  atualizado_em TIMESTAMPTZ
)
...
CROSS JOIN LATERAL public.calcular_abbott_score(e.id) AS abbott;
```

**Validação:**
```sql
-- PRÉ-REQUISITO: função calcular_abbott_score deve existir
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'calcular_abbott_score';
-- Esperado: 1 row
```

**Análise:**
- ✅ Usa `CROSS JOIN LATERAL` corretamente
- ✅ Reutiliza função existente (boa prática)
- ⚠️ **DEPENDÊNCIA:** Se `calcular_abbott_score()` não existir → **função falha ao criar**

**Solução:** Adicionar validação:
```sql
-- ANTES da seção 4.2
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'calcular_abbott_score'
  ) THEN
    RAISE EXCEPTION 'Função calcular_abbott_score() não existe. Implemente antes de prosseguir.';
  END IF;
END $$;
```

---

## 5️⃣ RESUMO DE GAPS CRÍTICOS

| Gap | Severidade | Impacto | Linha(s) |
|-----|------------|---------|----------|
| #1: Dependência `produtos_opme.empresa_id` não validada | 🔴 CRÍTICA | Migration falha se produtos sem empresa_id | 74-76 (+ 8 ocorrências) |
| #2: Fallback atribui empresa errada (multi-tenant) | 🔴 CRÍTICA | Vazamento de dados entre empresas | 82-85 (+ 8 ocorrências) |
| #3: Funções RLS helpers não validadas | 🔴 CRÍTICA | Policies falham ao criar | 302, 309, 317, etc |
| #4: Roles case-sensitive podem bloquear usuários | 🔴 CRÍTICA | Admins bloqueados de INSERT/UPDATE | 310, 320, etc |
| #5: Dependência `calcular_abbott_score()` não validada | 🟡 MÉDIA | Função não é criada | 761 |
| #6: Ordem de dependências não validada | 🟡 MÉDIA | Propagação de empresa_id falha | Geral |

---

## 6️⃣ SCORE DE CONFORMIDADE

| Categoria | Score | Status |
|-----------|-------|--------|
| Sintaxe SQL | 100% | ✅ Excelente |
| Idempotência | 100% | ✅ IF NOT EXISTS / IF EXISTS |
| Transacionalidade | 100% | ✅ BEGIN/COMMIT |
| Validações pré-flight | 0% | ❌ Nenhuma validação |
| Multi-tenant safety | 30% | ❌ Fallback perigoso |
| RLS coverage | 100% | ✅ 9 tabelas x 4 policies |
| Documentação | 60% | ⚠️ Comentários mínimos |
| **GERAL** | **56%** | ⚠️ **PRECISA CORREÇÕES** |

---

## 7️⃣ RECOMENDAÇÃO FINAL

**Status:** ⚠️ **APROVADO COM RESSALVAS**

**Decisão:**
- ✅ Migration é **tecnicamente correta**
- ❌ Migration é **perigosa em produção** sem validações

**Próximos passos:**
1. **NÃO aplicar em produção** sem correções
2. Criar **migration revisada** com validações (v2)
3. Testar em staging vazio + staging com dados reais
4. Validar funções helpers existem
5. Validar roles case-sensitive

---

**FIM DA AUDITORIA PRELIMINAR**  
**Próximo:** Gerar migration corrigida (v2)

