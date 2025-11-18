# 🚀 Guia de Migração Supabase - ICARUS v5.0

**Data**: 18/11/2025  
**Projeto Supabase**: `gvbkviozlhxorjoavmky`  
**URL**: https://gvbkviozlhxorjoavmky.supabase.co  

---

## 📋 Resumo

- **Total de Migrações**: 90 arquivos SQL
- **Tamanho Consolidado**: 2.12 MB (62.878 linhas)
- **Status**: Consolidadas e prontas para aplicação

---

## 🎯 Estratégias de Migração

###  Option 1: Via Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky
2. Vá em **Database** → **SQL Editor**
3. Copie e cole o conteúdo de `supabase/migrations_consolidated.sql`
4. Execute (pode levar alguns minutos)

### ⚡ Option 2: Via Supabase CLI

```bash
cd /Users/daxmeneghel/icarus-make

# Login no Supabase
npx supabase login

# Link ao projeto
npx supabase link --project-ref gvbkviozlhxorjoavmky

# Aplicar migrações
npx supabase db push
```

### 🔧 Option 3: Via psql (Conexão Direta)

```bash
# Substitua [PASSWORD] pela senha do banco
export PGPASSWORD="[PASSWORD]"

psql "postgresql://postgres.gvbkviozlhxorjoavmky:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations_consolidated.sql
```

### 📦 Option 4: Aplicar em Blocos (Se houver timeout)

Dividimos as migrações em 10 blocos sequenciais:

```bash
cd /Users/daxmeneghel/icarus-make

# Criar blocos
node scripts/migrations/split-migrations.js

# Aplicar bloco por bloco (via Dashboard ou CLI)
# Bloco 1: Extensões + Schema Base (0001-0010)
# Bloco 2: Cadastros (0011-0020)
# Bloco 3: Compras e Vendas (0021-0030)
# ... etc
```

---

## 📊 Migrações Consolidadas

### 🔹 Bloco 1: Schema Base (Crítico)

**Arquivos**: 0001-0010  
**Conteúdo**:
- Extensões PostgreSQL (uuid-ossp, pgcrypto, pg_trgm)
- Tabelas principais: `empresas`, `usuarios`, `produtos`, `lotes`
- Índices de performance
- RLS Policies básicas
- Triggers de auditoria

**Aplicar primeiro!**

### 🔹 Bloco 2: Módulos de Negócio

**Arquivos**: 0011-0050  
**Conteúdo**:
- Cadastros completos (pacientes, médicos, hospitais, fornecedores)
- Compras (cotações, pedidos, notas fiscais)
- Vendas e CRM
- Financeiro (contas, faturas, pagamentos)
- Consignação avançada

### 🔹 Bloco 3: Compliance e Rastreabilidade

**Arquivos**: 0051-0070  
**Conteúdo**:
- Compliance ANVISA
- Auditoria e logs
- Portais OPME
- Licitações e propostas
- Entregas e logística

### 🔹 Bloco 4: Inteligência e Automação

**Arquivos**: 0071-0090  
**Conteúdo**:
- Chatbot GPT-4
- Workflows automáticos
- API Gateway
- BI e Analytics
- KPIs e Dashboards
- RBAC e Permissões
- Health checks
- Relatórios regulatórios
- Integração Microsoft 365
- Pluggy (Open Banking)
- Webhooks
- Orquestração de Agentes

---

## 🗂️ Arquivos Gerados

1. **`supabase/migrations_consolidated.sql`** (2.12 MB)
   - Todas as 90 migrações em ordem cronológica
   - Pronto para executar de uma vez

2. **`scripts/migrations/migrate-to-supabase.sh`**
   - Script bash para migração via REST API

3. **`scripts/migrations/migrate-to-supabase.mjs`**
   - Script Node.js com Supabase SDK

4. **`scripts/migrations/migrate-supabase-cli.sh`**
   - Script usando Supabase CLI oficial

5. **`scripts/migrations/consolidate-migrations.sh`**
   - Script para reconsolidar se necessário

---

## ⚠️ Avisos Importantes

### Sobre Duplicações

Algumas tabelas podem já existir de migrações anteriores. Use `CREATE TABLE IF NOT EXISTS` para evitar erros.

### Sobre Ordem

As migrações foram ordenadas cronologicamente. **Mantenha a ordem** para evitar dependências quebradas.

### Sobre Timeouts

Se houver timeout no Dashboard:
1. Divida o arquivo em blocos menores
2. Aplique cada bloco sequencialmente
3. Aguarde 30s entre blocos

### Sobre RLS

Todas as tabelas críticas têm RLS habilitado por padrão. Certifique-se de configurar policies adequadas antes de uso em produção.

---

## 🔍 Validação Pós-Migração

### 1. Verificar Tabelas Criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Esperado: **100+ tabelas**

### 2. Verificar Extensões

```sql
SELECT * FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm');
```

### 3. Verificar RLS

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;
```

### 4. Verificar Índices

```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 5. Verificar Funções e Triggers

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 📈 Status da Migração

| Item | Status |
|------|--------|
| Scripts Consolidados | ✅ 90 arquivos |
| Arquivo Único Gerado | ✅ 2.12 MB |
| Ordem Cronológica | ✅ Verificada |
| Scripts Auxiliares | ✅ 5 scripts |
| Documentação | ✅ Este guia |
| Aplicação Automática | ⏳ Pendente (timeout MCP) |

---

## 🎯 Próximos Passos

1. **Escolher estratégia de migração** (Dashboard, CLI, psql ou blocos)
2. **Aplicar migrações** seguindo a ordem
3. **Validar schema** usando queries acima
4. **Testar conexão** da aplicação
5. **Configurar RLS policies** adicionais se necessário
6. **Seed dados iniciais** (opcional)

---

## 💡 Recomendações

### Para Desenvolvimento

- Use **Supabase CLI** para sincronizar local ↔ remoto
- Mantenha `supabase/migrations/` versionado no Git
- Use `supabase db diff` para gerar novas migrações

### Para Produção

- **Backup antes de migrar!**
- Aplique em janela de manutenção
- Monitore logs do Supabase
- Tenha plano de rollback preparado

### Para Performance

- Aplicar índices primeiro pode acelerar inserts posteriores
- Criar constraints ao final (mais rápido)
- Considerar `UNLOGGED TABLES` temporariamente

---

## 📞 Suporte

**Projeto**: ICARUS v5.0  
**Database**: PostgreSQL 15 (Supabase)  
**Schema**: Multi-tenant PT-BR  
**RLS**: Habilitado  

**Credenciais**:
- **URL**: https://gvbkviozlhxorjoavmky.supabase.co
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

**Migração preparada em**: 18/11/2025 01:00  
**Agente**: AGENTE_MIGRACAO_SUPABASE  
**Versão**: 1.0

