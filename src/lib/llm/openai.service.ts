/**
 * OpenAI GPT-4 Turbo Service
 * Integração real com API da OpenAI
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(
    apiKey: string = import.meta.env.VITE_OPENAI_API_KEY || '',
    model: string = 'gpt-4-turbo-preview'
  ) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = model;
  }

  /**
   * Chat completion com GPT-4
   */
  async chat(
    messages: OpenAIMessage[],
    options?: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    }
  ): Promise<{ content: string; tokens: number; cost: number }> {
    if (!this.apiKey) {
      throw new Error('VITE_OPENAI_API_KEY não configurada');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1000,
        stream: options?.stream ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokens = data.usage.total_tokens;

    // Calcular custo (GPT-4 Turbo pricing: $0.01/1K input tokens, $0.03/1K output tokens)
    const inputTokens = data.usage.prompt_tokens;
    const outputTokens = data.usage.completion_tokens;
    const cost = (inputTokens / 1000) * 0.01 + (outputTokens / 1000) * 0.03;

    return { content, tokens, cost };
  }

  /**
   * Generate completion (texto único)
   */
  async generate(
    prompt: string,
    systemPrompt: string = 'Você é um assistente útil.',
    options?: {
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<{ content: string; tokens: number; cost: number }> {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    return await this.chat(messages, options);
  }

  /**
   * Análise de conformidade com GPT-4
   */
  async analyzeCompliance(document: string): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
    confidence: number;
  }> {
    const prompt = `Analise o seguinte documento quanto à conformidade com normas ANVISA e regulamentos OPME brasileiros.

Documento:
${document}

Forneça sua análise no seguinte formato JSON:
{
  "compliant": true/false,
  "issues": ["lista", "de", "problemas"],
  "recommendations": ["lista", "de", "recomendações"],
  "confidence": 0.0-1.0
}`;

    const systemPrompt = `Você é um auditor especializado em compliance regulatório ANVISA e OPME no Brasil. 
Seja rigoroso na análise e forneça respostas objetivas e estruturadas em JSON.`;

    const { content } = await this.generate(prompt, systemPrompt, {
      temperature: 0.3, // Mais determinístico para análise
      max_tokens: 1500,
    });

    try {
      // Extrair JSON do conteúdo (remover markdown se houver)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        compliant: result.compliant || false,
        issues: result.issues || [],
        recommendations: result.recommendations || [],
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      console.error('Erro ao parsear resposta GPT-4:', error);
      return {
        compliant: false,
        issues: ['Erro ao analisar documento'],
        recommendations: ['Revisar documento manualmente'],
        confidence: 0,
      };
    }
  }

  /**
   * Sugestões inteligentes
   */
  async getSuggestions(context: string, query: string): Promise<string[]> {
    const prompt = `Com base no seguinte contexto, sugira 3-5 ações práticas e objetivas para: ${query}

Contexto:
${context}

Forneça apenas as sugestões em formato de lista numerada, sem introduções ou conclusões.`;

    const systemPrompt =
      'Você é um especialista em gestão hospitalar e OPME. Forneça sugestões práticas e diretas.';

    const { content } = await this.generate(prompt, systemPrompt, {
      temperature: 0.8,
      max_tokens: 500,
    });

    // Parse suggestions
    const suggestions = content
      .split('\n')
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((s) => s.length > 0);

    return suggestions;
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Calcular custo estimado para uma operação
   */
  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1000) * 0.01 + (outputTokens / 1000) * 0.03;
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
