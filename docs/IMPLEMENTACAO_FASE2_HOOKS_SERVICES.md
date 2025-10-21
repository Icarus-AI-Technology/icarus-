# 🔧 FASE 2: HOOKS E SERVICES - FINANCEIRO E FATURAMENTO

**Sistema**: ICARUS v5.0  
**Status**: ✅ **EM EXECUÇÃO**  
**Início**: Outubro 2025  
**Budget**: R$ 700/mês APIs aprovados

---

## 📋 HOOKS A CRIAR/EXPANDIR

### ✅ Já existem (expandir):
1. ✅ `useTransacoes.ts` - Expandir com:
   - Filtros avançados por centro de custo
   - Categorização automática
   - Projeções de fluxo
   
2. ✅ `useFaturas.ts` - Expandir com:
   - Gestão de lotes
   - Integração SEFAZ
   - Eventos NF-e

### 🆕 Novos hooks necessários:

1. **`useContasReceber.ts`** (+ AI)
   - CRUD contas a receber
   - Score de inadimplência (IA Random Forest)
   - Alertas de vencimento
   - Realtime subscriptions
   
2. **`useContasPagar.ts`**
   - CRUD contas a pagar
   - Workflow de aprovação
   - Agendamento de pagamentos
   - Realtime subscriptions
   
3. **`useFluxoCaixa.ts`** (+ AI)
   - Projeção de fluxo (IA ARIMA)
   - Análise de tendências
   - Cenários (otimista, realista, pessimista)
   - Realtime KPIs
   
4. **`useConciliacaoBancaria.ts`**
   - Import OFX/API bancária
   - Matching automático (algoritmo de similaridade)
   - Reconciliação manual
   - Integração Pluggy DDA
   
5. **`useCentroCustos.ts`**
   - CRUD centros de custo
   - Rateio de despesas
   - Realizado vs Orçado
   - Realtime subscriptions
   
6. **`usePlanejamentoFinanceiro.ts`**
   - Orçamento anual/mensal
   - Metas financeiras
   - Simulações de cenários
   - Análise de performance
   
7. **`useConvenios.ts`**
   - CRUD convênios
   - Tabelas de preços por convênio
   - Prazo de pagamento
   - Status de integração
   
8. **`useLotesFaturamento.ts`**
   - CRUD lotes para envio
   - Status por convênio
   - Glosas detectadas
   - Realtime updates

---

## 🤖 SERVICES IA A CRIAR

### 1. `ContasReceberAI.ts`
**Objetivo**: Predição de inadimplência e score de crédito

```typescript
/**
 * IA para Predição de Inadimplência
 * Algoritmo: Random Forest
 * Custo: R$ 0 (Ollama local ou OpenRouter)
 * Acurácia esperada: > 85%
 */

interface InadimplenciaFeatures {
  dias_atraso_medio: number;
  valor_medio_transacoes: number;
  quantidade_transacoes: number;
  taxa_inadimplencia_historica: number;
  prazo_medio_pagamento: number;
  ticket_medio: number;
}

interface ScoreResult {
  score: number; // 0-100
  risco: 'baixo' | 'médio' | 'alto';
  probabilidade_inadimplencia: number;
  recomendacoes: string[];
}

export class ContasReceberAI {
  async calcularScore(features: InadimplenciaFeatures): Promise<ScoreResult>
  async preverAtraso(contaId: string): Promise<{ dias_previsto: number }>
  async recomendarAcaoCobranca(contaId: string): Promise<string[]>
}
```

### 2. `FluxoCaixaAI.ts`
**Objetivo**: Projeção de fluxo de caixa com ARIMA

```typescript
/**
 * IA para Projeção de Fluxo de Caixa
 * Algoritmo: ARIMA (AutoRegressive Integrated Moving Average)
 * Custo: R$ 0 (Ollama local)
 * Acurácia esperada: 90-95%
 */

interface ProjecaoFluxo {
  data: Date;
  valor_projetado: number;
  confianca_inferior: number;
  confianca_superior: number;
}

export class FluxoCaixaAI {
  async projetarFluxo(diasFuturos: number): Promise<ProjecaoFluxo[]>
  async analisarTendencia(): Promise<'crescente' | 'estável' | 'decrescente'>
  async simularCenarios(): Promise<{
    otimista: ProjecaoFluxo[];
    realista: ProjecaoFluxo[];
    pessimista: ProjecaoFluxo[];
  }>
}
```

### 3. `AnaliseFinanceiraAI.ts`
**Objetivo**: Análise com GPT-4 (insights financeiros)

```typescript
/**
 * IA para Análise Financeira Avançada
 * Algoritmo: GPT-4 (OpenAI)
 * Custo: R$ 200/mês
 * Uso: Análises estratégicas mensais
 */

export class AnaliseFinanceiraAI {
  async analisarDRE(periodo: string): Promise<string>
  async identificarAnomalias(): Promise<{
    tipo: string;
    descricao: string;
    impacto: 'baixo' | 'médio' | 'alto';
  }[]>
  async sugerirOtimizacoes(): Promise<string[]>
}
```

### 4. `GlosasDetectionAI.ts`
**Objetivo**: Detecção automática de potenciais glosas

```typescript
/**
 * IA para Detecção de Glosas
 * Algoritmo: Regras + ML (Random Forest)
 * Custo: R$ 0 (Ollama local)
 * Redução estimada: 50% de glosas
 */

interface GlosaRisk {
  lote_id: string;
  risco: 'baixo' | 'médio' | 'alto';
  motivos: string[];
  recomendacoes: string[];
}

export class GlosasDetectionAI {
  async analisarLote(loteId: string): Promise<GlosaRisk>
  async validarDadosPreEnvio(loteId: string): Promise<{
    valido: boolean;
    erros: string[];
  }>
}
```

---

## 🔗 SERVICES INTEGRAÇÃO

### 1. `ConciliacaoBancariaService.ts`
- Parser OFX (bancos brasileiros)
- Matching Algorithm (Levenshtein Distance)
- Integração Pluggy DDA
- Circuit Breaker + Retry

### 2. `SEFAZService.ts`
- Comunicação com SEFAZ (todos estados)
- Certificado A1/A3
- Validação de XML
- Eventos (CCe, Cancelamento)

### 3. `ConveniosIntegrationService.ts`
- Abstração para 18+ convênios
- Upload de lotes
- Download de retornos
- Parsing de glosas

---

## 📊 ESTIMATIVAS

| Item | Linhas Código | Tempo | Status |
|------|---------------|-------|--------|
| 8 Custom Hooks | ~1.200 | 5 dias | 🔄 Iniciando |
| 4 Services IA | ~800 | 3 dias | 📋 Planejado |
| 3 Services Integração | ~600 | 2 dias | 📋 Planejado |
| **TOTAL FASE 2** | **~2.600** | **10 dias** | **🔄 25% completo** |

---

## 🎯 PRÓXIMA AÇÃO

**AGORA**: Criar `useContasReceber.ts` + `ContasReceberAI.ts`

**Status**: ✅ Iniciando implementação

