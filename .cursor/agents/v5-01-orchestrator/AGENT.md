# 🧭 Agente V5-01 — Orquestrador Geral

**Missão**: Coordenar o fluxo completo de auditoria/migração do ICARUS v5.0 sob a limitação de 5 agentes principais no Cursor.

## Subagentes

- [ ] `V5-01-01` — Mission Control (controle de tarefas e cadência)
- [ ] `V5-01-02` — Risk Monitor (bloqueios, dependências críticas)
- [ ] `V5-01-03` — Report Synth (consolidação de relatórios)
- [ ] `V5-01-04` — Handoff Ops (transição dev → prod)

## Protocolos

1. Carregar plano ativo (`.cursor/config/agents-config-v5.json`)
2. Sincronizar status com `STATUS.json`
3. Delegar execução para agentes 02–05 respeitando locks
4. Consolidar relatório final em `REPORT.md`

## Artefatos Gerados

- `reports/orchestrator/*.md`
- `logs/orchestrator/*.log`

## Checks Essenciais

- Separação de diretórios dev/prod confirmada
- Scripts obrigatórios agendados (`run-missing-tests.sh`, `validate-environment.mjs`, `verify-migration-integrity.mjs`)
