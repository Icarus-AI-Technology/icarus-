export interface VendasAIRecommendation {
  productId: string;
  confidence: number;
  notes?: string;
}

export class VendasAI {
  static async recommend(): Promise<VendasAIRecommendation[]> {
    return [];
  }
}
