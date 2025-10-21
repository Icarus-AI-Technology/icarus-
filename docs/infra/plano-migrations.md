# 📋 Plano de Migrations - ICARUS v5.0

**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**

📅 Data: 2025-10-20T15:44:12.513Z

---

## 🎯 Objetivo

Implementar infraestrutura completa do domínio **Cirurgias** (core do sistema ICARUS):

- ✅ Tabelas principais com auditoria
- ✅ Políticas RLS multi-tenant
- ✅ Índices de performance
- ✅ Views materializadas para KPIs
- ✅ Functions RPC para consultas otimizadas
- ✅ Triggers automáticos

---

## 📦 Migrations Geradas

### 1. `202510201244_01_cirurgias_tabelas.sql`

**Descrição:** Criar tabelas do domínio Cirurgias (cirurgias, cirurgia_materiais, cirurgia_eventos)

**Caminho:** `supabase/migrations/202510201244_01_cirurgias_tabelas.sql`

### 2. `202510201244_02_cirurgias_rls.sql`

**Descrição:** Configurar políticas RLS multi-tenant para Cirurgias

**Caminho:** `supabase/migrations/202510201244_02_cirurgias_rls.sql`

### 3. `202510201244_03_dashboard_views.sql`

**Descrição:** Criar views materializadas e queries otimizadas para Dashboard

**Caminho:** `supabase/migrations/202510201244_03_dashboard_views.sql`

### 4. `202510201244_04_dashboard_functions.sql`

**Descrição:** Criar functions RPC para KPIs e agenda

**Caminho:** `supabase/migrations/202510201244_04_dashboard_functions.sql`

---

## 🚀 Execução

### Opção 1: Supabase CLI (recomendado)

```bash
# Aplicar migrations localmente
supabase db reset

# Ou aplicar apenas as novas migrations
supabase migration up
```

### Opção 2: Script npm

```bash
npm run db:migrate
```

### Opção 3: Dashboard Supabase

1. Acessar: https://app.supabase.com/project/[PROJECT_ID]/editor
2. Executar manualmente cada migration na aba **SQL Editor**

---

## ✅ Validação

Após aplicar as migrations, execute:

```bash
# Reaudidar infraestrutura
npm run infra:audit

# Healthcheck completo
npm run infra:health
```

---

## 📚 Próximos Passos

1. ✅ Aplicar migrations
2. ⚙️ Configurar Storage Buckets (ver plano separado)
3. 🌐 Implementar Edge Functions (ver plano separado)
4. 🔄 Configurar Realtime channels
5. 🧪 Popular dados de demonstração (seeds)
6. 🧪 Executar testes de RLS

---

*Plano gerado automaticamente por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3*
