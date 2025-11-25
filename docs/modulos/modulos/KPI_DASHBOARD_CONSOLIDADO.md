# 🎯 KPI Dashboard Consolidado - Visão 360°

## Visão Geral

O **KPI Dashboard Consolidado** é o centro de comando executivo do ICARUS, fornecendo visão em tempo real de todos os indicadores-chave de performance (KPIs) da distribuidora OPME. Com alertas inteligentes, comparação com metas e atualização automática via Supabase Realtime.

## 🎯 Funcionalidades Principais

### 1. **KPIs em Tempo Real**
- **13 KPIs Principais** cobrindo 4 áreas:
  - **Vendas** (4): Faturamento, Margem, Ticket Médio, NF-e Emitidas
  - **Financeiro** (3): Contas Vencidas, Inadimplência, Prazo Recebimento
  - **Operações** (3): Prazo Entrega, Taxa Devolução, Pedidos no Prazo
  - **Compliance** (3): Conformidade ANVISA, NF-e Canceladas, Produtos Sem Registro

### 2. **Sistema de Semáforo (Thresholds)**
Cada KPI tem 4 thresholds configuráveis:
- 🔴 **Crítico**: Abaixo do mínimo aceitável
- 🟡 **Alerta**: Entre mínimo e meta
- 🟢 **OK**: Meta atingida
- 🔵 **Excelente**: Superou expectativas

### 3. **Alertas Inteligentes**
- **Geração Automática**: Quando KPI sai do threshold
- **3 Tipos de Alerta**:
  - `meta_nao_atingida`: KPI está crítico ou em alerta
  - `tendencia_negativa`: Variação < -20% vs anterior
  - `variacao_abrupta`: Mudança inesperada (>50%)
- **Severidades**: crítico, alto, médio, baixo
- **Ação Recomendada**: Sugestão automática de ação

### 4. **Comparação com Período Anterior**
- Cálculo automático de variação percentual
- Identificação de tendência (crescimento/estável/queda)
- Gráfico de evolução (sparkline)

### 5. **Atualização em Tempo Real (Realtime)**
- Supabase Realtime habilitado
- Notificação instantânea de mudanças
- Sincronização automática entre usuários

### 6. **Dashboards Personalizáveis**
- Widgets arrastar e soltar
- Filtros por categoria
- Layouts salvos por usuário
- Compartilhamento de dashboards

### 7. **Cálculo Automático**
- Function `calcular_kpi()`: Calcula valor de um KPI
- Function `calcular_todos_kpis_mes()`: Calcula todos de uma vez
- Agendamento via `pg_cron` (mensal, semanal, diário)

## 🏗️ Arquitetura

### Tabelas:
1. **`kpi_metas`**: Definição de metas e thresholds
2. **`kpi_valores_historico`**: Histórico temporal de valores
3. **`kpi_alertas`**: Alertas gerados automaticamente
4. **`kpi_dashboard_widgets`**: Widgets personalizados

### Views:
1. **`vw_kpi_dashboard_resumo`**: Resumo consolidado de todos os KPIs
2. **`vw_kpi_por_categoria`**: Agrupamento por categoria

### Functions:
1. **`calcular_kpi()`**: Calcula um KPI específico
2. **`calcular_todos_kpis_mes()`**: Calcula todos os KPIs do mês

## 💻 Uso no Código

### Exemplo 1: Calcular Faturamento Mensal

```typescript
import { supabase } from '@/lib/supabase';

// Calcular faturamento de janeiro/2025
const { data, error } = await supabase.rpc('calcular_kpi', {
  p_kpi_nome: 'faturamento_mensal',
  p_data_referencia: '2025-01-01',
  p_periodo: 'mensal',
});

// Retorna UUID do histórico criado
console.log('Histórico ID:', data);
```

### Exemplo 2: Buscar Resumo de KPIs

```typescript
const { data: kpis } = await supabase
  .from('vw_kpi_dashboard_resumo')
  .select('*')
  .order('categoria');

kpis.forEach(kpi => {
  console.log(`${kpi.nome}: ${kpi.valor_atual} (${kpi.atingimento_percentual}%)`);
  console.log(`Status: ${kpi.status}, Tendência: ${kpi.tendencia}`);
});
```

### Exemplo 3: Configurar Realtime

```typescript
const channel = supabase
  .channel('kpi-dashboard')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'kpi_valores_historico',
    },
    (payload) => {
      console.log('KPI atualizado:', payload);
      // Recarregar KPIs no dashboard
    }
  )
  .subscribe();
```

## 📊 KPIs Implementados

### Vendas (4 KPIs)

| KPI | Meta | Thresholds | Descrição |
|-----|------|------------|-----------|
| `faturamento_mensal` | R$ 2.000.000 | 🔴 < 1,5M, 🟡 < 1,8M, 🟢 ≥ 2M, 🔵 ≥ 2,5M | Faturamento total do mês |
| `margem_percentual` | 25% | 🔴 < 15%, 🟡 < 20%, 🟢 ≥ 25%, 🔵 ≥ 30% | Margem bruta percentual |
| `ticket_medio` | R$ 8.000 | 🔴 < 5k, 🟡 < 6,5k, 🟢 ≥ 8k, 🔵 ≥ 10k | Ticket médio de vendas |
| `nfes_emitidas` | 300 | 🔴 < 200, 🟡 < 250, 🟢 ≥ 300, 🔵 ≥ 400 | NF-e emitidas no mês |

### Financeiro (3 KPIs)

| KPI | Meta | Thresholds | Descrição |
|-----|------|------------|-----------|
| `contas_receber_vencidas` | R$ 0 | 🔴 > 500k, 🟡 > 300k, 🟢 < 100k, 🔵 = 0 | Valor em contas vencidas |
| `inadimplencia_percentual` | 3% | 🔴 > 10%, 🟡 > 5%, 🟢 ≤ 3%, 🔵 ≤ 1% | Taxa de inadimplência |
| `prazo_recebimento_medio` | 30 dias | 🔴 > 60, 🟡 > 45, 🟢 ≤ 30, 🔵 ≤ 15 | Prazo médio de recebimento |

### Operações (3 KPIs)

| KPI | Meta | Thresholds | Descrição |
|-----|------|------------|-----------|
| `prazo_entrega_medio` | 2 dias | 🔴 > 5, 🟡 > 3, 🟢 ≤ 2, 🔵 ≤ 1 | Prazo médio de entrega |
| `taxa_devolucao` | 2% | 🔴 > 10%, 🟡 > 5%, 🟢 ≤ 2%, 🔵 = 0% | Taxa de devolução de produtos |
| `pedidos_atendidos_prazo` | 95% | 🔴 < 70%, 🟡 < 85%, 🟢 ≥ 95%, 🔵 ≥ 98% | Pedidos entregues no prazo |

### Compliance (3 KPIs)

| KPI | Meta | Thresholds | Descrição |
|-----|------|------------|-----------|
| `taxa_conformidade_anvisa` | 100% | 🔴 < 90%, 🟡 < 95%, 🟢 = 100%, 🔵 = 100% | Taxa de conformidade ANVISA |
| `nfes_canceladas_percentual` | 2% | 🔴 > 10%, 🟡 > 5%, 🟢 ≤ 2%, 🔵 = 0% | % de NF-e canceladas |
| `produtos_sem_registro` | 0 | 🔴 > 10, 🟡 > 5, 🟢 = 0, 🔵 = 0 | Produtos sem registro ANVISA |

## 🎨 Interface React

### Componente: `KPIDashboardConsolidado.tsx`

#### Features:
- **Grid Responsivo**: 6 KPIs por tela (2x3)
- **Cards Coloridos**: Cor baseada em status (verde/amarelo/vermelho/azul)
- **Sparklines**: Gráficos de tendência embutidos
- **Filtro por Categoria**: Vendas, Financeiro, Operações, Compliance
- **Realtime Badge**: Indicador "Live" pulsante
- **Alertas no Topo**: Banner para alertas críticos
- **Botão Recalcular**: Força recálculo de todos os KPIs

#### Exemplo de Card:

```
┌─────────────────────────────────────┐
│ Faturamento Mensal        ✓ Excelente│
│ vendas                               │
│                                       │
│ R$ 2.150.000                         │
│ Meta: R$ 2.000.000                   │
│                                       │
│ Atingimento: 107.5%                  │
│ [████████████████████░░░░] 107%      │
│ ↗ +8.3% vs anterior      🔔 0        │
└─────────────────────────────────────┘
```

## 🔐 Segurança (RLS)

### Políticas:
- **Gerentes e Admins**: Veem todos os KPIs
- **Vendedores**: Veem apenas KPIs de vendas
- **Financeiro**: Veem apenas KPIs financeiros
- **Widgets**: Privados ou globais

## 📊 Estatísticas do Módulo

- **Migration SQL**: ~650 linhas
- **Component React**: ~730 linhas
- **Tabelas Criadas**: 4
- **Views**: 2
- **Functions**: 2
- **KPIs Seed**: 13

## 🤖 Automação

### Cálculo Automático (pg_cron)

```sql
-- Executar diariamente às 23:00
SELECT cron.schedule(
  'calcular-kpis-diarios',
  '0 23 * * *',
  $$SELECT calcular_todos_kpis_mes()$$
);
```

### Notificações de Alerta

Quando um alerta é criado:
1. Inserir em `kpi_alertas`
2. Trigger envia email (via Supabase Edge Function)
3. Push notification (Firebase Cloud Messaging)
4. Slack webhook (se configurado)

## 🎯 Benefícios

### Para Executivos:
- ✅ Visão consolidada em um só lugar
- ✅ Decisões rápidas baseadas em dados
- ✅ Identificação imediata de problemas

### Para Gerentes:
- ✅ Acompanhamento de metas em tempo real
- ✅ Alertas proativos de desvios
- ✅ Comparação com períodos anteriores

### Para Compliance:
- ✅ Monitoramento contínuo de conformidade
- ✅ Histórico de KPIs para auditorias
- ✅ Rastreabilidade de ações

## 🚀 Próximos Passos

Com o KPI Dashboard implementado, o sistema está pronto para:

1. **BLOCO 2.3**: Integrations Manager (gerenciar todas as integrações)
2. **ML Avançado**: Previsão de KPIs com ARIMA/Prophet
3. **Alertas Inteligentes**: Machine Learning para threshold dinâmico

## 📝 Notas Importantes

### Performance:
- Views materializadas refresh a cada hora
- Cache de 5 minutos no frontend
- Realtime apenas para mudanças significativas (> 5%)

### Cálculo de KPIs:
- Executar `calcular_todos_kpis_mes()` ao fim de cada mês
- Para KPIs diários, criar function separada
- Alertas são criados automaticamente durante cálculo

---

## 🎉 Conclusão

O **KPI Dashboard Consolidado** transforma o ICARUS em um centro de comando executivo, permitindo gestão proativa com alertas inteligentes e visão 360° em tempo real.

**Status**: ✅ 100% COMPLETO  
**Versão**: 1.0  
**Data**: Outubro 2025

