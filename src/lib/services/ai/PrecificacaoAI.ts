export interface PrecificacaoAISuggestion {
  sku: string;
  suggestedPrice: number;
  rationale?: string;
}

export class PrecificacaoAI {
  static async suggestPrices(): Promise<PrecificacaoAISuggestion[]> {
    return [];
  }
}
