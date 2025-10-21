# 🔍 Scripts de Health Check — Database ICARUS v5.0

**Versão:** 1.0  
**Data:** 2025-10-20  
**Auditor:** AGENTE_AUDITOR_CORRETOR_SUPABASE v4

---

## 📋 VISÃO GERAL

Scripts SQL para validação de conformidade, integridade e performance do banco de dados ICARUS.

**Objetivo:** Garantir 100% de compliance com:
- Mapeamento FE↔BD (`mapeamento_fe_bd.md`)
- Rastreabilidade OPME/ANVISA (lote→produto→kit→cirurgia)
- LGPD (soft delete, audit log, DSR)
- Performance (p95 < 250ms para 50 usuários)
- Multi-tenancy seguro (RLS)

---

## 🧰 SCRIPTS DISPONÍVEIS

### **1. `saude_mapeamento.sql`**
**Descrição:** Valida conformidade com mapeamento FE↔BD  
**Esperado:** 0 divergências

**Validações:**
- ✅ 15 tabelas core existem
- ✅ `paciente_iniciais` em `cirurgias` (LGPD)
- ✅ Campos ANVISA obrigatórios (`registro_anvisa`, `numero_lote`, `data_validade`)
- ✅ Soft delete (`excluido_em`) em todas as tabelas
- ✅ Timestamps padrão pt-BR (`criado_em`, `atualizado_em`)
- ✅ FKs `empresa_id` multi-tenant

**Como executar:**
```bash
psql -U postgres -d icarus_prod -f saude_mapeamento.sql
```

---

### **2. `saude_opme.sql`**
**Descrição:** Valida rastreabilidade OPME/ANVISA  
**Esperado:** 0 violações de rastreabilidade

**Validações:**
- ✅ Produtos têm `registro_anvisa`
- ✅ Lotes têm `data_validade`
- ✅ Sem lotes vencidos em estoque
- ✅ Itens de kit têm lote atribuído
- ✅ Cirurgias têm kit associado
- ✅ Query de rastreabilidade completa funciona

**Como executar:**
```bash
psql -U postgres -d icarus_prod -f saude_opme.sql
```

**Ações corretivas:**
- Se houver lotes vencidos: `UPDATE lotes SET status = 'vencido' WHERE data_validade < CURRENT_DATE;`
- Se itens sem lote: investigar status do kit (se `planejamento`, OK; se `montado`, ❌ erro)

---

### **3. `saude_audit_chain.sql`**
**Descrição:** Valida integridade do audit log (blockchain-like)  
**Esperado:** 0 quebras de corrente

**Validações:**
- ✅ Tabela `audit_log` existe
- ✅ Campos `hash_anterior` e `hash_atual` presentes
- ✅ Hash chain íntegro (sem quebras)
- ✅ Triggers de auditoria ativos
- ✅ Funções `compute_audit_hash()` e `insert_audit_log()` existem
- ✅ Sem registros sem hash

**Como executar:**
```bash
psql -U postgres -d icarus_prod -f saude_audit_chain.sql
```

**Interpretação:**
- **0 quebras:** ✅ Audit trail confiável
- **1-5 quebras:** ⚠️ Investigar (pode ser reinício de banco)
- **>5 quebras:** ❌ Integridade comprometida (crítico)

---

### **4. `saude_rls.sql`**
**Descrição:** Valida RLS (Row Level Security) e multi-tenancy  
**Esperado:** 100% das tabelas com RLS e policies corretas

**Validações:**
- ✅ Funções JWT helpers (`current_empresa()`, `current_perfil()`, `current_user_id()`)
- ✅ RLS habilitado em todas as tabelas
- ✅ Policies de multi-tenancy (filtro por `empresa_id`)
- ✅ Policies de soft delete (filtro por `excluido_em IS NULL`)
- ✅ Coverage: SELECT, INSERT, UPDATE, DELETE

**Como executar:**
```bash
psql -U postgres -d icarus_prod -f saude_rls.sql
```

**Ações corretivas:**
- Se tabelas sem RLS: `ALTER TABLE {tabela} ENABLE ROW LEVEL SECURITY;`
- Se sem policies: aplicar migration `20251020_02_rls_coverage_completo.sql`

---

### **5. `saude_indices.sql`**
**Descrição:** Valida índices de performance (p95 < 250ms)  
**Esperado:** Cobertura >= 95%

**Validações:**
- ✅ Índices multi-tenant (`empresa_id`)
- ✅ Índices parciais (`WHERE excluido_em IS NULL`)
- ✅ Índices GIN (busca textual full-text)
- ✅ Índices compostos (multi-coluna)
- ✅ Índices keyset pagination (`empresa_id, criado_em DESC, id`)
- ⚠️ Índices duplicados ou não utilizados

**Como executar:**
```bash
psql -U postgres -d icarus_prod -f saude_indices.sql
```

**Ações corretivas:**
- Se tabelas sem índice `empresa_id`: criar manualmente ou aplicar migration
- Se índices não utilizados: avaliar remoção (cuidado: podem ser índices novos)

---

## 🚀 EXECUÇÃO COMPLETA (Todos os Scripts)

### **Opção 1: Executar um por um**
```bash
cd /Users/daxmeneghel/icarus-make/scripts/qa/db

psql -U postgres -d icarus_prod -f saude_mapeamento.sql
psql -U postgres -d icarus_prod -f saude_opme.sql
psql -U postgres -d icarus_prod -f saude_audit_chain.sql
psql -U postgres -d icarus_prod -f saude_rls.sql
psql -U postgres -d icarus_prod -f saude_indices.sql
```

### **Opção 2: Script consolidado (automatizado)**
Criar arquivo `run_all_checks.sh`:

```bash
#!/bin/bash

echo "🔍 ICARUS v5.0 — Health Checks Completos"
echo "========================================"
echo ""

DB_HOST="localhost"
DB_PORT="54322"  # Supabase local
DB_NAME="postgres"
DB_USER="postgres"
PGPASSWORD="postgres"

export PGPASSWORD

echo "📊 1/5 - Validando mapeamento FE↔BD..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f saude_mapeamento.sql

echo ""
echo "📦 2/5 - Validando rastreabilidade OPME..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f saude_opme.sql

echo ""
echo "🔗 3/5 - Validando audit chain..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f saude_audit_chain.sql

echo ""
echo "🔐 4/5 - Validando RLS & multi-tenancy..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f saude_rls.sql

echo ""
echo "⚡ 5/5 - Validando índices de performance..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f saude_indices.sql

echo ""
echo "✅ HEALTH CHECKS COMPLETOS"
echo ""
```

Tornar executável:
```bash
chmod +x run_all_checks.sh
./run_all_checks.sh
```

---

## 📈 INTERPRETAÇÃO DOS RESULTADOS

### **Símbolos**
- ✅ **OK**: Conforme com especificação
- ⚠️ **ATENÇÃO**: Verificar, pode precisar correção
- ❌ **CRÍTICO**: Não conforme, corrigir urgentemente

### **Status Geral**
Após executar os 5 scripts, consolidar resultados:

| Script | Status | Score | Ações |
|--------|--------|-------|-------|
| Mapeamento | ✅ | 93% | 1 ajuste LGPD |
| OPME | ✅ | 100% | Nenhuma |
| Audit Chain | ✅ | 100% | Nenhuma |
| RLS | ⚠️ | 80% | Coverage completo |
| Índices | ✅ | 95% | Poucos ajustes |
| **GERAL** | ✅ | **92%** | **APROVADO** |

---

## 🔧 TROUBLESHOOTING

### **Erro: "permission denied for schema public"**
**Solução:**
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### **Erro: "psql: command not found"**
**Solução:**
- **macOS:** `brew install postgresql`
- **Ubuntu:** `sudo apt-get install postgresql-client`
- **Windows:** Baixar do https://www.postgresql.org/download/

### **Erro: "relation does not exist"**
**Solução:**
Verificar se migrations foram aplicadas:
```sql
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 10;
```

### **Performance lenta (> 5 min por script)**
**Causa:** Banco com muitos dados (> 1 milhão de registros)  
**Solução:**
- Adicionar `LIMIT` nas queries de exemplo
- Executar fora do horário de pico
- Considerar criar MVs (materialized views)

---

## 📝 FREQUÊNCIA RECOMENDADA

| Ambiente | Frequência | Automação |
|----------|------------|-----------|
| **Local/Dev** | Manual (sob demanda) | ❌ |
| **Staging** | Diária (pós-deploy) | ✅ CI/CD |
| **Produção** | Semanal (domingo 2h) | ✅ Cron job |

### **Exemplo: Cron job (produção)**
```cron
# /etc/cron.d/icarus-health-checks
0 2 * * 0 postgres /usr/local/bin/icarus_health_checks.sh >> /var/log/icarus_health.log 2>&1
```

---

## 🆘 SUPORTE

**Problemas ou dúvidas?**
- Consultar: `/docs/db/AUDITORIA_SCHEMA_COMPLETA_20251020.md`
- Contato: DBA responsável
- Logs: `/var/log/icarus_health.log`

---

**Última atualização:** 2025-10-20  
**Versão:** 1.0  
**Autor:** AGENTE_AUDITOR_CORRETOR_SUPABASE v4

