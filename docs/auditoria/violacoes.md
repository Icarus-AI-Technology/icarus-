## Violacoes Identificadas

### TypeScript / Lint (Hard Gate TS Strict)

- `src/components/modules/*`: import duplicado de `TrendingUp` em dezenas de módulos gera conflito (`TS2300`). Necessário consolidar via import único ou alias.
- `src/components/modules/CRMVendas.tsx`: tipo `Lead` sem campo `estagio`, causando múltiplos `TS2339`. Ajustar tipagem ou dados mockados.
- `src/components/modules/EstoqueIA.tsx`: tipo `Material` sem campo `descricao`; `React` não importado, gerando `TS2686`.
- `src/components/oraclusx-ds/index.ts`: exportações inexistentes (`Form`, `FormLabel` etc.) e duplicação de `RadioProps`.
- `src/hooks/useGPTResearcher.ts` & `src/lib/gpt-researcher-service.ts`: ausência de typings para `gpt-researcher`, resultando em `TS7016`.
- `src/hooks/useFluxoCaixa.ts` e serviços correlatos: uso extensivo de `any` e dependências de hooks faltantes (`react-hooks/exhaustive-deps`).
- `src/components/examples/GPTResearcherExamples.tsx`: `require` proibido e `any` implícito (corrigido em 19/10 com uso direto do hook tipado).
- `src/components/oraclusx-ds/ChatbotWithResearch.tsx`: uso de `any` nas mensagens (ajustado em 19/10 com tipagem de metadata e memoização de utilitários).
- Hooks Supabase (ex.: `useFornecedores`, `useProdutos`, `useKits`, `useLotes`, `useLeads`) atualizados em 19/10 para remover `any`, normalizar fallback de dados e tratar erros.
- `src/components/modules/FinanceiroAvancado.tsx`: placeholders tipados, efeitos com dependências completas e KPIs validados.
- `src/hooks/useMateriais.ts`/`EstoqueIA.tsx`: resumo e alertas tipados, remoção de `any` e tratamento de erros.
- `src/hooks/useCentroCustos.ts`, `useConvenios.ts`, `useLotesFaturamento.ts`: fallback/resumos tipados e supressão de `any` em cálculos auxiliares.
- `src/lib/gpt-researcher-service.ts`, `ConciliacaoBancariaService.ts`, `transportadoras/base+Correios+TNT`: instâncias/cache/logs tipados, sem `any`.
- Pendências principais: `GestãoCadastros` (aprimorar tipagem de `selectedFilter`/`selectedItem`), serviços IA (`ContasReceberAI`, `FluxoCaixaAI`, `GlosasDetectionAI`), transportadoras (`Jadlog`, correções finais em TNT), módulos template com imports sobrando e hooks com dependências justificadas (`useFluxoCaixa`, `ChatbotWithResearch`, `useAuth`).

### Hard Gate (Design System)

- `docs/hard-gate-report.md` registra 1.930 avisos (principalmente tokens/Tailwind fora do padrão). Sem bloqueios críticos, mas recomendações de alinhamento ao OraclusX DS.

### QA (A11y/Perf)

- Auditorias `axe`/`lighthouse` falharam por falta de servidor preview (`net::ERR_CONNECTION_REFUSED`, interstitial Chrome). Nenhum dado coletado.

