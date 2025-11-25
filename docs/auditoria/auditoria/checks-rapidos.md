## Checks Rápidos

### `npm run lint`

- **Status:** Falhou
- **Resumo:** 195 problemas identificados (73 erros, 122 avisos)
- **Principais categorias:** uso de `any`, imports `require`, variáveis não utilizadas, dependências ausentes em hooks React.
- **Arquivos de maior impacto:** `src/components/modules/FinanceiroAvancado.tsx`, `src/hooks/useFluxoCaixa.ts`, `src/lib/services/transportadoras/*`, `src/hooks/useFornecedores.ts`, `src/components/examples/GPTResearcherExamples.tsx`, `src/components/oraclusx-ds/Table.tsx`.
- **Ação recomendada:** Patches graduais removendo `any`, ajustar hooks e imports.

### `npm run type-check`

- **Status:** Falhou
- **Resumo:** 121 erros TypeScript.
- **Principais categorias:** duplicidade de imports (`TrendingUp`), propriedades inexistentes em tipos (`Lead.estagio`, `Material.descricao`), hooks sem uso e campos não tipados, falta de declarações para `gpt-researcher`, uso de `React` global sem import, imports indevidos de componentes do DS.
- **Arquivos de maior impacto:** `src/components/modules/CRMVendas.tsx`, `src/components/modules/FinanceiroAvancado.tsx`, `src/components/modules/EstoqueIA.tsx`, `src/components/modules/logistica/GestaoEntregas.tsx`, `src/components/oraclusx-ds/index.ts`, `src/hooks/useGPTResearcher.ts`, `src/lib/services/*`, `src/components/modules/*` (uso redundante de `TrendingUp`).
- **Ação recomendada:** Revisar definição de tipos compartilhados (ex.: `Lead`, `Material`), consolidar imports `TrendingUp`, criar declarações para libs externas e ajustar membros exportados do DS.

