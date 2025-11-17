# Cronograma de Migração — ICARUS v5.0

## Visão Geral

- **Ambiente de destino**: `/Users/daxmeneghel/icarus-v5.0` (produção)
- **Integração**: Vercel + Supabase (Edge Functions, Realtime, Storage)
- **Janela sugerida**: 3 dias úteis

## Linha do Tempo

| Fase          | Responsável             | Local                            | Ação                                           | Evidência                           |
| ------------- | ----------------------- | -------------------------------- | ---------------------------------------------- | ----------------------------------- |
| Dia 1 — Manhã | Migration Planner       | `/Users/daxmeneghel/icarus-v5.0` | **Instalar dependências**: `npm ci --omit=dev` | `logs/production/install.log`       |
| Dia 1 — Tarde | Migration Planner       | `/Users/daxmeneghel/icarus-make` | Gerar build: `npm run build`                   | `dist/` atualizado                  |
| Dia 1 — Tarde | Handoff Ops             | ambos                            | Preparar allowlist de arquivos                 | `docs/migration-allowlist.txt`      |
| Dia 2 — Manhã | Supabase Schema Tracker | `supabase/`                      | Validar migrations e seeds                     | Relatório V5-04                     |
| Dia 2 — Tarde | Quality Ops             | dev                              | Executar testes (`run-missing-tests.sh`)       | `test-results/quality-report-*.log` |
| Dia 2 — Noite | Handoff Ops             | produção                         | Copiar artefatos aprovados via `rsync`         | Log de cópia                        |
| Dia 3 — Manhã | Vercel Integrator       | produção                         | Atualizar variáveis e triggers de deploy       | Checklist Vercel                    |
| Dia 3 — Tarde | Observability Lead      | produção                         | Testes de carga e integração                   | Relatório Final                     |

## Fluxo de Migração (detalhado)

1. **Instalação de dependências (Obrigatório iniciar aqui)**
   - `cd /Users/daxmeneghel/icarus-v5.0`
   - `npm ci --omit=dev`
   - Registrar saída em `logs/production/install.log`
2. **Sincronização de artefatos**
   - Copiar `dist/`, `supabase/`, `scripts/ops/` específicos
   - Aplicar migrations recém-validadas no Supabase
3. **Configuração de Integração Vercel-Supabase**
   - Setar `VERCEL_ENV`, `SUPABASE_*` via CLI/Console
   - Garantir tokens em `vercel env` e Supabase Secrets
4. **Testes finais**
   - Executar smoke tests (Playwright ou scripts dedicados)
   - Monitorar logs em tempo real (Supabase Observability)

## Checklist Pré-Deploy

- [ ] Dependências instaladas em `/Users/daxmeneghel/icarus-v5.0`
- [ ] Build gerado a partir de commit aprovado
- [ ] Arquivos copiados conforme allowlist
- [ ] Variáveis de ambiente Vercel configuradas (`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`)
- [ ] Edge Functions sincronizadas (`supabase functions deploy`)
- [ ] Testes unitários e E2E executados sem falhas
- [ ] Scripts de validação executados:
  - [ ] `scripts/ops/validate-environment.mjs`
  - [ ] `scripts/ops/check-dependencies.mjs`
  - [ ] `scripts/ops/verify-migration-integrity.mjs`
- [ ] Monitoramento/Gestão de logs configurados
- [ ] Plano de rollback documentado

## Observações

- Manter `docs/migration-plan-v5.md` alinhado a cada atualização.
- Qualquer alteração fora da allowlist deve passar por aprovação do Orchestrator V5-01.
