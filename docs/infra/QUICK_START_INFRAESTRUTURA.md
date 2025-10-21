# 🚀 Quick Start - AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

**ICARUS v5.0 - Infraestrutura Backend**

---

## ⚡ Comandos Rápidos

### Auditoria e Planejamento

```bash
# Auditar infraestrutura
npm run infra:audit

# Gerar migrations
npm run infra:plan

# Verificar saúde dos serviços
npm run infra:health

# Guia de aplicação
npm run infra:apply
```

### Supabase Local (Docker)

```bash
# Iniciar Supabase localmente
supabase start

# Aplicar todas as migrations
supabase db reset

# Ver status das migrations
supabase migration list

# Gerar tipos TypeScript
npm run db:gen:types

# Parar Supabase
supabase stop
```

### Supabase Remoto (Produção/Staging)

```bash
# Conectar ao projeto remoto
supabase link --project-ref [PROJECT_REF]

# Aplicar migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy

# Ver logs de Edge Functions
supabase functions logs [FUNCTION_NAME]
```

### Previews Automáticos

```bash
# Iniciar preview + capturas automáticas (PM2)
npm run preview:setup

# Ver logs
npm run preview:logs
npm run preview:logs:server

# Monitorar processos
npm run preview:monit

# Parar previews
npm run preview:stop

# Reiniciar previews
npm run preview:restart
```

---

## 📝 Setup Inicial (Primeira Vez)

### 1. Criar Projeto Supabase

1. Acessar: https://supabase.com
2. Criar novo projeto
3. Aguardar provisionamento (~2min)

### 2. Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Meilisearch (Opcional)
VITE_MEILISEARCH_HOST=http://localhost:7700
VITE_MEILISEARCH_ADMIN_KEY=masterKey

# Preview
ICARUS_WEB_URL=http://localhost:4173
PREVIEW_URL=http://localhost:4173
```

**Obter chaves:**
- Dashboard → Settings → API
- Copiar: `Project URL`, `anon/public key`, `service_role key`

### 3. Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux/WSL
brew install supabase/tap/supabase
```

### 4. Aplicar Migrations

**Opção A: Local (Docker)**
```bash
supabase start
supabase db reset
```

**Opção B: Remoto**
```bash
supabase link --project-ref [PROJECT_REF]
supabase db push
```

### 5. Deploy Edge Functions

```bash
supabase functions deploy valida_crm_cfm
supabase functions deploy consulta_anvisa_produto
supabase functions deploy recalcular_kpis

# Ou todas de uma vez
supabase functions deploy
```

### 6. Validar Setup

```bash
# Reaudidar (deve mostrar 90%+ conformidade)
npm run infra:audit

# Healthcheck (deve mostrar OK para Supabase)
npm run infra:health

# Gerar tipos TypeScript
npm run db:gen:types
```

---

## 🧪 Testar Localmente

### 1. Iniciar Ambiente

```bash
# Terminal 1: Supabase
supabase start

# Terminal 2: Frontend (dev)
npm run dev

# Terminal 3: Preview + Capturas (opcional)
npm run preview:setup
```

### 2. Acessar

- Frontend Dev: http://localhost:3000
- Preview: http://localhost:4173
- Supabase Studio: http://localhost:54323

### 3. Testar Edge Functions

```bash
# Via curl
curl -X POST 'http://localhost:54321/functions/v1/valida_crm_cfm' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"crm":"123456","uf":"SP"}'

# Ou via Postman/Insomnia
```

---

## 📦 Estrutura de Migrations

```
supabase/migrations/
├── 202510201244_01_cirurgias_tabelas.sql      # Tabelas + enums + triggers
├── 202510201244_02_cirurgias_rls.sql          # Políticas RLS
├── 202510201244_03_dashboard_views.sql        # Views materializadas
├── 202510201244_04_dashboard_functions.sql    # Functions RPC
├── 202510201245_05_indices_performance.sql    # Índices estratégicos
├── 202510201246_06_seeds_demo.sql             # Dados de demonstração
└── 202510201247_07_storage_config.sql         # Storage buckets + policies
```

---

## 🌐 Edge Functions

```
supabase/functions/
├── valida_crm_cfm/
│   └── index.ts              # Validação CFM com cache
├── consulta_anvisa_produto/
│   └── index.ts              # Consulta ANVISA com cache
└── recalcular_kpis/
    └── index.ts              # Refresh de views materializadas
```

---

## 📊 Dashboards

### Supabase Studio (Local)

http://localhost:54323

- **Table Editor:** Ver/editar dados
- **SQL Editor:** Executar queries
- **Database:** Ver schema
- **API:** Testar endpoints
- **Functions:** Ver Edge Functions
- **Storage:** Gerenciar arquivos

### Supabase Dashboard (Remoto)

https://app.supabase.com/project/[PROJECT_ID]

- **Database → Tables:** Gerenciar tabelas
- **Database → Replication:** Habilitar Realtime
- **Storage:** Criar buckets
- **Edge Functions:** Deploy/logs
- **SQL Editor:** Executar queries

---

## 🔄 Workflow de Desenvolvimento

### 1. Fazer Alterações no Schema

```bash
# Editar migrations existentes ou criar nova
supabase migration new [nome_descritivo]

# Aplicar localmente
supabase db reset

# Testar
npm run infra:audit
```

### 2. Gerar Tipos TypeScript

```bash
npm run db:gen:types
# Atualiza: src/types/database.types.ts
```

### 3. Commitar

```bash
git add supabase/migrations/
git add src/types/database.types.ts
git commit -m "feat(db): adicionar [descrição]"
```

### 4. Deploy para Staging/Production

```bash
# Conectar ao projeto
supabase link --project-ref [PROJECT_REF]

# Aplicar migrations
supabase db push

# Deploy functions
supabase functions deploy
```

---

## 🧹 Limpeza/Reset

### Reset Local (Desenvolvimento)

```bash
# Reset completo (apaga tudo e reaplicar migrations)
supabase db reset

# Parar Supabase
supabase stop

# Limpar volumes Docker
supabase stop --no-backup
```

### Reset Remoto (⚠️ CUIDADO!)

**NÃO recomendado para produção!**

```bash
# Backup antes de qualquer coisa
supabase db dump -f backup.sql

# Via Dashboard: Project Settings → General → Reset Database
```

---

## 🐛 Troubleshooting

### Erro: "Migration already applied"

```bash
supabase migration list
# Se necessário, reset
supabase db reset
```

### Erro: "Docker not running"

```bash
# Iniciar Docker Desktop
# Ou instalar: https://docs.docker.com/get-docker/
```

### Erro: "Project not linked"

```bash
supabase link --project-ref [PROJECT_REF]
# Obter PROJECT_REF em: Dashboard → Settings → General
```

### Erro: Edge Function não responde

```bash
# Ver logs
supabase functions logs [FUNCTION_NAME]

# Redeployar
supabase functions deploy [FUNCTION_NAME] --no-verify-jwt
```

### Erro: RLS bloqueia queries

```bash
# Temporariamente desabilitar (desenvolvimento)
ALTER TABLE [tabela] DISABLE ROW LEVEL SECURITY;

# Lembrar de reabilitar
ALTER TABLE [tabela] ENABLE ROW LEVEL SECURITY;
```

---

## 📚 Recursos Úteis

### Documentação

- **Supabase:** https://supabase.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Deno (Edge Functions):** https://deno.land/manual

### Comandos de Referência

```bash
# Supabase CLI help
supabase --help
supabase db --help
supabase functions --help
supabase migration --help

# Ver versão
supabase --version

# Atualizar CLI
brew upgrade supabase
```

---

## 🎯 Próximos Passos

1. ✅ **Configurar `.env`** com chaves Supabase
2. ✅ **Aplicar migrations** (`supabase db reset` ou `supabase db push`)
3. ✅ **Deploy Edge Functions** (`supabase functions deploy`)
4. ✅ **Validar** (`npm run infra:audit && npm run infra:health`)
5. ⚙️ **Configurar Realtime** (Dashboard → Replication)
6. ⚙️ **Configurar Cron** (webhook para `recalcular_kpis`)
7. 🧪 **Testar** com dados de demonstração
8. 🚀 **Integrar com Frontend**

---

**Desenvolvido por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**  
**ICARUS v5.0**  
**2025-10-20**

