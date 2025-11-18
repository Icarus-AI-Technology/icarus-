## Resumo da Auditoria

- Ambiente Node/npm alinhado (`v22.20.0` / `10.9.3`).
- `npm ci` concluído (517 pacotes, 2 vulnerabilidades moderadas pendentes).
- `npm run lint -- --max-warnings=0` agora **clean** (0 avisos/erros).
- `npm run type-check` sem erros (tipagem consolidada).
- `npm run build` concluído com sucesso (apenas aviso de bundle >600 kB).
- `npm run qa:axe` executado (0 violações após reforçar `--orx-primary`/`--orx-text-muted`).
- `npm run qa:hardgates` reexecutado (relatórios atualizados em `docs/revisor/`).
- `npm run qa:perf`: Root (Perf **93**, Acc 100, BP 96, SEO 91, CLS **0.142**) → otimizar LCP/CLS.
- `npm run qa:perf:qa`: `qa/financeiro` (Perf **98**, Acc **82**, BP 96, SEO 91) → revisar issues de acessibilidade específicas da tela QA.

### Pending fixes

- Reduzir CLS global para < 0.1 (hero/tiles animados) e investigar alertas Acc na rota QA.
- Planejar code-splitting/manualChunks para `index-BPQvEG9U.js` (~1 MB).
- Priorizar pacote acessibilidade QA (labels/foco) antes de nova medição.

### Checklist

- [x] Dependências instaladas
- [x] Lint ok
- [x] Type-check ok
- [x] Build ok
- [x] Preview validado
- [ ] Lighthouse ≥ 90 / 95 / CLS < 0.1
- [x] Hard Gate sem violações
- [x] A11y validado

