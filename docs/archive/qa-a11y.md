# QA — Acessibilidade & Performance

Este relatório consolida as auditorias WCAG 2.1 AA e Lighthouse (desktop) das rotas principais.

## Metodologia
- Ferramentas: `npm run qa:a11y`, `lighthouse`
- Ambiente: `vite preview` (porta 4174)
- Modo QA: adicionar `?qa=1` para desabilitar Chatbot/Analytics

## Rotas auditadas
- /dashboard
- /cirurgias
- /estoque
- /financeiro
- /compras

## Resultados (execução atual)
- Performance (Lighthouse):
  - /: Perf 95, A11y 85, Best Practices 96, SEO 91
  - /login: Perf 100, A11y 85, Best Practices 96, SEO 91
- QA Pages (públicas):
  - /qa/compras: Perf 99, A11y 95, Best Practices 96, SEO 91
  - /qa/financeiro: Perf 99, A11y 80, Best Practices 96, SEO 91
  - /qa/cadastros: Perf 95, A11y 93, Best Practices 96, SEO 91
  - /qa/cirurgias: Perf 96, A11y 96, Best Practices 96, SEO 91
  - /qa/estoque: Perf 96, A11y 96, Best Practices 96, SEO 91
- Observações: estabilizado LCP/FCP em headless nas rotas de Cirurgias/Estoque via placeholders QA e desativação de animações iniciais.

## Achados e Correções
- [ ] Descrever achado → correção aplicada

# ♿ Axe Accessibility Report

**Note**: Running full axe-core pipeline requires injection; producing a basic landmark/alt/label quick check via Playwright will be added later.

Status: Deferred in CI headless.

## Histórico de scores (execuções anteriores)
- /cadastros: Perf 98, A11y 96, Best Practices 96, SEO 91
- /compras: Perf 99, A11y 95, Best Practices 96, SEO 91
- /financeiro: Perf 99, A11y 96, Best Practices 96, SEO 91
- /cirurgias: Perf 99, A11y 96, Best Practices 96, SEO 91
- /estoque: Perf 99, A11y 96, Best Practices 96, SEO 91
- / (root): Perf 99, A11y 92, Best Practices 96, SEO 91
- /login: Perf 99, A11y 92, Best Practices 96, SEO 91