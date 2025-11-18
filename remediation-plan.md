ICARUS v5.0 — Plano de Correções (Execução P0 → P2)

Data: 2025-10-19

Estado atual
- Lint: OK (0 erros, 102 avisos)
- Type-Check: FALHOU (~212 erros TS)
- Hard Gates: REPROVADO (ver docs/hard-gate-report.md)
- Preview ativo: http://localhost:4173/

P0 — Build e Tipos (bloqueantes)
1) GPTResearcher
   - Arquivos: `src/components/examples/GPTResearcherExamples.tsx`, `src/hooks/useGPTResearcher.ts`, `src/lib/gpt-researcher-service.ts`.
   - Ações:
     - Garantir compatibilidade de tipos (ResearchLog possui `content`/`output`).
     - Evitar import dinâmico de `gpt-researcher` em build: manter serviço isolado; se indisponível, fallback silencioso.
     - Ajustar exemplos para checagens opcionais (metadata/result) e `setState` tipado.

2) Gestão de Contratos
   - Arquivo: `src/components/modules/GestaoContratos.tsx`
   - Ações:
     - Instalar `date-fns`/`@types/date-fns` OU remover uso.
     - `Table` não deve usar `accessor` incompatível se o componente não suporta. Usar colunas com `header`/`cell` + leitura do `row` tipado.
     - Tipar `row` nas `cell` callbacks e alinhar `Tabs` à API esperada.
     - Substituir `Spinner` por componente existente do DS ou condicional.

3) Ícones faltantes (lucide-react)
   - Importar onde usado: `Download`, `Search`, `Loader2`, `Eye`, `Edit2` ou remover chamadas.

4) Tipos faltantes
   - Declarar ou ajustar modelos: `Material`, `ExtratoBancario`, `CentroCusto`, `Contrato*` etc.
   - Corrigir estados union (ex.: `SetStateAction<ResumoFinanceiro | null>` em `FinanceiroAvancado`).

5) CorreiosService
   - Arquivo: `src/lib/services/transportadoras/nacionais/CorreiosService.ts`
   - `CotacaoParams` deve conter `origem`, `destino`, `volumes`; remover leituras de campos inexistentes.

Critério de saída P0
- `npm run type-check` e `npm run build` sem erros.

P1 — Hard Gates (DS)
1) Cores Tailwind nomeadas → tokens DS
   - Substituir `bg|text|border|ring-<palette>-<shade>` por tokens (`text-[var(--text-primary)]`, `bg-[var(--card)]`, etc.).
   - Foco: `CRMVendas.tsx`, `logistica/GestaoEntregas.tsx` e demais módulos listados no relatório.

2) Sombras
   - Trocar `shadow`, `shadow-*`, `shadow-[…]` por classes neuromórficas (`neumorphic-*`, `orx-*`) ou `shadow-[var(--shadow-…)]` do DS.

3) Tipografia
   - Remover `font-*` conflitante; usar `text-heading*`, `text-body-*`, `font-display`.

4) Hex em componentes
   - Migrar para tokens CSS; manter hex apenas nos tokens globais (`globals.css`, `oraclusx-ds.css`).

Critério de saída P1
- 0 violações nos padrões listados em `docs/hard-gate-report.md` (checklist).

P2 — QA contínuo
1) Scripts no package.json
   - `qa:a11y` com `@axe-core/cli` nas rotas principais.
   - `qa:perf` com Lighthouse Desktop e salvar JSON em `docs/`.
   - `qa:ds` (scanner de hard gates por grep ou script).

2) Auditorias
   - Rodar Axe e Lighthouse em `/`, `/dashboard`, `/modules`, `/showcase` e módulos críticos.
   - Anexar relatórios em `docs/` e atualizar metas.

Observações
- Tratar avisos ESLint correlatos durante os ajustes.
- Priorizar rotas de maior tráfego e arquivos com maior volume de erros (usar `docs/ts-errors.txt`).


