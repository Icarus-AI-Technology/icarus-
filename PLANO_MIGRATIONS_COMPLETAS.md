# 🚀 PLANO: Aplicar TODAS as 92 Migrations

**Data:** 26 de Janeiro de 2025  
**Objetivo:** Garantir 100% das migrations aplicadas no Supabase  
**Status Atual:** 0 de 92 migrations aplicadas (Remote vazio)

---

## 📊 SITUAÇÃO ATUAL

### Migrations Locais

```yaml
Total de arquivos: 92 migrations
Formato válido: ~89 migrations (3 serão ignoradas)
Status Remote: Nenhuma aplicada ainda
```

### Migrations Ignoradas (3)

```
1. 0007_feature_flags_compliance.sql.OLD (nome inválido)
2. 20251023140YYY_create_ml_vectors_table.sql (nome inválido)
3. README_MIGRATIONS_CORRETIVAS.md (não é SQL)
```

### Migrations Válidas: **89 migrations** para aplicar

---

## ⚠️ PROBLEMA IDENTIFICADO

O comando `supabase db push` foi **interrompido**. Isso pode acontecer por:

1. Timeout de conexão
2. Conflitos de objetos já existentes
3. Migrations muito grandes
4. Problemas de ordem/dependências

---

## 🎯 ESTRATÉGIA DE APLICAÇÃO

### Opção 1: Aplicação Individual (RECOMENDADA) ✅

Aplicar migrations em lotes pequenos para controlar erros.

### Opção 2: Aplicação em Massa (ARRISCADA)

Tentar aplicar todas de uma vez.

### Opção 3: Consolidação (MAIS SEGURA) ⭐

Criar uma migration consolidada com todas as tabelas essenciais.

---

## ✅ PLANO DE EXECUÇÃO (Opção 3 - RECOMENDADA)

### Fase 1: Análise e Consolidação

```bash
1. Analisar todas as 92 migrations
2. Identificar tabelas críticas
3. Consolidar em migration única
4. Remover duplicatas
5. Resolver dependências
```

### Fase 2: Criar Migration Master

```sql
-- supabase/migrations/20250126_master_consolidated.sql
-- Consolidação de TODAS as tabelas necessárias
-- Ordem correta de criação
-- Tratamento de IF NOT EXISTS
```

### Fase 3: Aplicação Segura

```bash
1. Backup do estado atual
2. Aplicar migration consolidada
3. Verificar integridade
4. Validar tabelas críticas
5. Testar Edge Functions
```

---

## 📋 TABELAS ESSENCIAIS A GARANTIR

### Core System (Prioritárias)

```sql
✅ empresas
✅ usuarios (ou profiles)
✅ produtos
✅ produtos_opme
✅ cirurgias
✅ cirurgia_materiais
```

### EDR System (7 tabelas)

```sql
✅ edr_research_sessions
✅ edr_agent_tasks
✅ edr_search_results
✅ edr_reflection_logs
✅ edr_steering_commands
✅ edr_visualizations
✅ edr_citations
```

### Financeiro

```sql
✅ contas_receber
✅ contas_pagar
✅ fluxo_caixa
✅ lancamentos_financeiros
```

### Estoque & Consignação

```sql
✅ estoque
✅ estoque_movimentacoes
✅ consignacao_materiais
✅ consignacao_contratos
```

### Compliance

```sql
✅ compliance_requisitos_abbott
✅ compliance_rastreabilidade_opme
✅ compliance_documentos
```

### Agent System

```sql
✅ agent_tasks
✅ agent_logs
✅ agent_reports
```

### Auxiliares

```sql
✅ medicos
✅ hospitais
✅ pacientes
✅ convenios
✅ fornecedores
```

---

## 🔧 SCRIPT DE APLICAÇÃO INTELIGENTE

Vou criar um script que:

1. **Lê todas as 92 migrations**
2. **Extrai DDL statements**
3. **Remove duplicatas**
4. **Ordena por dependências**
5. **Cria migration consolidada**
6. **Aplica com tratamento de erros**

---

## 📦 STORAGE BUCKETS (6)

Também vou garantir que os 6 buckets estão criados:

```yaml
1. documentos-dpo (private)
2. notas-fiscais (private)
3. imagens-produtos (public)
4. relatorios (private)
5. certificados (private)
6. avatares (public)
```

---

## ⚡ AÇÃO IMEDIATA

Vou executar agora:

### Passo 1: Consolidar Migrations

Criar migration master com todas as tabelas essenciais.

### Passo 2: Aplicar com Segurança

Usar `supabase db push` com a nova migration consolidada.

### Passo 3: Verificar Buckets

Criar os 6 buckets via script se necessário.

### Passo 4: Validar Sistema

Executar `verify-supabase-status.ts` para confirmar.

---

## 🎯 META FINAL

```yaml
Migrations Aplicadas: 100% (consolidadas)
Tabelas no Database: 129+ (ou mais se necessário)
Edge Functions: 17 ✅ (já deployadas)
Storage Buckets: 6 ✅ (garantir criação)
System Status: Production Ready ✅
```

---

## 💡 OBSERVAÇÃO IMPORTANTE

**Por que consolidar ao invés de aplicar 92 individualmente?**

1. ✅ **Mais Seguro** - Evita conflitos de ordem
2. ✅ **Mais Rápido** - Uma transação só
3. ✅ **Mais Limpo** - Remove duplicatas
4. ✅ **Mais Confiável** - Testado como um todo
5. ✅ **Production-Grade** - Approach profissional

---

**Vou proceder com a criação da migration consolidada agora?**

Confirme e eu executo:

1. Análise das 92 migrations
2. Criação da migration master
3. Aplicação no Supabase
4. Verificação dos buckets
5. Validação completa

---

**Documento gerado em:** 26/01/2025  
**Status:** Aguardando confirmação para execução  
**Tempo estimado:** 5-10 minutos para consolidação e aplicação
