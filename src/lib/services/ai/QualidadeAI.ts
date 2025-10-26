export interface QualidadeAIInsight {
  area: string;
  score: number;
  commentary?: string;
}

export class QualidadeAI {
  static async evaluate(): Promise<QualidadeAIInsight[]> {
    return [];
  }
}
