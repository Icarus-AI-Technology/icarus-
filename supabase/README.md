# 🚀 QUICK START — Banco de Dados ICARUS

**Versão:** 1.0  
**Data:** 2025-10-18  
**Autor:** Agente Sênior BD

---

## 📋 PRÉ-REQUISITOS

- Node.js 18+
- PostgreSQL 14+ (via Supabase)
- Supabase CLI: `npm install -g supabase`
- psql (cliente PostgreSQL)
- Conta Supabase ativa

---

## ⚙️ SETUP INICIAL

### 1. Configurar Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key-aqui
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui
```

> ⚠️ **IMPORTANTE:** Service Role Key NUNCA no frontend; apenas server/edge functions.

### 2. Aplicar Migrations

```bash
# Aplicar todas as migrations versionadas
npm run db:migrate

# OU manualmente:
supabase db push
```

**Migrations aplicadas:**
- `0001_init_schema.sql` — Schema completo multi-tenant
- `0002_rls_policies.sql` — RLS + JWT helpers
- `0003_indexes_perf.sql` — Índices de performance
- `0004_functions_triggers.sql` — Audit log + hash chain
- `0005_storage_policies.sql` — Buckets + policies
- `0006_seed_minimo.sql` — Seed para desenvolvimento

### 3. Popular com Dados de Desenvolvimento

```bash
# ATENÇÃO: Apenas para desenvolvimento!
npm run db:seed
```

**Dados inseridos:**
- 1 empresa demo (`ICARUS Distribuidora OPME`)
- 6 produtos OPME (ortopedia, cardiologia, neurocirurgia)
- 8 lotes com rastreabilidade ANVISA
- 4 médicos especialistas
- 5 hospitais/centros cirúrgicos
- 3 cirurgias agendadas

---

## 🔍 VERIFICAÇÃO

### Health Check

```bash
npm run db:health
```

**Verifica:**
- ✅ Conectividade
- ⏱️ Latência (meta: < 250ms)
- 🔌 Extensões (uuid-ossp, pgcrypto, pg_trgm)
- 📊 Tamanho do banco
- 🔐 RLS policies (esperado: 30+)
- 🔒 Locks ativos

### Auditoria Completa

```bash
npm run db:audit
```

**Verifica:**
- 🔗 Integridade hash chain (audit log)
- 📅 Lotes vencidos
- 🏥 Produtos sem registro ANVISA
- 🔐 Isolamento multi-tenant
- 📈 Top 5 queries lentas
- 📊 Estatísticas gerais

---

## 🧪 TESTES MANUAIS

### 1. Testar Multi-tenancy

```sql
-- Como usuário da empresa 11111111-1111-1111-1111-111111111111
-- (configurar JWT claims: empresa_id e perfil)

-- Deve retornar apenas produtos da própria empresa
SELECT * FROM produtos WHERE excluido_em IS NULL;

-- Deve falhar (empresa diferente)
UPDATE produtos SET descricao = 'Teste'
WHERE empresa_id != '11111111-1111-1111-1111-111111111111';
```

### 2. Testar Rastreabilidade OPME

```sql
-- Validar lote
SELECT * FROM validar_lote('lote-id-aqui');

-- Rastrear produto → lote → kit → cirurgia
SELECT
  p.descricao AS produto,
  l.numero_lote,
  l.numero_serie,
  k.nome AS kit,
  c.codigo_interno AS cirurgia,
  c.data_cirurgia
FROM itens_kit ik
JOIN lotes l ON ik.lote_id = l.id
JOIN produtos p ON ik.produto_id = p.id
JOIN kits k ON ik.kit_id = k.id
LEFT JOIN cirurgias c ON k.cirurgia_id = c.id
WHERE p.codigo_sku = 'ORT-001'
ORDER BY c.data_cirurgia DESC;
```

### 3. Testar Audit Log

```sql
-- Inserir registro
INSERT INTO produtos (empresa_id, codigo_sku, descricao, registro_anvisa)
VALUES ('11111111-1111-1111-1111-111111111111', 'TEST-001', 'Produto Teste', 'ANV-999');

-- Verificar audit log
SELECT
  tabela,
  acao,
  dados_depois->>'codigo_sku' AS sku,
  hash_atual
FROM audit_log
WHERE tabela = 'produtos'
ORDER BY criado_em DESC
LIMIT 5;

-- Verificar integridade da cadeia
SELECT * FROM verificar_integridade_audit_log()
WHERE NOT integro;
-- Esperado: 0 registros (cadeia íntegra)
```

### 4. Testar Funções de Negócio

```sql
-- Reservar kit (decrementa estoque)
SELECT reservar_kit('kit-id-aqui');

-- Consumir kit
SELECT consumir_kit(
  'kit-id-aqui',
  '{"item-kit-id-1": 2, "item-kit-id-2": 5}'::jsonb
);

-- Bloquear lotes vencidos (job)
SELECT bloquear_lotes_vencidos();
```

---

## 🔐 SEGURANÇA

### JWT Claims Necessários

```json
{
  "sub": "user-uuid",
  "email": "usuario@empresa.com",
  "empresa_id": "11111111-1111-1111-1111-111111111111",
  "perfil": "admin"
}
```

### Perfis e Permissões

| Perfil | Produtos | Lotes | Cirurgias | Kits | Financeiro | Leads |
|--------|----------|-------|-----------|------|------------|-------|
| **admin** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **operador** | R | R | CRUD | CRUD | - | - |
| **comercial** | CRUD | R | CRUD | R | - | CRUD |
| **financeiro** | R | R | R | - | CRUD | - |
| **estoque** | CRUD | CRUD | R | CRUD | - | - |

---

## 📊 PERFORMANCE

### Keyset Pagination (recomendado)

```sql
-- Primeira página (50 registros)
SELECT * FROM produtos
WHERE empresa_id = auth.current_empresa() AND excluido_em IS NULL
ORDER BY criado_em DESC, id
LIMIT 50;

-- Próxima página (usar last_id e last_criado_em)
SELECT * FROM produtos
WHERE empresa_id = auth.current_empresa()
  AND excluido_em IS NULL
  AND (criado_em, id) < ('2025-10-18 10:00:00', 'last-uuid')
ORDER BY criado_em DESC, id
LIMIT 50;
```

### Busca Full-text (trigram)

```sql
-- Buscar produtos por descrição
SELECT
  id,
  descricao,
  ts_rank(to_tsvector('portuguese', descricao), plainto_tsquery('portuguese', 'joelho')) AS rank
FROM produtos
WHERE empresa_id = auth.current_empresa()
  AND excluido_em IS NULL
  AND to_tsvector('portuguese', descricao) @@ plainto_tsquery('portuguese', 'joelho')
ORDER BY rank DESC
LIMIT 20;
```

### Refresh Materialized View (job)

```sql
-- Atualizar KPIs (executar a cada 5min via cron)
SELECT refresh_mv_kpis();

-- Consultar KPIs
SELECT * FROM mv_kpis_empresa
WHERE empresa_id = '11111111-1111-1111-1111-111111111111';
```

---

## 🛠️ MANUTENÇÃO

### Backup

```bash
# Backup completo
pg_dump "$SUPABASE_DB_URL" > backup_$(date +%Y%m%d).sql

# Backup apenas schema
pg_dump "$SUPABASE_DB_URL" --schema-only > schema_$(date +%Y%m%d).sql
```

### Restaurar

```bash
psql "$SUPABASE_DB_URL" < backup_20251018.sql
```

### Limpar Dados de Desenvolvimento

```bash
# Remover seed (cuidado!)
psql "$SUPABASE_DB_URL" -c "
DELETE FROM cirurgias WHERE empresa_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM lotes WHERE produto_id IN (SELECT id FROM produtos WHERE empresa_id = '11111111-1111-1111-1111-111111111111');
DELETE FROM produtos WHERE empresa_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM medicos WHERE empresa_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM hospitais WHERE empresa_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM fornecedores WHERE empresa_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM usuarios WHERE empresa_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM empresas WHERE id = '11111111-1111-1111-1111-111111111111';
"
```

---

## 📚 DOCUMENTAÇÃO

- **Schema PT-BR:** `supabase/schema_pt_br.sql`
- **Relatório de Auditoria:** `supabase/auditoria_relatorio.md`
- **Checklist LGPD/ANVISA:** `supabase/checklist_conformidade.md`
- **Mapeamento FE↔BD:** `supabase/mapeamento_fe_bd.md`

---

## 🐛 TROUBLESHOOTING

### Erro: "função auth.current_empresa() não existe"

```bash
# Aplicar migration 0002 novamente
psql "$SUPABASE_DB_URL" -f supabase/migrations/0002_rls_policies.sql
```

### Erro: "RLS policy violation"

- Verificar JWT claims (empresa_id, perfil)
- Testar com service role key (bypassa RLS)
- Verificar se policies estão ativas: `SELECT * FROM pg_policies WHERE schemaname = 'public';`

### Erro: "Query lenta (> 1s)"

```sql
-- Analisar query
EXPLAIN ANALYZE
SELECT * FROM produtos
WHERE empresa_id = '...' AND excluido_em IS NULL;

-- Verificar se índice está sendo usado
-- Esperado: "Index Scan using idx_produtos_empresa_status"
```

### Erro: "Hash chain corrompido"

```sql
-- Verificar registros corrompidos
SELECT * FROM verificar_integridade_audit_log()
WHERE NOT integro;

-- Se necessário, recomputar hashes (contate DBA)
```

---

## 📞 SUPORTE

**Responsável:** Agente Sênior BD  
**Suporte Técnico:** suporte@icarusai.com.br  
**DPO (LGPD):** dpo@icarusai.com.br  
**Versão:** 1.0  
**Última atualização:** 2025-10-18

---

## 🎉 PRONTO!

Seu banco de dados ICARUS está configurado e pronto para uso.

**Próximos passos:**
1. Integrar com frontend (adapters camelCase ↔ snake_case)
2. Configurar jobs cron (refresh_mv_kpis, bloquear_lotes_vencidos)
3. Configurar alertas (Sentry/PostHog)
4. Configurar backup automático
5. Executar testes E2E

