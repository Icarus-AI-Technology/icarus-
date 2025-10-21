## QA Performance

- **Comando:** `npm run qa:lighthouse`
- **Status:** Inconclusivo (falha ao carregar rotas)
- **Detalhes:** Chrome exibiu interstitial por URLs indisponíveis (`http://localhost:4173/*`). Possível ausência de servidor preview ou bloqueio local.
- **Impacto:** Sem scores de performance/acessibilidade/CLS. Reexecutar após build e preview ativos.

