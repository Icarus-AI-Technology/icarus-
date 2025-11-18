# 🤖 GUIA DE INTEGRAÇÃO IA — ICARUS v5.0

**Objetivo**: Maximizar uso de IA mantendo **custos baixos** e **alta qualidade**.

---

## 📊 ESTRATÉGIA DE 4 TIERS

### ⚡ Tier 1: Local/Free (Ollama)
**Quando usar**: Tarefas simples, alta frequência, dados sensíveis

```typescript
// /src/services/ai/providers/OllamaProvider.ts

export class OllamaProvider implements AIProvider {
  private baseURL = 'http://localhost:11434';

  async complete(prompt: string, options: CompletionOptions): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || 'llama3.2',
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 500
        }
      })
    });

    const data = await response.json();
    return data.response;
  }
}

// Exemplo de uso: Autocomplete de descrições
const autocompleteDescription = async (partialText: string) => {
  const ai = new AIService();
  
  return ai.analyze(
    `Complete a descrição: "${partialText}"`,
    {
      provider: 'ollama',
      model: 'llama3.2',
      maxTokens: 50,
      temperature: 0.8
    }
  );
};
```

**Casos de Uso**:
- Autocomplete de formulários
- Categorização de transações
- Respostas FAQ
- Validação de dados
- Sugestões simples

**Custo**: $0/mês (requer servidor local com 8GB RAM)

---

### 💰 Tier 2: Ultra Low-Cost (OpenRouter)
**Quando usar**: Análises intermediárias, volume moderado

```typescript
// /src/services/ai/providers/OpenRouterProvider.ts

export class OpenRouterProvider implements AIProvider {
  private apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  private baseURL = 'https://openrouter.ai/api/v1';

  async complete(prompt: string, options: CompletionOptions): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        max_tokens: options.maxTokens
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Exemplo: Lead Scoring
const scoreLeadWithAI = async (lead: Lead): Promise<LeadScore> => {
  const prompt = `
    Analise este lead e dê um score de 0-100:
    
    Nome: ${lead.nome}
    Empresa: ${lead.empresa}
    Cargo: ${lead.cargo}
    Histórico de interações: ${lead.interacoes}
    Orçamento estimado: ${lead.orcamento}
    
    Retorne JSON: { score: number, motivo: string, acoes: string[] }
  `;

  const response = await AIService.analyze(prompt, {
    provider: 'openrouter',
    model: 'openai/gpt-3.5-turbo',
    temperature: 0.3
  });

  return JSON.parse(response);
};
```

**Modelos Recomendados**:
- `openai/gpt-3.5-turbo`: $0.001/1K tokens (ultra barato)
- `anthropic/claude-instant`: $0.003/1K tokens
- `meta-llama/llama-3-8b`: $0.0001/1K tokens (quase grátis!)

**Casos de Uso**:
- Lead scoring
- Resumos de documentos
- Análises intermediárias
- Classificação de dados
- Extração de informações

**Custo Estimado**: $5-15/mês para 1000 requests/dia

---

### 🚀 Tier 3: High-Quality (OpenAI Direct)
**Quando usar**: Análises críticas, insights estratégicos

```typescript
// /src/services/ai/modules/CashFlowAnalyzer.ts

export class CashFlowAnalyzer {
  async analyzeAndPredict(
    transactions: Transaction[],
    period: number = 90
  ): Promise<CashFlowAnalysis> {
    const prompt = `
      Você é um CFO especializado em gestão de fluxo de caixa para distribuidoras médicas.
      
      Analise estas transações dos últimos 6 meses:
      ${JSON.stringify(transactions, null, 2)}
      
      Forneça:
      1. Análise detalhada do fluxo de caixa
      2. Identificação de padrões sazonais
      3. Previsão para os próximos ${period} dias
      4. 5 recomendações estratégicas
      5. Alertas de risco (se houver)
      
      Retorne JSON estruturado.
    `;

    const response = await AIService.analyze(prompt, {
      provider: 'openai',
      model: 'gpt-4-turbo',
      temperature: 0.3,
      maxTokens: 2000
    });

    return JSON.parse(response);
  }
}

// Uso no módulo Financeiro
const { analysis, prediction, recommendations } = await new CashFlowAnalyzer()
  .analyzeAndPredict(transacoes, 90);
```

**Casos de Uso**:
- Análise de fluxo de caixa
- Sugestão de kits OPME
- Insights estratégicos
- Análise de contratos
- Previsões complexas

**Custo Estimado**: $30-60/mês para 100 análises/dia

---

### 🎯 Tier 4: Specialized (Claude/GPT-4 Vision)
**Quando usar**: Documentos longos, análises visuais

```typescript
// /src/services/ai/modules/DocumentAnalyzer.ts

export class DocumentAnalyzer {
  async analyzeContract(
    contractText: string,
    documentType: 'fornecedor' | 'hospital' | 'medico'
  ): Promise<ContractAnalysis> {
    const prompt = `
      Analise este contrato ${documentType} em português:
      
      ${contractText}
      
      Extraia:
      1. Partes envolvidas
      2. Valores e condições de pagamento
      3. Prazos e vigências
      4. Cláusulas críticas
      5. Riscos potenciais
      6. Recomendações de negociação
      
      Retorne JSON estruturado.
    `;

    const response = await AIService.analyze(prompt, {
      provider: 'anthropic',
      model: 'claude-3.5-sonnet',
      temperature: 0.2,
      maxTokens: 4000 // Claude suporta contextos longos
    });

    return JSON.parse(response);
  }

  async analyzeOPMEImage(imageUrl: string): Promise<ImageAnalysis> {
    // GPT-4 Vision para análise de imagens médicas
    const response = await AIService.analyzeImage(imageUrl, {
      provider: 'openai',
      model: 'gpt-4-vision',
      prompt: 'Identifique e classifique os materiais OPME nesta imagem'
    });

    return response;
  }
}
```

**Casos de Uso**:
- Análise de contratos longos
- Documentos médicos complexos
- Análise de imagens OPME
- Compliance e auditoria
- Extração de dados de PDFs

**Custo Estimado**: $20-40/mês para 50 análises/mês

---

## 💡 OTIMIZAÇÕES DE CUSTO

### 1. Cache Inteligente
```typescript
// /src/services/ai/cache/AICache.ts

export class AICache {
  private redis: Redis; // ou LocalStorage para protótipo

  async get(prompt: string): Promise<string | null> {
    const hash = this.hashPrompt(prompt);
    return this.redis.get(`ai:${hash}`);
  }

  async set(prompt: string, response: string, ttl: number = 86400) {
    const hash = this.hashPrompt(prompt);
    await this.redis.setex(`ai:${hash}`, ttl, response);
  }

  private hashPrompt(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }
}

// Economia: 70-90% de requests repetidos
```

### 2. Batch Processing
```typescript
// Processar múltiplas requisições em batch
const scoreMultipleLeads = async (leads: Lead[]): Promise<LeadScore[]> => {
  const prompt = `
    Score estes ${leads.length} leads (retorne array JSON):
    ${JSON.stringify(leads)}
  `;

  const response = await AIService.analyze(prompt, {
    provider: 'openrouter',
    model: 'openai/gpt-3.5-turbo'
  });

  return JSON.parse(response);
};

// Economia: 1 request ao invés de N requests
```

### 3. Degradação Graceful
```typescript
// Tentar modelo mais barato primeiro
const analyzeWithFallback = async (prompt: string): Promise<string> => {
  try {
    // Tenta Ollama (grátis)
    return await AIService.analyze(prompt, { provider: 'ollama' });
  } catch {
    try {
      // Fallback para OpenRouter (barato)
      return await AIService.analyze(prompt, { provider: 'openrouter' });
    } catch {
      // Último recurso: OpenAI
      return await AIService.analyze(prompt, { provider: 'openai' });
    }
  }
};
```

---

## 📈 MONITORAMENTO DE CUSTOS

```typescript
// /src/services/ai/monitoring/CostTracker.ts

export class AIcostTracker {
  private costs = {
    openai: { tokens: 0, cost: 0 },
    anthropic: { tokens: 0, cost: 0 },
    openrouter: { tokens: 0, cost: 0 }
  };

  trackUsage(provider: string, tokens: number) {
    const rates = {
      'openai/gpt-4-turbo': 0.01 / 1000,
      'openai/gpt-3.5-turbo': 0.001 / 1000,
      'anthropic/claude-3.5': 0.008 / 1000,
      'openrouter/gpt-3.5': 0.001 / 1000
    };

    const cost = tokens * (rates[provider] || 0);
    
    // Increment counters
    this.costs[provider].tokens += tokens;
    this.costs[provider].cost += cost;

    // Alert if exceeding budget
    if (this.getTotalCost() > 100) { // $100/mês
      this.sendAlert('AI budget exceeded!');
    }
  }

  getTotalCost(): number {
    return Object.values(this.costs).reduce((sum, p) => sum + p.cost, 0);
  }

  getMonthlyReport(): CostReport {
    return {
      totalCost: this.getTotalCost(),
      breakdown: this.costs,
      topConsumers: this.getTopConsumers(),
      recommendations: this.getOptimizationSuggestions()
    };
  }
}
```

---

## 🎯 CUSTO TOTAL ESTIMADO

| Tier | Provider | Uso Mensal | Custo Mensal |
|------|----------|------------|--------------|
| 1 | Ollama Local | Ilimitado | $0 |
| 2 | OpenRouter GPT-3.5 | 10M tokens | $10 |
| 3 | OpenAI GPT-4 | 1M tokens | $40 |
| 4 | Claude 3.5 | 500K tokens | $20 |
| **TOTAL** | | | **$70/mês** |

**Para 100 usuários ativos = $0.70/usuário/mês** 🎉

---

**Próximos passos**: Implementar monitoramento de custos e otimizações automáticas.

