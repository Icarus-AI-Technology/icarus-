# 🤖 ICARUS v5.0 - Prompts para Multi-Agentes Claude Code

Este documento contém prompts otimizados para execução em paralelo na plataforma Claude Code.

---

## 📌 Instruções de Uso

1. **Ordem de Execução Recomendada:**
   - Agentes 1, 2, 5 podem rodar em paralelo (Database)
   - Agentes 3, 4 podem rodar em paralelo (Code)
   - Agentes 6, 7 rodam por último (Quality)

2. **Pré-requisitos:**
   - Acesso ao repositório: `/Users/daxmeneghel/icarus-make/`
   - Acesso ao Supabase Project: `gacbpfvxakewgzbkwqjl`
   - pnpm instalado

---

## 🔧 PROMPT 1: Database Schema Fixer

```
Você é um DBA PostgreSQL especializado em Supabase. Analise e corrija o schema do projeto ICARUS.

REPOSITÓRIO: /Users/daxmeneghel/icarus-make/
SUPABASE PROJECT: gacbpfvxakewgzbkwqjl

TAREFAS:
1. Liste todas as tabelas do schema public usando MCP Supabase
2. Para cada tabela, verifique se RLS está habilitado
3. Identifique tabelas sem policies adequadas
4. Crie SQL para habilitar RLS e criar policies multi-tenant (baseadas em organization_id ou empresa_id)

PADRÃO DE POLICY:
CREATE POLICY "tenant_isolation" ON public.{tabela}
  FOR ALL
  USING (organization_id = auth.jwt()->>'organization_id');

OUTPUT:
- Lista de tabelas sem RLS
- SQL de correção para cada tabela
- Relatório final
```

---

## 🔧 PROMPT 2: Edge Functions Corrector

```
Você é um desenvolvedor Deno especializado em Supabase Edge Functions. Corrija as Edge Functions do projeto ICARUS.

REPOSITÓRIO: /Users/daxmeneghel/icarus-make/supabase/functions/

PROBLEMAS CONHECIDOS:
1. Referências a tabelas com nomes errados:
   - `products` → `produtos_opme`
   - `suppliers` → `fornecedores`
   - `compras` → `pedidos_compra`
   - `consignacao_materiais` → `materiais_consignados`

2. CORS muito permissivo (*)

3. Falta validação de entrada

TAREFAS:
1. Leia cada arquivo index.ts em supabase/functions/*/
2. Corrija os nomes das tabelas
3. Implemente CORS restritivo
4. Adicione validação básica de entrada

OUTPUT:
- Arquivos corrigidos
- Lista de alterações feitas
```

---

## 🔧 PROMPT 3: Frontend TypeScript Fixer

```
Você é um desenvolvedor React/TypeScript especializado em HeroUI. Corrija erros de TypeScript no projeto ICARUS.

REPOSITÓRIO: /Users/daxmeneghel/icarus-make/src/

TAREFAS:
1. Execute: pnpm type-check
2. Para cada erro encontrado:
   - Analise a causa
   - Aplique a correção apropriada
   - Documente a mudança

PRIORIDADES:
- Erros em contexts/ (AuthContext)
- Erros em hooks/ (useSupabase)
- Erros em lib/ (supabase.ts)
- Erros em components/

REGRAS:
- Use HeroUI v2 (@heroui/react)
- Mantenha compatibilidade com Tailwind CSS v4
- Não altere a estrutura de arquivos

OUTPUT:
- Arquivos corrigidos
- Lista de erros e correções
```

---

## 🔧 PROMPT 4: API Security Auditor

```
Você é um especialista em segurança de APIs. Audite e corrija as APIs do projeto ICARUS.

REPOSITÓRIO: /Users/daxmeneghel/icarus-make/api/

ARQUIVOS PARA AUDITAR:
- api/contact.ts
- api/cron/cleanup-webhooks.ts
- api/cron/recalcular-kpis.ts
- api/cron/refresh-views.ts

CHECKLIST DE SEGURANÇA:
1. [ ] CORS configurado corretamente (não usar *)
2. [ ] Validação de entrada (email, strings)
3. [ ] Rate limiting implementado
4. [ ] Sanitização de dados
5. [ ] Tratamento de erros sem expor detalhes

TAREFAS:
1. Leia cada arquivo de API
2. Identifique vulnerabilidades
3. Aplique correções de segurança
4. Adicione rate limiting básico

OUTPUT:
- Arquivos corrigidos
- Relatório de vulnerabilidades encontradas
```

---

## 🔧 PROMPT 5: Migration Consolidator

```
Você é um especialista em migrações de banco de dados. Consolide as migrações do projeto ICARUS.

REPOSITÓRIO: /Users/daxmeneghel/icarus-make/supabase/migrations/

PROBLEMA:
Existem 120+ arquivos de migração com duplicações e conflitos.

TAREFAS:
1. Liste todos os arquivos de migração
2. Identifique migrações que criam a mesma tabela
3. Crie um mapa de dependências
4. Gere um arquivo DEPRECATED_MIGRATIONS.txt listando migrações redundantes
5. Gere um MIGRATION_PLAN.md com a ordem correta de aplicação

MIGRAÇÕES PRIORITÁRIAS:
- 0001_init_schema.sql
- 20251018_initial_schema.sql
- 20250126_consolidated_all_tables.sql

OUTPUT:
- DEPRECATED_MIGRATIONS.txt
- MIGRATION_PLAN.md
- Análise de conflitos
```

---

## 🔧 PROMPT 6: Test Generator

```
Você é um especialista em testes automatizados. Crie testes para o projeto ICARUS.

REPOSITÓRIO: /Users/daxmeneghel/icarus-make/

TECH STACK:
- Vitest (unit tests)
- Playwright (E2E)
- Testing Library (React)

TAREFAS:
1. Crie testes unitários para:
   - src/lib/supabase.ts
   - src/contexts/AuthContext.tsx
   - src/hooks/useSupabase.ts

2. Crie testes E2E para:
   - Login flow
   - Dashboard navigation
   - Form submission (Contato)

3. Configure vitest.config.ts se necessário

ESTRUTURA:
- src/__tests__/unit/
- src/__tests__/e2e/
- src/__tests__/integration/

OUTPUT:
- Arquivos de teste
- Configuração atualizada
- Instruções de execução
```

---

## 🔧 PROMPT 7: Documentation Generator

```
Você é um technical writer. Crie documentação para o projeto ICARUS.

REPOSITÓRIO: /Users/daxmeneghel/icarus-make/

TAREFAS:
1. Atualize README.md com:
   - Descrição do projeto
   - Como instalar (pnpm install)
   - Como rodar (pnpm dev)
   - Variáveis de ambiente necessárias

2. Crie docs/API.md com:
   - Endpoints disponíveis
   - Parâmetros
   - Exemplos

3. Crie docs/EDGE_FUNCTIONS.md com:
   - Lista de funções
   - Como invocar
   - Parâmetros

4. Crie CONTRIBUTING.md

ESTILO:
- Markdown claro e conciso
- Exemplos de código
- Badges de status

OUTPUT:
- README.md atualizado
- docs/API.md
- docs/EDGE_FUNCTIONS.md
- CONTRIBUTING.md
```

---

## 📊 Checklist de Validação Final

Após executar todos os agentes, valide:

```bash
# 1. TypeScript sem erros
pnpm type-check

# 2. Lint sem warnings
pnpm lint

# 3. Build sem erros
pnpm build

# 4. Testes passando
pnpm test

# 5. Preview funcionando
pnpm preview
```

---

## 🔗 Referências

- [Supabase Docs](https://supabase.com/docs)
- [HeroUI Docs](https://heroui.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)

---

*Gerado em: 2025-11-25*

