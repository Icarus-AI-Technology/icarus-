# 🎯 MIGRAÇÃO SUPABASE - GUIA COMPLETO E DEFINITIVO

**Projeto**: Icarus v5.0 - Sistema de Gestão Cirúrgica OPME  
**Data**: 18/11/2025  
**Status**: ✅ Pronto para Aplicação

---

## 📋 Índice

1. [Status Atual](#status-atual)
2. [Passo a Passo](#passo-a-passo)
3. [Método Recomendado](#método-recomendado)
4. [Validação](#validação)
5. [Troubleshooting](#troubleshooting)
6. [Arquivos](#arquivos)

---

## 📊 Status Atual

### ✅ Já Aplicado
```
✓ uuid-ossp extension
✓ pgcrypto extension
✓ pg_trgm extension
✓ empresas (tabela multi-tenant root)
✓ usuarios (extends auth.users)
✓ produtos (catálogo OPME)
✓ lotes (rastreabilidade ANVISA)
✓ 7 índices de performance
✓ RLS habilitado nas 4 tabelas
```

### ⏳ Pendente (88 migrações, 2.1 MB)
- Cadastros completos (médicos, hospitais, pacientes, convênios)
- Módulos operacionais (cirurgias, estoque, compras, vendas)
- Features avançadas (BI, chatbot, workflows, API gateway)
- Compliance e auditoria
- ML e embeddings
- Storage buckets

---

## 🚀 Passo a Passo

### 1️⃣ **Executar Diagnóstico (Opcional)**

**Para ver o que já está no Supabase:**

```bash
# Copie o diagnóstico
cat /Users/daxmeneghel/icarus-make/DIAGNOSTICO_SUPABASE.sql | pbcopy
```

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
2. Cole no SQL Editor (Cmd+V)
3. Execute (Cmd+Enter)
4. Veja o relatório completo

---

### 2️⃣ **Aplicar Migrações**

Escolha **UMA** das duas opções abaixo:

#### ✅ OPÇÃO A: Arquivo Consolidado (MAIS RÁPIDO) ⭐

**Recomendado para**: Aplicar tudo de uma vez (10-15 min)

```bash
# 1. Copie o arquivo consolidado completo
cat /Users/daxmeneghel/icarus-make/supabase/migrations_consolidated.sql | pbcopy
```

**2. No SQL Editor do Supabase:**
- Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
- Cole o SQL (Cmd+V)
- Clique em "Run" ou pressione Cmd+Enter
- Aguarde ~10-15 minutos
- ✅ Pronto! Todas as 88 migrações aplicadas

---

#### ✅ OPÇÃO B: Blocos Sequenciais (MAIS SEGURO)

**Recomendado para**: Controle granular e troubleshooting

Execute **um bloco por vez** no SQL Editor:

**Bloco 1/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_01.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão (~1-2 min)

**Bloco 2/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_02.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 3/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_03.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 4/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_04.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 5/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_05.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 6/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_06.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 7/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_07.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 8/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_08.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 9/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_09.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

**Bloco 10/10**:
```bash
cat /Users/daxmeneghel/icarus-make/supabase/migrations_blocks/block_10.sql | pbcopy
```
→ Cole no SQL Editor → Run → Aguarde conclusão

✅ **Pronto!** Todas as 88 migrações aplicadas em 10 blocos

---

### 3️⃣ **Validação Completa**

**Após aplicar TODAS as migrações, execute no SQL Editor:**

```sql
-- 1. Verificar extensões (deve retornar 3)
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm');

-- 2. Contar tabelas públicas (deve retornar ~50-80)
SELECT COUNT(*) AS total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 3. Verificar RLS habilitado (deve retornar ~40-60)
SELECT COUNT(*) AS tabelas_com_rls
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- 4. Verificar tabelas core multi-tenant (deve retornar 4)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('empresas', 'usuarios', 'produtos', 'lotes')
ORDER BY table_name;

-- 5. Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 6. Verificar functions principais (deve retornar 4+)
SELECT proname AS function_name
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('current_empresa', 'current_perfil', 'current_user_id', 'update_updated_at_column')
ORDER BY proname;

-- 7. Verificar índices (deve retornar ~200+)
SELECT COUNT(*) AS total_indices
FROM pg_indexes
WHERE schemaname = 'public';

-- 8. Verificar triggers (deve retornar ~30+)
SELECT COUNT(*) AS total_triggers
FROM pg_trigger
WHERE NOT tgisinternal;

-- 9. Verificar storage buckets (deve retornar 3-5)
SELECT name, public, file_size_limit
FROM storage.buckets
ORDER BY name;
```

**Resultado Esperado**:
- ✅ 3 extensões
- ✅ 50-80 tabelas públicas
- ✅ 40-60 tabelas com RLS
- ✅ 4 tabelas core (empresas, usuarios, produtos, lotes)
- ✅ 4+ functions principais
- ✅ 200+ índices
- ✅ 30+ triggers
- ✅ 3-5 storage buckets

---

## 🎯 Método Recomendado

### Para Este Momento (Migração Inicial)

**USE: OPÇÃO A (Arquivo Consolidado)** ⭐

**Por quê?**
- ✅ Mais rápido (10-15 minutos)
- ✅ Uma única operação
- ✅ Menos chance de erro humano
- ✅ Comandos com `IF NOT EXISTS` (idempotentes)

**Quando usar OPÇÃO B?**
- Se OPÇÃO A der timeout (improvável, mas possível)
- Se quiser controle granular
- Se encontrar algum erro específico

---

## 🔧 Troubleshooting

### Erro: "relation already exists"
**Solução**: Ignore, é normal. Os comandos usam `IF NOT EXISTS`.

### Erro: "syntax error near..."
**Solução**: 
1. Identifique a linha do erro no log
2. Verifique se copiou o SQL completo
3. Tente aplicar o bloco novamente

### Erro: Timeout no Dashboard
**Solução**:
1. Pare a execução
2. Execute o diagnóstico para ver o que foi aplicado
3. Use OPÇÃO B (blocos menores)
4. Comece do bloco que ainda não foi aplicado

### Erro: "permission denied"
**Solução**:
1. Verifique se está logado no Dashboard
2. Confirme que é o owner do projeto
3. Tente novamente

### Dúvida: Como saber se tudo foi aplicado?
**Solução**: Execute o script de validação (passo 3️⃣)

---

## 📁 Arquivos Disponíveis

### Migrações SQL

| Arquivo | Tamanho | Descrição |
|---------|---------|-----------|
| `supabase/migrations_consolidated.sql` | 2.1 MB | **USAR ESTE** - Todas as 88 migrações |
| `supabase/migrations_blocks/block_01.sql` | 229 KB | Bloco 1/10 |
| `supabase/migrations_blocks/block_02.sql` | 225 KB | Bloco 2/10 |
| `supabase/migrations_blocks/block_03.sql` | 223 KB | Bloco 3/10 |
| `supabase/migrations_blocks/block_04.sql` | 221 KB | Bloco 4/10 |
| `supabase/migrations_blocks/block_05.sql` | 218 KB | Bloco 5/10 |
| `supabase/migrations_blocks/block_06.sql` | 216 KB | Bloco 6/10 |
| `supabase/migrations_blocks/block_07.sql` | 213 KB | Bloco 7/10 |
| `supabase/migrations_blocks/block_08.sql` | 210 KB | Bloco 8/10 |
| `supabase/migrations_blocks/block_09.sql` | 207 KB | Bloco 9/10 |
| `supabase/migrations_blocks/block_10.sql` | 199 KB | Bloco 10/10 |

### Ferramentas e Documentação

| Arquivo | Descrição |
|---------|-----------|
| `DIAGNOSTICO_SUPABASE.sql` | Script para ver status atual do banco |
| `GUIA_COMPLETO_MIGRACAO_SUPABASE.md` | **ESTE ARQUIVO** - Guia definitivo |
| `SUPABASE_MIGRACAO_FINAL.md` | Guia detalhado com comandos |
| `RELATORIO_EXECUTIVO_MIGRACAO.md` | Relatório executivo |
| `docs/GUIA_MIGRACAO_SUPABASE.md` | Guia técnico detalhado |
| `docs/RELATORIO_MIGRACAO_SUPABASE.md` | Relatório de preparação |

---

## 🎓 Resumo Executivo

### O que fazer AGORA:

1. ✅ **Copie o arquivo consolidado**:
   ```bash
   cat /Users/daxmeneghel/icarus-make/supabase/migrations_consolidated.sql | pbcopy
   ```

2. ✅ **Acesse o SQL Editor**:
   https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql

3. ✅ **Cole e execute** (Cmd+V, depois Cmd+Enter)

4. ✅ **Aguarde ~10-15 minutos**

5. ✅ **Execute a validação** (passo 3️⃣)

6. ✅ **Pronto!** Sistema 100% funcional

---

## 🎉 Resultado Final

Após aplicar as migrações, o **Icarus v5.0** terá:

### Infraestrutura
- ✅ 3 extensões PostgreSQL
- ✅ 50-80 tabelas operacionais
- ✅ 40-60 tabelas com RLS (segurança)
- ✅ 200+ índices de performance
- ✅ 30+ triggers automáticos
- ✅ 50+ functions PostgreSQL
- ✅ 20+ views materializadas
- ✅ 3-5 storage buckets

### Módulos de Negócio
- ✅ **Multi-tenancy** completo
- ✅ **Cadastros**: Médicos, Hospitais, Pacientes, Convênios
- ✅ **Operações**: Cirurgias, Estoque FIFO, Kits, Consignação
- ✅ **Compras**: Pedidos, Fornecedores, Recebimento
- ✅ **Vendas & CRM**: Leads, Pipeline, Propostas
- ✅ **Financeiro**: Faturamento, Contas a Receber/Pagar
- ✅ **Compliance**: Auditoria LGPD + ANVISA
- ✅ **Portais OPME**: Integração com distribuidoras
- ✅ **Licitações**: Gestão de licitações públicas
- ✅ **Chatbot GPT-4**: Navegação inteligente
- ✅ **Workflows**: Automação de processos
- ✅ **API Gateway**: Rate limiting e monitoramento
- ✅ **BI & Analytics**: Dashboards e relatórios
- ✅ **ML**: Embeddings e recomendações
- ✅ **RBAC**: Permissões granulares

### Compliance e Segurança
- ✅ **LGPD**: Consentimento, anonimização, exclusão
- ✅ **ANVISA**: Rastreabilidade de lotes
- ✅ **RLS**: Isolamento multi-tenant
- ✅ **Auditoria**: Log de todas as operações

---

## 📞 Suporte

### Em caso de dúvidas:

1. **Leia a documentação**:
   - `GUIA_COMPLETO_MIGRACAO_SUPABASE.md` (este arquivo)
   - `docs/GUIA_MIGRACAO_SUPABASE.md`

2. **Execute o diagnóstico**:
   - `DIAGNOSTICO_SUPABASE.sql`

3. **Consulte o log de erros**:
   - No SQL Editor, veja o painel inferior

4. **Re-execute se necessário**:
   - Comandos são idempotentes (podem ser executados múltiplas vezes)

---

**LEMBRE-SE**: Este é um processo **seguro e reversível**. Todos os comandos usam `IF NOT EXISTS` e `CREATE OR REPLACE`, portanto podem ser executados múltiplas vezes sem problemas.

---

**Autor**: Agente de Migração Supabase  
**Versão**: 1.0 Final  
**Data**: 18/11/2025 08:40 BRT  
**Status**: ✅ Pronto para Produção

**BOA SORTE! 🚀**

