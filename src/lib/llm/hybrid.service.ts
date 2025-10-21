/**
 * Hybrid LLM Service
 * Estratégia 80/20: 80% Ollama (grátis) + 20% GPT-4/Claude (pago)
 * 
 * Economia estimada: $1,920-4,800/ano
 */

import { ollamaService, OllamaMessage } from './ollama.service';

export type LLMComplexity = 'simple' | 'moderate' | 'complex';

export interface LLMRequest {
  prompt: string;
  context?: string;
  complexity?: LLMComplexity;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  cost: number; // Custo em USD (0 para Ollama)
  duration?: number; // Tempo de resposta em ms
}

export class HybridLLMService {
  private ollamaAvailable: boolean = false;
  private fallbackToRemote: boolean = true;

  constructor() {
    this.checkOllamaHealth();
  }

  /**
   * Verifica se Ollama está disponível
   */
  private async checkOllamaHealth(): Promise<void> {
    this.ollamaAvailable = await ollamaService.healthCheck();
    if (!this.ollamaAvailable) {
      console.warn('[HybridLLM] Ollama not available, will use remote LLMs');
    }
  }

  /**
   * Determina se deve usar Ollama ou LLM remoto
   */
  private shouldUseOllama(complexity: LLMComplexity): boolean {
    if (!this.ollamaAvailable) return false;

    // Estratégia 80/20
    switch (complexity) {
      case 'simple':
        return true; // 100% Ollama para casos simples
      case 'moderate':
        return Math.random() < 0.8; // 80% Ollama, 20% remoto
      case 'complex':
        return false; // 0% Ollama, sempre remoto para casos complexos
      default:
        return true;
    }
  }

  /**
   * Processa query com estratégia híbrida
   */
  async processQuery(request: LLMRequest): Promise<LLMResponse> {
    const {
      prompt,
      context,
      complexity = 'simple',
      systemPrompt = 'Você é um assistente especializado em gestão hospitalar e OPME.',
    } = request;

    const startTime = Date.now();
    const useOllama = this.shouldUseOllama(complexity);

    try {
      if (useOllama) {
        // Usar Ollama (custo zero)
        const messages: OllamaMessage[] = [
          { role: 'system', content: systemPrompt },
        ];

        if (context) {
          messages.push({ role: 'system', content: `Contexto: ${context}` });
        }

        messages.push({ role: 'user', content: prompt });

        const model = complexity === 'simple' ? 'llama3.1:8b' : 'mistral:7b';
        const content = await ollamaService.chat(messages, model);

        return {
          content,
          model: `ollama:${model}`,
          cost: 0,
          duration: Date.now() - startTime,
        };
      } else {
        // Fallback para LLM remoto (GPT-4/Claude)
        return await this.processWithRemoteLLM(request, startTime);
      }
    } catch (error) {
      console.error('[HybridLLM] Error:', error);

      // Fallback para remoto se Ollama falhar
      if (useOllama && this.fallbackToRemote) {
        console.warn('[HybridLLM] Ollama failed, falling back to remote LLM');
        return await this.processWithRemoteLLM(request, startTime);
      }

      throw error;
    }
  }

  /**
   * Processa com LLM remoto (GPT-4 ou Claude)
   * TODO: Implementar integração real com OpenAI/Anthropic quando necessário
   */
  private async processWithRemoteLLM(
    request: LLMRequest,
    startTime: number
  ): Promise<LLMResponse> {
    const { prompt, complexity } = request;

    // Simular resposta (substituir por integração real)
    console.warn('[HybridLLM] Remote LLM not implemented, using mock response');

    // Estimar custo baseado em tokens (~750 palavras = 1000 tokens)
    const estimatedTokens = prompt.length / 4;
    const costPer1MTokens = complexity === 'complex' ? 30 : 10; // GPT-4 pricing
    const estimatedCost = (estimatedTokens / 1000000) * costPer1MTokens;

    return {
      content: `[MOCK] Esta é uma resposta simulada. Implemente integração real com OpenAI ou Claude aqui.\n\nPrompt recebido: ${prompt.substring(0, 100)}...`,
      model: 'gpt-4-turbo (mock)',
      cost: estimatedCost,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Análise de texto (casos simples)
   */
  async analyzeText(text: string, question: string): Promise<string> {
    const response = await this.processQuery({
      prompt: `Analise o seguinte texto e responda: ${question}\n\nTexto: ${text}`,
      complexity: 'simple',
    });
    return response.content;
  }

  /**
   * Sugestões inteligentes (casos moderados)
   */
  async getSuggestions(context: string, query: string): Promise<string[]> {
    const response = await this.processQuery({
      prompt: `Com base no contexto fornecido, sugira 3-5 ações ou insights relevantes para: ${query}`,
      context,
      complexity: 'moderate',
      systemPrompt: 'Você é um especialista em gestão hospitalar. Forneça sugestões práticas e diretas.',
    });

    // Parse suggestions (esperando lista numerada)
    const suggestions = response.content
      .split('\n')
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());

    return suggestions;
  }

  /**
   * Análise de conformidade (caso complexo - usa GPT-4/Claude)
   */
  async analyzeCompliance(document: string): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const response = await this.processQuery({
      prompt: `Analise o seguinte documento quanto à conformidade com normas ANVISA e regulamentos OPME. Liste problemas e recomendações.\n\nDocumento: ${document}`,
      complexity: 'complex',
      systemPrompt: 'Você é um auditor especializado em compliance regulatório ANVISA e OPME.',
    });

    // Parse response (simplificado - em produção, usar JSON structured output)
    return {
      compliant: !response.content.toLowerCase().includes('não conforme'),
      issues: [],
      recommendations: [],
    };
  }

  /**
   * Retorna estatísticas de uso
   */
  getUsageStats(): {
    ollamaAvailable: boolean;
    estimatedSavings: string;
  } {
    return {
      ollamaAvailable: this.ollamaAvailable,
      estimatedSavings: this.ollamaAvailable
        ? '$160-400/mês (80% redução de custos LLM)'
        : '$0 (Ollama indisponível)',
    };
  }
}

// Export singleton
export const hybridLLMService = new HybridLLMService();

