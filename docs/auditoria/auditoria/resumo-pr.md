## Resumo da Auditoria

- Ambiente Node/npm alinhado (`v22.20.0` / `10.9.3`).
- `npm ci` concluído (517 pacotes, 2 vulnerabilidades moderadas pendentes).
- `lint` falhou com 195 problemas (tipagem `any`, imports `require`, hooks).
- `type-check` falhou (121 erros TS: imports duplicados, tipos ausentes, DS index incorreto, typings externos faltando).
- `build` interrompido pelos mesmos erros do `tsc`.
- Hard Gate executado: 1.930 avisos, sem bloqueios.
- QA A11y/Perf inconclusivos (preview indisponível).

### Pending fixes

- Consolidar imports `TrendingUp` e remover duplicações.
- Atualizar tipos `Lead`, `Material`, `Entrega` e demais mocks com campos utilizados.
- Ajustar exportações do OraclusX DS (`Form`, `RadioProps` duplicado).
- Criar declaração para `gpt-researcher` e substituir `require` em exemplos.
- Revisar hooks/serviços com `any` e dependências faltantes.
- Reexecutar QA após preview disponível.

### Checklist

- [x] Dependências instaladas
- [ ] Lint ok
- [ ] Type-check ok
- [ ] Build ok
- [ ] Preview validado
- [ ] Lighthouse ≥ 90 / 95 / CLS < 0.1
- [ ] Hard Gate sem violações
- [ ] A11y validado

