# 🔍 ICARUS v5.0 - Relatório Completo de Auditoria

**Data:** 2025-11-25
**Repositório:** `/Users/daxmeneghel/icarus-make/`
**Projeto Supabase:** `gacbpfvxakewgzbkwqjl`

---

## 📊 Resumo Executivo

O projeto ICARUS é um **ERP/CRM médico completo** para gestão de OPME (Órteses, Próteses e Materiais Especiais) com forte integração de IA. O sistema está bem estruturado, mas requer correções em várias áreas.

### Estatísticas do Projeto

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| Tabelas no Banco | 200+ | ⚠️ Necessita revisão RLS |
| Edge Functions | 26 | ✅ Funcionais |
| Migrações SQL | 120+ | ⚠️ Duplicações detectadas |
| Componentes React | 150+ | ✅ Bem estruturados |
| Rotas Frontend | 200+ | ✅ Funcionais |
| Módulos Lazy-loaded | 100+ | ✅ Otimizados |

---

## 🏗️ Arquitetura Atual

### Tech Stack
- **Frontend:** React 18 + Vite + TypeScript
- **UI Library:** HeroUI v2 (formerly NextUI)
- **Styling:** Tailwind CSS v4 (sem `tailwind.config.js`)
- **State:** Zustand + React Context
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **Monitoramento:** Sentry + Vercel Analytics
- **Package Manager:** pnpm

### Estrutura de Diretórios
```
icarus-make/
├── api/                    # Vercel Serverless Functions
├── src/
│   ├── components/        # Componentes React (150+)
│   │   ├── layout/        # Layouts (Sidebar, Topbar)
│   │   ├── modules/       # Módulos de negócio (80+)
│   │   ├── oraclusx-ds/   # Design System
│   │   └── ui/            # Componentes base
│   ├── contexts/          # React Contexts (Auth, Theme)
│   ├── features/          # Feature modules (compras)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários (supabase, sentry)
│   ├── modulos/           # Módulos standalone
│   └── pages/             # Páginas (70+)
├── supabase/
│   ├── functions/         # 26 Edge Functions
│   └── migrations/        # 120+ SQL migrations
└── docs/                  # Documentação
```

---

## ⚠️ Problemas Identificados

### 1. 🔴 CRÍTICO - Migrações SQL Duplicadas/Conflitantes

**Problema:** Existem múltiplas migrações criando as mesmas tabelas com nomes diferentes ou estruturas inconsistentes.

**Arquivos afetados:**
- `20251018_initial_schema.sql` vs `0001_init_schema.sql`
- `20251019_compliance_auditoria_completo.sql` vs `202510201320_fase3_parte1_compliance.sql`
- Múltiplas versões de `supply_alignment` (v2, v3, v4)

**Impacto:** Possíveis erros ao aplicar migrações em ambiente limpo.

### 2. 🟡 MÉDIO - RLS Policies Incompletas

**Problema:** Algumas tabelas críticas podem não ter RLS habilitado ou policies adequadas.

**Tabelas a verificar:**
- `agent_tasks`
- `agent_logs`
- `agent_reports`
- `ml_vectors`
- `api_credentials`

### 3. 🟡 MÉDIO - Edge Functions sem CORS padronizado

**Problema:** Algumas Edge Functions usam `Access-Control-Allow-Origin: "*"` (muito permissivo).

**Funções afetadas:**
- `orchestrator`
- `agent-compliance`
- `agent-erp`
- `agent-synthesis`
- `agent-benchmark`

### 4. 🟡 MÉDIO - Referências a Tabelas Inexistentes

**Problema:** Edge Functions referenciam tabelas que podem não existir:
- `products` (deveria ser `produtos` ou `produtos_opme`)
- `suppliers` (deveria ser `fornecedores`)
- `consignacao_materiais` (verificar nome correto)
- `anvisa_validations` (não encontrada)
- `iot_devices` / `iot_readings` (não encontradas)
- `blockchain_transactions` (não encontrada)
- `compras` (deveria ser `pedidos_compra`)

### 5. 🟢 BAIXO - Inconsistência de Nomenclatura

**Problema:** Mix de português e inglês nos nomes de tabelas e colunas.

**Exemplos:**
- `produtos_opme` vs `products`
- `fornecedores` vs `suppliers`
- `cirurgias` vs `surgeries`

### 6. 🟢 BAIXO - Código Morto/Comentado

**Problema:** Existem TODOs e código comentado em várias Edge Functions.

---

## ✅ Pontos Positivos

1. **Arquitetura bem planejada** - Separação clara de responsabilidades
2. **Sistema de Agentes IA robusto** - Orchestrator, Compliance, ERP, Synthesis, Benchmark
3. **Multi-tenancy implementado** - Via `organization_id` e RLS
4. **Lazy loading otimizado** - Código-splitting extensivo
5. **Design System consistente** - OraclusX Dark Glass
6. **Integração Supabase completa** - Auth, DB, Storage, Realtime, Edge Functions
7. **Monitoramento ativo** - Sentry + Vercel Analytics

---

## 📋 Plano de Correções

### Fase 1: Banco de Dados (Prioridade Alta)
1. Consolidar migrações duplicadas
2. Verificar e habilitar RLS em todas as tabelas
3. Criar índices faltantes para performance
4. Padronizar nomenclatura (português)
5. Criar tabelas faltantes referenciadas pelas Edge Functions

### Fase 2: Edge Functions (Prioridade Alta)
1. Corrigir referências a tabelas
2. Padronizar CORS headers
3. Implementar rate limiting
4. Adicionar validação de entrada
5. Melhorar tratamento de erros

### Fase 3: Frontend (Prioridade Média)
1. Revisar componentes com erros de TypeScript
2. Atualizar imports deprecated
3. Otimizar bundle size
4. Implementar testes E2E

### Fase 4: Documentação (Prioridade Baixa)
1. Documentar API das Edge Functions
2. Criar guia de contribuição
3. Atualizar README principal

---

## 🤖 PROMPTS PARA MULTI-AGENTES CLAUDE CODE

Os prompts abaixo devem ser usados para criar agentes especializados na plataforma Claude Code para correção automatizada do projeto.

---

### AGENTE 1: Database Schema Auditor

```markdown
# Agente: Database Schema Auditor

## Contexto
Você é um especialista em PostgreSQL e Supabase. Sua missão é auditar e corrigir o schema do banco de dados do projeto ICARUS.

## Repositório
- Path: /Users/daxmeneghel/icarus-make/
- Supabase Project ID: gacbpfvxakewgzbkwqjl

## Tarefas

### 1. Consolidar Migrações
- Analise todos os arquivos em `supabase/migrations/`
- Identifique migrações duplicadas ou conflitantes
- Crie um arquivo `CONSOLIDATED_SCHEMA.sql` com o schema final limpo
- Documente quais migrações podem ser removidas

### 2. Verificar RLS
Para cada tabela no schema `public`:
- Verifique se RLS está habilitado
- Verifique se existem policies adequadas
- Crie policies faltantes seguindo o padrão multi-tenant (organization_id)

### 3. Criar Tabelas Faltantes
As seguintes tabelas são referenciadas mas podem não existir:
- `anvisa_validations`
- `iot_devices`
- `iot_readings`
- `blockchain_transactions`

### 4. Padronizar Nomenclatura
- Todas as tabelas devem usar português (ex: `produtos`, não `products`)
- Crie views de compatibilidade se necessário

## Output Esperado
- Lista de problemas encontrados
- SQL de correção para cada problema
- Relatório de RLS policies
```

---

### AGENTE 2: Edge Functions Fixer

```markdown
# Agente: Edge Functions Fixer

## Contexto
Você é um especialista em Deno e Supabase Edge Functions. Sua missão é corrigir e otimizar as Edge Functions do projeto ICARUS.

## Repositório
- Path: /Users/daxmeneghel/icarus-make/supabase/functions/

## Tarefas

### 1. Corrigir Referências a Tabelas
Atualize as seguintes Edge Functions para usar os nomes corretos de tabelas:

| Edge Function | Tabela Errada | Tabela Correta |
|---------------|---------------|----------------|
| agent-compliance | `products` | `produtos_opme` |
| agent-erp | `consignacao_materiais` | `materiais_consignados` |
| agent-benchmark | `suppliers` | `fornecedores` |
| agent-benchmark | `compras` | `pedidos_compra` |

### 2. Padronizar CORS
Substitua:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  ...
};
```

Por:
```typescript
const ALLOWED_ORIGINS = [
  'https://icarus.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}
```

### 3. Adicionar Validação de Entrada
Para cada Edge Function, adicione validação usando Zod:
```typescript
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RequestSchema = z.object({
  task_id: z.string().uuid(),
  parameters: z.object({...}).optional(),
});
```

### 4. Melhorar Tratamento de Erros
Implemente um error handler padronizado:
```typescript
function handleError(error: unknown, taskId?: string) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[Error] ${taskId || 'unknown'}: ${message}`);
  
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status: 500, headers: corsHeaders }
  );
}
```

## Output Esperado
- Arquivos corrigidos para cada Edge Function
- Testes básicos para cada função
```

---

### AGENTE 3: Frontend Component Auditor

```markdown
# Agente: Frontend Component Auditor

## Contexto
Você é um especialista em React, TypeScript e HeroUI. Sua missão é auditar e corrigir os componentes do frontend do projeto ICARUS.

## Repositório
- Path: /Users/daxmeneghel/icarus-make/src/

## Tech Stack
- React 18 + TypeScript
- HeroUI v2 (@heroui/react)
- Tailwind CSS v4
- Framer Motion
- Recharts
- Lucide Icons

## Tarefas

### 1. Verificar Erros de TypeScript
Execute `pnpm type-check` e corrija todos os erros encontrados.

### 2. Atualizar Imports Deprecated
Verifique se há imports deprecated e atualize:
- `@nextui-org/react` → `@heroui/react`
- Componentes removidos ou renomeados

### 3. Revisar Componentes Críticos
Analise os seguintes componentes por problemas:
- `src/components/layout/IcarusSidebar.tsx`
- `src/components/layout/IcarusTopbar.tsx`
- `src/components/oraclusx-ds/ChatbotWithResearch.tsx`
- `src/contexts/AuthContext.tsx`

### 4. Otimizar Bundle Size
- Identifique componentes muito grandes (>50KB)
- Sugira code-splitting adicional
- Verifique imports desnecessários

### 5. Verificar Acessibilidade
Para cada componente:
- Verifique se há labels em inputs
- Verifique contraste de cores
- Verifique navegação por teclado

## Output Esperado
- Lista de erros TypeScript com correções
- Componentes otimizados
- Relatório de acessibilidade
```

---

### AGENTE 4: API & Backend Auditor

```markdown
# Agente: API & Backend Auditor

## Contexto
Você é um especialista em APIs serverless e Vercel. Sua missão é auditar e corrigir as APIs do projeto ICARUS.

## Repositório
- Path: /Users/daxmeneghel/icarus-make/api/

## Tarefas

### 1. Auditar Endpoints Existentes
Analise cada arquivo em `api/`:
- `contact.ts` - Formulário de contato
- `cron/cleanup-webhooks.ts` - Limpeza de webhooks
- `cron/recalcular-kpis.ts` - Recálculo de KPIs
- `cron/refresh-views.ts` - Atualização de views

### 2. Verificar Segurança
Para cada endpoint:
- Verificar validação de entrada
- Verificar autenticação/autorização
- Verificar rate limiting
- Verificar sanitização de dados

### 3. Corrigir Problemas no contact.ts
O arquivo atual tem:
- CORS muito permissivo (`*`)
- Sem rate limiting
- Sem proteção contra spam

### 4. Implementar Cron Jobs Faltantes
Verificar se os cron jobs estão configurados corretamente no `vercel.json`.

### 5. Documentar API
Criar documentação OpenAPI/Swagger para todos os endpoints.

## Output Esperado
- Endpoints corrigidos
- Configuração de rate limiting
- Documentação OpenAPI
```

---

### AGENTE 5: Migration Consolidator

```markdown
# Agente: Migration Consolidator

## Contexto
Você é um especialista em migrações de banco de dados. Sua missão é consolidar e limpar as migrações do projeto ICARUS.

## Repositório
- Path: /Users/daxmeneghel/icarus-make/supabase/migrations/

## Tarefas

### 1. Mapear Dependências
Crie um grafo de dependências entre as migrações:
- Quais tabelas cada migração cria
- Quais tabelas cada migração altera
- Quais foreign keys são criadas

### 2. Identificar Conflitos
Encontre:
- Migrações que criam a mesma tabela
- Migrações com ALTER TABLE conflitantes
- Migrações que referenciam tabelas inexistentes

### 3. Criar Schema Consolidado
Gere um único arquivo SQL que:
- Cria todas as tabelas na ordem correta
- Aplica todos os índices
- Configura todas as RLS policies
- Cria todas as functions e triggers

### 4. Criar Plano de Migração
Documente:
- Quais migrações podem ser removidas
- Ordem correta de aplicação
- Rollback plan

## Migrações Prioritárias para Análise
1. `0001_init_schema.sql`
2. `20251018_initial_schema.sql`
3. `20250126_consolidated_all_tables.sql`
4. `202510201300_fase1_10tabelas_criticas.sql`

## Output Esperado
- `CONSOLIDATED_SCHEMA.sql` - Schema completo
- `MIGRATION_PLAN.md` - Plano de migração
- `DEPRECATED_MIGRATIONS.txt` - Lista de migrações a remover
```

---

### AGENTE 6: Test Coverage Agent

```markdown
# Agente: Test Coverage Agent

## Contexto
Você é um especialista em testes automatizados. Sua missão é criar testes para o projeto ICARUS.

## Repositório
- Path: /Users/daxmeneghel/icarus-make/

## Tech Stack de Testes
- Vitest (unit tests)
- Playwright (E2E tests)
- Testing Library (React components)

## Tarefas

### 1. Criar Testes Unitários
Para os seguintes módulos críticos:
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useSupabase.ts`
- `src/hooks/useActivityTracker.ts`

### 2. Criar Testes E2E
Cenários prioritários:
- Login/Logout
- Navegação pelo menu
- CRUD de cadastros (médicos, hospitais, produtos)
- Dashboard principal

### 3. Criar Testes de API
Para cada endpoint em `api/`:
- Testar casos de sucesso
- Testar validação de entrada
- Testar tratamento de erros

### 4. Configurar CI/CD
- Criar workflow GitHub Actions
- Configurar coverage reports
- Configurar testes automatizados em PR

## Output Esperado
- Arquivos de teste em `src/__tests__/`
- Arquivos E2E em `e2e/`
- `.github/workflows/test.yml`
- Coverage report
```

---

### AGENTE 7: Documentation Agent

```markdown
# Agente: Documentation Agent

## Contexto
Você é um especialista em documentação técnica. Sua missão é criar documentação completa para o projeto ICARUS.

## Repositório
- Path: /Users/daxmeneghel/icarus-make/

## Tarefas

### 1. README Principal
Criar/atualizar `README.md` com:
- Descrição do projeto
- Tech stack
- Instruções de instalação
- Variáveis de ambiente necessárias
- Como rodar localmente
- Como fazer deploy

### 2. Documentação de API
Criar `docs/API.md` com:
- Lista de todos os endpoints
- Parâmetros de entrada/saída
- Exemplos de uso
- Códigos de erro

### 3. Documentação de Edge Functions
Criar `docs/EDGE_FUNCTIONS.md` com:
- Descrição de cada função
- Como invocar
- Parâmetros esperados
- Exemplos

### 4. Guia de Contribuição
Criar `CONTRIBUTING.md` com:
- Code style guide
- Git workflow
- Como criar PRs
- Checklist de review

### 5. Documentação do Schema
Criar `docs/DATABASE_SCHEMA.md` com:
- Diagrama ER
- Descrição de cada tabela
- Relacionamentos
- Índices importantes

## Output Esperado
- README.md atualizado
- docs/API.md
- docs/EDGE_FUNCTIONS.md
- docs/DATABASE_SCHEMA.md
- CONTRIBUTING.md
```

---

## 🚀 Como Usar os Agentes

### Opção 1: Claude Code (Recomendado)
1. Acesse a plataforma Claude Code
2. Crie um novo projeto apontando para o repositório
3. Cole o prompt do agente desejado
4. Execute e revise as alterações

### Opção 2: Cursor IDE
1. Abra o projeto no Cursor
2. Use o chat com o prompt do agente
3. Aplique as sugestões incrementalmente

### Opção 3: GitHub Copilot Workspace
1. Crie uma issue com o prompt do agente
2. Use o Copilot Workspace para gerar as correções
3. Revise e faça merge do PR gerado

---

## 📊 Métricas de Sucesso

Após aplicar todas as correções, o projeto deve:

- [ ] Passar em `pnpm type-check` sem erros
- [ ] Passar em `pnpm lint` sem warnings
- [ ] Ter 80%+ de coverage em testes
- [ ] Ter todas as tabelas com RLS habilitado
- [ ] Ter documentação completa
- [ ] Ter CI/CD configurado
- [ ] Ter todas as Edge Functions funcionando

---

## 📝 Notas Finais

Este relatório foi gerado automaticamente como parte da auditoria do projeto ICARUS v5.0. As recomendações são baseadas nas melhores práticas de desenvolvimento e nas especificidades do projeto.

**Próximos Passos:**
1. Revisar este relatório com a equipe
2. Priorizar as correções por impacto
3. Executar os agentes na ordem sugerida
4. Validar cada correção antes de fazer merge
5. Atualizar a documentação conforme as mudanças

---

*Relatório gerado por: Claude Opus 4.5*
*Data: 2025-11-25*

