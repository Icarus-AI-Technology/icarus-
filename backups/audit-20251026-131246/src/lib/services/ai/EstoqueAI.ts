export interface EstoqueAIInsight {
  category: string;
  value: number;
  description?: string;
}

export class EstoqueAI {
  static async getInsights(): Promise<EstoqueAIInsight[]> {
    return [];
  }
}
