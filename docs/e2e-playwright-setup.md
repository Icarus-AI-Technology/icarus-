# Guia de Provisionamento Playwright (E2E)

## Objetivo

Reativar os testes end-to-end da pipeline (`npm run test:e2e`) garantindo que os binários do Playwright estejam disponíveis tanto em desenvolvimento quanto no ambiente de CI/CD.

## 1. Estrutura de diretórios

- **Projeto**: `/Users/daxmeneghel/icarus-make`
- **Cache local sugerido**: `.playwright-browsers/`
- **Produção (somente execução)**: `/Users/daxmeneghel/icarus-v5.0`

## 2. Provisionamento local (sem acesso externo bloqueado)

```bash
cd /Users/daxmeneghel/icarus-make
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install
```

> 💡 Quando executado em ambientes com rede restrita, a instalação falha por não resolver `cdn.playwright.dev`. Utilize um runner/CI com acesso liberado ou faça o download manual em outra máquina e copie o diretório `.playwright-browsers` para o workspace.

### Transferência manual

1. Em uma máquina com acesso, rode o comando acima.
2. Compacte a pasta `.playwright-browsers/`.
3. Copie para o repositório (sem versionar; apenas transferir).
4. Execute `scripts/setup-playwright-offline.sh caminho/do/arquivo.tgz` para extrair em `/Users/daxmeneghel/icarus-make/.playwright-browsers`.

## 3. Pipeline / CI

- Configure a etapa de build com a variável `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers`.
- Antes dos testes, rode `npx playwright install --with-deps` (quando a rede permitir).
- Ative o step de E2E exportando `REQUIRE_E2E=1` (vide `scripts/ops/run-missing-tests.sh`).

## 4. Execução

```bash
# Local / CI com browsers instalados
REQUIRE_E2E=1 scripts/ops/run-missing-tests.sh
```

## 5. Rollback

Para voltar ao modo “skip”, remova `REQUIRE_E2E` ou defina `REQUIRE_E2E=0`.
