# Endpoints propostos para o Dashboard
Atualizado em 2025-11-23 23:30

Os gráficos e KPI’s definidos em `src/pages/Dashboard.tsx` dependem de dados consolidados de vários domínios (vendas, logística, estoque e alertas). Abaixo estão as rotas recomendadas para alimentar cada bloco e permitir atualizações em tempo real (via pooling ou WebSocket quando indicado).

## 1. Métricas principais
- `GET /api/dashboard/kpis`
  - **Uso**: popular `progressItems`, `circularStats` e cards de status.
  - **Resposta** (exemplo):
    ```json
    {
      "progress": [
        { "label": "VENDAS", "value": 87 },
        { "label": "ENTREGAS", "value": 91 }
      ],
      "circular": [
        { "label": "PEDIDOS", "value": 57, "sub": "Em Aberto" }
      ]
    }
    ```
  - **Obs.**: implementar cache de 60s e publicar eventos `dashboard.kpi.updated` para consumo em tempo real.

## 2. Distribuição regional e especialidades
- `GET /api/dashboard/distribuicao-especialidades`
  - Alimenta `pieData` (ex.: Ortopedia/Cardiologia/Neurologia).
- `GET /api/dashboard/distribuicao-estados`
  - Usado pelos micro sparkline por UF (SP, RJ, MG, RS).
  - Incluir histórico mensal para rendering dos minigráficos.

## 3. Séries históricas
- `GET /api/dashboard/faturamento-mensal`
  - Retorna `areaChartData` (`name`, `v1`, `v2`) usado na curva de faturamento vs. pedidos.
- `GET /api/dashboard/indicadores-anuais`
  - Alimenta `lineChartData` (capacidade vs. utilização) e `barChartData`.

## 4. Estoque e logística
- `GET /api/dashboard/logistica-status`
  - KPIs de entregas em trânsito, SLAs e `circularStats` de logística.
- `GET /api/dashboard/estoque-critico`
  - Lista itens com % crítico para alertas e notificações.
- Eventos WebSocket `logistics.update` para atualizar progressos em tempo real.

## 5. Notificações e AI Chat
- `GET /api/notifications/realtime?scope=dashboard`
  - Alimenta o widget “Notificações do Sistema”.
  - Suporte a Server-Sent Events ou canais Supabase Realtime.
- `POST /api/chat/assistente`
  - Mantém o `AIChatWidget` alinhado ao backend (hand-off com Edge Functions).

## 6. Segurança e telemetria
- `GET /api/dashboard/session` ou `/api/me`
  - Confirma identidade do usuário e privilégios para cards específicos.
- Audit log assíncrono via `POST /api/audit/dashboard-views`.

## 7. Integração no Frontend (2025-11-24)
- `src/lib/api/dashboard.ts` centraliza o consumo das rotas listadas acima (KPI, especialidades, estados e faturamento).
- `src/pages/Dashboard.tsx` carrega os dados na montagem do componente, mantém fallback offline e exibe aviso quando a sincronização falha.
- Ambiente de desenvolvimento: executar `pnpm dev:full` (novo script que roda o Express + Vite em paralelo). Alternativamente, iniciar `pnpm tsx server/index.ts` (porta 3001) e `pnpm dev`. O `vite.config.js` já proxia `/api` para o servidor Express.

### Próximos passos técnicos
1. Criar mocks no backend que respeitem os contratos acima.
2. Expor canal realtime (Supabase Realtime ou websocket próprio) para notificações e KPIs críticos.
3. Atualizar `src/pages/Dashboard.tsx` para consumir os endpoints assim que estiverem disponíveis (hoje os dados estão mockados no cliente).
4. Cobrir as rotas com testes (`pnpm test dashboards`) e monitorar via observabilidade.

