# Subagente V5-01-01 — Mission Control

**Responsável por**: sequenciar execuções dos agentes 02–05, atualizar indicadores de progresso e garantir que apenas um fluxo esteja ativo por vez.

## Tasks

- Validar `STATUS.json` de cada agente antes de liberar execução
- Registrar início/fim no `.cursor/logs/mission-control-*.log`
- Disparar script `scripts/ops/run-missing-tests.sh` quando o agente 02 estiver livre
