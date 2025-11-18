## QA A11y

- **Comando:** `npm run qa:axe` (preview via `npm run preview:start`)
- **Status:** ✅ 0 violações WCAG 2.1 AA
- **Detalhes:** Tokens `--orx-primary`, `--orx-text-muted`, `--orx-text-secondary` e classes `a`, `.orx-text-xs` ajustados para contraste ≥ 4.5:1. Relatório atualizado em `docs/axe-root.json`.
- **Próximos passos:** Manter checklist manual (foco, navegação por teclado) e repetir auditoria após novos ajustes de UI.
