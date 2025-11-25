# Issues do Dia 2 – Guia Rápido
Atualizado em 2025-11-24 00:40

O roteiro do Dia 2 depende das 6 issues geradas pelo script `scripts/create-github-issues.sh`. Como o repositório `Icarus-AI-Technology/icarus-` ainda não possui os labels usados pelo script, siga os passos abaixo para abrir tudo corretamente.

## 1. Criar/validar labels no GitHub
Crie os seguintes rótulos (Settings → Labels) ou renomeie os existentes para corresponder exatamente aos nomes abaixo:

| Label | Cor sugerida | Uso |
| --- | --- | --- |
| `ci` | `#0ea5e9` | Automação/Workflows |
| `infra` | `#fbbf24` | Infraestrutura |
| `quality` | `#f472b6` | Qualidade/Testes |
| `planning` | `#a855f7` | Planejamento |
| `product` | `#14b8a6` | Produto/Stakeholders |
| `backend` | `#f87171` | Backend/API |
| `dashboard` | `#22d3ee` | Painéis/KPIs |
| `ai` | `#facc15` | IA/LLM |
| `edge-functions` | `#fb7185` | Funções Edge Supabase |

## 2. Executar o script com o GitHub CLI autenticado
```bash
# Autentique o gh se necessário
gh auth login

# Executar na raiz do projeto
pnpm tsx? # (não necessário)
./scripts/create-github-issues.sh
```
O script usa o slug detectado do `origin`. Caso queira forçar outro repositório, exporte `REPO_SLUG=org/projeto` antes de rodar.

## 3. Conteúdo das issues
Se preferir criar manualmente (por exemplo, se o CLI estiver bloqueado), use os títulos e checklists abaixo:

1. **CI/CD: aplicar pnpm + secret gate** (`ci`, `infra`)
   - Migrar workflows para pnpm (feito no commit atual — referenciar PR)
   - Validar segredos obrigatórios (Supabase/Vercel)
   - Atualizar `docs/proximos-passos/ci-cd-status.md`

2. **CI/CD: pipeline local lint+test+build** (`ci`, `quality`)
   - Executar `pnpm lint`, `pnpm test`, `pnpm build` a cada PR
   - Anexar logs/resumo no PR template

3. **Sprint Planning: consolidar escopo da Sprint 1** (`planning`, `product`)
   - Revisar `docs/proximos-passos/sprint-planning-dia2.md`
   - Definir responsáveis e Definition of Done

4. **Dashboard API: endpoint `/api/dashboard/kpis`** (`backend`, `dashboard`)
   - Já implementado em `server/api/dashboard.ts`; rastrear deploy e documentação

5. **Dashboard API: distribuição geográfica e séries históricas** (`backend`, `dashboard`)
   - `/api/dashboard/distribuicao-especialidades`
   - `/api/dashboard/distribuicao-estados`
   - `/api/dashboard/faturamento-mensal`

6. **Chatbot + Edge Function: garantir disponibilidade** (`ai`, `edge-functions`)
   - Validar `supabase/functions/ai-tutor-financeiro`
   - Confirmar secrets `ANTHROPIC_*`
   - Wire-up no hook `useChatbot`

Depois de criadas, vincule cada issue às respectivas tasks do Sprint Planning e marque o progresso no `status-digest`.

### Issues criadas em 2025-11-24 00:45
- #12 – CI/CD: aplicar pnpm + secret gate
- #13 – CI/CD: pipeline local lint+test+build
- #14 – Sprint Planning: consolidar escopo da Sprint 1
- #15 – Dashboard API: endpoint /api/dashboard/kpis
- #16 – Dashboard API: distribuição geográfica e séries históricas
- #17 – Chatbot + Edge Function: garantir disponibilidade
