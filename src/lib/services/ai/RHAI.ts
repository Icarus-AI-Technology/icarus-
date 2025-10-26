export interface RHAIRecommendation {
  employeeId: string;
  suggestedAction: string;
}

export class RHAI {
  static async recommendActions(): Promise<RHAIRecommendation[]> {
    return [];
  }
}
