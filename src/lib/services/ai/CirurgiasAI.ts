export interface CirurgiaInsight {
  id: string;
  recomendado: boolean;
  risco?: number;
  detalhes?: string;
}

export class CirurgiasAI {
  static async gerarInsights(): Promise<CirurgiaInsight[]> {
    return [];
  }
}
