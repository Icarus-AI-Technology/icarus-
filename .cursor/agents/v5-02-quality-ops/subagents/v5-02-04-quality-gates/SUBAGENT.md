# Subagente V5-02-04 — Quality Gates

**Responsável por**: garantir que lint, type-check e build estejam verdes antes de handoff.

## Tasks

- Monitorar resultados do `Test Executor`
- Executar `npm run --if-present build` quando lint/type-check passarem
- Liberar sinal `ready-for-handoff` para o agente V5-01
