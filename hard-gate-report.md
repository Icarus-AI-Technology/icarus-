ICARUS v5.0 — Hard Gate Report

Data: 2025-10-19

Resumo executivo (bloqueante)
- Tipografia e cores fora do DS detectadas. PR BLOQUEADO até saneamento mínimo.
- Principais achados (contagens aproximadas):
  - Utilização de utilitários Tailwind de cor nomeada (bg/text/border/ring-<palette>-<shade>): 344 ocorrências em 81 arquivos (↓ adicional 57; total ↓ 151).
  - Utilização de tipografia `font-*` (peso/família) direta: ~416 ocorrências em ~124 arquivos (não recontado integralmente nesta rodada).
  - Utilitários de sombra Tailwind (`shadow`, `shadow-sm/md/lg/xl/2xl`): 147 ocorrências em 67 arquivos (↓ adicional 12; total ↓ 22).
  - Sombra arbitrária (`shadow-[…]`): 31 ocorrências em 13 arquivos.
  - Hex codes diretos (#RRGGBB/RGBA): 46 ocorrências em 5 arquivos (sem alteração nesta amostra).
  - Observação: Uso de `text-[var(--…)]` (872 ocorrências em 44 arquivos) é considerado ALINHADO ao DS, pois referencia tokens semânticos.

Política Hard Gate (reforço)
1) Proibido usar utilitários Tailwind de cor nomeada quando houver tokens do DS equivalentes. Use variáveis semânticas (ex.: `text-[var(--text-primary)]`, `bg-[var(--card)]`).
2) Proibido `font-*` conflitante com tipografia global do OraclusX DS. Utilize classes/tokens do DS (`font-display`, `text-heading*`, `text-body-*`).
3) Proibido sombras fora do padrão neuromórfico. Use utilitários/classes do DS: `neumorphic-card`, `neumorphic-button`, `orx-card`, `orx-button`, ou `shadow-[var(--shadow-…)]` quando definido pelo DS.
4) Proibido hex/rgba hardcoded em componentes; preferir tokens CSS.

Exemplos de locais (amostragem)
- text/bg de paletas Tailwind: `src/components/modules/logistica/GestaoEntregas.tsx` (mapeamento de status `bg-*-500`), `src/components/modules/CRMVendas.tsx` (`text-purple-600`, `bg-purple-50`).
- Sombras Tailwind: diversos módulos usam `shadow-lg`/`shadow-md` para efeitos; preferir `neumorphic-*` ou DS vars.
- Hex em CSS de tokens: `src/styles/oraclusx-ds.css` e `src/styles/globals.css` (aceitável quando definindo tokens globais do DS).

Plano de correção recomendado (prioridade)
1) Cores nomeadas → tokens DS
   - Substituir `text-indigo-500`, `bg-blue-50`, etc por tokens: `text-[var(--text-primary)]`, `bg-[var(--card)]`, `text-[var(--primary)]`, `bg-[var(--accent)]`, etc.
   - Onde necessário, expor novos tokens em `globals.css`/`oraclusx-ds.css` em vez de hardcode.

2) Tipografia → escalas DS
   - Remover `font-bold/semibold` e usar classes semânticas do DS (`text-heading[-lg]` + `font-display`) ou mapear pesos via tokens.

3) Sombra → neuromórfico DS
   - Trocar `shadow-*` por `neumorphic-card`, `neumorphic-button`, `orx-card`, ou por `shadow-[var(--shadow-…)]` já definidas no DS.

4) Hex diretos
   - Substituir cores hardcoded por variáveis (`var(--orx-*)` ou `hsl(var(--…))`).

Status do Gate
- Hard Gate: REPROVADO (bloqueante)

Checklist de saída (para desbloqueio)
- [ ] 0 ocorrências de `bg|text|border|ring-<palette>-<shade>` em componentes.
- [ ] 0 ocorrências de `font-*` conflitantes (peso/família) em componentes.
- [ ] 0 ocorrências de `shadow(-sm|-md|-lg|-xl|2xl)` em componentes (trocar por neuromórfico DS).
- [ ] 0 hex/rgba diretos em componentes (exceto definição de tokens globais).
- [ ] Revisão final nos módulos críticos (Dashboard, Financeiro, CRM, Logística).

Notas
- O uso de `text-[var(--…)]` e das classes `neumorphic-*`/`orx-*` é recomendado e está em conformidade.


