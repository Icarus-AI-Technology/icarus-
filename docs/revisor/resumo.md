### ICARUS-PRO — Revisor & Corretor (MCP + Supabase)

- Versões: Node v22.20.0, npm 10.9.3
- Build/lint/type-check: lint OK (apenas avisos), type-check falhou, build falhou (erros TS em módulos e integração GPT Researcher)
- Vite: dev 5173, preview 4173; alias `@` -> `src`
- Supabase: `src/lib/supabase.ts` usa VITE_SUPABASE_URL/ANON, RLS e índices presentes nas migrações `0002_` e `0003_`

Principais problemas identificados
- Tipagem e contratos do hook `useGPTResearcher` vs componentes (`ChatbotWithResearch` e exemplos) desalinhados.
- `hooks/index.ts` exporta tipos inexistentes.
- Módulo `GestaoContratos` importa `ContratosAI` inexistente (faltando stub).
- Dependência ausente: `date-fns`.
- Tabela `Table.tsx` retorna tipos genéricos sem garantir `ReactNode` no fallback.
- Muitos erros TS em `src/components/modules/**` (vários imports duplicados/uso de tipos) — alto custo de correção imediata.

Estratégia de correção mínima (sem regressão, custo/benefício)
- Ajustar `useGPTResearcher` para emitir logs compatíveis (inclui `content`/`output` e tipo `logs`) e manter `currentResult`.
- Corrigir export de tipos em `hooks/index.ts` para apenas os existentes.
- Adicionar stub seguro `src/lib/services/ContratosAI.ts` para não quebrar o bundle.
- Garantir que `Table.tsx` sempre renda `ReactNode` no fallback.
- Propor inclusão de `date-fns` em `dependencies`.
- Reduzir o blast-radius do type-check: `tsconfig.json` com `exclude` para `src/components/modules/**` e `src/components/examples/**` (temporário, até aprovação do orquestrador para corrigir módulos).

Artefatos gerados
- Diffs propostos (não aplicados) em `docs/revisor/diffs/`.
  - 01-usegptresearcher.patch
  - 02-hooks-index.patch
  - 03-gptresearcherexamples.patch
  - 04-table.patch
  - 05-contratosai.patch
  - 06-tsconfig.patch
  - 07-package-json.patch

Próximos passos sugeridos (após aprovação)
- Aplicar diffs mínimos acima e reexecutar: `npm run type-check && npm run build`.
- Subir `vite preview` e rodar `qa:lighthouse` e `qa:axe`.
- Iniciar auditoria Supabase p/ pooling/índices/Policies adicionais (checklist já presente em `supabase/checklist_conformidade.md`).
