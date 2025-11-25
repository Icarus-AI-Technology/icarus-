# Guia de Design OraclusX + Neumorfismo 3D (ICARUS v5.0)

## 1. Princípios Gerais
- OraclusX DS é a FONTE ÚNICA de componentes visuais (`@/components/oraclusx-ds`).
- Neumorfismo 3D premium aplicado a cards, minicards, KPIs, inputs e botões.
- Dois temas oficiais: claro e escuro, sempre com contraste AA/AAA (`body.ic-theme-light | .ic-theme-dark`).

## 2. Tokens Neumórficos
- Tokens centralizados em `src/styles/neumorphic-tokens.css`.
- Principais variáveis:
  - `--ic-shadow-dark-outer`, `--ic-shadow-light-outer`: sombras duplas.
  - `--ic-radius-lg`, `--ic-radius-pill`: raios compartilhados.
  - `--ic-accent-*`: paleta (primary/success/info/warning/danger).
- Util classes:
  - `.ic-card-neumo`: bloco de cards/kpis com gradiente dinâmico.
  - `.ic-icon-badge-neumo`: badge de ícones (sidebar/topbar).
  - `.ic-kpi-pill`: chips de KPIs ou filtros.
  - `.ic-search-neumo`: barra de busca com sombra dupla.
- `globals.css` importa o arquivo automaticamente (após `design-tokens.css`).

## 3. Componentes-Chave

### 3.1 Cards e KPIs
- Usar `<Card />`, `<CardKpi />`, `<MiniCard />` do oraclusx-ds.
- Padding padrão: 16–24px, `shadow-neumo` + `.ic-card-neumo`.
- `CardKpi` aceita `tone` (`primary`, `success`, etc.) e `trend`.
- `MiniCard` serve para filtros ou métricas secundárias.

### 3.2 Inputs e Formulários
- Campos: `<NeumoInput />`, `<NeumoTextarea />`, `<Select />`, `<FormField />`.
- Usar `shadow-neumo-sm-inset` para inputs e `--ic-shadow-light-inner` nos estados focados.

### 3.3 Barra de Busca
- Componentização em `<NeumoSearchBar />`: ícone, limpar e filtros.
- Container utiliza `.ic-search-neumo`; placeholder com `text-orx-text-muted`.

## 4. Temas Claro/Escuro
- Adotar `body.ic-theme-light` e `body.ic-theme-dark` de acordo com o toggle global.
- Para Tailwind, manter suporte a `class="dark"` nos wrappers (ver `light_dark_check.log`).
- Gradientes diferentes para `.ic-card-neumo`, `.ic-search-neumo` e `.ic-kpi-pill`.

## 5. Padrões para Módulos
- Dashboards principais devem utilizar exclusivamente `<CardKpi />` para KPIs.
- Minicards, filtros e quick-actions devem usar `<MiniCard />` com `variant` coerente.
- Barras de busca devem importar `<NeumoSearchBar />` + tokens `.ic-search-neumo`.
- Logs acionáveis:
  - `backups/design/neumo_usages.log`: onde legacy ainda aparece.
  - `backups/design/neumo_refactors_sugestoes.log`: priorização para refactors.

## 6. Migração de Legacy
- O arquivo `backups/design/ORACLUSX_MAPPING_TODO.md` contém o mapeamento oficial.
- Components legacy: `Neumo*`, `Neomorphic*`, `MiniCard` (old), `CardKpi` (old), `SearchContainer`.
- Procedimento:
  1. Substituir imports para `@/components/oraclusx-ds/...`.
  2. Aplicar classes auxiliares (`.ic-card-neumo`, `.ic-icon-badge-neumo`).
  3. Testar `pnpm dev` e `npm run lint`.

## 7. Exemplos Reais (dashboards)
- `src/pages/DashboardPage.tsx`: referência para KPIs usando `<CardKpi />`.
- `src/pages/cadastros/DashboardCadastros.tsx`: utilizar `<MiniCard />` para filtros.
- `src/pages/estoque/GestaoLotes.tsx`: `<NeumoSearchBar />` com filtros.

> Atualize este guia sempre que novos tokens, variantes ou exemplos forem adicionados para manter o DS vivo.
