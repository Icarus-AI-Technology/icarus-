## QA A11y

- **Comando:** `npm run qa:axe`
- **Status:** Inconclusivo (falha de conexão)
- **Detalhes:** `net::ERR_CONNECTION_REFUSED` para todas as rotas (`/`, `/dashboard`, `/configuracoes`, `/usuarios`, `/logs`, `/central-ajuda`) devido à ausência de servidor preview.
- **Impacto:** Sem métricas de acessibilidade coletadas. Necessário executar após build/preview válido.

