ICARUS v5.0 — Performance Report (Desktop)

Data: 2025-10-19

Contexto
- Servidor de preview: `http://localhost:4173` (Vite preview).
- Sem execução automática de Lighthouse; necessário rodar manualmente.

Métricas alvo
- Performance ≥ 90
- Accessibility ≥ 95 (vide `qa-a11y.md`)
- CLS < 0.1

Como medir (passo-a-passo)
1) Rodar preview: `npm run preview -- --port 4173 --host`
2) Abrir Chrome > DevTools > Lighthouse > Modo Desktop
3) Auditar rotas: `/`, `/dashboard`, `/modules`, `/showcase` e módulos críticos
4) Exportar JSON/HTML dos relatórios e anexar em `docs/` (sugestão: `docs/lh-<rota>.json`)

Observações de implementação
- Muitas rotas e módulos; concentre auditoria inicial nas rotas de maior tráfego.
- Checar CLS: elementos com carregamento tardio, fontes e imagens devem ter dimensões reservadas.

Pendências atuais
- TypeScript com ~212 erros impede build consistente para análise abrangente. Priorizar correção.
- Hard Gates não conformes podem afetar coerência visual e custos de renderização.


