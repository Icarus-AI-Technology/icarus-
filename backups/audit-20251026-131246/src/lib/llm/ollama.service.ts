/**
 * Ollama Service - Local LLM Inference
 * Suporta Llama 3.1, Mistral 7B, Code Llama
 * Custo: $0 (self-hosted)
 */

import axios, { AxiosInstance } from "axios";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
}

export interface OllamaModel {
  name: string;
  size: string; // e.g. "4.7GB"
  description: string;
}

export class OllamaService {
  private client: AxiosInstance;
  private baseURL: string;
  private defaultModel: string;

  constructor(
    baseURL = "http://localhost:11434",
    defaultModel = "llama3.1:8b",
  ) {
    this.baseURL = baseURL;
    this.defaultModel = defaultModel;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60s timeout para inferência
    });
  }

  /**
   * Chat completion (conversação)
   */
  async chat(
    messages: OllamaMessage[],
    model: string = this.defaultModel,
    options?: {
      temperature?: number;
      stream?: boolean;
    },
  ): Promise<string> {
    try {
      const response = await this.client.post<OllamaResponse>("/api/chat", {
        model,
        messages,
        stream: options?.stream ?? false,
        options: {
          temperature: options?.temperature ?? 0.7,
        },
      });

      return response.data.message.content;
    } catch (error) {
      const err = error as Error;
      console.error("[OllamaService] Chat error:", err);
      throw new Error(
        `Ollama chat failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generate completion (prompt único)
   */
  async generate(
    prompt: string,
    model: string = this.defaultModel,
    options?: {
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<string> {
    try {
      const response = await this.client.post<{ response: string }>(
        "/api/generate",
        {
          model,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.max_tokens ?? 1000,
          },
        },
      );

      return response.data.response;
    } catch (error) {
      const err = error as Error;
      console.error("[OllamaService] Generate error:", err);
      throw new Error(
        `Ollama generate failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Lista modelos disponíveis
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.get<{ models: OllamaModel[] }>(
        "/api/tags",
      );
      return response.data.models;
    } catch (error) {
      const err = error as Error;
      console.error("[OllamaService] List models error:", err);
      return [];
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/api/tags");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pull de modelo (download)
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      await this.client.post("/api/pull", {
        name: modelName,
        stream: false,
      });
    } catch (error) {
      const err = error as Error;
      console.error("[OllamaService] Pull model error:", err);
      throw new Error(`Failed to pull model ${modelName}`);
    }
  }
}

// Export singleton instance
export const ollamaService = new OllamaService(
  process.env.VITE_OLLAMA_URL || "http://localhost:11434",
  process.env.VITE_OLLAMA_DEFAULT_MODEL || "llama3.1:8b",
);
