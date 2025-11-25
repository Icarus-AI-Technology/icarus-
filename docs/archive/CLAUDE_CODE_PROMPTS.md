# Prompts para Multi-Agentes Claude Code - Icarus v6.0

Este documento contém prompts otimizados para execução no Claude Code para corrigir todos os problemas identificados na auditoria do projeto Icarus.

---

## 🔴 PROMPT 1: Frontend TypeScript Fixer (PRIORIDADE CRÍTICA)

```markdown
# Tarefa: Corrigir Erros TypeScript no Frontend Icarus

## Contexto do Projeto
- **Framework:** React 18 + Vite 5
- **UI Library:** HeroUI v2 (importar de "@heroui/react")
- **Styling:** Tailwind CSS v4
- **Package Manager:** pnpm
- **Path Alias:** @/ aponta para src/

## Instruções

Execute `pnpm type-check` para ver os erros atuais.

### Correções Necessárias por Arquivo:

#### 1. src/components/cadastros/DocumentosUpload.tsx
**Erro:** Variável 'processarArquivos' usada antes da declaração
**Solução:** Mover a declaração da função para antes do useEffect que a utiliza.

#### 2. src/components/modules/FaturamentoNFeCompleto.tsx
**Erro:** Cannot find name 'supabase'
**Solução:** Adicionar import: `import { supabase } from '@/lib/supabase';`

#### 3. src/components/modules/IntegrationsManager.tsx
**Erros:**
- Property 'onCheckedChange' does not exist on Switch
- Property 'icon' does not exist on Input
**Solução:** 
- Switch: usar `onChange` em vez de `onCheckedChange`
- Input: usar `startContent` em vez de `icon`

#### 4. src/components/modules/LicitacoesPropostas.tsx
**Erro:** Variável 'carregarDados' usada antes da declaração
**Solução:** Mover a declaração da função para antes do useEffect.

#### 5. src/components/modules/Microsoft365IntegrationPanel.tsx
**Erro:** Variável 'carregarProximasReunioes' usada antes da declaração
**Solução:** Mover a declaração da função para antes do useEffect.

#### 6. Múltiplos arquivos - React não utilizado
**Arquivos:**
- CampanhasMarketing.tsx
- IntegrationsManager.tsx
- KPIDashboardConsolidado.tsx
- LicitacoesPropostas.tsx
- RHGestaoPessoas.tsx
- SystemHealthDashboard.tsx
- TooltipAnalyticsDashboard.tsx
- VideoCallsManager.tsx
- VoiceAnalyticsDashboard.tsx
- VoiceBiometricsManager.tsx
- VoiceCommandsManager.tsx
- VoiceMacrosManager.tsx
- WorkflowBuilderVisual.tsx

**Solução:** Remover `import React from 'react';` destes arquivos.

#### 7. src/components/modules/GestaoContabil.tsx
**Erro:** Table component missing required props
**Solução:** Usar a sintaxe correta do HeroUI Table:
```tsx
<Table aria-label="Tabela" data={dados} columns={colunas}>
  {/* ou usar TableHeader/TableBody/TableRow/TableCell */}
</Table>
```

#### 8. Parâmetros com tipo 'any' implícito
**Arquivos:** FaturamentoNFeCompleto.tsx, IntegrationsManager.tsx
**Solução:** Adicionar tipos explícitos aos parâmetros de funções.

### Validação
Após as correções, execute:
```bash
pnpm type-check
pnpm build
```

Todos os comandos devem completar sem erros.
```

---

## 🟠 PROMPT 2: Database Security Views Fixer (PRIORIDADE ALTA)

```markdown
# Tarefa: Corrigir Views com SECURITY DEFINER no Supabase

## Contexto
- **Projeto Supabase ID:** gvbkviozlhxorjoavmky
- **Problema:** 26 views definidas com SECURITY DEFINER precisam ser convertidas para SECURITY INVOKER

## Processo de Correção

### Passo 1: Consultar definição da view
Use o MCP Supabase para consultar cada view:

```sql
SELECT viewname, definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'NOME_DA_VIEW';
```

### Passo 2: Identificar colunas corretas
Antes de recriar, verifique as colunas das tabelas referenciadas:

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'NOME_TABELA';
```

### Passo 3: Aplicar migração
Use apply_migration com a seguinte estrutura:

```sql
DROP VIEW IF EXISTS public.NOME_VIEW;

CREATE OR REPLACE VIEW public.NOME_VIEW
WITH (security_invoker = true)
AS
-- definição da view aqui
;

COMMENT ON VIEW public.NOME_VIEW IS 'Converted from SECURITY DEFINER to SECURITY INVOKER';
```

## Lista de Views para Corrigir

1. vw_estatisticas_auditorias
2. vw_active_sessions
3. vw_slow_queries
4. vw_consignacao_por_hospital
5. monitor_table_bloat
6. vw_cirurgias_segura
7. vw_materiais_criticos_consignacao
8. view_crm_pipeline_resumo
9. vw_estatisticas_emails_30d
10. vw_licitacoes_ativas
11. vw_treinamentos_vencendo
12. vw_user_permissions
13. view_contratos_kpis
14. vw_propostas_pendentes
15. vw_score_abbott
16. vw_razao_contabil
17. view_empresas_sem_dpo
18. view_medicos_stats
19. vw_workflows_ativos
20. vw_balancete
21. view_contratos_alertas
22. view_dashboard_financeiro
23. api_credentials_list
24. vw_proximas_reunioes_teams
25. v_empresa_ui_configs
26. view_crm_funil

## Validação
Após cada migração, verifique:

```sql
SELECT 
    c.relname as view_name,
    array_to_string(c.reloptions, ',') as options
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'v'
AND c.relname = 'NOME_VIEW';
```

A coluna `options` deve mostrar `security_invoker=true`.
```

---

## 🟡 PROMPT 3: Function Search Path Fixer (PRIORIDADE MÉDIA)

```markdown
# Tarefa: Corrigir Funções com search_path Mutável

## Contexto
- **Projeto Supabase ID:** gvbkviozlhxorjoavmky
- **Problema:** 150+ funções têm search_path mutável, o que é um risco de segurança

## Processo de Correção

### Passo 1: Listar funções afetadas
```sql
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND NOT EXISTS (
    SELECT 1 FROM pg_proc_info(p.oid) 
    WHERE option_name = 'search_path'
)
LIMIT 20;
```

### Passo 2: Para cada função, recriar com search_path fixo

Exemplo de correção:

```sql
-- Antes
CREATE OR REPLACE FUNCTION public.minha_funcao()
RETURNS void AS $$
BEGIN
  -- código
END;
$$ LANGUAGE plpgsql;

-- Depois
CREATE OR REPLACE FUNCTION public.minha_funcao()
RETURNS void AS $$
BEGIN
  -- código
END;
$$ LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public;
```

### Passo 3: Aplicar em lotes
Agrupe funções similares em uma única migração:

```sql
-- Migration: fix_function_search_path_batch_1

CREATE OR REPLACE FUNCTION public.funcao1()
RETURNS ... AS $$ ... $$ 
LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.funcao2()
RETURNS ... AS $$ ... $$ 
LANGUAGE plpgsql SET search_path = public;

-- etc.
```

## Funções Prioritárias (usadas frequentemente)

1. validar_login
2. usuario_tem_permissao
3. current_empresa
4. current_perfil
5. is_admin
6. user_has_permission
7. log_activity
8. log_audit
9. trigger_set_timestamp
10. atualizar_updated_at

## Validação
Execute o advisor de segurança após as correções:
```
mcp_supabase_get_advisors com type: "security"
```

O número de warnings sobre search_path deve diminuir.
```

---

## 🟢 PROMPT 4: API Security Auditor (PRIORIDADE NORMAL)

```markdown
# Tarefa: Auditar e Melhorar Segurança das APIs

## Contexto
- **APIs Vercel:** api/contact.ts
- **Edge Functions Supabase:** supabase/functions/*

## Checklist de Segurança

### 1. api/contact.ts - Melhorias Necessárias

#### Rate Limiting
Adicionar rate limiting usando headers ou Vercel KV:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

// No handler
const { success } = await ratelimit.limit(ip);
if (!success) {
  return new Response('Too many requests', { status: 429 });
}
```

#### Validação de Input
Usar Zod para validação:

```typescript
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

// No handler
const result = ContactSchema.safeParse(body);
if (!result.success) {
  return new Response(JSON.stringify({ error: result.error }), { status: 400 });
}
```

#### Headers de Segurança
```typescript
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};
```

### 2. Edge Functions Supabase - Verificações

#### Autenticação JWT
Todas as Edge Functions já verificam JWT, mas confirmar:

```typescript
const { data: { user }, error } = await supabaseClient.auth.getUser();
if (!user) {
  throw new Error('Unauthorized');
}
```

#### Tratamento de Erros
Não expor detalhes internos em produção:

```typescript
catch (error) {
  console.error('[Function] Error:', error);
  return new Response(
    JSON.stringify({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
    }),
    { status: 500 }
  );
}
```

### 3. Ativar Leaked Password Protection

No dashboard do Supabase:
1. Ir para Authentication > Settings
2. Ativar "Leaked Password Protection"

## Validação
Após as correções:
1. Testar cada endpoint manualmente
2. Verificar logs de erro
3. Executar `mcp_supabase_get_advisors` para confirmar melhorias
```

---

## 🔵 PROMPT 5: Extensões - Mover do Schema Public (OPCIONAL)

```markdown
# Tarefa: Mover Extensões do Schema Public

## Contexto
As seguintes extensões estão no schema public e devem ser movidas para um schema dedicado:
- pg_trgm
- vector
- unaccent
- btree_gin
- btree_gist

## Processo

### Passo 1: Criar schema para extensões
```sql
CREATE SCHEMA IF NOT EXISTS extensions;
```

### Passo 2: Mover cada extensão
```sql
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
ALTER EXTENSION vector SET SCHEMA extensions;
ALTER EXTENSION unaccent SET SCHEMA extensions;
ALTER EXTENSION btree_gin SET SCHEMA extensions;
ALTER EXTENSION btree_gist SET SCHEMA extensions;
```

### Passo 3: Atualizar search_path
Adicionar 'extensions' ao search_path das funções que usam essas extensões.

## ⚠️ Atenção
Esta mudança pode quebrar funcionalidades existentes. Testar extensivamente antes de aplicar em produção.
```

---

## Ordem de Execução Recomendada

1. **PROMPT 1** - Frontend TypeScript (impacto imediato no build)
2. **PROMPT 2** - Security Views (segurança crítica)
3. **PROMPT 3** - Function Search Path (segurança)
4. **PROMPT 4** - API Security (hardening)
5. **PROMPT 5** - Extensões (opcional, risco de breaking changes)

---

## Validação Final

Após executar todos os prompts, validar:

```bash
# Frontend
cd /Users/daxmeneghel/icarus-make
pnpm type-check
pnpm build

# Database (via MCP)
mcp_supabase_get_advisors type="security"
mcp_supabase_get_advisors type="performance"
```

**Critérios de Sucesso:**
- ✅ `pnpm type-check` sem erros
- ✅ `pnpm build` completa com sucesso
- ✅ Advisors de segurança com menos de 50 warnings
- ✅ Nenhum erro crítico (ERROR level) nos advisors

