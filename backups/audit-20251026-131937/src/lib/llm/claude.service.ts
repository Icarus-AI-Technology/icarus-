/**
 * Claude 3.5 Sonnet Service
 * Integração real com API da Anthropic
 */

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(
    apiKey: string = import.meta.env.VITE_ANTHROPIC_API_KEY || "",
    model: string = "claude-3-5-sonnet-20241022",
  ) {
    this.apiKey = apiKey;
    this.baseURL = "https://api.anthropic.com/v1";
    this.model = model;
  }

  /**
   * Chat completion com Claude 3.5
   */
  async chat(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    options?: {
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<{ content: string; tokens: number; cost: number }> {
    if (!this.apiKey) {
      throw new Error("VITE_ANTHROPIC_API_KEY não configurada");
    }

    const response = await fetch(`${this.baseURL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        system: systemPrompt,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Claude API error: ${error.error?.message || response.statusText}`,
      );
    }

    const data: ClaudeResponse = await response.json();
    const content = data.content[0]?.text || "";
    const tokens = data.usage.input_tokens + data.usage.output_tokens;

    // Calcular custo (Claude 3.5 Sonnet pricing: $3/1M input tokens, $15/1M output tokens)
    const inputTokens = data.usage.input_tokens;
    const outputTokens = data.usage.output_tokens;
    const cost = (inputTokens / 1000000) * 3 + (outputTokens / 1000000) * 15;

    return { content, tokens, cost };
  }

  /**
   * Generate completion (texto único)
   */
  async generate(
    prompt: string,
    systemPrompt: string = "Você é um assistente útil e preciso.",
    options?: {
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<{ content: string; tokens: number; cost: number }> {
    const messages: ClaudeMessage[] = [{ role: "user", content: prompt }];

    return await this.chat(messages, systemPrompt, options);
  }

  /**
   * Análise de documentos complexos
   */
  async analyzeDocument(
    document: string,
    analysisType: "compliance" | "risk" | "financial" | "clinical",
  ): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    confidence: number;
  }> {
    const systemPrompts = {
      compliance:
        "Você é um auditor especializado em compliance regulatório ANVISA e OPME.",
      risk: "Você é um especialista em análise de riscos hospitalares e gestão OPME.",
      financial:
        "Você é um analista financeiro especializado em gestão hospitalar.",
      clinical:
        "Você é um profissional da saúde especializado em procedimentos OPME.",
    };

    const prompt = `Analise o seguinte documento de forma detalhada e estruturada:

${document}

Forneça sua análise no seguinte formato JSON:
{
  "summary": "resumo executivo em 2-3 frases",
  "keyFindings": ["achado 1", "achado 2", "achado 3"],
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
  "confidence": 0.0-1.0
}`;

    const { content } = await this.generate(
      prompt,
      systemPrompts[analysisType],
      {
        temperature: 0.3,
        max_tokens: 2000,
      },
    );

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Resposta não contém JSON válido");
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        summary: result.summary || "Análise não disponível",
        keyFindings: result.keyFindings || [],
        recommendations: result.recommendations || [],
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      console.error("Erro ao parsear resposta Claude:", error);
      return {
        summary: "Erro ao analisar documento",
        keyFindings: [],
        recommendations: ["Revisar documento manualmente"],
        confidence: 0,
      };
    }
  }

  /**
   * Análise de texto com raciocínio passo-a-passo (Chain of Thought)
   */
  async analyzeWithCoT(text: string, question: string): Promise<string> {
    const prompt = `Analise o seguinte texto e responda a pergunta usando raciocínio passo-a-passo:

Texto: ${text}

Pergunta: ${question}

Pense em voz alta e mostre seu raciocínio passo-a-passo antes de chegar à conclusão final.`;

    const systemPrompt = `Você é um especialista analítico. Use raciocínio passo-a-passo (Chain of Thought) 
para analisar problemas complexos. Mostre seu pensamento claramente antes de dar a resposta final.`;

    const { content } = await this.generate(prompt, systemPrompt, {
      temperature: 0.5,
      max_tokens: 1500,
    });

    return content;
  }

  /**
   * Code generation e review
   */
  async generateCode(
    task: string,
    language: "typescript" | "python" | "sql" = "typescript",
  ): Promise<string> {
    const prompt = `Gere código ${language} de alta qualidade para a seguinte tarefa:

${task}

Requisitos:
- Código limpo e bem documentado
- Tratamento de erros apropriado
- Seguir melhores práticas da linguagem
- Incluir comentários explicativos

Forneça apenas o código, sem explicações adicionais.`;

    const systemPrompt = `Você é um engenheiro de software sênior especializado em ${language}. 
Gere código production-ready que siga as melhores práticas da indústria.`;

    const { content } = await this.generate(prompt, systemPrompt, {
      temperature: 0.4,
      max_tokens: 2000,
    });

    // Extrair código dos blocos markdown
    const codeMatch = content.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : content;
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      // Claude não tem endpoint de health check público
      // Testar com uma mensagem simples
      const messages: ClaudeMessage[] = [{ role: "user", content: "test" }];
      const response = await fetch(`${this.baseURL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 10,
        }),
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
    return (inputTokens / 1000000) * 3 + (outputTokens / 1000000) * 15;
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();
